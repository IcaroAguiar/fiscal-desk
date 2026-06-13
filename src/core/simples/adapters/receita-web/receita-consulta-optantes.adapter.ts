import type {
  SimplesLookupOptions,
  SimplesLookupPort,
} from "../../simples-lookup.port";
import type { SimplesLookupResult } from "../../simples-lookup.types";
import { ReceitaBrowserClient } from "./receita-browser.client";
import {
  createReceitaWebDiagnostic,
  createReceitaWebResult,
  RECEITA_WEB_DIAGNOSTIC_CODE,
} from "./receita-diagnostics";
import { parseReceitaResult } from "./receita-result.parser";

function isBrowserUnavailableError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  return [
    "Executable doesn't exist",
    "browserType.launch",
    "Failed to launch",
    "spawn",
  ].some((indicator) => error.message.includes(indicator));
}

export class ReceitaConsultaOptantesAdapter implements SimplesLookupPort {
  async lookup(
    cnpj: string,
    options?: SimplesLookupOptions,
  ): Promise<SimplesLookupResult> {
    const client = new ReceitaBrowserClient({ headless: false });

    try {
      await client.connect(options?.signal);

      const navigateResult = await client.navigate(options?.signal);
      if (!navigateResult.success) {
        return createReceitaWebResult({
          cnpj,
          status: "TEMPORARY_ERROR",
          message: "Falha ao navegar para a página da Receita Web assistida",
          diagnostic: createReceitaWebDiagnostic({
            code: RECEITA_WEB_DIAGNOSTIC_CODE.NAVIGATION_FAILED,
          }),
        });
      }

      const fillResult = await client.fillCnpj(cnpj, options?.signal);
      if (!fillResult.success) {
        return createReceitaWebResult({
          cnpj,
          status: "TEMPORARY_ERROR",
          message: "Falha ao preencher o CNPJ no navegador assistido",
          diagnostic: createReceitaWebDiagnostic({
            code: RECEITA_WEB_DIAGNOSTIC_CODE.FILL_FAILED,
          }),
        });
      }

      const submitResult = await client.submit(options?.signal);
      if (!submitResult.success) {
        return createReceitaWebResult({
          cnpj,
          status: "TEMPORARY_ERROR",
          message: "Falha ao submeter a consulta no navegador assistido",
          diagnostic: createReceitaWebDiagnostic({
            code: RECEITA_WEB_DIAGNOSTIC_CODE.SUBMIT_FAILED,
          }),
        });
      }

      const waitResult = await client.waitResult(options?.signal);
      if (!waitResult.success) {
        return createReceitaWebResult({
          cnpj,
          status: "TEMPORARY_ERROR",
          message: "Falha ao aguardar o resultado da Receita Web assistida",
          diagnostic: createReceitaWebDiagnostic({
            code: RECEITA_WEB_DIAGNOSTIC_CODE.WAIT_RESULT_FAILED,
          }),
        });
      }

      const hasCaptcha = await client.hasCaptcha(options?.signal);
      const hasError = await client.hasError(options?.signal);
      const hasResult = await client.hasResult(options?.signal);

      return parseReceitaResult({
        html: waitResult.html,
        cnpj,
        hasCaptcha,
        hasError,
        hasResult,
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return {
          cnpj,
          simplesNacional: null,
          simei: null,
          source: "system",
          status: "CANCELLED",
          message: "Processamento cancelado antes desta consulta",
        };
      }

      if (isBrowserUnavailableError(error)) {
        return createReceitaWebResult({
          cnpj,
          status: "TEMPORARY_ERROR",
          message:
            "Não foi possível abrir o navegador assistido. Instale Google Chrome ou Microsoft Edge nesta máquina e tente novamente.",
          diagnostic: createReceitaWebDiagnostic({
            code: RECEITA_WEB_DIAGNOSTIC_CODE.BROWSER_UNAVAILABLE,
          }),
        });
      }

      throw error;
    } finally {
      await client.disconnect();
    }
  }
}

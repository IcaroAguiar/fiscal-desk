import type {
  SimplesLookupResult,
  SimplesLookupStatus,
} from "../../simples-lookup.types";
import { RECEITA_TEXT_INDICATORS } from "./receita.selectors.js";
import {
  createReceitaWebDiagnostic,
  createReceitaWebResult,
  RECEITA_WEB_DIAGNOSTIC_CODE,
  type ReceitaWebDiagnosticCode,
} from "./receita-diagnostics.js";

export type ParseReceitaResultInput = {
  html: string;
  cnpj: string;
  hasCaptcha: boolean;
  hasError: boolean;
  hasResult: boolean;
};

type ParsedOptantStatus = {
  simplesNacional: boolean | null;
  simei: boolean | null;
};

function containsText(text: string, indicators: readonly string[]): boolean {
  const lowerText = text.toLowerCase();
  return indicators.some((indicator) =>
    lowerText.includes(indicator.toLowerCase()),
  );
}

function parseOptantStatus(html: string): ParsedOptantStatus {
  const result: ParsedOptantStatus = {
    simplesNacional: null,
    simei: null,
  };

  const lowerHtml = html.toLowerCase();

  // Simples Nacional
  if (lowerHtml.includes("não optante pelo simples nacional")) {
    result.simplesNacional = false;
  } else if (
    lowerHtml.includes("optante pelo simples nacional") &&
    !lowerHtml.includes("não optante")
  ) {
    result.simplesNacional = true;
  }

  // SIMEI
  if (
    lowerHtml.includes("não enquadrado no simei") ||
    lowerHtml.includes("não optante pelo simei")
  ) {
    result.simei = false;
  } else if (
    lowerHtml.includes("enquadrado no simei") ||
    lowerHtml.includes("optante pelo simei")
  ) {
    result.simei = true;
  }

  return result;
}

function classifyError(
  html: string,
  hasCaptcha: boolean,
  hasError: boolean,
): {
  status: SimplesLookupStatus;
  code: ReceitaWebDiagnosticCode;
} {
  // Check for CAPTCHA first - either image elements or text indicators
  if (hasCaptcha || containsText(html, RECEITA_TEXT_INDICATORS.captcha)) {
    return {
      status: "CAPTCHA_REQUIRED",
      code: RECEITA_WEB_DIAGNOSTIC_CODE.CAPTCHA_REQUIRED,
    };
  }

  if (containsText(html, RECEITA_TEXT_INDICATORS.blocked)) {
    return {
      status: "BLOCKED",
      code: RECEITA_WEB_DIAGNOSTIC_CODE.PORTAL_BLOCKED,
    };
  }

  if (containsText(html, RECEITA_TEXT_INDICATORS.notFound)) {
    return {
      status: "NOT_FOUND",
      code: RECEITA_WEB_DIAGNOSTIC_CODE.NOT_FOUND,
    };
  }

  if (containsText(html, RECEITA_TEXT_INDICATORS.invalidCnpj)) {
    return {
      status: "INVALID_CNPJ",
      code: RECEITA_WEB_DIAGNOSTIC_CODE.INVALID_CNPJ,
    };
  }

  if (hasError) {
    return {
      status: "TEMPORARY_ERROR",
      code: RECEITA_WEB_DIAGNOSTIC_CODE.TEMPORARY_ERROR,
    };
  }

  return {
    status: "UNPARSABLE_RESULT",
    code: RECEITA_WEB_DIAGNOSTIC_CODE.UNPARSABLE_RESULT,
  };
}

export function parseReceitaResult(
  input: ParseReceitaResultInput,
): SimplesLookupResult {
  const { html, cnpj, hasCaptcha, hasError, hasResult } = input;
  const htmlLength = html.length;

  // 1. CAPTCHA detectado (imagem ou texto)
  if (hasCaptcha || containsText(html, RECEITA_TEXT_INDICATORS.captcha)) {
    return createReceitaWebResult({
      cnpj,
      status: "CAPTCHA_REQUIRED",
      message: "CAPTCHA detectado na página",
      diagnostic: createReceitaWebDiagnostic({
        code: RECEITA_WEB_DIAGNOSTIC_CODE.CAPTCHA_REQUIRED,
        htmlLength,
        hasCaptcha,
        hasError,
        hasResult,
      }),
    });
  }

  // 2. Detectar bloqueios estruturais antes de depender de seletores de erro.
  if (containsText(html, RECEITA_TEXT_INDICATORS.blocked)) {
    return createReceitaWebResult({
      cnpj,
      status: "BLOCKED",
      message: "Bloqueio detectado no portal da Receita",
      diagnostic: createReceitaWebDiagnostic({
        code: RECEITA_WEB_DIAGNOSTIC_CODE.PORTAL_BLOCKED,
        htmlLength,
        hasCaptcha,
        hasError,
        hasResult,
      }),
    });
  }

  // 3. Verificar se há resultado de optante
  const optantStatus = parseOptantStatus(html);

  // Se conseguiu extrair status de optante, retornar SUCCESS
  if (optantStatus.simplesNacional !== null || optantStatus.simei !== null) {
    return createReceitaWebResult({
      cnpj,
      simplesNacional: optantStatus.simplesNacional,
      simei: optantStatus.simei,
      status: "SUCCESS",
      diagnostic: createReceitaWebDiagnostic({
        code: RECEITA_WEB_DIAGNOSTIC_CODE.RESULT_SUCCESS,
        htmlLength,
        hasCaptcha,
        hasError,
        hasResult,
      }),
    });
  }

  // 4. Verificar "não encontrado"
  if (containsText(html, RECEITA_TEXT_INDICATORS.notFound)) {
    return createReceitaWebResult({
      cnpj,
      status: "NOT_FOUND",
      message: "CNPJ não encontrado no portal da Receita",
      diagnostic: createReceitaWebDiagnostic({
        code: RECEITA_WEB_DIAGNOSTIC_CODE.NOT_FOUND,
        htmlLength,
        hasCaptcha,
        hasError,
        hasResult,
      }),
    });
  }

  // 5. Verificar erro
  if (hasError) {
    const error = classifyError(html, hasCaptcha, hasError);
    return createReceitaWebResult({
      cnpj,
      status: error.status,
      message: `Erro detectado: ${error.status}`,
      diagnostic: createReceitaWebDiagnostic({
        code: error.code,
        htmlLength,
        hasCaptcha,
        hasError,
        hasResult,
      }),
    });
  }

  // 6. Sem estrutura reconhecida
  return createReceitaWebResult({
    cnpj,
    status: "UNPARSABLE_RESULT",
    message: "Nenhuma estrutura reconhecida na página",
    diagnostic: createReceitaWebDiagnostic({
      code: RECEITA_WEB_DIAGNOSTIC_CODE.UNPARSABLE_RESULT,
      htmlLength,
      hasCaptcha,
      hasError,
      hasResult,
    }),
  });
}

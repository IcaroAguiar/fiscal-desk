import { describe, expect, it, vi } from "vitest";

import {
  COMPARISON_MODE,
  compareProcessedCsvWithProvider,
} from "../../src/core/comparison/provider-comparison";
import type { SimplesLookupPort } from "../../src/core/simples/simples-lookup.port";
import type { SimplesLookupResult } from "../../src/core/simples/simples-lookup.types";

const RESULT_BY_CNPJ: Record<string, SimplesLookupResult> = {
  "00000000000191": {
    cnpj: "00000000000191",
    simplesNacional: true,
    simei: false,
    source: "receita-web",
    status: "SUCCESS",
  },
  "00360305000104": {
    cnpj: "00360305000104",
    simplesNacional: null,
    simei: null,
    source: "receita-web",
    status: "CAPTCHA_REQUIRED",
    message: "CAPTCHA detectado",
  },
  "03426484000123": {
    cnpj: "03426484000123",
    simplesNacional: null,
    simei: null,
    source: "receita-web",
    status: "BLOCKED",
    message: "Bloqueado pelo portal",
  },
  "33000167000101": {
    cnpj: "33000167000101",
    simplesNacional: false,
    simei: false,
    source: "receita-web",
    status: "SUCCESS",
  },
};

describe("provider comparison", () => {
  it("compares a processed CSV with a provider without overwriting original rows", async () => {
    const provider = createProvider();
    const csv = [
      "empresa;cnpj_normalizado;simples_nacional;simei;status;fonte;mensagem",
      "A;00000000000191;true;false;SUCCESS;base-publica-local;original ok",
      "B;33000167000101;true;false;SUCCESS;base-publica-local;original diverge",
      "C;00360305000104;;;TEMPORARY_ERROR;base-publica-local;erro original",
      "A duplicado;00000000000191;true;false;SUCCESS;base-publica-local;duplicado",
    ].join("\n");

    const result = await compareProcessedCsvWithProvider(csv, provider, {
      mode: COMPARISON_MODE.ALL,
    });

    expect(result.summary).toMatchObject({
      totalInputRows: 4,
      totalCandidates: 3,
      totalCompared: 3,
      totalConcordant: 1,
      totalDivergent: 1,
      totalInconclusive: 1,
    });
    expect(provider.lookup).toHaveBeenCalledTimes(3);
    expect(result.rows.map((row) => row.decisao_comparativa)).toEqual([
      "concordante",
      "divergente",
      "inconclusivo",
    ]);
    expect(result.outputCsv).toContain("status_original");
    expect(result.outputCsv).toContain("status_reconsulta");
    expect(result.outputCsv).toContain("decisao_comparativa");
    expect(result.outputCsv).toContain("original diverge");
  });

  it("can compare only error-like processed rows", async () => {
    const provider = createProvider();
    const csv = [
      "cnpj_normalizado;simples_nacional;simei;status;fonte;mensagem",
      "00000000000191;true;false;SUCCESS;base-publica-local;ok",
      "00360305000104;;;TEMPORARY_ERROR;base-publica-local;erro",
    ].join("\n");

    const result = await compareProcessedCsvWithProvider(csv, provider, {
      mode: COMPARISON_MODE.ERRORS,
    });

    expect(provider.lookup).toHaveBeenCalledTimes(1);
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0]?.cnpj_normalizado).toBe("00360305000104");
    expect(result.rows[0]?.decisao_comparativa).toBe("inconclusivo");
  });

  it("does not truncate error comparisons unless a limit is explicit", async () => {
    const provider = createProvider();
    const csv = [
      "cnpj_normalizado;simples_nacional;simei;status;fonte;mensagem",
      "00000000000191;true;false;SUCCESS;base-publica-local;ok",
      "00360305000104;;;TEMPORARY_ERROR;base-publica-local;erro",
      "03426484000123;;;CAPTCHA_REQUIRED;base-publica-local;captcha",
    ].join("\n");

    const allErrors = await compareProcessedCsvWithProvider(csv, provider, {
      mode: COMPARISON_MODE.ERRORS,
    });
    const limitedErrors = await compareProcessedCsvWithProvider(csv, provider, {
      limit: 1,
      mode: COMPARISON_MODE.ERRORS,
    });

    expect(allErrors.rows.map((row) => row.cnpj_normalizado)).toEqual([
      "00360305000104",
      "03426484000123",
    ]);
    expect(limitedErrors.rows.map((row) => row.cnpj_normalizado)).toEqual([
      "00360305000104",
    ]);
  });

  it("limits sample comparisons by default strategy", async () => {
    const provider = createProvider();
    const csv = [
      "cnpj_normalizado;simples_nacional;simei;status;fonte;mensagem",
      "00000000000191;true;false;SUCCESS;base-publica-local;ok",
      "33000167000101;false;false;SUCCESS;base-publica-local;ok",
    ].join("\n");

    const result = await compareProcessedCsvWithProvider(csv, provider, {
      limit: 1,
      mode: COMPARISON_MODE.SAMPLE,
    });

    expect(provider.lookup).toHaveBeenCalledTimes(1);
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0]?.cnpj_normalizado).toBe("00000000000191");
  });
});

function createProvider(): SimplesLookupPort & {
  lookup: ReturnType<typeof vi.fn>;
} {
  return {
    lookup: vi.fn(async (cnpj: string) => {
      const result = RESULT_BY_CNPJ[cnpj];
      if (!result) {
        throw new Error(`Resultado nao mapeado para ${cnpj}`);
      }

      return result;
    }),
  };
}

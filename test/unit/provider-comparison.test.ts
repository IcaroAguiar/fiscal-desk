import { describe, expect, it, vi } from "vitest";

import {
  COMPARISON_MODE,
  compareProcessedCsvWithProvider,
  completeProcessedCsvWithProvider,
} from "../../src/core/comparison/provider-comparison";
import type { SimplesLookupPort } from "../../src/core/simples/simples-lookup.port";
import type { SimplesLookupResult } from "../../src/core/simples/simples-lookup.types";

const RESULT_BY_CNPJ: Record<string, SimplesLookupResult> = {
  "11222333000181": {
    cnpj: "11222333000181",
    simplesNacional: true,
    simei: false,
    source: "receita-web",
    status: "SUCCESS",
  },
  "12345678000195": {
    cnpj: "12345678000195",
    simplesNacional: null,
    simei: null,
    source: "receita-web",
    status: "CAPTCHA_REQUIRED",
    message: "CAPTCHA detectado",
  },
  "44555666000181": {
    cnpj: "44555666000181",
    simplesNacional: null,
    simei: null,
    source: "receita-web",
    status: "BLOCKED",
    message: "Bloqueado pelo portal",
  },
  "98765432000198": {
    cnpj: "98765432000198",
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
      "A;11222333000181;true;false;SUCCESS;base-publica-local;original ok",
      "B;98765432000198;true;false;SUCCESS;base-publica-local;original diverge",
      "C;12345678000195;;;TEMPORARY_ERROR;base-publica-local;erro original",
      "A duplicado;11222333000181;true;false;SUCCESS;base-publica-local;duplicado",
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
      "11222333000181;true;false;SUCCESS;base-publica-local;ok",
      "12345678000195;;;TEMPORARY_ERROR;base-publica-local;erro",
    ].join("\n");

    const result = await compareProcessedCsvWithProvider(csv, provider, {
      mode: COMPARISON_MODE.ERRORS,
    });

    expect(provider.lookup).toHaveBeenCalledTimes(1);
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0]?.cnpj_normalizado).toBe("12345678000195");
    expect(result.rows[0]?.decisao_comparativa).toBe("inconclusivo");
  });

  it("does not truncate error comparisons unless a limit is explicit", async () => {
    const provider = createProvider();
    const csv = [
      "cnpj_normalizado;simples_nacional;simei;status;fonte;mensagem",
      "11222333000181;true;false;SUCCESS;base-publica-local;ok",
      "12345678000195;;;TEMPORARY_ERROR;base-publica-local;erro",
      "44555666000181;;;CAPTCHA_REQUIRED;base-publica-local;captcha",
    ].join("\n");

    const allErrors = await compareProcessedCsvWithProvider(csv, provider, {
      mode: COMPARISON_MODE.ERRORS,
    });
    const limitedErrors = await compareProcessedCsvWithProvider(csv, provider, {
      limit: 1,
      mode: COMPARISON_MODE.ERRORS,
    });

    expect(allErrors.rows.map((row) => row.cnpj_normalizado)).toEqual([
      "12345678000195",
      "44555666000181",
    ]);
    expect(limitedErrors.rows.map((row) => row.cnpj_normalizado)).toEqual([
      "12345678000195",
    ]);
  });

  it("limits sample comparisons by default strategy", async () => {
    const provider = createProvider();
    const csv = [
      "cnpj_normalizado;simples_nacional;simei;status;fonte;mensagem",
      "11222333000181;true;false;SUCCESS;base-publica-local;ok",
      "98765432000198;false;false;SUCCESS;base-publica-local;ok",
    ].join("\n");

    const result = await compareProcessedCsvWithProvider(csv, provider, {
      limit: 1,
      mode: COMPARISON_MODE.SAMPLE,
    });

    expect(provider.lookup).toHaveBeenCalledTimes(1);
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0]?.cnpj_normalizado).toBe("11222333000181");
  });

  it("completes NOT_FOUND rows with another provider without overwriting original results", async () => {
    const provider = createProvider();
    const csv = [
      "cnpj_normalizado;simples_nacional;simei;status;fonte;mensagem",
      "11222333000181;;;NOT_FOUND;base-publica-local;nao achou na base local",
      "98765432000198;Sim;Não;SUCCESS;base-publica-local;resultado original",
    ].join("\n");

    const result = await completeProcessedCsvWithProvider(csv, provider);

    expect(provider.lookup).toHaveBeenCalledTimes(1);
    expect(provider.lookup).toHaveBeenCalledWith("11222333000181", undefined);
    expect(result.summary).toMatchObject({
      totalCandidates: 1,
      totalCompleted: 1,
      totalFoundByComplement: 1,
      totalInputRows: 2,
    });
    expect(result.outputCsv).toContain("complemento_status");
    expect(result.outputCsv).toContain("complemento_decisao");
    expect(result.rows[0]).toMatchObject({
      complemento_decisao: "preenchido_por_complemento",
      complemento_fonte: "receita-web",
      complemento_simples_nacional: "Sim",
      complemento_simei: "Não",
      complemento_status: "SUCCESS",
      mensagem: "nao achou na base local",
      status: "NOT_FOUND",
    });
    expect(result.rows[1]).toMatchObject({
      complemento_decisao: "nao_aplicavel",
      status: "SUCCESS",
    });
  });

  it("applies a deduplicated completion lookup to every matching NOT_FOUND row for the CNPJ", async () => {
    const provider = createProvider();
    const csv = [
      "cnpj_normalizado;simples_nacional;simei;status;fonte;mensagem",
      "11222333000181;;;NOT_FOUND;base-publica-local;primeira linha",
      "11222333000181;;;NOT_FOUND;base-publica-local;segunda linha",
      "11222333000181;Sim;Não;SUCCESS;base-publica-local;resultado original",
    ].join("\n");

    const result = await completeProcessedCsvWithProvider(csv, provider);

    expect(provider.lookup).toHaveBeenCalledTimes(1);
    expect(result.summary).toMatchObject({
      totalCandidates: 1,
      totalCompleted: 1,
      totalFoundByComplement: 1,
      totalInputRows: 3,
    });
    expect(result.rows[0]).toMatchObject({
      complemento_decisao: "preenchido_por_complemento",
      complemento_status: "SUCCESS",
      mensagem: "primeira linha",
    });
    expect(result.rows[1]).toMatchObject({
      complemento_decisao: "preenchido_por_complemento",
      complemento_status: "SUCCESS",
      mensagem: "segunda linha",
    });
    expect(result.rows[2]).toMatchObject({
      complemento_decisao: "nao_aplicavel",
      status: "SUCCESS",
    });
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

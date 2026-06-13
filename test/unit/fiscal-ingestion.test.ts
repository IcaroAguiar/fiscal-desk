import { describe, expect, it } from "vitest";

import { ingestFiscalCsv } from "../../src/core/ingestion/fiscal-ingestion";
import {
  FISCAL_INGESTION_INPUT_FORMAT,
  FISCAL_INGESTION_ISSUE_KIND,
  FISCAL_INGESTION_ISSUE_SEVERITY,
  FISCAL_INGESTION_SOURCE_KIND,
} from "../../src/core/ingestion/ingestion-contract";

const RECEIVED_AT = "2026-06-13T00:00:00.000Z";

describe("ingestFiscalCsv", () => {
  it("produces a FiscalIngestionBatch with source metadata and unique valid entries", () => {
    const batch = ingestFiscalCsv(
      [
        "CNPJ;Nome",
        "03.426.484/0001-23;Empresa A",
        "11.222.333/0001-81;Empresa B",
      ].join("\n"),
      {
        receivedAt: RECEIVED_AT,
        sourceKind: FISCAL_INGESTION_SOURCE_KIND.LOCAL_FILE,
        sourceLabel: "clientes.csv",
      },
    );

    expect(batch.summary).toEqual({
      duplicateCnpjs: 0,
      invalidRows: 0,
      source: {
        format: FISCAL_INGESTION_INPUT_FORMAT.CSV,
        kind: FISCAL_INGESTION_SOURCE_KIND.LOCAL_FILE,
        label: "clientes.csv",
        receivedAt: RECEIVED_AT,
      },
      totalRows: 2,
      uniqueValidCnpjs: 2,
      validRows: 2,
    });
    expect(batch.entries).toEqual([
      {
        cnpjNormalizado: "03426484000123",
        cnpjOriginal: "03.426.484/0001-23",
        row: {
          CNPJ: "03.426.484/0001-23",
          Nome: "Empresa A",
        },
        rowNumber: 2,
      },
      {
        cnpjNormalizado: "11222333000181",
        cnpjOriginal: "11.222.333/0001-81",
        row: {
          CNPJ: "11.222.333/0001-81",
          Nome: "Empresa B",
        },
        rowNumber: 3,
      },
    ]);
    expect(batch.issues).toEqual([]);
  });

  it("records invalid rows and duplicate CNPJs without adding them to entries", () => {
    const batch = ingestFiscalCsv(
      [
        "cnpj;nome",
        "03.426.484/0001-23;Empresa A",
        "abc;Empresa invalida",
        "03.426.484/0001-23;Empresa duplicada",
      ].join("\n"),
      {
        receivedAt: RECEIVED_AT,
      },
    );

    expect(batch.entries.map((entry) => entry.cnpjNormalizado)).toEqual([
      "03426484000123",
    ]);
    expect(batch.summary).toMatchObject({
      duplicateCnpjs: 1,
      invalidRows: 1,
      totalRows: 3,
      uniqueValidCnpjs: 1,
      validRows: 2,
    });
    expect(batch.issues).toEqual([
      {
        cnpjNormalizado: null,
        cnpjOriginal: "abc",
        kind: FISCAL_INGESTION_ISSUE_KIND.INVALID_CNPJ,
        message: "CNPJ invalido",
        rowNumber: 3,
        severity: FISCAL_INGESTION_ISSUE_SEVERITY.ERROR,
      },
      {
        cnpjNormalizado: "03426484000123",
        cnpjOriginal: "03.426.484/0001-23",
        kind: FISCAL_INGESTION_ISSUE_KIND.DUPLICATE_CNPJ,
        message: "CNPJ duplicado na entrada",
        rowNumber: 4,
        severity: FISCAL_INGESTION_ISSUE_SEVERITY.WARNING,
      },
    ]);
  });

  it("records a missing CNPJ column issue while preserving parsed row count", () => {
    const batch = ingestFiscalCsv("nome\nEmpresa A\nEmpresa B\n", {
      receivedAt: RECEIVED_AT,
    });

    expect(batch.entries).toEqual([]);
    expect(batch.summary).toMatchObject({
      totalRows: 2,
      uniqueValidCnpjs: 0,
      validRows: 0,
    });
    expect(batch.issues).toEqual([
      {
        cnpjNormalizado: null,
        cnpjOriginal: null,
        kind: FISCAL_INGESTION_ISSUE_KIND.MISSING_CNPJ_COLUMN,
        message: "Nenhuma coluna de CNPJ suportada foi encontrada",
        rowNumber: null,
        severity: FISCAL_INGESTION_ISSUE_SEVERITY.ERROR,
      },
    ]);
  });

  it("records unsupported input format before parsing the payload", () => {
    const batch = ingestFiscalCsv("not-a-csv-payload", {
      format: "xlsx",
      receivedAt: RECEIVED_AT,
      sourceLabel: "clientes.xlsx",
    });

    expect(batch.summary.source).toEqual({
      format: "xlsx",
      kind: FISCAL_INGESTION_SOURCE_KIND.TEXT_BUFFER,
      label: "clientes.xlsx",
      receivedAt: RECEIVED_AT,
    });
    expect(batch.summary.totalRows).toBe(0);
    expect(batch.entries).toEqual([]);
    expect(batch.issues).toEqual([
      {
        cnpjNormalizado: null,
        cnpjOriginal: null,
        kind: FISCAL_INGESTION_ISSUE_KIND.UNSUPPORTED_INPUT_FORMAT,
        message: "Formato de entrada ainda nao suportado pela ingestion fiscal",
        rowNumber: null,
        severity: FISCAL_INGESTION_ISSUE_SEVERITY.ERROR,
      },
    ]);
  });
});

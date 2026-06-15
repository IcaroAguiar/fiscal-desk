import ExcelJS from "exceljs";
import { describe, expect, it } from "vitest";

import {
  ingestFiscalCsv,
  ingestFiscalXlsx,
} from "../../src/core/ingestion/fiscal-ingestion";
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
        message:
          "CNPJ inválido. Revise os 14 dígitos antes de consultar esta linha.",
        rowNumber: 3,
        severity: FISCAL_INGESTION_ISSUE_SEVERITY.ERROR,
      },
      {
        cnpjNormalizado: "03426484000123",
        cnpjOriginal: "03.426.484/0001-23",
        kind: FISCAL_INGESTION_ISSUE_KIND.DUPLICATE_CNPJ,
        message:
          "CNPJ repetido. A consulta será reaproveitada da primeira ocorrência válida.",
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
        message:
          "Não encontrei uma coluna de CNPJ. Use um cabeçalho como CNPJ, CPF/CNPJ, documento ou informe a coluna manualmente.",
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
        message:
          "Este formato de entrada ainda não está disponível. Por enquanto, exporte a lista como CSV UTF-8 e tente novamente.",
        rowNumber: null,
        severity: FISCAL_INGESTION_ISSUE_SEVERITY.ERROR,
      },
    ]);
  });
});

describe("ingestFiscalXlsx", () => {
  it("produces a FiscalIngestionBatch from the first relevant worksheet", async () => {
    const input = await createWorkbookBuffer([
      {
        name: "Capa",
        rows: [],
      },
      {
        name: "Clientes",
        rows: [
          ["CNPJ", "Nome"],
          ["03.426.484/0001-23", "Empresa A"],
          ["11.222.333/0001-81", "Empresa B"],
        ],
      },
    ]);

    const batch = await ingestFiscalXlsx(input, {
      receivedAt: RECEIVED_AT,
      sourceKind: FISCAL_INGESTION_SOURCE_KIND.LOCAL_FILE,
      sourceLabel: "clientes.xlsx",
    });

    expect(batch.summary).toEqual({
      duplicateCnpjs: 0,
      invalidRows: 0,
      source: {
        format: FISCAL_INGESTION_INPUT_FORMAT.XLSX,
        kind: FISCAL_INGESTION_SOURCE_KIND.LOCAL_FILE,
        label: "clientes.xlsx",
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

  it("records invalid rows and duplicate CNPJs from Excel without adding them to entries", async () => {
    const input = await createWorkbookBuffer([
      {
        name: "Clientes",
        rows: [
          ["cnpj", "nome"],
          ["03.426.484/0001-23", "Empresa A"],
          ["abc", "Empresa invalida"],
          ["03.426.484/0001-23", "Empresa duplicada"],
        ],
      },
    ]);

    const batch = await ingestFiscalXlsx(input, {
      receivedAt: RECEIVED_AT,
    });

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
    expect(batch.issues.map((issue) => issue.kind)).toEqual([
      FISCAL_INGESTION_ISSUE_KIND.INVALID_CNPJ,
      FISCAL_INGESTION_ISSUE_KIND.DUPLICATE_CNPJ,
    ]);
    expect(batch.issues.map((issue) => issue.rowNumber)).toEqual([3, 4]);
  });

  it("records a missing CNPJ column issue while preserving Excel row count", async () => {
    const input = await createWorkbookBuffer([
      {
        name: "Clientes",
        rows: [["Nome"], ["Empresa A"], ["Empresa B"]],
      },
    ]);

    const batch = await ingestFiscalXlsx(input, {
      receivedAt: RECEIVED_AT,
    });

    expect(batch.entries).toEqual([]);
    expect(batch.summary).toMatchObject({
      source: {
        format: FISCAL_INGESTION_INPUT_FORMAT.XLSX,
        kind: FISCAL_INGESTION_SOURCE_KIND.TEXT_BUFFER,
        label: "entrada.xlsx",
        receivedAt: RECEIVED_AT,
      },
      totalRows: 2,
      uniqueValidCnpjs: 0,
      validRows: 0,
    });
    expect(batch.issues).toEqual([
      {
        cnpjNormalizado: null,
        cnpjOriginal: null,
        kind: FISCAL_INGESTION_ISSUE_KIND.MISSING_CNPJ_COLUMN,
        message:
          "Não encontrei uma coluna de CNPJ. Use um cabeçalho como CNPJ, CPF/CNPJ, documento ou informe a coluna manualmente.",
        rowNumber: null,
        severity: FISCAL_INGESTION_ISSUE_SEVERITY.ERROR,
      },
    ]);
  });

  it("records unsupported input format before parsing an Excel payload", async () => {
    const input = await createWorkbookBuffer([
      {
        name: "Clientes",
        rows: [["CNPJ"], ["03.426.484/0001-23"]],
      },
    ]);

    const batch = await ingestFiscalXlsx(input, {
      format: "csv",
      receivedAt: RECEIVED_AT,
      sourceLabel: "clientes.csv",
    });

    expect(batch.summary.source).toEqual({
      format: "csv",
      kind: FISCAL_INGESTION_SOURCE_KIND.TEXT_BUFFER,
      label: "clientes.csv",
      receivedAt: RECEIVED_AT,
    });
    expect(batch.summary.totalRows).toBe(0);
    expect(batch.entries).toEqual([]);
    expect(batch.issues).toEqual([
      {
        cnpjNormalizado: null,
        cnpjOriginal: null,
        kind: FISCAL_INGESTION_ISSUE_KIND.UNSUPPORTED_INPUT_FORMAT,
        message:
          "Este formato de entrada ainda não está disponível. Por enquanto, exporte a lista como CSV UTF-8 e tente novamente.",
        rowNumber: null,
        severity: FISCAL_INGESTION_ISSUE_SEVERITY.ERROR,
      },
    ]);
  });
});

async function createWorkbookBuffer(
  sheets: Array<{
    name: string;
    rows: string[][];
  }>,
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();

  for (const sheet of sheets) {
    const worksheet = workbook.addWorksheet(sheet.name);

    for (const row of sheet.rows) {
      worksheet.addRow(row);
    }
  }

  const buffer = await workbook.xlsx.writeBuffer();

  return Buffer.from(buffer);
}

import ExcelJS from "exceljs";

import type { ProcessCsvSummary } from "../app/process-csv.types";
import type { SimplesLookupResult } from "../simples/simples-lookup.types";

type XlsxWorkbookInput = {
  columns: string[];
  rows: Array<Record<string, string>>;
  summary: ProcessCsvSummary;
  generatedAt?: Date;
};

const ERROR_STATUSES = new Set<SimplesLookupResult["status"]>([
  "INVALID_CNPJ",
  "NOT_FOUND",
  "TEMPORARY_ERROR",
  "PERMANENT_ERROR",
  "BLOCKED",
  "CAPTCHA_REQUIRED",
  "UNPARSABLE_RESULT",
  "CANCELLED",
]);

export async function writeXlsxWorkbook(
  input: XlsxWorkbookInput,
): Promise<Uint8Array> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Fiscal Desk";
  workbook.created = input.generatedAt ?? new Date();
  workbook.modified = workbook.created;

  addSummarySheet(workbook, input.summary);
  addRowsSheet(workbook, "Resultados", input.columns, input.rows);
  addRowsSheet(
    workbook,
    "Falhas",
    input.columns,
    input.rows.filter((row) =>
      ERROR_STATUSES.has(row.status as SimplesLookupResult["status"]),
    ),
  );
  addDivergencesSheet(workbook);
  addAuditSheet(workbook, input);

  const buffer = await workbook.xlsx.writeBuffer();

  return buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
}

function addSummarySheet(
  workbook: ExcelJS.Workbook,
  summary: ProcessCsvSummary,
): void {
  const worksheet = workbook.addWorksheet("Resumo");
  worksheet.columns = [
    { header: "Metrica", key: "metric", width: 34 },
    { header: "Valor", key: "value", width: 16 },
  ];
  worksheet.addRows([
    ["Total de linhas", summary.totalLinhas],
    ["CNPJs encontrados", summary.totalCnpjsEncontrados],
    ["CNPJs validos", summary.totalCnpjsValidos],
    ["CNPJs unicos consultados", summary.totalCnpjsUnicosConsultados],
    ["CNPJs retomados", summary.totalCnpjsRetomados],
    ["Optantes Simples", summary.totalOptantesSimples],
    ["Nao optantes Simples", summary.totalNaoOptantesSimples],
    ["Erros", summary.totalErros],
  ]);
  styleHeader(worksheet);
}

function addRowsSheet(
  workbook: ExcelJS.Workbook,
  name: string,
  columns: string[],
  rows: Array<Record<string, string>>,
): void {
  const worksheet = workbook.addWorksheet(name);
  worksheet.columns = columns.map((column) => ({
    header: column,
    key: column,
    width: Math.min(Math.max(column.length + 4, 14), 34),
  }));
  worksheet.addRows(rows);
  styleHeader(worksheet);
  worksheet.views = [{ state: "frozen", ySplit: 1 }];
}

function addDivergencesSheet(workbook: ExcelJS.Workbook): void {
  const worksheet = workbook.addWorksheet("Divergencias");
  worksheet.columns = [
    { header: "CNPJ", key: "cnpj", width: 22 },
    { header: "Status", key: "status", width: 20 },
    { header: "Observacao", key: "observacao", width: 64 },
  ];
  worksheet.addRow({
    cnpj: "",
    observacao:
      "Sem divergencias calculadas neste corte. A aba fica reservada para fluxos multi-provedor.",
    status: "nao_aplicavel",
  });
  styleHeader(worksheet);
}

function addAuditSheet(
  workbook: ExcelJS.Workbook,
  input: XlsxWorkbookInput,
): void {
  const worksheet = workbook.addWorksheet("Auditoria");
  worksheet.columns = [
    { header: "Campo", key: "field", width: 32 },
    { header: "Valor", key: "value", width: 72 },
  ];
  worksheet.addRows([
    ["Produto", "Fiscal Desk"],
    ["Formato", "Planilha de Resultado"],
    ["Gerado em", (input.generatedAt ?? new Date()).toISOString()],
    ["Abas", "Resumo, Resultados, Falhas, Divergencias, Auditoria"],
    ["Linhas exportadas", String(input.rows.length)],
    ["Colunas exportadas", input.columns.join(", ")],
  ]);
  styleHeader(worksheet);
}

function styleHeader(worksheet: ExcelJS.Worksheet): void {
  const header = worksheet.getRow(1);
  header.font = { bold: true, color: { argb: "FF111827" } };
  header.fill = {
    fgColor: { argb: "FFE2E8F0" },
    pattern: "solid",
    type: "pattern",
  };
  header.alignment = { vertical: "middle" };
}

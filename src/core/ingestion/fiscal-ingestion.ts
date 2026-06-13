import { normalizeCnpj } from "../cnpj/normalize-cnpj";
import { validateCnpj } from "../cnpj/validate-cnpj";
import { readCsv } from "./csv-reader";
import { detectCnpjColumn } from "./detect-cnpj-column";
import {
  FISCAL_INGESTION_INPUT_FORMAT,
  FISCAL_INGESTION_ISSUE_KIND,
  FISCAL_INGESTION_ISSUE_SEVERITY,
  FISCAL_INGESTION_SOURCE_KIND,
  type FiscalIngestionBatch,
  type FiscalIngestionEntry,
  type FiscalIngestionIssue,
  type FiscalIngestionSource,
  type FiscalIngestionSourceKind,
} from "./ingestion-contract";

type FiscalCsvIngestionOptions = {
  cnpjColumn?: string;
  format?: string;
  receivedAt?: Date | string;
  sourceKind?: FiscalIngestionSourceKind;
  sourceLabel?: string;
};

const DEFAULT_SOURCE_LABEL = "entrada.csv";
const MISSING_CNPJ_COLUMN_MESSAGE =
  "Não encontrei uma coluna de CNPJ. Use um cabeçalho como CNPJ, CPF/CNPJ, documento ou informe a coluna manualmente.";
const UNSUPPORTED_INPUT_FORMAT_MESSAGE =
  "Este formato de entrada ainda não está disponível. Por enquanto, exporte a lista como CSV UTF-8 e tente novamente.";
const INVALID_CNPJ_MESSAGE =
  "CNPJ inválido. Revise os 14 dígitos antes de consultar esta linha.";
const DUPLICATE_CNPJ_MESSAGE =
  "CNPJ repetido. A consulta será reaproveitada da primeira ocorrência válida.";

export function ingestFiscalCsv(
  inputCsv: string,
  options: FiscalCsvIngestionOptions = {},
): FiscalIngestionBatch {
  const source = createFiscalIngestionSource(options);

  if (source.format !== FISCAL_INGESTION_INPUT_FORMAT.CSV) {
    return createEmptyBatch(source, [
      {
        cnpjNormalizado: null,
        cnpjOriginal: null,
        kind: FISCAL_INGESTION_ISSUE_KIND.UNSUPPORTED_INPUT_FORMAT,
        message: UNSUPPORTED_INPUT_FORMAT_MESSAGE,
        rowNumber: null,
        severity: FISCAL_INGESTION_ISSUE_SEVERITY.ERROR,
      },
    ]);
  }

  const { headers, rowLineNumbers, rows } = readCsv(inputCsv);
  const cnpjColumn = detectCnpjColumn(
    headers,
    options.cnpjColumn ? { override: options.cnpjColumn } : {},
  );

  if (!cnpjColumn) {
    return createEmptyBatch(
      source,
      [
        {
          cnpjNormalizado: null,
          cnpjOriginal: null,
          kind: FISCAL_INGESTION_ISSUE_KIND.MISSING_CNPJ_COLUMN,
          message: MISSING_CNPJ_COLUMN_MESSAGE,
          rowNumber: null,
          severity: FISCAL_INGESTION_ISSUE_SEVERITY.ERROR,
        },
      ],
      rows.length,
    );
  }

  return createCsvIngestionBatch({
    cnpjColumn,
    rowLineNumbers,
    rows,
    source,
  });
}

function createFiscalIngestionSource(
  options: FiscalCsvIngestionOptions,
): FiscalIngestionSource {
  return {
    format: options.format ?? FISCAL_INGESTION_INPUT_FORMAT.CSV,
    kind: options.sourceKind ?? FISCAL_INGESTION_SOURCE_KIND.TEXT_BUFFER,
    label: options.sourceLabel ?? DEFAULT_SOURCE_LABEL,
    receivedAt: toIsoString(options.receivedAt ?? new Date()),
  };
}

function toIsoString(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : value;
}

function createCsvIngestionBatch(input: {
  cnpjColumn: string;
  rowLineNumbers: number[];
  rows: Array<Record<string, string>>;
  source: FiscalIngestionSource;
}): FiscalIngestionBatch {
  const entries: FiscalIngestionEntry[] = [];
  const issues: FiscalIngestionIssue[] = [];
  const seenCnpjs = new Set<string>();
  let duplicateCnpjs = 0;
  let invalidRows = 0;
  let validRows = 0;

  for (const [index, row] of input.rows.entries()) {
    const cnpjOriginal = row[input.cnpjColumn] ?? "";
    const cnpjNormalizado = normalizeCnpj(cnpjOriginal);
    const rowNumber = input.rowLineNumbers[index] ?? index + 1;

    if (!validateCnpj(cnpjNormalizado)) {
      invalidRows += 1;
      issues.push({
        cnpjNormalizado: cnpjNormalizado || null,
        cnpjOriginal,
        kind: FISCAL_INGESTION_ISSUE_KIND.INVALID_CNPJ,
        message: INVALID_CNPJ_MESSAGE,
        rowNumber,
        severity: FISCAL_INGESTION_ISSUE_SEVERITY.ERROR,
      });
      continue;
    }

    validRows += 1;

    if (seenCnpjs.has(cnpjNormalizado)) {
      duplicateCnpjs += 1;
      issues.push({
        cnpjNormalizado,
        cnpjOriginal,
        kind: FISCAL_INGESTION_ISSUE_KIND.DUPLICATE_CNPJ,
        message: DUPLICATE_CNPJ_MESSAGE,
        rowNumber,
        severity: FISCAL_INGESTION_ISSUE_SEVERITY.WARNING,
      });
      continue;
    }

    seenCnpjs.add(cnpjNormalizado);
    entries.push({
      cnpjNormalizado,
      cnpjOriginal,
      row,
      rowNumber,
    });
  }

  return {
    entries,
    issues,
    summary: {
      duplicateCnpjs,
      invalidRows,
      source: input.source,
      totalRows: input.rows.length,
      uniqueValidCnpjs: entries.length,
      validRows,
    },
  };
}

function createEmptyBatch(
  source: FiscalIngestionSource,
  issues: FiscalIngestionIssue[],
  totalRows = 0,
): FiscalIngestionBatch {
  return {
    entries: [],
    issues,
    summary: {
      duplicateCnpjs: 0,
      invalidRows: 0,
      source,
      totalRows,
      uniqueValidCnpjs: 0,
      validRows: 0,
    },
  };
}

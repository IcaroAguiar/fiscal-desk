import { normalizeCnpj } from "../cnpj/normalize-cnpj";
import { validateCnpj } from "../cnpj/validate-cnpj";
import { writeCsv } from "../export/csv-writer";
import type { FiscalExportDeliveryOptionId } from "../export/export-contract";
import { writeXlsxWorkbook } from "../export/xlsx-writer";
import { AbortError } from "../infra/rate-limiter";
import { readCsv } from "../ingestion/csv-reader";
import { detectCnpjColumn } from "../ingestion/detect-cnpj-column";
import {
  ingestFiscalCsv,
  ingestFiscalXlsx,
} from "../ingestion/fiscal-ingestion";
import {
  FISCAL_INGESTION_INPUT_FORMAT,
  FISCAL_INGESTION_ISSUE_KIND,
  FISCAL_INGESTION_SOURCE_KIND,
  type FiscalIngestionBatch,
  type FiscalIngestionIssue,
} from "../ingestion/ingestion-contract";
import { readXlsx } from "../ingestion/xlsx-reader";
import type { SimplesLookupPort } from "../simples/simples-lookup.port";
import type { SimplesLookupResult } from "../simples/simples-lookup.types";
import { estimateObservedRemainingMs } from "./eta";
import type {
  LookupProgress,
  ProcessCsvDeliveryFormat,
  ProcessCsvExecution,
  ProcessCsvInputFormat,
  ProcessCsvOutputDelivery,
  ProcessCsvRunStatus,
  ProcessCsvSummary,
} from "./process-csv.types";
import { PROCESS_CSV_INPUT_FORMAT } from "./process-csv.types";
import { resolveProcessCsvOutputDelivery } from "./process-csv-delivery";
import type { ProcessExecutionLedgerSession } from "./process-execution-ledger.port";

type ProcessCsvOptions = {
  cnpjColumn?: string;
  deliveryFormat?: ProcessCsvDeliveryFormat;
  deliveryOptionId?: FiscalExportDeliveryOptionId;
  executionLedger?: ProcessExecutionLedgerSession;
  onLookupProgress?: (progress: LookupProgress) => void;
  signal?: AbortSignal;
};

type ProcessCsvResult = {
  delivery: ProcessCsvOutputDelivery;
  outputCsv: string;
  outputXlsx: Uint8Array | null;
  summary: ProcessCsvSummary;
  runStatus: ProcessCsvRunStatus;
  execution: ProcessCsvExecution | null;
};

export type ProcessCsvSourceInput =
  | string
  | {
      content: string | Buffer | ArrayBuffer | Uint8Array | number[];
      format?: ProcessCsvInputFormat;
      sourceFileName?: string;
      sourceFilePath?: string;
    };

type ParsedProcessInput = {
  delimiter: ReturnType<typeof readCsv>["delimiter"];
  headers: string[];
  ingestionBatch: FiscalIngestionBatch;
  rowLineNumbers: number[];
  rows: Array<Record<string, string>>;
};

const ERROR_STATUSES = new Set<SimplesLookupResult["status"]>([
  "INVALID_CNPJ",
  "NOT_FOUND",
  "TEMPORARY_ERROR",
  "PERMANENT_ERROR",
  "BLOCKED",
  "CAPTCHA_REQUIRED",
  "UNPARSABLE_RESULT",
]);

const CHECKPOINT_REUSABLE_STATUSES = new Set<SimplesLookupResult["status"]>([
  "SUCCESS",
  "NOT_FOUND",
  "PERMANENT_ERROR",
]);

export async function processCsv(
  input: ProcessCsvSourceInput,
  provider: SimplesLookupPort,
  options: ProcessCsvOptions = {},
): Promise<ProcessCsvResult> {
  const delivery = resolveProcessCsvOutputDelivery({
    ...(options.deliveryFormat
      ? { deliveryFormat: options.deliveryFormat }
      : {}),
    ...(Object.hasOwn(options, "deliveryOptionId")
      ? { deliveryOptionId: options.deliveryOptionId }
      : {}),
  });
  const parsedInput = await parseProcessInput(input, options);
  const { delimiter, headers, ingestionBatch, rowLineNumbers, rows } =
    parsedInput;
  const cnpjColumn = detectCnpjColumn(
    headers,
    options.cnpjColumn ? { override: options.cnpjColumn } : {},
  );

  if (!cnpjColumn) {
    throw new Error(
      "Nenhuma coluna de CNPJ suportada foi encontrada. Use um cabeçalho como CNPJ, CPF/CNPJ, documento ou informe a coluna manualmente.",
    );
  }

  const ingestionIssueByRow = new Map(
    ingestionBatch.issues
      .filter((issue) => issue.rowNumber !== null)
      .map((issue) => [issue.rowNumber as number, issue]),
  );
  const uniqueValidCnpjs = ingestionBatch.entries.map(
    (entry) => entry.cnpjNormalizado,
  );
  await options.executionLedger?.setTotalUniqueLookups(uniqueValidCnpjs.length);

  const lookupCache = await restoreLookupCache(
    uniqueValidCnpjs,
    options.executionLedger,
  );
  const resumedUniqueLookups = lookupCache.size;
  let completedUniqueLookups = resumedUniqueLookups;
  let totalCnpjsEncontrados = 0;
  let totalCnpjsValidos = 0;
  let runStatus: ProcessCsvRunStatus = "SUCCESS";
  const startedAt = Date.now();
  const outputColumns = [
    ...headers,
    "cnpj_original",
    "cnpj_normalizado",
    "cnpj_valido",
    "simples_nacional",
    "simei",
    "status",
    "fonte",
    "mensagem",
    "linha",
  ];

  const outputRows: Array<Record<string, string>> = [];

  for (const [index, row] of rows.entries()) {
    if (isCancellationBoundary(options.signal)) {
      runStatus = "CANCELLED";
    }

    const cnpjOriginal = row[cnpjColumn] ?? "";
    const cnpjNormalizado = normalizeCnpj(cnpjOriginal);
    const cnpjValido = validateCnpj(cnpjNormalizado);
    const rowNumber = rowLineNumbers[index] ?? index + 1;
    const ingestionIssue = ingestionIssueByRow.get(rowNumber);

    if (cnpjOriginal) {
      totalCnpjsEncontrados += 1;
    }

    if (cnpjValido) {
      totalCnpjsValidos += 1;
    }

    let lookupResult: SimplesLookupResult;

    if (!cnpjValido) {
      lookupResult = {
        cnpj: cnpjNormalizado,
        simplesNacional: null,
        simei: null,
        source: "system",
        status: "INVALID_CNPJ",
        message:
          ingestionIssue?.message ??
          "CNPJ inválido. Revise os 14 dígitos antes de consultar esta linha.",
      };
    } else if (runStatus === "CANCELLED") {
      const cachedResult = lookupCache.get(cnpjNormalizado);
      lookupResult = cachedResult ?? {
        cnpj: cnpjNormalizado,
        simplesNacional: null,
        simei: null,
        source: "system",
        status: "CANCELLED",
        message: "Processamento cancelado antes desta consulta",
      };
    } else {
      const cachedResult = lookupCache.get(cnpjNormalizado);
      if (cachedResult) {
        lookupResult = cachedResult;
      } else {
        try {
          lookupResult = await provider.lookup(
            cnpjNormalizado,
            options.signal ? { signal: options.signal } : undefined,
          );
        } catch (error) {
          if (error instanceof AbortError) {
            runStatus = "CANCELLED";
            lookupResult = {
              cnpj: cnpjNormalizado,
              simplesNacional: null,
              simei: null,
              source: "system",
              status: "CANCELLED",
              message: "Processamento cancelado antes desta consulta",
            };
          } else {
            throw error;
          }
        }

        if (lookupResult.status === "CANCELLED") {
          runStatus = "CANCELLED";
        }

        if (runStatus === "SUCCESS") {
          lookupCache.set(cnpjNormalizado, lookupResult);
          if (isReusableCheckpointResult(lookupResult)) {
            await options.executionLedger?.saveLookup(lookupResult);
          }
          completedUniqueLookups += 1;
          options.onLookupProgress?.({
            completedUniqueLookups,
            totalUniqueLookups: uniqueValidCnpjs.length,
            currentCnpj: cnpjNormalizado,
            elapsedMs: Date.now() - startedAt,
            estimatedRemainingMs: estimateObservedRemainingMs(
              Date.now() - startedAt,
              completedUniqueLookups,
              uniqueValidCnpjs.length,
            ),
          });
        }
      }
    }

    outputRows.push({
      ...row,
      cnpj_original: cnpjOriginal,
      cnpj_normalizado: cnpjNormalizado,
      cnpj_valido: String(cnpjValido),
      simples_nacional: toCsvValue(lookupResult.simplesNacional),
      simei: toCsvValue(lookupResult.simei),
      status: lookupResult.status,
      fonte: lookupResult.source,
      mensagem: formatOutputMessage(lookupResult, ingestionIssue),
      linha: String(rowNumber),
    });
  }

  const totalOptantesSimples = outputRows.filter(
    (row) => row.simples_nacional === "true",
  ).length;
  const totalNaoOptantesSimples = outputRows.filter(
    (row) => row.simples_nacional === "false",
  ).length;

  const summary = {
    totalLinhas: rows.length,
    totalCnpjsEncontrados,
    totalCnpjsValidos,
    totalCnpjsUnicosConsultados: lookupCache.size,
    totalCnpjsRetomados: resumedUniqueLookups,
    totalOptantesSimples,
    totalNaoOptantesSimples,
    totalErros: outputRows.filter((row) =>
      ERROR_STATUSES.has(row.status as SimplesLookupResult["status"]),
    ).length,
  };
  const outputCsv = writeCsv(outputRows, delimiter, outputColumns);
  const outputXlsx =
    delivery.format === "xlsx"
      ? await writeXlsxWorkbook({
          columns: outputColumns,
          rows: outputRows,
          summary,
        })
      : null;

  return {
    delivery,
    outputCsv,
    outputXlsx,
    summary,
    runStatus,
    execution: options.executionLedger
      ? {
          runId: options.executionLedger.runId,
          status: runStatus,
          checkpointPath: options.executionLedger.checkpointPath,
          completedUniqueLookups,
          totalUniqueLookups: uniqueValidCnpjs.length,
          resumedUniqueLookups,
        }
      : null,
  };
}

async function parseProcessInput(
  input: ProcessCsvSourceInput,
  options: ProcessCsvOptions,
): Promise<ParsedProcessInput> {
  const source = normalizeProcessInput(input);

  if (source.format === PROCESS_CSV_INPUT_FORMAT.XLSX) {
    const bytes = normalizeBinaryInput(source.content);
    const { headers, rowLineNumbers, rows } = await readXlsx(bytes);
    const ingestionBatch = await ingestFiscalXlsx(bytes, {
      ...(options.cnpjColumn ? { cnpjColumn: options.cnpjColumn } : {}),
      format: FISCAL_INGESTION_INPUT_FORMAT.XLSX,
      sourceKind: source.sourceFilePath
        ? FISCAL_INGESTION_SOURCE_KIND.LOCAL_FILE
        : FISCAL_INGESTION_SOURCE_KIND.TEXT_BUFFER,
      sourceLabel:
        source.sourceFileName ?? source.sourceFilePath ?? "entrada.xlsx",
    });

    return {
      delimiter: ";",
      headers,
      ingestionBatch,
      rowLineNumbers,
      rows,
    };
  }

  if (typeof source.content !== "string") {
    throw new Error("Entrada CSV precisa ser texto UTF-8.");
  }

  const { delimiter, headers, rowLineNumbers, rows } = readCsv(source.content);
  const ingestionBatch = ingestFiscalCsv(source.content, {
    ...(options.cnpjColumn ? { cnpjColumn: options.cnpjColumn } : {}),
    format: FISCAL_INGESTION_INPUT_FORMAT.CSV,
    sourceKind: source.sourceFilePath
      ? FISCAL_INGESTION_SOURCE_KIND.LOCAL_FILE
      : FISCAL_INGESTION_SOURCE_KIND.TEXT_BUFFER,
    sourceLabel:
      source.sourceFileName ?? source.sourceFilePath ?? "entrada.csv",
  });

  return {
    delimiter,
    headers,
    ingestionBatch,
    rowLineNumbers,
    rows,
  };
}

function normalizeProcessInput(input: ProcessCsvSourceInput): {
  content: string | Buffer | ArrayBuffer | Uint8Array | number[];
  format: ProcessCsvInputFormat;
  sourceFileName?: string;
  sourceFilePath?: string;
} {
  if (typeof input === "string") {
    return {
      content: input,
      format: PROCESS_CSV_INPUT_FORMAT.CSV,
    };
  }

  return {
    content: input.content,
    format: input.format ?? PROCESS_CSV_INPUT_FORMAT.CSV,
    ...(input.sourceFileName ? { sourceFileName: input.sourceFileName } : {}),
    ...(input.sourceFilePath ? { sourceFilePath: input.sourceFilePath } : {}),
  };
}

function normalizeBinaryInput(
  input: string | Buffer | ArrayBuffer | Uint8Array | number[],
): Buffer | ArrayBuffer | Uint8Array {
  if (typeof input === "string") {
    throw new Error("Entrada XLSX precisa ser binaria.");
  }

  if (Array.isArray(input)) {
    return Uint8Array.from(input);
  }

  return input;
}

function toCsvValue(value: boolean | null): string {
  if (value === null) {
    return "";
  }

  return String(value);
}

function formatOutputMessage(
  lookupResult: SimplesLookupResult,
  ingestionIssue?: FiscalIngestionIssue,
): string {
  const lookupMessage = lookupResult.message?.trim() ?? "";

  if (ingestionIssue?.kind === FISCAL_INGESTION_ISSUE_KIND.DUPLICATE_CNPJ) {
    if (lookupMessage) {
      return `${ingestionIssue.message} Resultado reaproveitado: ${lookupMessage}`;
    }

    return ingestionIssue.message;
  }

  return lookupMessage || ingestionIssue?.message || "";
}

function isCancellationBoundary(signal?: AbortSignal): boolean {
  return signal?.aborted === true;
}

async function restoreLookupCache(
  uniqueValidCnpjs: string[],
  executionLedger?: ProcessExecutionLedgerSession,
): Promise<Map<string, SimplesLookupResult>> {
  const lookupCache = new Map<string, SimplesLookupResult>();

  if (!executionLedger) {
    return lookupCache;
  }

  for (const cnpj of uniqueValidCnpjs) {
    const restored = await executionLedger.restoreLookup(cnpj);

    if (restored && isReusableCheckpointResult(restored)) {
      lookupCache.set(cnpj, restored);
    }
  }

  return lookupCache;
}

function isReusableCheckpointResult(result: SimplesLookupResult): boolean {
  return CHECKPOINT_REUSABLE_STATUSES.has(result.status);
}

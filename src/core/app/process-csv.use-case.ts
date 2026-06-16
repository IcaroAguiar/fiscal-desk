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
  maxConcurrentLookups?: number;
  onLookupProgress?: (progress: LookupProgress) => void;
  requestGlobalStop?: (status: SimplesLookupResult["status"]) => void;
  signal?: AbortSignal;
  stopOnLookupStatuses?: readonly SimplesLookupResult["status"][];
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
  let runStatus: ProcessCsvRunStatus = "SUCCESS";
  const startedAt = Date.now();

  const lookupQueueResult = await runMissingLookups({
    completedUniqueLookups,
    lookupCache,
    options,
    provider,
    startedAt,
    uniqueValidCnpjs,
  });
  completedUniqueLookups = lookupQueueResult.completedUniqueLookups;
  runStatus = lookupQueueResult.runStatus;

  let totalCnpjsEncontrados = 0;
  let totalCnpjsValidos = 0;
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
    runStatus = markCancelledIfRequested(runStatus, options.signal);

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
    } else {
      lookupResult = lookupCache.get(cnpjNormalizado) ?? {
        cnpj: cnpjNormalizado,
        simplesNacional: null,
        simei: null,
        source: "system",
        status: "CANCELLED",
        message: "Processamento cancelado antes desta consulta",
      };
    }

    outputRows.push({
      ...row,
      cnpj_original: cnpjOriginal,
      cnpj_normalizado: cnpjNormalizado,
      cnpj_valido: formatBooleanForUser(cnpjValido),
      simples_nacional: formatNullableBooleanForUser(
        lookupResult.simplesNacional,
      ),
      simei: formatNullableBooleanForUser(lookupResult.simei),
      status: lookupResult.status,
      fonte: lookupResult.source,
      mensagem: formatOutputMessage(lookupResult, ingestionIssue),
      linha: String(rowNumber),
    });
  }

  const totalOptantesSimples = outputRows.filter(
    (row) => row.simples_nacional === "Sim",
  ).length;
  const totalNaoOptantesSimples = outputRows.filter(
    (row) => row.simples_nacional === "Não",
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
  runStatus = markCancelledIfRequested(runStatus, options.signal);
  const outputCsv = writeCsv(outputRows, delimiter, outputColumns);
  runStatus = markCancelledIfRequested(runStatus, options.signal);
  const outputXlsx =
    delivery.format === "xlsx"
      ? await writeXlsxWorkbook({
          columns: outputColumns,
          rows: outputRows,
          summary,
        })
      : null;
  runStatus = markCancelledIfRequested(runStatus, options.signal);

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

function formatBooleanForUser(value: boolean): string {
  return value ? "Sim" : "Não";
}

function formatNullableBooleanForUser(value: boolean | null): string {
  if (value === null) {
    return "";
  }

  return formatBooleanForUser(value);
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

function markCancelledIfRequested(
  currentStatus: ProcessCsvRunStatus,
  signal?: AbortSignal,
): ProcessCsvRunStatus {
  return isCancellationBoundary(signal) ? "CANCELLED" : currentStatus;
}

async function runMissingLookups(input: {
  completedUniqueLookups: number;
  lookupCache: Map<string, SimplesLookupResult>;
  options: ProcessCsvOptions;
  provider: SimplesLookupPort;
  startedAt: number;
  uniqueValidCnpjs: string[];
}): Promise<{
  completedUniqueLookups: number;
  runStatus: ProcessCsvRunStatus;
}> {
  const pendingCnpjs = input.uniqueValidCnpjs.filter(
    (cnpj) => !input.lookupCache.has(cnpj),
  );
  const concurrency = normalizeMaxConcurrentLookups(
    input.options.maxConcurrentLookups,
  );
  let nextIndex = 0;
  let completedUniqueLookups = input.completedUniqueLookups;
  let runStatus: ProcessCsvRunStatus = isCancellationBoundary(
    input.options.signal,
  )
    ? "CANCELLED"
    : "SUCCESS";
  let saveLookupChain = Promise.resolve();
  let firstWorkerError: unknown = null;
  const stopOnLookupStatuses = new Set(
    input.options.stopOnLookupStatuses ?? [],
  );

  const shouldStop = (): boolean =>
    runStatus !== "SUCCESS" || firstWorkerError !== null;

  const stopOnError = (error: unknown): void => {
    firstWorkerError ??= error;
  };

  const saveLookup = async (
    lookupResult: SimplesLookupResult,
  ): Promise<void> => {
    if (!isReusableCheckpointResult(lookupResult)) {
      return;
    }

    saveLookupChain = saveLookupChain.then(() =>
      input.options.executionLedger?.saveLookup(lookupResult),
    );
    await saveLookupChain;
  };

  const runWorker = async (): Promise<void> => {
    while (!shouldStop() && nextIndex < pendingCnpjs.length) {
      if (isCancellationBoundary(input.options.signal)) {
        runStatus = "CANCELLED";
        return;
      }

      const cnpj = pendingCnpjs[nextIndex];
      nextIndex += 1;

      if (!cnpj) {
        continue;
      }

      let lookupResult: SimplesLookupResult;
      try {
        lookupResult = await input.provider.lookup(
          cnpj,
          input.options.signal ? { signal: input.options.signal } : undefined,
        );
      } catch (error) {
        if (error instanceof AbortError) {
          runStatus = "CANCELLED";
          return;
        }

        stopOnError(error);
        return;
      }

      if (shouldStop()) {
        return;
      }

      if (lookupResult.status === "CANCELLED") {
        runStatus = "CANCELLED";
        return;
      }

      input.lookupCache.set(cnpj, lookupResult);
      try {
        await saveLookup(lookupResult);
      } catch (error) {
        stopOnError(error);
        return;
      }

      if (shouldStop()) {
        return;
      }

      completedUniqueLookups += 1;
      const elapsedMs = Date.now() - input.startedAt;
      input.options.onLookupProgress?.({
        completedUniqueLookups,
        totalUniqueLookups: input.uniqueValidCnpjs.length,
        currentCnpj: maskCnpjForProgress(cnpj),
        elapsedMs,
        estimatedRemainingMs: estimateObservedRemainingMs(
          elapsedMs,
          completedUniqueLookups,
          input.uniqueValidCnpjs.length,
        ),
      });

      if (stopOnLookupStatuses.has(lookupResult.status)) {
        runStatus = "CANCELLED";
        input.options.requestGlobalStop?.(lookupResult.status);
        return;
      }
    }
  };

  const workers = Array.from(
    { length: Math.min(concurrency, pendingCnpjs.length) },
    () => runWorker(),
  );
  await Promise.allSettled(workers);
  try {
    await saveLookupChain;
  } catch (error) {
    stopOnError(error);
  }

  if (firstWorkerError) {
    throw firstWorkerError;
  }

  return {
    completedUniqueLookups,
    runStatus,
  };
}

function maskCnpjForProgress(cnpj: string): string {
  const normalized = cnpj.replace(/\D/g, "");

  if (normalized.length !== 14) {
    return "***";
  }

  return `${normalized.slice(0, 2)}********${normalized.slice(-4)}`;
}

function normalizeMaxConcurrentLookups(value: number | undefined): number {
  if (value === undefined || !Number.isFinite(value)) {
    return 1;
  }

  return Math.max(1, Math.min(12, Math.floor(value)));
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

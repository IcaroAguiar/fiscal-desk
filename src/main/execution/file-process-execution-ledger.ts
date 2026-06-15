import { createHash, randomUUID } from "node:crypto";
import { mkdir, readdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type {
  ProcessCsvExecutionStatus,
  ProcessCsvInputFormat,
  ProcessCsvSummary,
  ProcessExecutionHistoryItem,
} from "../../core/app/process-csv.types";
import { PROCESS_CSV_INPUT_FORMAT } from "../../core/app/process-csv.types";
import type { SimplesLookupResult } from "../../core/simples/simples-lookup.types";
import type { SimplesProviderName } from "../../core/simples/simples-provider.names";
import { FileProcessExecutionSession } from "./file-process-execution-ledger-session";

export { FileProcessExecutionSession } from "./file-process-execution-ledger-session";

const LEDGER_VERSION = 1;
const CHECKPOINT_POLICY_VERSION = "stable-results-v1";
const CNPJ_NORMALIZER_VERSION = "normalize-cnpj-v1";
const CSV_PARSER_VERSION = "csv-reader-v1";
const XLSX_PARSER_VERSION = "xlsx-reader-v1";
const DEFAULT_PROVIDER_CONFIG_VERSION = "provider-config-v1";
const INPUT_FINGERPRINT_ALGORITHM = "sha256";
const RESUMABLE_STATUSES = new Set<ProcessCsvExecutionStatus>([
  "RUNNING",
  "CANCELLED",
  "FAILED",
]);
const REUSABLE_CHECKPOINT_STATUSES: SimplesLookupResult["status"][] = [
  "SUCCESS",
  "NOT_FOUND",
  "PERMANENT_ERROR",
];
const DEFAULT_HISTORY_LIMIT = 10;
const TEXT_ENCODING = "utf8";

type LedgerLogger = {
  warn(message: string, metadata: Record<string, unknown>): void;
};

type LookupCheckpoint = {
  completedAt: string;
  result: SimplesLookupResult;
};

type LedgerOperationalMetadata = {
  checkpointPolicy: {
    reusableStatuses: SimplesLookupResult["status"][];
    version: string;
  };
  cnpjColumn: string | null;
  cnpjNormalizerVersion: string;
  csvParserVersion: string;
  elapsedMs: number | null;
  inputFormat: ProcessCsvInputFormat;
  ledgerVersion: typeof LEDGER_VERSION;
  provider: {
    configVersion: string;
    name: SimplesProviderName;
  };
};

export type LedgerDocument = {
  version: typeof LEDGER_VERSION;
  runId: string;
  inputFingerprint: string;
  providerName: SimplesProviderName;
  sourceFilePath: string | null;
  status: ProcessCsvExecutionStatus;
  startedAt: string;
  updatedAt: string;
  completedAt: string | null;
  totalUniqueLookups: number;
  outputPath: string | null;
  summary: ProcessCsvSummary | null;
  operationalMetadata: LedgerOperationalMetadata;
  checkpoints: Record<string, LookupCheckpoint>;
};

export type StartProcessExecutionInput = {
  cnpjColumn?: string;
  inputContent?: string | Uint8Array | number[];
  inputCsv?: string;
  inputFormat?: ProcessCsvInputFormat;
  providerName: SimplesProviderName;
  providerConfigVersion?: string;
  sourceFilePath?: string;
};

export type FinishProcessExecutionInput = {
  status: Exclude<ProcessCsvExecutionStatus, "RUNNING">;
  outputPath: string | null;
  summary: ProcessCsvSummary | null;
};

export type ListProcessExecutionsOptions = {
  limit?: number;
};

export class FileProcessExecutionLedger {
  constructor(
    private readonly directory: string,
    private readonly logger: LedgerLogger = console,
  ) {}

  async startRun(
    input: StartProcessExecutionInput,
  ): Promise<FileProcessExecutionSession> {
    await mkdir(this.directory, { recursive: true });

    const inputFingerprint = createInputFingerprint(input);
    const ledgerPath = this.resolveLedgerPath(
      input.providerName,
      inputFingerprint,
    );
    const previous = await readLedgerDocument(ledgerPath, this.logger);
    const now = new Date().toISOString();
    const reusableCheckpoints =
      previous &&
      previous.providerName === input.providerName &&
      previous.inputFingerprint === inputFingerprint &&
      RESUMABLE_STATUSES.has(previous.status)
        ? toSafeLookupCheckpoints(previous.checkpoints)
        : {};
    const document: LedgerDocument = {
      version: LEDGER_VERSION,
      runId: randomUUID(),
      inputFingerprint,
      providerName: input.providerName,
      sourceFilePath: input.sourceFilePath ?? null,
      status: "RUNNING",
      startedAt: now,
      updatedAt: now,
      completedAt: null,
      totalUniqueLookups: 0,
      outputPath: null,
      summary: null,
      operationalMetadata: createOperationalMetadata(input, null),
      checkpoints: reusableCheckpoints,
    };

    await writeLedgerDocument(ledgerPath, document);

    return new FileProcessExecutionSession(ledgerPath, document);
  }

  async listRuns(
    options: ListProcessExecutionsOptions = {},
  ): Promise<ProcessExecutionHistoryItem[]> {
    await mkdir(this.directory, { recursive: true });

    const fileNames = await readdir(this.directory);
    const items = await Promise.all(
      fileNames
        .filter((fileName) => isSafeLedgerKey(fileName))
        .map((fileName) => this.readHistoryItem(fileName)),
    );
    const limit = Math.max(1, options.limit ?? DEFAULT_HISTORY_LIMIT);

    return items
      .filter((item): item is ProcessExecutionHistoryItem => item !== null)
      .sort((first, second) => second.updatedAt.localeCompare(first.updatedAt))
      .slice(0, limit);
  }

  async getRun(ledgerKey: string): Promise<ProcessExecutionHistoryItem | null> {
    return this.readHistoryItem(ledgerKey);
  }

  async getCheckpointedCnpjs(ledgerKey: string): Promise<Set<string>> {
    const ledgerPath = this.resolveLedgerPathByKey(ledgerKey);
    const document = await readLedgerDocument(ledgerPath, this.logger);

    if (!document) {
      throw new Error("Execução não encontrada no histórico local.");
    }

    return new Set(Object.keys(toSafeLookupCheckpoints(document.checkpoints)));
  }

  private async readHistoryItem(
    ledgerKey: string,
  ): Promise<ProcessExecutionHistoryItem | null> {
    const ledgerPath = this.resolveLedgerPathByKey(ledgerKey);
    const document = await readLedgerDocument(ledgerPath, this.logger);

    return document ? toHistoryItem(ledgerKey, ledgerPath, document) : null;
  }

  private resolveLedgerPath(
    providerName: SimplesProviderName,
    inputFingerprint: string,
  ): string {
    return path.join(
      this.directory,
      `${providerName}-${inputFingerprint.slice(0, 24)}.json`,
    );
  }

  private resolveLedgerPathByKey(ledgerKey: string): string {
    if (!isSafeLedgerKey(ledgerKey)) {
      throw new Error("Identificador de ledger invalido.");
    }

    return path.join(this.directory, ledgerKey);
  }
}

export function createInputFingerprint(
  input: StartProcessExecutionInput,
): string {
  const inputFormat = normalizeInputFormat(input.inputFormat);
  const parserVersion = resolveParserVersion(inputFormat);
  return createHash(INPUT_FINGERPRINT_ALGORITHM)
    .update(
      JSON.stringify({
        checkpointPolicyVersion: CHECKPOINT_POLICY_VERSION,
        cnpjColumn: normalizeOptionalText(input.cnpjColumn),
        cnpjNormalizerVersion: CNPJ_NORMALIZER_VERSION,
        csvParserVersion: parserVersion,
        inputContentHash: createInputContentHash(
          input.inputContent ?? input.inputCsv ?? "",
        ),
        inputFormat,
        ledgerVersion: LEDGER_VERSION,
        providerConfigVersion:
          input.providerConfigVersion ?? DEFAULT_PROVIDER_CONFIG_VERSION,
        providerName: input.providerName,
      }),
    )
    .digest("hex");
}

async function readLedgerDocument(
  ledgerPath: string,
  logger: LedgerLogger,
): Promise<LedgerDocument | null> {
  try {
    const raw = await readFile(ledgerPath, TEXT_ENCODING);
    const parsed = JSON.parse(raw) as unknown;

    if (!isLedgerDocument(parsed)) {
      logger.warn("[csv] ledger local invalido descartado", {
        ledgerKey: path.basename(ledgerPath),
        reason: "incompatible_structure",
      });
      return null;
    }

    return parsed;
  } catch (error) {
    if (isNoEntryError(error)) {
      return null;
    }

    logger.warn("[csv] ledger local invalido descartado", {
      ledgerKey: path.basename(ledgerPath),
      reason: toSafeLedgerReadFailureReason(error),
    });
    return null;
  }
}

export async function writeLedgerDocument(
  ledgerPath: string,
  document: LedgerDocument,
): Promise<void> {
  const tempPath = `${ledgerPath}.${process.pid}.tmp`;
  await writeFile(
    tempPath,
    `${JSON.stringify(document, null, 2)}\n`,
    TEXT_ENCODING,
  );
  await rename(tempPath, ledgerPath);
}

function createOperationalMetadata(
  input: StartProcessExecutionInput,
  elapsedMs: number | null,
): LedgerOperationalMetadata {
  return {
    checkpointPolicy: {
      reusableStatuses: REUSABLE_CHECKPOINT_STATUSES,
      version: CHECKPOINT_POLICY_VERSION,
    },
    cnpjColumn: normalizeOptionalText(input.cnpjColumn),
    cnpjNormalizerVersion: CNPJ_NORMALIZER_VERSION,
    csvParserVersion: resolveParserVersion(
      normalizeInputFormat(input.inputFormat),
    ),
    elapsedMs,
    inputFormat: normalizeInputFormat(input.inputFormat),
    ledgerVersion: LEDGER_VERSION,
    provider: {
      configVersion:
        input.providerConfigVersion ?? DEFAULT_PROVIDER_CONFIG_VERSION,
      name: input.providerName,
    },
  };
}

function normalizeInputFormat(
  value: ProcessCsvInputFormat | undefined,
): ProcessCsvInputFormat {
  return value === PROCESS_CSV_INPUT_FORMAT.XLSX
    ? PROCESS_CSV_INPUT_FORMAT.XLSX
    : PROCESS_CSV_INPUT_FORMAT.CSV;
}

function resolveParserVersion(inputFormat: ProcessCsvInputFormat) {
  return inputFormat === PROCESS_CSV_INPUT_FORMAT.XLSX
    ? XLSX_PARSER_VERSION
    : CSV_PARSER_VERSION;
}

function createInputContentHash(input: string | Uint8Array | number[]): string {
  const hash = createHash(INPUT_FINGERPRINT_ALGORITHM);

  if (typeof input === "string") {
    hash.update(input, TEXT_ENCODING);
    return hash.digest("hex");
  }

  hash.update(Buffer.from(input));
  return hash.digest("hex");
}

function normalizeOptionalText(value: string | undefined): string | null {
  const normalized = value?.trim();

  return normalized ? normalized : null;
}

export function toSafeLookupCheckpointResult(
  result: unknown,
): SimplesLookupResult | null {
  if (!isSafeReusableLookupResult(result)) {
    return null;
  }

  return {
    cnpj: result.cnpj,
    simplesNacional: result.simplesNacional,
    simei: result.simei,
    source: result.source,
    status: result.status,
  };
}

function toSafeLookupCheckpoints(
  checkpoints: Record<string, LookupCheckpoint>,
): Record<string, LookupCheckpoint> {
  const safeCheckpoints: Record<string, LookupCheckpoint> = {};

  for (const [checkpointKey, checkpoint] of Object.entries(checkpoints)) {
    if (!isLookupCheckpoint(checkpoint)) {
      continue;
    }

    const checkpointResult = toSafeLookupCheckpointResult(checkpoint.result);

    if (!checkpointResult || checkpointResult.cnpj !== checkpointKey) {
      continue;
    }

    safeCheckpoints[checkpointKey] = {
      completedAt: checkpoint.completedAt,
      result: checkpointResult,
    };
  }

  return safeCheckpoints;
}

function isSafeReusableLookupResult(
  result: unknown,
): result is SimplesLookupResult {
  if (!result || typeof result !== "object") {
    return false;
  }

  const candidate = result as Partial<SimplesLookupResult>;

  return (
    typeof candidate.cnpj === "string" &&
    /^\d{14}$/.test(candidate.cnpj) &&
    typeof candidate.source === "string" &&
    isReusableCheckpointStatus(candidate.status) &&
    (typeof candidate.simplesNacional === "boolean" ||
      candidate.simplesNacional === null) &&
    (typeof candidate.simei === "boolean" || candidate.simei === null)
  );
}

function isLookupCheckpoint(value: unknown): value is LookupCheckpoint {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<LookupCheckpoint>;

  return typeof candidate.completedAt === "string" && "result" in candidate;
}

function isReusableCheckpointStatus(
  value: unknown,
): value is SimplesLookupResult["status"] {
  return (
    typeof value === "string" &&
    REUSABLE_CHECKPOINT_STATUSES.includes(
      value as SimplesLookupResult["status"],
    )
  );
}

function toSafeLedgerReadFailureReason(error: unknown): string {
  if (error instanceof SyntaxError) {
    return "invalid_json";
  }

  if (isNodeErrorWithCode(error)) {
    return `read_failed_${error.code.toLowerCase()}`;
  }

  return "read_failed";
}

function toHistoryItem(
  ledgerKey: string,
  checkpointPath: string,
  document: LedgerDocument,
): ProcessExecutionHistoryItem {
  const sourceFileName = document.sourceFilePath
    ? path.basename(document.sourceFilePath)
    : null;
  const canResume = RESUMABLE_STATUSES.has(document.status);
  const checkpointedUniqueLookups = Object.keys(document.checkpoints).length;
  const pendingUniqueLookups = Math.max(
    0,
    document.totalUniqueLookups - checkpointedUniqueLookups,
  );
  const canExportPending =
    (document.status === "CANCELLED" || document.status === "FAILED") &&
    pendingUniqueLookups > 0 &&
    Boolean(document.sourceFilePath);
  const hasPartialOutput =
    document.status === "CANCELLED" && Boolean(document.outputPath);

  return {
    ledgerKey,
    runId: document.runId,
    status: document.status,
    inputFormat:
      document.operationalMetadata.inputFormat ?? PROCESS_CSV_INPUT_FORMAT.CSV,
    providerName: document.providerName,
    providerConfigVersion: document.operationalMetadata.provider.configVersion,
    sourceFilePath: document.sourceFilePath,
    sourceFileName,
    outputPath: document.outputPath,
    checkpointPath,
    startedAt: document.startedAt,
    updatedAt: document.updatedAt,
    completedAt: document.completedAt,
    cnpjColumn: document.operationalMetadata.cnpjColumn,
    totalUniqueLookups: document.totalUniqueLookups,
    checkpointedUniqueLookups,
    pendingUniqueLookups,
    summary: document.summary,
    canResume,
    canExportPending,
    hasPartialOutput,
    resumeBlockedReason: canResume
      ? null
      : "Execucoes concluidas com sucesso ficam apenas no historico.",
  };
}

function isSafeLedgerKey(value: string): boolean {
  return (
    path.basename(value) === value &&
    /^[a-z0-9-]+-[a-f0-9]{24}\.json$/.test(value)
  );
}

function isLedgerDocument(value: unknown): value is LedgerDocument {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<LedgerDocument>;

  return (
    candidate.version === LEDGER_VERSION &&
    typeof candidate.runId === "string" &&
    typeof candidate.inputFingerprint === "string" &&
    typeof candidate.providerName === "string" &&
    typeof candidate.status === "string" &&
    typeof candidate.startedAt === "string" &&
    typeof candidate.updatedAt === "string" &&
    typeof candidate.totalUniqueLookups === "number" &&
    Boolean(candidate.operationalMetadata) &&
    Boolean(candidate.checkpoints) &&
    typeof candidate.checkpoints === "object"
  );
}

function isNoEntryError(error: unknown): boolean {
  return (
    error !== null &&
    typeof error === "object" &&
    "code" in error &&
    error.code === "ENOENT"
  );
}

function isNodeErrorWithCode(error: unknown): error is { code: string } {
  return (
    error !== null &&
    typeof error === "object" &&
    "code" in error &&
    typeof error.code === "string"
  );
}

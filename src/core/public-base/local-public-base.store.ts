import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { validateCnpj } from "../cnpj/validate-cnpj";
import {
  createLocalPublicBaseIndexFromRecords,
  createLocalPublicBaseStatus,
  prepareLocalPublicBaseFromCsv,
} from "./local-public-base.index";
import { prepareLocalPublicBaseFromOfficialSimplesZip } from "./local-public-base.official-zip";
import type {
  LocalPublicBasePrepareInput,
  LocalPublicBasePrepareOfficialZipInput,
  LocalPublicBasePrepareResult,
  LocalPublicBaseRecord,
  LocalPublicBaseStatus,
} from "./local-public-base.types";

const INDEX_VERSION = 1;
const INDEX_FILE_NAME = "local-public-base-index.json";
const TEXT_ENCODING = "utf8";

type LocalPublicBaseIndexDocument = {
  version: typeof INDEX_VERSION;
  state: Exclude<LocalPublicBaseStatus["state"], "not-prepared">;
  sourceFileName: string;
  sourceFilePath: string;
  preparedAt: string;
  baseDate: string | null;
  estimatedRows: number;
  preparedRows: number;
  rejectedRows: number;
  sourceSizeBytes: number;
  errorMessage: string | null;
  records: LocalPublicBaseRecord[];
};

type LocalPublicBaseLogger = {
  warn(message: string, metadata: Record<string, unknown>): void;
};

type LocalPublicBaseWarningReason =
  | "incompatible_index_document"
  | "invalid_json"
  | "read_failed";

export class LocalPublicBaseStore {
  constructor(
    private readonly directory: string,
    private readonly logger: LocalPublicBaseLogger = console,
  ) {}

  async getStatus(): Promise<LocalPublicBaseStatus> {
    const document = await this.readDocument();

    if (!document) {
      return createLocalPublicBaseStatus({
        baseDate: null,
        estimatedRows: 0,
        preparedAt: null,
        preparedRows: 0,
        rejectedRows: 0,
        sourceFileName: null,
        state: "not-prepared",
      });
    }

    return toStatus(document);
  }

  async loadIndex(): Promise<ReturnType<
    typeof createLocalPublicBaseIndexFromRecords
  > | null> {
    const document = await this.readDocument();

    return document?.state === "ready"
      ? createLocalPublicBaseIndexFromRecords(document.records)
      : null;
  }

  async loadPreparedBase(): Promise<{
    index: ReturnType<typeof createLocalPublicBaseIndexFromRecords>;
    status: LocalPublicBaseStatus;
  } | null> {
    const document = await this.readDocument();

    if (!document || document.state !== "ready") {
      return null;
    }

    return {
      index: createLocalPublicBaseIndexFromRecords(document.records),
      status: toStatus(document),
    };
  }

  async prepareFromCsv(
    input: LocalPublicBasePrepareInput,
  ): Promise<LocalPublicBasePrepareResult> {
    const sourceSizeBytes = await resolveSourceSize(input);
    const prepared = prepareLocalPublicBaseFromCsv(input);

    await mkdir(this.directory, { recursive: true });

    const document: LocalPublicBaseIndexDocument = {
      version: INDEX_VERSION,
      state: prepared.records.length > 0 ? "ready" : "error",
      sourceFileName: input.sourceFileName,
      sourceFilePath: input.sourceFilePath,
      preparedAt: prepared.status.preparedAt ?? new Date().toISOString(),
      baseDate: prepared.status.baseDate,
      estimatedRows: prepared.status.estimatedRows,
      preparedRows: prepared.records.length,
      rejectedRows: prepared.rejectedRows,
      sourceSizeBytes,
      errorMessage:
        prepared.records.length > 0
          ? null
          : (prepared.status.errorMessage ??
            "Nenhum registro válido foi encontrado no CSV selecionado."),
      records: prepared.records,
    };

    await writeIndexDocument(this.indexPath, document);

    return {
      acceptedRows: document.preparedRows,
      rejectedRows: document.rejectedRows,
      status: toStatus(document),
    };
  }

  async prepareFromOfficialZip(
    input: LocalPublicBasePrepareOfficialZipInput,
  ): Promise<LocalPublicBasePrepareResult> {
    const prepared = await prepareLocalPublicBaseFromOfficialSimplesZip(input);

    await mkdir(this.directory, { recursive: true });

    const document: LocalPublicBaseIndexDocument = {
      version: INDEX_VERSION,
      state: prepared.records.length > 0 ? "ready" : "error",
      sourceFileName: input.source.fileName,
      sourceFilePath: input.zipFilePath,
      preparedAt: prepared.status.preparedAt ?? new Date().toISOString(),
      baseDate: prepared.status.baseDate,
      estimatedRows: prepared.status.estimatedRows,
      preparedRows: prepared.records.length,
      rejectedRows: prepared.rejectedRows,
      sourceSizeBytes: input.sourceSizeBytes,
      errorMessage:
        prepared.records.length > 0
          ? null
          : (prepared.status.errorMessage ??
            "Nenhum registro válido foi encontrado no Simples.zip oficial."),
      records: prepared.records,
    };

    await writeIndexDocument(this.indexPath, document);

    return {
      acceptedRows: document.preparedRows,
      rejectedRows: document.rejectedRows,
      status: toStatus(document),
    };
  }

  private get indexPath(): string {
    return path.join(this.directory, INDEX_FILE_NAME);
  }

  private async readDocument(): Promise<LocalPublicBaseIndexDocument | null> {
    let raw: string;

    try {
      raw = await readFile(this.indexPath, TEXT_ENCODING);
    } catch (error) {
      if (isNoEntryError(error)) {
        return null;
      }

      this.logger.warn("[base-publica-local] indice local indisponivel", {
        reason: classifyIndexReadFailure(error),
      });
      return null;
    }

    let parsed: unknown;

    try {
      parsed = JSON.parse(raw) as unknown;
    } catch {
      this.logger.warn("[base-publica-local] indice local descartado", {
        reason: "invalid_json",
      });
      return null;
    }

    if (!isIndexDocument(parsed)) {
      this.logger.warn("[base-publica-local] indice local descartado", {
        reason: "incompatible_index_document",
      });
      return null;
    }

    return parsed;
  }
}

function toStatus(
  document: LocalPublicBaseIndexDocument,
): LocalPublicBaseStatus {
  return createLocalPublicBaseStatus({
    baseDate: document.baseDate,
    errorMessage: document.errorMessage,
    estimatedRows: document.estimatedRows,
    preparedAt: document.preparedAt,
    preparedRows: document.preparedRows,
    rejectedRows: document.rejectedRows,
    sourceFileName: document.sourceFileName,
    sourceSizeBytes: document.sourceSizeBytes,
    state: document.state,
  });
}

async function resolveSourceSize(
  input: LocalPublicBasePrepareInput,
): Promise<number> {
  try {
    const sourceStat = await stat(input.sourceFilePath);

    return sourceStat.size;
  } catch {
    return new TextEncoder().encode(input.content).byteLength;
  }
}

async function writeIndexDocument(
  indexPath: string,
  document: LocalPublicBaseIndexDocument,
): Promise<void> {
  const tempPath = `${indexPath}.${process.pid}.${randomUUID()}.tmp`;
  await writeFile(
    tempPath,
    `${JSON.stringify(document, null, 2)}\n`,
    TEXT_ENCODING,
  );
  await rename(tempPath, indexPath);
}

function isIndexDocument(
  value: unknown,
): value is LocalPublicBaseIndexDocument {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<LocalPublicBaseIndexDocument>;

  return (
    candidate.version === INDEX_VERSION &&
    (candidate.state === "ready" || candidate.state === "error") &&
    typeof candidate.sourceFileName === "string" &&
    typeof candidate.sourceFilePath === "string" &&
    typeof candidate.preparedAt === "string" &&
    typeof candidate.estimatedRows === "number" &&
    typeof candidate.preparedRows === "number" &&
    typeof candidate.rejectedRows === "number" &&
    typeof candidate.sourceSizeBytes === "number" &&
    (typeof candidate.errorMessage === "string" ||
      candidate.errorMessage === null) &&
    Array.isArray(candidate.records) &&
    candidate.records.every(isLocalPublicBaseRecord) &&
    (candidate.state === "error" || candidate.records.length > 0)
  );
}

function isLocalPublicBaseRecord(
  value: unknown,
): value is LocalPublicBaseRecord {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<LocalPublicBaseRecord>;

  return (
    typeof candidate.cnpj === "string" &&
    validateCnpj(candidate.cnpj) &&
    (candidate.cnpjBasico === undefined ||
      (typeof candidate.cnpjBasico === "string" &&
        /^\d{8}$/.test(candidate.cnpjBasico))) &&
    typeof candidate.razaoSocial === "string" &&
    typeof candidate.simplesNacional === "boolean" &&
    typeof candidate.simei === "boolean" &&
    typeof candidate.updatedAt === "string"
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

function classifyIndexReadFailure(
  error: unknown,
): LocalPublicBaseWarningReason {
  if (
    error !== null &&
    typeof error === "object" &&
    "code" in error &&
    typeof error.code === "string"
  ) {
    return "read_failed";
  }

  return "read_failed";
}

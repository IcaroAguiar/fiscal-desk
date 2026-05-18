import { createHash, randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type {
  ProcessCsvExecutionStatus,
  ProcessCsvSummary,
} from "../../core/app/process-csv.types";
import type { ProcessExecutionLedgerSession } from "../../core/app/process-execution-ledger.port";
import type { SimplesLookupResult } from "../../core/simples/simples-lookup.types";
import type { SimplesProviderName } from "../../core/simples/simples-provider.factory";

const LEDGER_VERSION = 1;
const INPUT_FINGERPRINT_ALGORITHM = "sha256";
const RESUMABLE_STATUSES = new Set<ProcessCsvExecutionStatus>([
  "RUNNING",
  "CANCELLED",
  "FAILED",
]);
const TEXT_ENCODING = "utf8";

type LookupCheckpoint = {
  completedAt: string;
  result: SimplesLookupResult;
};

type LedgerDocument = {
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
  checkpoints: Record<string, LookupCheckpoint>;
};

export type StartProcessExecutionInput = {
  inputCsv: string;
  providerName: SimplesProviderName;
  sourceFilePath?: string;
};

export type FinishProcessExecutionInput = {
  status: Exclude<ProcessCsvExecutionStatus, "RUNNING">;
  outputPath: string | null;
  summary: ProcessCsvSummary | null;
};

export class FileProcessExecutionLedger {
  constructor(private readonly directory: string) {}

  async startRun(
    input: StartProcessExecutionInput,
  ): Promise<FileProcessExecutionSession> {
    await mkdir(this.directory, { recursive: true });

    const inputFingerprint = createInputFingerprint(input.inputCsv);
    const ledgerPath = this.resolveLedgerPath(
      input.providerName,
      inputFingerprint,
    );
    const previous = await readLedgerDocument(ledgerPath);
    const now = new Date().toISOString();
    const reusableCheckpoints =
      previous &&
      previous.providerName === input.providerName &&
      previous.inputFingerprint === inputFingerprint &&
      RESUMABLE_STATUSES.has(previous.status)
        ? previous.checkpoints
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
      checkpoints: reusableCheckpoints,
    };

    await writeLedgerDocument(ledgerPath, document);

    return new FileProcessExecutionSession(ledgerPath, document);
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
}

export class FileProcessExecutionSession
  implements ProcessExecutionLedgerSession
{
  constructor(
    private readonly ledgerPath: string,
    private document: LedgerDocument,
  ) {}

  get runId(): string {
    return this.document.runId;
  }

  get checkpointPath(): string {
    return this.ledgerPath;
  }

  async setTotalUniqueLookups(totalUniqueLookups: number): Promise<void> {
    this.document = {
      ...this.document,
      totalUniqueLookups,
      updatedAt: new Date().toISOString(),
    };
    await writeLedgerDocument(this.ledgerPath, this.document);
  }

  async restoreLookup(cnpj: string): Promise<SimplesLookupResult | null> {
    return this.document.checkpoints[cnpj]?.result ?? null;
  }

  async saveLookup(result: SimplesLookupResult): Promise<void> {
    this.document = {
      ...this.document,
      updatedAt: new Date().toISOString(),
      checkpoints: {
        ...this.document.checkpoints,
        [result.cnpj]: {
          completedAt: new Date().toISOString(),
          result,
        },
      },
    };
    await writeLedgerDocument(this.ledgerPath, this.document);
  }

  async finish(input: FinishProcessExecutionInput): Promise<void> {
    const now = new Date().toISOString();
    this.document = {
      ...this.document,
      status: input.status,
      outputPath: input.outputPath,
      summary: input.summary,
      updatedAt: now,
      completedAt: now,
    };
    await writeLedgerDocument(this.ledgerPath, this.document);
  }
}

export function createInputFingerprint(inputCsv: string): string {
  return createHash(INPUT_FINGERPRINT_ALGORITHM).update(inputCsv).digest("hex");
}

async function readLedgerDocument(
  ledgerPath: string,
): Promise<LedgerDocument | null> {
  try {
    const raw = await readFile(ledgerPath, TEXT_ENCODING);
    const parsed = JSON.parse(raw) as LedgerDocument;

    if (parsed.version !== LEDGER_VERSION) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

async function writeLedgerDocument(
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

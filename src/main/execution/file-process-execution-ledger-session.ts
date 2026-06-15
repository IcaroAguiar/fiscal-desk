import type { ProcessExecutionLedgerSession } from "../../core/app/process-execution-ledger.port";
import type { SimplesLookupResult } from "../../core/simples/simples-lookup.types";
import type {
  FinishProcessExecutionInput,
  LedgerDocument,
} from "./file-process-execution-ledger";
import {
  toSafeLookupCheckpointResult,
  writeLedgerDocument,
} from "./file-process-execution-ledger";

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
    const checkpoint = this.document.checkpoints[cnpj];

    if (!checkpoint) {
      return null;
    }

    return toSafeLookupCheckpointResult(checkpoint.result);
  }

  async saveLookup(result: SimplesLookupResult): Promise<void> {
    const checkpointResult = toSafeLookupCheckpointResult(result);
    if (!checkpointResult) {
      return;
    }

    this.document = {
      ...this.document,
      updatedAt: new Date().toISOString(),
      checkpoints: {
        ...this.document.checkpoints,
        [checkpointResult.cnpj]: {
          completedAt: new Date().toISOString(),
          result: checkpointResult,
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
      operationalMetadata: {
        ...this.document.operationalMetadata,
        elapsedMs: Math.max(
          0,
          Date.parse(now) - Date.parse(this.document.startedAt),
        ),
      },
    };
    await writeLedgerDocument(this.ledgerPath, this.document);
  }
}

import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { processCsv } from "../../src/core/app/process-csv.use-case";
import type { ProcessExecutionLedgerSession } from "../../src/core/app/process-execution-ledger.port";
import type {
  SimplesLookupOptions,
  SimplesLookupPort,
} from "../../src/core/simples/simples-lookup.port";
import type { SimplesLookupResult } from "../../src/core/simples/simples-lookup.types";

class InMemoryExecutionLedger implements ProcessExecutionLedgerSession {
  readonly runId = "ledger-test-run";
  readonly checkpointPath = join(tmpdir(), "ledger-test.json");
  totalUniqueLookups = 0;
  savedResults: SimplesLookupResult[] = [];

  constructor(
    private readonly checkpoints = new Map<string, SimplesLookupResult>(),
  ) {}

  async setTotalUniqueLookups(totalUniqueLookups: number): Promise<void> {
    this.totalUniqueLookups = totalUniqueLookups;
  }

  async restoreLookup(cnpj: string): Promise<SimplesLookupResult | null> {
    return this.checkpoints.get(cnpj) ?? null;
  }

  async saveLookup(result: SimplesLookupResult): Promise<void> {
    this.savedResults.push(result);
    this.checkpoints.set(result.cnpj, result);
  }
}

class CountingLookupAdapter implements SimplesLookupPort {
  lookups: string[] = [];

  constructor(
    private readonly responseForCnpj: (
      cnpj: string,
    ) => Omit<SimplesLookupResult, "cnpj"> = () => ({
      simplesNacional: false,
      simei: false,
      source: "mock",
      status: "SUCCESS",
    }),
  ) {}

  async lookup(cnpj: string, _options?: SimplesLookupOptions) {
    this.lookups.push(cnpj);
    const response = this.responseForCnpj(cnpj);

    return {
      cnpj,
      ...response,
    };
  }
}

describe("processCsv execution ledger resume", () => {
  it("restores checkpointed lookups and only calls the provider for missing CNPJs", async () => {
    const resumedResult: SimplesLookupResult = {
      cnpj: "00000000000191",
      simplesNacional: true,
      simei: false,
      source: "mock",
      status: "SUCCESS",
    };
    const ledger = new InMemoryExecutionLedger(
      new Map([[resumedResult.cnpj, resumedResult]]),
    );
    const provider = new CountingLookupAdapter();
    const csv = [
      "nome;cnpj",
      "Empresa A;00.000.000/0001-91",
      "Empresa B;12.345.678/0001-95",
      "Empresa A duplicada;00.000.000/0001-91",
    ].join("\n");

    const result = await processCsv(csv, provider, {
      executionLedger: ledger,
    });

    expect(ledger.totalUniqueLookups).toBe(2);
    expect(provider.lookups).toEqual(["12345678000195"]);
    expect(result.summary.totalCnpjsRetomados).toBe(1);
    expect(result.summary.totalCnpjsUnicosConsultados).toBe(2);
    expect(result.execution).toEqual({
      runId: "ledger-test-run",
      status: "SUCCESS",
      checkpointPath: ledger.checkpointPath,
      completedUniqueLookups: 2,
      totalUniqueLookups: 2,
      resumedUniqueLookups: 1,
    });
    expect(result.outputCsv).toContain(
      "Empresa A;00.000.000/0001-91;00.000.000/0001-91;00000000000191;true;true;false;SUCCESS;mock;;2",
    );
  });

  it("does not restore retryable checkpoint statuses from previous executions", async () => {
    const retryableResult: SimplesLookupResult = {
      cnpj: "00000000000191",
      simplesNacional: null,
      simei: null,
      source: "cnpja-open",
      status: "TEMPORARY_ERROR",
      message: "Erro temporario do provider",
    };
    const ledger = new InMemoryExecutionLedger(
      new Map([[retryableResult.cnpj, retryableResult]]),
    );
    const provider = new CountingLookupAdapter(() => ({
      simplesNacional: true,
      simei: false,
      source: "mock",
      status: "SUCCESS",
    }));
    const csv = ["nome;cnpj", "Empresa A;00.000.000/0001-91"].join("\n");

    const result = await processCsv(csv, provider, {
      executionLedger: ledger,
    });

    expect(provider.lookups).toEqual(["00000000000191"]);
    expect(result.summary.totalCnpjsRetomados).toBe(0);
    expect(result.outputCsv).toContain(";SUCCESS;mock;");
  });

  it("keeps retryable lookup results in the current run cache but does not checkpoint them", async () => {
    const ledger = new InMemoryExecutionLedger();
    const provider = new CountingLookupAdapter(() => ({
      simplesNacional: null,
      simei: null,
      source: "cnpja-open",
      status: "TEMPORARY_ERROR",
      message: "Erro temporario do provider",
    }));
    const csv = [
      "nome;cnpj",
      "Empresa A;00.000.000/0001-91",
      "Empresa A duplicada;00.000.000/0001-91",
    ].join("\n");

    const result = await processCsv(csv, provider, {
      executionLedger: ledger,
    });

    expect(provider.lookups).toEqual(["00000000000191"]);
    expect(ledger.savedResults).toEqual([]);
    expect(result.summary.totalCnpjsUnicosConsultados).toBe(1);
    expect(result.outputCsv).toContain(";TEMPORARY_ERROR;cnpja-open;");
  });
});

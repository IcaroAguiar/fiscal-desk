import { describe, expect, it } from "vitest";

import { processCsv } from "../../src/core/app/process-csv.use-case";
import type { ProcessExecutionLedgerSession } from "../../src/core/app/process-execution-ledger.port";
import { MockSimplesLookupAdapter } from "../../src/core/simples/adapters/mock-simples-lookup.adapter";
import type {
  SimplesLookupOptions,
  SimplesLookupPort,
} from "../../src/core/simples/simples-lookup.port";
import type { SimplesLookupResult } from "../../src/core/simples/simples-lookup.types";

class SlowConcurrentLookupAdapter implements SimplesLookupPort {
  activeLookups = 0;
  maxActiveLookups = 0;
  calls: string[] = [];

  async lookup(
    cnpj: string,
    _options?: SimplesLookupOptions,
  ): Promise<SimplesLookupResult> {
    this.calls.push(cnpj);
    this.activeLookups += 1;
    this.maxActiveLookups = Math.max(this.maxActiveLookups, this.activeLookups);
    await new Promise((resolve) => setTimeout(resolve, 10));
    this.activeLookups -= 1;

    return {
      cnpj,
      simplesNacional: true,
      simei: false,
      source: "fake",
      status: "SUCCESS",
    };
  }
}

class FailingConcurrentLookupAdapter implements SimplesLookupPort {
  calls: string[] = [];

  constructor(private readonly failingCnpj: string) {}

  async lookup(cnpj: string): Promise<SimplesLookupResult> {
    this.calls.push(cnpj);

    if (cnpj === this.failingCnpj) {
      await new Promise((resolve) => setTimeout(resolve, 1));
      throw new Error("provider failure");
    }

    await new Promise((resolve) => setTimeout(resolve, 20));

    return {
      cnpj,
      simplesNacional: true,
      simei: false,
      source: "fake",
      status: "SUCCESS",
    };
  }
}

class CaptchaStoppingLookupAdapter implements SimplesLookupPort {
  calls: string[] = [];

  constructor(
    private readonly blockingStatus: Extract<
      SimplesLookupResult["status"],
      "BLOCKED" | "CAPTCHA_REQUIRED"
    > = "CAPTCHA_REQUIRED",
  ) {}

  async lookup(
    cnpj: string,
    options?: SimplesLookupOptions,
  ): Promise<SimplesLookupResult> {
    this.calls.push(cnpj);

    if (this.calls.length === 1) {
      return {
        cnpj,
        simplesNacional: null,
        simei: null,
        source: "receita-web",
        status: this.blockingStatus,
        message:
          this.blockingStatus === "CAPTCHA_REQUIRED"
            ? "CAPTCHA exigido pelo portal."
            : "Portal bloqueou a consulta.",
      };
    }

    await new Promise<void>((resolve) => {
      if (options?.signal?.aborted) {
        resolve();
        return;
      }

      options?.signal?.addEventListener("abort", () => resolve(), {
        once: true,
      });
    });

    return {
      cnpj,
      simplesNacional: null,
      simei: null,
      source: "system",
      status: "CANCELLED",
      message: "Janela interrompida após CAPTCHA.",
    };
  }
}

class RecordingExecutionLedger implements ProcessExecutionLedgerSession {
  checkpointPath = "/tmp/fiscal-desk-progress-ledger.json";
  runId = "progress-test-run";
  savedResults: SimplesLookupResult[] = [];
  totalUniqueLookups = 0;

  async setTotalUniqueLookups(totalUniqueLookups: number): Promise<void> {
    this.totalUniqueLookups = totalUniqueLookups;
  }

  async restoreLookup(): Promise<SimplesLookupResult | null> {
    return null;
  }

  async saveLookup(result: SimplesLookupResult): Promise<void> {
    this.savedResults.push(result);
  }
}

describe("processCsv progress", () => {
  it("reports progress only for unique valid lookups", async () => {
    const csv = [
      "nome;cpf_cnpj",
      "Empresa A;00.000.000/0001-91",
      "Empresa B;00.000.000/0001-91",
      "Empresa C;12.345.678/0001-95",
      "Empresa D;123",
    ].join("\n");

    const progressEvents: Array<{
      completedUniqueLookups: number;
      totalUniqueLookups: number;
      currentCnpj: string;
      estimatedRemainingMs: number;
    }> = [];

    await processCsv(csv, new MockSimplesLookupAdapter(), {
      onLookupProgress(progress) {
        progressEvents.push(progress);
      },
    });

    expect(progressEvents).toHaveLength(2);
    expect(progressEvents[0]).toMatchObject({
      completedUniqueLookups: 1,
      totalUniqueLookups: 2,
      currentCnpj: "00********0191",
    });
    expect(progressEvents[1]).toMatchObject({
      completedUniqueLookups: 2,
      totalUniqueLookups: 2,
      currentCnpj: "12********0195",
      estimatedRemainingMs: 0,
    });
  });

  it("can run unique lookups with bounded concurrency while preserving output order", async () => {
    const csv = [
      "nome;cpf_cnpj",
      "Empresa A;11.222.333/0001-81",
      "Empresa B;03.426.484/0001-23",
      "Empresa C;61.741.631/0001-56",
    ].join("\n");
    const provider = new SlowConcurrentLookupAdapter();

    const result = await processCsv(csv, provider, {
      maxConcurrentLookups: 2,
    });

    expect(provider.calls).toHaveLength(3);
    expect(provider.maxActiveLookups).toBe(2);
    expect(result.summary.totalCnpjsUnicosConsultados).toBe(3);
    expect(result.outputCsv.indexOf("Empresa A")).toBeLessThan(
      result.outputCsv.indexOf("Empresa B"),
    );
    expect(result.outputCsv.indexOf("Empresa B")).toBeLessThan(
      result.outputCsv.indexOf("Empresa C"),
    );
  });

  it("waits for in-flight workers and suppresses progress/checkpoint side effects after a lookup error", async () => {
    const csv = [
      "nome;cpf_cnpj",
      "Empresa A;11.222.333/0001-81",
      "Empresa B;03.426.484/0001-23",
      "Empresa C;61.741.631/0001-56",
    ].join("\n");
    const provider = new FailingConcurrentLookupAdapter("03426484000123");
    const ledger = new RecordingExecutionLedger();
    const progressEvents: unknown[] = [];

    await expect(
      processCsv(csv, provider, {
        executionLedger: ledger,
        maxConcurrentLookups: 2,
        onLookupProgress(progress) {
          progressEvents.push(progress);
        },
      }),
    ).rejects.toThrow("provider failure");

    expect(provider.calls).toEqual(["11222333000181", "03426484000123"]);
    expect(ledger.savedResults).toEqual([]);
    expect(progressEvents).toEqual([]);
  });

  it.each([
    "CAPTCHA_REQUIRED",
    "BLOCKED",
  ] as const)("requests a global stop when an experimental assisted lookup returns %s", async (blockingStatus) => {
    const csv = [
      "nome;cpf_cnpj",
      "Empresa A;00.000.000/0001-91",
      "Empresa B;12.345.678/0001-95",
      "Empresa C;03.426.484/0001-23",
      "Empresa D;61.741.631/0001-56",
    ].join("\n");
    const provider = new CaptchaStoppingLookupAdapter(blockingStatus);
    const controller = new AbortController();
    const stoppedStatuses: SimplesLookupResult["status"][] = [];

    const result = await processCsv(csv, provider, {
      maxConcurrentLookups: 3,
      requestGlobalStop(status) {
        stoppedStatuses.push(status);
        controller.abort();
      },
      signal: controller.signal,
      stopOnLookupStatuses: ["CAPTCHA_REQUIRED", "BLOCKED"],
    });

    expect(stoppedStatuses).toEqual([blockingStatus]);
    expect(result.runStatus).toBe("CANCELLED");
    expect(provider.calls.length).toBeLessThan(4);
    expect(result.outputCsv).toContain(blockingStatus);
    expect(result.outputCsv).toContain("CANCELLED");
  });
});

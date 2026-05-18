import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it, vi } from "vitest";

import { FileProcessExecutionLedger } from "../../../src/main/execution/file-process-execution-ledger";
import type { ProcessCsvSummary } from "../../../src/main/types";

describe("FileProcessExecutionLedger", () => {
  it("reuses checkpoints from interrupted runs for the same input and provider", async () => {
    const directory = await mkdtemp(join(tmpdir(), "ledger-test-"));
    const ledger = new FileProcessExecutionLedger(directory);
    const inputCsv = "cnpj\n00.000.000/0001-91\n12.345.678/0001-95";
    const sourceFilePath = join(directory, "entrada.csv");

    const firstRun = await ledger.startRun({
      inputCsv,
      providerName: "mock",
      sourceFilePath,
    });
    await firstRun.setTotalUniqueLookups(2);
    await firstRun.saveLookup({
      cnpj: "00000000000191",
      simplesNacional: true,
      simei: false,
      source: "mock",
      status: "SUCCESS",
    });
    await firstRun.finish({
      status: "CANCELLED",
      outputPath: null,
      summary: null,
    });

    const secondRun = await ledger.startRun({
      inputCsv,
      providerName: "mock",
      sourceFilePath,
    });

    await expect(
      secondRun.restoreLookup("00000000000191"),
    ).resolves.toMatchObject({
      cnpj: "00000000000191",
      status: "SUCCESS",
    });
    expect(secondRun.runId).not.toBe(firstRun.runId);
  });

  it("does not reuse checkpoints from completed runs", async () => {
    const directory = await mkdtemp(join(tmpdir(), "ledger-test-"));
    const ledger = new FileProcessExecutionLedger(directory);
    const inputCsv = "cnpj\n00.000.000/0001-91";

    const firstRun = await ledger.startRun({
      inputCsv,
      providerName: "mock",
    });
    await firstRun.saveLookup({
      cnpj: "00000000000191",
      simplesNacional: true,
      simei: false,
      source: "mock",
      status: "SUCCESS",
    });
    await firstRun.finish({
      status: "SUCCESS",
      outputPath: null,
      summary: null,
    });

    const secondRun = await ledger.startRun({
      inputCsv,
      providerName: "mock",
    });

    await expect(secondRun.restoreLookup("00000000000191")).resolves.toBeNull();
  });

  it("uses the requested cnpj column in the execution fingerprint", async () => {
    const directory = await mkdtemp(join(tmpdir(), "ledger-test-"));
    const ledger = new FileProcessExecutionLedger(directory);
    const inputCsv = "cnpj_a;cnpj_b\n00.000.000/0001-91;12.345.678/0001-95";

    const firstRun = await ledger.startRun({
      cnpjColumn: "cnpj_a",
      inputCsv,
      providerName: "mock",
    });
    await firstRun.saveLookup({
      cnpj: "00000000000191",
      simplesNacional: true,
      simei: false,
      source: "mock",
      status: "SUCCESS",
    });
    await firstRun.finish({
      status: "CANCELLED",
      outputPath: null,
      summary: null,
    });

    const secondRun = await ledger.startRun({
      cnpjColumn: "cnpj_b",
      inputCsv,
      providerName: "mock",
    });

    await expect(secondRun.restoreLookup("00000000000191")).resolves.toBeNull();
    expect(secondRun.checkpointPath).not.toBe(firstRun.checkpointPath);
  });

  it("marks completed runs and writes summary metadata to the ledger file", async () => {
    const directory = await mkdtemp(join(tmpdir(), "ledger-test-"));
    const ledger = new FileProcessExecutionLedger(directory);
    const run = await ledger.startRun({
      inputCsv: "cnpj\n00.000.000/0001-91",
      providerName: "mock",
    });
    const outputPath = join(directory, "saida.csv");
    const summary: ProcessCsvSummary = {
      totalLinhas: 1,
      totalCnpjsEncontrados: 1,
      totalCnpjsValidos: 1,
      totalCnpjsUnicosConsultados: 1,
      totalCnpjsRetomados: 0,
      totalOptantesSimples: 1,
      totalNaoOptantesSimples: 0,
      totalErros: 0,
    };

    await run.finish({
      status: "SUCCESS",
      outputPath,
      summary,
    });

    const rawLedger = await readFile(run.checkpointPath, "utf8");
    const parsed = JSON.parse(rawLedger) as {
      operationalMetadata: {
        cnpjColumn: string | null;
        elapsedMs: number | null;
        provider: { configVersion: string; name: string };
      };
      status: string;
      outputPath: string;
      summary: ProcessCsvSummary;
    };

    expect(parsed.status).toBe("SUCCESS");
    expect(parsed.outputPath).toBe(outputPath);
    expect(parsed.summary.totalCnpjsUnicosConsultados).toBe(1);
    expect(parsed.operationalMetadata).toMatchObject({
      cnpjColumn: null,
      provider: { configVersion: "provider-config-v1", name: "mock" },
    });
    expect(parsed.operationalMetadata.elapsedMs).toEqual(expect.any(Number));
  });

  it("logs an actionable warning when a ledger file is corrupted", async () => {
    const directory = await mkdtemp(join(tmpdir(), "ledger-test-"));
    const inputCsv = "cnpj\n00.000.000/0001-91";
    const firstRun = await new FileProcessExecutionLedger(directory).startRun({
      inputCsv,
      providerName: "mock",
    });
    await writeFile(firstRun.checkpointPath, "{ invalid json", "utf8");

    const logger = { warn: vi.fn() };
    await new FileProcessExecutionLedger(directory, logger).startRun({
      inputCsv,
      providerName: "mock",
    });

    expect(logger.warn).toHaveBeenCalledWith(
      "[csv] ledger local invalido descartado",
      expect.objectContaining({
        checkpointPath: firstRun.checkpointPath,
        reason: expect.any(String),
      }),
    );
  });
});

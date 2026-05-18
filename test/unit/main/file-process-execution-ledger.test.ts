import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

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
      status: string;
      outputPath: string;
      summary: ProcessCsvSummary;
    };

    expect(parsed.status).toBe("SUCCESS");
    expect(parsed.outputPath).toBe(outputPath);
    expect(parsed.summary.totalCnpjsUnicosConsultados).toBe(1);
  });
});

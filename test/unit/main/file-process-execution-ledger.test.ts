import { createHash } from "node:crypto";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it, vi } from "vitest";

import {
  createInputFingerprint,
  FileProcessExecutionLedger,
} from "../../../src/main/execution/file-process-execution-ledger";
import {
  PROCESS_CSV_INPUT_FORMAT,
  type ProcessCsvSummary,
} from "../../../src/main/types";

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

  it("persists sanitized lookup checkpoints without provider raw payload", async () => {
    const directory = await mkdtemp(join(tmpdir(), "ledger-test-"));
    const ledger = new FileProcessExecutionLedger(directory);
    const inputCsv = "cnpj\n00.000.000/0001-91";

    const firstRun = await ledger.startRun({
      inputCsv,
      providerName: "base-publica-local",
    });
    await firstRun.saveLookup({
      cnpj: "00000000000191",
      message: "Base Pública Local 2026-01-01: Empresa Sensivel Ltda.",
      raw: {
        providerResponse: {
          cnpj: "00000000000191",
          razaoSocial: "Empresa Sensivel Ltda.",
        },
      },
      simplesNacional: true,
      simei: false,
      source: "base-publica-local",
      status: "SUCCESS",
    });
    await firstRun.finish({
      status: "CANCELLED",
      outputPath: null,
      summary: null,
    });

    const rawLedger = await readFile(firstRun.checkpointPath, "utf8");
    expect(rawLedger).not.toContain("raw");
    expect(rawLedger).not.toContain("providerResponse");
    expect(rawLedger).not.toContain("Empresa Sensivel Ltda.");
    expect(rawLedger).not.toContain("Base Pública Local");

    const secondRun = await ledger.startRun({
      inputCsv,
      providerName: "base-publica-local",
    });

    await expect(
      secondRun.restoreLookup("00000000000191"),
    ).resolves.toStrictEqual({
      cnpj: "00000000000191",
      simplesNacional: true,
      simei: false,
      source: "base-publica-local",
      status: "SUCCESS",
    });
  });

  it("sanitizes legacy checkpoints before reuse and rewrites unsafe payloads", async () => {
    const directory = await mkdtemp(join(tmpdir(), "ledger-test-"));
    const ledger = new FileProcessExecutionLedger(directory);
    const inputCsv = "cnpj\n00.000.000/0001-91\n12.345.678/0001-95";

    const firstRun = await ledger.startRun({
      inputCsv,
      providerName: "base-publica-local",
    });
    await firstRun.setTotalUniqueLookups(2);
    await firstRun.saveLookup({
      cnpj: "00000000000191",
      simplesNacional: true,
      simei: false,
      source: "base-publica-local",
      status: "SUCCESS",
    });
    await firstRun.finish({
      status: "CANCELLED",
      outputPath: null,
      summary: null,
    });

    const legacyDocument = JSON.parse(
      await readFile(firstRun.checkpointPath, "utf8"),
    ) as {
      checkpoints: Record<string, unknown>;
    };
    legacyDocument.checkpoints["00000000000191"] = {
      completedAt: new Date().toISOString(),
      result: {
        cnpj: "00000000000191",
        message: "Base Pública Local 2026-01-01: Empresa Legada S.A.",
        raw: {
          providerResponse: {
            cnpj: "00000000000191",
            razaoSocial: "Empresa Legada S.A.",
          },
        },
        simplesNacional: true,
        simei: false,
        source: "base-publica-local",
        status: "SUCCESS",
      },
    };
    legacyDocument.checkpoints["12345678000195"] = {
      completedAt: new Date().toISOString(),
      result: {
        cnpj: "12345678000195",
        raw: { providerResponse: { path: "/tmp/fiscal-desk/base.csv" } },
        simplesNacional: null,
        simei: null,
        source: "base-publica-local",
        status: "TEMPORARY_ERROR",
      },
    };
    legacyDocument.checkpoints["11111111111111"] = null;
    await writeFile(
      firstRun.checkpointPath,
      `${JSON.stringify(legacyDocument, null, 2)}\n`,
      "utf8",
    );

    const secondRun = await ledger.startRun({
      inputCsv,
      providerName: "base-publica-local",
    });

    await expect(
      secondRun.restoreLookup("00000000000191"),
    ).resolves.toStrictEqual({
      cnpj: "00000000000191",
      simplesNacional: true,
      simei: false,
      source: "base-publica-local",
      status: "SUCCESS",
    });
    await expect(secondRun.restoreLookup("12345678000195")).resolves.toBeNull();
    await expect(secondRun.restoreLookup("11111111111111")).resolves.toBeNull();

    const rewrittenLedger = await readFile(secondRun.checkpointPath, "utf8");
    expect(rewrittenLedger).not.toContain("raw");
    expect(rewrittenLedger).not.toContain("providerResponse");
    expect(rewrittenLedger).not.toContain("razaoSocial");
    expect(rewrittenLedger).not.toContain("Empresa Legada S.A.");
    expect(rewrittenLedger).not.toContain("/tmp/fiscal-desk/base.csv");
    expect(rewrittenLedger).not.toContain("TEMPORARY_ERROR");
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

  it("separates CSV and XLSX checkpoints in the execution fingerprint", async () => {
    const directory = await mkdtemp(join(tmpdir(), "ledger-test-"));
    const ledger = new FileProcessExecutionLedger(directory);
    const inputCsv = "cnpj\n00.000.000/0001-91";

    const csvRun = await ledger.startRun({
      inputContent: inputCsv,
      inputFormat: PROCESS_CSV_INPUT_FORMAT.CSV,
      providerName: "mock",
    });
    await csvRun.saveLookup({
      cnpj: "00000000000191",
      simplesNacional: true,
      simei: false,
      source: "mock",
      status: "SUCCESS",
    });
    await csvRun.finish({
      status: "CANCELLED",
      outputPath: null,
      summary: null,
    });

    const xlsxRun = await ledger.startRun({
      inputContent: new Uint8Array(Buffer.from(inputCsv, "utf8")),
      inputFormat: PROCESS_CSV_INPUT_FORMAT.XLSX,
      providerName: "mock",
    });

    await expect(xlsxRun.restoreLookup("00000000000191")).resolves.toBeNull();
    expect(xlsxRun.checkpointPath).not.toBe(csvRun.checkpointPath);
  });

  it("uses the effective XLSX parser version in the execution fingerprint", () => {
    const content = new Uint8Array(Buffer.from("cnpj\n00.000.000/0001-91"));
    const inputContentHash = createHash("sha256")
      .update(Buffer.from(content))
      .digest("hex");
    const fingerprintFor = (csvParserVersion: string) =>
      createHash("sha256")
        .update(
          JSON.stringify({
            checkpointPolicyVersion: "stable-results-v1",
            cnpjColumn: null,
            cnpjNormalizerVersion: "normalize-cnpj-v1",
            csvParserVersion,
            inputContentHash,
            inputFormat: "xlsx",
            ledgerVersion: 1,
            providerConfigVersion: "provider-config-v1",
            providerName: "mock",
          }),
        )
        .digest("hex");
    const fingerprint = createInputFingerprint({
      inputContent: content,
      inputFormat: PROCESS_CSV_INPUT_FORMAT.XLSX,
      providerName: "mock",
    });
    expect(fingerprint).toBe(fingerprintFor("xlsx-reader-v1"));
    expect(fingerprint).not.toBe(fingerprintFor("csv-reader-v1"));
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

  it("lists recent ledgers with resume eligibility and stable ledger keys", async () => {
    const directory = await mkdtemp(join(tmpdir(), "ledger-test-"));
    const ledger = new FileProcessExecutionLedger(directory);
    const sourceFilePath = join(directory, "entrada.csv");
    const interruptedRun = await ledger.startRun({
      cnpjColumn: "cnpj",
      inputCsv: "cnpj\n00.000.000/0001-91",
      providerName: "mock",
      sourceFilePath,
    });
    await interruptedRun.setTotalUniqueLookups(1);
    await interruptedRun.saveLookup({
      cnpj: "00000000000191",
      simplesNacional: true,
      simei: false,
      source: "mock",
      status: "SUCCESS",
    });
    await interruptedRun.finish({
      status: "CANCELLED",
      outputPath: null,
      summary: null,
    });

    const history = await ledger.listRuns();

    expect(history).toHaveLength(1);
    expect(history[0]).toMatchObject({
      canResume: true,
      checkpointPath: interruptedRun.checkpointPath,
      checkpointedUniqueLookups: 1,
      cnpjColumn: "cnpj",
      inputFormat: "csv",
      providerConfigVersion: "provider-config-v1",
      providerName: "mock",
      resumeBlockedReason: null,
      sourceFileName: "entrada.csv",
      sourceFilePath,
      status: "CANCELLED",
      totalUniqueLookups: 1,
    });
    expect(history[0]?.ledgerKey).toMatch(/^mock-[a-f0-9]{24}\.json$/);
  });

  it("marks successful ledgers as history-only instead of resumable", async () => {
    const directory = await mkdtemp(join(tmpdir(), "ledger-test-"));
    const ledger = new FileProcessExecutionLedger(directory);
    const run = await ledger.startRun({
      inputCsv: "cnpj\n00.000.000/0001-91",
      providerName: "mock",
    });
    await run.finish({
      status: "SUCCESS",
      outputPath: join(directory, "saida.csv"),
      summary: null,
    });

    const [history] = await ledger.listRuns();

    expect(history).toMatchObject({
      canResume: false,
      resumeBlockedReason:
        "Execucoes concluidas com sucesso ficam apenas no historico.",
      status: "SUCCESS",
    });
  });

  it("rejects unsafe ledger keys on direct lookup", async () => {
    const directory = await mkdtemp(join(tmpdir(), "ledger-test-"));
    const ledger = new FileProcessExecutionLedger(directory);

    await expect(ledger.getRun("../outside.json")).rejects.toThrow(
      "Identificador de ledger invalido.",
    );
  });

  it("ignores unrelated json files when listing execution history", async () => {
    const directory = await mkdtemp(join(tmpdir(), "ledger-test-"));
    await writeFile(join(directory, "notes.json"), "{}", "utf8");
    await writeFile(
      join(directory, "mock-not-a-fingerprint.json"),
      "{}",
      "utf8",
    );
    const ledger = new FileProcessExecutionLedger(directory);
    const run = await ledger.startRun({
      inputCsv: "cnpj\n00.000.000/0001-91",
      providerName: "mock",
    });
    await run.finish({
      status: "CANCELLED",
      outputPath: null,
      summary: null,
    });

    const history = await ledger.listRuns();

    expect(history).toHaveLength(1);
    expect(history[0]?.checkpointPath).toBe(run.checkpointPath);
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
        ledgerKey: expect.stringMatching(/^mock-[a-f0-9]{24}\.json$/),
        reason: "invalid_json",
      }),
    );
    expect(JSON.stringify(logger.warn.mock.calls)).not.toContain(directory);
    expect(JSON.stringify(logger.warn.mock.calls)).not.toContain(
      firstRun.checkpointPath,
    );
  });
});

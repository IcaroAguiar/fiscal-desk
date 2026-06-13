import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import {
  assertLocalPublicBasePreparationConsent,
  createLocalPublicBaseIndex,
  createLocalPublicBaseIndexFromRecords,
  getLocalPublicBaseStatus,
  prepareLocalPublicBaseFromCsv,
} from "../../src/core/public-base/local-public-base.index";
import { LocalPublicBaseStore } from "../../src/core/public-base/local-public-base.store";
import { LocalPublicBaseSimplesLookupAdapter } from "../../src/core/simples/adapters/local-public-base-simples-lookup.adapter";

const tempDirs: string[] = [];
const fixturePath = resolve("test/fixtures/smoke/base-publica-local.csv");
const localPublicBaseIndexFileName = "local-public-base-index.json";
const acceptedConsent = {
  accepted: true,
  acceptedAt: "2026-06-13T00:00:00.000Z",
  baseDateAcknowledged: "2026-05-20",
  stalenessWarningAcknowledged: "A Base Pública Local pode estar defasada.",
} as const;
type CapturedWarning = {
  message: string;
  metadata: Record<string, unknown>;
};

afterEach(async () => {
  await Promise.all(
    tempDirs
      .splice(0)
      .map((directory) => rm(directory, { force: true, recursive: true })),
  );
});

describe("Base Pública Local", () => {
  it("exposes not-prepared status before a local CSV is prepared", () => {
    const status = getLocalPublicBaseStatus();

    expect(status).toMatchObject({
      state: "not-prepared",
      baseDate: null,
      preparedRows: 0,
    });
    expect(status.estimatedSizeLabel).toContain("menos de 1 MB");
    expect(status.diskUsageLabel).toContain("sem base preparada");
    expect(status.freshnessWarning).toContain("Prepare a Base Pública Local");
  });

  it("indexes known public fixture records by normalized CNPJ", () => {
    const index = createLocalPublicBaseIndex();

    expect(index.findByCnpj("00000000000191")).toMatchObject({
      cnpj: "00000000000191",
      razaoSocial: "Banco do Brasil S.A.",
      simplesNacional: true,
      simei: false,
    });
    expect(index.findByCnpj("11222333000181")).toBeNull();
  });

  it("returns Resultado Simples with Data da Base for known and missing CNPJs", async () => {
    const prepared = prepareLocalPublicBaseFromCsv({
      content: [
        "cnpj;razao_social;simples_nacional;simei;data_base",
        "00000000000191;Banco do Brasil S.A.;sim;nao;2026-05-20",
      ].join("\n"),
      consent: acceptedConsent,
      sourceFileName: "base.csv",
      sourceFilePath: "/tmp/base.csv",
    });
    const index = createLocalPublicBaseIndexFromRecords(prepared.records);
    const adapter = new LocalPublicBaseSimplesLookupAdapter(
      index,
      prepared.status,
    );

    await expect(adapter.lookup("00.000.000/0001-91")).resolves.toMatchObject({
      cnpj: "00000000000191",
      simplesNacional: true,
      simei: false,
      source: "base-publica-local",
      status: "SUCCESS",
      message: expect.stringContaining("2026-05-20"),
      raw: {
        baseDate: "2026-05-20",
      },
    });

    await expect(adapter.lookup("invalido")).resolves.toMatchObject({
      cnpj: "",
      simplesNacional: null,
      simei: null,
      source: "base-publica-local",
      status: "INVALID_CNPJ",
      raw: {
        baseDate: "2026-05-20",
      },
    });

    await expect(adapter.lookup("11222333000181")).resolves.toMatchObject({
      cnpj: "11222333000181",
      simplesNacional: null,
      simei: null,
      source: "base-publica-local",
      status: "NOT_FOUND",
      message: expect.stringContaining("não encontrado"),
      raw: {
        baseDate: "2026-05-20",
      },
    });
  });

  it("validates the offline fixture used for local prepare/index/lookup", async () => {
    const content = await readFile(fixturePath, "utf8");
    const prepared = prepareLocalPublicBaseFromCsv({
      content,
      consent: acceptedConsent,
      sourceFileName: "base-publica-local.csv",
      sourceFilePath: fixturePath,
    });
    const adapter = new LocalPublicBaseSimplesLookupAdapter(
      createLocalPublicBaseIndexFromRecords(prepared.records),
      prepared.status,
    );

    expect(prepared).toMatchObject({
      acceptedRows: 3,
      rejectedRows: 0,
      status: {
        baseDate: "2026-05-20",
        preparedRows: 3,
        state: "ready",
      },
    });
    expect(prepared.status.freshnessWarning).toContain("defasada");
    await expect(adapter.lookup("33000167000101")).resolves.toMatchObject({
      simplesNacional: false,
      simei: false,
      source: "base-publica-local",
      status: "SUCCESS",
      raw: {
        baseDate: "2026-05-20",
        razaoSocial: "Petróleo Brasileiro S.A. Petrobras",
      },
    });
  });

  it("rejects malformed explicit local preparation consent", () => {
    expect(() =>
      assertLocalPublicBasePreparationConsent({
        accepted: false,
        acceptedAt: "",
        baseDateAcknowledged: null,
        stalenessWarningAcknowledged: "",
      } as never),
    ).toThrow("Consentimento explícito");
  });

  it("prepares a deduplicated local index from a CSV source", () => {
    const prepared = prepareLocalPublicBaseFromCsv({
      content: [
        "cnpj;razao_social;simples_nacional;simei;data_base",
        "00.000.000/0001-91;Banco do Brasil S.A.;sim;nao;2026-05-20",
        "33.000.167/0001-01;Petrobras;nao;nao;2026-05-20",
        "invalido;Linha invalida;sim;nao;2026-05-20",
      ].join("\n"),
      consent: acceptedConsent,
      sourceFileName: "base-publica.csv",
      sourceFilePath: "/tmp/base-publica.csv",
    });

    expect(prepared).toMatchObject({
      acceptedRows: 2,
      rejectedRows: 1,
      status: {
        baseDate: "2026-05-20",
        preparedRows: 2,
        rejectedRows: 1,
        sourceFileName: "base-publica.csv",
        state: "ready",
      },
    });
    expect(prepared.records).toHaveLength(2);
  });

  it("persists and reloads a prepared local base index", async () => {
    const directory = await mkdtemp(join(tmpdir(), "public-base-test-"));
    tempDirs.push(directory);
    const store = new LocalPublicBaseStore(directory);

    const result = await store.prepareFromCsv({
      content: [
        "cnpj;razao_social;simples_nacional;simei;data_base",
        "00000000000191;Banco do Brasil S.A.;sim;nao;2026-05-20",
      ].join("\n"),
      consent: acceptedConsent,
      sourceFileName: "base.csv",
      sourceFilePath: join(directory, "base.csv"),
    });
    const status = await store.getStatus();
    const index = await store.loadIndex();

    expect(result.status.state).toBe("ready");
    expect(status).toMatchObject({
      baseDate: "2026-05-20",
      preparedRows: 1,
      sourceFileName: "base.csv",
      state: "ready",
    });
    expect(index?.findByCnpj("00000000000191")).toMatchObject({
      razaoSocial: "Banco do Brasil S.A.",
    });
  });

  it("persists an error state and invalidates the previous index after an invalid preparation", async () => {
    const directory = await mkdtemp(join(tmpdir(), "public-base-test-"));
    tempDirs.push(directory);
    const store = new LocalPublicBaseStore(directory);

    await store.prepareFromCsv({
      content: [
        "cnpj;razao_social;simples_nacional;simei;data_base",
        "00000000000191;Banco do Brasil S.A.;sim;nao;2026-05-20",
      ].join("\n"),
      consent: acceptedConsent,
      sourceFileName: "base-valida.csv",
      sourceFilePath: join(directory, "base-valida.csv"),
    });

    const failed = await store.prepareFromCsv({
      content: [
        "cnpj;razao_social;simples_nacional;simei;data_base",
        "invalido;Linha invalida;sim;nao;2026-05-21",
      ].join("\n"),
      consent: {
        ...acceptedConsent,
        baseDateAcknowledged: "2026-05-21",
      },
      sourceFileName: "base-invalida.csv",
      sourceFilePath: join(directory, "base-invalida.csv"),
    });

    expect(failed.status).toMatchObject({
      sourceFileName: "base-invalida.csv",
      state: "error",
    });
    await expect(store.getStatus()).resolves.toMatchObject({
      sourceFileName: "base-invalida.csv",
      state: "error",
    });
    await expect(store.loadIndex()).resolves.toBeNull();
    await expect(store.loadPreparedBase()).resolves.toBeNull();
  });

  it("rejects preparation without consent before persisting a local index", async () => {
    const directory = await mkdtemp(join(tmpdir(), "public-base-test-"));
    tempDirs.push(directory);
    const store = new LocalPublicBaseStore(directory);

    await expect(
      store.prepareFromCsv({
        content: [
          "cnpj;razao_social;simples_nacional;simei;data_base",
          "00000000000191;Banco do Brasil S.A.;sim;nao;2026-05-20",
        ].join("\n"),
        sourceFileName: "base-sem-consentimento.csv",
        sourceFilePath: join(directory, "base-sem-consentimento.csv"),
      }),
    ).rejects.toThrow("Consentimento explícito");
    await expect(store.getStatus()).resolves.toMatchObject({
      state: "not-prepared",
    });
    await expect(store.loadIndex()).resolves.toBeNull();
  });

  it("discards persisted indexes with malformed records", async () => {
    const directory = await mkdtemp(join(tmpdir(), "public-base-test-"));
    const warnings: CapturedWarning[] = [];
    tempDirs.push(directory);
    await mkdir(directory, { recursive: true });
    await writeFile(
      join(directory, localPublicBaseIndexFileName),
      `${JSON.stringify({
        version: 1,
        state: "ready",
        sourceFileName: "malformada.csv",
        sourceFilePath: join(directory, "malformada.csv"),
        preparedAt: "2026-05-21T00:00:00.000Z",
        baseDate: "2026-05-20",
        estimatedRows: 1,
        preparedRows: 1,
        rejectedRows: 0,
        sourceSizeBytes: 10,
        errorMessage: null,
        records: [{ cnpj: "00000000000191" }],
      })}\n`,
      "utf8",
    );

    const store = new LocalPublicBaseStore(directory, {
      warn(message, metadata) {
        warnings.push({ message, metadata });
      },
    });

    await expect(store.getStatus()).resolves.toMatchObject({
      state: "not-prepared",
    });
    await expect(store.loadIndex()).resolves.toBeNull();
    expect(warnings).toEqual([
      {
        message: "[base-publica-local] indice local descartado",
        metadata: {
          reason: "incompatible_index_document",
        },
      },
      {
        message: "[base-publica-local] indice local descartado",
        metadata: {
          reason: "incompatible_index_document",
        },
      },
    ]);
    expect(JSON.stringify(warnings)).not.toContain(directory);
    expect(JSON.stringify(warnings)).not.toContain(
      localPublicBaseIndexFileName,
    );
    expect(JSON.stringify(warnings)).not.toContain("00000000000191");
    expect(JSON.stringify(warnings)).not.toContain("malformada.csv");
  });

  it("sanitizes warning metadata when a persisted index cannot be parsed", async () => {
    const directory = await mkdtemp(join(tmpdir(), "public-base-test-"));
    const warnings: CapturedWarning[] = [];
    tempDirs.push(directory);
    await mkdir(directory, { recursive: true });
    await writeFile(
      join(directory, localPublicBaseIndexFileName),
      "{ raw payload with CNPJ 00000000000191 and Razao Social }\n",
      "utf8",
    );

    const store = new LocalPublicBaseStore(directory, {
      warn(message, metadata) {
        warnings.push({ message, metadata });
      },
    });

    await expect(store.getStatus()).resolves.toMatchObject({
      state: "not-prepared",
    });

    expect(warnings).toEqual([
      {
        message: "[base-publica-local] indice local descartado",
        metadata: {
          reason: "invalid_json",
        },
      },
    ]);
    expect(JSON.stringify(warnings)).not.toContain(directory);
    expect(JSON.stringify(warnings)).not.toContain("raw payload");
    expect(JSON.stringify(warnings)).not.toContain("00000000000191");
    expect(JSON.stringify(warnings)).not.toContain("Razao Social");
  });

  it("sanitizes warning metadata when a persisted index read fails", async () => {
    const directory = await mkdtemp(join(tmpdir(), "public-base-test-"));
    const warnings: CapturedWarning[] = [];
    tempDirs.push(directory);
    await mkdir(join(directory, localPublicBaseIndexFileName), {
      recursive: true,
    });

    const store = new LocalPublicBaseStore(directory, {
      warn(message, metadata) {
        warnings.push({ message, metadata });
      },
    });

    await expect(store.loadIndex()).resolves.toBeNull();

    expect(warnings).toEqual([
      {
        message: "[base-publica-local] indice local indisponivel",
        metadata: {
          reason: "read_failed",
        },
      },
    ]);
    expect(JSON.stringify(warnings)).not.toContain(directory);
    expect(JSON.stringify(warnings)).not.toContain(
      localPublicBaseIndexFileName,
    );
    expect(JSON.stringify(warnings)).not.toContain("EISDIR");
    expect(JSON.stringify(warnings)).not.toContain("illegal operation");
  });
});

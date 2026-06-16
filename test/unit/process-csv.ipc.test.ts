import { join, resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const handlers = new Map<string, (...args: unknown[]) => unknown>();
const createDeferred = <T>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((nextResolve) => {
    resolve = nextResolve;
  });

  return { promise, resolve };
};

const electronMocks = vi.hoisted(() => ({
  app: { getPath: vi.fn(() => "/tmp/fiscal-desk-test"), isPackaged: false },
  BrowserWindow: { getAllWindows: vi.fn(() => []) },
  dialog: {
    showOpenDialog: vi.fn(),
    showSaveDialog: vi.fn(),
    showMessageBox: vi.fn(),
  },
  ipcMain: {
    handle: vi.fn((channel: string, handler: (...args: unknown[]) => unknown) =>
      handlers.set(channel, handler),
    ),
  },
  powerSaveBlocker: {
    start: vi.fn(() => 1),
    stop: vi.fn(),
    isStarted: vi.fn(() => true),
  },
}));

const ledgerMocks = vi.hoisted(() => ({
  getRun: vi.fn(),
  getCheckpointedCnpjs: vi.fn(),
  listRuns: vi.fn(),
  startRun: vi.fn(),
  finish: vi.fn(),
  restoreLookup: vi.fn(),
  saveLookup: vi.fn(),
  session: {
    checkpointPath: "/tmp/fiscal-desk-test/ledger.json",
    finish: vi.fn(),
    restoreLookup: vi.fn(),
    runId: "test-run",
    saveLookup: vi.fn(),
    setTotalUniqueLookups: vi.fn(),
  },
}));

vi.mock("electron", () => electronMocks);

vi.mock("node:fs/promises", () => ({
  readFile: vi.fn(),
  writeFile: vi.fn(),
}));

vi.mock("../../src/core/app/process-csv.use-case", () => ({
  processCsv: vi.fn(),
}));

vi.mock("../../src/main/execution/file-process-execution-ledger", () => ({
  createInputFingerprint: vi.fn(() => "0123456789abcdef01234567abcdef"),
  FileProcessExecutionLedger: vi.fn(() => ({
    getCheckpointedCnpjs: ledgerMocks.getCheckpointedCnpjs,
    getRun: ledgerMocks.getRun,
    listRuns: ledgerMocks.listRuns,
    startRun: ledgerMocks.startRun,
  })),
}));

vi.mock("../../src/core/simples/simples-provider.config", () => ({
  loadProviderConfig: vi.fn(),
}));

vi.mock("../../src/core/simples/simples-provider.factory", () => ({
  createSimplesLookupProvider: vi.fn(),
  SIMPLES_PROVIDER: {
    BASE_PUBLICA_LOCAL: "base-publica-local",
    CNPJA_OPEN: "cnpja-open",
    MOCK: "mock",
    RECEITA_WEB: "receita-web",
  },
}));

vi.mock(
  "../../src/core/simples/adapters/receita-web/receita-browser-path",
  () => ({
    resolvePackagedWindowsBrowserPath: vi.fn(),
  }),
);

import { processCsv } from "../../src/core/app/process-csv.use-case";
import { resolvePackagedWindowsBrowserPath } from "../../src/core/simples/adapters/receita-web/receita-browser-path";
import { loadProviderConfig } from "../../src/core/simples/simples-provider.config";
import { createSimplesLookupProvider } from "../../src/core/simples/simples-provider.factory";
import {
  registerCsvIpc,
  resolveDefaultProvider,
} from "../../src/main/ipc/process-csv.ipc";

describe("process-csv IPC", () => {
  const originalPlatform = process.platform;

  beforeEach(() => {
    handlers.clear();
    vi.clearAllMocks();
    electronMocks.app.isPackaged = false;
    ledgerMocks.getRun.mockResolvedValue(null);
    ledgerMocks.getCheckpointedCnpjs.mockResolvedValue(new Set());
    ledgerMocks.listRuns.mockResolvedValue([]);
    ledgerMocks.startRun.mockResolvedValue(ledgerMocks.session);
    vi.mocked(createSimplesLookupProvider).mockReturnValue({
      lookup: vi.fn(),
    });
    vi.mocked(processCsv).mockResolvedValue({
      delivery: {
        extension: "csv",
        format: "csv",
        mimeType: "text/csv;charset=utf-8",
      },
      execution: {
        checkpointPath: ledgerMocks.session.checkpointPath,
        completedUniqueLookups: 1,
        resumedUniqueLookups: 0,
        runId: ledgerMocks.session.runId,
        status: "SUCCESS",
        totalUniqueLookups: 1,
      },
      outputCsv: "cnpj;status\n11222333000181;SUCCESS",
      outputXlsx: null,
      runStatus: "SUCCESS",
      summary: {
        totalCnpjsEncontrados: 1,
        totalCnpjsRetomados: 0,
        totalCnpjsUnicosConsultados: 1,
        totalCnpjsValidos: 1,
        totalErros: 0,
        totalLinhas: 1,
        totalNaoOptantesSimples: 0,
        totalOptantesSimples: 1,
      },
    });
    registerCsvIpc();
  });

  afterEach(() => {
    Object.defineProperty(process, "platform", {
      value: originalPlatform,
    });
  });

  it("uses the provider config loader for runtime defaults", () => {
    vi.mocked(loadProviderConfig).mockReturnValue("receita-web");

    const provider = resolveDefaultProvider();

    expect(loadProviderConfig).toHaveBeenCalledTimes(1);
    expect(provider).toBe("receita-web");
  });

  it("reports receita-web availability in app defaults based on packaging", async () => {
    const handler = handlers.get("app:get-defaults");
    vi.mocked(loadProviderConfig).mockReturnValue("mock");
    electronMocks.app.isPackaged = true;
    vi.mocked(resolvePackagedWindowsBrowserPath).mockReturnValue(undefined);

    const defaults = await handler?.();

    expect(defaults).toMatchObject({
      localPublicBaseStatus: {
        baseDate: null,
        state: "not-prepared",
      },
      provider: "mock",
      receitaWebAvailable: false,
    });
  });

  it("reports receita-web availability when packaged Windows can find a browser", async () => {
    const handler = handlers.get("app:get-defaults");
    vi.mocked(loadProviderConfig).mockReturnValue("mock");
    electronMocks.app.isPackaged = true;
    Object.defineProperty(process, "platform", {
      value: "win32",
    });
    vi.mocked(resolvePackagedWindowsBrowserPath).mockReturnValue(
      "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    );

    const defaults = await handler?.();

    expect(defaults).toMatchObject({
      localPublicBaseStatus: {
        baseDate: null,
        state: "not-prepared",
      },
      provider: "mock",
      receitaWebAvailable: true,
    });
  });

  it("keeps receita-web as default when config requests it in packaged Windows app", () => {
    vi.mocked(loadProviderConfig).mockReturnValue("receita-web");
    electronMocks.app.isPackaged = true;
    Object.defineProperty(process, "platform", {
      value: "win32",
    });
    vi.mocked(resolvePackagedWindowsBrowserPath).mockReturnValue(
      "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    );

    const provider = resolveDefaultProvider();

    expect(provider).toBe("receita-web");
  });

  it("rejects receita-web processing in packaged non-Windows runtimes", async () => {
    electronMocks.app.isPackaged = true;
    const handler = handlers.get("csv:process");
    vi.mocked(resolvePackagedWindowsBrowserPath).mockReturnValue(undefined);

    expect(handler).toBeTypeOf("function");

    await expect(
      handler?.(
        {},
        { content: "cnpj\n88777666000100", provider: "receita-web" },
      ),
    ).rejects.toThrow("disponível apenas no Windows");
  });

  it("picks XLSX input as bytes with explicit input format", async () => {
    const handler = handlers.get("csv:pick-input-file");
    const { readFile } = await import("node:fs/promises");
    const inputPath = resolve("/tmp/fiscal-desk-test/entrada.xlsx");
    electronMocks.dialog.showOpenDialog.mockResolvedValueOnce({
      canceled: false,
      filePaths: [inputPath],
    });
    vi.mocked(readFile).mockResolvedValueOnce(Buffer.from([80, 75, 3, 4]));

    await expect(handler?.()).resolves.toEqual({
      content: [80, 75, 3, 4],
      fileName: "entrada.xlsx",
      filePath: inputPath,
      inputFormat: "xlsx",
    });

    expect(electronMocks.dialog.showOpenDialog).toHaveBeenCalledWith(
      expect.objectContaining({
        filters: [{ name: "Planilhas", extensions: ["csv", "xlsx"] }],
      }),
    );
    expect(readFile).toHaveBeenCalledWith(inputPath);
  });

  it("pauses active processing through a dedicated IPC channel and aborts the current signal", async () => {
    const processHandler = handlers.get("csv:process");
    const pauseHandler = handlers.get("csv:pause-processing");
    const deferredResult =
      createDeferred<Awaited<ReturnType<typeof processCsv>>>();
    vi.mocked(processCsv).mockReturnValueOnce(deferredResult.promise);

    const processing = processHandler?.(
      { sender: { send: vi.fn() } },
      { content: "cnpj\n11222333000181", provider: "mock" },
    );
    await vi.waitFor(() => expect(processCsv).toHaveBeenCalledTimes(1));

    expect(pauseHandler?.()).toBe(true);
    const processOptions = vi.mocked(processCsv).mock.calls[0]?.[2];
    expect(processOptions?.signal?.aborted).toBe(true);

    deferredResult.resolve({
      delivery: {
        extension: "csv",
        format: "csv",
        mimeType: "text/csv;charset=utf-8",
      },
      execution: {
        checkpointPath: ledgerMocks.session.checkpointPath,
        completedUniqueLookups: 1,
        resumedUniqueLookups: 0,
        runId: ledgerMocks.session.runId,
        status: "CANCELLED",
        totalUniqueLookups: 1,
      },
      outputCsv: "cnpj;status\n11222333000181;CANCELLED",
      outputXlsx: null,
      runStatus: "CANCELLED",
      summary: {
        totalCnpjsEncontrados: 1,
        totalCnpjsRetomados: 0,
        totalCnpjsUnicosConsultados: 1,
        totalCnpjsValidos: 1,
        totalErros: 0,
        totalLinhas: 1,
        totalNaoOptantesSimples: 0,
        totalOptantesSimples: 0,
      },
    });

    await expect(processing).resolves.toMatchObject({
      runStatus: "CANCELLED",
    });
  });

  it("exports pending CNPJs from an interrupted execution", async () => {
    const handler = handlers.get("csv:export-pending-cnpjs");
    const { readFile, writeFile } = await import("node:fs/promises");
    const outputPath = resolve("/tmp/fiscal-desk-test/entrada-pendencias.csv");
    ledgerMocks.getRun.mockResolvedValueOnce({
      canExportPending: true,
      canResume: true,
      checkpointPath: "/tmp/fiscal-desk-test/ledger.json",
      checkpointedUniqueLookups: 1,
      cnpjColumn: "cnpj",
      completedAt: "2026-06-14T12:01:00.000Z",
      hasPartialOutput: true,
      inputFormat: "csv",
      ledgerKey: "mock-0123456789abcdef01234567.json",
      outputPath: "/tmp/fiscal-desk-test/entrada-processado.csv",
      pendingUniqueLookups: 1,
      providerConfigVersion: "provider-config-v1",
      providerName: "mock",
      resumeBlockedReason: null,
      runId: "run-cancelled",
      sourceFileName: "entrada.csv",
      sourceFilePath: "/tmp/fiscal-desk-test/entrada.csv",
      startedAt: "2026-06-14T12:00:00.000Z",
      status: "CANCELLED",
      summary: null,
      totalUniqueLookups: 2,
      updatedAt: "2026-06-14T12:01:00.000Z",
    });
    ledgerMocks.getCheckpointedCnpjs.mockResolvedValueOnce(
      new Set(["11222333000181"]),
    );
    vi.mocked(readFile).mockResolvedValueOnce(
      "cnpj\n11222333000181\n88777666000100\n11222333000181",
    );
    electronMocks.dialog.showSaveDialog.mockResolvedValueOnce({
      canceled: false,
      filePath: outputPath,
    });

    const result = await handler?.(
      {},
      { ledgerKey: "mock-0123456789abcdef01234567.json" },
    );

    expect(result).toEqual({
      pendingUniqueLookups: 1,
      savedPath: outputPath,
    });
    expect(electronMocks.dialog.showSaveDialog).toHaveBeenCalledWith(
      expect.objectContaining({
        defaultPath: join("/tmp/fiscal-desk-test", "entrada-pendencias.csv"),
        filters: [{ name: "CSV", extensions: ["csv"] }],
      }),
    );
    expect(writeFile).toHaveBeenCalledWith(
      outputPath,
      expect.stringContaining("88777666000100"),
      "utf8",
    );
    expect(String(vi.mocked(writeFile).mock.calls.at(-1)?.[1])).not.toContain(
      "11222333000181",
    );
  });

  it("completes NOT_FOUND rows from a processed CSV using the selected provider", async () => {
    const handler = handlers.get("csv:complete-processed-csv");
    const { readFile, writeFile } = await import("node:fs/promises");
    const outputPath = resolve(
      "/tmp/fiscal-desk-test/entrada-processado-complementado.csv",
    );
    const lookup = vi.fn(async () => ({
      cnpj: "11222333000181",
      simplesNacional: true,
      simei: false,
      source: "receita-web",
      status: "SUCCESS" as const,
    }));
    vi.mocked(createSimplesLookupProvider).mockReturnValueOnce({ lookup });
    ledgerMocks.getRun.mockResolvedValueOnce({
      canExportPending: false,
      canResume: false,
      checkpointPath: "/tmp/fiscal-desk-test/ledger.json",
      checkpointedUniqueLookups: 2,
      cnpjColumn: "cnpj",
      completedAt: "2026-06-15T12:01:00.000Z",
      hasPartialOutput: false,
      inputFormat: "csv",
      ledgerKey: "mock-0123456789abcdef01234567.json",
      outputPath: "/tmp/fiscal-desk-test/entrada-processado.csv",
      pendingUniqueLookups: 0,
      providerConfigVersion: "provider-config-v1",
      providerName: "base-publica-local",
      resumeBlockedReason: "Histórico concluído",
      runId: "run-success",
      sourceFileName: "entrada.csv",
      sourceFilePath: "/tmp/fiscal-desk-test/entrada.csv",
      startedAt: "2026-06-15T12:00:00.000Z",
      status: "SUCCESS",
      summary: null,
      totalUniqueLookups: 2,
      updatedAt: "2026-06-15T12:01:00.000Z",
    });
    vi.mocked(readFile).mockResolvedValueOnce(
      [
        "cnpj_normalizado;simples_nacional;simei;status;fonte;mensagem",
        "11222333000181;;;NOT_FOUND;base-publica-local;nao achou",
        "98765432000198;Não;Não;SUCCESS;base-publica-local;ok",
      ].join("\n"),
    );
    electronMocks.dialog.showSaveDialog.mockResolvedValueOnce({
      canceled: false,
      filePath: outputPath,
    });

    const result = await handler?.(
      {},
      {
        ledgerKey: "mock-0123456789abcdef01234567.json",
        provider: "receita-web",
      },
    );

    expect(result).toEqual({
      completedLookups: 1,
      foundByComplement: 1,
      savedPath: outputPath,
    });
    expect(lookup).toHaveBeenCalledWith("11222333000181", undefined);
    expect(electronMocks.dialog.showSaveDialog).toHaveBeenCalledWith(
      expect.objectContaining({
        defaultPath: join(
          "/tmp/fiscal-desk-test",
          "entrada-processado-complementado.csv",
        ),
        filters: [{ name: "CSV", extensions: ["csv"] }],
      }),
    );
    expect(writeFile).toHaveBeenCalledWith(
      outputPath,
      expect.stringContaining("complemento_status"),
      "utf8",
    );
    expect(String(vi.mocked(writeFile).mock.calls.at(-1)?.[1])).toContain(
      "preenchido_por_complemento",
    );
  });

  it("rejects Base Pública Local before ledger side effects without consent or prepared base", async () => {
    const handler = handlers.get("csv:process");

    await expect(
      handler?.(
        { sender: { send: vi.fn() } },
        {
          content: "cnpj\n11222333000181",
          provider: "base-publica-local",
        },
      ),
    ).rejects.toThrow("Confirme o aviso de Data da Base");

    await expect(
      handler?.(
        { sender: { send: vi.fn() } },
        {
          acceptedLocalPublicBaseNotice: true,
          content: "cnpj\n11222333000181",
          provider: "base-publica-local",
        },
      ),
    ).rejects.toThrow("Prepare a Base Pública Local");

    expect(ledgerMocks.startRun).not.toHaveBeenCalled();
    expect(processCsv).not.toHaveBeenCalled();
  });

  it("rejects invalid delivery formats before resolving resume history", async () => {
    const handler = handlers.get("csv:resume-execution");

    await expect(
      handler?.(
        { sender: { send: vi.fn() } },
        {
          deliveryFormat: "pdf",
          ledgerKey: "mock-0123456789abcdef01234567.json",
        },
      ),
    ).rejects.toThrow("Formato de entrega invalido");

    expect(ledgerMocks.getRun).not.toHaveBeenCalled();
  });

  it("rejects invalid delivery formats before opening the save dialog", async () => {
    const handler = handlers.get("csv:save-output-file");

    await expect(
      handler?.(
        {},
        {
          content: "cnpj;status\n11222333000181;SUCCESS",
          defaultName: "saida.pdf",
          format: "pdf",
        },
      ),
    ).rejects.toThrow("Formato de entrega invalido");

    expect(electronMocks.dialog.showSaveDialog).not.toHaveBeenCalled();
  });

  it("rejects direct auto-save when the source path was not selected in this session", async () => {
    const handler = handlers.get("csv:auto-save-output-file");

    await expect(
      handler?.({}, { sourceFilePath: "/tmp/injetado.csv", content: "ok" }),
    ).rejects.toThrow("não foi validado nesta sessão");
  });

  it("allows auto-save only for a source path selected by the file picker", async () => {
    const { readFile } = await import("node:fs/promises");
    const { writeFile } = await import("node:fs/promises");
    const sourceFilePath = resolve("/tmp/entrada.csv");
    vi.mocked(electronMocks.dialog.showOpenDialog).mockResolvedValue({
      canceled: false,
      filePaths: [sourceFilePath],
    } as never);
    vi.mocked(readFile).mockResolvedValue("cnpj\n88777666000100");
    const pickHandler = handlers.get("csv:pick-input-file");
    const autoSaveHandler = handlers.get("csv:auto-save-output-file");

    await pickHandler?.({});
    await autoSaveHandler?.({}, { sourceFilePath, content: "ok" });

    expect(writeFile).toHaveBeenCalledWith(
      resolve("/tmp/entrada-processado.csv"),
      "ok",
      "utf8",
    );
  });

  it("skips auto-save during processing when the source path was not selected in this session", async () => {
    const handler = handlers.get("csv:process");
    const { writeFile } = await import("node:fs/promises");

    await expect(
      handler?.(
        { sender: { send: vi.fn() } },
        {
          content: "cnpj\n88777666000100",
          provider: "mock",
          sourceFilePath: "/tmp/nao-confiavel.csv",
        },
      ),
    ).resolves.toMatchObject({
      outputCsv: "cnpj;status\n11222333000181;SUCCESS",
      savedPath: null,
      warningMessage: expect.stringContaining("auto-save foi ignorado"),
    });
    expect(writeFile).not.toHaveBeenCalled();
  });

  it("reserves the active processing slot before ledger initialization finishes", async () => {
    const handler = handlers.get("csv:process");
    const deferredSession = createDeferred<typeof ledgerMocks.session>();
    ledgerMocks.startRun.mockReturnValueOnce(deferredSession.promise);

    expect(handler).toBeTypeOf("function");

    const firstProcess = handler?.(
      { sender: { send: vi.fn() } },
      { content: "cnpj\n11222333000181", provider: "mock" },
    );

    await expect(
      handler?.(
        { sender: { send: vi.fn() } },
        { content: "cnpj\n12345678000195", provider: "mock" },
      ),
    ).rejects.toThrow("processamento em andamento");

    deferredSession.resolve(ledgerMocks.session);
    await expect(firstProcess).resolves.toMatchObject({
      runStatus: "SUCCESS",
    });
  });

  it("lists execution history through the ledger adapter", async () => {
    const handler = handlers.get("csv:list-executions");
    const history = [
      {
        canResume: true,
        ledgerKey: "mock-0123456789abcdef01234567.json",
        runId: "test-run",
        status: "CANCELLED",
      },
    ];
    ledgerMocks.listRuns.mockResolvedValueOnce(history);

    await expect(handler?.()).resolves.toBe(history);
    expect(ledgerMocks.listRuns).toHaveBeenCalledWith({ limit: 8 });
  });

  it("rejects resume for completed history-only executions", async () => {
    const handler = handlers.get("csv:resume-execution");
    ledgerMocks.getRun.mockResolvedValueOnce({
      canResume: false,
      ledgerKey: "mock-0123456789abcdef01234567.json",
      resumeBlockedReason:
        "Execucoes concluidas com sucesso ficam apenas no historico.",
      status: "SUCCESS",
    });

    await expect(
      handler?.(
        { sender: { send: vi.fn() } },
        { ledgerKey: "mock-0123456789abcdef01234567.json" },
      ),
    ).rejects.toThrow("ficam apenas no historico");
  });

  it("rejects Base Pública Local resume without Data da Base consent before reading the source CSV", async () => {
    const handler = handlers.get("csv:resume-execution");
    const { readFile } = await import("node:fs/promises");
    ledgerMocks.getRun.mockResolvedValueOnce({
      canResume: true,
      cnpjColumn: "cnpj",
      ledgerKey: "base-publica-local-0123456789abcdef01234567.json",
      providerName: "base-publica-local",
      sourceFilePath: "/tmp/fiscal-desk-test/entrada.csv",
      status: "CANCELLED",
    });

    await expect(
      handler?.(
        { sender: { send: vi.fn() } },
        { ledgerKey: "base-publica-local-0123456789abcdef01234567.json" },
      ),
    ).rejects.toThrow("Confirme o aviso de Data da Base");

    expect(readFile).not.toHaveBeenCalled();
    expect(ledgerMocks.startRun).not.toHaveBeenCalled();
  });

  it("resumes an eligible execution from its original CSV path", async () => {
    const handler = handlers.get("csv:resume-execution");
    const sender = { send: vi.fn() };
    const sourceFilePath = "/tmp/fiscal-desk-test/entrada.csv";
    const content = "cnpj\n11222333000181";
    const { readFile } = await import("node:fs/promises");
    vi.mocked(readFile).mockResolvedValueOnce(content);
    ledgerMocks.getRun.mockResolvedValueOnce({
      canResume: true,
      cnpjColumn: "cnpj",
      ledgerKey: "mock-0123456789abcdef01234567.json",
      providerConfigVersion: "provider-config-v1",
      providerName: "mock",
      sourceFilePath,
      status: "CANCELLED",
    });

    await expect(
      handler?.(sender, {
        ledgerKey: "mock-0123456789abcdef01234567.json",
      }),
    ).resolves.toMatchObject({
      runStatus: "SUCCESS",
    });

    expect(readFile).toHaveBeenCalledWith(sourceFilePath, "utf8");
    expect(ledgerMocks.startRun).toHaveBeenCalledWith({
      cnpjColumn: "cnpj",
      inputContent: content,
      inputFormat: "csv",
      providerConfigVersion: "provider-config-v1",
      providerName: "mock",
      sourceFilePath,
    });
    expect(processCsv).toHaveBeenCalledWith(
      {
        content,
        format: "csv",
        sourceFilePath,
      },
      expect.any(Object),
      expect.objectContaining({
        cnpjColumn: "cnpj",
        executionLedger: ledgerMocks.session,
      }),
    );
  });

  it("passes xlsx delivery selection and auto-saves the generated workbook", async () => {
    const handler = handlers.get("csv:process");
    const sender = { send: vi.fn() };
    const { readFile, writeFile } = await import("node:fs/promises");
    const sourceFilePath = resolve("/tmp/fiscal-desk-test/entrada.csv");
    vi.mocked(electronMocks.dialog.showOpenDialog).mockResolvedValue({
      canceled: false,
      filePaths: [sourceFilePath],
    } as never);
    vi.mocked(readFile).mockResolvedValue("cnpj\n11222333000181");
    await handlers.get("csv:pick-input-file")?.({});
    vi.mocked(processCsv).mockResolvedValueOnce({
      delivery: {
        extension: "xlsx",
        format: "xlsx",
        mimeType:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
      execution: {
        checkpointPath: ledgerMocks.session.checkpointPath,
        completedUniqueLookups: 1,
        resumedUniqueLookups: 0,
        runId: ledgerMocks.session.runId,
        status: "SUCCESS",
        totalUniqueLookups: 1,
      },
      outputCsv: "cnpj;status\n11222333000181;SUCCESS",
      outputXlsx: new Uint8Array([80, 75, 3, 4]),
      runStatus: "SUCCESS",
      summary: {
        totalCnpjsEncontrados: 1,
        totalCnpjsRetomados: 0,
        totalCnpjsUnicosConsultados: 1,
        totalCnpjsValidos: 1,
        totalErros: 0,
        totalLinhas: 1,
        totalNaoOptantesSimples: 0,
        totalOptantesSimples: 1,
      },
    });

    await expect(
      handler?.(sender, {
        content: "cnpj\n11222333000181",
        deliveryFormat: "xlsx",
        provider: "mock",
        sourceFilePath,
      }),
    ).resolves.toMatchObject({
      delivery: {
        format: "xlsx",
      },
      outputXlsx: [80, 75, 3, 4],
      savedPath: resolve("/tmp/fiscal-desk-test/entrada-processado.xlsx"),
    });

    expect(processCsv).toHaveBeenCalledWith(
      {
        content: "cnpj\n11222333000181",
        format: "csv",
        sourceFilePath,
      },
      expect.any(Object),
      expect.objectContaining({
        deliveryFormat: "xlsx",
      }),
    );
    expect(writeFile).toHaveBeenCalledWith(
      resolve("/tmp/fiscal-desk-test/entrada-processado.xlsx"),
      Buffer.from([80, 75, 3, 4]),
    );
  });
});

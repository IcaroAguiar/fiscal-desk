import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const handlers = new Map<string, (...args: unknown[]) => unknown>();

const createDeferred = <T>() => {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((promiseResolve, promiseReject) => {
    resolve = promiseResolve;
    reject = promiseReject;
  });

  return { promise, reject, resolve };
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
      outputCsv: "cnpj;status\n00000000000191;SUCCESS",
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

    expect(defaults).toEqual({
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

    expect(defaults).toEqual({
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
        { content: "cnpj\n47960950000121", provider: "receita-web" },
      ),
    ).rejects.toThrow("disponível apenas no Windows");
  });

  it("rejects invalid delivery formats before starting processing", async () => {
    const handler = handlers.get("csv:process");

    await expect(
      handler?.(
        { sender: { send: vi.fn() } },
        {
          content: "cnpj\n00000000000191",
          deliveryFormat: "pdf",
          provider: "mock",
        },
      ),
    ).rejects.toThrow("Formato de entrega invalido");

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
          content: "cnpj;status\n00000000000191;SUCCESS",
          defaultName: "saida.pdf",
          format: "pdf",
        },
      ),
    ).rejects.toThrow("Formato de entrega invalido");

    expect(electronMocks.dialog.showSaveDialog).not.toHaveBeenCalled();
  });

  it("reserves the active processing slot before ledger initialization finishes", async () => {
    const handler = handlers.get("csv:process");
    const deferredSession = createDeferred<typeof ledgerMocks.session>();
    ledgerMocks.startRun.mockReturnValueOnce(deferredSession.promise);

    expect(handler).toBeTypeOf("function");

    const firstProcess = handler?.(
      { sender: { send: vi.fn() } },
      { content: "cnpj\n00000000000191", provider: "mock" },
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

  it("resumes an eligible execution from its original CSV path", async () => {
    const handler = handlers.get("csv:resume-execution");
    const sender = { send: vi.fn() };
    const sourceFilePath = "/tmp/fiscal-desk-test/entrada.csv";
    const content = "cnpj\n00000000000191";
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
      inputCsv: content,
      providerConfigVersion: "provider-config-v1",
      providerName: "mock",
      sourceFilePath,
    });
    expect(processCsv).toHaveBeenCalledWith(
      content,
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
    const { writeFile } = await import("node:fs/promises");
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
      outputCsv: "cnpj;status\n00000000000191;SUCCESS",
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
        content: "cnpj\n00000000000191",
        deliveryFormat: "xlsx",
        provider: "mock",
        sourceFilePath: "/tmp/fiscal-desk-test/entrada.csv",
      }),
    ).resolves.toMatchObject({
      delivery: {
        format: "xlsx",
      },
      outputXlsx: [80, 75, 3, 4],
      savedPath: "/tmp/fiscal-desk-test/entrada-processado.xlsx",
    });

    expect(processCsv).toHaveBeenCalledWith(
      "cnpj\n00000000000191",
      expect.any(Object),
      expect.objectContaining({
        deliveryFormat: "xlsx",
      }),
    );
    expect(writeFile).toHaveBeenCalledWith(
      "/tmp/fiscal-desk-test/entrada-processado.xlsx",
      Buffer.from([80, 75, 3, 4]),
    );
  });
});

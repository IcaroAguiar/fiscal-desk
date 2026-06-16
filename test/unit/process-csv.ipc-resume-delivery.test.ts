import { resolve } from "node:path";
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
  SIMPLES_PROVIDER: {
    BASE_PUBLICA_LOCAL: "base-publica-local",
    CNPJA_OPEN: "cnpja-open",
    MOCK: "mock",
    RECEITA_WEB: "receita-web",
    RECEITA_WEB_PARALLEL_EXPERIMENTAL: "receita-web-parallel-experimental",
  },
}));

vi.mock(
  "../../src/core/simples/adapters/receita-web/receita-browser-path",
  () => ({
    resolvePackagedWindowsBrowserPath: vi.fn(),
  }),
);

import { PROCESS_CSV_DELIVERY_OPTION_ID } from "../../src/core/app/process-csv.types";
import { processCsv } from "../../src/core/app/process-csv.use-case";
import { createSimplesLookupProvider } from "../../src/core/simples/simples-provider.factory";
import { registerCsvIpc } from "../../src/main/ipc/process-csv.ipc";

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

  it("writes operational process logs without CNPJ or local paths", async () => {
    const handler = handlers.get("csv:process");
    const sender = { send: vi.fn() };
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
    const { readFile } = await import("node:fs/promises");
    const sourceFilePath = resolve("/tmp/fiscal-desk-test/entrada.csv");
    vi.mocked(electronMocks.dialog.showOpenDialog).mockResolvedValue({
      canceled: false,
      filePaths: [sourceFilePath],
    } as never);
    vi.mocked(readFile).mockResolvedValue("cnpj\n11222333000181");
    await handlers.get("csv:pick-input-file")?.({});

    vi.mocked(processCsv).mockImplementationOnce(
      async (_content, _provider, options) => {
        if (!options) {
          throw new Error("options are required for this test");
        }

        options.onLookupProgress?.({
          completedUniqueLookups: 1,
          currentCnpj: "00********0191",
          elapsedMs: 25,
          estimatedRemainingMs: 0,
          totalUniqueLookups: 1,
        });

        return {
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
        };
      },
    );

    try {
      await expect(
        handler?.(
          { sender },
          {
            content: "cnpj\n11222333000181",
            deliveryFormat: "xlsx",
            provider: "mock",
            sourceFilePath,
          },
        ),
      ).resolves.toMatchObject({
        delivery: {
          format: "xlsx",
        },
        savedPath: resolve("/tmp/fiscal-desk-test/entrada-processado.xlsx"),
      });

      const serializedLogs = JSON.stringify(infoSpy.mock.calls);

      expect(infoSpy).toHaveBeenCalledWith(
        "[csv] processamento iniciado",
        expect.objectContaining({
          deliveryFormat: "xlsx",
          hasSourceFile: true,
          provider: "mock",
          runId: "test-run",
        }),
      );
      expect(infoSpy).toHaveBeenCalledWith(
        "[csv] progresso",
        expect.objectContaining({
          completedUniqueLookups: 1,
          totalUniqueLookups: 1,
        }),
      );
      expect(infoSpy).toHaveBeenCalledWith(
        "[csv] processamento finalizado",
        expect.objectContaining({
          deliveryFormat: "xlsx",
          hasAutoSavedOutput: true,
          runStatus: "SUCCESS",
        }),
      );
      expect(serializedLogs).not.toContain("11222333000181");
      expect(serializedLogs).not.toContain("/tmp/fiscal-desk-test");
      expect(serializedLogs).not.toContain("sourceFilePath");
      expect(serializedLogs).not.toContain("savedPath");
      expect(serializedLogs).not.toContain("checkpointPath");
      expect(serializedLogs).not.toContain("currentCnpj");
    } finally {
      infoSpy.mockRestore();
    }
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

  it("rejects Receita Web experimental resume without explicit consent before reading the source CSV", async () => {
    const handler = handlers.get("csv:resume-execution");
    const { readFile } = await import("node:fs/promises");
    ledgerMocks.getRun.mockResolvedValueOnce({
      canResume: true,
      cnpjColumn: "cnpj",
      ledgerKey:
        "receita-web-parallel-experimental-0123456789abcdef01234567.json",
      providerName: "receita-web-parallel-experimental",
      sourceFilePath: "/tmp/fiscal-desk-test/entrada.csv",
      status: "CANCELLED",
    });

    await expect(
      handler?.(
        { sender: { send: vi.fn() } },
        {
          ledgerKey:
            "receita-web-parallel-experimental-0123456789abcdef01234567.json",
        },
      ),
    ).rejects.toThrow("Confirme o aviso do modo experimental da Receita Web");

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

  it("resumes an eligible execution with a current delivery option id", async () => {
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
        deliveryOptionId:
          PROCESS_CSV_DELIVERY_OPTION_ID.CURRENT_RESULT_WORKBOOK,
        ledgerKey: "mock-0123456789abcdef01234567.json",
      }),
    ).resolves.toMatchObject({
      runStatus: "SUCCESS",
    });

    expect(processCsv).toHaveBeenCalledWith(
      {
        content,
        format: "csv",
        sourceFilePath,
      },
      expect.any(Object),
      expect.objectContaining({
        deliveryOptionId:
          PROCESS_CSV_DELIVERY_OPTION_ID.CURRENT_RESULT_WORKBOOK,
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

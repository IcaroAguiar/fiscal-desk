import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const handlers = new Map<string, (...args: unknown[]) => unknown>();

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
        { content: "cnpj\n47960950000121", provider: "receita-web" },
      ),
    ).rejects.toThrow("disponível apenas no Windows");
  });

  it("picks XLSX input as bytes with explicit input format", async () => {
    const handler = handlers.get("csv:pick-input-file");
    const { readFile } = await import("node:fs/promises");
    electronMocks.dialog.showOpenDialog.mockResolvedValueOnce({
      canceled: false,
      filePaths: ["/tmp/fiscal-desk-test/entrada.xlsx"],
    });
    vi.mocked(readFile).mockResolvedValueOnce(Buffer.from([80, 75, 3, 4]));

    await expect(handler?.()).resolves.toEqual({
      content: [80, 75, 3, 4],
      fileName: "entrada.xlsx",
      filePath: "/tmp/fiscal-desk-test/entrada.xlsx",
      inputFormat: "xlsx",
    });

    expect(electronMocks.dialog.showOpenDialog).toHaveBeenCalledWith(
      expect.objectContaining({
        filters: [{ name: "Planilhas", extensions: ["csv", "xlsx"] }],
      }),
    );
    expect(readFile).toHaveBeenCalledWith("/tmp/fiscal-desk-test/entrada.xlsx");
  });

  it("rejects Base Pública Local before ledger side effects without consent or prepared base", async () => {
    const handler = handlers.get("csv:process");

    await expect(
      handler?.(
        { sender: { send: vi.fn() } },
        {
          content: "cnpj\n00000000000191",
          provider: "base-publica-local",
        },
      ),
    ).rejects.toThrow("Confirme o aviso de Data da Base");

    await expect(
      handler?.(
        { sender: { send: vi.fn() } },
        {
          acceptedLocalPublicBaseNotice: true,
          content: "cnpj\n00000000000191",
          provider: "base-publica-local",
        },
      ),
    ).rejects.toThrow("Prepare a Base Pública Local");

    expect(ledgerMocks.startRun).not.toHaveBeenCalled();
    expect(processCsv).not.toHaveBeenCalled();
  });
});

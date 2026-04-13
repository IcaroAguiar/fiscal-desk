import { readFile, writeFile } from "node:fs/promises";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const handlers = new Map<string, (...args: unknown[]) => unknown>();

const electronMocks = vi.hoisted(() => ({
  app: { isPackaged: false },
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

vi.mock("electron", () => electronMocks);

vi.mock("node:fs/promises", () => ({
  readFile: vi.fn(),
  writeFile: vi.fn(),
}));

vi.mock("../../src/core/app/process-csv.use-case", () => ({
  processCsv: vi.fn(),
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
    resolveReceitaBrowserPath: vi.fn(),
  }),
);

import { resolveReceitaBrowserPath } from "../../src/core/simples/adapters/receita-web/receita-browser-path";
import { loadProviderConfig } from "../../src/core/simples/simples-provider.config";
import {
  registerCsvIpc,
  resolveDefaultProvider,
} from "../../src/main/ipc/process-csv.ipc";

describe("process-csv IPC", () => {
  const originalPlatform = process.platform;
  const consoleInfoSpy = vi.spyOn(console, "info").mockImplementation(() => {});

  beforeEach(() => {
    handlers.clear();
    vi.clearAllMocks();
    electronMocks.app.isPackaged = false;
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

  it("reports receita-web as unavailable when packaged build has no browser", async () => {
    const handler = handlers.get("app:get-defaults");
    vi.mocked(loadProviderConfig).mockReturnValue("mock");
    electronMocks.app.isPackaged = true;
    vi.mocked(resolveReceitaBrowserPath).mockReturnValue(undefined);

    const defaults = await handler?.();

    expect(defaults).toEqual({
      provider: "mock",
      receitaWebAvailable: false,
    });
  });

  it("reports receita-web as available when packaged build resolves a browser", async () => {
    const handler = handlers.get("app:get-defaults");
    vi.mocked(loadProviderConfig).mockReturnValue("mock");
    electronMocks.app.isPackaged = true;
    vi.mocked(resolveReceitaBrowserPath).mockReturnValue(
      "C:\\Consulta\\resources\\playwright-browsers\\win64\\chromium-1208\\chrome-win64\\chrome.exe",
    );

    const defaults = await handler?.();

    expect(defaults).toEqual({
      provider: "mock",
      receitaWebAvailable: true,
    });
  });

  it("falls back to mock when receita-web is configured but unavailable", () => {
    vi.mocked(loadProviderConfig).mockReturnValue("receita-web");
    electronMocks.app.isPackaged = true;
    vi.mocked(resolveReceitaBrowserPath).mockReturnValue(undefined);

    const provider = resolveDefaultProvider();

    expect(provider).toBe("mock");
  });

  it("keeps receita-web as default when packaged build resolves a browser", () => {
    vi.mocked(loadProviderConfig).mockReturnValue("receita-web");
    electronMocks.app.isPackaged = true;
    vi.mocked(resolveReceitaBrowserPath).mockReturnValue(
      "C:\\Consulta\\resources\\playwright-browsers\\win64\\chromium-1208\\chrome-win64\\chrome.exe",
    );

    const provider = resolveDefaultProvider();

    expect(provider).toBe("receita-web");
  });

  it("rejects receita-web processing in packaged app when no browser is available", async () => {
    electronMocks.app.isPackaged = true;
    const handler = handlers.get("csv:process");
    vi.mocked(resolveReceitaBrowserPath).mockReturnValue(undefined);

    await expect(
      handler?.(
        { sender: { send: vi.fn() } },
        { content: "cnpj\n47960950000121", provider: "receita-web" },
      ),
    ).rejects.toThrow("não está disponível nesta build");
  });

  it("allows receita-web processing in packaged app when browser resolution succeeds", async () => {
    electronMocks.app.isPackaged = true;
    const handler = handlers.get("csv:process");
    vi.mocked(resolveReceitaBrowserPath).mockReturnValue(
      "C:\\Consulta\\resources\\playwright-browsers\\win64\\chromium-1208\\chrome-win64\\chrome.exe",
    );
    const createSimplesLookupProvider = await import(
      "../../src/core/simples/simples-provider.factory"
    );
    const processCsvUseCase = await import(
      "../../src/core/app/process-csv.use-case"
    );
    vi.mocked(
      createSimplesLookupProvider.createSimplesLookupProvider,
    ).mockReturnValue({} as never);
    vi.mocked(processCsvUseCase.processCsv).mockResolvedValue({
      outputCsv: "ok",
      summary: null,
      runStatus: "SUCCESS",
    } as never);

    expect(handler).toBeTypeOf("function");

    await expect(
      handler?.(
        { sender: { send: vi.fn() } },
        { content: "cnpj\n47960950000121", provider: "receita-web" },
      ),
    ).resolves.toMatchObject({
      outputCsv: "ok",
      runStatus: "SUCCESS",
    });
  });

  it("rejects direct auto-save when the source path was not selected in this session", async () => {
    const handler = handlers.get("csv:auto-save-output-file");

    await expect(
      handler?.({}, { sourceFilePath: "/tmp/injetado.csv", content: "ok" }),
    ).rejects.toThrow("não foi validado nesta sessão");
  });

  it("allows auto-save only for a source path selected by the file picker", async () => {
    vi.mocked(electronMocks.dialog.showOpenDialog).mockResolvedValue({
      canceled: false,
      filePaths: ["/tmp/entrada.csv"],
    } as never);
    vi.mocked(readFile).mockResolvedValue("cnpj\n47960950000121");
    const pickHandler = handlers.get("csv:pick-input-file");
    const autoSaveHandler = handlers.get("csv:auto-save-output-file");

    await pickHandler?.({});
    await autoSaveHandler?.(
      {},
      { sourceFilePath: "/tmp/entrada.csv", content: "ok" },
    );

    expect(writeFile).toHaveBeenCalledWith(
      "/tmp/entrada-processado.csv",
      "ok",
      "utf8",
    );
  });

  it("skips auto-save during processing when the source path was not selected in this session", async () => {
    const handler = handlers.get("csv:process");
    const createSimplesLookupProvider = await import(
      "../../src/core/simples/simples-provider.factory"
    );
    const processCsvUseCase = await import(
      "../../src/core/app/process-csv.use-case"
    );
    vi.mocked(
      createSimplesLookupProvider.createSimplesLookupProvider,
    ).mockReturnValue({} as never);
    vi.mocked(processCsvUseCase.processCsv).mockResolvedValue({
      outputCsv: "ok",
      summary: null,
      runStatus: "SUCCESS",
    } as never);

    await expect(
      handler?.(
        { sender: { send: vi.fn() } },
        {
          content: "cnpj\n47960950000121",
          provider: "mock",
          sourceFilePath: "/tmp/nao-confiavel.csv",
        },
      ),
    ).resolves.toMatchObject({
      outputCsv: "ok",
      savedPath: null,
      warningMessage: expect.stringContaining("auto-save foi ignorado"),
    });
    expect(writeFile).not.toHaveBeenCalled();
  });

  it("redacts source path, current cnpj and saved path from operational logs", async () => {
    vi.mocked(electronMocks.dialog.showOpenDialog).mockResolvedValue({
      canceled: false,
      filePaths: ["/tmp/entrada.csv"],
    } as never);
    vi.mocked(readFile).mockResolvedValue("cnpj\n47960950000121");
    const pickHandler = handlers.get("csv:pick-input-file");
    await pickHandler?.({});

    const handler = handlers.get("csv:process");
    const createSimplesLookupProvider = await import(
      "../../src/core/simples/simples-provider.factory"
    );
    const processCsvUseCase = await import(
      "../../src/core/app/process-csv.use-case"
    );
    vi.mocked(
      createSimplesLookupProvider.createSimplesLookupProvider,
    ).mockReturnValue({} as never);
    vi.mocked(processCsvUseCase.processCsv).mockImplementation(
      async (_content, _provider, options) => {
        options?.onLookupProgress?.({
          completedUniqueLookups: 1,
          totalUniqueLookups: 1,
          currentCnpj: "47960950000121",
          elapsedMs: 100,
          estimatedRemainingMs: 0,
        });

        return {
          outputCsv: "ok",
          summary: null,
          runStatus: "SUCCESS",
        } as never;
      },
    );

    await handler?.(
      { sender: { send: vi.fn() } },
      {
        content: "cnpj\n47960950000121",
        provider: "mock",
        sourceFilePath: "/tmp/entrada.csv",
      },
    );

    expect(consoleInfoSpy).toHaveBeenCalledWith(
      "[csv] processamento iniciado",
      {
        provider: "mock",
        hasSourceFilePath: true,
      },
    );
    expect(consoleInfoSpy).toHaveBeenCalledWith("[csv] progresso", {
      completedUniqueLookups: 1,
      totalUniqueLookups: 1,
      elapsedMs: 100,
      estimatedRemainingMs: 0,
    });
    expect(consoleInfoSpy).toHaveBeenCalledWith(
      "[csv] processamento finalizado",
      {
        runStatus: "SUCCESS",
        elapsedMs: expect.any(Number),
        savedAutomatically: true,
      },
    );
  });
});

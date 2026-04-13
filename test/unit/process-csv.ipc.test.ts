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

  it("reports receita-web availability in app defaults based on packaging", async () => {
    const handler = handlers.get("app:get-defaults");
    vi.mocked(loadProviderConfig).mockReturnValue("mock");
    electronMocks.app.isPackaged = true;

    const defaults = await handler?.();

    expect(defaults).toEqual({
      provider: "mock",
      receitaWebAvailable: true,
    });
  });

  it("keeps receita-web as default even in packaged app without system browser", () => {
    vi.mocked(loadProviderConfig).mockReturnValue("receita-web");
    electronMocks.app.isPackaged = true;

    const provider = resolveDefaultProvider();

    expect(provider).toBe("receita-web");
  });

  it("allows receita-web processing in packaged app and delegates browser resolution to runtime", async () => {
    electronMocks.app.isPackaged = true;
    const handler = handlers.get("csv:process");
    const createSimplesLookupProvider = await import(
      "../../src/core/simples/simples-provider.factory"
    );
    const processCsvUseCase = await import(
      "../../src/core/app/process-csv.use-case"
    );
    vi.mocked(createSimplesLookupProvider.createSimplesLookupProvider).mockReturnValue(
      {} as never,
    );
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
});

import { beforeEach, describe, expect, it, vi } from "vitest";

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

import { PROCESS_CSV_DELIVERY_OPTION_ID } from "../../src/core/app/process-csv.types";
import { processCsv } from "../../src/core/app/process-csv.use-case";
import { FISCAL_EXPORT_DELIVERY_OPTION_ID } from "../../src/core/export/export-contract";
import { createSimplesLookupProvider } from "../../src/core/simples/simples-provider.factory";
import { registerCsvIpc } from "../../src/main/ipc/process-csv.ipc";

describe("process-csv IPC delivery selection", () => {
  beforeEach(() => {
    handlers.clear();
    vi.clearAllMocks();
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

  it("passes current CSV delivery option ids before starting processing", async () => {
    const handler = handlers.get("csv:process");

    await expect(
      handler?.(
        { sender: { send: vi.fn() } },
        {
          content: "cnpj\n00000000000191",
          deliveryOptionId: PROCESS_CSV_DELIVERY_OPTION_ID.PRESERVE_COLUMNS_CSV,
          provider: "mock",
        },
      ),
    ).resolves.toMatchObject({
      delivery: {
        format: "csv",
      },
      runStatus: "SUCCESS",
    });

    expect(processCsv).toHaveBeenCalledWith(
      {
        content: "cnpj\n00000000000191",
        format: "csv",
      },
      expect.any(Object),
      expect.objectContaining({
        deliveryOptionId: PROCESS_CSV_DELIVERY_OPTION_ID.PRESERVE_COLUMNS_CSV,
        executionLedger: ledgerMocks.session,
      }),
    );
  });

  it("passes current XLSX delivery option ids before starting processing", async () => {
    const handler = handlers.get("csv:process");
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
      handler?.(
        { sender: { send: vi.fn() } },
        {
          content: "cnpj\n00000000000191",
          deliveryOptionId:
            PROCESS_CSV_DELIVERY_OPTION_ID.CURRENT_RESULT_WORKBOOK,
          provider: "mock",
        },
      ),
    ).resolves.toMatchObject({
      delivery: {
        format: "xlsx",
      },
      outputXlsx: [80, 75, 3, 4],
    });

    expect(processCsv).toHaveBeenCalledWith(
      {
        content: "cnpj\n00000000000191",
        format: "csv",
      },
      expect.any(Object),
      expect.objectContaining({
        deliveryOptionId:
          PROCESS_CSV_DELIVERY_OPTION_ID.CURRENT_RESULT_WORKBOOK,
        executionLedger: ledgerMocks.session,
      }),
    );
  });

  it.each([
    {
      deliveryOptionId: "",
      message: "Opcao de entrega desconhecida",
    },
    {
      deliveryOptionId: "unknown-delivery-option",
      message: "Opcao de entrega desconhecida",
    },
    {
      deliveryOptionId: FISCAL_EXPORT_DELIVERY_OPTION_ID.NORMALIZED_WORKBOOK,
      message: "Opcao de entrega indisponivel",
    },
    {
      deliveryOptionId: FISCAL_EXPORT_DELIVERY_OPTION_ID.EXECUTIVE_PDF,
      message: "Opcao de entrega indisponivel",
    },
    {
      deliveryOptionId: FISCAL_EXPORT_DELIVERY_OPTION_ID.DETAILED_JSON,
      message: "Opcao de entrega indisponivel",
    },
  ])("rejects non-executable delivery option $deliveryOptionId before starting processing", async ({
    deliveryOptionId,
    message,
  }) => {
    const handler = handlers.get("csv:process");

    await expect(
      handler?.(
        { sender: { send: vi.fn() } },
        {
          content: "cnpj\n00000000000191",
          deliveryOptionId,
          provider: "mock",
        },
      ),
    ).rejects.toThrow(message);

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

  it("rejects non-executable delivery option ids before resolving resume history", async () => {
    const handler = handlers.get("csv:resume-execution");

    await expect(
      handler?.(
        { sender: { send: vi.fn() } },
        {
          deliveryOptionId: FISCAL_EXPORT_DELIVERY_OPTION_ID.EXECUTIVE_PDF,
          ledgerKey: "mock-0123456789abcdef01234567.json",
        },
      ),
    ).rejects.toThrow("Opcao de entrega indisponivel");

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
});

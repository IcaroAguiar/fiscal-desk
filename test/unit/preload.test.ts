import { describe, expect, it, vi } from "vitest";

const electronMocks = vi.hoisted(() => ({
  exposed: {} as Record<string, Record<string, unknown>>,
  ipcRenderer: {
    invoke: vi.fn(),
    off: vi.fn(),
    on: vi.fn(),
  },
}));

vi.mock("electron", () => ({
  contextBridge: {
    exposeInMainWorld: vi.fn((name: string, api: Record<string, unknown>) => {
      electronMocks.exposed[name] = api;
    }),
  },
  ipcRenderer: electronMocks.ipcRenderer,
}));

import {
  PROCESS_CSV_DELIVERY_OPTION_ID,
  PROCESS_CSV_EXECUTION_SPEED_PROFILE,
  PROCESS_CSV_IPC_CHANNEL,
} from "../../src/core/app/process-csv.types";

await import("../../src/main/preload");

describe("preload appBridge", () => {
  it("forwards current delivery option ids through processCsv", async () => {
    const appBridge = electronMocks.exposed.appBridge as {
      processCsv: (input: Record<string, unknown>) => Promise<unknown>;
    };

    await appBridge.processCsv({
      content: "cnpj\n11222333000181",
      deliveryOptionId: PROCESS_CSV_DELIVERY_OPTION_ID.PRESERVE_COLUMNS_CSV,
      executionSpeedProfile: PROCESS_CSV_EXECUTION_SPEED_PROFILE.FAST,
      provider: "mock",
    });

    expect(electronMocks.ipcRenderer.invoke).toHaveBeenCalledWith(
      PROCESS_CSV_IPC_CHANNEL.PROCESS,
      {
        content: "cnpj\n11222333000181",
        deliveryOptionId: PROCESS_CSV_DELIVERY_OPTION_ID.PRESERVE_COLUMNS_CSV,
        executionSpeedProfile: PROCESS_CSV_EXECUTION_SPEED_PROFILE.FAST,
        provider: "mock",
      },
    );
  });

  it("forwards XLSX input format through processCsv", async () => {
    const appBridge = electronMocks.exposed.appBridge as {
      processCsv: (input: Record<string, unknown>) => Promise<unknown>;
    };

    await appBridge.processCsv({
      content: [80, 75, 3, 4],
      inputFormat: "xlsx",
      provider: "mock",
      sourceFilePath: "/tmp/entrada.xlsx",
    });

    expect(electronMocks.ipcRenderer.invoke).toHaveBeenCalledWith(
      PROCESS_CSV_IPC_CHANNEL.PROCESS,
      {
        content: [80, 75, 3, 4],
        inputFormat: "xlsx",
        provider: "mock",
        sourceFilePath: "/tmp/entrada.xlsx",
      },
    );
  });

  it("forwards current delivery option ids through resumeExecution", async () => {
    const appBridge = electronMocks.exposed.appBridge as {
      resumeExecution: (
        ledgerKey: string,
        deliveryFormat?: string,
        acceptedLocalPublicBaseNotice?: boolean,
        deliveryOptionId?: string,
        executionSpeedProfile?: string,
      ) => Promise<unknown>;
    };

    await appBridge.resumeExecution(
      "mock-0123456789abcdef01234567.json",
      undefined,
      undefined,
      PROCESS_CSV_DELIVERY_OPTION_ID.CURRENT_RESULT_WORKBOOK,
      PROCESS_CSV_EXECUTION_SPEED_PROFILE.MAXIMUM,
    );

    expect(electronMocks.ipcRenderer.invoke).toHaveBeenCalledWith(
      PROCESS_CSV_IPC_CHANNEL.RESUME_EXECUTION,
      {
        deliveryOptionId:
          PROCESS_CSV_DELIVERY_OPTION_ID.CURRENT_RESULT_WORKBOOK,
        executionSpeedProfile: PROCESS_CSV_EXECUTION_SPEED_PROFILE.MAXIMUM,
        ledgerKey: "mock-0123456789abcdef01234567.json",
      },
    );
  });

  it("forwards pause processing requests through the dedicated IPC channel", async () => {
    const appBridge = electronMocks.exposed.appBridge as {
      pauseProcessing: () => Promise<unknown>;
    };

    await appBridge.pauseProcessing();

    expect(electronMocks.ipcRenderer.invoke).toHaveBeenCalledWith(
      PROCESS_CSV_IPC_CHANNEL.PAUSE_PROCESSING,
    );
  });

  it("forwards pending CNPJ export requests through the dedicated IPC channel", async () => {
    const appBridge = electronMocks.exposed.appBridge as {
      exportPendingCnpjs: (ledgerKey: string) => Promise<unknown>;
    };

    await appBridge.exportPendingCnpjs("mock-0123456789abcdef01234567.json");

    expect(electronMocks.ipcRenderer.invoke).toHaveBeenCalledWith(
      PROCESS_CSV_IPC_CHANNEL.EXPORT_PENDING_CNPJS,
      { ledgerKey: "mock-0123456789abcdef01234567.json" },
    );
  });

  it("forwards processed CSV completion requests with the selected provider", async () => {
    const appBridge = electronMocks.exposed.appBridge as {
      completeProcessedCsv: (
        ledgerKey: string,
        provider: string,
      ) => Promise<unknown>;
    };

    await appBridge.completeProcessedCsv(
      "mock-0123456789abcdef01234567.json",
      "cnpja-open",
    );

    expect(electronMocks.ipcRenderer.invoke).toHaveBeenCalledWith(
      PROCESS_CSV_IPC_CHANNEL.COMPLETE_PROCESSED_CSV,
      {
        ledgerKey: "mock-0123456789abcdef01234567.json",
        provider: "cnpja-open",
      },
    );
  });

  it("forwards local public base preparation input", async () => {
    const appBridge = electronMocks.exposed.appBridge as {
      prepareLocalPublicBase: (
        input: Record<string, unknown>,
      ) => Promise<unknown>;
    };
    const input = {
      consent: {
        acceptedAt: "2026-06-13T12:00:00.000Z",
        noticeVersion: "base-publica-local-v1",
      },
      content: "cnpj;razao_social\n11222333000181;Empresa Teste",
      sourceFileName: "base-publica.csv",
      sourceFilePath: "/tmp/base-publica.csv",
    };

    await appBridge.prepareLocalPublicBase(input);

    expect(electronMocks.ipcRenderer.invoke).toHaveBeenCalledWith(
      "local-public-base:prepare",
      input,
    );
  });

  it("forwards official local public base source discovery", async () => {
    const appBridge = electronMocks.exposed.appBridge as {
      discoverLocalPublicBaseOfficialSource: () => Promise<unknown>;
    };

    await appBridge.discoverLocalPublicBaseOfficialSource();

    expect(electronMocks.ipcRenderer.invoke).toHaveBeenCalledWith(
      "local-public-base:discover-official-source",
    );
  });

  it("forwards official local public base preparation input", async () => {
    const appBridge = electronMocks.exposed.appBridge as {
      prepareLocalPublicBaseOfficialSource: (
        input: Record<string, unknown>,
      ) => Promise<unknown>;
    };
    const input = {
      consent: {
        accepted: true,
        acceptedAt: "2026-06-14T12:00:00.000Z",
        baseDateAcknowledged: "2026-01",
        stalenessWarningAcknowledged:
          "Base Pública Local preparada automaticamente.",
      },
    };

    await appBridge.prepareLocalPublicBaseOfficialSource(input);

    expect(electronMocks.ipcRenderer.invoke).toHaveBeenCalledWith(
      "local-public-base:prepare-official-source",
      input,
    );
  });
});

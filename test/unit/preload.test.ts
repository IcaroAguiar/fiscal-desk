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
  PROCESS_CSV_IPC_CHANNEL,
} from "../../src/core/app/process-csv.types";

await import("../../src/main/preload");

describe("preload appBridge", () => {
  it("forwards current delivery option ids through processCsv", async () => {
    const appBridge = electronMocks.exposed.appBridge as {
      processCsv: (input: Record<string, unknown>) => Promise<unknown>;
    };

    await appBridge.processCsv({
      content: "cnpj\n00000000000191",
      deliveryOptionId: PROCESS_CSV_DELIVERY_OPTION_ID.PRESERVE_COLUMNS_CSV,
      provider: "mock",
    });

    expect(electronMocks.ipcRenderer.invoke).toHaveBeenCalledWith(
      PROCESS_CSV_IPC_CHANNEL.PROCESS,
      {
        content: "cnpj\n00000000000191",
        deliveryOptionId: PROCESS_CSV_DELIVERY_OPTION_ID.PRESERVE_COLUMNS_CSV,
        provider: "mock",
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
      ) => Promise<unknown>;
    };

    await appBridge.resumeExecution(
      "mock-0123456789abcdef01234567.json",
      undefined,
      undefined,
      PROCESS_CSV_DELIVERY_OPTION_ID.CURRENT_RESULT_WORKBOOK,
    );

    expect(electronMocks.ipcRenderer.invoke).toHaveBeenCalledWith(
      PROCESS_CSV_IPC_CHANNEL.RESUME_EXECUTION,
      {
        deliveryOptionId:
          PROCESS_CSV_DELIVERY_OPTION_ID.CURRENT_RESULT_WORKBOOK,
        ledgerKey: "mock-0123456789abcdef01234567.json",
      },
    );
  });
});

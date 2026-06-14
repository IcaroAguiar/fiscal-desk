import { contextBridge, ipcRenderer } from "electron";

import { PROCESS_CSV_IPC_CHANNEL } from "../core/app/process-csv.types";
import type { SimplesProviderName } from "../core/simples/simples-provider.names";
import type {
  LocalPublicBasePreparationConsent,
  LocalPublicBasePrepareResult,
  LocalPublicBaseStatus,
  LookupProgress,
  ProcessCsvDeliveryFormat,
  ProcessCsvDeliveryOptionId,
  ProcessCsvExecution,
  ProcessCsvInputFormat,
  ProcessCsvOutputDelivery,
  ProcessCsvRunStatus,
  ProcessCsvSummary,
  ProcessExecutionHistoryItem,
} from "./types";

type PickCsvResult = {
  filePath: string;
  fileName: string;
  content: string | number[];
  inputFormat: ProcessCsvInputFormat;
};

type PickLocalPublicBaseSourceResult = {
  filePath: string;
  fileName: string;
  content: string;
};

type ProcessCsvInput = {
  acceptedLocalPublicBaseNotice?: boolean;
  content: string | number[];
  deliveryFormat?: ProcessCsvDeliveryFormat;
  deliveryOptionId?: ProcessCsvDeliveryOptionId;
  inputFormat?: ProcessCsvInputFormat;
  provider: SimplesProviderName;
  cnpjColumn?: string;
  sourceFilePath?: string;
};

type ProcessCsvResult = {
  delivery: ProcessCsvOutputDelivery;
  outputCsv: string;
  outputXlsx: number[] | null;
  summary: ProcessCsvSummary;
  runStatus: ProcessCsvRunStatus;
  execution: ProcessCsvExecution | null;
  savedPath: string | null;
  warningMessage: string | null;
};

type AppDefaults = {
  localPublicBaseStatus: LocalPublicBaseStatus;
  provider: SimplesProviderName;
  receitaWebAvailable: boolean;
};

contextBridge.exposeInMainWorld("appBridge", {
  pickCsvFile: (): Promise<PickCsvResult | null> => {
    return ipcRenderer.invoke(PROCESS_CSV_IPC_CHANNEL.PICK_INPUT_FILE);
  },
  processCsv: (input: ProcessCsvInput): Promise<ProcessCsvResult> => {
    return ipcRenderer.invoke(PROCESS_CSV_IPC_CHANNEL.PROCESS, input);
  },
  cancelProcessing: (): Promise<boolean> => {
    return ipcRenderer.invoke(PROCESS_CSV_IPC_CHANNEL.CANCEL_PROCESSING);
  },
  saveCsvFile: (
    defaultName: string,
    content: string,
  ): Promise<string | null> => {
    return ipcRenderer.invoke(PROCESS_CSV_IPC_CHANNEL.SAVE_OUTPUT_FILE, {
      defaultName,
      format: "csv",
      content,
    });
  },
  saveOutputFile: (
    defaultName: string,
    format: ProcessCsvDeliveryFormat,
    content: string | number[],
  ): Promise<string | null> => {
    return ipcRenderer.invoke(PROCESS_CSV_IPC_CHANNEL.SAVE_OUTPUT_FILE, {
      content,
      defaultName,
      format,
    });
  },
  autoSaveCsvFile: (
    sourceFilePath: string,
    content: string,
  ): Promise<string> => {
    return ipcRenderer.invoke(PROCESS_CSV_IPC_CHANNEL.AUTO_SAVE_OUTPUT_FILE, {
      sourceFilePath,
      content,
    });
  },
  onLookupProgress: (
    callback: (progress: LookupProgress) => void,
  ): (() => void) => {
    const listener = (_event: unknown, progress: LookupProgress) => {
      callback(progress);
    };

    ipcRenderer.on(PROCESS_CSV_IPC_CHANNEL.LOOKUP_PROGRESS, listener);

    return () => {
      ipcRenderer.off(PROCESS_CSV_IPC_CHANNEL.LOOKUP_PROGRESS, listener);
    };
  },
  getDefaults: (): Promise<AppDefaults> => {
    return ipcRenderer.invoke("app:get-defaults");
  },
  getLocalPublicBaseStatus: (): Promise<LocalPublicBaseStatus> => {
    return ipcRenderer.invoke("local-public-base:get-status");
  },
  pickLocalPublicBaseSourceFile:
    (): Promise<PickLocalPublicBaseSourceResult | null> => {
      return ipcRenderer.invoke("local-public-base:pick-source-file");
    },
  prepareLocalPublicBase: (input: {
    content: string;
    consent?: LocalPublicBasePreparationConsent;
    sourceFileName: string;
    sourceFilePath: string;
  }): Promise<LocalPublicBasePrepareResult> => {
    return ipcRenderer.invoke("local-public-base:prepare", input);
  },
  listExecutions: (): Promise<ProcessExecutionHistoryItem[]> => {
    return ipcRenderer.invoke(PROCESS_CSV_IPC_CHANNEL.LIST_EXECUTIONS);
  },
  resumeExecution: (
    ledgerKey: string,
    deliveryFormat?: ProcessCsvDeliveryFormat,
    acceptedLocalPublicBaseNotice?: boolean,
    deliveryOptionId?: ProcessCsvDeliveryOptionId,
  ): Promise<ProcessCsvResult> => {
    return ipcRenderer.invoke(PROCESS_CSV_IPC_CHANNEL.RESUME_EXECUTION, {
      ...(acceptedLocalPublicBaseNotice
        ? { acceptedLocalPublicBaseNotice }
        : {}),
      ...(deliveryFormat ? { deliveryFormat } : {}),
      ...(deliveryOptionId ? { deliveryOptionId } : {}),
      ledgerKey,
    });
  },
});

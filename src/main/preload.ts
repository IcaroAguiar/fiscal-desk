import { contextBridge, ipcRenderer } from "electron";

import { PROCESS_CSV_IPC_CHANNEL } from "../core/app/process-csv.types";
import type { SimplesProviderName } from "../core/simples/simples-provider.names";
import type {
  CompleteProcessedCsvResult,
  ExportPendingCnpjsResult,
  LocalPublicBaseOfficialSource,
  LocalPublicBasePreparationConsent,
  LocalPublicBasePrepareResult,
  LocalPublicBaseStatus,
  LookupProgress,
  ProcessCsvDeliveryFormat,
  ProcessCsvDeliveryOptionId,
  ProcessCsvExecution,
  ProcessCsvExecutionSpeedProfile,
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
  acceptedReceitaWebExperimentalNotice?: boolean;
  content: string | number[];
  deliveryFormat?: ProcessCsvDeliveryFormat;
  deliveryOptionId?: ProcessCsvDeliveryOptionId;
  executionSpeedProfile?: ProcessCsvExecutionSpeedProfile;
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
  pauseProcessing: (): Promise<boolean> => {
    return ipcRenderer.invoke(PROCESS_CSV_IPC_CHANNEL.PAUSE_PROCESSING);
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
  discoverLocalPublicBaseOfficialSource:
    (): Promise<LocalPublicBaseOfficialSource> => {
      return ipcRenderer.invoke("local-public-base:discover-official-source");
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
  prepareLocalPublicBaseOfficialSource: (input: {
    consent?: LocalPublicBasePreparationConsent;
  }): Promise<LocalPublicBasePrepareResult> => {
    return ipcRenderer.invoke(
      "local-public-base:prepare-official-source",
      input,
    );
  },
  listExecutions: (): Promise<ProcessExecutionHistoryItem[]> => {
    return ipcRenderer.invoke(PROCESS_CSV_IPC_CHANNEL.LIST_EXECUTIONS);
  },
  exportPendingCnpjs: (
    ledgerKey: string,
  ): Promise<ExportPendingCnpjsResult | null> => {
    return ipcRenderer.invoke(PROCESS_CSV_IPC_CHANNEL.EXPORT_PENDING_CNPJS, {
      ledgerKey,
    });
  },
  completeProcessedCsv: (
    ledgerKey: string,
    provider: SimplesProviderName,
    acceptedLocalPublicBaseNotice?: boolean,
    acceptedReceitaWebExperimentalNotice?: boolean,
  ): Promise<CompleteProcessedCsvResult | null> => {
    return ipcRenderer.invoke(PROCESS_CSV_IPC_CHANNEL.COMPLETE_PROCESSED_CSV, {
      ...(acceptedLocalPublicBaseNotice
        ? { acceptedLocalPublicBaseNotice }
        : {}),
      ...(acceptedReceitaWebExperimentalNotice
        ? { acceptedReceitaWebExperimentalNotice }
        : {}),
      ledgerKey,
      provider,
    });
  },
  resumeExecution: (
    ledgerKey: string,
    deliveryFormat?: ProcessCsvDeliveryFormat,
    acceptedLocalPublicBaseNotice?: boolean,
    deliveryOptionId?: ProcessCsvDeliveryOptionId,
    executionSpeedProfile?: ProcessCsvExecutionSpeedProfile,
    acceptedReceitaWebExperimentalNotice?: boolean,
  ): Promise<ProcessCsvResult> => {
    return ipcRenderer.invoke(PROCESS_CSV_IPC_CHANNEL.RESUME_EXECUTION, {
      ...(acceptedLocalPublicBaseNotice
        ? { acceptedLocalPublicBaseNotice }
        : {}),
      ...(acceptedReceitaWebExperimentalNotice
        ? { acceptedReceitaWebExperimentalNotice }
        : {}),
      ...(deliveryFormat ? { deliveryFormat } : {}),
      ...(deliveryOptionId ? { deliveryOptionId } : {}),
      ...(executionSpeedProfile ? { executionSpeedProfile } : {}),
      ledgerKey,
    });
  },
});

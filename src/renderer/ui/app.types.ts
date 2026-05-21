import type { SimplesProviderName } from "../../core/simples/simples-provider.names";
import type {
  LocalPublicBaseStatus,
  LookupProgress,
  ProcessCsvDeliveryFormat,
  ProcessCsvExecution,
  ProcessCsvOutputDelivery,
  ProcessCsvRunStatus,
  ProcessCsvSummary,
  ProcessExecutionHistoryItem,
} from "../../main/types";

export type PickCsvResult = {
  filePath: string;
  fileName: string;
  content: string;
};

export type ProcessCsvResult = {
  delivery: ProcessCsvOutputDelivery;
  outputCsv: string;
  outputXlsx: number[] | null;
  summary: ProcessCsvSummary;
  runStatus: ProcessCsvRunStatus;
  execution: ProcessCsvExecution | null;
  savedPath: string | null;
  warningMessage: string | null;
};

export type AppBridge = {
  pickCsvFile(): Promise<PickCsvResult | null>;
  processCsv(input: {
    acceptedLocalPublicBaseNotice?: boolean;
    content: string;
    deliveryFormat?: ProcessCsvDeliveryFormat;
    provider: SimplesProviderName;
    cnpjColumn?: string;
    sourceFilePath?: string;
  }): Promise<ProcessCsvResult>;
  cancelProcessing(): Promise<boolean>;
  saveCsvFile(defaultName: string, content: string): Promise<string | null>;
  saveOutputFile(
    defaultName: string,
    format: ProcessCsvDeliveryFormat,
    content: string | number[],
  ): Promise<string | null>;
  autoSaveCsvFile(sourceFilePath: string, content: string): Promise<string>;
  onLookupProgress(callback: (progress: LookupProgress) => void): () => void;
  getDefaults(): Promise<{
    localPublicBaseStatus: LocalPublicBaseStatus;
    provider: SimplesProviderName;
    receitaWebAvailable: boolean;
  }>;
  listExecutions(): Promise<ProcessExecutionHistoryItem[]>;
  resumeExecution(
    ledgerKey: string,
    deliveryFormat?: ProcessCsvDeliveryFormat,
    acceptedLocalPublicBaseNotice?: boolean,
  ): Promise<ProcessCsvResult>;
};

declare global {
  interface Window {
    appBridge: AppBridge;
  }
}

export type UiStatus =
  | "idle"
  | "loading"
  | "processing"
  | "success"
  | "cancelled"
  | "error";

export type UiState = {
  fileName: string | null;
  filePath: string | null;
  content: string | null;
  provider: SimplesProviderName;
  deliveryFormat: ProcessCsvDeliveryFormat;
  localPublicBaseNoticeAccepted: boolean;
  localPublicBaseStatus: LocalPublicBaseStatus | null;
  receitaWebAvailable: boolean;
  cnpjColumn: string;
  status: UiStatus;
  message: string;
  outputCsv: string | null;
  outputXlsx: number[] | null;
  outputDelivery: ProcessCsvOutputDelivery | null;
  summary: ProcessCsvSummary | null;
  execution: ProcessCsvExecution | null;
  savedPath: string | null;
  progress: LookupProgress | null;
  executionHistory: ProcessExecutionHistoryItem[];
  historyStatus: "loading" | "ready" | "error";
  progressObservedAt: number | null;
  now: number;
};

export const initialState: UiState = {
  fileName: null,
  filePath: null,
  content: null,
  provider: "mock",
  deliveryFormat: "csv",
  localPublicBaseNoticeAccepted: false,
  localPublicBaseStatus: null,
  receitaWebAvailable: false,
  cnpjColumn: "",
  status: "idle",
  message: "Selecione um CSV para iniciar uma execução local.",
  outputCsv: null,
  outputXlsx: null,
  outputDelivery: null,
  summary: null,
  execution: null,
  savedPath: null,
  progress: null,
  executionHistory: [],
  historyStatus: "loading",
  progressObservedAt: null,
  now: Date.now(),
};

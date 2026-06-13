import type { SimplesProviderName } from "../../core/simples/simples-provider.names";
import type {
  LocalPublicBasePreparationConsent,
  LocalPublicBasePrepareResult,
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
  getLocalPublicBaseStatus(): Promise<LocalPublicBaseStatus>;
  pickLocalPublicBaseSourceFile(): Promise<PickCsvResult | null>;
  prepareLocalPublicBase(input: {
    content: string;
    consent?: LocalPublicBasePreparationConsent;
    sourceFileName: string;
    sourceFilePath: string;
  }): Promise<LocalPublicBasePrepareResult>;
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

export type UiView =
  | "painel"
  | "fila"
  | "resultados"
  | "atividade"
  | "historico";

export type VisualFixture = {
  scenario: "reference-v5-a";
  providerPrimaryStatus: string;
  providerSecondaryStatus: string;
  fileStatus: string;
  entryTitle: string;
  entryHint: string;
  queueCount: string;
  queueRows: Array<{
    fileName: string;
    statusHint: string;
    status: string;
  }>;
  kpis: Array<{
    label: string;
    value: string;
    detail: string;
  }>;
  historyRows: Array<{
    fileName: string;
    status: string;
    rowCount: number;
    provider: string;
    resultStatus: string;
  }>;
  logs: string[];
  outputText: string;
  outputFormat: string;
};

export type UiState = {
  visualFixture: VisualFixture | null;
  activeView: UiView;
  fileName: string | null;
  filePath: string | null;
  content: string | null;
  provider: SimplesProviderName;
  deliveryFormat: ProcessCsvDeliveryFormat;
  localPublicBaseNoticeAccepted: boolean;
  localPublicBaseStatus: LocalPublicBaseStatus | null;
  localPublicBasePrepareStatus: "idle" | "loading" | "success" | "error";
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
  visualFixture: null,
  activeView: "painel",
  fileName: null,
  filePath: null,
  content: null,
  provider: "mock",
  deliveryFormat: "csv",
  localPublicBaseNoticeAccepted: false,
  localPublicBaseStatus: null,
  localPublicBasePrepareStatus: "idle",
  receitaWebAvailable: false,
  cnpjColumn: "",
  status: "idle",
  message: "Selecione um CSV para iniciar a consulta.",
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

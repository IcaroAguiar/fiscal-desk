import type { SimplesProviderName } from "../../core/simples/simples-provider.names";
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
} from "../../main/types";
import { PROCESS_CSV_EXECUTION_SPEED_PROFILE } from "../../main/types";

export type PickCsvResult = {
  filePath: string;
  fileName: string;
  content: string | number[];
  inputFormat: ProcessCsvInputFormat;
};

export type PickLocalPublicBaseSourceResult = {
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
    acceptedReceitaWebExperimentalNotice?: boolean;
    content: string | number[];
    deliveryFormat?: ProcessCsvDeliveryFormat;
    executionSpeedProfile?: ProcessCsvExecutionSpeedProfile;
    inputFormat?: ProcessCsvInputFormat;
    provider: SimplesProviderName;
    cnpjColumn?: string;
    sourceFilePath?: string;
  }): Promise<ProcessCsvResult>;
  cancelProcessing(): Promise<boolean>;
  pauseProcessing(): Promise<boolean>;
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
  discoverLocalPublicBaseOfficialSource(): Promise<LocalPublicBaseOfficialSource>;
  pickLocalPublicBaseSourceFile(): Promise<PickLocalPublicBaseSourceResult | null>;
  prepareLocalPublicBase(input: {
    content: string;
    consent?: LocalPublicBasePreparationConsent;
    sourceFileName: string;
    sourceFilePath: string;
  }): Promise<LocalPublicBasePrepareResult>;
  prepareLocalPublicBaseOfficialSource(input: {
    consent?: LocalPublicBasePreparationConsent;
  }): Promise<LocalPublicBasePrepareResult>;
  listExecutions(): Promise<ProcessExecutionHistoryItem[]>;
  exportPendingCnpjs(
    ledgerKey: string,
  ): Promise<ExportPendingCnpjsResult | null>;
  completeProcessedCsv(
    ledgerKey: string,
    provider: SimplesProviderName,
    acceptedLocalPublicBaseNotice?: boolean,
    acceptedReceitaWebExperimentalNotice?: boolean,
  ): Promise<CompleteProcessedCsvResult | null>;
  resumeExecution(
    ledgerKey: string,
    deliveryFormat?: ProcessCsvDeliveryFormat,
    acceptedLocalPublicBaseNotice?: boolean,
    deliveryOptionId?: ProcessCsvDeliveryOptionId,
    executionSpeedProfile?: ProcessCsvExecutionSpeedProfile,
    acceptedReceitaWebExperimentalNotice?: boolean,
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
  content: string | number[] | null;
  inputFormat: ProcessCsvInputFormat;
  provider: SimplesProviderName;
  deliveryFormat: ProcessCsvDeliveryFormat;
  executionSpeedProfile: ProcessCsvExecutionSpeedProfile;
  localPublicBaseNoticeAccepted: boolean;
  receitaWebExperimentalNoticeAccepted: boolean;
  localPublicBaseOfficialSource: LocalPublicBaseOfficialSource | null;
  localPublicBaseOfficialSourceStatus: "idle" | "loading" | "ready" | "error";
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
  processingStopIntent: "cancel" | "pause" | null;
  progressObservedAt: number | null;
  now: number;
};

export const initialState: UiState = {
  visualFixture: null,
  activeView: "painel",
  fileName: null,
  filePath: null,
  content: null,
  inputFormat: "csv",
  provider: "mock",
  deliveryFormat: "csv",
  executionSpeedProfile: PROCESS_CSV_EXECUTION_SPEED_PROFILE.BALANCED,
  localPublicBaseNoticeAccepted: false,
  receitaWebExperimentalNoticeAccepted: false,
  localPublicBaseOfficialSource: null,
  localPublicBaseOfficialSourceStatus: "idle",
  localPublicBaseStatus: null,
  localPublicBasePrepareStatus: "idle",
  receitaWebAvailable: false,
  cnpjColumn: "",
  status: "idle",
  message: "Selecione uma planilha CSV ou Excel para iniciar a consulta.",
  outputCsv: null,
  outputXlsx: null,
  outputDelivery: null,
  summary: null,
  execution: null,
  savedPath: null,
  progress: null,
  executionHistory: [],
  historyStatus: "loading",
  processingStopIntent: null,
  progressObservedAt: null,
  now: Date.now(),
};

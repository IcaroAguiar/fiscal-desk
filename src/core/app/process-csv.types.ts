import { FISCAL_EXPORT_DELIVERY_OPTION_ID } from "../export/export-contract";
import { FISCAL_INGESTION_INPUT_FORMAT } from "../ingestion/ingestion-contract";
import type { SimplesProviderName } from "../simples/simples-provider.names";

export const PROCESS_CSV_INPUT_FORMAT = {
  CSV: FISCAL_INGESTION_INPUT_FORMAT.CSV,
  XLSX: FISCAL_INGESTION_INPUT_FORMAT.XLSX,
} as const;

export type ProcessCsvInputFormat =
  (typeof PROCESS_CSV_INPUT_FORMAT)[keyof typeof PROCESS_CSV_INPUT_FORMAT];

export const PROCESS_CSV_DELIVERY_FORMAT = {
  CSV: "csv",
  XLSX: "xlsx",
} as const;

export type ProcessCsvDeliveryFormat =
  (typeof PROCESS_CSV_DELIVERY_FORMAT)[keyof typeof PROCESS_CSV_DELIVERY_FORMAT];

export const PROCESS_CSV_DELIVERY_OPTION_ID = {
  CURRENT_RESULT_WORKBOOK:
    FISCAL_EXPORT_DELIVERY_OPTION_ID.CURRENT_RESULT_WORKBOOK,
  PRESERVE_COLUMNS_CSV: FISCAL_EXPORT_DELIVERY_OPTION_ID.PRESERVE_COLUMNS_CSV,
} as const;

export type ProcessCsvDeliveryOptionId =
  (typeof PROCESS_CSV_DELIVERY_OPTION_ID)[keyof typeof PROCESS_CSV_DELIVERY_OPTION_ID];

export type ProcessCsvSummary = {
  totalLinhas: number;
  totalCnpjsEncontrados: number;
  totalCnpjsValidos: number;
  totalCnpjsUnicosConsultados: number;
  totalCnpjsRetomados: number;
  totalOptantesSimples: number;
  totalNaoOptantesSimples: number;
  totalErros: number;
};

export type LookupProgress = {
  completedUniqueLookups: number;
  totalUniqueLookups: number;
  currentCnpj: string;
  elapsedMs: number;
  estimatedRemainingMs: number;
};

export const PROCESS_CSV_RUN_STATUS = {
  CANCELLED: "CANCELLED",
  SUCCESS: "SUCCESS",
} as const;

export type ProcessCsvRunStatus =
  (typeof PROCESS_CSV_RUN_STATUS)[keyof typeof PROCESS_CSV_RUN_STATUS];

export const PROCESS_CSV_EXECUTION_STATUS = {
  RUNNING: "RUNNING",
  SUCCESS: PROCESS_CSV_RUN_STATUS.SUCCESS,
  CANCELLED: PROCESS_CSV_RUN_STATUS.CANCELLED,
  FAILED: "FAILED",
} as const;

export type ProcessCsvExecutionStatus =
  (typeof PROCESS_CSV_EXECUTION_STATUS)[keyof typeof PROCESS_CSV_EXECUTION_STATUS];

export const PROCESS_CSV_TERMINAL_EXECUTION_STATUSES = [
  PROCESS_CSV_EXECUTION_STATUS.SUCCESS,
  PROCESS_CSV_EXECUTION_STATUS.CANCELLED,
  PROCESS_CSV_EXECUTION_STATUS.FAILED,
] as const satisfies readonly ProcessCsvExecutionStatus[];

export type ProcessCsvTerminalExecutionStatus =
  (typeof PROCESS_CSV_TERMINAL_EXECUTION_STATUSES)[number];

export type ProcessCsvExecution = {
  runId: string;
  status: ProcessCsvExecutionStatus;
  checkpointPath: string | null;
  completedUniqueLookups: number;
  totalUniqueLookups: number;
  resumedUniqueLookups: number;
};

export type ProcessCsvExecutionBoundary = {
  owner: "core" | "main" | "renderer";
  responsibility: string;
};

export const PROCESS_CSV_EXECUTION_BOUNDARIES = {
  CORE: {
    owner: "core",
    responsibility:
      "Owns CSV ingestion orchestration, lookup progress, summary, delivery metadata and execution status semantics.",
  },
  MAIN: {
    owner: "main",
    responsibility:
      "Owns IPC channel binding, local ledger persistence, cancellation wiring, output paths and OS integration.",
  },
  RENDERER: {
    owner: "renderer",
    responsibility:
      "Consumes typed snapshots and events only; it must not invent execution statuses or provider-specific rules.",
  },
} as const satisfies Record<string, ProcessCsvExecutionBoundary>;

export const PROCESS_CSV_EVENT_KIND = {
  EXECUTION_STATE_CHANGED: "execution-state-changed",
  LOOKUP_PROGRESS_REPORTED: "lookup-progress-reported",
  OUTPUT_DELIVERY_READY: "output-delivery-ready",
  EXECUTION_ERROR_REPORTED: "execution-error-reported",
} as const;

export type ProcessCsvEventKind =
  (typeof PROCESS_CSV_EVENT_KIND)[keyof typeof PROCESS_CSV_EVENT_KIND];

export type ProcessCsvExecutionStateChangedEvent = {
  kind: typeof PROCESS_CSV_EVENT_KIND.EXECUTION_STATE_CHANGED;
  payload: {
    execution: ProcessCsvExecution;
    previousStatus: ProcessCsvExecutionStatus | null;
    occurredAt: string;
  };
};

export type ProcessCsvLookupProgressReportedEvent = {
  kind: typeof PROCESS_CSV_EVENT_KIND.LOOKUP_PROGRESS_REPORTED;
  payload: {
    execution: ProcessCsvExecution;
    occurredAt: string;
    progress: LookupProgress;
  };
};

export type ProcessCsvOutputDeliveryReadyEvent = {
  kind: typeof PROCESS_CSV_EVENT_KIND.OUTPUT_DELIVERY_READY;
  payload: {
    delivery: ProcessCsvOutputDelivery;
    execution: ProcessCsvExecution | null;
    outputPath: string | null;
    summary: ProcessCsvSummary;
  };
};

export type ProcessCsvExecutionErrorReportedEvent = {
  kind: typeof PROCESS_CSV_EVENT_KIND.EXECUTION_ERROR_REPORTED;
  payload: {
    execution: ProcessCsvExecution | null;
    message: string;
    occurredAt: string;
    retryable: boolean;
  };
};

export type ProcessCsvDomainEvent =
  | ProcessCsvExecutionStateChangedEvent
  | ProcessCsvLookupProgressReportedEvent
  | ProcessCsvOutputDeliveryReadyEvent
  | ProcessCsvExecutionErrorReportedEvent;

export const PROCESS_CSV_IPC_CHANNEL = {
  AUTO_SAVE_OUTPUT_FILE: "csv:auto-save-output-file",
  CANCEL_PROCESSING: "csv:cancel-processing",
  LIST_EXECUTIONS: "csv:list-executions",
  LOOKUP_PROGRESS: "csv:lookup-progress",
  PICK_INPUT_FILE: "csv:pick-input-file",
  PROCESS: "csv:process",
  RESUME_EXECUTION: "csv:resume-execution",
  SAVE_OUTPUT_FILE: "csv:save-output-file",
} as const;

export type ProcessCsvIpcChannel =
  (typeof PROCESS_CSV_IPC_CHANNEL)[keyof typeof PROCESS_CSV_IPC_CHANNEL];

export type ProcessCsvLookupProgressBridgeEvent = {
  channel: typeof PROCESS_CSV_IPC_CHANNEL.LOOKUP_PROGRESS;
  event: LookupProgress;
};

export type ProcessCsvBridgeEvent = ProcessCsvLookupProgressBridgeEvent;

export type ProcessExecutionHistoryItem = {
  ledgerKey: string;
  runId: string;
  status: ProcessCsvExecutionStatus;
  inputFormat?: ProcessCsvInputFormat;
  providerName: SimplesProviderName;
  providerConfigVersion: string;
  sourceFilePath: string | null;
  sourceFileName: string | null;
  outputPath: string | null;
  checkpointPath: string;
  startedAt: string;
  updatedAt: string;
  completedAt: string | null;
  cnpjColumn: string | null;
  totalUniqueLookups: number;
  checkpointedUniqueLookups: number;
  summary: ProcessCsvSummary | null;
  canResume: boolean;
  resumeBlockedReason: string | null;
};

export type ProcessCsvOutputDelivery = {
  format: ProcessCsvDeliveryFormat;
  extension: ProcessCsvDeliveryFormat;
  mimeType: string;
};

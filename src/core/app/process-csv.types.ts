import type { SimplesProviderName } from "../simples/simples-provider.factory";

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

export type ProcessCsvRunStatus = "SUCCESS" | "CANCELLED";

export type ProcessCsvExecutionStatus =
  | "RUNNING"
  | ProcessCsvRunStatus
  | "FAILED";

export type ProcessCsvExecution = {
  runId: string;
  status: ProcessCsvExecutionStatus;
  checkpointPath: string | null;
  completedUniqueLookups: number;
  totalUniqueLookups: number;
  resumedUniqueLookups: number;
};

export type ProcessExecutionHistoryItem = {
  ledgerKey: string;
  runId: string;
  status: ProcessCsvExecutionStatus;
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

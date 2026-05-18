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

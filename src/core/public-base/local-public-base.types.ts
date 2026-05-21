export type LocalPublicBaseRecord = {
  cnpj: string;
  razaoSocial: string;
  simplesNacional: boolean;
  simei: boolean;
  updatedAt: string;
};

export type LocalPublicBaseStatus = {
  state: "ready" | "not-prepared" | "error";
  baseDate: string | null;
  preparedAt: string | null;
  sourceFileName: string | null;
  estimatedRows: number;
  preparedRows: number;
  rejectedRows: number;
  estimatedSizeLabel: string;
  estimatedPreparationTimeLabel: string;
  diskUsageLabel: string;
  freshnessWarning: string;
  errorMessage: string | null;
};

export type LocalPublicBasePrepareInput = {
  content: string;
  sourceFileName: string;
  sourceFilePath: string;
};

export type LocalPublicBasePrepareResult = {
  acceptedRows: number;
  rejectedRows: number;
  status: LocalPublicBaseStatus;
};

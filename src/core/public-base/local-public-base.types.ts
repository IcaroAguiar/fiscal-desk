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

export type LocalPublicBasePreparationConsent = {
  accepted: true;
  acceptedAt: string;
  baseDateAcknowledged: string | null;
  stalenessWarningAcknowledged: string;
};

export type LocalPublicBasePrepareInput = {
  content: string;
  consent?: LocalPublicBasePreparationConsent;
  sourceFileName: string;
  sourceFilePath: string;
};

export type LocalPublicBasePrepareResult = {
  acceptedRows: number;
  rejectedRows: number;
  status: LocalPublicBaseStatus;
};

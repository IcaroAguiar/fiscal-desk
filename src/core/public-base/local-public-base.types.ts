export type LocalPublicBaseRecord = {
  cnpj: string;
  razaoSocial: string;
  simplesNacional: boolean;
  simei: boolean;
  updatedAt: string;
};

export type LocalPublicBaseStatus = {
  state: "ready" | "not-prepared";
  baseDate: string;
  estimatedRows: number;
  estimatedSizeLabel: string;
  estimatedPreparationTimeLabel: string;
  diskUsageLabel: string;
  freshnessWarning: string;
};

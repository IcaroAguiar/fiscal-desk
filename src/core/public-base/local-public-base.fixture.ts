import type {
  LocalPublicBaseRecord,
  LocalPublicBaseStatus,
} from "./local-public-base.types";

export const LOCAL_PUBLIC_BASE_SOURCE = "base-publica-local";
export const LOCAL_PUBLIC_BASE_SAMPLE_DATE = "2026-05-20";

export const LOCAL_PUBLIC_BASE_STATUS: LocalPublicBaseStatus = {
  state: "not-prepared",
  baseDate: null,
  preparedAt: null,
  sourceFileName: null,
  estimatedRows: 3,
  preparedRows: 0,
  rejectedRows: 0,
  estimatedSizeLabel: "menos de 1 MB nesta amostra local",
  estimatedPreparationTimeLabel: "menos de 1 minuto para a amostra local",
  diskUsageLabel: "sem base preparada neste perfil",
  freshnessWarning:
    "Prepare a Base Pública Local a partir de um CSV confiável antes de consultar em lote.",
  errorMessage: null,
};

export const LOCAL_PUBLIC_BASE_RECORDS: readonly LocalPublicBaseRecord[] = [
  {
    cnpj: "00000000000191",
    razaoSocial: "Banco do Brasil S.A.",
    simplesNacional: true,
    simei: false,
    updatedAt: LOCAL_PUBLIC_BASE_SAMPLE_DATE,
  },
  {
    cnpj: "33000167000101",
    razaoSocial: "Petróleo Brasileiro S.A. Petrobras",
    simplesNacional: false,
    simei: false,
    updatedAt: LOCAL_PUBLIC_BASE_SAMPLE_DATE,
  },
  {
    cnpj: "00360305000104",
    razaoSocial: "Caixa Econômica Federal",
    simplesNacional: false,
    simei: false,
    updatedAt: LOCAL_PUBLIC_BASE_SAMPLE_DATE,
  },
];

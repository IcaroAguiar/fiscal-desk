import type {
  LocalPublicBaseRecord,
  LocalPublicBaseStatus,
} from "./local-public-base.types";

export const LOCAL_PUBLIC_BASE_SOURCE = "base-publica-local";

export const LOCAL_PUBLIC_BASE_STATUS: LocalPublicBaseStatus = {
  state: "ready",
  baseDate: "2026-05-20",
  estimatedRows: 3,
  estimatedSizeLabel: "menos de 1 MB nesta amostra local",
  estimatedPreparationTimeLabel: "pronta para uso neste corte",
  diskUsageLabel: "sem download adicional nesta versão",
  freshnessWarning:
    "A Base Pública Local pode estar defasada; use como consulta resiliente e confirme casos sensíveis em provedor online.",
};

export const LOCAL_PUBLIC_BASE_RECORDS: readonly LocalPublicBaseRecord[] = [
  {
    cnpj: "00000000000191",
    razaoSocial: "Banco do Brasil S.A.",
    simplesNacional: true,
    simei: false,
    updatedAt: LOCAL_PUBLIC_BASE_STATUS.baseDate,
  },
  {
    cnpj: "33000167000101",
    razaoSocial: "Petróleo Brasileiro S.A. Petrobras",
    simplesNacional: false,
    simei: false,
    updatedAt: LOCAL_PUBLIC_BASE_STATUS.baseDate,
  },
  {
    cnpj: "00360305000104",
    razaoSocial: "Caixa Econômica Federal",
    simplesNacional: false,
    simei: false,
    updatedAt: LOCAL_PUBLIC_BASE_STATUS.baseDate,
  },
];

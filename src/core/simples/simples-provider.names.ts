export const SIMPLES_PROVIDER = {
  BASE_PUBLICA_LOCAL: "base-publica-local",
  CNPJA_OPEN: "cnpja-open",
  MOCK: "mock",
  RECEITA_WEB: "receita-web",
} as const;

export type SimplesProviderName =
  (typeof SIMPLES_PROVIDER)[keyof typeof SIMPLES_PROVIDER];

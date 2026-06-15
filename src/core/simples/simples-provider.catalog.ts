import {
  SIMPLES_PROVIDER,
  type SimplesProviderName,
} from "./simples-provider.names";

export type SimplesProviderMode = "assisted" | "local" | "offline" | "online";

export type SimplesProviderCapability = {
  automaticFallback: boolean;
  batchLookup: boolean;
  deterministicSmoke: boolean;
  offlineLookup: boolean;
  visibleBrowser: boolean;
};

export type SimplesProviderRetryPolicy = {
  cooldownMs: number;
  maxAttempts: number;
};

export type SimplesProviderDefinition = {
  name: SimplesProviderName;
  label: string;
  mode: SimplesProviderMode;
  capabilities: SimplesProviderCapability;
  requirements: readonly string[];
  limits: readonly string[];
  retry: SimplesProviderRetryPolicy;
};

const DEFAULT_RETRY_POLICY: SimplesProviderRetryPolicy = {
  cooldownMs: 0,
  maxAttempts: 1,
};

const PROVIDER_CATALOG = {
  [SIMPLES_PROVIDER.MOCK]: {
    name: SIMPLES_PROVIDER.MOCK,
    label: "Simulação offline",
    mode: "offline",
    capabilities: {
      automaticFallback: false,
      batchLookup: true,
      deterministicSmoke: true,
      offlineLookup: true,
      visibleBrowser: false,
    },
    requirements: ["Nenhuma credencial ou rede externa."],
    limits: ["Dados fixos de teste; não representa consulta fiscal real."],
    retry: DEFAULT_RETRY_POLICY,
  },
  [SIMPLES_PROVIDER.BASE_PUBLICA_LOCAL]: {
    name: SIMPLES_PROVIDER.BASE_PUBLICA_LOCAL,
    label: "Base Pública Local",
    mode: "local",
    capabilities: {
      automaticFallback: true,
      batchLookup: true,
      deterministicSmoke: true,
      offlineLookup: true,
      visibleBrowser: false,
    },
    requirements: ["Base local preparada no perfil do usuário."],
    limits: [
      "Pode estar defasada; casos sensíveis precisam de confirmação online.",
    ],
    retry: DEFAULT_RETRY_POLICY,
  },
  [SIMPLES_PROVIDER.CNPJA_OPEN]: {
    name: SIMPLES_PROVIDER.CNPJA_OPEN,
    label: "CNPJá Open",
    mode: "online",
    capabilities: {
      automaticFallback: true,
      batchLookup: false,
      deterministicSmoke: false,
      offlineLookup: false,
      visibleBrowser: false,
    },
    requirements: ["Rede disponível e provedor público respondendo."],
    limits: [
      "Sujeito a rate limit, indisponibilidade e payload externo.",
      "Sem paralelismo efetivo nesta release.",
    ],
    retry: {
      cooldownMs: 30_000,
      maxAttempts: 2,
    },
  },
  [SIMPLES_PROVIDER.RECEITA_WEB]: {
    name: SIMPLES_PROVIDER.RECEITA_WEB,
    label: "Receita Web assistida",
    mode: "assisted",
    capabilities: {
      automaticFallback: false,
      batchLookup: false,
      deterministicSmoke: false,
      offlineLookup: false,
      visibleBrowser: true,
    },
    requirements: ["Chrome ou Edge instalado e navegador visível."],
    limits: [
      "Modo assistido e experimental; sujeito a CAPTCHA e bloqueio anti-bot.",
    ],
    retry: DEFAULT_RETRY_POLICY,
  },
  [SIMPLES_PROVIDER.RECEITA_WEB_PARALLEL_EXPERIMENTAL]: {
    name: SIMPLES_PROVIDER.RECEITA_WEB_PARALLEL_EXPERIMENTAL,
    label: "Receita Web experimental",
    mode: "assisted",
    capabilities: {
      automaticFallback: false,
      batchLookup: true,
      deterministicSmoke: false,
      offlineLookup: false,
      visibleBrowser: true,
    },
    requirements: [
      "Chrome ou Edge instalado, navegador visível e confirmação explícita.",
    ],
    limits: [
      "Modo avançado; abre múltiplas janelas e para em CAPTCHA ou bloqueio.",
      "Sem promessa de sucesso em lote; prefira Base Pública Local para volume.",
    ],
    retry: DEFAULT_RETRY_POLICY,
  },
} satisfies Record<SimplesProviderName, SimplesProviderDefinition>;

export function getSimplesProviderCatalog(): readonly SimplesProviderDefinition[] {
  return Object.values(PROVIDER_CATALOG);
}

export function getSimplesProviderDefinition(
  providerName: SimplesProviderName,
): SimplesProviderDefinition {
  return PROVIDER_CATALOG[providerName];
}

export function getSimplesProviderNames(): readonly SimplesProviderName[] {
  return getSimplesProviderCatalog().map((provider) => provider.name);
}

export function getAutomaticFallbackProviderNames(
  providerName: SimplesProviderName,
): readonly SimplesProviderName[] {
  return getSimplesProviderCatalog()
    .filter(
      (provider) =>
        provider.name !== providerName &&
        provider.capabilities.automaticFallback &&
        provider.mode !== "assisted",
    )
    .map((provider) => provider.name);
}

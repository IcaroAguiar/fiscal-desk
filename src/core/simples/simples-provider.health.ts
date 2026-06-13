import type { SimplesLookupResult } from "./simples-lookup.types";
import {
  getSimplesProviderDefinition,
  type SimplesProviderDefinition,
} from "./simples-provider.catalog";
import type { SimplesProviderName } from "./simples-provider.names";

export type SimplesProviderHealthState =
  | "ASSISTED_ONLY"
  | "COOLDOWN"
  | "DEGRADED"
  | "HEALTHY"
  | "UNAVAILABLE"
  | "UNKNOWN";

export type SimplesProviderHealth = {
  providerName: SimplesProviderName;
  state: SimplesProviderHealthState;
  consecutiveFailures: number;
  cooldownUntil: number | null;
  lastCheckedAt: number | null;
  lastFailureMessage: string | null;
};

const RETRYABLE_STATUSES = new Set<SimplesLookupResult["status"]>([
  "BLOCKED",
  "CAPTCHA_REQUIRED",
  "TEMPORARY_ERROR",
  "UNPARSABLE_RESULT",
]);

const TERMINAL_STATUSES = new Set<SimplesLookupResult["status"]>([
  "INVALID_CNPJ",
  "NOT_FOUND",
  "PERMANENT_ERROR",
  "SUCCESS",
]);

export class SimplesProviderHealthRegistry {
  private readonly healthByProvider = new Map<
    SimplesProviderName,
    SimplesProviderHealth
  >();

  constructor(
    providerNames: readonly SimplesProviderName[],
    private readonly now: () => number = Date.now,
  ) {
    for (const providerName of providerNames) {
      this.healthByProvider.set(
        providerName,
        createInitialHealth(providerName),
      );
    }
  }

  get(providerName: SimplesProviderName): SimplesProviderHealth {
    return this.normalizeCooldown(
      this.healthByProvider.get(providerName) ??
        createInitialHealth(providerName),
    );
  }

  canAttempt(providerName: SimplesProviderName): boolean {
    const definition = getSimplesProviderDefinition(providerName);
    const health = this.get(providerName);

    if (definition.mode === "assisted") {
      return false;
    }

    return health.state !== "COOLDOWN" && health.state !== "UNAVAILABLE";
  }

  recordResult(
    providerName: SimplesProviderName,
    result: SimplesLookupResult,
  ): SimplesProviderHealth {
    const definition = getSimplesProviderDefinition(providerName);
    const current = this.get(providerName);
    const checkedAt = this.now();

    if (TERMINAL_STATUSES.has(result.status)) {
      return this.set(providerName, {
        ...current,
        state: definition.mode === "assisted" ? "ASSISTED_ONLY" : "HEALTHY",
        consecutiveFailures: 0,
        cooldownUntil: null,
        lastCheckedAt: checkedAt,
        lastFailureMessage: null,
      });
    }

    if (!RETRYABLE_STATUSES.has(result.status)) {
      return this.set(providerName, {
        ...current,
        state: "DEGRADED",
        lastCheckedAt: checkedAt,
        lastFailureMessage: toPublicFailureMessage(result.status),
      });
    }

    const consecutiveFailures = current.consecutiveFailures + 1;
    const cooldownUntil =
      definition.retry.cooldownMs > 0
        ? checkedAt + definition.retry.cooldownMs
        : null;

    return this.set(providerName, {
      ...current,
      state: cooldownUntil === null ? "DEGRADED" : "COOLDOWN",
      consecutiveFailures,
      cooldownUntil,
      lastCheckedAt: checkedAt,
      lastFailureMessage: toPublicFailureMessage(result.status),
    });
  }

  recordException(
    providerName: SimplesProviderName,
    _error: unknown,
  ): SimplesProviderHealth {
    return this.recordResult(providerName, {
      cnpj: "",
      message: "Falha temporaria do provider.",
      simplesNacional: null,
      simei: null,
      source: providerName,
      status: "TEMPORARY_ERROR",
    });
  }

  private set(
    providerName: SimplesProviderName,
    health: SimplesProviderHealth,
  ): SimplesProviderHealth {
    this.healthByProvider.set(providerName, health);
    return health;
  }

  private normalizeCooldown(
    health: SimplesProviderHealth,
  ): SimplesProviderHealth {
    if (
      health.state !== "COOLDOWN" ||
      health.cooldownUntil === null ||
      health.cooldownUntil > this.now()
    ) {
      return health;
    }

    return this.set(health.providerName, {
      ...health,
      state: "DEGRADED",
      cooldownUntil: null,
    });
  }
}

export function shouldFallbackAfterResult(
  result: SimplesLookupResult,
): boolean {
  return RETRYABLE_STATUSES.has(result.status);
}

function createInitialHealth(
  providerName: SimplesProviderName,
): SimplesProviderHealth {
  const definition = getSimplesProviderDefinition(providerName);

  return {
    providerName,
    state: initialState(definition),
    consecutiveFailures: 0,
    cooldownUntil: null,
    lastCheckedAt: null,
    lastFailureMessage: null,
  };
}

function initialState(
  definition: SimplesProviderDefinition,
): SimplesProviderHealthState {
  if (definition.mode === "assisted") {
    return "ASSISTED_ONLY";
  }

  if (definition.mode === "offline" || definition.mode === "local") {
    return "HEALTHY";
  }

  return "UNKNOWN";
}

function toPublicFailureMessage(status: SimplesLookupResult["status"]): string {
  if (status === "BLOCKED") {
    return "Provider bloqueou a consulta.";
  }

  if (status === "CAPTCHA_REQUIRED") {
    return "Provider exigiu verificacao manual.";
  }

  if (status === "UNPARSABLE_RESULT") {
    return "Provider retornou resultado inesperado.";
  }

  return "Falha temporaria do provider.";
}

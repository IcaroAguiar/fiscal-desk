import { describe, expect, it } from "vitest";

import { SimplesProviderHealthRegistry } from "../../src/core/simples/simples-provider.health";
import { SIMPLES_PROVIDER } from "../../src/core/simples/simples-provider.names";

describe("SimplesProviderHealthRegistry", () => {
  it("moves retryable online failures to cooldown and blocks attempts", () => {
    const registry = new SimplesProviderHealthRegistry(
      [SIMPLES_PROVIDER.CNPJA_OPEN],
      () => 1_000,
    );

    const health = registry.recordResult(SIMPLES_PROVIDER.CNPJA_OPEN, {
      cnpj: "44555666000181",
      simplesNacional: null,
      simei: null,
      source: SIMPLES_PROVIDER.CNPJA_OPEN,
      status: "TEMPORARY_ERROR",
      message: "rate limit",
    });

    expect(health.state).toBe("COOLDOWN");
    expect(health.cooldownUntil).toBe(31_000);
    expect(registry.canAttempt(SIMPLES_PROVIDER.CNPJA_OPEN)).toBe(false);
  });

  it("does not attempt assisted providers automatically", () => {
    const registry = new SimplesProviderHealthRegistry([
      SIMPLES_PROVIDER.RECEITA_WEB,
    ]);

    expect(registry.get(SIMPLES_PROVIDER.RECEITA_WEB).state).toBe(
      "ASSISTED_ONLY",
    );
    expect(registry.canAttempt(SIMPLES_PROVIDER.RECEITA_WEB)).toBe(false);
  });
});

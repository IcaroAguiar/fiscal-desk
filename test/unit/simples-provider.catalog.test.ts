import { describe, expect, it } from "vitest";

import {
  getAutomaticFallbackProviderNames,
  getSimplesProviderDefinition,
} from "../../src/core/simples/simples-provider.catalog";
import { SIMPLES_PROVIDER } from "../../src/core/simples/simples-provider.names";

describe("simples provider catalog", () => {
  it("keeps receita web assisted and outside automatic fallback", () => {
    const receitaWeb = getSimplesProviderDefinition(
      SIMPLES_PROVIDER.RECEITA_WEB,
    );

    expect(receitaWeb.mode).toBe("assisted");
    expect(receitaWeb.capabilities.automaticFallback).toBe(false);
    expect(receitaWeb.capabilities.batchLookup).toBe(false);
    expect(receitaWeb.capabilities.visibleBrowser).toBe(true);
    expect(
      getAutomaticFallbackProviderNames(SIMPLES_PROVIDER.CNPJA_OPEN),
    ).not.toContain(SIMPLES_PROVIDER.RECEITA_WEB);
  });

  it("keeps Receita Web experimental explicit and outside fallback", () => {
    const experimental = getSimplesProviderDefinition(
      SIMPLES_PROVIDER.RECEITA_WEB_PARALLEL_EXPERIMENTAL,
    );

    expect(experimental.mode).toBe("assisted");
    expect(experimental.capabilities.batchLookup).toBe(true);
    expect(experimental.capabilities.visibleBrowser).toBe(true);
    expect(experimental.capabilities.automaticFallback).toBe(false);
    expect(experimental.capabilities.deterministicSmoke).toBe(false);
    expect(
      getAutomaticFallbackProviderNames(SIMPLES_PROVIDER.CNPJA_OPEN),
    ).not.toContain(SIMPLES_PROVIDER.RECEITA_WEB_PARALLEL_EXPERIMENTAL);
  });

  it("keeps mock available as deterministic offline provider", () => {
    const mock = getSimplesProviderDefinition(SIMPLES_PROVIDER.MOCK);

    expect(mock.mode).toBe("offline");
    expect(mock.capabilities.deterministicSmoke).toBe(true);
    expect(mock.capabilities.offlineLookup).toBe(true);
    expect(mock.capabilities.automaticFallback).toBe(false);
  });
});

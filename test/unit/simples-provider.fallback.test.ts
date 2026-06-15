import { describe, expect, it, vi } from "vitest";

import type { SimplesLookupPort } from "../../src/core/simples/simples-lookup.port";
import type { SimplesLookupResult } from "../../src/core/simples/simples-lookup.types";
import { SimplesFallbackLookupAdapter } from "../../src/core/simples/simples-provider.fallback";
import { SIMPLES_PROVIDER } from "../../src/core/simples/simples-provider.names";

function result(
  source: string,
  status: SimplesLookupResult["status"],
): SimplesLookupResult {
  return {
    cnpj: "03426484000123",
    simplesNacional: status === "SUCCESS" ? true : null,
    simei: status === "SUCCESS" ? false : null,
    source,
    status,
  };
}

function provider(response: SimplesLookupResult): SimplesLookupPort {
  return {
    lookup: vi.fn().mockResolvedValue(response),
  };
}

describe("SimplesFallbackLookupAdapter", () => {
  it("falls back after retryable failure without choosing a winner for terminal results", async () => {
    const cnpjaOpen = provider(
      result(SIMPLES_PROVIDER.CNPJA_OPEN, "TEMPORARY_ERROR"),
    );
    const localBase = provider(
      result(SIMPLES_PROVIDER.BASE_PUBLICA_LOCAL, "SUCCESS"),
    );
    const createProvider = vi.fn((providerName) => {
      if (providerName === SIMPLES_PROVIDER.CNPJA_OPEN) {
        return cnpjaOpen;
      }

      return localBase;
    });
    const adapter = new SimplesFallbackLookupAdapter(
      SIMPLES_PROVIDER.CNPJA_OPEN,
      createProvider,
      {
        fallbackProviderNames: [SIMPLES_PROVIDER.BASE_PUBLICA_LOCAL],
      },
    );

    await expect(adapter.lookup("03426484000123")).resolves.toMatchObject({
      source: SIMPLES_PROVIDER.BASE_PUBLICA_LOCAL,
      status: "SUCCESS",
    });
    expect(cnpjaOpen.lookup).toHaveBeenCalledTimes(2);
    expect(localBase.lookup).toHaveBeenCalledTimes(1);
  });

  it("does not fall back after not found", async () => {
    const cnpjaOpen = provider(
      result(SIMPLES_PROVIDER.CNPJA_OPEN, "NOT_FOUND"),
    );
    const localBase = provider(
      result(SIMPLES_PROVIDER.BASE_PUBLICA_LOCAL, "SUCCESS"),
    );
    const adapter = new SimplesFallbackLookupAdapter(
      SIMPLES_PROVIDER.CNPJA_OPEN,
      (providerName) =>
        providerName === SIMPLES_PROVIDER.CNPJA_OPEN ? cnpjaOpen : localBase,
      {
        fallbackProviderNames: [SIMPLES_PROVIDER.BASE_PUBLICA_LOCAL],
      },
    );

    await expect(adapter.lookup("03426484000123")).resolves.toMatchObject({
      source: SIMPLES_PROVIDER.CNPJA_OPEN,
      status: "NOT_FOUND",
    });
    expect(localBase.lookup).not.toHaveBeenCalled();
  });

  it("does not attempt receita web as automatic fallback", async () => {
    const cnpjaOpen = provider(
      result(SIMPLES_PROVIDER.CNPJA_OPEN, "TEMPORARY_ERROR"),
    );
    const receitaWeb = provider(
      result(SIMPLES_PROVIDER.RECEITA_WEB, "SUCCESS"),
    );
    const adapter = new SimplesFallbackLookupAdapter(
      SIMPLES_PROVIDER.CNPJA_OPEN,
      (providerName) =>
        providerName === SIMPLES_PROVIDER.RECEITA_WEB ? receitaWeb : cnpjaOpen,
      {
        fallbackProviderNames: [SIMPLES_PROVIDER.RECEITA_WEB],
      },
    );

    await expect(adapter.lookup("03426484000123")).resolves.toMatchObject({
      source: SIMPLES_PROVIDER.CNPJA_OPEN,
      status: "TEMPORARY_ERROR",
    });
    expect(receitaWeb.lookup).not.toHaveBeenCalled();
  });

  it("does not create an automatic chain for receita web as primary provider", async () => {
    const receitaWeb = provider(
      result(SIMPLES_PROVIDER.RECEITA_WEB, "CAPTCHA_REQUIRED"),
    );
    const mock = provider(result(SIMPLES_PROVIDER.MOCK, "SUCCESS"));
    const adapter = new SimplesFallbackLookupAdapter(
      SIMPLES_PROVIDER.RECEITA_WEB,
      (providerName) =>
        providerName === SIMPLES_PROVIDER.RECEITA_WEB ? receitaWeb : mock,
    );

    await expect(adapter.lookup("03426484000123")).resolves.toMatchObject({
      source: SIMPLES_PROVIDER.RECEITA_WEB,
      status: "TEMPORARY_ERROR",
    });
    expect(receitaWeb.lookup).not.toHaveBeenCalled();
    expect(mock.lookup).not.toHaveBeenCalled();
  });

  it("keeps mock functional as an explicit primary provider", async () => {
    const mock = provider(result(SIMPLES_PROVIDER.MOCK, "SUCCESS"));
    const localBase = provider(
      result(SIMPLES_PROVIDER.BASE_PUBLICA_LOCAL, "SUCCESS"),
    );
    const adapter = new SimplesFallbackLookupAdapter(
      SIMPLES_PROVIDER.MOCK,
      (providerName) =>
        providerName === SIMPLES_PROVIDER.MOCK ? mock : localBase,
    );

    await expect(adapter.lookup("03426484000123")).resolves.toMatchObject({
      source: SIMPLES_PROVIDER.MOCK,
      status: "SUCCESS",
    });
    expect(mock.lookup).toHaveBeenCalledTimes(1);
    expect(localBase.lookup).not.toHaveBeenCalled();
  });
});

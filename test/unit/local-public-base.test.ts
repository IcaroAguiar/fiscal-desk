import { describe, expect, it } from "vitest";

import {
  createLocalPublicBaseIndex,
  getLocalPublicBaseStatus,
} from "../../src/core/public-base/local-public-base.index";
import { LocalPublicBaseSimplesLookupAdapter } from "../../src/core/simples/adapters/local-public-base-simples-lookup.adapter";

describe("Base Pública Local", () => {
  it("exposes preparation status and freshness metadata", () => {
    const status = getLocalPublicBaseStatus();

    expect(status).toMatchObject({
      state: "ready",
      baseDate: "2026-05-20",
      estimatedRows: 3,
    });
    expect(status.estimatedSizeLabel).toContain("menos de 1 MB");
    expect(status.diskUsageLabel).toContain("sem download");
    expect(status.freshnessWarning).toContain("pode estar defasada");
  });

  it("indexes known public fixture records by normalized CNPJ", () => {
    const index = createLocalPublicBaseIndex();

    expect(index.findByCnpj("00000000000191")).toMatchObject({
      cnpj: "00000000000191",
      razaoSocial: "Banco do Brasil S.A.",
      simplesNacional: true,
      simei: false,
    });
    expect(index.findByCnpj("11222333000181")).toBeNull();
  });

  it("returns Resultado Simples with Data da Base for known and missing CNPJs", async () => {
    const adapter = new LocalPublicBaseSimplesLookupAdapter();

    await expect(adapter.lookup("00000000000191")).resolves.toMatchObject({
      cnpj: "00000000000191",
      simplesNacional: true,
      simei: false,
      source: "base-publica-local",
      status: "SUCCESS",
      message: expect.stringContaining("2026-05-20"),
      raw: {
        baseDate: "2026-05-20",
      },
    });

    await expect(adapter.lookup("11222333000181")).resolves.toMatchObject({
      cnpj: "11222333000181",
      simplesNacional: null,
      simei: null,
      source: "base-publica-local",
      status: "NOT_FOUND",
      message: expect.stringContaining("não encontrado"),
      raw: {
        baseDate: "2026-05-20",
      },
    });
  });
});

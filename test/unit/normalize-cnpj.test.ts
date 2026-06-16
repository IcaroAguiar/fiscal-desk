import { describe, expect, it } from "vitest";

import { normalizeCnpj } from "../../src/core/cnpj/normalize-cnpj";

describe("normalizeCnpj", () => {
  it("remove punctuation and whitespace", () => {
    expect(normalizeCnpj(" 44.555.666/0001-81 ")).toBe("44555666000181");
  });

  it("returns only digits even with mixed text", () => {
    expect(normalizeCnpj("CNPJ: 44.555.666/0001-81")).toBe("44555666000181");
  });
});

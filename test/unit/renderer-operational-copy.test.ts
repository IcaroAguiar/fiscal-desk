import { describe, expect, it } from "vitest";

import {
  buildDedupeLabel,
  countdownRemainingMs,
  formatCommandBarSummary,
  formatDuration,
  formatProviderHint,
  formatProviderMode,
  previewAutoSavePath,
} from "../../src/renderer/ui/operational-copy";

describe("renderer operational copy", () => {
  it("formats duration in hour and minute buckets", () => {
    expect(formatDuration(0)).toBe("0s");
    expect(formatDuration(61_000)).toBe("1m 1s");
    expect(formatDuration(3 * 60 * 60_000 + 5 * 60_000)).toBe("3h 5m");
  });

  it("formats the provider mode label", () => {
    expect(formatProviderMode("mock")).toBe("Simulação");
    expect(formatProviderMode("base-publica-local")).toBe("Base local");
    expect(formatProviderMode("cnpja-open")).toBe("CNPJá Open");
    expect(formatProviderMode("receita-web")).toBe("Receita Web manual");
  });

  it("formats the command bar summary with file and provider", () => {
    expect(formatCommandBarSummary("clientes.csv", "mock")).toBe(
      "clientes.csv • Simulação",
    );
    expect(formatCommandBarSummary(null, "cnpja-open")).toBe(
      "Nenhum CSV selecionado • CNPJá Open",
    );
    expect(formatCommandBarSummary("clientes.csv", "receita-web")).toBe(
      "clientes.csv • Receita Web manual",
    );
  });

  it("formats the provider hint for the selected execution mode", () => {
    expect(formatProviderHint(null, "mock")).toBe(
      "Selecione um CSV para continuar",
    );
    expect(formatProviderHint("clientes.csv", "mock")).toBe(
      "Consulta configurada em Simulação.",
    );
    expect(formatProviderHint("clientes.csv", "base-publica-local")).toBe(
      "A Base local usa a data do arquivo preparado neste computador.",
    );
    expect(formatProviderHint("clientes.csv", "receita-web")).toBe(
      "A Receita Web abre o navegador e precisa de acompanhamento.",
    );
  });

  it("builds a readable dedupe label", () => {
    expect(
      buildDedupeLabel({
        totalCnpjsEncontrados: 1_000,
        totalCnpjsUnicosConsultados: 742,
      }),
    ).toBe("258 CNPJs repetidos ignorados");
  });

  it("derives the auto-save path preview next to the source file", () => {
    expect(
      previewAutoSavePath("/Users/icaroaguiar/Downloads/clientes.csv"),
    ).toBe("/Users/icaroaguiar/Downloads/clientes-processado.csv");
  });

  it("counts ETA down in real time without going negative", () => {
    expect(countdownRemainingMs(96_000, 4_000)).toBe(92_000);
    expect(countdownRemainingMs(3_000, 9_000)).toBe(0);
  });
});

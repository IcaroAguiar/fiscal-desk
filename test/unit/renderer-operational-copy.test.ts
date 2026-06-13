import { describe, expect, it } from "vitest";

import {
  buildDedupeLabel,
  buildOperationalPanelCopy,
  countdownRemainingMs,
  formatCommandBarSummary,
  formatDuration,
  formatExecutionResume,
  formatExecutionStatus,
  formatProviderHint,
  formatProviderMode,
  getOperationalToneClass,
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

  it("formats execution status, resume and tone labels reused by renderer sync", () => {
    expect(formatExecutionStatus("RUNNING")).toBe("Em consulta");
    expect(formatExecutionStatus("SUCCESS")).toBe("Concluído");
    expect(formatExecutionStatus("ERROR")).toBe("Erro");
    expect(formatExecutionStatus("CANCELLED")).toBe("Cancelado");
    expect(formatExecutionStatus("UNKNOWN")).toBe("UNKNOWN");
    expect(formatExecutionResume({ execution: null })).toBe(
      "Sem consulta em andamento",
    );
    expect(
      formatExecutionResume({
        execution: {
          resumedUniqueLookups: 0,
        },
      }),
    ).toBe("Retomada não utilizada");
    expect(
      formatExecutionResume({
        execution: {
          resumedUniqueLookups: 3,
        },
      }),
    ).toBe("3 CNPJs retomados");
    expect(getOperationalToneClass("neutral")).toBe("status-token--info");
    expect(getOperationalToneClass("warning")).toBe("status-token--warning");
    expect(getOperationalToneClass("danger")).toBe("status-token--danger");
    expect(getOperationalToneClass("success")).toBe("status-token--success");
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

  it("formats operational panel copy with uncertain ETA and conditional suggestions", () => {
    const panel = buildOperationalPanelCopy({
      deliveryFormat: "xlsx",
      execution: {
        checkpointPath: "/tmp/fiscal-desk/ledger.json",
        completedUniqueLookups: 2,
        resumedUniqueLookups: 1,
        runId: "run-technical-id",
        status: "RUNNING",
        totalUniqueLookups: 10,
      },
      fileName: "clientes.csv",
      message: "Consultando...",
      progress: {
        completedUniqueLookups: 2,
        currentCnpj: "11222333000144",
        elapsedMs: 30_000,
        estimatedRemainingMs: 120_000,
        totalUniqueLookups: 10,
      },
      savedPath: null,
      status: "processing",
      summary: null,
    });

    expect(panel.currentItemLabel).toBe("Consultando 11222333000144");
    expect(panel.etaLabel).toBe(
      "estimativa inicial: cerca de 2m 0s restantes.",
    );
    expect(panel.blockerLabel).toBe("Sem bloqueio sistêmico detectado.");
    expect(panel.checkpointLabel).toBe("1 CNPJ retomado do checkpoint local.");
    expect(panel.suggestionLabel).toBe(
      "Sugestão: continue acompanhando; cancele só se precisar liberar o computador.",
    );
  });

  it("separates item failures from systemic blockers in operational panel copy", () => {
    const panel = buildOperationalPanelCopy({
      deliveryFormat: "csv",
      execution: {
        checkpointPath: "/tmp/fiscal-desk/ledger.json",
        completedUniqueLookups: 7,
        resumedUniqueLookups: 0,
        runId: "run-technical-id",
        status: "SUCCESS",
        totalUniqueLookups: 7,
      },
      fileName: "clientes.csv",
      message: "Concluído",
      progress: null,
      savedPath: "/tmp/clientes-processado.csv",
      status: "success",
      summary: {
        totalCnpjsUnicosConsultados: 7,
        totalErros: 2,
      },
    });

    expect(panel.failureLabel).toBe("2 falhas por item para revisar");
    expect(panel.blockerLabel).toBe(
      "Execução encerrada; pendências ficam no resultado.",
    );
    expect(panel.blockerTone).toBe("warning");
    expect(panel.lastSaveLabel).toBe(
      "Último arquivo salvo: clientes-processado.csv.",
    );
    expect(panel.suggestionLabel).toBe(
      "Sugestão: revise as falhas por item sem descartar os CNPJs já consultados.",
    );
  });

  it("formats blocked, cancelled and empty operational panel suggestions", () => {
    expect(
      buildOperationalPanelCopy({
        deliveryFormat: "csv",
        execution: null,
        fileName: null,
        message: "",
        progress: null,
        savedPath: null,
        status: "idle",
        summary: null,
      }),
    ).toMatchObject({
      blockerLabel: "Nenhum bloqueio visível antes da consulta.",
      checkpointLabel: "Checkpoint será criado durante a execução.",
      currentItemLabel: "Aguardando Entrada de Consulta",
      etaLabel: "ETA aparece durante a consulta.",
      lastSaveLabel: "Entrega CSV ainda não salva.",
      suggestionLabel:
        "Sugestões aparecem quando houver progresso, falha ou bloqueio claro.",
    });

    expect(
      buildOperationalPanelCopy({
        deliveryFormat: "xlsx",
        execution: {
          checkpointPath: null,
          completedUniqueLookups: 4,
          resumedUniqueLookups: 0,
          runId: "run-technical-id",
          status: "FAILED",
          totalUniqueLookups: 8,
        },
        fileName: "clientes.csv",
        message: "",
        progress: null,
        savedPath: null,
        status: "error",
        summary: null,
      }),
    ).toMatchObject({
      blockerLabel: "Execução interrompida; revise antes de continuar.",
      blockerTone: "danger",
      etaLabel: "Estimativa indisponível no momento.",
      failureLabel: "Bloqueio da execução, sem falha por item confirmada",
      lastSaveLabel: "Entrega Excel ainda não salva.",
      suggestionLabel:
        "Sugestão: corrija o bloqueio indicado e tente novamente.",
    });

    expect(
      buildOperationalPanelCopy({
        deliveryFormat: "csv",
        execution: {
          checkpointPath: "/tmp/checkpoint.json",
          completedUniqueLookups: 4,
          resumedUniqueLookups: 0,
          runId: "run-technical-id",
          status: "CANCELLED",
          totalUniqueLookups: 8,
        },
        fileName: "clientes.csv",
        message: "Processamento cancelado.",
        progress: null,
        savedPath: null,
        status: "cancelled",
        summary: null,
      }),
    ).toMatchObject({
      blockerLabel: "Processamento cancelado.",
      blockerTone: "danger",
      checkpointLabel: "Retomada local disponível.",
      suggestionLabel:
        "Sugestão: retome pelo histórico ou exporte o parcial salvo.",
    });
  });
});

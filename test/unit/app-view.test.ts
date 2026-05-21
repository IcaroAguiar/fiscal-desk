import { describe, expect, it } from "vitest";

import { initialState, type UiState } from "../../src/renderer/ui/app.types";
import {
  renderExecutionHistory,
  renderShell,
} from "../../src/renderer/ui/app-view";

describe("app view execution history", () => {
  it("renders delivery format selection with CSV and Excel options", () => {
    const html = renderShell(initialState);

    expect(html).toContain('data-field="delivery-format"');
    expect(html).toContain("CSV compatível");
    expect(html).toContain("Excel com abas");
    expect(html).toContain("Planilha de Resultado");
    expect(html).toContain("Base Pública Local");
    expect(html).toContain('data-field="local-public-base-notice"');
  });

  it("renders resumable interrupted executions with an action button", () => {
    const state: UiState = {
      ...initialState,
      executionHistory: [
        {
          canResume: true,
          checkpointPath: "/tmp/ledger.json",
          checkpointedUniqueLookups: 1,
          cnpjColumn: "cnpj",
          completedAt: null,
          ledgerKey: "mock-0123456789abcdef01234567.json",
          outputPath: null,
          providerConfigVersion: "provider-config-v1",
          providerName: "mock",
          resumeBlockedReason: null,
          runId: "run-1",
          sourceFileName: "entrada.csv",
          sourceFilePath: "/tmp/entrada.csv",
          startedAt: "2026-05-20T10:00:00.000Z",
          status: "CANCELLED",
          summary: null,
          totalUniqueLookups: 3,
          updatedAt: "2026-05-20T10:01:00.000Z",
        },
      ],
      historyStatus: "ready",
    };

    const html = renderExecutionHistory(state);

    expect(html).toContain("entrada.csv");
    expect(html).toContain('data-action="resume-execution"');
    expect(html).toContain(
      'data-ledger-key="mock-0123456789abcdef01234567.json"',
    );
    expect(html).toContain("1/3 checkpoints");
  });

  it("renders successful executions as non-resumable history", () => {
    const state: UiState = {
      ...initialState,
      executionHistory: [
        {
          canResume: false,
          checkpointPath: "/tmp/ledger.json",
          checkpointedUniqueLookups: 3,
          cnpjColumn: "cnpj",
          completedAt: "2026-05-20T10:02:00.000Z",
          ledgerKey: "mock-0123456789abcdef01234567.json",
          outputPath: "/tmp/saida.csv",
          providerConfigVersion: "provider-config-v1",
          providerName: "mock",
          resumeBlockedReason:
            "Execucoes concluidas com sucesso ficam apenas no historico.",
          runId: "run-2",
          sourceFileName: "entrada.csv",
          sourceFilePath: "/tmp/entrada.csv",
          startedAt: "2026-05-20T10:00:00.000Z",
          status: "SUCCESS",
          summary: null,
          totalUniqueLookups: 3,
          updatedAt: "2026-05-20T10:02:00.000Z",
        },
      ],
      historyStatus: "ready",
    };

    const html = renderExecutionHistory(state);

    expect(html).not.toContain('data-action="resume-execution"');
    expect(html).toContain("ficam apenas no historico");
  });

  it("disables resume actions while another processing session is active", () => {
    const state: UiState = {
      ...initialState,
      executionHistory: [
        {
          canResume: true,
          checkpointPath: "/tmp/ledger.json",
          checkpointedUniqueLookups: 1,
          cnpjColumn: "cnpj",
          completedAt: null,
          ledgerKey: "mock-0123456789abcdef01234567.json",
          outputPath: null,
          providerConfigVersion: "provider-config-v1",
          providerName: "mock",
          resumeBlockedReason: null,
          runId: "run-1",
          sourceFileName: "entrada.csv",
          sourceFilePath: "/tmp/entrada.csv",
          startedAt: "2026-05-20T10:00:00.000Z",
          status: "CANCELLED",
          summary: null,
          totalUniqueLookups: 3,
          updatedAt: "2026-05-20T10:01:00.000Z",
        },
      ],
      historyStatus: "ready",
      status: "processing",
    };

    const html = renderExecutionHistory(state);

    expect(html).toContain('data-action="resume-execution"');
    expect(html).toContain("disabled");
  });
});

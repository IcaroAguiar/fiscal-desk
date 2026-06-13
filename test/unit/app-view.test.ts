import { describe, expect, it } from "vitest";

import {
  FISCAL_DESK_COMMERCIAL_BOUNDARY,
  FISCAL_DESK_CONSENT_KEY,
  FISCAL_DESK_DIAGNOSTIC_PACKAGE_POLICY,
  FISCAL_DESK_DISTRIBUTION_CHANNEL_STATE,
  FISCAL_DESK_UPDATE_CAPABILITY_STATE,
} from "../../src/core/app/fiscal-desk-local-contract";
import { initialState, type UiState } from "../../src/renderer/ui/app.types";
import {
  renderExecutionHistory,
  renderShell,
} from "../../src/renderer/ui/app-view";

describe("app view execution history", () => {
  it("renders delivery format selection with CSV and Excel options", () => {
    const html = renderShell(initialState);

    expect(html).toContain('data-field="delivery-format"');
    expect(html).toContain("CSV");
    expect(html).toContain("Excel com abas");
    expect(html).toContain("Arquivo final");
    expect(html).toContain("Base Pública Local");
    expect(html).toContain('data-field="local-public-base-notice"');
    expect(html).toContain('data-action="prepare-local-public-base"');
  });

  it("requires local base notice acceptance before enabling preparation", () => {
    const blockedHtml = renderShell({
      ...initialState,
      provider: "base-publica-local",
    });
    const acceptedHtml = renderShell({
      ...initialState,
      localPublicBaseNoticeAccepted: true,
      provider: "base-publica-local",
    });

    expect(getActionButton(blockedHtml, "prepare-local-public-base")).toContain(
      "disabled",
    );
    expect(
      getActionButton(acceptedHtml, "prepare-local-public-base"),
    ).not.toContain("disabled");
  });

  it("renders F8 local blocked-state trust boundaries without action handlers", () => {
    const html = renderShell(initialState);

    expect(FISCAL_DESK_DISTRIBUTION_CHANNEL_STATE.LOCAL_ONLY).toBe(
      "local_only",
    );
    expect(FISCAL_DESK_UPDATE_CAPABILITY_STATE.BLOCKED_NO_CHANNEL).toBe(
      "blocked_no_channel",
    );
    expect(FISCAL_DESK_CONSENT_KEY.TELEMETRY_BASIC_OPT_IN).toBe(
      "telemetry_basic_opt_in",
    );
    expect(FISCAL_DESK_DIAGNOSTIC_PACKAGE_POLICY.SHARE).toBe(
      "manual_share_only",
    );
    expect(FISCAL_DESK_COMMERCIAL_BOUNDARY.FUTURE_PRO_OPTIONAL).toBe(
      "future_pro_optional",
    );

    expect(html).toContain('aria-label="Limites locais e futuros"');
    expect(html).toContain('data-slot="local-distribution-state"');
    expect(html).toContain("Local ou interno");
    expect(html).toContain("Sem canal, assinatura ou metadados");
    expect(html).toContain('data-slot="local-update-state"');
    expect(html).toContain("Bloqueado sem canal");
    expect(html).toContain("Sem busca, download, instalação ou reinício");
    expect(html).toContain('data-slot="local-consent-state"');
    expect(html).toContain("Desligados por padrão");
    expect(html).toContain("Telemetria, diagnóstico e verificação manual");
    expect(html).toContain('data-slot="local-diagnostic-state"');
    expect(html).toContain("Local e manual");
    expect(html).toContain("compartilhamento manual");
    expect(html).toContain('data-slot="local-commercial-state"');
    expect(html).toContain("Pro futuro opcional");
    expect(html).toContain("uso local básico preservado");
    expect(html).toContain("exportações preservadas");
    expect(html).toContain("simulação offline preservada");
    expect(html).not.toMatch(
      /data-action="[^"]*(?:update|download|install|diagnostic|telemetry|license|account|send)[^"]*"/i,
    );
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
    expect(html).toContain("1/3 CNPJs salvos para retomada");
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

function getActionButton(html: string, action: string): string {
  const actionIndex = html.indexOf(`data-action="${action}"`);

  if (actionIndex === -1) {
    return "";
  }

  const start = html.lastIndexOf("<button", actionIndex);
  const end = html.indexOf("</button>", actionIndex);

  return html.slice(start, end + "</button>".length);
}

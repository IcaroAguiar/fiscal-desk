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
    expect(html).toContain('data-field="execution-speed-profile"');
    expect(html).toContain("Equilibrado");
    expect(html).toContain("Máximo");
    expect(html).toContain("Base Pública Local");
    expect(html).toContain('data-field="provider-choice"');
    expect(html).toContain("Teste local offline");
    expect(html).toContain("Não usar para dados reais");
    expect(html).toContain('data-field="local-public-base-notice"');
    expect(html).toContain('data-action="discover-official-source"');
    expect(html).toContain('data-action="prepare-official-source"');
    expect(html).toContain('data-action="prepare-local-public-base"');
    expect(html).toContain(
      'data-slot="local-public-base-official-source-line"',
    );
    expect(html).toContain("Buscar fonte oficial");
    expect(html).toContain("Baixar e preparar oficial");
    expect(html).toContain('data-slot="speed-plan-label"');
    expect(html).toContain('data-slot="speed-plan-detail"');
    expect(html).toContain('data-slot="speed-control-label"');
    expect(html).toContain("Receita Web experimental");
    expect(html).toContain('data-field="receita-web-experimental-notice"');
  });

  it("requires Receita Web experimental notice before processing", () => {
    const blockedHtml = renderShell({
      ...initialState,
      content: "cnpj\n11222333000181",
      fileName: "clientes.csv",
      provider: "receita-web-parallel-experimental",
    });
    const acceptedHtml = renderShell({
      ...initialState,
      content: "cnpj\n11222333000181",
      fileName: "clientes.csv",
      provider: "receita-web-parallel-experimental",
      receitaWebExperimentalNoticeAccepted: true,
    });

    expect(getActionButton(blockedHtml, "process-file")).toContain("disabled");
    expect(getActionButton(acceptedHtml, "process-file")).not.toContain(
      "disabled",
    );
    expect(blockedHtml).toContain("até 3 janelas visíveis");
    expect(blockedHtml).toContain("resolver manualmente na janela");
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

  it("requires official source discovery and notice acceptance before official preparation", () => {
    const blockedHtml = renderShell({
      ...initialState,
      localPublicBaseNoticeAccepted: true,
      provider: "base-publica-local",
    });
    const acceptedHtml = renderShell({
      ...initialState,
      localPublicBaseNoticeAccepted: true,
      localPublicBaseOfficialSource: {
        baseDate: "2026-01",
        directoryUrl: "https://example.test/2026-01/",
        fileName: "Simples.zip",
        fileUrl: "https://example.test/2026-01/Simples.zip",
        kind: "simples",
        lastModified: "2026-01-11 14:58",
        sizeLabel: "268M",
        sourcePageUrl: "https://example.test/",
      },
      provider: "base-publica-local",
    });

    expect(getActionButton(blockedHtml, "prepare-official-source")).toContain(
      "disabled",
    );
    expect(
      getActionButton(acceptedHtml, "prepare-official-source"),
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
    expect(html).toContain("teste local offline preservado");
    expect(html).not.toMatch(
      /data-action="[^"]*(?:update|download|install|diagnostic|telemetry|license|account|send)[^"]*"/i,
    );
  });

  it("renders operational execution panel slots without technical ids", () => {
    const html = renderShell({
      ...initialState,
      execution: {
        checkpointPath: "/tmp/fiscal-desk/ledger.json",
        completedUniqueLookups: 4,
        resumedUniqueLookups: 0,
        runId: "run-technical-id",
        status: "RUNNING",
        totalUniqueLookups: 10,
      },
      fileName: "clientes.csv",
      progress: {
        completedUniqueLookups: 4,
        currentCnpj: "11********0144",
        elapsedMs: 60_000,
        estimatedRemainingMs: 90_000,
        totalUniqueLookups: 10,
      },
      status: "processing",
    });

    expect(html).toContain("Painel de Execução");
    expect(html).toContain('data-slot="execution-blocker"');
    expect(html).toContain('data-slot="execution-checkpoint-copy"');
    expect(html).toContain('data-slot="execution-suggestion"');
    expect(html).toContain("Consultando 11********0144");
    expect(html).toContain("estimativa móvel: cerca de 1m 30s restantes.");
    expect(html).toContain("Volume local pendente");
    expect(html).toContain(
      "Sugestão: mantenha em Base local; é o caminho de volume neste computador.",
    );
    expect(html).toContain("Retomada local disponível.");
    expect(html).toContain('data-action="pause-processing"');
    expect(html).toContain("Pausar");
    expect(getSectionByClass(html, "run-zone")).toContain(
      'data-slot="processing-controls"',
    );
    expect(getSectionByClass(html, "run-zone")).toContain(
      'data-slot="activity-speed-label"',
    );
    expect(getSectionByClass(html, "run-zone")).toContain(
      'data-slot="activity-suggestion"',
    );
    expect(getSectionByClass(html, "run-zone")).toContain(
      'data-action="pause-processing"',
    );
    expect(getSectionByClass(html, "run-zone")).toContain(
      'data-action="cancel-processing"',
    );
    expect(getSectionByClass(html, "run-zone")).toContain("Cancelar");
    expect(html).not.toContain("run-technical-id");
    expect(html).not.toContain("ledger.json");
  });

  it("surfaces Receita Web throughput limits and controls inside activity view", () => {
    const html = renderShell({
      ...initialState,
      activeView: "atividade",
      execution: {
        checkpointPath: "/tmp/fiscal-desk/ledger.json",
        completedUniqueLookups: 3,
        resumedUniqueLookups: 0,
        runId: "run-technical-id",
        status: "RUNNING",
        totalUniqueLookups: 950,
      },
      fileName: "cnpjs_teste_1000_linhas.csv",
      progress: {
        completedUniqueLookups: 3,
        currentCnpj: "11********0144",
        elapsedMs: 78_000,
        estimatedRemainingMs: 16_980_000,
        totalUniqueLookups: 950,
      },
      provider: "receita-web",
      status: "processing",
    });
    const runZone = getSectionByClass(html, "run-zone");

    expect(runZone).toContain("Assistido lento");
    expect(runZone).toContain("não é motor de volume");
    expect(runZone).toContain("cancele e reexecute em Base local para volume");
    expect(runZone).toContain('data-action="pause-processing"');
    expect(runZone).toContain('data-action="cancel-processing"');
  });

  it("surfaces Receita Web CAPTCHA stop guidance inside activity view", () => {
    const html = renderShell({
      ...initialState,
      activeView: "atividade",
      execution: {
        checkpointPath: "/tmp/fiscal-desk/ledger.json",
        completedUniqueLookups: 1,
        resumedUniqueLookups: 0,
        runId: "run-technical-id",
        status: "CANCELLED",
        totalUniqueLookups: 950,
      },
      fileName: "cnpjs_teste_1000_linhas.csv",
      message: "Processamento cancelado após CAPTCHA.",
      provider: "receita-web-parallel-experimental",
      status: "cancelled",
      summary: {
        totalCnpjsEncontrados: 950,
        totalCnpjsRetomados: 0,
        totalCnpjsUnicosConsultados: 1,
        totalCnpjsValidos: 950,
        totalErros: 1,
        totalLinhas: 950,
        totalNaoOptantesSimples: 0,
        totalOptantesSimples: 0,
      },
    });
    const runZone = getSectionByClass(html, "run-zone");

    expect(html).toContain(
      "Receita Web interrompida por CAPTCHA, bloqueio ou proteção do portal.",
    );
    expect(runZone).toContain("Buscar fonte oficial");
    expect(runZone).toContain("Baixar e preparar oficial");
    expect(runZone).not.toContain("run-technical-id");
    expect(runZone).not.toContain("ledger.json");
  });

  it("renders singular legacy resume copy for one resumed lookup", () => {
    const html = renderShell({
      ...initialState,
      execution: {
        checkpointPath: "/tmp/fiscal-desk/ledger.json",
        completedUniqueLookups: 1,
        resumedUniqueLookups: 1,
        runId: "run-technical-id",
        status: "RUNNING",
        totalUniqueLookups: 3,
      },
      status: "processing",
    });

    expect(html).toContain('data-slot="execution-resume"');
    expect(html).toContain("1 CNPJ retomado");
    expect(html).not.toContain("1 CNPJs retomados");
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
          inputFormat: "csv",
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

  it("renders cancelled executions with partial output and pending export action", () => {
    const state: UiState = {
      ...initialState,
      executionHistory: [
        {
          canExportPending: true,
          canResume: true,
          checkpointPath: "/tmp/ledger.json",
          checkpointedUniqueLookups: 1,
          cnpjColumn: "cnpj",
          completedAt: "2026-05-20T10:01:00.000Z",
          hasPartialOutput: true,
          inputFormat: "csv",
          ledgerKey: "mock-0123456789abcdef01234567.json",
          outputPath: "/tmp/entrada-processado.csv",
          pendingUniqueLookups: 2,
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

    expect(html).toContain("2 CNPJs pendentes");
    expect(html).toContain("Parcial salvo: entrada-processado.csv");
    expect(html).toContain('data-action="export-pending-cnpjs"');
    expect(html).toContain("Exportar pendências");
    expect(html).toContain('data-field="completion-provider"');
    expect(html).toContain('value="cnpja-open"');
    expect(html).toContain('value="receita-web"');
    expect(html).toContain("Complementar não encontrados");
    expect(html).toContain('data-action="resume-execution"');
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
          inputFormat: "csv",
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
    expect(html).toContain('data-field="completion-provider"');
    expect(html).toContain("Complementar não encontrados");
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
          inputFormat: "csv",
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

function getSectionByClass(html: string, className: string): string {
  const classIndex = html.indexOf(`class="${className}`);

  if (classIndex === -1) {
    return "";
  }

  const start = html.lastIndexOf("<section", classIndex);
  const end = html.indexOf("</section>", classIndex);

  return html.slice(start, end + "</section>".length);
}

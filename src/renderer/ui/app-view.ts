import { SIMPLES_PROVIDER } from "../../core/simples/simples-provider.names";
import type { UiState, UiView } from "./app.types";
import {
  escapeHtml,
  getLiveProgress,
  getStatusPillVariant,
  renderStatusLabel,
  renderStatusText,
  renderSummary,
} from "./app-helpers";
import { renderExecutionHistory } from "./app-history-view";
import {
  formatLocalPublicBaseOfficialSourceLine,
  formatLocalPublicBaseStatusLine,
} from "./app-local-public-base-copy";
import { renderLocalTrustGrid } from "./app-local-trust-view";
import {
  shouldDisableLocalPublicBaseDiscoverButton,
  shouldDisableLocalPublicBasePrepareButton,
  shouldDisableLocalPublicBasePrepareOfficialButton,
} from "./app-sync-rules";
import {
  buildOperationalPanelCopy,
  formatExecutionResume,
  formatProgressLine,
  formatProviderHint,
  formatProviderMode,
  previewAutoSavePath,
} from "./operational-copy";

export { renderExecutionHistory } from "./app-history-view";

type PipelineStage = {
  key: string;
  label: string;
  meta: string;
  state: "done" | "active" | "warn" | "idle";
  badge: string;
};

export function renderShell(state: UiState): string {
  const outputPreview = getOutputPreview(state);
  const operationalPanel = buildOperationalPanelCopy(state);
  const statusLabel = renderStatusLabel(state.status);
  const localBaseReady = state.localPublicBaseStatus?.state === "ready";
  const showLocalBaseNotice =
    state.provider === SIMPLES_PROVIDER.BASE_PUBLICA_LOCAL || !localBaseReady;
  const needsReceitaWebExperimentalNotice =
    state.provider === SIMPLES_PROVIDER.RECEITA_WEB_PARALLEL_EXPERIMENTAL &&
    !state.receitaWebExperimentalNoticeAccepted;
  const processDisabled =
    state.status === "processing" ||
    state.localPublicBasePrepareStatus === "loading" ||
    !state.content ||
    (state.provider === SIMPLES_PROVIDER.BASE_PUBLICA_LOCAL &&
      (!state.localPublicBaseNoticeAccepted || !localBaseReady)) ||
    needsReceitaWebExperimentalNotice;

  return `
    <main class="fd-shell">
      <aside class="fd-sidebar" aria-label="Navegação principal">
        <div class="fd-brand">
          <span class="fd-brand__mark" aria-hidden="true">FD</span>
          <span class="fd-brand__name">Fiscal Desk</span>
        </div>
        <nav class="fd-nav" aria-label="Módulos">
          ${renderNavLink("Processamento", "painel", state.activeView)}
          ${renderNavLink("Arquivos", "fila", state.activeView)}
          ${renderNavLink("Base Pública", "painel", state.activeView)}
          ${renderNavLink("Receita Web", "painel", state.activeView)}
          ${renderNavLink("Divergências", "atividade", state.activeView)}
          ${renderNavLink("Exportação", "resultados", state.activeView)}
          ${renderNavLink("Histórico", "historico", state.activeView)}
        </nav>
        <button class="fd-sidebar__cta" type="button" data-action="process-file" ${processDisabled ? "disabled" : ""}>Iniciar consulta</button>
        <div class="fd-sidebar__footer">
          <a href="#" aria-disabled="true">Suporte</a>
          <a href="#" aria-disabled="true">Sair</a>
        </div>
      </aside>

      <section class="fd-main" aria-label="Console Fiscal Desk">
        <header class="fd-header">
          <h1>Console de Operações Fiscais</h1>
          <div class="fd-command">
            <span aria-hidden="true">⌕</span>
            <input data-slot="header-search" type="search" placeholder="Consultar CNPJ, importar arquivo..." aria-label="Comando de busca" />
            <kbd>⌘K</kbd>
          </div>
          <div class="fd-header__actions">
            <button class="fd-button fd-button--ghost" type="button" disabled>Ver Logs</button>
            <button class="fd-button fd-button--primary" type="button" data-action="process-file" ${processDisabled ? "disabled" : ""}>${state.status === "processing" ? "Consultando..." : "Processar CNPJs"}</button>
          </div>
        </header>

        <div class="fd-workspace">
          <section class="fd-metrics" aria-label="Resumo do lote">
            ${renderMetric("CNPJs no lote", String(state.summary?.totalLinhas ?? 0), "accent", "kpi-total-lines")}
            ${renderMetric("Concluídos", String(state.summary?.totalCnpjsUnicosConsultados ?? state.progress?.completedUniqueLookups ?? 0), "good", "kpi-processed")}
            ${renderMetric("Divergências", String(state.summary?.totalErros ?? 0), "warn", "kpi-errors")}
            ${renderMetric("Pendentes", String(getPendingCount(state)), "danger", "kpi-pending")}
            ${renderMetric("Taxa de sucesso", getSuccessRateLabel(state), "", "kpi-success-rate")}
          </section>

          <section class="fd-card fd-pipeline" data-view-panel="painel" data-open="${state.activeView === "painel" ? "true" : "false"}">
            <div class="fd-section-head">
              <div>
                <h2>Pipeline de processamento</h2>
                <p>Fluxo de 5 estágios para validação fiscal em lote</p>
              </div>
              <span class="status-token ${getProviderStatusVariant(state)}" data-slot="provider-status">${escapeHtml(getProviderStatusLabel(state))}</span>
            </div>
            <div class="fd-pipeline__rail" aria-hidden="true"></div>
            <div class="fd-pipeline__stages">
              ${renderPipelineStages(state).map(renderPipelineStage).join("")}
            </div>
            <div class="fd-empty-state">
              <div class="fd-empty-state__icon">!</div>
              <strong>${state.status === "processing" ? "Pipeline em andamento" : "Nenhum pipeline em andamento"}</strong>
              <span>${state.fileName ? escapeHtml(state.fileName) : "Importe um arquivo CSV com CNPJs para iniciar o processamento fiscal em lote."}</span>
            </div>
          </section>

          <section class="fd-detail-grid" data-view-panel="painel" data-open="${state.activeView === "painel" ? "true" : "false"}">
            <article class="fd-card fd-detail">
              <div class="fd-section-head">
                <div>
                  <h2 data-slot="file-dropzone-title">${escapeHtml(state.fileName ?? "Aguardando arquivo")}</h2>
                  <p data-slot="file-dropzone-hint">${escapeHtml(state.fileName ? formatProviderHint(state.fileName, state.provider) : "Importe uma planilha para iniciar o pipeline fiscal.")}</p>
                </div>
                <span class="status-token" data-slot="file-badge">${escapeHtml(state.fileName ?? "aguardando arquivo")}</span>
              </div>
              <div class="fd-import">
                <span class="fd-file-icon">${state.inputFormat === "xlsx" ? "XLSX" : "CSV"}</span>
                <div>
                  <strong>Arquivo CSV ou Excel</strong>
                  <span>Selecione uma planilha com CNPJs. O resultado fica ao lado do arquivo original.</span>
                </div>
                <button class="fd-button fd-button--secondary" type="button" data-action="pick-file">${state.fileName ? "Trocar planilha" : "Selecionar planilha"}</button>
              </div>
              <p class="fd-message" data-slot="message">${escapeHtml(state.message)}</p>
            </article>

            <article class="fd-card fd-providers">
              <div class="fd-section-head">
                <div>
                  <h2>Base de consulta</h2>
                  <p>Escolha o método antes de iniciar. Base Pública Local é o caminho para volume.</p>
                </div>
              </div>
              <div class="fd-provider-grid" role="radiogroup" aria-label="Base de consulta">
                ${renderProviderChoice(state, SIMPLES_PROVIDER.BASE_PUBLICA_LOCAL, "Base Pública Local", "Volume neste computador", localBaseReady ? "Pronta para lote" : "Requer preparo", false)}
                ${renderProviderChoice(state, SIMPLES_PROVIDER.CNPJA_OPEN, "CNPJá Open", "Consulta online moderada", "Sujeito a rate limit", false)}
                ${renderProviderChoice(state, SIMPLES_PROVIDER.RECEITA_WEB, "Receita Web assistida", "Amostras e conferência", state.receitaWebAvailable ? "Manual" : "Indisponível neste ambiente", !state.receitaWebAvailable)}
                ${renderProviderChoice(state, SIMPLES_PROVIDER.MOCK, "Teste local offline", "Valida o fluxo sem internet", "Não usar para dados reais", false)}
              </div>
              <select class="sync-only" data-field="provider" aria-hidden="true" tabindex="-1">
                ${renderProviderOption(SIMPLES_PROVIDER.BASE_PUBLICA_LOCAL, "Base Pública Local", state.provider === SIMPLES_PROVIDER.BASE_PUBLICA_LOCAL)}
                ${renderProviderOption(SIMPLES_PROVIDER.CNPJA_OPEN, "CNPJá Open", state.provider === SIMPLES_PROVIDER.CNPJA_OPEN)}
                ${renderProviderOption(SIMPLES_PROVIDER.RECEITA_WEB, "Receita Web assistida", state.provider === SIMPLES_PROVIDER.RECEITA_WEB, !state.receitaWebAvailable)}
                ${renderProviderOption(SIMPLES_PROVIDER.RECEITA_WEB_PARALLEL_EXPERIMENTAL, "Receita Web experimental", state.provider === SIMPLES_PROVIDER.RECEITA_WEB_PARALLEL_EXPERIMENTAL, !state.receitaWebAvailable)}
                ${renderProviderOption(SIMPLES_PROVIDER.MOCK, "Teste local offline", state.provider === SIMPLES_PROVIDER.MOCK)}
              </select>
            </article>
          </section>

          <section class="fd-card fd-settings" data-view-panel="painel" data-open="${state.activeView === "painel" ? "true" : "false"}">
            <div class="fd-settings__grid">
              <label class="fd-field">
                <span>Coluna de CNPJ</span>
                <input data-field="cnpj-column" type="text" value="${escapeHtml(state.cnpjColumn)}" placeholder="auto" aria-label="Coluna de CNPJ" />
              </label>
              <label class="fd-field">
                <span>Arquivo final</span>
                <select data-field="delivery-format" aria-label="Arquivo final">
                  <option value="csv" ${state.deliveryFormat === "csv" ? "selected" : ""}>CSV</option>
                  <option value="xlsx" ${state.deliveryFormat === "xlsx" ? "selected" : ""}>Excel com abas</option>
                </select>
              </label>
              <label class="fd-field">
                <span>Velocidade</span>
                <select data-field="execution-speed-profile" aria-label="Velocidade">
                  <option value="conservative" ${state.executionSpeedProfile === "conservative" ? "selected" : ""}>Leve</option>
                  <option value="balanced" ${state.executionSpeedProfile === "balanced" ? "selected" : ""}>Equilibrado</option>
                  <option value="fast" ${state.executionSpeedProfile === "fast" ? "selected" : ""}>Rápido</option>
                  <option value="maximum" ${state.executionSpeedProfile === "maximum" ? "selected" : ""}>Máximo</option>
                </select>
              </label>
              <div class="fd-runtime-card">
                <span>Plano de velocidade</span>
                <strong data-slot="speed-plan-label">${escapeHtml(operationalPanel.speedLabel)}</strong>
                <small data-slot="speed-plan-detail">${escapeHtml(operationalPanel.speedDetailLabel)}</small>
                <small data-slot="speed-control-label">${escapeHtml(operationalPanel.controlLabel)}</small>
              </div>
            </div>

            <div class="fd-base-prep" data-slot="local-public-base-prep-panel" ${showLocalBaseNotice ? "" : 'style="display:none"'}>
              <div>
                <span>Base Pública Local</span>
                <strong data-slot="local-public-base-status-line">${escapeHtml(formatLocalPublicBaseStatusLine(state))}</strong>
                <small data-slot="local-public-base-official-source-line">${escapeHtml(formatLocalPublicBaseOfficialSourceLine(state))}</small>
              </div>
              <div class="fd-base-prep__actions">
                <button class="fd-button fd-button--ghost" type="button" data-action="discover-official-source" ${shouldDisableLocalPublicBaseDiscoverButton(state) ? "disabled" : ""}>Buscar fonte oficial</button>
                <button class="fd-button fd-button--ghost" type="button" data-action="prepare-official-source" ${shouldDisableLocalPublicBasePrepareOfficialButton(state) ? "disabled" : ""}>Baixar e preparar oficial</button>
                <button class="fd-button fd-button--secondary" type="button" data-action="prepare-local-public-base" ${shouldDisableLocalPublicBasePrepareButton(state) ? "disabled" : ""}>Preparar base</button>
              </div>
            </div>

            <label class="fd-notice" data-slot="local-public-base-notice-panel" ${showLocalBaseNotice ? "" : 'style="display:none"'}>
              <input data-field="local-public-base-notice" type="checkbox" ${state.localPublicBaseNoticeAccepted ? "checked" : ""} />
              <span>Entendo que a Base Pública Local usa a base oficial válida para a Data da Base <strong data-slot="local-public-base-date">${escapeHtml(state.localPublicBaseStatus?.baseDate ?? "data não informada")}</strong>. <small data-slot="local-public-base-warning">${escapeHtml(state.localPublicBaseStatus?.freshnessWarning ?? "Data da Base indisponível.")}</small></span>
            </label>
            <label class="fd-notice" data-slot="receita-web-experimental-notice-panel" ${state.provider === SIMPLES_PROVIDER.RECEITA_WEB_PARALLEL_EXPERIMENTAL ? "" : 'style="display:none"'}>
              <input data-field="receita-web-experimental-notice" type="checkbox" ${state.receitaWebExperimentalNoticeAccepted ? "checked" : ""} />
              <span>Entendo que a Receita Web experimental abre até 3 janelas visíveis e exige resolver manualmente na janela quando houver CAPTCHA.</span>
            </label>
            <div class="fd-local-trust">${renderLocalTrustGrid()}</div>
          </section>

          <section class="fd-detail-grid" data-view-panel="painel" data-open="${state.activeView === "painel" ? "true" : "false"}">
            <article class="fd-card fd-protocol">
              <div class="fd-section-head"><h2>Mesa de consulta</h2><span class="status-token" data-slot="protocol-status">${state.fileName ? "pronto" : "aguardando"}</span></div>
              ${renderProtocolItem("Entrada", state.fileName ?? "Sem arquivo selecionado", state.fileName ? "Entrada carregada neste computador." : "Selecione uma planilha CSV ou Excel para preparar a consulta.", "protocol-entry", "protocol-entry-hint")}
              ${renderProtocolItem("Base", formatProviderMode(state.provider), formatProviderHint(state.fileName, state.provider), "protocol-base", "protocol-base-hint")}
              ${renderProtocolItem("Saída", outputPreview ?? getDeliveryFormatLabel(state.deliveryFormat), outputPreview ? "Nome previsto para o arquivo final." : "O arquivo final fica ao lado da planilha original.", "protocol-output", "protocol-output-hint")}
              ${renderProtocolItem("Retomada", state.execution ? formatExecutionResume(state) : "Disponível quando houver checkpoint", "Aparece apenas quando a consulta gerar checkpoint.", "protocol-resume")}
            </article>

            <article class="fd-card fd-execution">
              <div class="fd-section-head"><h2>Painel de Execução</h2><span class="status-token" data-slot="session-state">${escapeHtml(state.execution?.status ?? "Aguardando")}</span></div>
              <div class="fd-execution__grid">
                ${renderRuntimeStat("Agora", operationalPanel.currentItemLabel, "session-entry")}
                ${renderRuntimeStat("ETA", operationalPanel.etaLabel, "session-dedupe")}
                ${renderRuntimeStat("Falhas", operationalPanel.failureLabel, "session-run")}
                ${renderRuntimeStat("Último salvamento", operationalPanel.lastSaveLabel, "session-checkpoint")}
              </div>
              <div class="fd-suggestions">
                ${renderRuntimeStat("Bloqueios", operationalPanel.blockerLabel, "execution-blocker")}
                ${renderRuntimeStat("Retomada", operationalPanel.checkpointLabel, "execution-checkpoint-copy")}
                ${renderRuntimeStat("Sugestão assistida", operationalPanel.suggestionLabel, "execution-suggestion")}
              </div>
            </article>
          </section>

          <section class="fd-card fd-file-view" data-view-panel="fila" data-open="${state.activeView === "fila" ? "true" : "false"}" hidden>
            <div class="fd-section-head"><h2>Arquivos importados</h2><span data-slot="queue-count">${state.fileName ? "1 item" : "0 itens"}</span></div>
            <div class="fd-history-row">
              <div><strong data-slot="queue-active-name">${escapeHtml(state.fileName ?? "Nenhum arquivo selecionado")}</strong><span data-slot="queue-active-hint">${state.fileName ? "Pronto para consultar" : "Escolha um CSV para iniciar."}</span></div>
              <span class="status-token" data-slot="queue-active-status">${state.fileName ? "pronto para iniciar" : "aguardando"}</span>
            </div>
          </section>

          <section class="fd-card fd-output" data-view-panel="resultados" data-open="${state.activeView === "resultados" ? "true" : "false"}" hidden>
            <div class="fd-section-head"><h2>Resultado</h2><span class="status-token" data-slot="delivery-format-badge">${escapeHtml(getDeliveryFormatLabel(state.deliveryFormat))}</span></div>
            <div class="summary" data-slot="summary">${renderSummary(state.summary)}</div>
            <p data-slot="output-status">${escapeHtml(renderStatusText(state))}</p>
            <p data-slot="output-preview">${escapeHtml(outputPreview ?? "O arquivo final aparecerá depois da consulta.")}</p>
            <div class="save-info" data-slot="save-info" ${outputPreview ? "" : 'style="display:none"'}>
              <span>Arquivo de saída</span>
              <span data-slot="output-save-path">${escapeHtml(outputPreview ?? "")}</span>
            </div>
            <button class="fd-button fd-button--secondary" type="button" data-action="save-file" ${state.outputDelivery ? "" : "disabled"}>Exportar</button>
          </section>

          <section class="run-zone fd-card fd-activity" data-view-panel="atividade" data-open="${state.activeView === "atividade" ? "true" : "false"}" hidden>
            <div class="fd-section-head"><h2>Atividade</h2><span class="status-pill" data-slot="run-status-pill">${escapeHtml(statusLabel)}</span></div>
            <div class="progress-section" data-slot="progress-section" ${state.status !== "processing" && !state.summary ? 'style="display:none"' : ""}>
              <div class="progress-header"><strong data-slot="progress-line">${escapeHtml(getProgressLineLabel(state))}</strong><span data-slot="current-cnpj">${escapeHtml(getCurrentCnpjLabel(state))}</span></div>
              <div class="ops-progress__track"><span data-slot="progress-bar" style="width: ${getProgressPercent(state)}%"></span></div>
              <div class="fd-execution__grid">
                ${renderRuntimeStat("Método", operationalPanel.speedLabel, "activity-speed-label")}
                ${renderRuntimeStat("Limite", operationalPanel.speedDetailLabel, "activity-speed-detail")}
                ${renderRuntimeStat("Controle", operationalPanel.controlLabel, "activity-control-label")}
                ${renderRuntimeStat("Próxima ação", operationalPanel.suggestionLabel, "activity-suggestion")}
              </div>
              <div class="fd-actions-row" data-slot="processing-controls">
                <button class="fd-button fd-button--secondary" type="button" data-action="pause-processing" ${state.status === "processing" ? "" : "disabled"}>Pausar</button>
                <button class="fd-button fd-button--danger" type="button" data-action="cancel-processing" ${state.status === "processing" ? "" : "disabled"}>Cancelar</button>
              </div>
            </div>
            <div class="sync-only" data-slot="execution-status">${escapeHtml(statusLabel)}</div>
            <div class="sync-only" data-slot="execution-run-id">${state.execution ? "registrada" : "não iniciada"}</div>
            <div class="sync-only" data-slot="execution-resume">${escapeHtml(formatExecutionResume(state))}</div>
            <div class="sync-only" data-slot="execution-checkpoint">${state.execution?.checkpointPath ? "disponível" : "—"}</div>
          </section>

          <section class="fd-card fd-history" data-view-panel="historico" data-open="${state.activeView === "historico" ? "true" : "false"}" hidden>
            <div class="fd-section-head"><h2>Histórico local</h2><button class="fd-button fd-button--ghost" type="button" data-action="refresh-history">Atualizar</button></div>
            <div data-slot="execution-history">${renderExecutionHistory(state)}</div>
          </section>
        </div>
      </section>
    </main>
  `;
}

function renderNavLink(
  label: string,
  view: UiView,
  activeView: UiView,
): string {
  const isPrimaryPanel = label === "Processamento";
  const active = view === activeView && (view !== "painel" || isPrimaryPanel);
  return `<a class="fd-nav__item${active ? " fd-nav__item--active" : ""}" href="#" data-view="${view}" data-view-surface="sidebar" data-primary-panel="${isPrimaryPanel ? "true" : "false"}"${active ? ' aria-current="page"' : ""}>${escapeHtml(label)}</a>`;
}

function renderMetric(
  label: string,
  value: string,
  tone: string,
  slot: string,
): string {
  return `<div class="fd-metric"><strong class="${tone ? `fd-metric__value--${tone}` : ""}" data-slot="${slot}">${escapeHtml(value)}</strong><span>${escapeHtml(label)}</span></div>`;
}

function renderProviderChoice(
  state: UiState,
  value: string,
  title: string,
  description: string,
  meta: string,
  disabled: boolean,
): string {
  const checked = state.provider === value;
  return `
    <label class="fd-provider${checked ? " fd-provider--selected" : ""}${disabled ? " fd-provider--disabled" : ""}">
      <input type="radio" name="provider-choice" data-field="provider-choice" value="${escapeHtml(value)}" ${checked ? "checked" : ""} ${disabled ? "disabled" : ""} />
      <span class="fd-provider__dot"></span>
      <span><strong>${escapeHtml(title)}</strong><small>${escapeHtml(description)}</small></span>
      <em>${escapeHtml(meta)}</em>
    </label>
  `;
}

function renderProviderOption(
  value: string,
  label: string,
  selected: boolean,
  disabled = false,
): string {
  return `<option value="${escapeHtml(value)}" ${selected ? "selected" : ""} ${disabled ? "disabled hidden" : ""}>${escapeHtml(label)}</option>`;
}

function renderPipelineStages(state: UiState): PipelineStage[] {
  const hasFile = Boolean(state.fileName);
  const isProcessing = state.status === "processing";
  const hasSummary = Boolean(state.summary);
  return [
    {
      key: "import",
      label: "Importar",
      meta: hasFile
        ? (state.fileName ?? "Arquivo selecionado")
        : "Aguardando arquivo",
      state: hasFile ? "done" : "idle",
      badge: hasFile ? "Pronto" : "Aguardando",
    },
    {
      key: "base",
      label: "Base pública local",
      meta:
        state.localPublicBaseStatus?.state === "ready"
          ? "Base preparada"
          : "Aguardando base",
      state: state.localPublicBaseStatus?.state === "ready" ? "done" : "idle",
      badge:
        state.localPublicBaseStatus?.state === "ready"
          ? "Concluído"
          : "Aguardando",
    },
    {
      key: "consulta",
      label: getProviderStatusLabel(state),
      meta: isProcessing
        ? getProgressLineLabel(state)
        : hasFile
          ? "Lote pronto"
          : "Aguardando lote",
      state: isProcessing ? "active" : hasSummary ? "done" : "idle",
      badge: isProcessing
        ? "Em andamento"
        : hasSummary
          ? "Concluído"
          : "Aguardando",
    },
    {
      key: "divergencias",
      label: "Divergências",
      meta: `${state.summary?.totalErros ?? 0} pendentes`,
      state: state.summary?.totalErros ? "warn" : "idle",
      badge: state.summary?.totalErros ? "Atenção" : "Aguardando",
    },
    {
      key: "export",
      label: "Exportar",
      meta: state.outputDelivery ? "Resultado pronto" : "Aguardando resultado",
      state: state.outputDelivery ? "done" : "idle",
      badge: state.outputDelivery ? "Pronto" : "Aguardando",
    },
  ];
}

function renderPipelineStage(stage: PipelineStage): string {
  return `
    <button class="fd-stage fd-stage--${stage.state}" type="button">
      <span class="fd-stage__node"></span>
      <span class="fd-stage__body">
        <strong>${escapeHtml(stage.label)}</strong>
        <small>${escapeHtml(stage.meta)}</small>
        <em>${escapeHtml(stage.badge)}</em>
      </span>
    </button>
  `;
}

function renderProtocolItem(
  label: string,
  value: string,
  hint: string,
  valueSlot: string,
  hintSlot?: string,
): string {
  return `<div class="fd-protocol__item"><span>${escapeHtml(label)}</span><strong data-slot="${valueSlot}">${escapeHtml(value)}</strong><small${hintSlot ? ` data-slot="${hintSlot}"` : ""}>${escapeHtml(hint)}</small></div>`;
}

function renderRuntimeStat(label: string, value: string, slot: string): string {
  return `<div class="fd-runtime-stat"><span>${escapeHtml(label)}</span><strong data-slot="${slot}">${escapeHtml(value)}</strong></div>`;
}

function getPendingCount(state: UiState): number {
  if (state.summary) return 0;
  if (!state.progress) return 0;
  return Math.max(
    0,
    state.progress.totalUniqueLookups - state.progress.completedUniqueLookups,
  );
}

function getOutputPreview(state: UiState): string | null {
  const path = state.savedPath
    ? state.savedPath
    : state.filePath
      ? previewAutoSavePath(state.filePath, state.deliveryFormat)
      : null;

  return path?.split(/[/\\]/).pop() ?? null;
}

export function getProgressPercent(state: UiState): number {
  if (state.progress && state.progress.totalUniqueLookups > 0) {
    return Math.round(
      (state.progress.completedUniqueLookups /
        state.progress.totalUniqueLookups) *
        100,
    );
  }

  if (state.status === "success") return 100;
  if (state.status === "processing") return 12;
  return 0;
}

export function getProgressLineLabel(state: UiState): string {
  const progress = getLiveProgress(state);
  if (progress) return formatProgressLine(progress);
  if (state.summary) {
    return `${state.summary.totalCnpjsUnicosConsultados} CNPJs consultados`;
  }
  return "Aguardando processamento";
}

export function getCurrentCnpjLabel(state: UiState): string {
  return state.progress?.currentCnpj ?? "—";
}

export function getDeliveryFormatLabel(
  format: UiState["deliveryFormat"],
): string {
  return format === "xlsx" ? "Excel com abas" : "CSV";
}

export function getProviderStatusLabel(state: UiState): string {
  if (state.provider === SIMPLES_PROVIDER.BASE_PUBLICA_LOCAL)
    return "Base pública local";
  if (state.provider === SIMPLES_PROVIDER.CNPJA_OPEN) return "CNPJá Open";
  if (state.provider === SIMPLES_PROVIDER.RECEITA_WEB)
    return "Receita Web assistida";
  if (state.provider === SIMPLES_PROVIDER.RECEITA_WEB_PARALLEL_EXPERIMENTAL)
    return "Receita Web experimental";
  return "Teste local offline";
}

export function getProviderStatusVariant(state: UiState): string {
  if (state.provider === SIMPLES_PROVIDER.BASE_PUBLICA_LOCAL)
    return state.localPublicBaseStatus?.state === "ready"
      ? "status-token--success"
      : "status-token--warning";
  if (state.provider === SIMPLES_PROVIDER.MOCK) return "status-token--info";
  const variant = getStatusPillVariant(state.status);
  if (variant === "success") return "status-token--success";
  if (variant === "danger") return "status-token--danger";
  return "status-token--primary";
}

export function getInputFormatLabel(format: UiState["inputFormat"]): string {
  return format === "xlsx" ? "Excel" : "CSV";
}

export function getSuccessRateLabel(state: UiState): string {
  if (!state.summary || state.summary.totalCnpjsUnicosConsultados === 0) {
    return "0%";
  }
  const success =
    state.summary.totalCnpjsUnicosConsultados - state.summary.totalErros;
  return `${Math.max(0, Math.round((success / state.summary.totalCnpjsUnicosConsultados) * 100))}%`;
}

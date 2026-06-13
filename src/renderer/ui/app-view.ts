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
import { renderLocalTrustGrid } from "./app-local-trust-view";

export { renderExecutionHistory } from "./app-history-view";

import { formatLocalPublicBaseStatusLine } from "./app-local-public-base-copy";
import { renderLogList, renderQueueItems } from "./app-view-lists";
import { button, statusPill } from "./components";
import {
  buildOperationalPanelCopy,
  formatExecutionResume,
  formatProgressLine,
  formatProviderHint,
  formatProviderMode,
  getOperationalToneClass,
  previewAutoSavePath,
} from "./operational-copy";

export function renderShell(state: UiState): string {
  const referenceMode = isReferenceV5A(state);
  const visualFixture = state.visualFixture;
  const autoSavePreview = state.savedPath
    ? state.savedPath.split(/[/\\]/).pop()
    : state.filePath
      ? previewAutoSavePath(state.filePath, state.deliveryFormat)
          .split(/[/\\]/)
          .pop()
      : null;

  const statusLabel = renderStatusLabel(state.status);
  const entryFileBadge = referenceMode
    ? (visualFixture?.fileStatus ?? "aguardando arquivo")
    : (state.fileName ?? "aguardando arquivo");
  const entryTitle = referenceMode
    ? (visualFixture?.entryTitle ?? "Arquivo de CNPJs")
    : state.fileName
      ? state.fileName
      : "Arquivo CSV";
  const entryHint = referenceMode
    ? (visualFixture?.entryHint ?? "Arraste aqui ou selecione no computador.")
    : state.fileName
      ? formatProviderHint(state.fileName, state.provider)
      : "Selecione uma planilha com CNPJs. O resultado fica ao lado do arquivo original.";
  const outputStatus = referenceMode
    ? (visualFixture?.outputText ??
      "O arquivo final aparece após uma consulta concluída.")
    : renderStatusText(state);
  const outputFormatLabel = referenceMode
    ? (visualFixture?.outputFormat ?? "csv")
    : getDeliveryFormatLabel(state.deliveryFormat);
  const activeQueueLabel = state.fileName ?? "Nenhum arquivo selecionado";
  const activeQueueHint = state.summary
    ? "Consulta concluída"
    : state.fileName
      ? "Pronto para consultar"
      : "Escolha um CSV para iniciar.";
  const activeQueueStatus = state.summary
    ? "concluído"
    : state.fileName
      ? "pronto para iniciar"
      : "aguardando";
  const protocolStatus = referenceMode
    ? (visualFixture?.fileStatus ?? activeQueueStatus)
    : activeQueueStatus;
  const protocolEntry = referenceMode
    ? (visualFixture?.entryTitle ?? "Arquivo de CNPJs")
    : (state.fileName ?? "Sem arquivo selecionado");
  const protocolEntryHint = referenceMode
    ? (visualFixture?.entryHint ?? "Arquivo aguardando seleção.")
    : state.fileName
      ? "Entrada carregada neste computador."
      : "Selecione um CSV para preparar a consulta.";
  const protocolBase = referenceMode
    ? (visualFixture?.providerPrimaryStatus ??
      formatProviderMode(state.provider))
    : formatProviderMode(state.provider);
  const protocolBaseHint = referenceMode
    ? (visualFixture?.providerSecondaryStatus ?? "Modo informado.")
    : formatProviderHint(state.fileName, state.provider);
  const protocolOutput = referenceMode
    ? (visualFixture?.outputFormat ?? "CSV")
    : (autoSavePreview ?? getDeliveryFormatLabel(state.deliveryFormat));
  const protocolOutputHint = referenceMode
    ? (visualFixture?.outputText ?? "Arquivo final após conclusão.")
    : autoSavePreview
      ? "Nome previsto para o arquivo final."
      : "O arquivo final fica ao lado da planilha original.";
  const protocolResume = state.execution
    ? formatExecutionResume(state)
    : "Disponível quando houver checkpoint";
  const hasOperationalSignals =
    Boolean(state.fileName) ||
    Boolean(state.summary) ||
    Boolean(state.progress) ||
    state.status === "processing" ||
    state.status === "error";
  const operationalPanel = buildOperationalPanelCopy(state);

  return `
    <main class="app-shell workbench-shell workbench-v5">
      <aside class="sidebar" aria-label="Navegação principal">
        <div>
          <div class="brand-stack">
            <span class="brand-mark" aria-hidden="true">FD</span>
            <strong>Fiscal Desk</strong>
          </div>
          <nav class="sidebar-nav" aria-label="Módulos">
            ${renderViewLink("Consulta", "painel", state.activeView, "sidebar-nav__item", "sidebar")}
            ${renderViewLink("Histórico", "historico", state.activeView, "sidebar-nav__item", "sidebar")}
          </nav>
        </div>
        <div class="sidebar-footer">
          <span class="status-token status-token--success">Pronto neste computador</span>
          <span>Base local: ${escapeHtml(state.localPublicBaseStatus?.baseDate ?? "pendente")}</span>
        </div>
      </aside>

      <section class="workbench-main" aria-label="Workbench Fiscal Desk">
        <header class="ops-topbar">
          <div class="ops-topbar__main">
            <h1>Consulta fiscal</h1>
            <nav class="ops-tabs" aria-label="Visões">
              ${renderViewLink("Painel", "painel", state.activeView, "ops-tabs__item", "tab")}
              ${renderViewLink("Arquivo", "fila", state.activeView, "ops-tabs__item", "tab")}
              ${renderViewLink("Resultado", "resultados", state.activeView, "ops-tabs__item", "tab")}
              ${renderViewLink("Atividade", "atividade", state.activeView, "ops-tabs__item", "tab")}
            </nav>
          </div>
          <div class="ops-topbar__status">
            <span class="status-token ${getProviderStatusVariant(state)}" data-slot="provider-status">${escapeHtml(getProviderStatusLabel(state))}</span>
            ${referenceMode ? "" : statusPill({ variant: getStatusPillVariant(state.status), children: statusLabel, dataSlot: "top-status-pill" })}
            <span class="sync-only" data-slot="run-status-pill" aria-hidden="true">${escapeHtml(statusLabel)}</span>
            ${button({ variant: "primary", "data-action": "process-file", children: state.status === "processing" ? "Consultando..." : "Iniciar consulta", disabled: state.status === "processing" || state.localPublicBasePrepareStatus === "loading" || !state.content || (state.provider === SIMPLES_PROVIDER.BASE_PUBLICA_LOCAL && (!state.localPublicBaseNoticeAccepted || state.localPublicBaseStatus?.state !== "ready")) })}
          </div>
        </header>

        <section class="operations-grid" id="nova-execucao">
          <section class="entry-zone t-panel-slide" data-view-panel="painel" data-open="${state.activeView === "painel" ? "true" : "false"}">
            <div class="zone-head">
              <div>
                <h2>Arquivo de entrada ${renderHelp("Como funciona", "Use uma planilha CSV com uma coluna de CNPJ. O app identifica a coluna quando possível.")}</h2>
                <p class="body">Selecione a planilha que será consultada.</p>
              </div>
              <span class="status-token status-token--warning" data-slot="file-badge">${escapeHtml(entryFileBadge)}</span>
            </div>

            <div class="file-dropzone">
              <span class="file-dropzone__icon" aria-hidden="true">CSV</span>
              <div>
                <strong data-slot="file-dropzone-title">${escapeHtml(entryTitle)}</strong>
                <span data-slot="file-dropzone-hint">${escapeHtml(entryHint)}</span>
              </div>
              ${button({ variant: "secondary", "data-action": "pick-file", children: state.fileName && !referenceMode ? "Trocar CSV" : "Selecionar CSV" })}
            </div>
          </section>

          <section class="config-zone t-panel-slide" aria-label="Configuração" data-view-panel="painel" data-open="${state.activeView === "painel" ? "true" : "false"}">
            <h2>Ajustes ${renderHelp("Como escolher", "Comece com Simulação. A Base local consulta dados preparados neste computador; Receita Web exige acompanhamento manual.")}</h2>
            <div class="config-grid">
              <label class="field" for="provider">
                <span class="field__label">Base de consulta</span>
                <select id="provider" data-field="provider">
                  <option value="${SIMPLES_PROVIDER.MOCK}" ${state.provider === SIMPLES_PROVIDER.MOCK ? "selected" : ""}>Simulação</option>
                  <option value="${SIMPLES_PROVIDER.BASE_PUBLICA_LOCAL}" ${state.provider === SIMPLES_PROVIDER.BASE_PUBLICA_LOCAL ? "selected" : ""}>Base local</option>
                  <option value="${SIMPLES_PROVIDER.CNPJA_OPEN}" ${state.provider === SIMPLES_PROVIDER.CNPJA_OPEN ? "selected" : ""}>CNPJá Open</option>
                  <option value="${SIMPLES_PROVIDER.RECEITA_WEB}" ${state.provider === SIMPLES_PROVIDER.RECEITA_WEB ? "selected" : ""}>Receita Web</option>
                </select>
              </label>
              <label class="field" for="cnpj-column">
                <span class="field__label">Coluna de CNPJ</span>
                <input id="cnpj-column" data-field="cnpj-column" type="text" placeholder="auto" value="${escapeHtml(state.cnpjColumn)}" />
              </label>
              <label class="field" for="delivery-format">
                <span class="field__label">Arquivo final</span>
                <select id="delivery-format" data-field="delivery-format">
                  <option value="csv" ${state.deliveryFormat === "csv" ? "selected" : ""}>CSV</option>
                  <option value="xlsx" ${state.deliveryFormat === "xlsx" ? "selected" : ""}>Excel com abas</option>
                </select>
                <span class="field__note">O Excel separa resumo, resultados, falhas e auditoria em abas.</span>
              </label>
              <div class="field field--readonly">
                <span class="field__label">Retomada local</span>
                <strong>Com checkpoint</strong>
              </div>
            </div>

            <div class="base-prep" id="base-local" data-slot="local-public-base-prep-panel" ${state.provider !== SIMPLES_PROVIDER.BASE_PUBLICA_LOCAL ? 'style="display:none"' : ""}>
              <div>
                <span class="ops-label">Base Pública Local</span>
                <strong data-slot="local-public-base-status-line">${escapeHtml(formatLocalPublicBaseStatusLine(state))}</strong>
                <small>Preparada neste computador para consultas locais.</small>
              </div>
              ${button({ variant: "secondary", "data-action": "prepare-local-public-base", children: state.localPublicBasePrepareStatus === "loading" ? "Preparando..." : "Preparar base", disabled: state.status === "processing" || state.localPublicBasePrepareStatus === "loading" || (state.provider === SIMPLES_PROVIDER.BASE_PUBLICA_LOCAL && !state.localPublicBaseNoticeAccepted) })}
            </div>

            <label class="notice-check" for="local-public-base-notice" data-slot="local-public-base-notice-panel" ${state.provider !== SIMPLES_PROVIDER.BASE_PUBLICA_LOCAL ? 'style="display:none"' : ""}>
              <input id="local-public-base-notice" data-field="local-public-base-notice" type="checkbox" ${state.localPublicBaseNoticeAccepted ? "checked" : ""} />
              <span>
                Entendo que a Base Pública Local usa dados de <strong data-slot="local-public-base-date">${escapeHtml(state.localPublicBaseStatus?.baseDate ?? "data não informada")}</strong>.
                <small data-slot="local-public-base-warning">${escapeHtml(state.localPublicBaseStatus?.freshnessWarning ?? "Data da Base indisponível.")}</small>
              </span>
            </label>

            <div class="command-bar command-bar--workbench">
              <p class="message" data-slot="message">${escapeHtml(state.message)}</p>
            </div>
          </section>

          <section class="protocol-zone t-panel-slide" aria-label="Mesa de consulta" data-view-panel="painel" data-open="${state.activeView === "painel" ? "true" : "false"}">
            <div class="zone-head">
              <div>
                <h2>Mesa de consulta</h2>
                <p class="body">Estado local antes da consulta.</p>
              </div>
              <span class="status-token ${state.summary ? "status-token--success" : "status-token--warning"}" data-slot="protocol-status">${escapeHtml(protocolStatus)}</span>
            </div>
            <div class="protocol-list">
              <div class="protocol-item">
                <span class="ops-label">Entrada</span>
                <strong data-slot="protocol-entry">${escapeHtml(protocolEntry)}</strong>
                <p class="body" data-slot="protocol-entry-hint">${escapeHtml(protocolEntryHint)}</p>
              </div>
              <div class="protocol-item">
                <span class="ops-label">Base</span>
                <strong data-slot="protocol-base">${escapeHtml(protocolBase)}</strong>
                <p class="body" data-slot="protocol-base-hint">${escapeHtml(protocolBaseHint)}</p>
              </div>
              <div class="protocol-item">
                <span class="ops-label">Saída</span>
                <strong data-slot="protocol-output">${escapeHtml(protocolOutput)}</strong>
                <p class="body" data-slot="protocol-output-hint">${escapeHtml(protocolOutputHint)}</p>
              </div>
              <div class="protocol-item">
                <span class="ops-label">Retomada</span>
                <strong data-slot="protocol-resume">${escapeHtml(protocolResume)}</strong>
                <p class="body">Aparece apenas quando a consulta gerar checkpoint.</p>
              </div>
            </div>
          </section>

          <aside class="queue-zone t-panel-slide" data-view-panel="fila" data-open="${state.activeView === "fila" ? "true" : "false"}" hidden>
            <div class="zone-head">
              <h2>Arquivo selecionado ${renderHelp("Como funciona", "Quando um arquivo é selecionado, ele fica pronto para iniciar a consulta.")}</h2>
              <span class="status-token" data-slot="queue-count">${referenceMode ? (visualFixture?.queueCount ?? "3 itens") : state.fileName ? "1 item" : "0 itens"}</span>
            </div>
            ${renderQueueItems(referenceMode, activeQueueLabel, activeQueueHint, activeQueueStatus, state)}
          </aside>

          <section class="kpi-strip t-panel-slide" aria-label="Indicadores do lote" data-view-panel="painel" data-progressive="after-file" data-open="${state.activeView === "painel" && hasOperationalSignals ? "true" : "false"}" ${hasOperationalSignals ? "" : "hidden"}>
            <div>
              <span class="ops-label">Hoje</span>
              <strong data-slot="kpi-total-lines">${referenceMode ? (visualFixture?.kpis[0]?.value ?? "0") : (state.summary?.totalLinhas ?? 0)}</strong>
              <p class="body">${referenceMode ? "consultas" : "linhas"}</p>
            </div>
            <div>
              <span class="ops-label">Processados</span>
              <strong data-slot="kpi-processed">${referenceMode ? (visualFixture?.kpis[1]?.value ?? "0") : (state.summary?.totalCnpjsUnicosConsultados ?? 0)}</strong>
              <p class="body">CNPJs</p>
            </div>
            <div>
              <span class="ops-label">Pendentes</span>
              <strong data-slot="kpi-pending">${referenceMode ? (visualFixture?.kpis[2]?.value ?? "0") : state.progress ? Math.max(0, state.progress.totalUniqueLookups - state.progress.completedUniqueLookups) : 0}</strong>
              <p class="body">${referenceMode ? "linhas" : "na fila"}</p>
            </div>
            <div>
              <span class="ops-label">Erros</span>
              <strong data-slot="kpi-errors">${referenceMode ? (visualFixture?.kpis[3]?.value ?? "0") : (state.summary?.totalErros ?? 0)}</strong>
              <p class="body">revisar</p>
            </div>
          </section>

          <section class="session-zone t-panel-slide" aria-label="Sessão local" data-view-panel="painel" data-open="${state.activeView === "painel" ? "true" : "false"}">
            <div class="zone-head">
              <h2>Painel de Execução</h2>
              <span class="status-token ${getOperationalToneClass(operationalPanel.blockerTone)}" data-slot="session-state">${escapeHtml(state.execution?.status ?? "Aguardando")}</span>
            </div>
            <div class="session-grid">
              <div>
                <span class="ops-label">Agora</span>
                <strong data-slot="session-entry">${escapeHtml(operationalPanel.currentItemLabel)}</strong>
              </div>
              <div>
                <span class="ops-label">ETA</span>
                <strong data-slot="session-dedupe">${escapeHtml(operationalPanel.etaLabel)}</strong>
              </div>
              <div>
                <span class="ops-label">Falhas</span>
                <strong data-slot="session-run">${escapeHtml(operationalPanel.failureLabel)}</strong>
              </div>
              <div>
                <span class="ops-label">Último salvamento</span>
                <strong data-slot="session-checkpoint">${escapeHtml(operationalPanel.lastSaveLabel)}</strong>
              </div>
            </div>
            <div class="ops-suggestions" aria-label="Sugestões assistidas">
              <div>
                <span class="ops-label">Bloqueios</span>
                <strong class="status-token ${getOperationalToneClass(operationalPanel.blockerTone)}" data-slot="execution-blocker">${escapeHtml(operationalPanel.blockerLabel)}</strong>
              </div>
              <div>
                <span class="ops-label">Retomada</span>
                <strong data-slot="execution-checkpoint-copy">${escapeHtml(operationalPanel.checkpointLabel)}</strong>
              </div>
              <div>
                <span class="ops-label">Sugestão assistida</span>
                <strong data-slot="execution-suggestion">${escapeHtml(operationalPanel.suggestionLabel)}</strong>
              </div>
            </div>
            ${renderLocalTrustGrid()}
          </section>

          <section class="history-zone t-panel-slide" id="historico" data-view-panel="historico" data-open="${state.activeView === "historico" ? "true" : "false"}" hidden>
            <div class="zone-head">
              <h2>Consultas recentes</h2>
              <button class="button button--ghost button--compact" type="button" data-action="refresh-history">Atualizar</button>
            </div>
            <div data-slot="execution-history">${renderExecutionHistory(state)}</div>
          </section>

          <section class="run-zone t-panel-slide" data-view-panel="atividade" data-open="${state.activeView === "atividade" ? "true" : "false"}" hidden>
            <div class="summary" data-slot="summary">${renderSummary(state.summary)}</div>
            <div class="progress-section" data-slot="progress-section" ${state.status !== "processing" && !state.summary ? 'style="display:none"' : ""}>
              <div class="progress-header">
                <span class="ops-label">Progresso</span>
                <strong data-slot="progress-line">${getProgressLineLabel(state)}</strong>
              </div>
              <div class="ops-progress__track">
                <span data-slot="progress-bar" style="width: ${getProgressPercent(state)}%"></span>
              </div>
              <span class="current-cnpj" data-slot="current-cnpj">${state.progress?.currentCnpj ?? "—"}</span>
            </div>
          </section>

          <section class="log-zone t-panel-slide" data-view-panel="atividade" data-open="${state.activeView === "atividade" ? "true" : "false"}" hidden>
            <div class="zone-head">
              <h2>Atividade</h2>
              <span class="status-token">tempo real</span>
            </div>
            ${renderLogList(state)}
          </section>

          <section class="output-zone t-panel-slide" data-view-panel="resultados" data-open="${state.activeView === "resultados" ? "true" : "false"}" hidden>
            <div class="zone-head">
              <h2>Resultado</h2>
              <span class="status-token" data-slot="delivery-format-badge">${escapeHtml(outputFormatLabel)}</span>
            </div>
            <p class="body" data-slot="output-status">${escapeHtml(outputStatus)}</p>
            <p class="body" data-slot="output-preview">${referenceMode ? "" : autoSavePreview ? escapeHtml(autoSavePreview) : "O arquivo final aparecerá depois da consulta."}</p>
            <div class="save-info" data-slot="save-info" ${!autoSavePreview ? 'style="display:none"' : ""}>
              <span class="ops-label">Arquivo de saída</span>
              <span class="save-path" data-slot="output-save-path">${escapeHtml(autoSavePreview ?? "")}</span>
            </div>
            <div class="output-actions">
              ${referenceMode ? "" : button({ variant: "danger", "data-action": "cancel-processing", children: "Cancelar", disabled: state.status !== "processing" })}
              ${button({ variant: "secondary", "data-action": "save-file", children: "Exportar", disabled: !referenceMode && !state.outputDelivery })}
            </div>
          </section>

          <section class="provider-zone sync-zone" id="provedores" aria-hidden="true">
            <div class="zone-head"><h2>Provedores</h2><button class="button button--ghost button--compact" type="button" disabled>Testar</button></div>
            <div class="provider-list">
              <div><strong>Base local</strong><span class="status-token status-token--success">Preparável</span></div>
              <div><strong>Simulação</strong><span class="status-token">Offline</span></div>
              <div><strong>CNPJá Open</strong><span class="status-token status-token--warning">Externo</span></div>
              <div><strong>Receita Web</strong><span class="status-token status-token--danger">Assistido</span></div>
            </div>
          </section>
        </section>
      </section>
    </main>
  `;
}

export function isReferenceV5A(state: UiState): boolean {
  return state.visualFixture?.scenario === "reference-v5-a";
}

function renderHelp(label: string, text?: string): string {
  const triggerLabel = text ? label : "Ajuda";
  const helpText = text ?? label;

  return `
    <span class="help">
      <button class="help__trigger" type="button" aria-label="${escapeHtml(`${triggerLabel}: ${helpText}`)}">${escapeHtml(triggerLabel)}</button>
      <span class="help__popover" role="tooltip">${escapeHtml(helpText)}</span>
    </span>
  `;
}

function renderViewLink(
  label: string,
  view: UiView,
  activeView: UiView,
  className: string,
  kind: "sidebar" | "tab",
): string {
  const active = view === activeView;
  const activeClass = active ? ` ${className}--active` : "";
  const href = view === "historico" ? "#historico" : "#nova-execucao";
  const aria = active ? ' aria-current="page"' : "";

  return `<a class="${className}${activeClass}" href="${href}" data-view="${view}" data-view-surface="${kind}"${aria}>${escapeHtml(label)}</a>`;
}

export function getProgressPercent(state: UiState): number {
  return state.progress
    ? Math.min(
        100,
        Math.max(
          0,
          (state.progress.completedUniqueLookups /
            Math.max(1, state.progress.totalUniqueLookups)) *
            100,
        ),
      )
    : state.status === "success"
      ? 100
      : 0;
}

export function getProgressLineLabel(state: UiState): string {
  const progress = getLiveProgress(state);

  if (progress) {
    return formatProgressLine(progress);
  }

  if (state.summary) {
    return `${state.summary.totalCnpjsUnicosConsultados} de ${state.summary.totalCnpjsUnicosConsultados} CNPJs únicos concluídos.`;
  }

  return formatProgressLine(null);
}

export function getCurrentCnpjLabel(state: UiState): string {
  return (
    getLiveProgress(state)?.currentCnpj ?? (state.summary ? "Concluído" : "—")
  );
}

export function getDeliveryFormatLabel(
  deliveryFormat: UiState["deliveryFormat"],
): string {
  return deliveryFormat === "xlsx" ? "Excel com abas" : "CSV";
}

export function getProviderStatusLabel(state: UiState): string {
  if (state.provider === SIMPLES_PROVIDER.MOCK) {
    return "Simulação";
  }

  if (state.provider === SIMPLES_PROVIDER.BASE_PUBLICA_LOCAL) {
    return state.localPublicBaseStatus?.state === "ready"
      ? "Base local pronta"
      : "Base local pendente";
  }

  if (state.provider === SIMPLES_PROVIDER.CNPJA_OPEN) {
    return "CNPJá Open";
  }

  return state.receitaWebAvailable
    ? "Receita Web disponível"
    : "Receita Web indisponível";
}

export function getProviderStatusVariant(state: UiState): string {
  if (state.provider === SIMPLES_PROVIDER.MOCK) {
    return "status-token--success";
  }

  if (state.provider === SIMPLES_PROVIDER.BASE_PUBLICA_LOCAL) {
    return state.localPublicBaseStatus?.state === "ready"
      ? "status-token--success"
      : "status-token--warning";
  }

  if (state.provider === SIMPLES_PROVIDER.CNPJA_OPEN) {
    return "status-token--warning";
  }

  return state.receitaWebAvailable
    ? "status-token--warning"
    : "status-token--danger";
}

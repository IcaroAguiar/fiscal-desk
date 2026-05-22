import { SIMPLES_PROVIDER } from "../../core/simples/simples-provider.names";
import type { UiState } from "./app.types";
import {
  escapeHtml,
  getLiveProgress,
  getStatusPillVariant,
  renderStatusLabel,
  renderStatusText,
  renderSummary,
} from "./app-helpers";
import { button, statusPill } from "./components";
import {
  buildDedupeLabel,
  formatCommandBarSummary,
  formatProgressLine,
  formatProviderHint,
  previewAutoSavePath,
} from "./operational-copy";

export function renderShell(state: UiState): string {
  const autoSavePreview = state.savedPath
    ? state.savedPath.split(/[/\\]/).pop()
    : state.filePath
      ? previewAutoSavePath(state.filePath, state.deliveryFormat)
          .split(/[/\\]/)
          .pop()
      : null;

  const statusLabel = renderStatusLabel(state.status);
  const activeQueueLabel = state.fileName ?? "Nenhum lote em preparação";
  const activeQueueHint = state.summary
    ? "Execução concluída"
    : state.fileName
      ? "Pronto para execução"
      : "Selecione um CSV para iniciar";
  const activeQueueStatus = state.summary
    ? "concluído"
    : state.fileName
      ? "revisão"
      : "vazio";

  return `
    <main class="app-shell workbench-shell workbench-v5">
      <div class="window-chrome" aria-hidden="true">
        <span></span><span></span><span></span>
        <strong>A · COCKPIT BORDERLESS</strong>
        <em>LINES ONLY</em>
      </div>
      <aside class="sidebar" aria-label="Navegação principal">
        <div>
          <div class="brand-stack">
            <span class="brand-mark" aria-hidden="true">FD</span>
            <strong>Fiscal Desk</strong>
          </div>
          <nav class="sidebar-nav" aria-label="Módulos">
            <a class="sidebar-nav__item sidebar-nav__item--active" href="#nova-execucao">Execuções <strong>12</strong></a>
            <a class="sidebar-nav__item" href="#nova-execucao">Nova consulta</a>
            <a class="sidebar-nav__item" href="#base-local">Bases locais</a>
            <a class="sidebar-nav__item" href="#provedores">Provedores</a>
            <span class="sidebar-nav__item sidebar-nav__item--disabled" aria-disabled="true">Entregas</span>
            <span class="sidebar-nav__item sidebar-nav__item--disabled" aria-disabled="true">Configurações</span>
          </nav>
        </div>
        <div class="sidebar-footer">
          <span class="status-token status-token--success">offline pronto</span>
          <span>Base pública: ${escapeHtml(state.localPublicBaseStatus?.baseDate ?? "não preparada")}</span>
        </div>
      </aside>

      <section class="workbench-main" aria-label="Workbench Fiscal Desk">
        <header class="ops-topbar">
          <div class="ops-topbar__main">
            <h1>Operação fiscal</h1>
            <nav class="ops-tabs" aria-label="Visões">
              <span class="ops-tabs__item ops-tabs__item--active">Painel</span>
              <span class="ops-tabs__item">Fila</span>
              <span class="ops-tabs__item">Resultados</span>
              <span class="ops-tabs__item">Logs</span>
            </nav>
          </div>
          <div class="ops-topbar__status">
            <span class="status-token ${getProviderStatusVariant(state)}" data-slot="provider-status">${escapeHtml(getProviderStatusLabel(state))}</span>
            <span class="status-token status-token--info">Receita Web assistida</span>
            ${statusPill({ variant: getStatusPillVariant(state.status), children: statusLabel, dataSlot: "top-status-pill" })}
            <span class="sync-only" data-slot="run-status-pill">${escapeHtml(statusLabel)}</span>
            ${button({ variant: "primary", "data-action": "process-file", children: state.status === "processing" ? "Processando..." : "Nova execução", disabled: state.status === "processing" || state.localPublicBasePrepareStatus === "loading" || !state.content || (state.provider === SIMPLES_PROVIDER.BASE_PUBLICA_LOCAL && (!state.localPublicBaseNoticeAccepted || state.localPublicBaseStatus?.state !== "ready")) })}
          </div>
        </header>

        <section class="operations-grid" id="nova-execucao">
          <section class="entry-zone">
            <div class="zone-head">
              <div>
                <h2>Entrada</h2>
                <p class="body">CSV, coluna e provider antes da consulta.</p>
              </div>
              <span class="status-token status-token--warning" data-slot="file-badge">${escapeHtml(state.fileName ?? "aguardando arquivo")}</span>
            </div>

            <div class="file-dropzone">
              <span class="file-dropzone__icon" aria-hidden="true">CSV</span>
              <div>
                <strong data-slot="file-dropzone-title">${state.fileName ? escapeHtml(state.fileName) : "Arquivo de CNPJs"}</strong>
                <span data-slot="file-dropzone-hint">${state.fileName ? escapeHtml(formatProviderHint(state.fileName, state.provider)) : "Arraste aqui ou selecione no computador."}</span>
              </div>
              ${button({ variant: "secondary", "data-action": "pick-file", children: state.fileName ? "Trocar CSV" : "Selecionar" })}
            </div>
          </section>

          <section class="config-zone" aria-label="Configuração">
            <h2>Configuração</h2>
            <div class="config-grid">
              <label class="field" for="provider">
                <span class="field__label">Provider</span>
                <select id="provider" data-field="provider">
                  <option value="${SIMPLES_PROVIDER.MOCK}" ${state.provider === SIMPLES_PROVIDER.MOCK ? "selected" : ""}>mock</option>
                  <option value="${SIMPLES_PROVIDER.BASE_PUBLICA_LOCAL}" ${state.provider === SIMPLES_PROVIDER.BASE_PUBLICA_LOCAL ? "selected" : ""}>base local</option>
                  <option value="${SIMPLES_PROVIDER.CNPJA_OPEN}" ${state.provider === SIMPLES_PROVIDER.CNPJA_OPEN ? "selected" : ""}>cnpja open</option>
                  <option value="${SIMPLES_PROVIDER.RECEITA_WEB}" ${state.provider === SIMPLES_PROVIDER.RECEITA_WEB ? "selected" : ""}>receita web</option>
                </select>
              </label>
              <label class="field" for="cnpj-column">
                <span class="field__label">Coluna</span>
                <input id="cnpj-column" data-field="cnpj-column" type="text" placeholder="auto" value="${escapeHtml(state.cnpjColumn)}" />
              </label>
              <label class="field" for="delivery-format">
                <span class="field__label">Saída</span>
                <select id="delivery-format" data-field="delivery-format">
                  <option value="csv" ${state.deliveryFormat === "csv" ? "selected" : ""}>CSV compatível</option>
                  <option value="xlsx" ${state.deliveryFormat === "xlsx" ? "selected" : ""}>Excel com abas</option>
                </select>
                <span class="field__note">Planilha de Resultado: Resumo, Resultados, Falhas, Divergências e Auditoria.</span>
              </label>
              <div class="field field--readonly">
                <span class="field__label">Checkpoint</span>
                <strong>ligado</strong>
              </div>
            </div>

            <div class="base-prep" id="base-local" data-slot="local-public-base-prep-panel" ${state.provider !== SIMPLES_PROVIDER.BASE_PUBLICA_LOCAL ? 'style="display:none"' : ""}>
              <div>
                <span class="ops-label">Base Pública Local</span>
                <strong data-slot="local-public-base-status-line">${escapeHtml(formatLocalPublicBaseStatusLine(state))}</strong>
                <small>Índice persistido no perfil local do Electron.</small>
              </div>
              ${button({ variant: "secondary", "data-action": "prepare-local-public-base", children: state.localPublicBasePrepareStatus === "loading" ? "Preparando..." : "Preparar base", disabled: state.status === "processing" || state.localPublicBasePrepareStatus === "loading" })}
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

          <aside class="queue-zone">
            <div class="zone-head">
              <h2>Fila</h2>
              <span class="status-token" data-slot="queue-count">${state.fileName ? "1 item" : "0 itens"}</span>
            </div>
            <div class="queue-item queue-item--active">
              <div>
                <strong data-slot="queue-active-name">${escapeHtml(activeQueueLabel)}</strong>
                <p class="body" data-slot="queue-active-hint">${escapeHtml(activeQueueHint)}</p>
              </div>
              <span class="status-token ${state.summary ? "status-token--success" : "status-token--warning"}" data-slot="queue-active-status">${escapeHtml(activeQueueStatus)}</span>
            </div>
          </aside>

          <section class="kpi-strip" aria-label="Indicadores do lote">
            <div>
              <span class="ops-label">Hoje</span>
              <strong data-slot="kpi-total-lines">${state.summary?.totalLinhas ?? 0}</strong>
              <p class="body">linhas</p>
            </div>
            <div>
              <span class="ops-label">Processados</span>
              <strong data-slot="kpi-processed">${state.summary?.totalCnpjsUnicosConsultados ?? 0}</strong>
              <p class="body">CNPJs</p>
            </div>
            <div>
              <span class="ops-label">Pendentes</span>
              <strong data-slot="kpi-pending">${state.progress ? Math.max(0, state.progress.totalUniqueLookups - state.progress.completedUniqueLookups) : 0}</strong>
              <p class="body">fila</p>
            </div>
            <div>
              <span class="ops-label">Erros</span>
              <strong data-slot="kpi-errors">${state.summary?.totalErros ?? 0}</strong>
              <p class="body">revisar</p>
            </div>
          </section>

          <section class="history-zone" id="historico">
            <div class="zone-head">
              <h2>Últimas execuções</h2>
              <button class="button button--ghost button--compact" type="button" data-action="refresh-history">Histórico</button>
            </div>
            <div data-slot="execution-history">${renderExecutionHistory(state)}</div>
          </section>

          <section class="run-zone sync-zone">
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

          <section class="log-zone">
            <div class="zone-head">
              <h2>Log</h2>
              <span class="status-token">tempo real</span>
            </div>
            <div class="log-list">
              <span>Entrada: <strong data-slot="command-summary">${escapeHtml(formatCommandBarSummary(state.fileName, state.provider))}</strong></span>
              <span data-slot="command-hint">${escapeHtml(formatProviderHint(state.fileName, state.provider))}</span>
              <span>Deduplicação: <strong data-slot="dedupe-label">${state.summary ? buildDedupeLabel(state.summary) : "—"}</strong></span>
              <span>Ledger: <strong data-slot="execution-status">${state.execution?.status ?? "Aguardando"}</strong></span>
              <span>Run: <strong data-slot="execution-run-id">${state.execution?.runId.slice(0, 8) ?? "—"}</strong></span>
              <span>Retomada: <strong data-slot="execution-resume">${state.execution ? `${state.execution.resumedUniqueLookups} retomadas de checkpoint` : "Sem retomada ativa"}</strong></span>
              <span>Checkpoint: <strong data-slot="execution-checkpoint">${state.execution?.checkpointPath ? escapeHtml(state.execution.checkpointPath.split(/[/\\]/).pop() ?? "ledger.json") : "—"}</strong></span>
            </div>
          </section>

          <section class="output-zone">
            <div class="zone-head">
              <h2>Saída</h2>
              <span class="status-token" data-slot="delivery-format-badge">${escapeHtml(getDeliveryFormatLabel(state.deliveryFormat))}</span>
            </div>
            <p class="body" data-slot="output-status">${escapeHtml(renderStatusText(state))}</p>
            <p class="body" data-slot="output-preview">${autoSavePreview ? escapeHtml(autoSavePreview) : "Aguardando execução"}</p>
            <div class="save-info" data-slot="save-info" ${!autoSavePreview ? 'style="display:none"' : ""}>
              <span class="ops-label">Arquivo de saída</span>
              <span class="save-path" data-slot="output-save-path">${escapeHtml(autoSavePreview ?? "")}</span>
            </div>
            <div class="output-actions">
              <button class="button button--secondary" type="button" disabled>Pasta</button>
              ${button({ variant: "danger", "data-action": "cancel-processing", children: "Cancelar", disabled: state.status !== "processing" })}
              ${button({ variant: "secondary", "data-action": "save-file", children: "Exportar", disabled: !state.outputDelivery })}
            </div>
          </section>

          <section class="provider-zone sync-zone" id="provedores">
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
  return deliveryFormat === "xlsx" ? "Excel com abas" : "CSV compatível";
}

export function getProviderStatusLabel(state: UiState): string {
  if (state.provider === SIMPLES_PROVIDER.MOCK) {
    return "mock ativo";
  }

  if (state.provider === SIMPLES_PROVIDER.BASE_PUBLICA_LOCAL) {
    return state.localPublicBaseStatus?.state === "ready"
      ? "base local pronta"
      : "base local pendente";
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

export function renderExecutionHistory(state: UiState): string {
  if (state.historyStatus === "loading") {
    return '<p class="history-empty">Carregando histórico local...</p>';
  }

  if (state.historyStatus === "error") {
    return '<p class="history-empty">Não foi possível carregar o histórico local.</p>';
  }

  if (state.executionHistory.length === 0) {
    return '<p class="history-empty">Nenhuma execução registrada neste perfil.</p>';
  }

  return `
    <ol class="history-list">
      ${state.executionHistory
        .map((item) => {
          const sourceName = item.sourceFileName ?? "CSV sem caminho";
          const updatedAt = formatHistoryDate(item.updatedAt);
          const checkpointLabel = `${item.checkpointedUniqueLookups}/${item.totalUniqueLookups || "?"} checkpoints`;
          const resumeButton = item.canResume
            ? `<button class="button button--secondary button--compact" type="button" data-action="resume-execution" data-ledger-key="${escapeHtml(item.ledgerKey)}" ${state.status === "processing" ? "disabled" : ""}>Retomar</button>`
            : `<span class="history-list__blocked">${escapeHtml(item.resumeBlockedReason ?? "Histórico")}</span>`;

          return `
            <li class="history-list__item">
              <div class="history-list__main">
                <strong>${escapeHtml(sourceName)}</strong>
                <span>${escapeHtml(item.providerName)} • ${escapeHtml(item.status)} • ${escapeHtml(updatedAt)}</span>
                <span>${escapeHtml(checkpointLabel)}</span>
              </div>
              ${resumeButton}
            </li>
          `;
        })
        .join("")}
    </ol>
  `;
}

function formatHistoryDate(value: string): string {
  const timestamp = Date.parse(value);

  if (Number.isNaN(timestamp)) {
    return value;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(timestamp);
}

function formatLocalPublicBaseStatusLine(state: UiState): string {
  const status = state.localPublicBaseStatus;

  if (!status || status.state === "not-prepared") {
    return "Base ainda não preparada neste perfil.";
  }

  if (status.state === "error") {
    return status.errorMessage ?? "Base Pública Local indisponível.";
  }

  return [
    `${status.preparedRows} registros preparados`,
    `${status.rejectedRows} rejeitados`,
    `Data da Base: ${status.baseDate ?? "não informada"}`,
    status.sourceFileName ? `Origem: ${status.sourceFileName}` : null,
  ]
    .filter(Boolean)
    .join(" • ");
}

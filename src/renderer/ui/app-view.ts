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

  return `
    <main class="app-shell workbench-shell">
      <aside class="sidebar" aria-label="Navegação principal">
        <div class="brand-stack">
          <span class="brand-mark" aria-hidden="true">FD</span>
          <div>
            <strong>Fiscal Desk</strong>
            <span>Local desktop</span>
          </div>
        </div>

        <nav class="sidebar-nav" aria-label="Módulos">
          <a class="sidebar-nav__item sidebar-nav__item--active" href="#nova-execucao">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h18"/><path d="M12 3v18"/></svg>
            Nova execução
          </a>
          <a class="sidebar-nav__item" href="#historico">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 5h16"/><path d="M4 12h16"/><path d="M4 19h10"/></svg>
            Execuções
          </a>
          <a class="sidebar-nav__item" href="#base-local">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="7" ry="3"/><path d="M5 5v14c0 1.7 3.1 3 7 3s7-1.3 7-3V5"/><path d="M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3"/></svg>
            Bases locais
          </a>
          <a class="sidebar-nav__item" href="#provedores">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16"/><path d="M7 7v10"/><path d="M17 7v10"/><path d="M5 17h14"/></svg>
            Provedores
          </a>
          <span class="sidebar-nav__item sidebar-nav__item--disabled" aria-disabled="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16v16H4z"/><path d="M8 9h8"/><path d="M8 13h8"/></svg>
            Templates
          </span>
          <span class="sidebar-nav__item sidebar-nav__item--disabled" aria-disabled="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v18"/><path d="M3 12h18"/><path d="M5 5l14 14"/></svg>
            Configurações
          </span>
        </nav>

        <div class="sidebar-footer">
          <span class="system-dot" aria-hidden="true"></span>
          <div>
            <strong>Ambiente local</strong>
            <span>v0.1.1 • sem backend remoto</span>
          </div>
        </div>
      </aside>

      <section class="workbench-main" aria-label="Workbench Fiscal Desk">
        <header class="ops-topbar">
          <div>
            <span class="ops-label">Workbench fiscal local</span>
            <h1>Execução de CNPJs em lote</h1>
          </div>
          <div class="ops-topbar__status">
            <span class="ops-chip">Base: ${escapeHtml(state.localPublicBaseStatus?.baseDate ?? "não preparada")}</span>
            <span class="ops-chip">Provider: ${escapeHtml(state.provider)}</span>
            ${statusPill({ variant: getStatusPillVariant(state.status), children: renderStatusLabel(state.status), dataSlot: "top-status-pill" })}
          </div>
        </header>

        <div class="system-strip" aria-label="Estado operacional">
          <div>
            <span class="ops-label">Entrada</span>
            <strong data-slot="command-summary">${escapeHtml(formatCommandBarSummary(state.fileName, state.provider))}</strong>
            <small data-slot="command-hint">${escapeHtml(formatProviderHint(state.fileName, state.provider))}</small>
          </div>
          <div>
            <span class="ops-label">Saída</span>
            <strong data-slot="output-status">${escapeHtml(renderStatusText(state))}</strong>
            <small data-slot="output-preview">${autoSavePreview ? escapeHtml(autoSavePreview) : "Aguardando execução"}</small>
          </div>
          <div>
            <span class="ops-label">Próxima verificação</span>
            <strong>Manual</strong>
            <small>Atualização pelo app em preparação</small>
          </div>
        </div>

        <section class="workbench-grid" id="nova-execucao">
          <div class="primary-rail">
            <section class="surface execution-card">
              <div class="surface__header">
                <div>
                  <span class="ops-label">Nova execução</span>
                  <h2>Entrada, base e entrega</h2>
                </div>
                <span class="panel__badge" data-slot="file-badge">${escapeHtml(state.fileName ?? "Nenhum arquivo")}</span>
              </div>

              <ol class="stepper" aria-label="Etapas da execução">
                <li class="stepper__item stepper__item--active"><span>1</span>Entrada</li>
                <li class="stepper__item ${state.provider === SIMPLES_PROVIDER.BASE_PUBLICA_LOCAL ? "stepper__item--active" : ""}"><span>2</span>Base</li>
                <li class="stepper__item"><span>3</span>Provedor</li>
                <li class="stepper__item"><span>4</span>Entrega</li>
                <li class="stepper__item ${state.status === "processing" ? "stepper__item--active" : ""}"><span>5</span>Execução</li>
                <li class="stepper__item ${state.summary ? "stepper__item--active" : ""}"><span>6</span>Resultado</li>
              </ol>

              <div class="file-dropzone">
                <div class="file-dropzone__icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M8 13h8"/><path d="M8 17h5"/></svg>
                </div>
                <div>
                  <strong data-slot="file-dropzone-title">${state.fileName ? escapeHtml(state.fileName) : "Escolha o CSV de entrada"}</strong>
                  <span data-slot="file-dropzone-hint">${state.fileName ? escapeHtml(formatProviderHint(state.fileName, state.provider)) : "Leitura local, detecção de coluna e cópia processada ao lado do arquivo original."}</span>
                </div>
                ${button({ variant: "secondary", "data-action": "pick-file", children: state.fileName ? "Trocar CSV" : "Selecionar CSV" })}
              </div>

              <div class="controls-row controls-row--workbench">
                <label class="field" for="provider">
                  <span class="field__label">
                    Provedor
                    <span class="field__hint" title="mock: dados simulados, sem rede | base pública local: índice preparado a partir de CSV local | cnpja-open: consulta real ao serviço | receita-web: navegador visível e supervisão do usuário">?</span>
                  </span>
                  <select id="provider" data-field="provider">
                    <option value="${SIMPLES_PROVIDER.MOCK}" ${state.provider === SIMPLES_PROVIDER.MOCK ? "selected" : ""}>Simulação local — offline</option>
                    <option value="${SIMPLES_PROVIDER.BASE_PUBLICA_LOCAL}" ${state.provider === SIMPLES_PROVIDER.BASE_PUBLICA_LOCAL ? "selected" : ""}>Base Pública Local — Data da Base</option>
                    <option value="${SIMPLES_PROVIDER.CNPJA_OPEN}" ${state.provider === SIMPLES_PROVIDER.CNPJA_OPEN ? "selected" : ""}>CNPJá Open — consulta real</option>
                    <option value="${SIMPLES_PROVIDER.RECEITA_WEB}" ${state.provider === SIMPLES_PROVIDER.RECEITA_WEB ? "selected" : ""}>Receita Web — assistido e experimental</option>
                  </select>
                  ${
                    state.provider === SIMPLES_PROVIDER.RECEITA_WEB
                      ? '<span class="field__note">Navegador visível, sujeito a bloqueios e supervisão humana.</span>'
                      : state.provider === SIMPLES_PROVIDER.BASE_PUBLICA_LOCAL
                        ? `<span class="field__note">Base ${escapeHtml(state.localPublicBaseStatus?.baseDate ?? "não preparada")} • ${escapeHtml(state.localPublicBaseStatus?.estimatedSizeLabel ?? "tamanho não informado")} • ${escapeHtml(state.localPublicBaseStatus?.diskUsageLabel ?? "uso de disco não informado")}.</span>`
                        : '<span class="field__note">Modo offline para validação segura do fluxo.</span>'
                  }
                </label>

                <label class="field" for="cnpj-column">
                  <span class="field__label">Coluna de CNPJ</span>
                  <input
                    id="cnpj-column"
                    data-field="cnpj-column"
                    type="text"
                    placeholder="Detectada automaticamente"
                    value="${escapeHtml(state.cnpjColumn)}"
                  />
                </label>

                <label class="field" for="delivery-format">
                  <span class="field__label">Entrega</span>
                  <select id="delivery-format" data-field="delivery-format">
                    <option value="csv" ${state.deliveryFormat === "csv" ? "selected" : ""}>CSV compatível</option>
                    <option value="xlsx" ${state.deliveryFormat === "xlsx" ? "selected" : ""}>Excel com abas</option>
                  </select>
                  <span class="field__note">Planilha de Resultado inclui Resumo, Resultados, Falhas, Divergências e Auditoria.</span>
                </label>
              </div>

              <div class="base-prep" id="base-local" data-slot="local-public-base-prep-panel" ${state.provider !== SIMPLES_PROVIDER.BASE_PUBLICA_LOCAL ? 'style="display:none"' : ""}>
                <div>
                  <span class="ops-label">Base Pública Local</span>
                  <strong data-slot="local-public-base-status-line">${escapeHtml(formatLocalPublicBaseStatusLine(state))}</strong>
                  <small>Índice persistido no perfil local do Electron. Não há consulta online por item.</small>
                </div>
                ${button({ variant: "secondary", "data-action": "prepare-local-public-base", children: state.localPublicBasePrepareStatus === "loading" ? "Preparando..." : "Preparar base", disabled: state.status === "processing" || state.localPublicBasePrepareStatus === "loading" })}
              </div>

              <label class="notice-check" for="local-public-base-notice" data-slot="local-public-base-notice-panel" ${state.provider !== SIMPLES_PROVIDER.BASE_PUBLICA_LOCAL ? 'style="display:none"' : ""}>
                <input
                  id="local-public-base-notice"
                  data-field="local-public-base-notice"
                  type="checkbox"
                  ${state.localPublicBaseNoticeAccepted ? "checked" : ""}
                />
                <span>
                  Entendo que a Base Pública Local usa dados de <strong data-slot="local-public-base-date">${escapeHtml(state.localPublicBaseStatus?.baseDate ?? "data não informada")}</strong>, pode estar defasada e deve ser confirmada em casos sensíveis.
                  <small data-slot="local-public-base-warning">${escapeHtml(state.localPublicBaseStatus?.freshnessWarning ?? "Data da Base indisponível.")}</small>
                </span>
              </label>

              <div class="command-bar command-bar--workbench">
                <p class="message" data-slot="message">${escapeHtml(state.message)}</p>
                <div class="command-bar__actions">
                  ${button({ variant: "primary", "data-action": "process-file", children: state.status === "processing" ? "Processando..." : "Iniciar execução", disabled: state.status === "processing" || state.localPublicBasePrepareStatus === "loading" || !state.content || (state.provider === SIMPLES_PROVIDER.BASE_PUBLICA_LOCAL && (!state.localPublicBaseNoticeAccepted || state.localPublicBaseStatus?.state !== "ready")) })}
                  ${button({ variant: "danger", "data-action": "cancel-processing", children: "Cancelar", disabled: state.status !== "processing" })}
                  ${button({ variant: "secondary", "data-action": "save-file", children: "Salvar cópia", disabled: !state.outputDelivery })}
                </div>
              </div>
            </section>

            <section class="surface result-rail">
              <div class="surface__header">
                <div>
                  <span class="ops-label">Resultado e entrega</span>
                  <h2>Saída profissional</h2>
                </div>
                <span class="ops-chip">${state.deliveryFormat === "xlsx" ? "Excel com abas" : "CSV compatível"}</span>
              </div>
              <div class="result-actions">
                <button class="button button--ghost" type="button" disabled>Modelo de entrega</button>
                <button class="button button--ghost" type="button" disabled>Divergências</button>
                <button class="button button--ghost" type="button" disabled>Auditoria</button>
                <button class="button button--ghost" type="button" disabled>Exportar parcial</button>
              </div>
              <div class="save-info" data-slot="save-info" ${!autoSavePreview ? 'style="display:none"' : ""}>
                <span class="ops-label">Arquivo de saída</span>
                <span class="save-path" data-slot="output-save-path">${escapeHtml(autoSavePreview ?? "")}</span>
              </div>
            </section>
          </div>

          <aside class="secondary-rail">
            <section class="surface run-panel">
              <div class="surface__header">
                <div>
                  <span class="ops-label">Painel da execução</span>
                  <h2>Status do lote</h2>
                </div>
                ${statusPill({ variant: getStatusPillVariant(state.status), children: renderStatusLabel(state.status), dataSlot: "run-status-pill" })}
              </div>

              <div class="summary" data-slot="summary">${renderSummary(state.summary)}</div>

              <div class="progress-section" data-slot="progress-section" ${state.status !== "processing" && !state.summary ? 'style="display:none"' : ""}>
                <div class="progress-header">
                  <span class="ops-label">Progresso</span>
                  <strong data-slot="progress-line">${getProgressLineLabel(state)}</strong>
                </div>
                <div class="ops-progress__track">
                  <span data-slot="progress-bar" style="width: ${getProgressPercent(state)}%"></span>
                </div>
                <span class="current-cnpj" data-slot="current-cnpj">${
                  state.progress?.currentCnpj ?? "—"
                }</span>
              </div>

              <div class="dedupe-info">
                <span class="ops-label">Deduplicação aplicada</span>
                <strong data-slot="dedupe-label">${
                  state.summary
                    ? buildDedupeLabel(state.summary)
                    : "Aguardando processamento"
                }</strong>
              </div>

              <div class="execution-ledger">
                <div>
                  <span class="ops-label">Ledger local</span>
                  <strong data-slot="execution-status">${
                    state.execution?.status ?? "Aguardando"
                  }</strong>
                </div>
                <div>
                  <span class="ops-label">Execução</span>
                  <strong data-slot="execution-run-id">${
                    state.execution?.runId.slice(0, 8) ?? "—"
                  }</strong>
                </div>
                <div>
                  <span class="ops-label">Retomada</span>
                  <strong data-slot="execution-resume">${
                    state.execution
                      ? `${state.execution.resumedUniqueLookups} retomadas de checkpoint`
                      : "Sem retomada ativa"
                  }</strong>
                </div>
                <div>
                  <span class="ops-label">Checkpoint</span>
                  <span class="save-path" data-slot="execution-checkpoint">${
                    state.execution?.checkpointPath
                      ? escapeHtml(
                          state.execution.checkpointPath.split(/[/\\]/).pop() ??
                            "ledger.json",
                        )
                      : "—"
                  }</span>
                </div>
              </div>
            </section>

            <section class="surface provider-health" id="provedores">
              <div class="surface__header">
                <div>
                  <span class="ops-label">Saúde operacional</span>
                  <h2>Provedores</h2>
                </div>
                <button class="button button--ghost button--compact" type="button" disabled>Testar</button>
              </div>
              <div class="provider-list">
                <div><strong>Base local</strong><span class="status-token status-token--success">Preparável</span></div>
                <div><strong>Simulação</strong><span class="status-token">Offline</span></div>
                <div><strong>CNPJá Open</strong><span class="status-token status-token--warning">Externo</span></div>
                <div><strong>Receita Web</strong><span class="status-token status-token--danger">Assistido</span></div>
              </div>
            </section>

            <section class="surface execution-history" id="historico">
              <div class="execution-history__header">
                <div>
                  <span class="ops-label">Histórico local</span>
                  <strong>Execuções recentes</strong>
                </div>
                <button class="button button--ghost button--compact" type="button" data-action="refresh-history">Atualizar</button>
              </div>
              <div data-slot="execution-history">
                ${renderExecutionHistory(state)}
              </div>
            </section>
          </aside>
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

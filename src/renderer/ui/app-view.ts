import type { UiState } from "./app.types";
import {
  escapeHtml,
  getLiveProgress,
  getStatusPillVariant,
  renderStatusLabel,
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
      ? previewAutoSavePath(state.filePath).split(/[/\\]/).pop()
      : null;

  return `
    <main class="app-shell">
      <header class="topbar">
        <div class="brand-lockup">
          <span class="brand-mark" aria-hidden="true">FD</span>
          <div class="brand-lockup__copy">
            <strong>Fiscal Desk</strong>
            <span class="brand-subtitle">Consulta local de CNPJs em lote</span>
          </div>
        </div>
        ${statusPill({ variant: getStatusPillVariant(state.status), children: renderStatusLabel(state.status) })}
      </header>

      <section class="intro">
        <div class="intro__card">
          <div class="intro__header">
            <div>
              <span class="intro__eyebrow">Execução local-first</span>
              <h1 class="intro__title">Prepare, consulte e salve lotes de CNPJs sem sair do seu computador.</h1>
            </div>
            <div class="intro__badges">
              <span class="intro__badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
                CSV local
              </span>
              <span class="intro__badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                ETA em tempo real
              </span>
              <span class="intro__badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                Salvamento
              </span>
            </div>
          </div>
          <p class="intro__text">
            Esta primeira versão mantém o fluxo confiável de CSV: você escolhe o arquivo, define o provedor,
            acompanha o processamento e recebe uma cópia salva ao lado do original. Recursos como base pública local,
            Excel e PDF ainda não são prometidos nesta tela.
          </p>
          <div class="release-strip" aria-label="Recursos desta versão">
            <div>
              <span class="ops-label">Disponível agora</span>
              <strong>CSV, deduplicação e saída automática</strong>
            </div>
            <div>
              <span class="ops-label">Em evolução</span>
              <strong>Base local, Excel e relatórios</strong>
            </div>
            <div>
              <span class="ops-label">Transparência</span>
              <strong>Provedores com limites explícitos</strong>
            </div>
          </div>
        </div>
      </section>

      <section class="workspace">
        <div class="panel panel--primary">
          <div class="panel__header">
            <h2>Nova execução</h2>
            <span class="panel__badge" data-slot="file-badge">${state.fileName ?? "Nenhum arquivo"}</span>
          </div>

          <div class="command-bar">
            <div class="command-bar__context">
              <span class="command-bar__label">Entrada</span>
              <span class="command-bar__file" data-slot="command-summary">${
                state.fileName
                  ? escapeHtml(
                      formatCommandBarSummary(state.fileName, state.provider),
                    )
                  : "Nenhum arquivo selecionado"
              }</span>
              <span class="command-bar__hint" data-slot="command-hint">${formatProviderHint(state.fileName, state.provider)}</span>
            </div>
            <div class="command-bar__actions">
              ${button({ variant: "ghost", "data-action": "pick-file", children: "Selecionar CSV" })}
              ${button({ variant: "primary", "data-action": "process-file", children: state.status === "processing" ? "Processando..." : "Iniciar execução", disabled: state.status === "processing" || !state.content })}
              ${button({ variant: "danger", "data-action": "cancel-processing", children: "Cancelar", disabled: state.status !== "processing" })}
              ${button({ variant: "secondary", "data-action": "save-file", children: "Salvar cópia", disabled: !state.outputCsv })}
            </div>
          </div>

          <div class="controls-row">
            <label class="field" for="provider">
              <span class="field__label">
                Provedor
                <span class="field__hint" title="mock: dados simulados, sem rede | cnpja-open: consulta real ao serviço | receita-web: navegador visível e supervisão do usuário">?</span>
              </span>
              <select id="provider" data-field="provider">
                <option value="mock" ${state.provider === "mock" ? "selected" : ""}>Simulação local — offline</option>
                <option value="cnpja-open" ${state.provider === "cnpja-open" ? "selected" : ""}>CNPJá Open — consulta real</option>
                <option value="receita-web" ${state.provider === "receita-web" ? "selected" : ""}>Receita Web — assistido e experimental</option>
              </select>
              ${
                state.provider === "receita-web"
                  ? '<span class="field__hint">Abre navegador visível, pode ser bloqueado por proteção anti-robô, exige supervisão humana em lotes grandes e no Windows depende de Chrome ou Edge instalados.</span>'
                  : ""
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
          </div>

          <div class="progress-section" ${state.status !== "processing" && !state.summary ? 'style="display:none"' : ""}>
            <div class="progress-header">
              <span class="ops-label">Progresso</span>
              <strong data-slot="progress-line">${formatProgressLine(state.progress)}</strong>
            </div>
            <div class="ops-progress__track">
              <span data-slot="progress-bar"></span>
            </div>
            <span class="current-cnpj" data-slot="current-cnpj">${
              state.progress?.currentCnpj ?? "—"
            }</span>
          </div>

          <p class="message" data-slot="message">${escapeHtml(state.message)}</p>
        </div>

        <aside class="panel panel--secondary">
          <div class="panel__header">
            <h2>Painel da execução</h2>
          </div>
          <div class="summary" data-slot="summary">${renderSummary(state.summary)}</div>

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

          <div class="execution-history">
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
          </div>

          <div class="save-info" ${!autoSavePreview ? 'style="display:none"' : ""}>
            <span class="ops-label">Arquivo de saída</span>
            <span class="save-path">${escapeHtml(autoSavePreview ?? "")}</span>
          </div>

          <div class="info-items">
            <div class="info-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
              Use <strong>Simulação local</strong> para testar sem consumir API.
            </div>
            <div class="info-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l8 4v6c0 5-3.5 8-8 8s-8-3-8-8V7l8-4z"/><path d="M9 12l2 2 4-4"/></svg>
              <strong>Receita Web</strong> é assistida e experimental: funciona melhor com navegador visível, no Windows usa Chrome ou Edge instalados e não deve ser tratada como automação massiva.
            </div>
            <div class="info-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/></svg>
              O arquivo é salvo automaticamente ao lado do original.
            </div>
            <div class="info-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              CNPJs duplicados são contados mas consultados apenas uma vez.
            </div>
          </div>
        </aside>
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

export function getCurrentCnpjLabel(state: UiState): string {
  return getLiveProgress(state)?.currentCnpj ?? "—";
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

import { SIMPLES_PROVIDER } from "../../core/simples/simples-provider.names";
import type { UiState } from "./app.types";
import { escapeHtml } from "./app-helpers";
import { formatProviderMode } from "./operational-copy";

export function renderExecutionHistory(state: UiState): string {
  if (state.historyStatus === "loading") {
    return '<p class="history-empty">Carregando consultas recentes...</p>';
  }

  if (state.historyStatus === "error") {
    return '<p class="history-empty">Não foi possível carregar as consultas recentes. Tente atualizar.</p>';
  }

  if (state.executionHistory.length === 0) {
    return '<p class="history-empty">Nenhuma consulta feita ainda neste computador.</p>';
  }

  return `
    <ol class="history-list">
      ${state.executionHistory
        .map((item) => {
          const sourceName = item.sourceFileName ?? "CSV sem caminho";
          const updatedAt = formatHistoryDate(item.updatedAt);
          const pendingUniqueLookups = getPendingUniqueLookups(item);
          const checkpointLabel = `${item.checkpointedUniqueLookups}/${item.totalUniqueLookups || "?"} CNPJs salvos para retomada`;
          const pendingLabel =
            pendingUniqueLookups > 0
              ? `${pendingUniqueLookups} CNPJ${pendingUniqueLookups === 1 ? "" : "s"} pendente${pendingUniqueLookups === 1 ? "" : "s"}`
              : "Sem pendências";
          const partialLabel =
            item.hasPartialOutput && item.outputPath
              ? `Parcial salvo: ${escapeHtml(getFileName(item.outputPath))}`
              : null;
          const resumeButton = item.canResume
            ? `<button class="button button--secondary button--compact" type="button" data-action="resume-execution" data-ledger-key="${escapeHtml(item.ledgerKey)}" ${state.status === "processing" ? "disabled" : ""}>Retomar</button>`
            : `<span class="history-list__blocked">${escapeHtml(item.resumeBlockedReason ?? "Histórico")}</span>`;
          const exportPendingButton = item.canExportPending
            ? `<button class="button button--ghost button--compact" type="button" data-action="export-pending-cnpjs" data-ledger-key="${escapeHtml(item.ledgerKey)}" ${state.status === "processing" ? "disabled" : ""}>Exportar pendências</button>`
            : "";
          const completeButton = item.outputPath
            ? `
              <label class="history-list__completion">
                <span>Complementar com</span>
                <select data-field="completion-provider" data-ledger-key="${escapeHtml(item.ledgerKey)}" ${state.status === "processing" ? "disabled" : ""}>
                  ${renderCompletionProviderOptions(state)}
                </select>
              </label>
              <button class="button button--ghost button--compact" type="button" data-action="complete-processed-csv" data-ledger-key="${escapeHtml(item.ledgerKey)}" ${state.status === "processing" ? "disabled" : ""}>Complementar não encontrados</button>
            `
            : "";

          return `
            <li class="history-list__item">
              <div class="history-list__main">
                <strong>${escapeHtml(sourceName)}</strong>
                <span>${escapeHtml(formatProviderMode(item.providerName))} • ${escapeHtml(formatHistoryStatus(item.status))} • ${escapeHtml(updatedAt)}</span>
                <span>${escapeHtml(checkpointLabel)}</span>
                <span>${escapeHtml(pendingLabel)}${partialLabel ? ` • ${partialLabel}` : ""}</span>
              </div>
              <div class="history-list__actions">
                ${completeButton}
                ${exportPendingButton}
                ${resumeButton}
              </div>
            </li>
          `;
        })
        .join("")}
    </ol>
  `;
}

function renderCompletionProviderOptions(state: UiState): string {
  const localBaseReady = state.localPublicBaseStatus?.state === "ready";
  const defaultProvider = state.receitaWebAvailable
    ? SIMPLES_PROVIDER.RECEITA_WEB
    : SIMPLES_PROVIDER.CNPJA_OPEN;

  return [
    renderProviderOption(
      SIMPLES_PROVIDER.CNPJA_OPEN,
      "CNPJá Open",
      defaultProvider === SIMPLES_PROVIDER.CNPJA_OPEN,
    ),
    renderProviderOption(
      SIMPLES_PROVIDER.RECEITA_WEB,
      "Receita Web",
      defaultProvider === SIMPLES_PROVIDER.RECEITA_WEB,
      !state.receitaWebAvailable,
    ),
    renderProviderOption(
      SIMPLES_PROVIDER.RECEITA_WEB_PARALLEL_EXPERIMENTAL,
      "Receita Web experimental",
      false,
      !state.receitaWebAvailable,
    ),
    renderProviderOption(
      SIMPLES_PROVIDER.BASE_PUBLICA_LOCAL,
      "Base local",
      false,
      !localBaseReady,
    ),
    renderProviderOption(SIMPLES_PROVIDER.MOCK, "Teste local offline", false),
  ].join("");
}

function renderProviderOption(
  value: string,
  label: string,
  selected: boolean,
  disabled = false,
): string {
  return `<option value="${escapeHtml(value)}" ${selected ? "selected" : ""} ${disabled ? "disabled hidden" : ""}>${escapeHtml(label)}</option>`;
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

function formatHistoryStatus(value: string): string {
  if (value === "SUCCESS") return "concluído";
  if (value === "ERROR") return "erro";
  if (value === "CANCELLED") return "cancelado";
  if (value === "PROCESSING") return "em consulta";
  return value.toLowerCase();
}

function getPendingUniqueLookups(item: {
  checkpointedUniqueLookups: number;
  pendingUniqueLookups?: number;
  totalUniqueLookups: number;
}): number {
  if (typeof item.pendingUniqueLookups === "number") {
    return Math.max(0, item.pendingUniqueLookups);
  }

  return Math.max(0, item.totalUniqueLookups - item.checkpointedUniqueLookups);
}

function getFileName(filePath: string): string {
  return filePath.split(/[/\\]/).pop() ?? filePath;
}

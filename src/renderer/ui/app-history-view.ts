import type { UiState } from "./app.types";
import { escapeHtml } from "./app-helpers";
import { formatProviderMode } from "./operational-copy";

export function renderExecutionHistory(state: UiState): string {
  if (state.visualFixture?.scenario === "reference-v5-a") {
    return `
      <ol class="history-list history-list--reference">
        ${(state.visualFixture?.historyRows ?? [])
          .map((row) => {
            return `
              <li class="history-list__item">
                <div class="history-list__main">
                  <strong>${escapeHtml(row.fileName)}</strong>
                  <span><span class="status-token ${getReferenceStatusVariant(row.status)}">${escapeHtml(row.status)}</span></span>
                  <span>${escapeHtml(String(row.rowCount))}</span>
                  <span>${escapeHtml(row.provider)}</span>
                  <span>${escapeHtml(row.resultStatus)}</span>
                </div>
              </li>
            `;
          })
          .join("")}
      </ol>
    `;
  }

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
          const checkpointLabel = `${item.checkpointedUniqueLookups}/${item.totalUniqueLookups || "?"} CNPJs salvos para retomada`;
          const resumeButton = item.canResume
            ? `<button class="button button--secondary button--compact" type="button" data-action="resume-execution" data-ledger-key="${escapeHtml(item.ledgerKey)}" ${state.status === "processing" ? "disabled" : ""}>Retomar</button>`
            : `<span class="history-list__blocked">${escapeHtml(item.resumeBlockedReason ?? "Histórico")}</span>`;

          return `
            <li class="history-list__item">
              <div class="history-list__main">
                <strong>${escapeHtml(sourceName)}</strong>
                <span>${escapeHtml(formatProviderMode(item.providerName))} • ${escapeHtml(formatHistoryStatus(item.status))} • ${escapeHtml(updatedAt)}</span>
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

function getReferenceStatusVariant(status: string): string {
  if (status === "concluído") return "status-token--success";
  if (status === "erro") return "status-token--danger";
  return "status-token--warning";
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

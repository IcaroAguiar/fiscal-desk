import type { UiState } from "./app.types";
import { escapeHtml } from "./app-helpers";
import {
  buildDedupeLabel,
  formatCommandBarSummary,
  formatExecutionResume,
  formatProviderHint,
} from "./operational-copy";

export function renderQueueItems(
  referenceMode: boolean,
  activeQueueLabel: string,
  activeQueueHint: string,
  activeQueueStatus: string,
  state: UiState,
): string {
  if (referenceMode) {
    return (state.visualFixture?.queueRows ?? [])
      .map(
        (item, index) => `
          <div class="queue-item ${index === 0 ? "queue-item--active" : ""}">
            <div>
              <strong ${index === 0 ? 'data-slot="queue-active-name"' : ""}>${escapeHtml(item.fileName)}</strong>
              <p class="body" ${index === 0 ? 'data-slot="queue-active-hint"' : ""}>${escapeHtml(item.statusHint)}</p>
            </div>
            <span class="status-token ${getReferenceStatusVariant(item.status)}" ${index === 0 ? 'data-slot="queue-active-status"' : ""}>${escapeHtml(item.status)}</span>
          </div>
        `,
      )
      .join("");
  }

  return `
    <div class="queue-item queue-item--active">
      <div>
        <strong data-slot="queue-active-name">${escapeHtml(activeQueueLabel)}</strong>
        <p class="body" data-slot="queue-active-hint">${escapeHtml(activeQueueHint)}</p>
      </div>
      <span class="status-token ${state.summary ? "status-token--success" : "status-token--warning"}" data-slot="queue-active-status">${escapeHtml(activeQueueStatus)}</span>
    </div>
  `;
}

export function renderLogList(state: UiState): string {
  if (state.visualFixture?.scenario === "reference-v5-a") {
    return `
      <div class="log-list">
        ${(state.visualFixture?.logs ?? []).map((line) => `<span>${escapeHtml(line)}</span>`).join("")}
      </div>
    `;
  }

  return `
    <div class="log-list">
      <span>Arquivo: <strong data-slot="command-summary">${escapeHtml(formatCommandBarSummary(state.fileName, state.provider))}</strong></span>
      <span data-slot="command-hint">${escapeHtml(formatProviderHint(state.fileName, state.provider))}</span>
      <span>CNPJs repetidos: <strong data-slot="dedupe-label">${state.summary ? buildDedupeLabel(state.summary) : "—"}</strong></span>
      <span>Andamento: <strong data-slot="execution-status">${state.execution?.status ?? "Aguardando"}</strong></span>
      <span>Consulta local: <strong data-slot="execution-run-id">${state.execution ? "registrada" : "não iniciada"}</strong></span>
      <span>Retomada local: <strong data-slot="execution-resume">${formatExecutionResume(state)}</strong></span>
      <span>Ponto de retomada: <strong data-slot="execution-checkpoint">${state.execution?.checkpointPath ? "disponível" : "—"}</strong></span>
    </div>
  `;
}

function getReferenceStatusVariant(status: string): string {
  if (status === "concluído") return "status-token--success";
  if (status === "erro") return "status-token--danger";
  return "status-token--warning";
}

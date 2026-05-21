import { SIMPLES_PROVIDER } from "../../core/simples/simples-provider.names";
import type { UiState } from "./app.types";
import { getLiveProgress, renderStatusText } from "./app-helpers";
import { syncReceitaWebAvailability } from "./app-provider";
import {
  getCurrentCnpjLabel,
  getProgressPercent,
  renderExecutionHistory,
} from "./app-view";
import {
  buildDedupeLabel,
  formatCommandBarSummary,
  formatProgressLine,
  formatProviderHint,
} from "./operational-copy";
import { renderSummaryInto } from "./render-summary";

type AppRefs = {
  cancelButton: HTMLButtonElement | null;
  columnInput: HTMLInputElement | null;
  commandHint: HTMLElement | null;
  commandSummary: HTMLElement | null;
  currentCnpj: HTMLElement | null;
  dedupeLabel: HTMLElement | null;
  deliverySelect: HTMLSelectElement | null;
  executionCheckpoint: HTMLElement | null;
  executionHistory: HTMLElement | null;
  executionResume: HTMLElement | null;
  executionRunId: HTMLElement | null;
  executionStatus: HTMLElement | null;
  localPublicBaseDate: HTMLElement | null;
  localPublicBaseNotice: HTMLInputElement | null;
  localPublicBaseNoticePanel: HTMLElement | null;
  localPublicBaseWarning: HTMLElement | null;
  message: HTMLElement | null;
  outputStatus: HTMLElement | null;
  processButton: HTMLButtonElement | null;
  progressBar: HTMLElement | null;
  progressLine: HTMLElement | null;
  providerSelect: HTMLSelectElement | null;
  saveButton: HTMLButtonElement | null;
  summary: HTMLElement | null;
};

export function syncUi(refs: AppRefs, state: UiState): void {
  if (refs.message) {
    refs.message.textContent = state.message;
  }

  if (refs.providerSelect) {
    syncReceitaWebAvailability(refs.providerSelect, state);
    refs.providerSelect.value = state.provider;
  }

  if (refs.columnInput) {
    refs.columnInput.value = state.cnpjColumn;
  }

  if (refs.deliverySelect) {
    refs.deliverySelect.value = state.deliveryFormat;
  }

  syncLocalPublicBaseNotice(refs, state);

  if (refs.outputStatus) {
    refs.outputStatus.textContent = renderStatusText(state);
  }

  if (refs.commandSummary) {
    refs.commandSummary.textContent = formatCommandBarSummary(
      state.fileName,
      state.provider,
    );
  }

  if (refs.commandHint) {
    refs.commandHint.textContent = formatProviderHint(
      state.fileName,
      state.provider,
    );
  }

  if (refs.dedupeLabel) {
    refs.dedupeLabel.textContent = state.summary
      ? buildDedupeLabel(state.summary)
      : "—";
  }

  if (refs.progressLine) {
    refs.progressLine.textContent = formatProgressLine(getLiveProgress(state));
  }

  if (refs.progressBar) {
    refs.progressBar.style.width = `${getProgressPercent(state)}%`;
  }

  if (refs.currentCnpj) {
    refs.currentCnpj.textContent = getCurrentCnpjLabel(state);
  }

  if (refs.summary) {
    renderSummaryInto(refs.summary, state.summary);
  }

  syncExecutionRefs(refs, state);
  syncButtons(refs, state);
}

function syncLocalPublicBaseNotice(refs: AppRefs, state: UiState): void {
  if (refs.localPublicBaseNoticePanel) {
    refs.localPublicBaseNoticePanel.style.display =
      state.provider === SIMPLES_PROVIDER.BASE_PUBLICA_LOCAL ? "flex" : "none";
  }

  if (refs.localPublicBaseNotice) {
    refs.localPublicBaseNotice.checked = state.localPublicBaseNoticeAccepted;
  }

  if (refs.localPublicBaseDate) {
    refs.localPublicBaseDate.textContent =
      state.localPublicBaseStatus?.baseDate ?? "data não informada";
  }

  if (refs.localPublicBaseWarning) {
    refs.localPublicBaseWarning.textContent =
      state.localPublicBaseStatus?.freshnessWarning ??
      "Data da Base indisponível.";
  }
}

function syncExecutionRefs(refs: AppRefs, state: UiState): void {
  if (refs.executionStatus) {
    refs.executionStatus.textContent = state.execution
      ? state.execution.status
      : "Aguardando";
  }

  if (refs.executionRunId) {
    refs.executionRunId.textContent = state.execution
      ? state.execution.runId.slice(0, 8)
      : "—";
  }

  if (refs.executionResume) {
    refs.executionResume.textContent = state.execution
      ? `${state.execution.resumedUniqueLookups} retomadas de checkpoint`
      : "Sem retomada ativa";
  }

  if (refs.executionCheckpoint) {
    refs.executionCheckpoint.textContent = state.execution?.checkpointPath
      ? (state.execution.checkpointPath.split(/[/\\]/).pop() ?? "ledger.json")
      : "—";
  }

  if (refs.executionHistory) {
    refs.executionHistory.innerHTML = renderExecutionHistory(state);
  }
}

function syncButtons(refs: AppRefs, state: UiState): void {
  if (refs.processButton) {
    refs.processButton.disabled =
      state.status === "processing" ||
      !state.content ||
      (state.provider === SIMPLES_PROVIDER.BASE_PUBLICA_LOCAL &&
        !state.localPublicBaseNoticeAccepted);
    refs.processButton.textContent =
      state.status === "processing" ? "Processando..." : "Iniciar execução";
  }

  if (refs.cancelButton) {
    refs.cancelButton.disabled = state.status !== "processing";
  }

  if (refs.saveButton) {
    refs.saveButton.disabled = !state.outputDelivery;
  }
}

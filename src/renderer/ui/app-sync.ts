import { SIMPLES_PROVIDER } from "../../core/simples/simples-provider.names";
import type { UiState } from "./app.types";
import {
  getStatusPillVariant,
  renderStatusLabel,
  renderStatusText,
} from "./app-helpers";
import { syncReceitaWebAvailability } from "./app-provider";
import {
  getCurrentCnpjLabel,
  getDeliveryFormatLabel,
  getProgressLineLabel,
  getProgressPercent,
  getProviderStatusLabel,
  getProviderStatusVariant,
  renderExecutionHistory,
} from "./app-view";
import {
  buildDedupeLabel,
  formatCommandBarSummary,
  formatProviderHint,
  previewAutoSavePath,
} from "./operational-copy";
import { renderSummaryInto } from "./render-summary";

type AppRefs = {
  cancelButton: HTMLButtonElement | null;
  columnInput: HTMLInputElement | null;
  commandHint: HTMLElement | null;
  commandSummary: HTMLElement | null;
  currentCnpj: HTMLElement | null;
  dedupeLabel: HTMLElement | null;
  deliveryFormatBadge: HTMLElement | null;
  deliverySelect: HTMLSelectElement | null;
  executionCheckpoint: HTMLElement | null;
  executionHistory: HTMLElement | null;
  executionResume: HTMLElement | null;
  executionRunId: HTMLElement | null;
  executionStatus: HTMLElement | null;
  fileBadge: HTMLElement | null;
  fileDropzoneHint: HTMLElement | null;
  fileDropzoneTitle: HTMLElement | null;
  localPublicBaseDate: HTMLElement | null;
  localPublicBaseNotice: HTMLInputElement | null;
  localPublicBaseNoticePanel: HTMLElement | null;
  localPublicBasePrepareButton: HTMLButtonElement | null;
  localPublicBasePrepPanel: HTMLElement | null;
  localPublicBaseStatusLine: HTMLElement | null;
  localPublicBaseWarning: HTMLElement | null;
  message: HTMLElement | null;
  outputStatus: HTMLElement | null;
  outputPreview: HTMLElement | null;
  outputSavePath: HTMLElement | null;
  kpiErrors: HTMLElement | null;
  kpiPending: HTMLElement | null;
  kpiProcessed: HTMLElement | null;
  kpiTotalLines: HTMLElement | null;
  pickButton: HTMLButtonElement | null;
  processButton: HTMLButtonElement | null;
  progressBar: HTMLElement | null;
  progressLine: HTMLElement | null;
  progressSection: HTMLElement | null;
  providerSelect: HTMLSelectElement | null;
  providerStatus: HTMLElement | null;
  queueActiveHint: HTMLElement | null;
  queueActiveName: HTMLElement | null;
  queueActiveStatus: HTMLElement | null;
  queueCount: HTMLElement | null;
  saveButton: HTMLButtonElement | null;
  saveInfo: HTMLElement | null;
  summary: HTMLElement | null;
  topStatusPill: HTMLElement | null;
  runStatusPill: HTMLElement | null;
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

  syncStatusPills(refs, state);
  syncOutputPreview(refs, state);

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

  if (refs.fileBadge) {
    refs.fileBadge.textContent = state.fileName ?? "Nenhum arquivo";
  }

  if (refs.fileDropzoneTitle) {
    refs.fileDropzoneTitle.textContent =
      state.fileName ?? "Escolha o CSV de entrada";
  }

  if (refs.fileDropzoneHint) {
    refs.fileDropzoneHint.textContent = state.fileName
      ? formatProviderHint(state.fileName, state.provider)
      : "Leitura local, detecção de coluna e cópia processada ao lado do arquivo original.";
  }

  if (refs.dedupeLabel) {
    refs.dedupeLabel.textContent = state.summary
      ? buildDedupeLabel(state.summary)
      : "—";
  }

  if (refs.progressLine) {
    refs.progressLine.textContent = getProgressLineLabel(state);
  }

  if (refs.progressBar) {
    refs.progressBar.style.width = `${getProgressPercent(state)}%`;
  }

  if (refs.progressSection) {
    refs.progressSection.style.display =
      state.status === "processing" || state.summary ? "flex" : "none";
  }

  if (refs.currentCnpj) {
    refs.currentCnpj.textContent = getCurrentCnpjLabel(state);
  }

  if (refs.summary) {
    renderSummaryInto(refs.summary, state.summary);
  }

  syncCockpitRefs(refs, state);
  syncExecutionRefs(refs, state);
  syncButtons(refs, state);
}

function syncCockpitRefs(refs: AppRefs, state: UiState): void {
  const pendingLookups = state.progress
    ? Math.max(
        0,
        state.progress.totalUniqueLookups -
          state.progress.completedUniqueLookups,
      )
    : 0;

  if (refs.kpiTotalLines) {
    refs.kpiTotalLines.textContent = String(state.summary?.totalLinhas ?? 0);
  }

  if (refs.kpiProcessed) {
    refs.kpiProcessed.textContent = String(
      state.summary?.totalCnpjsUnicosConsultados ??
        state.progress?.completedUniqueLookups ??
        0,
    );
  }

  if (refs.kpiPending) {
    refs.kpiPending.textContent = String(state.summary ? 0 : pendingLookups);
  }

  if (refs.kpiErrors) {
    refs.kpiErrors.textContent = String(state.summary?.totalErros ?? 0);
  }

  if (refs.providerStatus) {
    refs.providerStatus.textContent = getProviderStatusLabel(state);
    refs.providerStatus.className = [
      "status-token",
      getProviderStatusVariant(state),
    ].join(" ");
  }

  if (refs.deliveryFormatBadge) {
    refs.deliveryFormatBadge.textContent = getDeliveryFormatLabel(
      state.deliveryFormat,
    );
  }

  if (refs.queueCount) {
    refs.queueCount.textContent = state.fileName ? "1 item" : "0 itens";
  }

  if (refs.queueActiveName) {
    refs.queueActiveName.textContent =
      state.fileName ?? "Nenhum lote em preparação";
  }

  if (refs.queueActiveHint) {
    refs.queueActiveHint.textContent = state.summary
      ? "Execução concluída"
      : state.fileName
        ? "Pronto para execução"
        : "Selecione um CSV para iniciar";
  }

  if (refs.queueActiveStatus) {
    refs.queueActiveStatus.textContent = state.summary
      ? "concluído"
      : state.fileName
        ? "revisão"
        : "vazio";
    refs.queueActiveStatus.className = [
      "status-token",
      state.summary ? "status-token--success" : "status-token--warning",
    ].join(" ");
  }
}

function syncLocalPublicBaseNotice(refs: AppRefs, state: UiState): void {
  if (refs.localPublicBaseNoticePanel) {
    refs.localPublicBaseNoticePanel.style.display =
      state.provider === SIMPLES_PROVIDER.BASE_PUBLICA_LOCAL ? "flex" : "none";
  }

  if (refs.localPublicBasePrepPanel) {
    refs.localPublicBasePrepPanel.style.display =
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

  if (refs.localPublicBaseStatusLine) {
    refs.localPublicBaseStatusLine.textContent =
      formatLocalPublicBaseStatusLine(state);
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
  if (refs.pickButton) {
    refs.pickButton.textContent = state.fileName
      ? "Trocar CSV"
      : "Selecionar CSV";
  }

  if (refs.processButton) {
    refs.processButton.disabled =
      state.status === "processing" ||
      state.localPublicBasePrepareStatus === "loading" ||
      !state.content ||
      (state.provider === SIMPLES_PROVIDER.BASE_PUBLICA_LOCAL &&
        (!state.localPublicBaseNoticeAccepted ||
          state.localPublicBaseStatus?.state !== "ready"));
    refs.processButton.textContent =
      state.status === "processing" ? "Processando..." : "Iniciar execução";
  }

  if (refs.localPublicBasePrepareButton) {
    refs.localPublicBasePrepareButton.disabled =
      state.status === "processing" ||
      state.localPublicBasePrepareStatus === "loading";
    refs.localPublicBasePrepareButton.textContent =
      state.localPublicBasePrepareStatus === "loading"
        ? "Preparando..."
        : "Preparar base";
  }

  if (refs.cancelButton) {
    refs.cancelButton.disabled = state.status !== "processing";
  }

  if (refs.saveButton) {
    refs.saveButton.disabled = !state.outputDelivery;
  }
}

function syncStatusPills(refs: AppRefs, state: UiState): void {
  for (const pill of [refs.topStatusPill, refs.runStatusPill]) {
    if (!pill) continue;
    const variant = getStatusPillVariant(state.status);
    pill.textContent = renderStatusLabel(state.status);
    pill.className = [
      "status-pill",
      variant !== "default" ? `status-pill--${variant}` : "",
    ]
      .filter(Boolean)
      .join(" ");
  }
}

function syncOutputPreview(refs: AppRefs, state: UiState): void {
  const outputPreview = getOutputPreview(state);

  if (refs.outputPreview) {
    refs.outputPreview.textContent = outputPreview ?? "Aguardando execução";
  }

  if (refs.outputSavePath) {
    refs.outputSavePath.textContent = outputPreview ?? "";
  }

  if (refs.saveInfo) {
    refs.saveInfo.style.display = outputPreview ? "flex" : "none";
  }
}

function getOutputPreview(state: UiState): string | null {
  const path = state.savedPath
    ? state.savedPath
    : state.filePath
      ? previewAutoSavePath(state.filePath, state.deliveryFormat)
      : null;

  return path?.split(/[/\\]/).pop() ?? null;
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

import { SIMPLES_PROVIDER } from "../../core/simples/simples-provider.names";
import type { UiState } from "./app.types";
import {
  getStatusPillVariant,
  renderStatusLabel,
  renderStatusText,
} from "./app-helpers";
import { renderExecutionHistory } from "./app-history-view";
import {
  formatLocalPublicBaseOfficialSourceLine,
  formatLocalPublicBaseStatusLine,
} from "./app-local-public-base-copy";
import {
  syncLocalPublicBaseAvailability,
  syncReceitaWebAvailability,
} from "./app-provider";
import type { AppRefs } from "./app-refs";
import { syncReferenceV5A } from "./app-sync-reference";
import {
  shouldDisableLocalPublicBaseDiscoverButton,
  shouldDisableLocalPublicBasePrepareButton,
  shouldDisableLocalPublicBasePrepareOfficialButton,
} from "./app-sync-rules";
import {
  getCurrentCnpjLabel,
  getDeliveryFormatLabel,
  getProgressLineLabel,
  getProgressPercent,
  getProviderStatusLabel,
  getProviderStatusVariant,
  isReferenceV5A,
} from "./app-view";
import {
  buildDedupeLabel,
  buildOperationalPanelCopy,
  formatCommandBarSummary,
  formatExecutionResume,
  formatExecutionStatus,
  formatProviderHint,
  formatProviderMode,
  getOperationalToneClass,
  previewAutoSavePath,
} from "./operational-copy";
import { renderSummaryInto } from "./render-summary";

export function syncUi(refs: AppRefs, state: UiState): void {
  if (isReferenceV5A(state)) {
    syncReferenceV5A(refs, state, syncLocalPublicBaseNotice, syncActiveView);
    return;
  }

  if (refs.message) {
    refs.message.textContent = state.message;
  }

  if (refs.providerSelect) {
    syncLocalPublicBaseAvailability(refs.providerSelect, state);
    syncReceitaWebAvailability(refs.providerSelect, state);
    refs.providerSelect.value = state.provider;
  }

  if (refs.columnInput) {
    refs.columnInput.value = state.cnpjColumn;
  }

  if (refs.deliverySelect) {
    refs.deliverySelect.value = state.deliveryFormat;
  }

  if (refs.speedProfileSelect) {
    refs.speedProfileSelect.value = state.executionSpeedProfile;
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
    refs.fileBadge.textContent = state.fileName ?? "aguardando arquivo";
  }

  if (refs.fileDropzoneTitle) {
    refs.fileDropzoneTitle.textContent = state.fileName ?? "Arquivo CSV";
  }

  if (refs.fileDropzoneHint) {
    refs.fileDropzoneHint.textContent = state.fileName
      ? formatProviderHint(state.fileName, state.provider)
      : "Selecione uma planilha com CNPJs. O resultado fica ao lado do arquivo original.";
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
  syncProtocolRefs(refs, state);
  syncSessionRefs(refs, state);
  syncExecutionRefs(refs, state);
  syncActiveView(refs, state);
  syncButtons(refs, state);
}

function syncProtocolRefs(refs: AppRefs, state: UiState): void {
  const outputPreview = getOutputPreview(state);
  const hasCompleted = Boolean(state.summary);
  const hasFile = Boolean(state.fileName);

  if (refs.protocolStatus) {
    refs.protocolStatus.textContent = hasCompleted
      ? "concluído"
      : hasFile
        ? "pronto para iniciar"
        : "aguardando";
    refs.protocolStatus.className = [
      "status-token",
      hasCompleted ? "status-token--success" : "status-token--warning",
    ].join(" ");
  }

  if (refs.protocolEntry) {
    refs.protocolEntry.textContent =
      state.fileName ?? "Sem arquivo selecionado";
  }

  if (refs.protocolEntryHint) {
    refs.protocolEntryHint.textContent = state.fileName
      ? "Entrada carregada neste computador."
      : "Selecione um CSV para preparar a consulta.";
  }

  if (refs.protocolBase) {
    refs.protocolBase.textContent = formatProviderMode(state.provider);
  }

  if (refs.protocolBaseHint) {
    refs.protocolBaseHint.textContent = formatProviderHint(
      state.fileName,
      state.provider,
    );
  }

  if (refs.protocolOutput) {
    refs.protocolOutput.textContent =
      outputPreview ?? getDeliveryFormatLabel(state.deliveryFormat);
  }

  if (refs.protocolOutputHint) {
    refs.protocolOutputHint.textContent = outputPreview
      ? "Nome previsto para o arquivo final."
      : "O arquivo final fica ao lado da planilha original.";
  }

  if (refs.protocolResume) {
    refs.protocolResume.textContent = state.execution
      ? formatExecutionResume(state)
      : "Disponível quando houver checkpoint";
  }
}

function syncSessionRefs(refs: AppRefs, state: UiState): void {
  const operationalPanel = buildOperationalPanelCopy(state);

  if (refs.sessionState) {
    refs.sessionState.textContent = state.execution
      ? formatExecutionStatus(state.execution.status)
      : "Aguardando";
    refs.sessionState.className = [
      "status-token",
      getOperationalToneClass(operationalPanel.blockerTone),
    ].join(" ");
  }

  if (refs.sessionEntry) {
    refs.sessionEntry.textContent = operationalPanel.currentItemLabel;
  }

  if (refs.sessionDedupe) {
    refs.sessionDedupe.textContent = operationalPanel.etaLabel;
  }

  if (refs.sessionRun) {
    refs.sessionRun.textContent = operationalPanel.failureLabel;
  }

  if (refs.sessionCheckpoint) {
    refs.sessionCheckpoint.textContent = operationalPanel.lastSaveLabel;
  }

  if (refs.executionBlocker) {
    refs.executionBlocker.textContent = operationalPanel.blockerLabel;
    refs.executionBlocker.className = [
      "status-token",
      getOperationalToneClass(operationalPanel.blockerTone),
    ].join(" ");
  }

  if (refs.executionCheckpointCopy) {
    refs.executionCheckpointCopy.textContent = operationalPanel.checkpointLabel;
  }

  if (refs.executionSuggestion) {
    refs.executionSuggestion.textContent = operationalPanel.suggestionLabel;
  }

  if (refs.activitySpeedLabel) {
    refs.activitySpeedLabel.textContent = operationalPanel.speedLabel;
  }

  if (refs.activitySpeedDetail) {
    refs.activitySpeedDetail.textContent = operationalPanel.speedDetailLabel;
  }

  if (refs.activityControlLabel) {
    refs.activityControlLabel.textContent = operationalPanel.controlLabel;
  }

  if (refs.activitySuggestion) {
    refs.activitySuggestion.textContent = operationalPanel.suggestionLabel;
  }

  if (refs.speedPlanLabel) {
    refs.speedPlanLabel.textContent = operationalPanel.speedLabel;
  }

  if (refs.speedPlanDetail) {
    refs.speedPlanDetail.textContent = operationalPanel.speedDetailLabel;
  }

  if (refs.speedControlLabel) {
    refs.speedControlLabel.textContent = operationalPanel.controlLabel;
  }
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
      state.fileName ?? "Nenhum arquivo selecionado";
  }

  if (refs.queueActiveHint) {
    refs.queueActiveHint.textContent = state.summary
      ? "Consulta concluída"
      : state.fileName
        ? "Pronto para consultar"
        : "Escolha um CSV para iniciar.";
  }

  if (refs.queueActiveStatus) {
    refs.queueActiveStatus.textContent = state.summary
      ? "concluído"
      : state.fileName
        ? "pronto para iniciar"
        : "aguardando";
    refs.queueActiveStatus.className = [
      "status-token",
      state.summary ? "status-token--success" : "status-token--warning",
    ].join(" ");
  }
}

function syncLocalPublicBaseNotice(refs: AppRefs, state: UiState): void {
  const shouldShowLocalPublicBasePreparation =
    state.provider === SIMPLES_PROVIDER.BASE_PUBLICA_LOCAL ||
    state.localPublicBaseStatus?.state !== "ready";

  if (refs.localPublicBaseNoticePanel) {
    refs.localPublicBaseNoticePanel.style.display =
      shouldShowLocalPublicBasePreparation ? "flex" : "none";
  }

  if (refs.localPublicBasePrepPanel) {
    refs.localPublicBasePrepPanel.style.display =
      shouldShowLocalPublicBasePreparation ? "grid" : "none";
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

  if (refs.localPublicBaseOfficialSourceLine) {
    refs.localPublicBaseOfficialSourceLine.textContent =
      formatLocalPublicBaseOfficialSourceLine(state);
  }

  if (refs.receitaWebExperimentalNoticePanel) {
    refs.receitaWebExperimentalNoticePanel.style.display =
      state.provider === SIMPLES_PROVIDER.RECEITA_WEB_PARALLEL_EXPERIMENTAL
        ? "flex"
        : "none";
  }

  if (refs.receitaWebExperimentalNotice) {
    refs.receitaWebExperimentalNotice.checked =
      state.receitaWebExperimentalNoticeAccepted;
    refs.receitaWebExperimentalNotice.disabled = state.status === "processing";
  }
}

function syncExecutionRefs(refs: AppRefs, state: UiState): void {
  if (refs.executionStatus) {
    refs.executionStatus.textContent = state.execution
      ? formatExecutionStatus(state.execution.status)
      : "Aguardando";
  }

  if (refs.executionRunId) {
    refs.executionRunId.textContent = state.execution
      ? "registrada"
      : "não iniciada";
  }

  if (refs.executionResume) {
    refs.executionResume.textContent = formatExecutionResume(state);
  }

  if (refs.executionCheckpoint) {
    refs.executionCheckpoint.textContent = state.execution?.checkpointPath
      ? "disponível"
      : "—";
  }

  if (refs.executionHistory) {
    refs.executionHistory.innerHTML = renderExecutionHistory(state);
  }
}

function syncActiveView(refs: AppRefs, state: UiState): void {
  const hasOperationalSignals =
    Boolean(state.fileName) ||
    Boolean(state.summary) ||
    Boolean(state.progress) ||
    state.status === "processing" ||
    state.status === "error";

  for (const link of refs.viewLinks) {
    const isActive = link.dataset.view === state.activeView;
    const viewSurface = link.dataset.viewSurface;
    link.classList.toggle(
      "ops-tabs__item--active",
      viewSurface === "tab" && isActive,
    );
    link.classList.toggle(
      "sidebar-nav__item--active",
      viewSurface === "sidebar" && isActive,
    );

    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  }

  for (const panel of refs.viewPanels) {
    const view = panel.dataset.viewPanel;
    const isCurrentView = view === state.activeView;
    const isProgressivePanel =
      panel.dataset.progressive === "after-file" && !hasOperationalSignals;
    const isOpen = isCurrentView && !isProgressivePanel;

    if (isOpen) {
      if (panel.hidden) {
        panel.dataset.open = "false";
        panel.hidden = false;
        panel.getBoundingClientRect();
      }

      panel.dataset.open = "true";
      continue;
    }

    panel.dataset.open = "false";
    panel.hidden = true;
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
          state.localPublicBaseStatus?.state !== "ready")) ||
      (state.provider === SIMPLES_PROVIDER.RECEITA_WEB_PARALLEL_EXPERIMENTAL &&
        !state.receitaWebExperimentalNoticeAccepted);
    refs.processButton.textContent =
      state.status === "processing" ? "Consultando..." : "Iniciar consulta";
  }

  if (refs.localPublicBasePrepareButton) {
    refs.localPublicBasePrepareButton.disabled =
      shouldDisableLocalPublicBasePrepareButton(state);
    refs.localPublicBasePrepareButton.textContent =
      state.localPublicBasePrepareStatus === "loading"
        ? "Preparando..."
        : "Preparar base";
  }

  if (refs.localPublicBasePrepareOfficialButton) {
    refs.localPublicBasePrepareOfficialButton.disabled =
      shouldDisableLocalPublicBasePrepareOfficialButton(state);
    refs.localPublicBasePrepareOfficialButton.textContent =
      state.localPublicBasePrepareStatus === "loading"
        ? "Baixando..."
        : "Baixar e preparar oficial";
  }

  if (refs.localPublicBaseDiscoverButton) {
    refs.localPublicBaseDiscoverButton.disabled =
      shouldDisableLocalPublicBaseDiscoverButton(state);
    refs.localPublicBaseDiscoverButton.textContent =
      state.localPublicBaseOfficialSourceStatus === "loading"
        ? "Buscando fonte..."
        : "Buscar fonte oficial";
  }

  if (refs.cancelButton) {
    refs.cancelButton.disabled = state.status !== "processing";
  }

  if (refs.pauseButton) {
    refs.pauseButton.disabled = state.status !== "processing";
  }

  if (refs.providerSelect) {
    refs.providerSelect.disabled = state.status === "processing";
  }

  if (refs.deliverySelect) {
    refs.deliverySelect.disabled = state.status === "processing";
  }

  if (refs.speedProfileSelect) {
    refs.speedProfileSelect.disabled = state.status === "processing";
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
    refs.outputPreview.textContent =
      outputPreview ?? "O arquivo final aparecerá depois da consulta.";
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

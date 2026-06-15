import type { UiState } from "./app.types";
import { renderExecutionHistory } from "./app-history-view";
import { syncReceitaWebAvailability } from "./app-provider";
import type { AppRefs } from "./app-refs";

export function syncReferenceV5A(
  refs: AppRefs,
  state: UiState,
  syncLocalPublicBaseNotice: (refs: AppRefs, state: UiState) => void,
  syncActiveView: (refs: AppRefs, state: UiState) => void,
): void {
  const fixture = state.visualFixture;

  if (!fixture) {
    return;
  }

  syncLocalPublicBaseNotice(refs, state);

  if (refs.providerSelect) {
    syncReceitaWebAvailability(refs.providerSelect, state);
    refs.providerSelect.value = "mock";
  }

  if (refs.fileBadge) refs.fileBadge.textContent = fixture.fileStatus;
  if (refs.fileDropzoneTitle) {
    refs.fileDropzoneTitle.textContent = fixture.entryTitle;
  }
  if (refs.fileDropzoneHint) {
    refs.fileDropzoneHint.textContent = fixture.entryHint;
  }
  if (refs.providerStatus) {
    refs.providerStatus.textContent = fixture.providerPrimaryStatus;
    refs.providerStatus.className = "status-token status-token--success";
  }
  if (refs.protocolStatus) refs.protocolStatus.textContent = fixture.fileStatus;
  if (refs.protocolEntry) refs.protocolEntry.textContent = fixture.entryTitle;
  if (refs.protocolEntryHint) {
    refs.protocolEntryHint.textContent = fixture.entryHint;
  }
  if (refs.protocolBase) {
    refs.protocolBase.textContent = fixture.providerPrimaryStatus;
  }
  if (refs.protocolBaseHint) {
    refs.protocolBaseHint.textContent = fixture.providerSecondaryStatus;
  }
  if (refs.protocolOutput) {
    refs.protocolOutput.textContent = fixture.outputFormat;
  }
  if (refs.protocolOutputHint) {
    refs.protocolOutputHint.textContent = fixture.outputText;
  }
  if (refs.protocolResume) {
    refs.protocolResume.textContent = "Disponível quando houver checkpoint";
  }
  if (refs.sessionState) refs.sessionState.textContent = "Aguardando";
  if (refs.sessionEntry) {
    refs.sessionEntry.textContent = fixture.entryTitle;
  }
  if (refs.sessionDedupe) refs.sessionDedupe.textContent = "—";
  if (refs.sessionRun) refs.sessionRun.textContent = "—";
  if (refs.sessionCheckpoint) refs.sessionCheckpoint.textContent = "—";
  if (refs.deliveryFormatBadge) {
    refs.deliveryFormatBadge.textContent = fixture.outputFormat;
  }
  if (refs.queueCount) refs.queueCount.textContent = fixture.queueCount;
  if (refs.queueActiveName) {
    refs.queueActiveName.textContent = fixture.queueRows[0]?.fileName ?? "";
  }
  if (refs.queueActiveHint) {
    refs.queueActiveHint.textContent = fixture.queueRows[0]?.statusHint ?? "";
  }
  if (refs.queueActiveStatus) {
    refs.queueActiveStatus.textContent = fixture.queueRows[0]?.status ?? "";
    refs.queueActiveStatus.className = "status-token status-token--warning";
  }
  if (refs.kpiTotalLines) {
    refs.kpiTotalLines.textContent = fixture.kpis[0]?.value ?? "0";
  }
  if (refs.kpiProcessed) {
    refs.kpiProcessed.textContent = fixture.kpis[1]?.value ?? "0";
  }
  if (refs.kpiPending) {
    refs.kpiPending.textContent = fixture.kpis[2]?.value ?? "0";
  }
  if (refs.kpiErrors) {
    refs.kpiErrors.textContent = fixture.kpis[3]?.value ?? "0";
  }
  if (refs.executionHistory) {
    refs.executionHistory.innerHTML = renderExecutionHistory(state);
  }
  if (refs.outputStatus) {
    refs.outputStatus.textContent = fixture.outputText;
  }
  if (refs.outputPreview) refs.outputPreview.textContent = "";
  if (refs.saveInfo) refs.saveInfo.style.display = "none";
  if (refs.pickButton) {
    refs.pickButton.disabled = false;
    refs.pickButton.textContent = "Selecionar";
  }
  if (refs.processButton) {
    refs.processButton.disabled = false;
    refs.processButton.textContent = "Iniciar consulta";
  }
  if (refs.saveButton) {
    refs.saveButton.disabled = true;
  }
  if (refs.cancelButton) {
    refs.cancelButton.disabled = true;
  }

  syncActiveView(refs, state);
}

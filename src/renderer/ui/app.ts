import type { SimplesProviderName } from "../../core/simples/simples-provider.factory";
import { initialState, type PickCsvResult, type UiState } from "./app.types";
import {
  applyProcessResult,
  getDefaultOutputFileName,
  getOutputContent,
  resetOutputState,
} from "./app-delivery";
import {
  buildCompletionMessage,
  extractMessage,
  getLiveProgress,
  renderStatusText,
} from "./app-helpers";
import { syncReceitaWebAvailability } from "./app-provider";
import {
  getCurrentCnpjLabel,
  getProgressPercent,
  renderExecutionHistory,
  renderShell,
} from "./app-view";
import {
  buildDedupeLabel,
  formatCommandBarSummary,
  formatProgressLine,
  formatProviderHint,
} from "./operational-copy";
import { renderSummaryInto } from "./render-summary";

export function mountApp(root: HTMLDivElement | null): void {
  if (!root) {
    return;
  }

  const appRoot = root;
  const state: UiState = { ...initialState };
  appRoot.innerHTML = renderShell(state);

  const refs = {
    pickButton: appRoot.querySelector<HTMLButtonElement>(
      '[data-action="pick-file"]',
    ),
    processButton: appRoot.querySelector<HTMLButtonElement>(
      '[data-action="process-file"]',
    ),
    saveButton: appRoot.querySelector<HTMLButtonElement>(
      '[data-action="save-file"]',
    ),
    cancelButton: appRoot.querySelector<HTMLButtonElement>(
      '[data-action="cancel-processing"]',
    ),
    providerSelect: appRoot.querySelector<HTMLSelectElement>(
      '[data-field="provider"]',
    ),
    columnInput: appRoot.querySelector<HTMLInputElement>(
      '[data-field="cnpj-column"]',
    ),
    deliverySelect: appRoot.querySelector<HTMLSelectElement>(
      '[data-field="delivery-format"]',
    ),
    message: appRoot.querySelector<HTMLElement>('[data-slot="message"]'),
    commandSummary: appRoot.querySelector<HTMLElement>(
      '[data-slot="command-summary"]',
    ),
    commandHint: appRoot.querySelector<HTMLElement>(
      '[data-slot="command-hint"]',
    ),
    summary: appRoot.querySelector<HTMLElement>('[data-slot="summary"]'),
    outputStatus: appRoot.querySelector<HTMLElement>(
      '[data-slot="output-status"]',
    ),
    dedupeLabel: appRoot.querySelector<HTMLElement>(
      '[data-slot="dedupe-label"]',
    ),
    progressLine: appRoot.querySelector<HTMLElement>(
      '[data-slot="progress-line"]',
    ),
    progressBar: appRoot.querySelector<HTMLElement>(
      '[data-slot="progress-bar"]',
    ),
    currentCnpj: appRoot.querySelector<HTMLElement>(
      '[data-slot="current-cnpj"]',
    ),
    executionStatus: appRoot.querySelector<HTMLElement>(
      '[data-slot="execution-status"]',
    ),
    executionRunId: appRoot.querySelector<HTMLElement>(
      '[data-slot="execution-run-id"]',
    ),
    executionResume: appRoot.querySelector<HTMLElement>(
      '[data-slot="execution-resume"]',
    ),
    executionCheckpoint: appRoot.querySelector<HTMLElement>(
      '[data-slot="execution-checkpoint"]',
    ),
    executionHistory: appRoot.querySelector<HTMLElement>(
      '[data-slot="execution-history"]',
    ),
  };

  void initializeDefaults();
  void refreshExecutionHistory();
  const unsubscribeProgress = window.appBridge.onLookupProgress((progress) => {
    state.progress = progress;
    state.progressObservedAt = Date.now();
    state.now = Date.now();
    if (state.status === "processing") {
      state.message = `Processando ${progress.completedUniqueLookups} de ${progress.totalUniqueLookups} CNPJs únicos...`;
      syncUi();
    }
  });
  const progressTicker = window.setInterval(() => {
    if (state.status === "processing" && state.progress) {
      state.now = Date.now();
      syncUi();
    }
  }, 1000);
  wireEvents();
  syncUi();
  window.addEventListener("beforeunload", () => {
    unsubscribeProgress();
    window.clearInterval(progressTicker);
  });

  async function initializeDefaults(): Promise<void> {
    try {
      const defaults = await window.appBridge.getDefaults();
      state.provider = defaults.provider;
      state.receitaWebAvailable = defaults.receitaWebAvailable;
      syncUi();
    } catch {
      state.provider = "mock";
      state.receitaWebAvailable = false;
      syncUi();
    }
  }

  function wireEvents(): void {
    refs.pickButton?.addEventListener("click", () => {
      void handlePickFile();
    });

    refs.processButton?.addEventListener("click", () => {
      void handleProcessFile();
    });

    refs.cancelButton?.addEventListener("click", () => {
      void handleCancelProcessing();
    });

    refs.saveButton?.addEventListener("click", () => {
      void handleSaveFile();
    });

    appRoot.addEventListener("click", (event) => {
      const target = event.target as HTMLElement;
      const action = target.closest<HTMLElement>("[data-action]");

      if (!action) {
        return;
      }

      if (action.dataset.action === "refresh-history") {
        if (state.status === "processing") {
          return;
        }

        void refreshExecutionHistory();
        return;
      }

      if (action.dataset.action === "resume-execution") {
        if (state.status === "processing") {
          return;
        }

        const ledgerKey = action.dataset.ledgerKey;

        if (ledgerKey) {
          void handleResumeExecution(ledgerKey);
        }
      }
    });

    refs.providerSelect?.addEventListener("change", (event) => {
      state.provider = (event.currentTarget as HTMLSelectElement)
        .value as SimplesProviderName;
      syncUi();
    });

    refs.columnInput?.addEventListener("input", (event) => {
      state.cnpjColumn = (event.currentTarget as HTMLInputElement).value;
    });

    refs.deliverySelect?.addEventListener("change", (event) => {
      state.deliveryFormat = (event.currentTarget as HTMLSelectElement)
        .value as UiState["deliveryFormat"];
      syncUi();
    });
  }

  async function handlePickFile(): Promise<void> {
    state.status = "loading";
    state.message = "Abrindo seletor de arquivo...";
    syncUi();

    try {
      const result = await window.appBridge.pickCsvFile();
      if (!result) {
        state.status = "idle";
        state.message = "Seleção cancelada.";
        syncUi();
        return;
      }

      applyFile(result);
    } catch (error) {
      state.status = "error";
      state.message = extractMessage(
        error,
        "Não foi possível abrir o arquivo.",
      );
      syncUi();
    }
  }

  function applyFile(result: PickCsvResult): void {
    state.fileName = result.fileName;
    state.filePath = result.filePath;
    state.content = result.content;
    resetOutputState(state);
    state.summary = null;
    state.execution = null;
    state.progress = null;
    state.progressObservedAt = null;
    state.now = Date.now();
    state.status = "idle";
    state.message = `Arquivo "${result.fileName}" pronto. Revise provedor e coluna antes de iniciar.`;
    syncUi();
  }

  async function handleProcessFile(): Promise<void> {
    if (!state.content) {
      state.status = "error";
      state.message = "Selecione um CSV antes de processar.";
      syncUi();
      return;
    }

    state.status = "processing";
    state.message = "Iniciando processamento...";
    resetOutputState(state);
    state.progress = null;
    state.progressObservedAt = null;
    state.execution = null;
    state.now = Date.now();
    syncUi();

    try {
      const result = await window.appBridge.processCsv({
        content: state.content,
        deliveryFormat: state.deliveryFormat,
        provider: state.provider,
        ...(state.filePath ? { sourceFilePath: state.filePath } : {}),
        ...(state.cnpjColumn.trim()
          ? { cnpjColumn: state.cnpjColumn.trim() }
          : {}),
      });

      applyProcessResult(state, result);
      state.message = buildCompletionMessage(result);
      await refreshExecutionHistory();
      syncUi();
    } catch (error) {
      state.status = "error";
      state.message = extractMessage(error, "Falha ao processar o CSV.");
      await refreshExecutionHistory();
      syncUi();
    }
  }

  async function handleResumeExecution(ledgerKey: string): Promise<void> {
    const historyItem = state.executionHistory.find(
      (item) => item.ledgerKey === ledgerKey,
    );

    if (!historyItem || !historyItem.canResume) {
      state.status = "error";
      state.message = "Esta execução não pode ser retomada pelo histórico.";
      syncUi();
      return;
    }

    state.status = "processing";
    state.message = "Retomando execução a partir do histórico local...";
    resetOutputState(state);
    state.progress = null;
    state.progressObservedAt = null;
    state.execution = null;
    state.now = Date.now();
    syncUi();

    try {
      const result = await window.appBridge.resumeExecution(
        ledgerKey,
        state.deliveryFormat,
      );
      state.fileName = historyItem.sourceFileName;
      state.filePath = historyItem.sourceFilePath;
      state.content = null;
      state.provider = historyItem.providerName;
      state.cnpjColumn = historyItem.cnpjColumn ?? "";
      applyProcessResult(state, result);
      state.message = buildCompletionMessage(result);
      await refreshExecutionHistory();
      syncUi();
    } catch (error) {
      state.status = "error";
      state.message = extractMessage(error, "Falha ao retomar a execução.");
      await refreshExecutionHistory();
      syncUi();
    }
  }

  async function handleCancelProcessing(): Promise<void> {
    if (state.status !== "processing") {
      return;
    }

    try {
      const requested = await window.appBridge.cancelProcessing();
      state.message = requested
        ? "Cancelamento solicitado. O processamento será interrompido."
        : "Não havia processamento ativo.";
      syncUi();
    } catch (error) {
      state.message = extractMessage(error, "Não foi possível cancelar.");
      syncUi();
    }
  }

  async function handleSaveFile(): Promise<void> {
    const outputContent = getOutputContent(state);
    const defaultName = getDefaultOutputFileName(state);

    if (!outputContent || !state.outputDelivery || !defaultName) {
      return;
    }

    state.status = "loading";
    state.message = "Abrindo diálogo de salvamento...";
    syncUi();

    try {
      const savedPath = await window.appBridge.saveOutputFile(
        defaultName,
        state.outputDelivery.format,
        outputContent,
      );

      if (!savedPath) {
        state.status = "success";
        state.message = "Salvamento cancelado pelo usuário.";
        syncUi();
        return;
      }

      state.savedPath = savedPath;
      state.status = "success";
      state.message = "Arquivo salvo com sucesso.";
      syncUi();
    } catch (error) {
      state.status = "error";
      state.message = extractMessage(error, "Falha ao salvar o CSV.");
      syncUi();
    }
  }

  async function refreshExecutionHistory(): Promise<void> {
    state.historyStatus = "loading";
    syncUi();

    try {
      state.executionHistory = await window.appBridge.listExecutions();
      state.historyStatus = "ready";
    } catch {
      state.executionHistory = [];
      state.historyStatus = "error";
    }

    syncUi();
  }

  function syncUi(): void {
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
      refs.progressLine.textContent = formatProgressLine(
        getLiveProgress(state),
      );
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

    if (refs.processButton) {
      refs.processButton.disabled =
        state.status === "processing" || !state.content;
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
}

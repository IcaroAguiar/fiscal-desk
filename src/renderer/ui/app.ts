import {
  SIMPLES_PROVIDER,
  type SimplesProviderName,
} from "../../core/simples/simples-provider.names";
import {
  initialState,
  type PickCsvResult,
  type UiState,
  type VisualFixture,
} from "./app.types";
import {
  applyProcessResult,
  getDefaultOutputFileName,
  getOutputContent,
  resetOutputState,
} from "./app-delivery";
import { buildCompletionMessage, extractMessage } from "./app-helpers";
import {
  handlePrepareLocalPublicBase,
  refreshLocalPublicBaseStatus,
} from "./app-local-public-base";
import { prepareLocalPublicBaseResume } from "./app-provider";
import { collectAppRefs } from "./app-refs";
import { syncUi as syncUiRefs } from "./app-sync";
import { renderShell } from "./app-view";

export function mountApp(root: HTMLDivElement | null): void {
  if (!root) {
    return;
  }

  const appRoot = root;
  const state: UiState = {
    ...initialState,
    visualFixture: getDevVisualFixture(),
  };
  appRoot.innerHTML = renderShell(state);

  const refs = collectAppRefs(appRoot);

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
      state.localPublicBaseStatus = defaults.localPublicBaseStatus;
      syncUi();
    } catch {
      state.provider = "mock";
      state.receitaWebAvailable = false;
      state.localPublicBaseStatus = null;
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

      if (action.dataset.action === "prepare-local-public-base") {
        if (state.status === "processing") {
          return;
        }

        void handlePrepareLocalPublicBase(state, syncUi);
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

    appRoot.addEventListener("click", (event) => {
      const target = event.target as HTMLElement;
      const viewLink = target.closest<HTMLElement>("[data-view]");

      if (!viewLink) {
        return;
      }

      const nextView = viewLink.dataset.view;

      if (!isUiView(nextView)) {
        return;
      }

      event.preventDefault();
      state.activeView = nextView;
      syncUi();
    });

    refs.providerSelect?.addEventListener("change", (event) => {
      state.provider = (event.currentTarget as HTMLSelectElement)
        .value as SimplesProviderName;
      state.localPublicBaseNoticeAccepted = false;
      if (state.provider === SIMPLES_PROVIDER.BASE_PUBLICA_LOCAL) {
        void refreshLocalPublicBaseStatus(state);
      }
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

    refs.localPublicBaseNotice?.addEventListener("change", (event) => {
      state.localPublicBaseNoticeAccepted = (
        event.currentTarget as HTMLInputElement
      ).checked;
      syncUi();
    });
  }

  async function handlePickFile(): Promise<void> {
    state.status = "loading";
    state.message = "Abrindo seletor de arquivo...";
    state.activeView = "painel";
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
    state.inputFormat = result.inputFormat;
    resetOutputState(state);
    state.summary = null;
    state.execution = null;
    state.progress = null;
    state.progressObservedAt = null;
    state.now = Date.now();
    state.status = "idle";
    state.activeView = "fila";
    state.message = `Arquivo "${result.fileName}" pronto. Revise a base de consulta, o formato e a coluna antes de iniciar.`;
    syncUi();
  }

  async function handleProcessFile(): Promise<void> {
    if (!state.content) {
      state.status = "error";
      state.message = "Selecione uma planilha CSV ou Excel antes de processar.";
      syncUi();
      return;
    }

    state.status = "processing";
    state.message = "Iniciando processamento...";
    state.activeView = "atividade";
    resetOutputState(state);
    state.progress = null;
    state.progressObservedAt = null;
    state.execution = null;
    state.now = Date.now();
    syncUi();

    try {
      const result = await window.appBridge.processCsv({
        ...(state.provider === SIMPLES_PROVIDER.BASE_PUBLICA_LOCAL
          ? {
              acceptedLocalPublicBaseNotice:
                state.localPublicBaseNoticeAccepted,
            }
          : {}),
        content: state.content,
        deliveryFormat: state.deliveryFormat,
        inputFormat: state.inputFormat,
        provider: state.provider,
        ...(state.filePath ? { sourceFilePath: state.filePath } : {}),
        ...(state.cnpjColumn.trim()
          ? { cnpjColumn: state.cnpjColumn.trim() }
          : {}),
      });

      applyProcessResult(state, result);
      state.activeView = "resultados";
      state.message = buildCompletionMessage(result);
      await refreshExecutionHistory();
      syncUi();
    } catch (error) {
      state.status = "error";
      state.activeView = "atividade";
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

    if (!prepareLocalPublicBaseResume(state, historyItem)) {
      state.activeView = "painel";
      syncUi();
      return;
    }

    state.status = "processing";
    state.message = "Retomando execução a partir do histórico local...";
    state.activeView = "atividade";
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
        historyItem.providerName === SIMPLES_PROVIDER.BASE_PUBLICA_LOCAL
          ? state.localPublicBaseNoticeAccepted
          : undefined,
      );
      state.fileName = historyItem.sourceFileName;
      state.filePath = historyItem.sourceFilePath;
      state.content = null;
      state.inputFormat = historyItem.inputFormat ?? "csv";
      state.provider = historyItem.providerName;
      state.cnpjColumn = historyItem.cnpjColumn ?? "";
      applyProcessResult(state, result);
      state.activeView = "resultados";
      state.message = buildCompletionMessage(result);
      await refreshExecutionHistory();
      syncUi();
    } catch (error) {
      state.status = "error";
      state.activeView = "atividade";
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
    syncUiRefs(refs, state);
    syncInputFormatCopy();
  }

  function syncInputFormatCopy(): void {
    const inputFormatLabel = state.inputFormat === "xlsx" ? "XLSX" : "CSV";
    const fileTitle = appRoot.querySelector<HTMLElement>(
      '[data-slot="file-dropzone-title"]',
    );
    const fileHint = appRoot.querySelector<HTMLElement>(
      '[data-slot="file-dropzone-hint"]',
    );
    const fileIcon = appRoot.querySelector<HTMLElement>(".file-dropzone__icon");
    const pickButton = appRoot.querySelector<HTMLButtonElement>(
      '[data-action="pick-file"]',
    );
    const protocolEntryHint = appRoot.querySelector<HTMLElement>(
      '[data-slot="protocol-entry-hint"]',
    );

    if (fileTitle && !state.fileName) {
      fileTitle.textContent = "Arquivo CSV ou Excel";
    }

    if (fileHint && !state.fileName) {
      fileHint.textContent =
        "Selecione uma planilha com CNPJs. O resultado fica ao lado do arquivo original.";
    }

    if (fileIcon) {
      fileIcon.textContent = inputFormatLabel;
    }

    if (pickButton) {
      pickButton.textContent = state.fileName
        ? "Trocar planilha"
        : "Selecionar planilha";
    }

    if (protocolEntryHint && !state.fileName) {
      protocolEntryHint.textContent =
        "Selecione uma planilha CSV ou Excel para preparar a consulta.";
    }
  }
}

function isUiView(value: string | undefined): value is UiState["activeView"] {
  return (
    value === "painel" ||
    value === "fila" ||
    value === "resultados" ||
    value === "atividade" ||
    value === "historico"
  );
}

function getDevVisualFixture(): VisualFixture | null {
  if (!import.meta.env.DEV) {
    return null;
  }

  const candidate = (
    window as Window & { __FISCAL_DESK_VISUAL_FIXTURE__?: VisualFixture }
  ).__FISCAL_DESK_VISUAL_FIXTURE__;

  return candidate?.scenario === "reference-v5-a" ? candidate : null;
}

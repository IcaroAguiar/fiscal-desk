import { SIMPLES_PROVIDER } from "../../core/simples/simples-provider.names";
import type { UiState } from "./app.types";
import { extractMessage } from "./app-helpers";

type SyncUi = () => void;

export async function handleDiscoverLocalPublicBaseOfficialSource(
  state: UiState,
  syncUi: SyncUi,
): Promise<void> {
  state.localPublicBaseOfficialSourceStatus = "loading";
  state.message = "Consultando fonte oficial da Base Pública Local...";
  syncUi();

  try {
    const source =
      await window.appBridge.discoverLocalPublicBaseOfficialSource();
    state.localPublicBaseOfficialSource = source;
    state.localPublicBaseOfficialSourceStatus = "ready";
    state.message = `Fonte oficial encontrada: ${source.fileName} ${source.sizeLabel}, competência ${source.baseDate}.`;
    syncUi();
  } catch (error) {
    state.localPublicBaseOfficialSource = null;
    state.localPublicBaseOfficialSourceStatus = "error";
    state.message = extractMessage(
      error,
      "Não foi possível consultar a fonte oficial da Base Pública Local.",
    );
    syncUi();
  }
}

export async function handlePrepareLocalPublicBase(
  state: UiState,
  syncUi: SyncUi,
): Promise<void> {
  if (!state.localPublicBaseNoticeAccepted) {
    state.localPublicBasePrepareStatus = "idle";
    state.message =
      "Confirme o aviso de Data da Base antes de preparar a Base Pública Local.";
    syncUi();
    return;
  }

  state.localPublicBasePrepareStatus = "loading";
  state.message = "Selecione o CSV de origem da Base Pública Local...";
  syncUi();

  try {
    const source = await window.appBridge.pickLocalPublicBaseSourceFile();

    if (!source) {
      state.localPublicBasePrepareStatus = "idle";
      state.message = "Preparo da Base Pública Local cancelado.";
      syncUi();
      return;
    }

    state.message = `Preparando Base Pública Local a partir de "${source.fileName}"...`;
    syncUi();

    const result = await window.appBridge.prepareLocalPublicBase({
      content: source.content,
      consent: {
        accepted: true,
        acceptedAt: new Date().toISOString(),
        baseDateAcknowledged:
          state.localPublicBaseStatus?.baseDate ?? "data não informada",
        stalenessWarningAcknowledged:
          state.localPublicBaseStatus?.freshnessWarning ??
          "Data da Base será lida do CSV selecionado.",
      },
      sourceFileName: source.fileName,
      sourceFilePath: source.filePath,
    });

    state.localPublicBaseStatus = result.status;
    state.localPublicBasePrepareStatus =
      result.status.state === "ready" ? "success" : "error";
    state.localPublicBaseNoticeAccepted = false;
    state.provider = SIMPLES_PROVIDER.BASE_PUBLICA_LOCAL;
    state.message =
      result.status.state === "ready"
        ? `Base Pública Local preparada: ${result.acceptedRows} registros aceitos e ${result.rejectedRows} rejeitados.`
        : (result.status.errorMessage ??
          "Não foi possível preparar a Base Pública Local.");
    syncUi();
  } catch (error) {
    state.localPublicBasePrepareStatus = "error";
    state.message = extractMessage(
      error,
      "Não foi possível preparar a Base Pública Local.",
    );
    await refreshLocalPublicBaseStatus(state);
    syncUi();
  }
}

export async function handlePrepareOfficialLocalPublicBase(
  state: UiState,
  syncUi: SyncUi,
): Promise<void> {
  if (!state.localPublicBaseNoticeAccepted) {
    state.localPublicBasePrepareStatus = "idle";
    state.message =
      "Confirme o aviso de Data da Base antes de baixar e preparar a fonte oficial.";
    syncUi();
    return;
  }

  if (!state.localPublicBaseOfficialSource) {
    state.localPublicBasePrepareStatus = "idle";
    state.message =
      "Busque a fonte oficial antes de baixar e preparar a Base Pública Local.";
    syncUi();
    return;
  }

  state.localPublicBasePrepareStatus = "loading";
  state.message = `Baixando e preparando ${state.localPublicBaseOfficialSource.fileName} da Receita Federal...`;
  syncUi();

  try {
    const result = await window.appBridge.prepareLocalPublicBaseOfficialSource({
      consent: {
        accepted: true,
        acceptedAt: new Date().toISOString(),
        baseDateAcknowledged: state.localPublicBaseOfficialSource.baseDate,
        stalenessWarningAcknowledged:
          "Base Pública Local preparada automaticamente a partir do Simples.zip oficial.",
      },
    });

    state.localPublicBaseStatus = result.status;
    state.localPublicBasePrepareStatus =
      result.status.state === "ready" ? "success" : "error";
    state.localPublicBaseNoticeAccepted = false;
    state.provider = SIMPLES_PROVIDER.BASE_PUBLICA_LOCAL;
    state.message =
      result.status.state === "ready"
        ? `Base Pública Local oficial preparada: ${result.acceptedRows} registros aceitos e ${result.rejectedRows} rejeitados.`
        : (result.status.errorMessage ??
          "Não foi possível preparar a Base Pública Local oficial.");
    syncUi();
  } catch (error) {
    state.localPublicBasePrepareStatus = "error";
    state.message = extractMessage(
      error,
      "Não foi possível baixar e preparar a Base Pública Local oficial.",
    );
    await refreshLocalPublicBaseStatus(state);
    syncUi();
  }
}

export async function refreshLocalPublicBaseStatus(
  state: UiState,
): Promise<void> {
  try {
    state.localPublicBaseStatus =
      await window.appBridge.getLocalPublicBaseStatus();
  } catch {
    state.localPublicBaseStatus = {
      baseDate: null,
      diskUsageLabel: "status indisponível",
      errorMessage: "Não foi possível carregar o status da base local.",
      estimatedPreparationTimeLabel: "indisponível",
      estimatedRows: 0,
      estimatedSizeLabel: "indisponível",
      freshnessWarning: "Status da Base Pública Local indisponível.",
      preparedAt: null,
      preparedRows: 0,
      rejectedRows: 0,
      sourceFileName: null,
      state: "error",
    };
  }
}

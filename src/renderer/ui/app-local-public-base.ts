import { SIMPLES_PROVIDER } from "../../core/simples/simples-provider.names";
import type { UiState } from "./app.types";
import { extractMessage } from "./app-helpers";

type SyncUi = () => void;

export async function handlePrepareLocalPublicBase(
  state: UiState,
  syncUi: SyncUi,
): Promise<void> {
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

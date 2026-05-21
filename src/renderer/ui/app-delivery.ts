import type { ProcessCsvResult, UiState } from "./app.types";

export function resetOutputState(state: UiState): void {
  state.outputCsv = null;
  state.outputXlsx = null;
  state.outputDelivery = null;
  state.savedPath = null;
}

export function applyProcessResult(
  state: UiState,
  result: ProcessCsvResult,
): void {
  state.outputCsv = result.outputCsv;
  state.outputXlsx = result.outputXlsx;
  state.outputDelivery = result.delivery;
  state.summary = result.summary;
  state.execution = result.execution;
  state.savedPath = result.savedPath;
  state.status = result.runStatus === "CANCELLED" ? "cancelled" : "success";
}

export function getOutputContent(state: UiState): string | number[] | null {
  if (state.outputDelivery?.format === "xlsx") {
    return state.outputXlsx;
  }

  return state.outputCsv;
}

export function getDefaultOutputFileName(state: UiState): string | null {
  if (!state.fileName || !state.outputDelivery) {
    return null;
  }

  return state.fileName.replace(
    /\.csv$/i,
    `-processado.${state.outputDelivery.extension}`,
  );
}

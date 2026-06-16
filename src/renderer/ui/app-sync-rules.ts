import type { UiState } from "./app.types";

export function shouldDisableLocalPublicBasePrepareButton(
  state: UiState,
): boolean {
  return (
    state.status === "processing" ||
    state.localPublicBasePrepareStatus === "loading" ||
    !state.localPublicBaseNoticeAccepted
  );
}

export function shouldDisableLocalPublicBaseDiscoverButton(
  state: UiState,
): boolean {
  return (
    state.status === "processing" ||
    state.localPublicBaseOfficialSourceStatus === "loading"
  );
}

export function shouldDisableLocalPublicBasePrepareOfficialButton(
  state: UiState,
): boolean {
  return (
    state.status === "processing" ||
    state.localPublicBasePrepareStatus === "loading" ||
    state.localPublicBaseOfficialSourceStatus === "loading" ||
    !state.localPublicBaseNoticeAccepted ||
    state.localPublicBaseOfficialSource === null
  );
}

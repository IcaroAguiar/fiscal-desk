import { SIMPLES_PROVIDER } from "../../core/simples/simples-provider.names";
import type { UiState } from "./app.types";

export function shouldDisableLocalPublicBasePrepareButton(
  state: UiState,
): boolean {
  return (
    state.status === "processing" ||
    state.localPublicBasePrepareStatus === "loading" ||
    (state.provider === SIMPLES_PROVIDER.BASE_PUBLICA_LOCAL &&
      !state.localPublicBaseNoticeAccepted)
  );
}

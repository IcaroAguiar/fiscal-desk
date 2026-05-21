import { SIMPLES_PROVIDER } from "../../core/simples/simples-provider.names";
import type { ProcessExecutionHistoryItem } from "../../main/types";
import type { UiState } from "./app.types";

export function syncReceitaWebAvailability(
  providerSelect: HTMLSelectElement,
  state: UiState,
): void {
  const receitaWebOption = providerSelect.querySelector<HTMLOptionElement>(
    'option[value="receita-web"]',
  );

  if (!receitaWebOption) {
    return;
  }

  const shouldHide = !state.receitaWebAvailable;
  receitaWebOption.disabled = shouldHide;
  receitaWebOption.hidden = shouldHide;

  if (shouldHide && state.provider === "receita-web") {
    state.provider = "mock";
  }
}

export function prepareLocalPublicBaseResume(
  state: UiState,
  historyItem: ProcessExecutionHistoryItem,
): boolean {
  if (historyItem.providerName !== SIMPLES_PROVIDER.BASE_PUBLICA_LOCAL) {
    return true;
  }

  if (
    state.provider === SIMPLES_PROVIDER.BASE_PUBLICA_LOCAL &&
    state.localPublicBaseNoticeAccepted
  ) {
    return true;
  }

  state.provider = SIMPLES_PROVIDER.BASE_PUBLICA_LOCAL;
  state.localPublicBaseNoticeAccepted = false;
  state.status = "idle";
  state.message =
    "Confirme o aviso de Data da Base antes de retomar esta execução.";

  return false;
}

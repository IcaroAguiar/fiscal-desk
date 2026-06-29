import { SIMPLES_PROVIDER } from "../../core/simples/simples-provider.names";
import type { ProcessExecutionHistoryItem } from "../../main/types";
import type { UiState } from "./app.types";

export function syncReceitaWebAvailability(
  providerSelect: HTMLSelectElement,
  state: UiState,
): void {
  const shouldHide = !state.receitaWebAvailable;
  const receitaWebOptions = [
    SIMPLES_PROVIDER.RECEITA_WEB,
    SIMPLES_PROVIDER.RECEITA_WEB_PARALLEL_EXPERIMENTAL,
  ].map((providerName) =>
    providerSelect.querySelector<HTMLOptionElement>(
      `option[value="${providerName}"]`,
    ),
  );

  for (const option of receitaWebOptions) {
    if (!option) {
      continue;
    }

    option.disabled = shouldHide;
    option.hidden = shouldHide;
  }

  if (
    shouldHide &&
    (state.provider === SIMPLES_PROVIDER.RECEITA_WEB ||
      state.provider === SIMPLES_PROVIDER.RECEITA_WEB_PARALLEL_EXPERIMENTAL)
  ) {
    state.provider = SIMPLES_PROVIDER.BASE_PUBLICA_LOCAL;
  }
}

export function syncLocalPublicBaseAvailability(
  providerSelect: HTMLSelectElement,
  _state: UiState,
): void {
  const option = providerSelect.querySelector<HTMLOptionElement>(
    `option[value="${SIMPLES_PROVIDER.BASE_PUBLICA_LOCAL}"]`,
  );

  if (option) {
    option.disabled = false;
    option.hidden = false;
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

export function prepareReceitaWebExperimentalResume(
  state: UiState,
  historyItem: ProcessExecutionHistoryItem,
): boolean {
  if (
    historyItem.providerName !==
    SIMPLES_PROVIDER.RECEITA_WEB_PARALLEL_EXPERIMENTAL
  ) {
    return true;
  }

  if (
    state.provider === SIMPLES_PROVIDER.RECEITA_WEB_PARALLEL_EXPERIMENTAL &&
    state.receitaWebExperimentalNoticeAccepted
  ) {
    return true;
  }

  state.provider = SIMPLES_PROVIDER.RECEITA_WEB_PARALLEL_EXPERIMENTAL;
  state.receitaWebExperimentalNoticeAccepted = false;
  state.status = "idle";
  state.message =
    "Confirme o aviso do modo experimental da Receita Web antes de retomar.";

  return false;
}

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

import type { UiState } from "./app.types";

export function renderSummaryInto(
  container: HTMLElement,
  summary: UiState["summary"],
): void {
  if (!summary) {
    const empty = document.createElement("div");
    empty.className = "summary__empty";
    empty.textContent = "Execute o processamento para ver os resultados aqui";
    container.replaceChildren(empty);
    return;
  }

  const grid = document.createElement("dl");
  grid.className = "summary__grid";

  const items = [
    ["Total de linhas", summary.totalLinhas],
    ["CNPJs únicos", summary.totalCnpjsUnicosConsultados],
    ["Retomados", summary.totalCnpjsRetomados],
    ["Optantes Simples", summary.totalOptantesSimples],
    ["Não optantes", summary.totalNaoOptantesSimples],
    [
      "CNPJs inválidos",
      summary.totalCnpjsValidos -
        summary.totalOptantesSimples -
        summary.totalNaoOptantesSimples,
    ],
    ["Erros", summary.totalErros],
  ] as const;

  for (const [label, value] of items) {
    const item = document.createElement("div");
    const term = document.createElement("dt");
    const description = document.createElement("dd");
    term.textContent = label;
    description.textContent = String(value);
    item.append(term, description);
    grid.append(item);
  }

  container.replaceChildren(grid);
}

export type ReferenceHistoryRow = {
  fileName: string;
  status: string;
  rowCount: number;
  provider: string;
  resultStatus: string;
};

export type ReferenceQueueRow = {
  fileName: string;
  statusHint: string;
  status: string;
};

export type ReferenceKpi = {
  label: string;
  value: string;
  detail: string;
};

export const referenceFixtureViewports = new Set([
  "desktop-wide",
  "mobile-reference",
]);
export const referenceScenarioName = "reference-v5-a";

export const referenceV5AState = {
  scenario: "reference-v5-a",
  providerPrimaryStatus: "Simulação",
  providerSecondaryStatus: "Receita Web exige acompanhamento",
  fileStatus: "aguardando arquivo",
  entryTitle: "Arquivo de CNPJs",
  entryHint: "Arraste aqui ou selecione no computador.",
  queueCount: "3 itens",
  queueRows: [
    {
      fileName: "clientes-maio.csv",
      statusHint: "1 linha pendente",
      status: "aguardando início",
    },
    {
      fileName: "base-fornecedores.csv",
      statusHint: "246 linhas processadas",
      status: "concluído",
    },
    {
      fileName: "entrada-manual.csv",
      statusHint: "2 CNPJs inválidos",
      status: "erro",
    },
  ] satisfies ReferenceQueueRow[],
  kpis: [
    { label: "Hoje", value: "8", detail: "execuções" },
    { label: "Processados", value: "1.284", detail: "CNPJs" },
    { label: "Pendentes", value: "3", detail: "linhas" },
    { label: "Erros", value: "2", detail: "revisar" },
  ] satisfies ReferenceKpi[],
  historyRows: [
    {
      fileName: "clientes-maio.csv",
      status: "aguardando início",
      rowCount: 5,
      provider: "mock",
      resultStatus: "pendente",
    },
    {
      fileName: "base-fornecedores.csv",
      status: "concluído",
      rowCount: 246,
      provider: "mock",
      resultStatus: "salvo local",
    },
    {
      fileName: "entrada-manual.csv",
      status: "erro",
      rowCount: 18,
      provider: "mock",
      resultStatus: "bloqueado",
    },
  ] satisfies ReferenceHistoryRow[],
  logs: [
    "10:41:12 base local carregada",
    "10:41:16 aguardando arquivo de entrada",
    "10:41:19 simulação local selecionada",
    "10:41:23 receita-web requer acompanhamento",
  ],
  outputText: "O arquivo final aparece após uma consulta concluída.",
  outputFormat: "csv",
};

import type { UiState } from "./app.types";

export function formatLocalPublicBaseStatusLine(state: UiState): string {
  const status = state.localPublicBaseStatus;

  if (!status || status.state === "not-prepared") {
    return "Base oficial do Governo Federal ainda não preparada neste perfil.";
  }

  if (status.state === "error") {
    return status.errorMessage ?? "Base Pública Local indisponível.";
  }

  return [
    `Fonte oficial do Governo Federal para a Data da Base ${status.baseDate ?? "não informada"}`,
    `${status.preparedRows} registros preparados`,
    `${status.rejectedRows} rejeitados`,
    status.sourceFileName ? `Origem: ${status.sourceFileName}` : null,
  ]
    .filter(Boolean)
    .join(" • ");
}

export function formatLocalPublicBaseOfficialSourceLine(
  state: UiState,
): string {
  if (state.localPublicBaseOfficialSourceStatus === "loading") {
    return "Consultando a base oficial do Governo Federal...";
  }

  if (state.localPublicBaseOfficialSourceStatus === "error") {
    return "Base oficial do Governo Federal indisponível nesta rede; use Preparar base com CSV local confiável.";
  }

  const source = state.localPublicBaseOfficialSource;

  if (!source) {
    return "Base oficial do Governo Federal ainda não consultada.";
  }

  return [
    `Base oficial do Governo Federal localizada`,
    `Data da Base ${source.baseDate}`,
    `${source.fileName} ${source.sizeLabel}`,
    `publicação ${source.lastModified}`,
  ].join(" • ");
}

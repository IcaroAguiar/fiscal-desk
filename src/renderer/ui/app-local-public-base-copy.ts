import type { UiState } from "./app.types";

export function formatLocalPublicBaseStatusLine(state: UiState): string {
  const status = state.localPublicBaseStatus;

  if (!status || status.state === "not-prepared") {
    return "Base ainda não preparada neste perfil.";
  }

  if (status.state === "error") {
    return status.errorMessage ?? "Base Pública Local indisponível.";
  }

  return [
    `${status.preparedRows} registros preparados`,
    `${status.rejectedRows} rejeitados`,
    `Data da Base: ${status.baseDate ?? "não informada"}`,
    status.sourceFileName ? `Origem: ${status.sourceFileName}` : null,
  ]
    .filter(Boolean)
    .join(" • ");
}

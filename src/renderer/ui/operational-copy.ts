import {
  SIMPLES_PROVIDER,
  type SimplesProviderName,
} from "../../core/simples/simples-provider.names";
import type {
  LookupProgress,
  ProcessCsvDeliveryFormat,
} from "../../main/types";

type DedupeSource = {
  totalCnpjsEncontrados: number;
  totalCnpjsUnicosConsultados: number;
};

export function formatDuration(durationInMs: number): string {
  const totalSeconds = Math.max(0, Math.round(durationInMs / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }

  return `${seconds}s`;
}

export function formatProviderMode(provider: SimplesProviderName): string {
  if (provider === SIMPLES_PROVIDER.CNPJA_OPEN) {
    return "CNPJá Open";
  }

  if (provider === SIMPLES_PROVIDER.BASE_PUBLICA_LOCAL) {
    return "Base local";
  }

  if (provider === SIMPLES_PROVIDER.RECEITA_WEB) {
    return "Receita Web manual";
  }

  return "Simulação";
}

export function formatCommandBarSummary(
  fileName: string | null,
  provider: SimplesProviderName,
): string {
  const label = fileName ?? "Nenhum CSV selecionado";

  return `${label} • ${formatProviderMode(provider)}`;
}

export function formatProviderHint(
  fileName: string | null,
  provider: SimplesProviderName,
): string {
  if (!fileName) {
    return "Selecione um CSV para continuar";
  }

  if (provider === SIMPLES_PROVIDER.RECEITA_WEB) {
    return "A Receita Web abre o navegador e precisa de acompanhamento.";
  }

  if (provider === SIMPLES_PROVIDER.BASE_PUBLICA_LOCAL) {
    return "A Base local usa a data do arquivo preparado neste computador.";
  }

  return `Consulta configurada em ${formatProviderMode(provider)}.`;
}

export function buildDedupeLabel(source: DedupeSource): string {
  const duplicates = Math.max(
    0,
    source.totalCnpjsEncontrados - source.totalCnpjsUnicosConsultados,
  );

  return `${duplicates} CNPJs repetidos ignorados`;
}

export function previewAutoSavePath(
  sourceFilePath: string,
  deliveryFormat: ProcessCsvDeliveryFormat = "csv",
): string {
  const normalized = sourceFilePath.replace(/\.csv$/i, "");

  return `${normalized}-processado.${deliveryFormat}`;
}

export function formatProgressLine(progress: LookupProgress | null): string {
  if (!progress) {
    return "Aguardando arquivo para iniciar.";
  }

  return `${progress.completedUniqueLookups}/${progress.totalUniqueLookups} CNPJs consultados • ${formatDuration(progress.elapsedMs)} em andamento • falta ${formatDuration(progress.estimatedRemainingMs)} • atual ${progress.currentCnpj}`;
}

export function countdownRemainingMs(
  baseRemainingMs: number,
  elapsedSinceLastProgressMs: number,
): number {
  return Math.max(0, baseRemainingMs - elapsedSinceLastProgressMs);
}

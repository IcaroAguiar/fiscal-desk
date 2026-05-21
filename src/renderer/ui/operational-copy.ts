import type { SimplesProviderName } from "../../core/simples/simples-provider.factory";
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
  if (provider === "cnpja-open") {
    return "CNPJá Open";
  }

  if (provider === "receita-web") {
    return "Receita Web assistida";
  }

  return "Simulação local";
}

export function formatCommandBarSummary(
  fileName: string | null,
  provider: SimplesProviderName,
): string {
  const label = fileName ?? "Nenhum CSV carregado";

  return `${label} • ${formatProviderMode(provider)}`;
}

export function formatProviderHint(
  fileName: string | null,
  provider: SimplesProviderName,
): string {
  if (!fileName) {
    return "Selecione um CSV para continuar";
  }

  if (provider === "receita-web") {
    return "Receita Web exige navegador visível e supervisão humana";
  }

  return `Provedor selecionado: ${formatProviderMode(provider)}`;
}

export function buildDedupeLabel(source: DedupeSource): string {
  const duplicates = Math.max(
    0,
    source.totalCnpjsEncontrados - source.totalCnpjsUnicosConsultados,
  );

  return `${duplicates} duplicados removidos`;
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
    return "Aguardando arquivo para iniciar as consultas únicas.";
  }

  return `${progress.completedUniqueLookups}/${progress.totalUniqueLookups} consultas únicas • ${formatDuration(progress.elapsedMs)} em execução • ETA ${formatDuration(progress.estimatedRemainingMs)} • atual ${progress.currentCnpj}`;
}

export function countdownRemainingMs(
  baseRemainingMs: number,
  elapsedSinceLastProgressMs: number,
): number {
  return Math.max(0, baseRemainingMs - elapsedSinceLastProgressMs);
}

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

type OperationalPanelSource = {
  deliveryFormat: ProcessCsvDeliveryFormat;
  execution: {
    checkpointPath: string | null;
    completedUniqueLookups: number;
    resumedUniqueLookups: number;
    runId: string;
    status: string;
    totalUniqueLookups: number;
  } | null;
  fileName: string | null;
  message: string;
  progress: LookupProgress | null;
  savedPath: string | null;
  status: string;
  summary: {
    totalErros: number;
    totalCnpjsUnicosConsultados: number;
  } | null;
};

export type OperationalPanelCopy = {
  blockerLabel: string;
  blockerTone: "neutral" | "warning" | "danger" | "success";
  checkpointLabel: string;
  currentItemLabel: string;
  etaLabel: string;
  failureLabel: string;
  lastSaveLabel: string;
  suggestionLabel: string;
};

export function getOperationalToneClass(
  tone: OperationalPanelCopy["blockerTone"],
): string {
  if (tone === "danger") return "status-token--danger";
  if (tone === "warning") return "status-token--warning";
  if (tone === "success") return "status-token--success";
  return "status-token--info";
}

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

  return `${progress.completedUniqueLookups}/${progress.totalUniqueLookups} CNPJs consultados • ${formatDuration(progress.elapsedMs)} em andamento • cerca de ${formatDuration(progress.estimatedRemainingMs)} restantes • atual ${progress.currentCnpj}`;
}

export function countdownRemainingMs(
  baseRemainingMs: number,
  elapsedSinceLastProgressMs: number,
): number {
  return Math.max(0, baseRemainingMs - elapsedSinceLastProgressMs);
}

export function formatExecutionStatus(status: string): string {
  if (status === "SUCCESS") return "Concluído";
  if (status === "ERROR") return "Erro";
  if (status === "CANCELLED") return "Cancelado";
  if (status === "RUNNING") return "Em consulta";
  return status;
}

export function formatExecutionResume(source: {
  execution: { resumedUniqueLookups: number } | null;
}): string {
  if (!source.execution) {
    return "Sem consulta em andamento";
  }

  if (source.execution.resumedUniqueLookups === 0) {
    return "Retomada não utilizada";
  }

  return `${source.execution.resumedUniqueLookups} CNPJs retomados`;
}

export function buildOperationalPanelCopy(
  source: OperationalPanelSource,
): OperationalPanelCopy {
  const progress = source.progress;
  const completed =
    progress?.completedUniqueLookups ??
    source.execution?.completedUniqueLookups ??
    source.summary?.totalCnpjsUnicosConsultados ??
    0;
  const total =
    progress?.totalUniqueLookups ?? source.execution?.totalUniqueLookups ?? 0;
  const pending = Math.max(0, total - completed);
  const itemFailures = source.summary?.totalErros ?? 0;
  const hasSystemicBlocker =
    source.status === "error" ||
    source.execution?.status === "FAILED" ||
    source.execution?.status === "CANCELLED";

  return {
    blockerLabel: formatBlockerLabel(source, hasSystemicBlocker),
    blockerTone: getBlockerTone(source, hasSystemicBlocker, itemFailures),
    checkpointLabel: formatCheckpointLabel(source),
    currentItemLabel: progress
      ? `Consultando ${progress.currentCnpj}`
      : source.summary
        ? "Consulta encerrada"
        : source.fileName
          ? "Pronto para iniciar"
          : "Aguardando Entrada de Consulta",
    etaLabel: formatEtaLabel(progress, completed, total),
    failureLabel:
      itemFailures > 0
        ? `${itemFailures} falha${itemFailures === 1 ? "" : "s"} por item para revisar`
        : hasSystemicBlocker
          ? "Bloqueio da execução, sem falha por item confirmada"
          : "Nenhuma falha por item registrada",
    lastSaveLabel: formatLastSaveLabel(source),
    suggestionLabel: formatSuggestionLabel(source, pending, itemFailures),
  };
}

function formatEtaLabel(
  progress: LookupProgress | null,
  completed: number,
  total: number,
): string {
  if (!progress) {
    return total > 0
      ? "Estimativa indisponível no momento."
      : "ETA aparece durante a consulta.";
  }

  const remaining = formatDuration(progress.estimatedRemainingMs);
  const sampleIsSmall = completed < 3 || total < 5;
  const confidence = sampleIsSmall ? "estimativa inicial" : "estimativa móvel";

  return `${confidence}: cerca de ${remaining} restantes.`;
}

function formatBlockerLabel(
  source: OperationalPanelSource,
  hasSystemicBlocker: boolean,
): string {
  if (hasSystemicBlocker) {
    return (
      source.message || "Execução interrompida; revise antes de continuar."
    );
  }

  if (source.status === "processing") {
    return "Sem bloqueio sistêmico detectado.";
  }

  if (source.summary) {
    return "Execução encerrada; pendências ficam no resultado.";
  }

  return "Nenhum bloqueio visível antes da consulta.";
}

function getBlockerTone(
  source: OperationalPanelSource,
  hasSystemicBlocker: boolean,
  itemFailures: number,
): OperationalPanelCopy["blockerTone"] {
  if (hasSystemicBlocker) return "danger";
  if (itemFailures > 0) return "warning";
  if (source.summary) return "success";
  return "neutral";
}

function formatCheckpointLabel(source: OperationalPanelSource): string {
  if (!source.execution) {
    return "Checkpoint será criado durante a execução.";
  }

  const resumed = source.execution.resumedUniqueLookups;

  if (resumed > 0) {
    return `${resumed} CNPJ${resumed === 1 ? "" : "s"} retomado${resumed === 1 ? "" : "s"} do checkpoint local.`;
  }

  return source.execution.checkpointPath
    ? "Retomada local disponível."
    : "Retomada será registrada se a execução for interrompida.";
}

function formatLastSaveLabel(source: OperationalPanelSource): string {
  if (source.savedPath) {
    const savedName = source.savedPath.split(/[/\\]/).pop() ?? source.savedPath;

    return `Último arquivo salvo: ${savedName}.`;
  }

  if (source.status === "processing") {
    return "Salvamento automático aparece ao concluir ou cancelar.";
  }

  return `Entrega ${source.deliveryFormat === "xlsx" ? "Excel" : "CSV"} ainda não salva.`;
}

function formatSuggestionLabel(
  source: OperationalPanelSource,
  pending: number,
  itemFailures: number,
): string {
  if (source.status === "error") {
    return "Sugestão: corrija o bloqueio indicado e tente novamente.";
  }

  if (source.execution?.status === "CANCELLED") {
    return "Sugestão: retome pelo histórico ou exporte o parcial salvo.";
  }

  if (itemFailures > 0) {
    return "Sugestão: revise as falhas por item sem descartar os CNPJs já consultados.";
  }

  if (source.status === "processing" && pending > 0) {
    return "Sugestão: continue acompanhando; cancele só se precisar liberar o computador.";
  }

  if (source.summary) {
    return "Sugestão: confira a Entrega de Resultado antes de compartilhar.";
  }

  return "Sugestões aparecem quando houver progresso, falha ou bloqueio claro.";
}

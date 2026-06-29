import {
  SIMPLES_PROVIDER,
  type SimplesProviderName,
} from "../../core/simples/simples-provider.names";
import type {
  LookupProgress,
  ProcessCsvDeliveryFormat,
  ProcessCsvExecutionSpeedProfile,
} from "../../main/types";
import { PROCESS_CSV_EXECUTION_SPEED_PROFILE } from "../../main/types";

type DedupeSource = {
  totalCnpjsEncontrados: number;
  totalCnpjsUnicosConsultados: number;
};

type OperationalPanelSource = {
  deliveryFormat: ProcessCsvDeliveryFormat;
  executionSpeedProfile?: ProcessCsvExecutionSpeedProfile;
  execution: {
    checkpointPath: string | null;
    completedUniqueLookups: number;
    resumedUniqueLookups: number;
    runId: string;
    status: string;
    totalUniqueLookups: number;
  } | null;
  fileName: string | null;
  localPublicBaseStatus: { state: string } | null;
  message: string;
  progress: LookupProgress | null;
  provider: SimplesProviderName;
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
  controlLabel: string;
  currentItemLabel: string;
  etaLabel: string;
  failureLabel: string;
  lastSaveLabel: string;
  speedDetailLabel: string;
  speedLabel: string;
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

  if (provider === SIMPLES_PROVIDER.RECEITA_WEB_PARALLEL_EXPERIMENTAL) {
    return "Receita Web experimental";
  }

  return "Teste local offline";
}

export function formatCommandBarSummary(
  fileName: string | null,
  provider: SimplesProviderName,
): string {
  const label = fileName ?? "Nenhuma planilha selecionada";

  return `${label} • ${formatProviderMode(provider)}`;
}

export function formatProviderHint(
  fileName: string | null,
  provider: SimplesProviderName,
): string {
  if (!fileName) {
    return "Selecione uma planilha CSV ou Excel para continuar";
  }

  if (provider === SIMPLES_PROVIDER.RECEITA_WEB) {
    return "A Receita Web abre o navegador e precisa de acompanhamento.";
  }

  if (provider === SIMPLES_PROVIDER.RECEITA_WEB_PARALLEL_EXPERIMENTAL) {
    return "Modo experimental com janelas visíveis; CAPTCHA exige desbloqueio manual.";
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
  const normalized = sourceFilePath.replace(/\.(csv|xlsx)$/i, "");

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

  return formatResumedUniqueLookups(source.execution.resumedUniqueLookups);
}

function formatResumedUniqueLookups(count: number): string {
  if (count === 1) {
    return "1 CNPJ retomado";
  }

  return `${count} CNPJs retomados`;
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
    blockerLabel: formatBlockerLabel(source, hasSystemicBlocker, itemFailures),
    blockerTone: getBlockerTone(source, hasSystemicBlocker, itemFailures),
    checkpointLabel: formatCheckpointLabel(source),
    controlLabel: formatControlLabel(source),
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
    speedDetailLabel: formatSpeedDetailLabel(source),
    speedLabel: formatSpeedLabel(source),
    suggestionLabel: formatSuggestionLabel(source, pending, itemFailures),
  };
}

function isLocalPublicBaseReady(source: OperationalPanelSource): boolean {
  return source.localPublicBaseStatus?.state === "ready";
}

function isReceitaWebProvider(source: OperationalPanelSource): boolean {
  return (
    source.provider === SIMPLES_PROVIDER.RECEITA_WEB ||
    source.provider === SIMPLES_PROVIDER.RECEITA_WEB_PARALLEL_EXPERIMENTAL
  );
}

function isLikelyReceitaWebPortalStop(
  source: OperationalPanelSource,
  itemFailures: number,
): boolean {
  if (!isReceitaWebProvider(source)) {
    return false;
  }

  const message = source.message.toLowerCase();

  return (
    message.includes("captcha") ||
    message.includes("bloqueio") ||
    message.includes("portal") ||
    ((source.execution?.status === "CANCELLED" ||
      source.execution?.status === "FAILED" ||
      source.status === "cancelled" ||
      source.status === "error") &&
      itemFailures > 0)
  );
}

function formatSpeedLabel(source: OperationalPanelSource): string {
  if (source.provider === SIMPLES_PROVIDER.BASE_PUBLICA_LOCAL) {
    return isLocalPublicBaseReady(source)
      ? `Volume local ${formatSpeedProfileLabel(resolveSpeedProfile(source))}`
      : "Volume local pendente";
  }

  if (source.provider === SIMPLES_PROVIDER.CNPJA_OPEN) {
    return `Online limitado (${formatSpeedProfileLabel(resolveSpeedProfile(source))})`;
  }

  if (source.provider === SIMPLES_PROVIDER.RECEITA_WEB) {
    return "Assistido lento";
  }

  if (source.provider === SIMPLES_PROVIDER.RECEITA_WEB_PARALLEL_EXPERIMENTAL) {
    return `Assistido experimental ${formatSpeedProfileLabel(resolveSpeedProfile(source))}`;
  }

  return "Teste local offline";
}

function formatSpeedDetailLabel(source: OperationalPanelSource): string {
  if (source.provider === SIMPLES_PROVIDER.BASE_PUBLICA_LOCAL) {
    return isLocalPublicBaseReady(source)
      ? formatLocalSpeedDetail(resolveSpeedProfile(source))
      : "Prepare a Base local antes de lotes grandes para evitar navegador e CAPTCHA.";
  }

  if (source.provider === SIMPLES_PROVIDER.CNPJA_OPEN) {
    return "Consulta pela internet respeita rate limit público; o perfil não abre paralelismo.";
  }

  if (source.provider === SIMPLES_PROVIDER.RECEITA_WEB) {
    return "Use para amostras, divergências ou confirmação manual; não é motor de volume.";
  }

  if (source.provider === SIMPLES_PROVIDER.RECEITA_WEB_PARALLEL_EXPERIMENTAL) {
    return formatReceitaWebExperimentalSpeedDetail(resolveSpeedProfile(source));
  }

  return "Valida o fluxo sem internet; troque de base antes de consultar dados reais.";
}

function formatControlLabel(source: OperationalPanelSource): string {
  if (source.status === "processing") {
    if (source.provider === SIMPLES_PROVIDER.RECEITA_WEB) {
      return "Use Pausar para checkpoint; Receita Web segue assistida, sem paralelismo.";
    }

    if (
      source.provider === SIMPLES_PROVIDER.RECEITA_WEB_PARALLEL_EXPERIMENTAL
    ) {
      return "Se houver CAPTCHA, resolva na janela visível; Pausar/Cancelar preserva checkpoint.";
    }

    if (source.provider === SIMPLES_PROVIDER.BASE_PUBLICA_LOCAL) {
      return "Use Pausar para checkpoint; perfil de velocidade controla concorrência local.";
    }

    return "Use Pausar para checkpoint e retomada; Cancelar interrompe a execução.";
  }

  if (source.provider === SIMPLES_PROVIDER.BASE_PUBLICA_LOCAL) {
    return isLocalPublicBaseReady(source)
      ? "Pronto para volume local; cancelamento mantém retomada."
      : "Prepare a base e confirme a data antes de iniciar.";
  }

  if (source.provider === SIMPLES_PROVIDER.RECEITA_WEB) {
    return "Antes de iniciar, reserve o navegador para acompanhamento manual.";
  }

  if (source.provider === SIMPLES_PROVIDER.RECEITA_WEB_PARALLEL_EXPERIMENTAL) {
    return "Confirme o aviso experimental; CAPTCHA deve ser resolvido manualmente na janela.";
  }

  return "Escolha a estratégia antes de iniciar; cancelamento gera parcial quando houver progresso.";
}

function resolveSpeedProfile(
  source: OperationalPanelSource,
): ProcessCsvExecutionSpeedProfile {
  return (
    source.executionSpeedProfile ?? PROCESS_CSV_EXECUTION_SPEED_PROFILE.BALANCED
  );
}

function formatSpeedProfileLabel(
  speedProfile: ProcessCsvExecutionSpeedProfile,
): string {
  if (speedProfile === PROCESS_CSV_EXECUTION_SPEED_PROFILE.CONSERVATIVE) {
    return "leve";
  }

  if (speedProfile === PROCESS_CSV_EXECUTION_SPEED_PROFILE.FAST) {
    return "rápido";
  }

  if (speedProfile === PROCESS_CSV_EXECUTION_SPEED_PROFILE.MAXIMUM) {
    return "máximo";
  }

  return "equilibrado";
}

function formatLocalSpeedDetail(
  speedProfile: ProcessCsvExecutionSpeedProfile,
): string {
  if (speedProfile === PROCESS_CSV_EXECUTION_SPEED_PROFILE.CONSERVATIVE) {
    return "Consulta local em ritmo leve para manter o computador responsivo.";
  }

  if (speedProfile === PROCESS_CSV_EXECUTION_SPEED_PROFILE.FAST) {
    return "Consulta local com mais concorrência para reduzir tempo em lotes grandes.";
  }

  if (speedProfile === PROCESS_CSV_EXECUTION_SPEED_PROFILE.MAXIMUM) {
    return "Consulta local no maior ritmo permitido; acompanhe CPU e memória.";
  }

  return "Consulta local equilibrada para acelerar sem monopolizar o computador.";
}

function formatReceitaWebExperimentalSpeedDetail(
  speedProfile: ProcessCsvExecutionSpeedProfile,
): string {
  if (speedProfile === PROCESS_CSV_EXECUTION_SPEED_PROFILE.CONSERVATIVE) {
    return "1 janela visível; preserva o comportamento assistido atual.";
  }

  if (speedProfile === PROCESS_CSV_EXECUTION_SPEED_PROFILE.FAST) {
    return "Até 3 janelas visíveis; ao surgir CAPTCHA, resolva manualmente.";
  }

  if (speedProfile === PROCESS_CSV_EXECUTION_SPEED_PROFILE.MAXIMUM) {
    return "Até 3 janelas visíveis; maior risco de ocupar o computador.";
  }

  return "Até 2 janelas visíveis; uso experimental com supervisão humana.";
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
  itemFailures: number,
): string {
  if (isLikelyReceitaWebPortalStop(source, itemFailures)) {
    return "Receita Web interrompida por CAPTCHA, bloqueio ou proteção do portal.";
  }

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
  if (isLikelyReceitaWebPortalStop(source, itemFailures)) {
    return "Sugestão: exporte/retome as pendências e troque para Base local; use Buscar fonte oficial e Baixar e preparar oficial.";
  }

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
    if (source.provider === SIMPLES_PROVIDER.RECEITA_WEB && pending >= 25) {
      return "Sugestão: cancele e reexecute em Base local para volume; use Receita Web só para amostra ou divergência.";
    }

    if (source.provider === SIMPLES_PROVIDER.RECEITA_WEB) {
      return "Sugestão: acompanhe manualmente; cancele se o navegador impedir o uso do computador.";
    }

    if (
      source.provider === SIMPLES_PROVIDER.RECEITA_WEB_PARALLEL_EXPERIMENTAL
    ) {
      return "Sugestão: monitore as janelas; se houver CAPTCHA, resolva manualmente ou exporte pendências.";
    }

    if (source.provider === SIMPLES_PROVIDER.BASE_PUBLICA_LOCAL) {
      return "Sugestão: mantenha em Base local; é o caminho de volume neste computador.";
    }

    if (source.provider === SIMPLES_PROVIDER.CNPJA_OPEN) {
      return "Sugestão: monitore rate limit; cancele e retome se o ETA crescer muito.";
    }

    return "Sugestão: teste local valida o fluxo sem rede; troque para Base local antes de dados reais.";
  }

  if (source.summary) {
    return "Sugestão: confira a Entrega de Resultado antes de compartilhar.";
  }

  if (
    source.fileName &&
    source.provider === SIMPLES_PROVIDER.BASE_PUBLICA_LOCAL
  ) {
    return isLocalPublicBaseReady(source)
      ? "Sugestão: execute em Base local para volume sem abrir navegador."
      : "Sugestão: prepare a Base local antes de processar listas grandes.";
  }

  if (source.fileName && source.provider === SIMPLES_PROVIDER.RECEITA_WEB) {
    return "Sugestão: use Receita Web para poucos CNPJs; para volume, troque para Base local.";
  }

  if (
    source.fileName &&
    source.provider === SIMPLES_PROVIDER.RECEITA_WEB_PARALLEL_EXPERIMENTAL
  ) {
    return "Sugestão: use apenas com supervisão; Base local continua sendo o caminho de volume.";
  }

  if (source.fileName && source.provider === SIMPLES_PROVIDER.CNPJA_OPEN) {
    return "Sugestão: use CNPJá Open para validação online moderada e acompanhe limites.";
  }

  return "Sugestões aparecem quando houver progresso, falha ou bloqueio claro.";
}

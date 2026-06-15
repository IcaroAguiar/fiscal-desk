import { normalizeCnpj } from "../cnpj/normalize-cnpj";
import { validateCnpj } from "../cnpj/validate-cnpj";
import { readCsv } from "../ingestion/csv-reader";
import {
  LOCAL_PUBLIC_BASE_RECORDS,
  LOCAL_PUBLIC_BASE_STATUS,
} from "./local-public-base.fixture";
import type {
  LocalPublicBasePreparationConsent,
  LocalPublicBasePrepareInput,
  LocalPublicBasePrepareResult,
  LocalPublicBaseRecord,
  LocalPublicBaseStatus,
} from "./local-public-base.types";

const DEFAULT_FRESHNESS_WARNING =
  "A Base Pública Local pode estar defasada; use como consulta resiliente e confirme casos sensíveis em provedor online.";

export class LocalPublicBaseIndex {
  private readonly recordsByCnpj: ReadonlyMap<string, LocalPublicBaseRecord>;

  constructor(records: readonly LocalPublicBaseRecord[]) {
    const entries = records.flatMap((record) => [
      [record.cnpj, record] as const,
      ...(record.cnpjBasico ? [[record.cnpjBasico, record] as const] : []),
    ]);
    this.recordsByCnpj = new Map(entries);
  }

  findByCnpj(cnpj: string): LocalPublicBaseRecord | null {
    const normalizedCnpj = normalizeCnpj(cnpj);

    return (
      this.recordsByCnpj.get(normalizedCnpj) ??
      this.recordsByCnpj.get(normalizedCnpj.slice(0, 8)) ??
      null
    );
  }
}

export function createLocalPublicBaseIndex(): LocalPublicBaseIndex {
  return new LocalPublicBaseIndex(LOCAL_PUBLIC_BASE_RECORDS);
}

export function createLocalPublicBaseIndexFromRecords(
  records: readonly LocalPublicBaseRecord[],
): LocalPublicBaseIndex {
  return new LocalPublicBaseIndex(records);
}

export function prepareLocalPublicBaseFromCsv(
  input: LocalPublicBasePrepareInput,
): LocalPublicBasePrepareResult & { records: LocalPublicBaseRecord[] } {
  assertLocalPublicBasePreparationConsent(input.consent);

  const { headers, rows } = readCsv(input.content);
  const columns = resolveLocalPublicBaseColumns(headers);
  const records = new Map<string, LocalPublicBaseRecord>();
  let rejectedRows = 0;

  for (const row of rows) {
    const cnpj = normalizeCnpj(row[columns.cnpj] ?? "");

    if (!validateCnpj(cnpj)) {
      rejectedRows += 1;
      continue;
    }

    const simplesNacional = parseBoolean(row[columns.simplesNacional]);
    const simei = parseBoolean(row[columns.simei]);

    if (simplesNacional === null || simei === null) {
      rejectedRows += 1;
      continue;
    }

    records.set(cnpj, {
      cnpj,
      cnpjBasico: cnpj.slice(0, 8),
      razaoSocial:
        getOptionalColumnValue(row, columns.razaoSocial) ?? "Sem razão social",
      simplesNacional,
      simei,
      updatedAt:
        getOptionalColumnValue(row, columns.updatedAt) ??
        getOptionalColumnValue(row, columns.baseDate) ??
        "data não informada",
    });
  }

  const preparedAt = new Date().toISOString();
  const acceptedRecords = Array.from(records.values());
  const baseDate = resolveBaseDate(rows, columns) ?? "data não informada";
  const status = createLocalPublicBaseStatus({
    baseDate,
    estimatedRows: rows.length,
    preparedAt,
    preparedRows: acceptedRecords.length,
    rejectedRows,
    sourceFileName: input.sourceFileName,
    sourceSizeBytes: byteLength(input.content),
    state: acceptedRecords.length > 0 ? "ready" : "error",
  });

  return {
    acceptedRows: acceptedRecords.length,
    rejectedRows,
    records: acceptedRecords,
    status:
      acceptedRecords.length > 0
        ? status
        : {
            ...status,
            errorMessage:
              "Nenhum registro válido foi encontrado no CSV selecionado.",
          },
  };
}

export function createLocalPublicBaseStatus(input: {
  baseDate: string | null;
  estimatedRows: number;
  preparedAt: string | null;
  preparedRows: number;
  rejectedRows: number;
  sourceFileName: string | null;
  sourceSizeBytes?: number;
  state: LocalPublicBaseStatus["state"];
  errorMessage?: string | null;
}): LocalPublicBaseStatus {
  return {
    state: input.state,
    baseDate: input.baseDate,
    preparedAt: input.preparedAt,
    sourceFileName: input.sourceFileName,
    estimatedRows: input.estimatedRows,
    preparedRows: input.preparedRows,
    rejectedRows: input.rejectedRows,
    estimatedSizeLabel:
      input.sourceSizeBytes === undefined
        ? LOCAL_PUBLIC_BASE_STATUS.estimatedSizeLabel
        : `${formatBytes(input.sourceSizeBytes)} no arquivo de origem`,
    estimatedPreparationTimeLabel:
      input.preparedRows >= 50_000
        ? "alguns minutos no computador local"
        : "menos de 1 minuto neste computador",
    diskUsageLabel:
      input.state === "ready"
        ? `${formatBytes(estimateIndexBytes(input.preparedRows))} estimados no índice local`
        : "sem base preparada neste perfil",
    freshnessWarning:
      input.state === "ready"
        ? DEFAULT_FRESHNESS_WARNING
        : LOCAL_PUBLIC_BASE_STATUS.freshnessWarning,
    errorMessage: input.errorMessage ?? null,
  };
}

export function getLocalPublicBaseStatus(): LocalPublicBaseStatus {
  return LOCAL_PUBLIC_BASE_STATUS;
}

export function assertLocalPublicBasePreparationConsent(
  consent: LocalPublicBasePreparationConsent | undefined,
): asserts consent is LocalPublicBasePreparationConsent {
  if (
    consent === undefined ||
    consent.accepted !== true ||
    !normalizeText(consent.acceptedAt) ||
    !normalizeText(consent.baseDateAcknowledged) ||
    !normalizeText(consent.stalenessWarningAcknowledged)
  ) {
    throw new Error(
      "Consentimento explícito é obrigatório antes de preparar a Base Pública Local.",
    );
  }
}

function resolveLocalPublicBaseColumns(headers: string[]): {
  baseDate: string | null;
  cnpj: string;
  razaoSocial: string | null;
  simei: string;
  simplesNacional: string;
  updatedAt: string | null;
} {
  const cnpj = findHeader(headers, ["cnpj", "cnpj_basico_completo"]);
  const simplesNacional = findHeader(headers, [
    "simples_nacional",
    "simples",
    "opcao_simples",
    "optante_simples",
    "simplesNacional",
  ]);
  const simei = findHeader(headers, ["simei", "mei", "opcao_simei"]);

  if (!cnpj || !simplesNacional || !simei) {
    throw new Error(
      "CSV da Base Pública Local precisa conter colunas cnpj, simples_nacional e simei.",
    );
  }

  return {
    baseDate: findHeader(headers, ["data_base", "base_date", "dataBase"]),
    cnpj,
    razaoSocial: findHeader(headers, [
      "razao_social",
      "razaoSocial",
      "nome_empresarial",
      "empresa",
      "nome",
    ]),
    simei,
    simplesNacional,
    updatedAt: findHeader(headers, [
      "updated_at",
      "atualizado_em",
      "updatedAt",
    ]),
  };
}

function findHeader(headers: string[], candidates: string[]): string | null {
  const normalizedCandidates = new Set(candidates.map(normalizeHeader));

  return (
    headers.find((header) =>
      normalizedCandidates.has(normalizeHeader(header)),
    ) ?? null
  );
}

function normalizeHeader(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toLowerCase();
}

function parseBoolean(value: string | undefined): boolean | null {
  const normalized = normalizeText(value)?.toLowerCase();

  if (!normalized) {
    return null;
  }

  if (["1", "s", "sim", "true", "y", "yes"].includes(normalized)) {
    return true;
  }

  if (["0", "n", "nao", "não", "false", "no"].includes(normalized)) {
    return false;
  }

  return null;
}

function normalizeText(value: string | undefined | null): string | null {
  const normalized = value?.trim();

  return normalized ? normalized : null;
}

function getOptionalColumnValue(
  row: Record<string, string>,
  column: string | null,
): string | null {
  return column ? normalizeText(row[column]) : null;
}

function resolveBaseDate(
  rows: Array<Record<string, string>>,
  columns: ReturnType<typeof resolveLocalPublicBaseColumns>,
): string | null {
  if (columns.baseDate) {
    const value = rows.map((row) => normalizeText(row[columns.baseDate ?? ""]));
    const first = value.find(Boolean);

    if (first) {
      return first;
    }
  }

  if (columns.updatedAt) {
    const dates = rows
      .map((row) => normalizeText(row[columns.updatedAt ?? ""]))
      .filter((value): value is string => Boolean(value))
      .sort();

    return dates.at(-1) ?? null;
  }

  return null;
}

function byteLength(value: string): number {
  return new TextEncoder().encode(value).byteLength;
}

function estimateIndexBytes(records: number): number {
  return Math.max(1024, records * 220);
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }

  return `${Math.round(bytes / (1024 * 1024))} MB`;
}

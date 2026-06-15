import { normalizeCnpj } from "../cnpj/normalize-cnpj";
import { validateCnpj } from "../cnpj/validate-cnpj";
import { type CsvDelimiter, writeCsv } from "../export/csv-writer";
import { readCsv } from "../ingestion/csv-reader";
import type { SimplesLookupPort } from "../simples/simples-lookup.port";
import type { SimplesLookupResult } from "../simples/simples-lookup.types";

export const COMPARISON_MODE = {
  ALL: "all",
  ERRORS: "errors",
  SAMPLE: "sample",
} as const;

export type ComparisonMode =
  (typeof COMPARISON_MODE)[keyof typeof COMPARISON_MODE];

export type ProviderComparisonOptions = {
  limit?: number;
  mode?: ComparisonMode;
  onProgress?: (progress: ProviderComparisonProgress) => void;
  signal?: AbortSignal;
};

export type ProviderComparisonProgress = {
  completed: number;
  total: number;
  currentCnpj: string;
};

export type ProviderComparisonDecision =
  | "concordante"
  | "divergente"
  | "inconclusivo";

export type ProviderComparisonRow = {
  cnpj_normalizado: string;
  status_original: string;
  simples_nacional_original: string;
  simei_original: string;
  fonte_original: string;
  status_reconsulta: string;
  simples_nacional_reconsulta: string;
  simei_reconsulta: string;
  comparacao_simples: string;
  comparacao_simei: string;
  decisao_comparativa: ProviderComparisonDecision;
  mensagem_original: string;
  mensagem_reconsulta: string;
};

export type ProviderComparisonResult = {
  delimiter: CsvDelimiter;
  outputCsv: string;
  rows: ProviderComparisonRow[];
  summary: {
    totalInputRows: number;
    totalCandidates: number;
    totalCompared: number;
    totalConcordant: number;
    totalDivergent: number;
    totalInconclusive: number;
  };
};

type ProcessedRowCandidate = {
  cnpj: string;
  original: {
    fonte: string;
    mensagem: string;
    simplesNacional: boolean | null;
    simei: boolean | null;
    status: string;
  };
};

const DEFAULT_SAMPLE_LIMIT = 10;
const COMPARISON_COLUMNS: Array<keyof ProviderComparisonRow> = [
  "cnpj_normalizado",
  "status_original",
  "simples_nacional_original",
  "simei_original",
  "fonte_original",
  "status_reconsulta",
  "simples_nacional_reconsulta",
  "simei_reconsulta",
  "comparacao_simples",
  "comparacao_simei",
  "decisao_comparativa",
  "mensagem_original",
  "mensagem_reconsulta",
];
const ERROR_LIKE_STATUSES = new Set([
  "BLOCKED",
  "CAPTCHA_REQUIRED",
  "INVALID_CNPJ",
  "NOT_FOUND",
  "PERMANENT_ERROR",
  "TEMPORARY_ERROR",
  "UNPARSABLE_RESULT",
]);

export async function compareProcessedCsvWithProvider(
  inputCsv: string,
  provider: SimplesLookupPort,
  options: ProviderComparisonOptions = {},
): Promise<ProviderComparisonResult> {
  const parsed = readCsv(inputCsv);
  const candidates = selectCandidates(
    collectCandidates(parsed.rows),
    options.mode ?? COMPARISON_MODE.SAMPLE,
    options.limit,
  );
  const rows: ProviderComparisonRow[] = [];

  for (const [index, candidate] of candidates.entries()) {
    throwIfAborted(options.signal);
    options.onProgress?.({
      completed: index,
      currentCnpj: candidate.cnpj,
      total: candidates.length,
    });

    const reconsulta = await provider.lookup(
      candidate.cnpj,
      options.signal ? { signal: options.signal } : undefined,
    );

    rows.push(createComparisonRow(candidate, reconsulta));
    options.onProgress?.({
      completed: index + 1,
      currentCnpj: candidate.cnpj,
      total: candidates.length,
    });
  }

  const outputCsv = writeCsv(
    rows as unknown as Array<Record<string, string>>,
    parsed.delimiter,
    COMPARISON_COLUMNS,
  );

  return {
    delimiter: parsed.delimiter,
    outputCsv,
    rows,
    summary: {
      totalInputRows: parsed.rows.length,
      totalCandidates: candidates.length,
      totalCompared: rows.length,
      totalConcordant: rows.filter(
        (row) => row.decisao_comparativa === "concordante",
      ).length,
      totalDivergent: rows.filter(
        (row) => row.decisao_comparativa === "divergente",
      ).length,
      totalInconclusive: rows.filter(
        (row) => row.decisao_comparativa === "inconclusivo",
      ).length,
    },
  };
}

function collectCandidates(
  rows: Array<Record<string, string>>,
): ProcessedRowCandidate[] {
  const candidates = new Map<string, ProcessedRowCandidate>();

  for (const row of rows) {
    const cnpj = normalizeCnpj(
      readFirstValue(row, ["cnpj_normalizado", "cnpj", "CNPJ", "documento"]),
    );

    if (!validateCnpj(cnpj) || candidates.has(cnpj)) {
      continue;
    }

    candidates.set(cnpj, {
      cnpj,
      original: {
        fonte: readFirstValue(row, ["fonte", "source", "provider"]),
        mensagem: readFirstValue(row, ["mensagem", "message"]),
        simplesNacional: parseNullableBoolean(
          readFirstValue(row, ["simples_nacional", "simplesNacional"]),
        ),
        simei: parseNullableBoolean(readFirstValue(row, ["simei"])),
        status: readFirstValue(row, ["status"]),
      },
    });
  }

  return [...candidates.values()];
}

function selectCandidates(
  candidates: ProcessedRowCandidate[],
  mode: ComparisonMode,
  limit?: number,
): ProcessedRowCandidate[] {
  const selected =
    mode === COMPARISON_MODE.ERRORS
      ? candidates.filter((candidate) =>
          ERROR_LIKE_STATUSES.has(candidate.original.status.toUpperCase()),
        )
      : candidates;

  if (mode === COMPARISON_MODE.ALL) {
    return selected;
  }

  if (mode === COMPARISON_MODE.ERRORS && limit === undefined) {
    return selected;
  }

  return selected.slice(0, normalizeLimit(limit));
}

function createComparisonRow(
  candidate: ProcessedRowCandidate,
  reconsulta: SimplesLookupResult,
): ProviderComparisonRow {
  const comparacaoSimples = compareNullableBooleans(
    candidate.original.simplesNacional,
    reconsulta.simplesNacional,
    reconsulta.status,
  );
  const comparacaoSimei = compareNullableBooleans(
    candidate.original.simei,
    reconsulta.simei,
    reconsulta.status,
  );

  return {
    cnpj_normalizado: candidate.cnpj,
    status_original: candidate.original.status,
    simples_nacional_original: formatNullableBoolean(
      candidate.original.simplesNacional,
    ),
    simei_original: formatNullableBoolean(candidate.original.simei),
    fonte_original: candidate.original.fonte,
    status_reconsulta: reconsulta.status,
    simples_nacional_reconsulta: formatNullableBoolean(
      reconsulta.simplesNacional,
    ),
    simei_reconsulta: formatNullableBoolean(reconsulta.simei),
    comparacao_simples: comparacaoSimples,
    comparacao_simei: comparacaoSimei,
    decisao_comparativa: decideComparison(comparacaoSimples, comparacaoSimei),
    mensagem_original: candidate.original.mensagem,
    mensagem_reconsulta: reconsulta.message ?? "",
  };
}

function compareNullableBooleans(
  original: boolean | null,
  rechecked: boolean | null,
  recheckedStatus: SimplesLookupResult["status"],
): string {
  if (recheckedStatus !== "SUCCESS") {
    return "inconclusivo";
  }

  if (original === null || rechecked === null) {
    return "inconclusivo";
  }

  return original === rechecked ? "concorda" : "diverge";
}

function decideComparison(
  comparacaoSimples: string,
  comparacaoSimei: string,
): ProviderComparisonDecision {
  if (comparacaoSimples === "diverge" || comparacaoSimei === "diverge") {
    return "divergente";
  }

  if (
    comparacaoSimples === "inconclusivo" ||
    comparacaoSimei === "inconclusivo"
  ) {
    return "inconclusivo";
  }

  return "concordante";
}

function parseNullableBoolean(value: string): boolean | null {
  const normalized = value.trim().toLowerCase();

  if (["true", "sim", "s", "1", "optante"].includes(normalized)) {
    return true;
  }

  if (["false", "não", "nao", "n", "0", "nao optante"].includes(normalized)) {
    return false;
  }

  return null;
}

function formatNullableBoolean(value: boolean | null): string {
  if (value === null) {
    return "";
  }

  return String(value);
}

function readFirstValue(
  row: Record<string, string>,
  candidates: string[],
): string {
  for (const candidate of candidates) {
    const value = row[candidate];
    if (value !== undefined) {
      return value;
    }
  }

  return "";
}

function normalizeLimit(limit: number | undefined): number {
  if (typeof limit !== "number" || !Number.isFinite(limit)) {
    return DEFAULT_SAMPLE_LIMIT;
  }

  return Math.max(1, Math.floor(limit));
}

function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) {
    throw new DOMException("Aborted", "AbortError");
  }
}

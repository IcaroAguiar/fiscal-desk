export const FISCAL_INGESTION_INPUT_FORMAT = {
  CSV: "csv",
} as const;

export type FiscalIngestionInputFormat =
  (typeof FISCAL_INGESTION_INPUT_FORMAT)[keyof typeof FISCAL_INGESTION_INPUT_FORMAT];

export type FiscalIngestionSourceFormat =
  | FiscalIngestionInputFormat
  | (string & {});

export const FISCAL_INGESTION_SOURCE_KIND = {
  LOCAL_FILE: "local_file",
  TEXT_BUFFER: "text_buffer",
} as const;

export type FiscalIngestionSourceKind =
  (typeof FISCAL_INGESTION_SOURCE_KIND)[keyof typeof FISCAL_INGESTION_SOURCE_KIND];

export const FISCAL_INGESTION_ISSUE_KIND = {
  DUPLICATE_CNPJ: "duplicate_cnpj",
  INVALID_CNPJ: "invalid_cnpj",
  MISSING_CNPJ_COLUMN: "missing_cnpj_column",
  UNSUPPORTED_INPUT_FORMAT: "unsupported_input_format",
} as const;

export type FiscalIngestionIssueKind =
  (typeof FISCAL_INGESTION_ISSUE_KIND)[keyof typeof FISCAL_INGESTION_ISSUE_KIND];

export const FISCAL_INGESTION_ISSUE_SEVERITY = {
  ERROR: "error",
  WARNING: "warning",
} as const;

export type FiscalIngestionIssueSeverity =
  (typeof FISCAL_INGESTION_ISSUE_SEVERITY)[keyof typeof FISCAL_INGESTION_ISSUE_SEVERITY];

export type FiscalIngestionSource = {
  format: FiscalIngestionSourceFormat;
  kind: FiscalIngestionSourceKind;
  label: string;
  receivedAt: string;
};

export type FiscalIngestionIssue = {
  cnpjNormalizado: string | null;
  cnpjOriginal: string | null;
  kind: FiscalIngestionIssueKind;
  message: string;
  rowNumber: number | null;
  severity: FiscalIngestionIssueSeverity;
};

export type FiscalIngestionEntry = {
  cnpjNormalizado: string;
  cnpjOriginal: string;
  row: Record<string, string>;
  rowNumber: number;
};

export type FiscalIngestionBatchSummary = {
  duplicateCnpjs: number;
  invalidRows: number;
  source: FiscalIngestionSource;
  totalRows: number;
  uniqueValidCnpjs: number;
  validRows: number;
};

export type FiscalIngestionBatch = {
  entries: FiscalIngestionEntry[];
  issues: FiscalIngestionIssue[];
  summary: FiscalIngestionBatchSummary;
};

export const FISCAL_INGESTION_BOUNDARY = {
  responsibility:
    "Normalize incoming source metadata, parsed rows and row-level issues before any provider lookup.",
  mustNotOwn:
    "Provider selection, lookup execution, output rendering, file saving, IPC or renderer copy.",
} as const;

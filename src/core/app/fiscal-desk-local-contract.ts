export const FISCAL_DESK_DISTRIBUTION_CHANNEL_STATE = {
  LOCAL_ONLY: "local_only",
  OFFICIAL_CHANNEL_PENDING: "official_channel_pending",
  OFFICIAL_UNSIGNED: "official_unsigned",
  OFFICIAL_SIGNED: "official_signed",
  THIRD_PARTY_BUILD: "third_party_build",
} as const;

export type FiscalDeskDistributionChannelState =
  (typeof FISCAL_DESK_DISTRIBUTION_CHANNEL_STATE)[keyof typeof FISCAL_DESK_DISTRIBUTION_CHANNEL_STATE];

export const FISCAL_DESK_UPDATE_CAPABILITY_STATE = {
  BLOCKED_NO_CHANNEL: "blocked_no_channel",
  BLOCKED_UNSIGNED: "blocked_unsigned",
  BLOCKED_MISSING_METADATA: "blocked_missing_metadata",
  BLOCKED_USER_DISABLED: "blocked_user_disabled",
  CHECK_AVAILABLE_MANUAL: "check_available_manual",
  ELIGIBLE_FUTURE_AUTOMATIC: "eligible_future_automatic",
} as const;

export type FiscalDeskUpdateCapabilityState =
  (typeof FISCAL_DESK_UPDATE_CAPABILITY_STATE)[keyof typeof FISCAL_DESK_UPDATE_CAPABILITY_STATE];

export const FISCAL_DESK_CONSENT_KEY = {
  TELEMETRY_BASIC_OPT_IN: "telemetry_basic_opt_in",
  DIAGNOSTIC_PACKAGE_MANUAL_SHARE: "diagnostic_package_manual_share",
  UPDATE_MANUAL_CHECK: "update_manual_check",
} as const;

export type FiscalDeskConsentKey =
  (typeof FISCAL_DESK_CONSENT_KEY)[keyof typeof FISCAL_DESK_CONSENT_KEY];

export const FISCAL_DESK_CONSENT_SOURCE = {
  USER_ACTION: "user_action",
  MIGRATION_DEFAULT_OFF: "migration_default_off",
} as const;

export type FiscalDeskConsentSource =
  (typeof FISCAL_DESK_CONSENT_SOURCE)[keyof typeof FISCAL_DESK_CONSENT_SOURCE];

export type FiscalDeskConsentState = {
  key: FiscalDeskConsentKey;
  granted: boolean;
  grantedAt: string | null;
  revokedAt: string | null;
  source: FiscalDeskConsentSource;
};

export const FISCAL_DESK_TELEMETRY_EVENT_CLASS = {
  APP_LIFECYCLE: "app_lifecycle",
  FEATURE_USAGE: "feature_usage",
  PERFORMANCE_SUMMARY: "performance_summary",
  ERROR_SUMMARY: "error_summary",
} as const;

export type FiscalDeskTelemetryEventClass =
  (typeof FISCAL_DESK_TELEMETRY_EVENT_CLASS)[keyof typeof FISCAL_DESK_TELEMETRY_EVENT_CLASS];

export const FISCAL_DESK_TELEMETRY_ALLOWED_FIELDS = {
  [FISCAL_DESK_TELEMETRY_EVENT_CLASS.APP_LIFECYCLE]: [
    "appVersion",
    "platform",
    "distributionChannelState",
    "updateCapabilityState",
    "offlineMode",
  ],
  [FISCAL_DESK_TELEMETRY_EVENT_CLASS.FEATURE_USAGE]: [
    "featureKey",
    "providerCategory",
    "action",
    "cancelled",
    "manualMode",
  ],
  [FISCAL_DESK_TELEMETRY_EVENT_CLASS.PERFORMANCE_SUMMARY]: [
    "durationMsBucket",
    "rowCountBucket",
    "providerCategory",
    "operation",
    "successCount",
    "failureCount",
  ],
  [FISCAL_DESK_TELEMETRY_EVENT_CLASS.ERROR_SUMMARY]: [
    "canonicalErrorCode",
    "boundary",
    "retryable",
    "providerCategory",
  ],
} as const satisfies Record<FiscalDeskTelemetryEventClass, readonly string[]>;

export type FiscalDeskTelemetryAllowedField =
  (typeof FISCAL_DESK_TELEMETRY_ALLOWED_FIELDS)[FiscalDeskTelemetryEventClass][number];

export const FISCAL_DESK_FORBIDDEN_DATA_CLASS = {
  CNPJ: "cnpj",
  DOCUMENT: "document",
  DOCUMENT_LIST: "document_list",
  COMPANY_NAME: "company_name",
  FISCAL_RESULT: "fiscal_result",
  CSV_CONTENT: "csv_content",
  XLSX_CONTENT: "xlsx_content",
  LOCAL_PATH: "local_path",
  RAW_HTML: "raw_html",
  SCREENSHOT: "screenshot",
  COOKIE: "cookie",
  TOKEN: "token",
  HEADER: "header",
  PROVIDER_RESPONSE: "provider_response",
  PERSISTENT_IDENTIFIER: "persistent_identifier",
} as const;

export type FiscalDeskForbiddenDataClass =
  (typeof FISCAL_DESK_FORBIDDEN_DATA_CLASS)[keyof typeof FISCAL_DESK_FORBIDDEN_DATA_CLASS];

export const FISCAL_DESK_DIAGNOSTIC_PACKAGE_POLICY = {
  LOCATION: "local_only",
  TRIGGER: "on_demand",
  REVIEW: "reviewable",
  SHARE: "manual_share_only",
  TELEMETRY_DEPENDENCY: "independent_from_telemetry",
} as const;

export type FiscalDeskDiagnosticPackagePolicy =
  typeof FISCAL_DESK_DIAGNOSTIC_PACKAGE_POLICY;

export const FISCAL_DESK_DIAGNOSTIC_ALLOWED_FIELDS = [
  "appVersion",
  "platform",
  "providerCategory",
  "roundedTimestamp",
  "aggregateCounters",
  "canonicalErrorCodes",
  "updateState",
  "consentState",
  "sanitizedLogs",
] as const;

export type FiscalDeskDiagnosticAllowedField =
  (typeof FISCAL_DESK_DIAGNOSTIC_ALLOWED_FIELDS)[number];

export const FISCAL_DESK_COMMERCIAL_BOUNDARY = {
  FUTURE_PRO_OPTIONAL: "future_pro_optional",
  MUST_NOT_BLOCK_EXISTING_DATA: "must_not_block_existing_data",
  MUST_NOT_BLOCK_HISTORY: "must_not_block_history",
  MUST_NOT_BLOCK_EXPORTS: "must_not_block_exports",
  MUST_NOT_BLOCK_BASIC_LOCAL_USE: "must_not_block_basic_local_use",
  MUST_PRESERVE_MOCK_OFFLINE: "must_preserve_mock_offline",
  MUST_KEEP_TELEMETRY_DEFAULT_OFF: "must_keep_telemetry_default_off",
  NO_MANDATORY_ONLINE_ACCOUNT: "no_mandatory_online_account",
} as const;

export type FiscalDeskCommercialBoundary =
  (typeof FISCAL_DESK_COMMERCIAL_BOUNDARY)[keyof typeof FISCAL_DESK_COMMERCIAL_BOUNDARY];

export const FISCAL_DESK_LOCAL_CONTRACT_BOUNDARY = {
  sideEffects: "none",
  storage: "none",
  network: "none",
  electron: "none",
  diagnosticGeneration: "none",
  telemetryTransport: "none",
  updater: "none",
} as const;

export const createFiscalDeskDefaultConsentState = (
  key: FiscalDeskConsentKey,
): FiscalDeskConsentState => ({
  granted: false,
  grantedAt: null,
  key,
  revokedAt: null,
  source: FISCAL_DESK_CONSENT_SOURCE.MIGRATION_DEFAULT_OFF,
});

export const isFiscalDeskTelemetryFieldAllowed = (
  eventClass: FiscalDeskTelemetryEventClass,
  fieldName: string,
): fieldName is FiscalDeskTelemetryAllowedField => {
  const allowedFields: readonly string[] =
    FISCAL_DESK_TELEMETRY_ALLOWED_FIELDS[eventClass];

  return allowedFields.includes(fieldName);
};

export const isFiscalDeskDiagnosticFieldAllowed = (
  fieldName: string,
): fieldName is FiscalDeskDiagnosticAllowedField => {
  return FISCAL_DESK_DIAGNOSTIC_ALLOWED_FIELDS.includes(
    fieldName as FiscalDeskDiagnosticAllowedField,
  );
};

export const isFiscalDeskForbiddenDataClass = (
  dataClass: string,
): dataClass is FiscalDeskForbiddenDataClass => {
  return Object.values(FISCAL_DESK_FORBIDDEN_DATA_CLASS).includes(
    dataClass as FiscalDeskForbiddenDataClass,
  );
};

export const isFiscalDeskDiagnosticManualShareOnly = (): boolean => {
  return FISCAL_DESK_DIAGNOSTIC_PACKAGE_POLICY.SHARE === "manual_share_only";
};

export const isFiscalDeskDiagnosticReviewable = (): boolean => {
  return FISCAL_DESK_DIAGNOSTIC_PACKAGE_POLICY.REVIEW === "reviewable";
};

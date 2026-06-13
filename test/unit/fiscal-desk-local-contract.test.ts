import { describe, expect, it } from "vitest";
import {
  createFiscalDeskDefaultConsentState,
  FISCAL_DESK_COMMERCIAL_BOUNDARY,
  FISCAL_DESK_CONSENT_KEY,
  FISCAL_DESK_CONSENT_SOURCE,
  FISCAL_DESK_DIAGNOSTIC_ALLOWED_FIELDS,
  FISCAL_DESK_DIAGNOSTIC_PACKAGE_POLICY,
  FISCAL_DESK_DISTRIBUTION_CHANNEL_STATE,
  FISCAL_DESK_FORBIDDEN_DATA_CLASS,
  FISCAL_DESK_LOCAL_CONTRACT_BOUNDARY,
  FISCAL_DESK_TELEMETRY_ALLOWED_FIELDS,
  FISCAL_DESK_TELEMETRY_EVENT_CLASS,
  FISCAL_DESK_UPDATE_CAPABILITY_STATE,
  type FiscalDeskConsentState,
  isFiscalDeskDiagnosticFieldAllowed,
  isFiscalDeskDiagnosticManualShareOnly,
  isFiscalDeskDiagnosticReviewable,
  isFiscalDeskForbiddenDataClass,
  isFiscalDeskTelemetryFieldAllowed,
} from "../../src/core/app/fiscal-desk-local-contract";

const forbiddenFieldProbes = [
  "cnpj",
  "currentCnpj",
  "document",
  "documento",
  "documents",
  "documentList",
  "razaoSocial",
  "nomeEmpresarial",
  "companyName",
  "simplesNacional",
  "simei",
  "fiscalResult",
  "csv",
  "csvContent",
  "xlsx",
  "xlsxContent",
  "path",
  "filePath",
  "sourceFilePath",
  "absolutePath",
  "html",
  "rawHtml",
  "screenshot",
  "cookie",
  "token",
  "authorization",
  "header",
  "headers",
  "providerResponse",
  "response",
  "payload",
  "machineId",
] as const;

describe("Fiscal Desk local contract", () => {
  it("centralizes distribution, update, consent and commercial names", () => {
    expect(Object.values(FISCAL_DESK_DISTRIBUTION_CHANNEL_STATE)).toEqual([
      "local_only",
      "official_channel_pending",
      "official_unsigned",
      "official_signed",
      "third_party_build",
    ]);
    expect(Object.values(FISCAL_DESK_UPDATE_CAPABILITY_STATE)).toEqual([
      "blocked_no_channel",
      "blocked_unsigned",
      "blocked_missing_metadata",
      "blocked_user_disabled",
      "check_available_manual",
      "eligible_future_automatic",
    ]);
    expect(Object.values(FISCAL_DESK_CONSENT_KEY)).toEqual([
      "telemetry_basic_opt_in",
      "diagnostic_package_manual_share",
      "update_manual_check",
    ]);
    expect(Object.values(FISCAL_DESK_COMMERCIAL_BOUNDARY)).toEqual([
      "future_pro_optional",
      "must_not_block_existing_data",
      "must_not_block_history",
      "must_not_block_exports",
      "must_not_block_basic_local_use",
      "must_preserve_mock_offline",
      "must_keep_telemetry_default_off",
      "no_mandatory_online_account",
    ]);
  });

  it("keeps consent default-off through migration defaults", () => {
    const consent = createFiscalDeskDefaultConsentState(
      FISCAL_DESK_CONSENT_KEY.TELEMETRY_BASIC_OPT_IN,
    ) satisfies FiscalDeskConsentState;

    expect(consent).toEqual({
      granted: false,
      grantedAt: null,
      key: FISCAL_DESK_CONSENT_KEY.TELEMETRY_BASIC_OPT_IN,
      revokedAt: null,
      source: FISCAL_DESK_CONSENT_SOURCE.MIGRATION_DEFAULT_OFF,
    });
  });

  it("keeps diagnostic consent per manual share action", () => {
    const consent = createFiscalDeskDefaultConsentState(
      FISCAL_DESK_CONSENT_KEY.DIAGNOSTIC_PACKAGE_MANUAL_SHARE,
    );

    expect(consent.granted).toBe(false);
    expect(consent.source).toBe(
      FISCAL_DESK_CONSENT_SOURCE.MIGRATION_DEFAULT_OFF,
    );
    expect(FISCAL_DESK_DIAGNOSTIC_PACKAGE_POLICY.TRIGGER).toBe("on_demand");
    expect(FISCAL_DESK_DIAGNOSTIC_PACKAGE_POLICY.SHARE).toBe(
      "manual_share_only",
    );
    expect(isFiscalDeskDiagnosticManualShareOnly()).toBe(true);
    expect(isFiscalDeskDiagnosticReviewable()).toBe(true);
  });

  it("uses positive telemetry allowlists without fiscal or local identifiers", () => {
    expect(FISCAL_DESK_TELEMETRY_ALLOWED_FIELDS).toEqual({
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
    });

    const allowedTelemetryFields = Object.values(
      FISCAL_DESK_TELEMETRY_ALLOWED_FIELDS,
    ).flat();

    for (const forbiddenField of forbiddenFieldProbes) {
      expect(allowedTelemetryFields).not.toContain(forbiddenField);
      expect(
        isFiscalDeskTelemetryFieldAllowed(
          FISCAL_DESK_TELEMETRY_EVENT_CLASS.ERROR_SUMMARY,
          forbiddenField,
        ),
      ).toBe(false);
    }
  });

  it("uses a positive diagnostic allowlist and forbids raw user data", () => {
    expect(FISCAL_DESK_DIAGNOSTIC_ALLOWED_FIELDS).toEqual([
      "appVersion",
      "platform",
      "providerCategory",
      "roundedTimestamp",
      "aggregateCounters",
      "canonicalErrorCodes",
      "updateState",
      "consentState",
      "sanitizedLogs",
    ]);

    for (const forbiddenField of forbiddenFieldProbes) {
      expect(FISCAL_DESK_DIAGNOSTIC_ALLOWED_FIELDS).not.toContain(
        forbiddenField,
      );
      expect(isFiscalDeskDiagnosticFieldAllowed(forbiddenField)).toBe(false);
    }
  });

  it("documents forbidden data classes shared by telemetry and diagnostic policy", () => {
    expect(Object.values(FISCAL_DESK_FORBIDDEN_DATA_CLASS)).toEqual([
      "cnpj",
      "document",
      "document_list",
      "company_name",
      "fiscal_result",
      "csv_content",
      "xlsx_content",
      "local_path",
      "raw_html",
      "screenshot",
      "cookie",
      "token",
      "header",
      "provider_response",
      "persistent_identifier",
    ]);
    expect(isFiscalDeskForbiddenDataClass("cnpj")).toBe(true);
    expect(isFiscalDeskForbiddenDataClass("provider_response")).toBe(true);
    expect(isFiscalDeskForbiddenDataClass("appVersion")).toBe(false);
  });

  it("is pure local contract metadata with no side-effect capability", () => {
    expect(FISCAL_DESK_LOCAL_CONTRACT_BOUNDARY).toEqual({
      sideEffects: "none",
      storage: "none",
      network: "none",
      electron: "none",
      diagnosticGeneration: "none",
      telemetryTransport: "none",
      updater: "none",
    });
  });
});

import type {
  SimplesLookupResult,
  SimplesLookupStatus,
} from "../../simples-lookup.types";

export const RECEITA_WEB_SOURCE = "receita-web";

export const RECEITA_WEB_DIAGNOSTIC_CODE = {
  BROWSER_UNAVAILABLE: "browser_unavailable",
  CAPTCHA_REQUIRED: "captcha_required",
  FILL_FAILED: "fill_failed",
  INVALID_CNPJ: "invalid_cnpj",
  NAVIGATION_FAILED: "navigation_failed",
  NOT_FOUND: "not_found",
  PORTAL_BLOCKED: "portal_blocked",
  RESULT_SUCCESS: "result_success",
  SUBMIT_FAILED: "submit_failed",
  TEMPORARY_ERROR: "temporary_error",
  UNPARSABLE_RESULT: "unparsable_result",
  WAIT_RESULT_FAILED: "wait_result_failed",
} as const;

export type ReceitaWebDiagnosticCode =
  (typeof RECEITA_WEB_DIAGNOSTIC_CODE)[keyof typeof RECEITA_WEB_DIAGNOSTIC_CODE];

export type ReceitaWebDiagnostic = {
  provider: typeof RECEITA_WEB_SOURCE;
  code: ReceitaWebDiagnosticCode;
  assisted: true;
  experimental: true;
  visibleBrowserRequired: true;
  containsRawHtml: false;
  containsCnpj: false;
  htmlLength?: number;
  hasCaptcha?: boolean;
  hasError?: boolean;
  hasResult?: boolean;
};

export type ReceitaWebResultInput = {
  cnpj: string;
  status: SimplesLookupStatus;
  simplesNacional?: boolean | null;
  simei?: boolean | null;
  message?: string;
  diagnostic: ReceitaWebDiagnostic;
};

export type ReceitaWebDiagnosticInput = {
  code: ReceitaWebDiagnosticCode;
  htmlLength?: number;
  hasCaptcha?: boolean;
  hasError?: boolean;
  hasResult?: boolean;
};

export function createReceitaWebDiagnostic(
  input: ReceitaWebDiagnosticInput,
): ReceitaWebDiagnostic {
  const diagnostic: ReceitaWebDiagnostic = {
    provider: RECEITA_WEB_SOURCE,
    code: input.code,
    assisted: true,
    experimental: true,
    visibleBrowserRequired: true,
    containsRawHtml: false,
    containsCnpj: false,
  };

  if (input.htmlLength !== undefined) {
    diagnostic.htmlLength = input.htmlLength;
  }

  if (input.hasCaptcha !== undefined) {
    diagnostic.hasCaptcha = input.hasCaptcha;
  }

  if (input.hasError !== undefined) {
    diagnostic.hasError = input.hasError;
  }

  if (input.hasResult !== undefined) {
    diagnostic.hasResult = input.hasResult;
  }

  return diagnostic;
}

export function createReceitaWebResult(
  input: ReceitaWebResultInput,
): SimplesLookupResult {
  const result: SimplesLookupResult = {
    cnpj: input.cnpj,
    simplesNacional: input.simplesNacional ?? null,
    simei: input.simei ?? null,
    source: RECEITA_WEB_SOURCE,
    status: input.status,
    raw: input.diagnostic,
  };

  if (input.message !== undefined) {
    result.message = input.message;
  }

  return result;
}

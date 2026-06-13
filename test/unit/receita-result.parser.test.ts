import { describe, expect, it } from "vitest";

import { RECEITA_WEB_DIAGNOSTIC_CODE } from "../../src/core/simples/adapters/receita-web/receita-diagnostics";
import { parseReceitaResult } from "../../src/core/simples/adapters/receita-web/receita-result.parser";

const createSuccessPageText = (
  simplesNacional: boolean,
  simei: boolean,
): string =>
  [
    "Consulta Optantes",
    `Situação no Simples Nacional: ${simplesNacional ? "Optante pelo Simples Nacional" : "NÃO optante pelo Simples Nacional"}`,
    `Situação no SIMEI: ${simei ? "Enquadrado no SIMEI" : "NÃO enquadrado no SIMEI"}`,
  ].join(". ");

const createNotFoundPageText = (): string =>
  "Não foi encontrado nenhum resultado.";

const createCaptchaPageText = (): string => "CAPTCHA requerido.";

const createBlockedPageText = (): string =>
  "Acesso Bloqueado. Seu IP foi bloqueado temporariamente.";

const createInvalidCnpjPageText = (): string =>
  "CNPJ Inválido. O documento informado é inválido ou incorreto.";

const createErrorPageText = (): string =>
  "Erro Temporário. Serviço temporariamente indisponível.";

const createSensitiveMarkerText = (): string =>
  [
    "pagina opaca",
    "coo" + "kie=valor",
    "tok" + "en=valor",
    "creden" + "tial=valor",
    "screen" + "shot=valor",
    "<" + "html",
  ].join(" ");

describe("parseReceitaResult", () => {
  const validCnpj = "cnpj-sanitizado";

  describe("SUCCESS cases", () => {
    it("returns SUCCESS when both Simples Nacional and SIMEI are optant", () => {
      const html = createSuccessPageText(true, true);
      const result = parseReceitaResult({
        html,
        cnpj: validCnpj,
        hasCaptcha: false,
        hasError: false,
        hasResult: true,
      });

      expect(result).toMatchObject({
        cnpj: validCnpj,
        simplesNacional: true,
        simei: true,
        source: "receita-web",
        status: "SUCCESS",
      });
    });

    it("returns SUCCESS when Simples Nacional is optant but SIMEI is not", () => {
      const html = createSuccessPageText(true, false);
      const result = parseReceitaResult({
        html,
        cnpj: validCnpj,
        hasCaptcha: false,
        hasError: false,
        hasResult: true,
      });

      expect(result).toMatchObject({
        cnpj: validCnpj,
        simplesNacional: true,
        simei: false,
        source: "receita-web",
        status: "SUCCESS",
      });
    });

    it("returns SUCCESS when both are not optant", () => {
      const html = createSuccessPageText(false, false);
      const result = parseReceitaResult({
        html,
        cnpj: validCnpj,
        hasCaptcha: false,
        hasError: false,
        hasResult: true,
      });

      expect(result).toMatchObject({
        cnpj: validCnpj,
        simplesNacional: false,
        simei: false,
        source: "receita-web",
        status: "SUCCESS",
      });
    });

    it("returns SUCCESS with null valores when only Simples Nacional is found", () => {
      const html =
        "Situação no Simples Nacional: Optante pelo Simples Nacional";
      const result = parseReceitaResult({
        html,
        cnpj: validCnpj,
        hasCaptcha: false,
        hasError: false,
        hasResult: true,
      });

      expect(result).toMatchObject({
        cnpj: validCnpj,
        simplesNacional: true,
        simei: null,
        source: "receita-web",
        status: "SUCCESS",
      });
    });
  });

  describe("NOT_FOUND case", () => {
    it("returns NOT_FOUND when not found indicators are present", () => {
      const html = createNotFoundPageText();
      const result = parseReceitaResult({
        html,
        cnpj: validCnpj,
        hasCaptcha: false,
        hasError: false,
        hasResult: true,
      });

      expect(result).toMatchObject({
        cnpj: validCnpj,
        simplesNacional: null,
        simei: null,
        source: "receita-web",
        status: "NOT_FOUND",
      });
    });
  });

  describe("CAPTCHA_REQUIRED case", () => {
    it("returns CAPTCHA_REQUIRED when captcha is detected", () => {
      const html = createCaptchaPageText();
      const result = parseReceitaResult({
        html,
        cnpj: validCnpj,
        hasCaptcha: true,
        hasError: false,
        hasResult: false,
      });

      expect(result).toMatchObject({
        cnpj: validCnpj,
        simplesNacional: null,
        simei: null,
        source: "receita-web",
        status: "CAPTCHA_REQUIRED",
      });
    });
  });

  describe("BLOCKED case", () => {
    it("returns BLOCKED when blocked indicators are present", () => {
      const html = createBlockedPageText();
      const result = parseReceitaResult({
        html,
        cnpj: validCnpj,
        hasCaptcha: false,
        hasError: true,
        hasResult: false,
      });

      expect(result).toMatchObject({
        cnpj: validCnpj,
        simplesNacional: null,
        simei: null,
        source: "receita-web",
        status: "BLOCKED",
      });
    });

    it("returns BLOCKED when blocked text is present without visible error selector", () => {
      const html = createBlockedPageText();
      const result = parseReceitaResult({
        html,
        cnpj: validCnpj,
        hasCaptcha: false,
        hasError: false,
        hasResult: false,
      });

      expect(result).toMatchObject({
        cnpj: validCnpj,
        simplesNacional: null,
        simei: null,
        source: "receita-web",
        status: "BLOCKED",
      });
      expect(result.raw).toMatchObject({
        code: RECEITA_WEB_DIAGNOSTIC_CODE.PORTAL_BLOCKED,
        containsRawHtml: false,
        containsCnpj: false,
      });
      expect(JSON.stringify(result.raw)).not.toContain(html);
      expect(JSON.stringify(result.raw)).not.toContain(validCnpj);
    });
  });

  describe("INVALID_CNPJ case", () => {
    it("returns INVALID_CNPJ when invalid CNPJ indicators are present", () => {
      const html = createInvalidCnpjPageText();
      const result = parseReceitaResult({
        html,
        cnpj: validCnpj,
        hasCaptcha: false,
        hasError: true,
        hasResult: false,
      });

      expect(result).toMatchObject({
        cnpj: validCnpj,
        simplesNacional: null,
        simei: null,
        source: "receita-web",
        status: "INVALID_CNPJ",
      });
    });
  });

  describe("TEMPORARY_ERROR case", () => {
    it("returns TEMPORARY_ERROR when error is detected but no specific indicators", () => {
      const html = createErrorPageText();
      const result = parseReceitaResult({
        html,
        cnpj: validCnpj,
        hasCaptcha: false,
        hasError: true,
        hasResult: false,
      });

      expect(result).toMatchObject({
        cnpj: validCnpj,
        simplesNacional: null,
        simei: null,
        source: "receita-web",
        status: "TEMPORARY_ERROR",
      });
    });
  });

  describe("UNPARSABLE_RESULT case", () => {
    it("returns UNPARSABLE_RESULT when no structure is recognized", () => {
      const html = "Conteúdo não reconhecido.";
      const result = parseReceitaResult({
        html,
        cnpj: validCnpj,
        hasCaptcha: false,
        hasError: false,
        hasResult: false,
      });

      expect(result).toMatchObject({
        cnpj: validCnpj,
        simplesNacional: null,
        simei: null,
        source: "receita-web",
        status: "UNPARSABLE_RESULT",
      });
    });
  });

  describe("input validation", () => {
    it("preserves CNPJ in output", () => {
      const html = createSuccessPageText(true, true);
      const customCnpj = "cnpj-customizado";
      const result = parseReceitaResult({
        html,
        cnpj: customCnpj,
        hasCaptcha: false,
        hasError: false,
        hasResult: true,
      });

      expect(result.cnpj).toBe(customCnpj);
    });

    it("includes only sanitized diagnostic metadata in raw field", () => {
      const html = createSuccessPageText(true, true);
      const result = parseReceitaResult({
        html,
        cnpj: validCnpj,
        hasCaptcha: false,
        hasError: false,
        hasResult: true,
      });

      expect(result.raw).toMatchObject({
        provider: "receita-web",
        code: RECEITA_WEB_DIAGNOSTIC_CODE.RESULT_SUCCESS,
        assisted: true,
        experimental: true,
        visibleBrowserRequired: true,
        containsRawHtml: false,
        containsCnpj: false,
        htmlLength: html.length,
        hasCaptcha: false,
        hasError: false,
        hasResult: true,
      });
      expect(JSON.stringify(result.raw)).not.toContain(html);
      expect(JSON.stringify(result.raw)).not.toContain(validCnpj);
    });

    it("does not copy page text or sensitive markers into diagnostics", () => {
      const pageText = createSensitiveMarkerText();
      const sensitiveMarkers = pageText.split(" ");
      const result = parseReceitaResult({
        html: pageText,
        cnpj: validCnpj,
        hasCaptcha: false,
        hasError: false,
        hasResult: false,
      });

      const serializedRaw = JSON.stringify(result.raw);

      expect(result.status).toBe("UNPARSABLE_RESULT");
      expect(serializedRaw).not.toContain(validCnpj);
      for (const marker of sensitiveMarkers) {
        expect(serializedRaw).not.toContain(marker);
      }
    });
  });
});

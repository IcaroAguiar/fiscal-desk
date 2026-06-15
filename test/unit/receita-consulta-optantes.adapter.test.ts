import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ReceitaBrowserClient } from "../../src/core/simples/adapters/receita-web/receita-browser.client";
import { ReceitaConsultaOptantesAdapter } from "../../src/core/simples/adapters/receita-web/receita-consulta-optantes.adapter";
import { RECEITA_WEB_DIAGNOSTIC_CODE } from "../../src/core/simples/adapters/receita-web/receita-diagnostics";

vi.mock(
  "../../src/core/simples/adapters/receita-web/receita-browser.client",
  () => ({
    ReceitaBrowserClient: vi.fn(),
  }),
);

const ReceitaBrowserClientMock = vi.mocked(ReceitaBrowserClient);
const TEST_LOOKUP_ID = "cnpj-sanitizado";
const EMPTY_PAGE_TEXT = "pagina sem resultado";
const SENSITIVE_BROWSER_ERROR = [
  "browserType.launch failed",
  TEST_LOOKUP_ID,
  "pagina sensivel",
  "coo" + "kie=valor",
  "tok" + "en=valor",
  "creden" + "tial=valor",
  "screen" + "shot=valor",
  "<" + "html",
].join(" ");

type MockClient = {
  connect: ReturnType<typeof vi.fn>;
  disconnect: ReturnType<typeof vi.fn>;
  navigate: ReturnType<typeof vi.fn>;
  fillCnpj: ReturnType<typeof vi.fn>;
  submit: ReturnType<typeof vi.fn>;
  waitResult: ReturnType<typeof vi.fn>;
  waitForManualCaptchaResolution: ReturnType<typeof vi.fn>;
  hasCaptcha: ReturnType<typeof vi.fn>;
  hasError: ReturnType<typeof vi.fn>;
  hasResult: ReturnType<typeof vi.fn>;
};

function createMockClient(): MockClient {
  return {
    connect: vi.fn().mockResolvedValue(undefined),
    disconnect: vi.fn().mockResolvedValue(undefined),
    navigate: vi
      .fn()
      .mockResolvedValue({ success: true, html: EMPTY_PAGE_TEXT }),
    fillCnpj: vi
      .fn()
      .mockResolvedValue({ success: true, html: EMPTY_PAGE_TEXT }),
    submit: vi.fn().mockResolvedValue({ success: true, html: EMPTY_PAGE_TEXT }),
    waitResult: vi
      .fn()
      .mockResolvedValue({ success: true, html: EMPTY_PAGE_TEXT }),
    waitForManualCaptchaResolution: vi
      .fn()
      .mockResolvedValue({ success: true, html: EMPTY_PAGE_TEXT }),
    hasCaptcha: vi.fn().mockResolvedValue(false),
    hasError: vi.fn().mockResolvedValue(false),
    hasResult: vi.fn().mockResolvedValue(true),
  };
}

describe("ReceitaConsultaOptantesAdapter", () => {
  let mockClient: MockClient;

  beforeEach(() => {
    mockClient = createMockClient();
    ReceitaBrowserClientMock.mockImplementation(
      () => mockClient as unknown as ReceitaBrowserClient,
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("implements SimplesLookupPort", () => {
    const adapter = new ReceitaConsultaOptantesAdapter();
    expect(typeof adapter.lookup).toBe("function");
  });

  it("creates the browser client in assisted mode", async () => {
    const adapter = new ReceitaConsultaOptantesAdapter();

    await adapter.lookup(TEST_LOOKUP_ID);

    expect(ReceitaBrowserClientMock).toHaveBeenCalledWith({
      headless: false,
    });
  });

  it("calls browser lifecycle methods in correct order", async () => {
    const adapter = new ReceitaConsultaOptantesAdapter();

    await adapter.lookup(TEST_LOOKUP_ID);

    expect(mockClient.connect).toHaveBeenCalled();
    expect(mockClient.navigate).toHaveBeenCalled();
    expect(mockClient.fillCnpj).toHaveBeenCalledWith(TEST_LOOKUP_ID, undefined);
    expect(mockClient.submit).toHaveBeenCalled();
    expect(mockClient.waitResult).toHaveBeenCalled();
    expect(mockClient.disconnect).toHaveBeenCalled();
  });

  it("disconnects browser even when navigation fails", async () => {
    mockClient.navigate.mockResolvedValue({
      success: false,
      html: "",
      error: "Connection failed",
    });

    const adapter = new ReceitaConsultaOptantesAdapter();

    await adapter.lookup(TEST_LOOKUP_ID);

    expect(mockClient.disconnect).toHaveBeenCalled();
  });

  it("disconnects browser even when fillCnpj fails", async () => {
    mockClient.fillCnpj.mockResolvedValue({
      success: false,
      html: "",
      error: "Input not found",
    });

    const adapter = new ReceitaConsultaOptantesAdapter();

    await adapter.lookup(TEST_LOOKUP_ID);

    expect(mockClient.disconnect).toHaveBeenCalled();
  });

  it("disconnects browser even when submit fails", async () => {
    mockClient.submit.mockResolvedValue({
      success: false,
      html: "",
      error: "Button not found",
    });

    const adapter = new ReceitaConsultaOptantesAdapter();

    await adapter.lookup(TEST_LOOKUP_ID);

    expect(mockClient.disconnect).toHaveBeenCalled();
  });

  it("disconnects browser even when waitResult fails", async () => {
    mockClient.waitResult.mockResolvedValue({
      success: false,
      html: "",
      error: "Timeout",
    });

    const adapter = new ReceitaConsultaOptantesAdapter();

    await adapter.lookup(TEST_LOOKUP_ID);

    expect(mockClient.disconnect).toHaveBeenCalled();
  });

  it("returns TEMPORARY_ERROR when navigation fails", async () => {
    mockClient.navigate.mockResolvedValue({
      success: false,
      html: "",
      error: `Connection refused for ${TEST_LOOKUP_ID}`,
    });

    const adapter = new ReceitaConsultaOptantesAdapter();

    const result = await adapter.lookup(TEST_LOOKUP_ID);

    expect(result.status).toBe("TEMPORARY_ERROR");
    expect(result.message).toBe(
      "Falha ao navegar para a página da Receita Web assistida",
    );
    expect(result.source).toBe("receita-web");
    expect(result.raw).toMatchObject({
      code: RECEITA_WEB_DIAGNOSTIC_CODE.NAVIGATION_FAILED,
      containsRawHtml: false,
      containsCnpj: false,
    });
    expect(JSON.stringify(result.raw)).not.toContain(TEST_LOOKUP_ID);
  });

  it("returns TEMPORARY_ERROR when fillCnpj fails", async () => {
    mockClient.fillCnpj.mockResolvedValue({
      success: false,
      html: "",
      error: "Input not found",
    });

    const adapter = new ReceitaConsultaOptantesAdapter();

    const result = await adapter.lookup(TEST_LOOKUP_ID);

    expect(result.status).toBe("TEMPORARY_ERROR");
    expect(result.message).toBe(
      "Falha ao preencher o CNPJ no navegador assistido",
    );
  });

  it("returns TEMPORARY_ERROR when submit fails", async () => {
    mockClient.submit.mockResolvedValue({
      success: false,
      html: "",
      error: "Submit failed",
    });

    const adapter = new ReceitaConsultaOptantesAdapter();

    const result = await adapter.lookup(TEST_LOOKUP_ID);

    expect(result.status).toBe("TEMPORARY_ERROR");
    expect(result.message).toBe(
      "Falha ao submeter a consulta no navegador assistido",
    );
  });

  it("returns TEMPORARY_ERROR when waitResult fails", async () => {
    mockClient.waitResult.mockResolvedValue({
      success: false,
      html: "",
      error: "Timeout waiting",
    });

    const adapter = new ReceitaConsultaOptantesAdapter();

    const result = await adapter.lookup(TEST_LOOKUP_ID);

    expect(result.status).toBe("TEMPORARY_ERROR");
    expect(result.message).toBe(
      "Falha ao aguardar o resultado da Receita Web assistida",
    );
  });

  it("returns TEMPORARY_ERROR when page inspection fails after waitResult", async () => {
    mockClient.hasCaptcha.mockRejectedValue(new Error("DOM inspection failed"));

    const adapter = new ReceitaConsultaOptantesAdapter();

    const result = await adapter.lookup("12345678000195");

    expect(result.status).toBe("TEMPORARY_ERROR");
    expect(result.source).toBe("receita-web");
    expect(result.message).toBe("DOM inspection failed");
  });

  it("returns CANCELLED when browser flow aborts with AbortError", async () => {
    mockClient.connect.mockRejectedValue(
      new DOMException("Aborted", "AbortError"),
    );

    const adapter = new ReceitaConsultaOptantesAdapter();

    const result = await adapter.lookup(TEST_LOOKUP_ID);

    expect(result.status).toBe("CANCELLED");
    expect(result.source).toBe("system");
    expect(result.message).toContain("cancelado");
  });

  it("returns sanitized browser unavailable result when launch fails", async () => {
    mockClient.connect.mockRejectedValue(new Error(SENSITIVE_BROWSER_ERROR));

    const adapter = new ReceitaConsultaOptantesAdapter();

    const result = await adapter.lookup(TEST_LOOKUP_ID);
    const serializedResult = JSON.stringify({
      message: result.message,
      raw: result.raw,
    });

    expect(result.status).toBe("TEMPORARY_ERROR");
    expect(result.source).toBe("receita-web");
    expect(result.raw).toMatchObject({
      code: RECEITA_WEB_DIAGNOSTIC_CODE.BROWSER_UNAVAILABLE,
      containsRawHtml: false,
      containsCnpj: false,
    });
    expect(serializedResult).not.toContain(SENSITIVE_BROWSER_ERROR);
    expect(serializedResult).not.toContain(TEST_LOOKUP_ID);
    for (const marker of SENSITIVE_BROWSER_ERROR.split(" ")) {
      expect(serializedResult).not.toContain(marker);
    }
  });

  it("uses abort signal in all browser calls", async () => {
    const controller = new AbortController();
    const signal = controller.signal;

    const adapter = new ReceitaConsultaOptantesAdapter();

    await adapter.lookup(TEST_LOOKUP_ID, { signal });

    expect(mockClient.connect).toHaveBeenCalledWith(signal);
    expect(mockClient.navigate).toHaveBeenCalledWith(signal);
    expect(mockClient.fillCnpj).toHaveBeenCalledWith(TEST_LOOKUP_ID, signal);
    expect(mockClient.submit).toHaveBeenCalledWith(signal);
    expect(mockClient.waitResult).toHaveBeenCalledWith(signal);
    expect(mockClient.waitForManualCaptchaResolution).not.toHaveBeenCalled();
    expect(mockClient.hasCaptcha).toHaveBeenCalledWith(signal);
    expect(mockClient.hasError).toHaveBeenCalledWith(signal);
    expect(mockClient.hasResult).toHaveBeenCalledWith(signal);
  });

  it("calls parser with correct parameters", async () => {
    const testPageText = "Optante pelo Simples Nacional";
    mockClient.waitResult.mockResolvedValue({
      success: true,
      html: testPageText,
    });
    mockClient.hasCaptcha.mockResolvedValue(false);
    mockClient.hasError.mockResolvedValue(false);
    mockClient.hasResult.mockResolvedValue(true);

    const adapter = new ReceitaConsultaOptantesAdapter();

    const result = await adapter.lookup(TEST_LOOKUP_ID);

    expect(mockClient.hasCaptcha).toHaveBeenCalled();
    expect(mockClient.hasError).toHaveBeenCalled();
    expect(mockClient.hasResult).toHaveBeenCalled();
    expect(result.source).toBe("receita-web");
    expect(result.cnpj).toBe(TEST_LOOKUP_ID);
  });

  it("returns CAPTCHA_REQUIRED when captcha is detected", async () => {
    mockClient.hasCaptcha.mockResolvedValue(true);
    mockClient.hasResult.mockResolvedValue(false);

    const adapter = new ReceitaConsultaOptantesAdapter();

    const result = await adapter.lookup(TEST_LOOKUP_ID);

    expect(mockClient.waitForManualCaptchaResolution).toHaveBeenCalled();
    expect(result.status).toBe("CAPTCHA_REQUIRED");
    expect(result.message).toContain("CAPTCHA");
  });

  it("continues after the user manually resolves Receita Web CAPTCHA", async () => {
    const successPageText =
      "Situação no Simples Nacional: Optante pelo Simples Nacional. Situação no SIMEI: NÃO enquadrado no SIMEI.";
    mockClient.hasCaptcha.mockResolvedValue(true);
    mockClient.hasResult
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true);
    mockClient.waitForManualCaptchaResolution.mockResolvedValue({
      success: true,
      html: successPageText,
    });

    const adapter = new ReceitaConsultaOptantesAdapter();

    const result = await adapter.lookup(TEST_LOOKUP_ID);

    expect(mockClient.waitForManualCaptchaResolution).toHaveBeenCalledWith(
      undefined,
    );
    expect(result.status).toBe("SUCCESS");
    expect(result.simplesNacional).toBe(true);
  });

  it("returns SUCCESS when result is parsed successfully (optante)", async () => {
    const successPageText =
      "Situação no Simples Nacional: Optante pelo Simples Nacional. Situação no SIMEI: NÃO enquadrado no SIMEI.";
    mockClient.waitResult.mockResolvedValue({
      success: true,
      html: successPageText,
    });
    mockClient.hasCaptcha.mockResolvedValue(false);
    mockClient.hasError.mockResolvedValue(false);
    mockClient.hasResult.mockResolvedValue(true);

    const adapter = new ReceitaConsultaOptantesAdapter();

    const result = await adapter.lookup(TEST_LOOKUP_ID);

    expect(result.status).toBe("SUCCESS");
    expect(result.simplesNacional).toBe(true);
    expect(result.simei).toBe(false);
  });

  it("returns SUCCESS when result is parsed successfully (não optante)", async () => {
    const notOptantePageText =
      "Situação no Simples Nacional: NÃO optante pelo Simples Nacional. Situação no SIMEI: NÃO enquadrado no SIMEI.";
    mockClient.waitResult.mockResolvedValue({
      success: true,
      html: notOptantePageText,
    });
    mockClient.hasCaptcha.mockResolvedValue(false);
    mockClient.hasError.mockResolvedValue(false);
    mockClient.hasResult.mockResolvedValue(true);

    const adapter = new ReceitaConsultaOptantesAdapter();

    const result = await adapter.lookup(TEST_LOOKUP_ID);

    expect(result.status).toBe("SUCCESS");
    expect(result.simplesNacional).toBe(false);
    expect(result.simei).toBe(false);
  });

  it("returns NOT_FOUND when not found message is present", async () => {
    const notFoundPageText = "Não foi encontrado nenhum resultado.";
    mockClient.waitResult.mockResolvedValue({
      success: true,
      html: notFoundPageText,
    });
    mockClient.hasCaptcha.mockResolvedValue(false);
    mockClient.hasError.mockResolvedValue(false);
    mockClient.hasResult.mockResolvedValue(true);

    const adapter = new ReceitaConsultaOptantesAdapter();

    const result = await adapter.lookup(TEST_LOOKUP_ID);

    expect(result.status).toBe("NOT_FOUND");
  });
});

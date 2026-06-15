import { chromium } from "playwright";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ReceitaBrowserClient } from "../../src/core/simples/adapters/receita-web/receita-browser.client";

vi.mock("playwright", () => ({
  chromium: {
    launch: vi.fn(),
  },
}));

const mockPage = {
  goto: vi.fn(),
  content: vi.fn(),
  $: vi.fn(),
  $$: vi.fn(),
  close: vi.fn(),
  context: vi.fn(() => mockContext),
  waitForTimeout: vi.fn(),
  waitForSelector: vi.fn(),
  waitForFunction: vi.fn(),
  textContent: vi.fn(),
};

const mockContext = {
  newPage: vi.fn(),
  browser: vi.fn(),
  close: vi.fn(),
};

const mockBrowser = {
  newContext: vi.fn(),
  close: vi.fn(),
};

const SUBMITTED_PAGE_TEXT = "pagina simbolica submetida";
const RESULT_PAGE_TEXT = "pagina simbolica com resultado";

describe("ReceitaBrowserClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockBrowser.newContext.mockResolvedValue(mockContext);
    mockContext.newPage.mockResolvedValue(mockPage);
    mockContext.browser.mockReturnValue(mockBrowser);
    mockContext.close.mockResolvedValue(undefined);
    mockPage.close.mockResolvedValue(undefined);
    mockBrowser.close.mockResolvedValue(undefined);
    vi.mocked(chromium.launch).mockResolvedValue(
      mockBrowser as unknown as Awaited<ReturnType<typeof chromium.launch>>,
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("submit", () => {
    it("clicks submit button and returns html", async () => {
      const mockSubmitButton = {
        click: vi.fn().mockResolvedValue(undefined),
      };

      mockPage.$.mockResolvedValue(mockSubmitButton);
      mockPage.content.mockResolvedValue(SUBMITTED_PAGE_TEXT);

      const client = new ReceitaBrowserClient();
      await client.connect();

      const result = await client.submit();

      expect(result.success).toBe(true);
      expect(result.html).toBe(SUBMITTED_PAGE_TEXT);
      expect(mockSubmitButton.click).toHaveBeenCalledTimes(1);
    });

    it("presses Enter when submit button not found", async () => {
      const mockInputElement = {
        press: vi.fn().mockResolvedValue(undefined),
      };

      mockPage.$.mockResolvedValueOnce(null); // submit button not found
      mockPage.$.mockResolvedValueOnce(mockInputElement); // CNPJ input
      mockPage.content.mockResolvedValue(SUBMITTED_PAGE_TEXT);

      const client = new ReceitaBrowserClient();
      await client.connect();

      const result = await client.submit();

      expect(result.success).toBe(true);
      expect(mockInputElement.press).toHaveBeenCalledWith("Enter");
    });

    it("returns error when browser not connected", async () => {
      const client = new ReceitaBrowserClient();

      const result = await client.submit();

      expect(result.success).toBe(false);
      expect(result.error).toBe("browser_not_connected");
    });

    it("throws AbortError when signal aborted during submit", async () => {
      const client = new ReceitaBrowserClient();
      await client.connect();

      const controller = new AbortController();
      controller.abort();

      await expect(client.submit(controller.signal)).rejects.toThrow("Aborted");
    });
  });

  describe("waitResult", () => {
    it("waits for result and returns html", async () => {
      mockPage.waitForTimeout.mockResolvedValue(undefined);
      mockPage.waitForFunction.mockResolvedValue(undefined);
      mockPage.content.mockResolvedValue(RESULT_PAGE_TEXT);

      const client = new ReceitaBrowserClient();
      await client.connect();

      const result = await client.waitResult();

      expect(result.success).toBe(true);
      expect(result.html).toBe(RESULT_PAGE_TEXT);
    });

    it("throws AbortError when signal aborted during waitResult", async () => {
      mockPage.waitForTimeout.mockImplementation(
        () => new Promise<void>(() => {}),
      );

      const client = new ReceitaBrowserClient();
      await client.connect();

      const controller = new AbortController();
      const waitPromise = client.waitResult(controller.signal);
      controller.abort();

      await expect(waitPromise).rejects.toThrow("Aborted");
    });

    it("handles result wait timeout without unhandled rejection when abortable", async () => {
      const unhandledRejections: unknown[] = [];
      const onUnhandledRejection = (reason: unknown) => {
        unhandledRejections.push(reason);
      };

      mockPage.waitForTimeout.mockResolvedValue(undefined);
      mockPage.waitForFunction.mockRejectedValue(
        new Error("Timeout 30000ms exceeded"),
      );
      mockPage.content.mockResolvedValue(RESULT_PAGE_TEXT);

      const client = new ReceitaBrowserClient();
      await client.connect();

      const controller = new AbortController();
      process.on("unhandledRejection", onUnhandledRejection);

      try {
        const result = await client.waitResult(controller.signal);
        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(result.success).toBe(true);
        expect(result.html).toBe(RESULT_PAGE_TEXT);
        expect(unhandledRejections).toEqual([]);
      } finally {
        process.off("unhandledRejection", onUnhandledRejection);
      }
    });
  });

  describe("hasCaptcha", () => {
    it("returns true when captcha elements found", async () => {
      mockPage.$$.mockResolvedValue([{ type: "captcha" }]);

      const client = new ReceitaBrowserClient();
      await client.connect();

      const result = await client.hasCaptcha();

      expect(result).toBe(true);
    });

    it("returns false when no captcha elements", async () => {
      mockPage.$$.mockResolvedValue([]);

      const client = new ReceitaBrowserClient();
      await client.connect();

      const result = await client.hasCaptcha();

      expect(result).toBe(false);
    });

    it("throws AbortError when signal aborted during hasCaptcha", async () => {
      const client = new ReceitaBrowserClient();
      await client.connect();

      const controller = new AbortController();
      controller.abort();

      await expect(client.hasCaptcha(controller.signal)).rejects.toThrow(
        "Aborted",
      );
    });
  });

  describe("waitForManualCaptchaResolution", () => {
    it("returns current html when manual CAPTCHA resolution reveals a result", async () => {
      mockPage.$$.mockResolvedValue([]);
      mockPage.textContent.mockResolvedValue(
        "Situação no Simples Nacional: Optante pelo Simples Nacional",
      );
      mockPage.content.mockResolvedValue(RESULT_PAGE_TEXT);

      const client = new ReceitaBrowserClient();
      await client.connect();

      const result = await client.waitForManualCaptchaResolution(undefined, {
        pollIntervalMs: 1,
        timeoutMs: 10,
      });

      expect(result.success).toBe(true);
      expect(result.html).toBe(RESULT_PAGE_TEXT);
      expect(mockPage.waitForTimeout).not.toHaveBeenCalled();
    });

    it("throws AbortError when signal aborted before manual CAPTCHA wait", async () => {
      const client = new ReceitaBrowserClient();
      await client.connect();

      const controller = new AbortController();
      controller.abort();

      await expect(
        client.waitForManualCaptchaResolution(controller.signal),
      ).rejects.toThrow("Aborted");
    });
  });

  describe("hasError", () => {
    it("returns true when visible error elements found", async () => {
      const mockErrorElement = {
        isVisible: vi.fn().mockResolvedValue(true),
      };
      mockPage.$$.mockResolvedValue([mockErrorElement]);

      const client = new ReceitaBrowserClient();
      await client.connect();

      const result = await client.hasError();

      expect(result).toBe(true);
    });

    it("returns false when error elements are not visible", async () => {
      const mockErrorElement = {
        isVisible: vi.fn().mockResolvedValue(false),
      };
      mockPage.$$.mockResolvedValue([mockErrorElement]);

      const client = new ReceitaBrowserClient();
      await client.connect();

      const result = await client.hasError();

      expect(result).toBe(false);
    });

    it("returns false when no error elements", async () => {
      mockPage.$$.mockResolvedValue([]);

      const client = new ReceitaBrowserClient();
      await client.connect();

      const result = await client.hasError();

      expect(result).toBe(false);
    });

    it("throws AbortError when signal aborted during hasError", async () => {
      const client = new ReceitaBrowserClient();
      await client.connect();

      const controller = new AbortController();
      controller.abort();

      await expect(client.hasError(controller.signal)).rejects.toThrow(
        "Aborted",
      );
    });
  });

  describe("hasResult", () => {
    it("detects result when Situação no Simples Nacional is present", async () => {
      mockPage.textContent.mockResolvedValue(
        "Situação no Simples Nacional: Optante pelo Simples Nacional",
      );

      const client = new ReceitaBrowserClient();
      await client.connect();

      const result = await client.hasResult();

      expect(result).toBe(true);
    });

    it("detects result when SIMEI text is present", async () => {
      mockPage.textContent.mockResolvedValue(
        "Situação no SIMEI: enquadrado no SIMEI",
      );

      const client = new ReceitaBrowserClient();
      await client.connect();

      const result = await client.hasResult();

      expect(result).toBe(true);
    });

    it("detects result when NÃO optante is present", async () => {
      mockPage.textContent.mockResolvedValue(
        "NÃO optante pelo Simples Nacional",
      );

      const client = new ReceitaBrowserClient();
      await client.connect();

      const result = await client.hasResult();

      expect(result).toBe(true);
    });

    it("returns false when no result indicators found", async () => {
      mockPage.textContent.mockResolvedValue("Outro conteúdo qualquer");

      const client = new ReceitaBrowserClient();
      await client.connect();

      const result = await client.hasResult();

      expect(result).toBe(false);
    });

    it("returns false when textContent is null", async () => {
      mockPage.textContent.mockResolvedValue(null);

      const client = new ReceitaBrowserClient();
      await client.connect();

      const result = await client.hasResult();

      expect(result).toBe(false);
    });

    it("throws AbortError when signal aborted during hasResult", async () => {
      const client = new ReceitaBrowserClient();
      await client.connect();

      const controller = new AbortController();
      controller.abort();

      await expect(client.hasResult(controller.signal)).rejects.toThrow(
        "Aborted",
      );
    });
  });

  describe("custom options", () => {
    it("passes custom headless option to browser launch", async () => {
      const client = new ReceitaBrowserClient({ headless: false });
      await client.connect();
      expect(chromium.launch).toHaveBeenCalledWith(
        expect.objectContaining({
          headless: false,
        }),
      );
    });

    it("passes custom executablePath option to browser launch", async () => {
      const client = new ReceitaBrowserClient({
        executablePath: "/custom/chrome",
      });
      await client.connect();
      expect(chromium.launch).toHaveBeenCalledWith(
        expect.objectContaining({
          executablePath: "/custom/chrome",
        }),
      );
    });
  });
});

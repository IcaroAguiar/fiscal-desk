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

const TEST_LOOKUP_ID = "cnpj-sanitizado";
const NAVIGATED_PAGE_TEXT = "pagina simbolica navegada";
const FILLED_PAGE_TEXT = "pagina simbolica preenchida";

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

  describe("constructor", () => {
    it("uses default options when none provided", () => {
      const client = new ReceitaBrowserClient();

      expect(client).toBeInstanceOf(ReceitaBrowserClient);
    });

    it("uses custom timeout option", () => {
      const client = new ReceitaBrowserClient({ timeout: 60000 });

      expect(client).toBeInstanceOf(ReceitaBrowserClient);
    });

    it("uses custom headless option", () => {
      const client = new ReceitaBrowserClient({ headless: false });

      expect(client).toBeInstanceOf(ReceitaBrowserClient);
    });

    it("uses custom executablePath option", () => {
      const client = new ReceitaBrowserClient({
        executablePath: "/path/to/browser",
      });

      expect(client).toBeInstanceOf(ReceitaBrowserClient);
    });
  });

  describe("connect and disconnect lifecycle", () => {
    it("connects and disconnects browser correctly", async () => {
      const client = new ReceitaBrowserClient();

      await client.connect();
      expect(chromium.launch).toHaveBeenCalledTimes(1);
      expect(chromium.launch).toHaveBeenCalledWith(
        expect.objectContaining({
          headless: true,
        }),
      );
      expect(chromium.launch).not.toHaveBeenCalledWith(
        expect.objectContaining({
          args: expect.arrayContaining([
            "--disable-blink-features=AutomationControlled",
          ]),
        }),
      );

      expect(mockBrowser.newContext).toHaveBeenCalledTimes(1);
      expect(mockContext.newPage).toHaveBeenCalledTimes(1);

      await client.disconnect();

      expect(mockPage.close).toHaveBeenCalledTimes(1);
      expect(mockBrowser.close).toHaveBeenCalledTimes(1);
    });

    it("throws AbortError when signal already aborted in connect", async () => {
      const client = new ReceitaBrowserClient();
      const controller = new AbortController();
      controller.abort();

      await expect(client.connect(controller.signal)).rejects.toThrow(
        "Aborted",
      );
    });

    it("cleans up the browser when connect fails after launch", async () => {
      mockContext.newPage.mockRejectedValue(new Error("newPage failed"));

      const client = new ReceitaBrowserClient();

      await expect(client.connect()).rejects.toThrow("newPage failed");

      expect(mockContext.close).toHaveBeenCalledTimes(1);
      expect(mockBrowser.close).toHaveBeenCalledTimes(1);
    });
  });

  describe("error handling for unconnected browser", () => {
    it("returns error when navigate called without connection", async () => {
      const client = new ReceitaBrowserClient();

      const result = await client.navigate();

      expect(result.success).toBe(false);
      expect(result.error).toBe("browser_not_connected");
    });

    it("returns error when fillCnpj called without connection", async () => {
      const client = new ReceitaBrowserClient();

      const result = await client.fillCnpj(TEST_LOOKUP_ID);

      expect(result.success).toBe(false);
      expect(result.error).toBe("browser_not_connected");
    });

    it("returns error when submit called without connection", async () => {
      const client = new ReceitaBrowserClient();

      const result = await client.submit();

      expect(result.success).toBe(false);
      expect(result.error).toBe("browser_not_connected");
    });

    it("returns error when waitResult called without connection", async () => {
      const client = new ReceitaBrowserClient();

      const result = await client.waitResult();

      expect(result.success).toBe(false);
      expect(result.error).toBe("browser_not_connected");
    });

    it("returns false when hasCaptcha called without connection", async () => {
      const client = new ReceitaBrowserClient();

      const result = await client.hasCaptcha();

      expect(result).toBe(false);
    });

    it("returns false when hasError called without connection", async () => {
      const client = new ReceitaBrowserClient();

      const result = await client.hasError();

      expect(result).toBe(false);
    });

    it("returns false when hasResult called without connection", async () => {
      const client = new ReceitaBrowserClient();

      const result = await client.hasResult();

      expect(result).toBe(false);
    });
  });

  describe("navigate", () => {
    it("navigates to receita url and returns html", async () => {
      mockPage.goto.mockResolvedValue({});
      mockPage.waitForSelector.mockResolvedValue(undefined);
      mockPage.content.mockResolvedValue(NAVIGATED_PAGE_TEXT);

      const client = new ReceitaBrowserClient({ timeout: 5000 });
      await client.connect();

      const result = await client.navigate();

      expect(result.success).toBe(true);
      expect(result.html).toBe(NAVIGATED_PAGE_TEXT);
      expect(result.error).toBeUndefined();
      expect(mockPage.goto).toHaveBeenCalledWith(
        expect.stringContaining("receita.fazenda.gov.br"),
        expect.objectContaining({
          waitUntil: "domcontentloaded",
          timeout: 5000,
        }),
      );
      expect(mockPage.waitForSelector).toHaveBeenCalledWith(
        "#Cnpj",
        expect.objectContaining({ timeout: 5000 }),
      );
    });

    it("throws AbortError when signal aborted during navigate", async () => {
      const client = new ReceitaBrowserClient();
      await client.connect();

      const controller = new AbortController();
      controller.abort();

      await expect(client.navigate(controller.signal)).rejects.toThrow(
        "Aborted",
      );
    });

    it("returns error result on navigation failure", async () => {
      mockPage.goto.mockRejectedValue(new Error("Timeout exceeded"));

      const client = new ReceitaBrowserClient();
      await client.connect();

      const result = await client.navigate();

      expect(result.success).toBe(false);
      expect(result.error).toBe("navigation_failed");
      expect(result.html).toBe("");
    });
  });

  describe("fillCnpj", () => {
    it("fills cnpj input and returns html", async () => {
      const mockInputElement = {
        fill: vi.fn().mockResolvedValue(undefined),
      };

      mockPage.$.mockResolvedValue(mockInputElement);
      mockPage.content.mockResolvedValue(FILLED_PAGE_TEXT);
      mockPage.waitForTimeout.mockResolvedValue(undefined);

      const client = new ReceitaBrowserClient();
      await client.connect();

      const result = await client.fillCnpj(TEST_LOOKUP_ID);

      expect(result.success).toBe(true);
      expect(result.html).toBe(FILLED_PAGE_TEXT);
      expect(mockInputElement.fill).toHaveBeenCalledWith(TEST_LOOKUP_ID);
    });

    it("returns error when cnpj input not found", async () => {
      mockPage.$.mockResolvedValue(null);

      const client = new ReceitaBrowserClient();
      await client.connect();

      const result = await client.fillCnpj(TEST_LOOKUP_ID);

      expect(result.success).toBe(false);
      expect(result.error).toBe("cnpj_input_not_found");
    });

    it("throws AbortError when signal aborted during fillCnpj", async () => {
      const client = new ReceitaBrowserClient();
      await client.connect();

      const controller = new AbortController();
      controller.abort();

      await expect(
        client.fillCnpj(TEST_LOOKUP_ID, controller.signal),
      ).rejects.toThrow("Aborted");
    });
  });
});

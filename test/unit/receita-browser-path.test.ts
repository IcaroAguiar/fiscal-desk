import { existsSync } from "node:fs";

import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("node:fs", () => ({
  existsSync: vi.fn(),
}));

describe("resolvePackagedWindowsBrowserPath", () => {
  const originalPlatform = process.platform;
  const originalEnv = { ...process.env };
  const originalResourcesPath = process.resourcesPath;

  function setResourcesPath(value: string | undefined): void {
    Object.defineProperty(process, "resourcesPath", {
      configurable: true,
      value,
    });
  }

  afterEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env = { ...originalEnv };
    setResourcesPath(originalResourcesPath);
    Object.defineProperty(process, "platform", {
      value: originalPlatform,
    });
  });

  it("prioritizes Chrome from system when found in LOCALAPPDATA", async () => {
    Object.defineProperty(process, "platform", {
      value: "win32",
    });
    process.env.LOCALAPPDATA = "C:\\Users\\tester\\AppData\\Local";
    vi.mocked(existsSync).mockImplementation((candidate) =>
      String(candidate).endsWith("Google\\Chrome\\Application\\chrome.exe"),
    );

    const { resolveReceitaBrowserPath } = await import(
      "../../src/core/simples/adapters/receita-web/receita-browser-path"
    );

    expect(resolveReceitaBrowserPath()).toBe(
      "C:\\Users\\tester\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe",
    );
  });

  it("falls back to Edge when Chrome is unavailable", async () => {
    Object.defineProperty(process, "platform", {
      value: "win32",
    });
    process.env.PROGRAMFILES = "C:\\Program Files";
    vi.mocked(existsSync).mockImplementation((candidate) =>
      String(candidate).endsWith("Microsoft\\Edge\\Application\\msedge.exe"),
    );

    const { resolveReceitaBrowserPath } = await import(
      "../../src/core/simples/adapters/receita-web/receita-browser-path"
    );

    expect(resolveReceitaBrowserPath()).toBe(
      "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    );
  });

  it("falls back to bundled Chromium in packaged Windows app", async () => {
    Object.defineProperty(process, "platform", {
      value: "win32",
    });
    setResourcesPath("C:\\Consulta\\resources");
    vi.mocked(existsSync).mockImplementation((candidate) =>
      String(candidate).endsWith(
        "app.asar.unpacked\\node_modules\\playwright-core\\.local-browsers\\chromium-1208\\chrome-win\\chrome.exe",
      ),
    );

    const { resolveReceitaBrowserPath } = await import(
      "../../src/core/simples/adapters/receita-web/receita-browser-path"
    );

    expect(resolveReceitaBrowserPath()).toBe(
      "C:\\Consulta\\resources\\app.asar.unpacked\\node_modules\\playwright-core\\.local-browsers\\chromium-1208\\chrome-win\\chrome.exe",
    );
  });

  it("returns undefined when neither system browser nor bundled Chromium exists", async () => {
    Object.defineProperty(process, "platform", {
      value: "win32",
    });
    setResourcesPath("C:\\Consulta\\resources");
    vi.mocked(existsSync).mockReturnValue(false);

    const { resolveReceitaBrowserPath } = await import(
      "../../src/core/simples/adapters/receita-web/receita-browser-path"
    );

    expect(resolveReceitaBrowserPath()).toBeUndefined();
  });
});

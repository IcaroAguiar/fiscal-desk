import { existsSync } from "node:fs";
import path from "node:path";

const WINDOWS_BROWSER_CANDIDATES = [
  ["LOCALAPPDATA", "Google", "Chrome", "Application", "chrome.exe"],
  ["PROGRAMFILES", "Google", "Chrome", "Application", "chrome.exe"],
  ["PROGRAMFILES(X86)", "Google", "Chrome", "Application", "chrome.exe"],
  ["LOCALAPPDATA", "Chromium", "Application", "chrome.exe"],
  ["PROGRAMFILES", "Microsoft", "Edge", "Application", "msedge.exe"],
  ["PROGRAMFILES(X86)", "Microsoft", "Edge", "Application", "msedge.exe"],
] as const;

const BUNDLED_BROWSER_SEGMENTS: Partial<
  Record<NodeJS.Platform, readonly string[][]>
> = {
  win32: [["chrome-win64", "chrome.exe"]],
  darwin: [
    [
      "chrome-mac",
      "Google Chrome for Testing.app",
      "Contents",
      "MacOS",
      "Google Chrome for Testing",
    ],
    [
      "chrome-mac-arm64",
      "Google Chrome for Testing.app",
      "Contents",
      "MacOS",
      "Google Chrome for Testing",
    ],
  ],
  linux: [["chrome-linux", "chrome"]],
} as const;

function fromEnvPath(
  envName: string,
  ...segments: readonly string[]
): string | null {
  const basePath = process.env[envName];
  if (!basePath) {
    return null;
  }

  return path.win32.join(basePath, ...segments);
}

function resolveSystemBrowserPath(): string | undefined {
  if (process.platform !== "win32") {
    return;
  }

  for (const [envName, ...segments] of WINDOWS_BROWSER_CANDIDATES) {
    const candidate = fromEnvPath(envName, ...segments);
    if (candidate && existsSync(candidate)) {
      return candidate;
    }
  }

  return undefined;
}

function resolveBundledBrowserPath(
  ...roots: readonly string[]
): string | undefined {
  const platformSegments = BUNDLED_BROWSER_SEGMENTS[process.platform];
  if (!platformSegments) {
    return;
  }

  const pathApi = process.platform === "win32" ? path.win32 : path.posix;

  for (const root of roots) {
    for (let revision = 1400; revision >= 1000; revision -= 1) {
      const browserRoot = pathApi.join(root, `chromium-${revision}`);

      for (const executableSegments of platformSegments) {
        const executablePath = pathApi.join(browserRoot, ...executableSegments);
        if (existsSync(executablePath)) {
          return executablePath;
        }
      }
    }
  }

  return undefined;
}

export function resolveReceitaBrowserPath(): string | undefined {
  const systemBrowserPath = resolveSystemBrowserPath();
  if (systemBrowserPath) {
    return systemBrowserPath;
  }

  if (!process.resourcesPath) {
    return undefined;
  }

  const bundledRoots = [
    path.join(process.resourcesPath, "playwright-browsers", "win64"),
    path.join(
      process.resourcesPath,
      "app.asar.unpacked",
      "node_modules",
      "playwright-core",
      ".local-browsers",
    ),
  ];

  return resolveBundledBrowserPath(...bundledRoots);
}

export function resolvePackagedWindowsBrowserPath(): string | undefined {
  return resolveReceitaBrowserPath();
}

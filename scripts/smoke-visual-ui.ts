import { mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

import { chromium, type Page } from "playwright";
import { createServer } from "vite";

type ViewportCase = {
  name: "desktop" | "mobile";
  width: number;
  height: number;
};

type VisualSmokeResult = {
  viewport: ViewportCase;
  screenshotPath: string;
  overflow: boolean;
  clippedButtons: string[];
};

const viewports: ViewportCase[] = [
  { name: "desktop", width: 1440, height: 1000 },
  { name: "mobile", width: 390, height: 900 },
];
const outputDir = resolve(
  process.env.VISUAL_SMOKE_OUTPUT_DIR ??
    join(tmpdir(), "fiscal-desk-visual-smoke"),
);
const server = await createServer({
  root: resolve("src/renderer"),
  configFile: false,
  server: { host: "127.0.0.1", port: 0 },
});

await mkdir(outputDir, { recursive: true });
await server.listen();

const address = server.httpServer?.address();
if (!address || typeof address === "string") {
  throw new Error("Nao foi possivel iniciar o Vite local para o smoke visual.");
}

const browser = await chromium.launch({ headless: true });

try {
  const results: VisualSmokeResult[] = [];

  for (const viewport of viewports) {
    const page = await browser.newPage({
      viewport: { width: viewport.width, height: viewport.height },
    });
    await installAppBridgeMock(page);
    await page.goto(`http://127.0.0.1:${address.port}/`, {
      waitUntil: "networkidle",
    });
    await page.waitForSelector("text=Fiscal Desk");

    const screenshotPath = join(outputDir, `${viewport.name}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });

    const overflow = await hasHorizontalOverflow(page);
    const clippedButtons = await clippedPrimaryButtons(page);
    results.push({ viewport, screenshotPath, overflow, clippedButtons });
    await page.close();
  }

  const failed = results.filter(
    (result) => result.overflow || result.clippedButtons.length > 0,
  );
  const report = {
    status: failed.length ? "fail" : "pass",
    generatedAt: new Date().toISOString(),
    results,
  };

  await writeFile(
    join(outputDir, "visual-smoke-report.json"),
    JSON.stringify(report, null, 2) + "\n",
    "utf8",
  );
  await writeFile(
    join(outputDir, "visual-smoke-report.md"),
    renderMarkdown(report),
    "utf8",
  );

  console.log(JSON.stringify(report, null, 2));

  if (failed.length) {
    process.exit(1);
  }
} finally {
  await browser.close();
  await server.close();
}

async function installAppBridgeMock(page: Page): Promise<void> {
  await page.addInitScript(() => {
    (
      window as unknown as {
        appBridge: {
          getDefaults: () => Promise<{
            localPublicBaseStatus: {
              baseDate: string;
              diskUsageLabel: string;
              estimatedPreparationTimeLabel: string;
              estimatedRows: number;
              estimatedSizeLabel: string;
              freshnessWarning: string;
              state: "ready";
            };
            provider: "mock";
            receitaWebAvailable: boolean;
          }>;
          pickCsvFile: () => Promise<null>;
          processCsv: () => Promise<never>;
          cancelProcessing: () => Promise<boolean>;
          listExecutions: () => Promise<unknown[]>;
          resumeExecution: () => Promise<never>;
          saveCsvFile: () => Promise<null>;
          saveOutputFile: () => Promise<null>;
          onLookupProgress: () => () => void;
        };
      }
    ).appBridge = {
      getDefaults: async () => ({
        localPublicBaseStatus: {
          baseDate: "2026-05-20",
          diskUsageLabel: "sem download adicional nesta versão",
          estimatedPreparationTimeLabel: "pronta para uso neste corte",
          estimatedRows: 3,
          estimatedSizeLabel: "menos de 1 MB nesta amostra local",
          freshnessWarning:
            "A Base Pública Local pode estar defasada; confirme casos sensíveis.",
          state: "ready",
        },
        provider: "mock",
        receitaWebAvailable: true,
      }),
      pickCsvFile: async () => null,
      processCsv: async () => {
        throw new Error("Visual smoke nao executa processamento real.");
      },
      cancelProcessing: async () => false,
      listExecutions: async () => [],
      resumeExecution: async () => {
        throw new Error("Visual smoke nao retoma processamento real.");
      },
      saveCsvFile: async () => null,
      saveOutputFile: async () => null,
      onLookupProgress: () => () => {},
    };
  });
}

async function hasHorizontalOverflow(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    const documentWidth = Math.max(
      document.documentElement.scrollWidth,
      document.body?.scrollWidth ?? 0,
    );
    return documentWidth > window.innerWidth;
  });
}

async function clippedPrimaryButtons(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const selectors = [
      '[data-action="pick-file"]',
      '[data-action="process-file"]',
      '[data-action="cancel-processing"]',
      '[data-action="save-file"]',
    ];

    return selectors.flatMap((selector) => {
      const element = document.querySelector<HTMLElement>(selector);
      if (!element) return [selector + ":missing"];
      const rect = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);
      const clipped =
        style.display === "none" ||
        style.visibility === "hidden" ||
        rect.width <= 0 ||
        rect.height <= 0 ||
        rect.left < 0 ||
        rect.right > window.innerWidth;

      return clipped ? [selector] : [];
    });
  });
}

function renderMarkdown(report: {
  status: string;
  generatedAt: string;
  results: VisualSmokeResult[];
}): string {
  return [
    "# Fiscal Desk visual smoke",
    "",
    `Status: **${report.status.toUpperCase()}**`,
    "",
    "| Viewport | Overflow | Clipped buttons | Screenshot |",
    "| --- | ---: | --- | --- |",
    ...report.results.map((result) =>
      [
        result.viewport.name +
          ` (${result.viewport.width}x${result.viewport.height})`,
        String(result.overflow),
        result.clippedButtons.length ? result.clippedButtons.join(", ") : "none",
        result.screenshotPath,
      ].join(" | "),
    ).map((row) => "| " + row + " |"),
    "",
  ].join("\n");
}

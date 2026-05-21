import { mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

import { chromium, type Page } from "playwright";
import { createServer } from "vite";

type ViewportCase = {
  name: string;
  width: number;
  height: number;
};

type VisualSmokeResult = {
  viewport: ViewportCase;
  overflow: boolean;
  clippedButtons: string[];
  overlaps: string[];
  screenshots: Record<string, string>;
};

const viewports: ViewportCase[] = [
  { name: "desktop-wide", width: 1440, height: 1000 },
  { name: "desktop-compact", width: 1180, height: 900 },
  { name: "tablet", width: 900, height: 1000 },
  { name: "mobile-wide", width: 430, height: 932 },
  { name: "mobile-narrow", width: 360, height: 780 },
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
    page.on("pageerror", (error) => {
      throw error;
    });
    await installAppBridgeMock(page);
    await page.goto(`http://127.0.0.1:${address.port}/`, {
      waitUntil: "networkidle",
    });
    await page.waitForSelector("text=Fiscal Desk");

    const screenshots: Record<string, string> = {};
    let overflow = false;
    const clippedButtons: string[] = [];
    const overlaps: string[] = [];

    await collectScenarioChecks(page, viewport, "idle", screenshots, {
      clippedButtons,
      overlaps,
      setOverflow: (value) => {
        overflow = overflow || value;
      },
    });

    await page.evaluate(
      `document.querySelector('[data-action="pick-file"]')?.click()`,
    );
    await page.waitForFunction(
      `document.querySelector('[data-slot="file-badge"]')?.textContent?.includes("clientes-fiscais-com-nome-longo")`,
    );
    await collectScenarioChecks(page, viewport, "selected", screenshots, {
      clippedButtons,
      overlaps,
      setOverflow: (value) => {
        overflow = overflow || value;
      },
    });

    await page.evaluate(
      `document.querySelector('[data-action="process-file"]')?.click()`,
    );
    await page.waitForFunction(
      `document.querySelector('[data-slot="run-status-pill"]')?.textContent?.includes("Concluído") &&
        document.querySelector('[data-slot="output-preview"]')?.textContent?.includes("entrada-processado.csv")`,
    );
    await collectScenarioChecks(page, viewport, "success", screenshots, {
      clippedButtons,
      overlaps,
      setOverflow: (value) => {
        overflow = overflow || value;
      },
    });

    results.push({
      viewport,
      overflow,
      clippedButtons: [...new Set(clippedButtons)],
      overlaps: [...new Set(overlaps)],
      screenshots,
    });
    await page.close();
  }

  const failed = results.filter(
    (result) =>
      result.overflow ||
      result.clippedButtons.length > 0 ||
      result.overlaps.length > 0,
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
  await page.addInitScript({
    content: `
    const history = [];
    window.appBridge = {
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
      pickCsvFile: async () => ({
        filePath:
          "/tmp/fiscal-desk/clientes-fiscais-com-nome-longo-para-validacao-responsiva.csv",
        fileName:
          "clientes-fiscais-com-nome-longo-para-validacao-responsiva.csv",
        content: ["cnpj", "11222333000181", "44555666000190"].join("\\n"),
      }),
      processCsv: async () => {
        const result = {
          delivery: {
            extension: "csv",
            format: "csv",
            mimeType: "text/csv",
          },
          outputCsv: ["cnpj,situacao", "11222333000181,optante"].join("\\n"),
          outputXlsx: null,
          summary: {
            totalLinhas: 2,
            totalCnpjsEncontrados: 2,
            totalCnpjsValidos: 2,
            totalCnpjsUnicosConsultados: 2,
            totalCnpjsRetomados: 0,
            totalOptantesSimples: 1,
            totalNaoOptantesSimples: 1,
            totalErros: 0,
          },
          runStatus: "SUCCESS",
          execution: {
            checkpointPath: "/tmp/fiscal-desk/ledger-visual.json",
            completedUniqueLookups: 2,
            resumedUniqueLookups: 0,
            runId: "visual-smoke-run",
            status: "SUCCESS",
            totalUniqueLookups: 2,
          },
          savedPath: "/tmp/fiscal-desk/entrada-processado.csv",
          warningMessage: null,
        };
        history.splice(0, history.length, {
          canResume: false,
          checkpointPath: "/tmp/fiscal-desk/ledger-visual.json",
          checkpointedUniqueLookups: 2,
          cnpjColumn: null,
          completedAt: "2026-05-21T17:40:00.000Z",
          ledgerKey: "visual-smoke",
          outputPath: "/tmp/fiscal-desk/entrada-processado.csv",
          providerConfigVersion: "visual",
          providerName: "mock",
          resumeBlockedReason: "Execução concluída.",
          runId: "visual-smoke-run",
          sourceFileName:
            "clientes-fiscais-com-nome-longo-para-validacao-responsiva.csv",
          sourceFilePath:
            "/tmp/fiscal-desk/clientes-fiscais-com-nome-longo-para-validacao-responsiva.csv",
          startedAt: "2026-05-21T17:39:00.000Z",
          status: "SUCCESS",
          summary: result.summary,
          totalUniqueLookups: 2,
          updatedAt: "2026-05-21T17:40:00.000Z",
        });
        return result;
      },
      cancelProcessing: async () => false,
      listExecutions: async () => history,
      resumeExecution: async () => {
        throw new Error("Visual smoke nao retoma processamento real.");
      },
      saveCsvFile: async () => null,
      saveOutputFile: async () => null,
      onLookupProgress: () => () => {},
    };
  `,
  });
}

async function collectScenarioChecks(
  page: Page,
  viewport: ViewportCase,
  scenario: string,
  screenshots: Record<string, string>,
  checks: {
    clippedButtons: string[];
    overlaps: string[];
    setOverflow(value: boolean): void;
  },
): Promise<void> {
  const screenshotPath = join(outputDir, `${viewport.name}-${scenario}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  screenshots[scenario] = screenshotPath;

  checks.setOverflow(await hasHorizontalOverflow(page));
  checks.clippedButtons.push(
    ...(await clippedPrimaryButtons(page)).map((item) => `${scenario}:${item}`),
  );
  checks.overlaps.push(
    ...(await siblingOverlaps(page)).map((item) => `${scenario}:${item}`),
  );
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

async function siblingOverlaps(page: Page): Promise<string[]> {
  return page.evaluate<string[]>(`(() => {
    const parents = [
      ".ops-topbar",
      ".ops-topbar__status",
      ".system-strip",
      ".workbench-grid",
      ".surface__header",
      ".stepper",
      ".file-dropzone",
      ".controls-row--workbench",
      ".command-bar--workbench",
      ".command-bar__actions",
      ".result-actions",
      ".provider-list",
      ".sidebar-nav",
      ".history-list",
    ];

    const visibleRect = (element) => {
      const rect = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);
      if (
        style.display === "none" ||
        style.visibility === "hidden" ||
        rect.width <= 0 ||
        rect.height <= 0
      ) {
        return null;
      }
      return rect;
    };

    const overlapArea = (a, b) => {
      const width = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
      const height = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
      return width * height;
    };

    return parents.flatMap((selector) => {
      return Array.from(document.querySelectorAll(selector)).flatMap(
        (parent, parentIndex) => {
          const children = Array.from(parent.children)
            .map((child, childIndex) => ({
              child,
              childIndex,
              rect: visibleRect(child),
            }))
            .filter(
              (item) => Boolean(item.rect),
            );

          const collisions = [];
          for (let index = 0; index < children.length; index += 1) {
            for (let next = index + 1; next < children.length; next += 1) {
              const current = children[index];
              const other = children[next];
              if (overlapArea(current.rect, other.rect) > 4) {
                collisions.push(
                  selector +
                    "[" +
                    parentIndex +
                    "] child " +
                    current.childIndex +
                    " overlaps " +
                    other.childIndex,
                );
              }
            }
          }
          return collisions;
        },
      );
    });
  })()`);
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
    "| Viewport | Overflow | Clipped buttons | Overlaps | Screenshots |",
    "| --- | ---: | --- | --- | --- |",
    ...report.results.map((result) =>
      [
        result.viewport.name +
          ` (${result.viewport.width}x${result.viewport.height})`,
        String(result.overflow),
        result.clippedButtons.length ? result.clippedButtons.join(", ") : "none",
        result.overlaps.length ? result.overlaps.join(", ") : "none",
        Object.entries(result.screenshots)
          .map(([scenario, path]) => `${scenario}: ${path}`)
          .join("<br>"),
      ].join(" | "),
    ).map((row) => "| " + row + " |"),
    "",
  ].join("\n");
}

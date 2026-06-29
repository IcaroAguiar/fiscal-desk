import { mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

import { chromium, type Page } from "playwright";
import { createServer } from "vite";
import {
  collectScenarioChecks,
  renderMarkdown,
  type ViewportCase,
  type VisualSmokeResult,
} from "./visual-smoke-checks";

const viewports: ViewportCase[] = [
  { name: "desktop-wide", width: 1440, height: 1000 },
  { name: "desktop-compact", width: 1180, height: 900 },
  { name: "tablet", width: 900, height: 1000 },
  { name: "mobile-wide", width: 430, height: 932 },
  { name: "mobile-reference", width: 390, height: 932 },
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
    // Cenários existentes (idle, selected, success) preservados.
    const page = await browser.newPage({
      viewport: { width: viewport.width, height: viewport.height },
    });
    page.on("pageerror", (error) => {
      throw error;
    });
    await installAppBridgeMock(page, { referenceState: false });
    await page.goto(`http://127.0.0.1:${address.port}/`, {
      waitUntil: "networkidle",
    });
    await page.waitForSelector("text=Fiscal Desk", { state: "attached" });

    const screenshots: Record<string, string> = {};
    let overflow = false;
    const clippedButtons: string[] = [];
    const overlaps: string[] = [];

    await collectScenarioChecks(page, outputDir, viewport, "idle", screenshots, {
      clippedButtons,
      overlaps,
      setOverflow: (value) => {
        overflow = overflow || value;
      },
    });

    await page.locator('[data-action="pick-file"]').click();
    await page.waitForFunction(
      `document.querySelector('[data-slot="file-badge"]')?.textContent?.includes("clientes-fiscais-com-nome-longo")`,
    );
    await collectScenarioChecks(
      page,
      outputDir,
      viewport,
      "selected",
      screenshots,
      {
        clippedButtons,
        overlaps,
        setOverflow: (value) => {
          overflow = overflow || value;
        },
      },
    );

    await page.locator('[data-primary-panel="true"]').click();
    await page.locator('label:has(input[value="mock"])').click();
    await page.waitForFunction(
      `document.querySelector('input[value="mock"]')?.checked === true`,
    );
    await page.locator(".fd-header [data-action=\"process-file\"]").click();
    await page.locator('[data-view="resultados"]').click();
    await page.waitForFunction(
      `document.querySelector('[data-slot="run-status-pill"]')?.textContent?.includes("Concluído") &&
        document.querySelector('[data-slot="output-preview"]')?.textContent?.includes("entrada-processado.csv")`,
    );
    await collectScenarioChecks(
      page,
      outputDir,
      viewport,
      "success",
      screenshots,
      {
        clippedButtons,
        overlaps,
        setOverflow: (value) => {
          overflow = overflow || value;
        },
      },
    );

    results.push({
      scenario: "existing",
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

type InstallAppBridgeMockOptions = {
  referenceState: boolean;
};

async function installAppBridgeMock(
  page: Page,
  options: InstallAppBridgeMockOptions,
): Promise<void> {
  await page.addInitScript({
    content: `
    const history = [];
    const useReferenceState = ${JSON.stringify(options.referenceState)};

    const baseDefaults = {
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
      provider: "base-publica-local",
      providerStatus: "Base Pública Local",
      secondaryStatus: "Receita Web exige acompanhamento",
      fileStatus: "aguardando arquivo",
      receitaWebAvailable: true,
    };

    window.appBridge = {
      getDefaults: async () => baseDefaults,
      pickCsvFile: async () => {
        const rows = ["cnpj", "11222333000181", "44555666000190"];
        return {
          filePath:
            "/tmp/fiscal-desk/clientes-fiscais-com-nome-longo-para-validacao-responsiva.csv",
          fileName:
            "clientes-fiscais-com-nome-longo-para-validacao-responsiva.csv",
          content: rows.join("\\n"),
        };
      },
      processCsv: async () => {
        const summary = {
          totalLinhas: 2,
          totalCnpjsEncontrados: 2,
          totalCnpjsValidos: 2,
          totalCnpjsUnicosConsultados: 2,
          totalCnpjsRetomados: 0,
          totalOptantesSimples: 1,
          totalNaoOptantesSimples: 1,
          totalErros: 0,
        };

        const result = {
          delivery: {
            extension: "csv",
            format: "csv",
            mimeType: "text/csv",
          },
          outputCsv: ["cnpj,situacao", "11222333000181,optante"].join("\\n"),
          outputXlsx: null,
          summary,
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
          providerName: "base-publica-local",
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
      listQueue: async () => [],
      listExecutionHistory: async () => [],
      saveCsvFile: async () => null,
      saveOutputFile: async () => null,
      onLookupProgress: () => () => {},
      resumeExecution: async () => {
        throw new Error("Visual smoke nao retoma processamento real.");
      },
    };
  `,
  });
}

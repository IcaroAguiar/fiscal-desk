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
import {
  referenceFixtureViewports,
  referenceScenarioName,
  referenceV5AState,
} from "./visual-smoke-fixture";

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

    await page.evaluate(
      `document.querySelector('[data-action="pick-file"]')?.click()`,
    );
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

    await page.evaluate(
      `document.querySelector('[data-action="process-file"]')?.click()`,
    );
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

    // Cenário adicional de referência V5-A, só nas variantes desktop/mobile alvo.
    if (referenceFixtureViewports.has(viewport.name)) {
      const referencePage = await browser.newPage({
        viewport: { width: viewport.width, height: viewport.height },
      });
      referencePage.on("pageerror", (error) => {
        throw error;
      });
      await installAppBridgeMock(referencePage, { referenceState: true });
      await referencePage.goto(`http://127.0.0.1:${address.port}/`, {
        waitUntil: "networkidle",
      });
      await referencePage.waitForSelector("text=Consulta fiscal", {
        state: "visible",
      });

      const referenceScreenshots: Record<string, string> = {};
      let referenceOverflow = false;
      const referenceClippedButtons: string[] = [];
      const referenceOverlaps: string[] = [];
      const referenceChecks = {
        clippedButtons: referenceClippedButtons,
        overlaps: referenceOverlaps,
        setOverflow: (value: boolean) => {
          referenceOverflow = referenceOverflow || value;
        },
      };

      await collectScenarioChecks(
        referencePage,
        outputDir,
        viewport,
        `${referenceScenarioName}-painel`,
        referenceScreenshots,
        referenceChecks,
      );

      for (const view of ["fila", "atividade", "resultados", "historico"]) {
        await referencePage.click(
          `.ops-tabs [data-view="${view}"], .sidebar-nav [data-view="${view}"]`,
        );
        await collectScenarioChecks(
          referencePage,
          outputDir,
          viewport,
          `${referenceScenarioName}-${view}`,
          referenceScreenshots,
          referenceChecks,
        );
      }

      results.push({
        scenario: referenceScenarioName,
        viewport,
        overflow: referenceOverflow,
        clippedButtons: [...new Set(referenceClippedButtons)],
        overlaps: [...new Set(referenceOverlaps)],
        screenshots: referenceScreenshots,
      });
      await referencePage.close();
    }
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
    const fixture = ${JSON.stringify(referenceV5AState)};
    const useReferenceState = ${JSON.stringify(options.referenceState)};
    if (useReferenceState) {
      window.__FISCAL_DESK_VISUAL_FIXTURE__ = fixture;
    }

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
      provider: "mock",
      providerStatus: "Simulação",
      secondaryStatus: "Receita Web exige acompanhamento",
      fileStatus: "aguardando arquivo",
      receitaWebAvailable: true,
    };

    const referenceDefaults = {
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
      providerStatus: fixture.providerPrimaryStatus,
      secondaryStatus: fixture.providerSecondaryStatus,
      fileStatus: fixture.fileStatus,
      receitaWebAvailable: true,
    };

    window.appBridge = {
      getDefaults: async () =>
        useReferenceState ? referenceDefaults : baseDefaults,
      pickCsvFile: async () => {
        const rows = ["cnpj", "11222333000181", "44555666000190"];
        if (useReferenceState) {
          return {
            filePath: "/tmp/fiscal-desk/clientes-maio.csv",
            fileName: "clientes-maio.csv",
            content: rows.join("\\n"),
          };
        }

        return {
          filePath:
            "/tmp/fiscal-desk/clientes-fiscais-com-nome-longo-para-validacao-responsiva.csv",
          fileName:
            "clientes-fiscais-com-nome-longo-para-validacao-responsiva.csv",
          content: rows.join("\\n"),
        };
      },
      processCsv: async () => {
        const summary = useReferenceState
          ? {
              totalLinhas: 1284,
              totalCnpjsEncontrados: 1284,
              totalCnpjsValidos: 1282,
              totalCnpjsUnicosConsultados: 1284,
              totalCnpjsRetomados: 0,
              totalOptantesSimples: 804,
              totalNaoOptantesSimples: 478,
              totalErros: 2,
            }
          : {
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
            extension: useReferenceState ? fixture.outputFormat : "csv",
            format: useReferenceState ? fixture.outputFormat : "csv",
            mimeType: "text/csv",
          },
          outputCsv: ["cnpj,situacao", "11222333000181,optante"].join("\\n"),
          outputXlsx: null,
          summary,
          runStatus: "SUCCESS",
          execution: {
            checkpointPath: "/tmp/fiscal-desk/ledger-visual.json",
            completedUniqueLookups: useReferenceState ? 1284 : 2,
            resumedUniqueLookups: 0,
            runId: useReferenceState ? "reference-v5-a-run" : "visual-smoke-run",
            status: "SUCCESS",
            totalUniqueLookups: useReferenceState ? 1284 : 2,
          },
          savedPath: "/tmp/fiscal-desk/entrada-processado." +
            (useReferenceState ? fixture.outputFormat : "csv"),
          warningMessage: null,
        };

        if (useReferenceState) {
          history.splice(
            0,
            history.length,
            ...fixture.historyRows.map((row) => ({
              canResume: false,
              checkpointPath: "/tmp/fiscal-desk/ledger-visual.json",
              checkpointedUniqueLookups: row.rowCount,
              cnpjColumn: null,
              completedAt: "2026-05-21T17:40:00.000Z",
              ledgerKey: "visual-" + row.fileName,
              sourceFileName: row.fileName,
              sourceFilePath: "/tmp/fiscal-desk/" + row.fileName,
              outputPath: "/tmp/fiscal-desk/entrada-processado.csv",
              providerConfigVersion: "visual",
              providerName: row.provider,
              resumeBlockedReason: row.resultStatus,
              runId: "visual-smoke-" + row.fileName,
              startedAt: "2026-05-21T17:39:00.000Z",
              status: row.status.toUpperCase(),
              summary,
              totalUniqueLookups: row.rowCount,
              updatedAt: "2026-05-21T17:40:00.000Z",
            })),
          );
        } else {
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
        }

        return result;
      },
      cancelProcessing: async () => false,
      listExecutions: async () => history,
      listQueue: async () =>
        useReferenceState
          ? fixture.queueRows.map((row) => ({
              ...row,
              fileStatusText: row.statusHint,
            }))
          : [],
      listExecutionHistory: async () =>
        useReferenceState
          ? fixture.historyRows.map((row) => ({
              fileName: row.fileName,
              status: row.status,
              rowCount: row.rowCount,
            }))
          : [],
      getReferenceV5AState: async () =>
        useReferenceState ? fixture : null,
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

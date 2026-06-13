import { access, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { _electron as electron, type ElectronApplication } from "playwright";
import { createServer, type ViteDevServer } from "vite";

import { FileProcessExecutionLedger } from "../src/main/execution/file-process-execution-ledger";
import {
  FISCAL_DESK_DISABLE_COMPLETION_DIALOG_ENV,
  FISCAL_DESK_DISABLE_DEVTOOLS_ENV,
  FISCAL_DESK_DEV_SERVER_URL_ENV,
  FISCAL_DESK_USER_DATA_DIR_ENV,
} from "../src/main/runtime-env";
import type { ProcessExecutionHistoryItem } from "../src/main/types";
import {
  SIMPLES_PROVIDER,
  type SimplesProviderName,
} from "../src/core/simples/simples-provider.names";

const fixturePath = fileURLToPath(
  new URL("../test/fixtures/smoke/cnpjs-publicos-reais.csv", import.meta.url),
);
const localPublicBaseFixturePath = fileURLToPath(
  new URL("../test/fixtures/smoke/base-publica-local.csv", import.meta.url),
);
const smokeProvider = resolveSmokeProvider(process.env.FISCAL_DESK_SMOKE_PROVIDER);
const tempDir = await mkdtemp(join(tmpdir(), "fiscal-desk-electron-smoke-"));
const userDataDir = join(tempDir, "user-data");
const sourceFilePath = join(tempDir, "entrada.csv");
const fixtureCsv = await readFile(fixturePath, "utf8");
const localPublicBaseCsv = await readFile(localPublicBaseFixturePath, "utf8");
let server: ViteDevServer | null = null;
let electronApp: ElectronApplication | null = null;

await writeFile(sourceFilePath, fixtureCsv, "utf8");
await seedInterruptedExecution();

try {
  server = await createServer({
    root: resolve("src/renderer"),
    configFile: false,
    server: { host: "127.0.0.1", port: 0 },
  });
  await server.listen();
  const address = server.httpServer?.address();
  if (!address || typeof address === "string") {
    throw new Error("Nao foi possivel iniciar o Vite local para o smoke.");
  }

  electronApp = await electron.launch({
    args: ["."],
    env: {
      ...process.env,
      [FISCAL_DESK_DISABLE_COMPLETION_DIALOG_ENV]: "1",
      [FISCAL_DESK_DISABLE_DEVTOOLS_ENV]: "1",
      [FISCAL_DESK_DEV_SERVER_URL_ENV]: `http://127.0.0.1:${address.port}`,
      [FISCAL_DESK_USER_DATA_DIR_ENV]: userDataDir,
    },
  });

  const page = await electronApp.firstWindow();
  await page.waitForSelector("text=Fiscal Desk", { timeout: 20_000 });
  if (smokeProvider === SIMPLES_PROVIDER.BASE_PUBLICA_LOCAL) {
    await page.evaluate(
      async ({ content, sourceFilePath }) => {
        const result = await window.appBridge.prepareLocalPublicBase({
          content,
          consent: {
            accepted: true,
            acceptedAt: new Date().toISOString(),
            baseDateAcknowledged: "2026-05-20",
            stalenessWarningAcknowledged:
              "Fixture local de smoke com Data da Base 2026-05-20.",
          },
          sourceFileName: "base-publica-local.csv",
          sourceFilePath,
        });

        if (result.status.state !== "ready") {
          throw new Error("Base Publica Local nao ficou pronta no smoke.");
        }
      },
      { content: localPublicBaseCsv, sourceFilePath: localPublicBaseFixturePath },
    );
  }
  if (smokeProvider !== SIMPLES_PROVIDER.BASE_PUBLICA_LOCAL) {
    await page.selectOption('[data-field="provider"]', smokeProvider);
  }
  await page.selectOption('[data-field="delivery-format"]', "xlsx");
  await page.click('[data-view="historico"]');
  await page.waitForSelector('[data-action="resume-execution"]', {
    timeout: 20_000,
  });
  await page.click('[data-action="resume-execution"]');
  if (smokeProvider === SIMPLES_PROVIDER.BASE_PUBLICA_LOCAL) {
    await page.waitForFunction(() => {
      const provider = document.querySelector<HTMLSelectElement>(
        '[data-field="provider"]',
      );
      const notice = document.querySelector<HTMLElement>(
        '[data-slot="local-public-base-notice-panel"]',
      );
      return (
        provider?.value === "base-publica-local" &&
        notice !== null &&
        notice.style.display !== "none"
      );
    });
    await page.click('[data-view="painel"]');
    await page.check('[data-field="local-public-base-notice"]');
    await page.click('[data-view="historico"]');
    await page.click('[data-action="resume-execution"]');
  }
  await page.waitForFunction(() =>
    document
      .querySelector('[data-slot="execution-resume"]')
      ?.textContent?.includes("1 CNPJs retomados"),
  );
  const history = await page.evaluate(() => window.appBridge.listExecutions());
  const latestHistory = history[0];

  if (!latestHistory) {
    throw new Error("Historico local nao refletiu a execucao retomada.");
  }

  assertElectronSmokeHistory(latestHistory);
  await access(latestHistory.outputPath ?? "");
  await assertXlsxOutput(latestHistory.outputPath ?? "");
  await access(latestHistory.checkpointPath);

  console.log(
    JSON.stringify(
      {
        status: "pass",
        app: "electron",
        provider: smokeProvider,
        deliveryFormat: "xlsx",
        sourceFilePath,
        savedPath: latestHistory.outputPath,
        checkpointPath: latestHistory.checkpointPath,
        runId: latestHistory.runId,
        historyCount: history.length,
        uiResumeText: await page
          .locator('[data-slot="execution-resume"]')
          .textContent(),
        summary: latestHistory.summary,
      },
      null,
      2,
    ),
  );
} finally {
  await electronApp?.close();
  await server?.close();
}

function assertElectronSmokeHistory(history: ProcessExecutionHistoryItem): void {
  if (history.status !== "SUCCESS") {
    throw new Error(`Esperado SUCCESS, recebido ${history.status}`);
  }

  if (!history.outputPath) {
    throw new Error("Smoke Electron nao gerou auto-save.");
  }

  if (!history.outputPath.endsWith(".xlsx")) {
    throw new Error(`Esperado auto-save XLSX, recebido ${history.outputPath}`);
  }

  if (!history.checkpointPath) {
    throw new Error("Smoke Electron nao gerou ledger de checkpoint.");
  }

  if (!history.summary) {
    throw new Error("Smoke Electron nao gravou summary no historico.");
  }

  if (history.canResume) {
    throw new Error("Execucao SUCCESS nao deve ficar retomavel no historico.");
  }

  if (history.summary.totalCnpjsRetomados < 1) {
    throw new Error("Smoke Electron nao retomou checkpoint preexistente.");
  }

  if (history.summary.totalLinhas !== 5) {
    throw new Error(
      `Esperado 5 linhas, recebido ${history.summary.totalLinhas}`,
    );
  }

  if (history.summary.totalCnpjsUnicosConsultados !== 3) {
    throw new Error(
      `Esperado 3 CNPJs unicos, recebido ${history.summary.totalCnpjsUnicosConsultados}`,
    );
  }
}

async function assertXlsxOutput(outputPath: string): Promise<void> {
  const bytes = await readFile(outputPath);
  const signature = bytes.subarray(0, 4).toString("hex");

  if (signature !== "504b0304") {
    throw new Error(`Arquivo XLSX nao possui assinatura ZIP valida: ${signature}`);
  }
}

async function seedInterruptedExecution(): Promise<void> {
  const ledger = new FileProcessExecutionLedger(
    join(userDataDir, "execution-ledgers"),
  );
  const run = await ledger.startRun({
    cnpjColumn: "cnpj",
    inputCsv: fixtureCsv,
    providerName: smokeProvider,
    sourceFilePath,
  });

  await run.setTotalUniqueLookups(3);
  await run.saveLookup({
    cnpj: "00000000000191",
    simplesNacional: true,
    simei: false,
    source: smokeProvider,
    status: "SUCCESS",
  });
  await run.finish({
    status: "CANCELLED",
    outputPath: null,
    summary: null,
  });
}

function resolveSmokeProvider(value: string | undefined): SimplesProviderName {
  if (value === SIMPLES_PROVIDER.BASE_PUBLICA_LOCAL) {
    return SIMPLES_PROVIDER.BASE_PUBLICA_LOCAL;
  }

  return SIMPLES_PROVIDER.MOCK;
}

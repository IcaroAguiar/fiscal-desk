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

const fixturePath = fileURLToPath(
  new URL("../test/fixtures/smoke/cnpjs-publicos-reais.csv", import.meta.url),
);
const tempDir = await mkdtemp(join(tmpdir(), "fiscal-desk-electron-smoke-"));
const userDataDir = join(tempDir, "user-data");
const sourceFilePath = join(tempDir, "entrada.csv");
const fixtureCsv = await readFile(fixturePath, "utf8");
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
  await page.selectOption('[data-field="provider"]', "mock");
  await page.selectOption('[data-field="delivery-format"]', "xlsx");
  await page.waitForSelector('[data-action="resume-execution"]', {
    timeout: 20_000,
  });
  await page.click('[data-action="resume-execution"]');
  await page.waitForFunction(() =>
    document
      .querySelector('[data-slot="execution-resume"]')
      ?.textContent?.includes("1 retomadas"),
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
        provider: "mock",
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
    providerName: "mock",
    sourceFilePath,
  });

  await run.setTotalUniqueLookups(3);
  await run.saveLookup({
    cnpj: "00000000000191",
    simplesNacional: true,
    simei: false,
    source: "mock",
    status: "SUCCESS",
  });
  await run.finish({
    status: "CANCELLED",
    outputPath: null,
    summary: null,
  });
}

import { access, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { _electron as electron, type ElectronApplication } from "playwright";
import { createServer, type ViteDevServer } from "vite";

import type { SimplesProviderName } from "../src/core/simples/simples-provider.factory";
import {
  FISCAL_DESK_DISABLE_COMPLETION_DIALOG_ENV,
  FISCAL_DESK_DISABLE_DEVTOOLS_ENV,
  FISCAL_DESK_DEV_SERVER_URL_ENV,
  FISCAL_DESK_USER_DATA_DIR_ENV,
} from "../src/main/runtime-env";
import type { ProcessCsvResult } from "../src/renderer/ui/app.types";

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

  const result = await page.evaluate(
    async ({ content, provider, path }) => {
      return window.appBridge.processCsv({
        content,
        provider: provider as SimplesProviderName,
        sourceFilePath: path,
        cnpjColumn: "cnpj",
      });
    },
    { content: fixtureCsv, provider: "mock", path: sourceFilePath },
  );

  assertElectronSmokeResult(result);
  await access(result.savedPath ?? "");
  await access(result.execution?.checkpointPath ?? "");

  console.log(
    JSON.stringify(
      {
        status: "pass",
        app: "electron",
        provider: "mock",
        sourceFilePath,
        savedPath: result.savedPath,
        checkpointPath: result.execution?.checkpointPath,
        runId: result.execution?.runId,
        summary: result.summary,
      },
      null,
      2,
    ),
  );
} finally {
  await electronApp?.close();
  await server?.close();
}

function assertElectronSmokeResult(result: ProcessCsvResult): void {
  if (result.runStatus !== "SUCCESS") {
    throw new Error(`Esperado SUCCESS, recebido ${result.runStatus}`);
  }

  if (!result.savedPath) {
    throw new Error("Smoke Electron nao gerou auto-save.");
  }

  if (!result.execution?.checkpointPath) {
    throw new Error("Smoke Electron nao gerou ledger de checkpoint.");
  }

  if (result.summary.totalLinhas !== 5) {
    throw new Error(
      `Esperado 5 linhas, recebido ${result.summary.totalLinhas}`,
    );
  }

  if (result.summary.totalCnpjsUnicosConsultados !== 3) {
    throw new Error(
      `Esperado 3 CNPJs unicos, recebido ${result.summary.totalCnpjsUnicosConsultados}`,
    );
  }
}

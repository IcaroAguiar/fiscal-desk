import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

import { PROCESS_CSV_INPUT_FORMAT } from "../src/core/app/process-csv.types";
import { SIMPLES_PROVIDER } from "../src/core/simples/simples-provider.names";

type E2eStep = {
  name: string;
  command: string;
  args: string[];
  env?: Record<string, string>;
  validates: string[];
};

type E2eStepResult = {
  name: string;
  command: string;
  status: "pass" | "fail";
  durationMs: number;
  validates: string[];
  exitCode: number | null;
  signal: NodeJS.Signals | null;
};

const pnpmCommand = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
const tsxCommand = process.platform === "win32" ? "tsx.cmd" : "tsx";
const smokeProviderEnv = "SMOKE_PROVIDER";
const electronSmokeProviderEnv = "FISCAL_DESK_SMOKE_PROVIDER";
const electronSmokeInputFormatEnv = "FISCAL_DESK_SMOKE_INPUT_FORMAT";
const visualSmokeOutputDirEnv = "VISUAL_SMOKE_OUTPUT_DIR";
const outputDir = resolve(
  process.env.FISCAL_DESK_E2E_OUTPUT_DIR ??
    join(tmpdir(), "fiscal-desk-e2e"),
);
const visualSmokeOutputDir = join(outputDir, "visual-smoke");

const steps: E2eStep[] = [
  {
    name: "contracts-and-coverage",
    command: pnpmCommand,
    args: ["test:coverage"],
    validates: [
      "unit and integration contracts",
      "coverage summary for src/**/*.{ts,tsx}",
    ],
  },
  {
    name: "core-csv-mock-provider",
    command: pnpmCommand,
    args: ["smoke:real-csv"],
    env: { [smokeProviderEnv]: SIMPLES_PROVIDER.MOCK },
    validates: [
      "CSV ingestion with a real fixture",
      "CNPJ normalization and validation",
      "deduplication and CSV output",
      "offline mock provider",
    ],
  },
  {
    name: "core-csv-local-public-base-provider",
    command: pnpmCommand,
    args: ["smoke:real-csv"],
    env: { [smokeProviderEnv]: SIMPLES_PROVIDER.BASE_PUBLICA_LOCAL },
    validates: [
      "Base Publica Local preparation with consent",
      "CSV ingestion against local public-base index",
      "provider lookup without network dependency",
    ],
  },
  {
    name: "runtime-build",
    command: pnpmCommand,
    args: ["build"],
    validates: ["renderer production build", "Electron main/preload build"],
  },
  {
    name: "electron-csv-mock-xlsx-delivery",
    command: tsxCommand,
    args: ["scripts/smoke-electron-ui.ts"],
    env: {
      [electronSmokeInputFormatEnv]: PROCESS_CSV_INPUT_FORMAT.CSV,
      [electronSmokeProviderEnv]: SIMPLES_PROVIDER.MOCK,
    },
    validates: [
      "Electron runtime with CSV input",
      "mock provider selection",
      "checkpoint resume and execution history",
      "XLSX autosave delivery",
    ],
  },
  {
    name: "electron-csv-local-public-base-xlsx-delivery",
    command: tsxCommand,
    args: ["scripts/smoke-electron-ui.ts"],
    env: {
      [electronSmokeInputFormatEnv]: PROCESS_CSV_INPUT_FORMAT.CSV,
      [electronSmokeProviderEnv]: SIMPLES_PROVIDER.BASE_PUBLICA_LOCAL,
    },
    validates: [
      "Electron runtime with CSV input",
      "Base Publica Local consent and ready status",
      "checkpoint resume and execution history",
      "XLSX autosave delivery",
    ],
  },
  {
    name: "electron-xlsx-mock-xlsx-delivery",
    command: tsxCommand,
    args: ["scripts/smoke-electron-ui.ts"],
    env: {
      [electronSmokeInputFormatEnv]: PROCESS_CSV_INPUT_FORMAT.XLSX,
      [electronSmokeProviderEnv]: SIMPLES_PROVIDER.MOCK,
    },
    validates: [
      "Electron runtime with XLSX input",
      "mock provider selection",
      "checkpoint resume and execution history",
      "XLSX autosave delivery",
    ],
  },
  {
    name: "electron-xlsx-local-public-base-xlsx-delivery",
    command: tsxCommand,
    args: ["scripts/smoke-electron-ui.ts"],
    env: {
      [electronSmokeInputFormatEnv]: PROCESS_CSV_INPUT_FORMAT.XLSX,
      [electronSmokeProviderEnv]: SIMPLES_PROVIDER.BASE_PUBLICA_LOCAL,
    },
    validates: [
      "Electron runtime with XLSX input",
      "Base Publica Local consent and ready status",
      "checkpoint resume and execution history",
      "XLSX autosave delivery",
    ],
  },
  {
    name: "visual-ui-responsive-states",
    command: pnpmCommand,
    args: ["smoke:visual"],
    env: { [visualSmokeOutputDirEnv]: visualSmokeOutputDir },
    validates: [
      "responsive renderer states",
      "desktop/tablet/mobile overflow checks",
      "button clipping and overlap checks",
    ],
  },
];

await mkdir(outputDir, { recursive: true });

const startedAt = new Date().toISOString();
const results: E2eStepResult[] = [];

for (const step of steps) {
  const started = Date.now();
  const result = await runStep(step);
  results.push({
    name: step.name,
    command: formatCommand(step),
    status: result.exitCode === 0 ? "pass" : "fail",
    durationMs: Date.now() - started,
    validates: step.validates,
    exitCode: result.exitCode,
    signal: result.signal,
  });

  if (result.exitCode !== 0) {
    await writeReports("fail", startedAt, new Date().toISOString(), results);
    process.exit(result.exitCode ?? 1);
  }
}

await writeReports("pass", startedAt, new Date().toISOString(), results);

function runStep(
  step: E2eStep,
): Promise<{ exitCode: number | null; signal: NodeJS.Signals | null }> {
  return new Promise((resolveStep, reject) => {
    const child = spawn(step.command, step.args, {
      env: {
        ...process.env,
        ...step.env,
      },
      shell: process.platform === "win32",
      stdio: "inherit",
    });

    child.on("error", reject);
    child.on("close", (exitCode, signal) => resolveStep({ exitCode, signal }));
  });
}

async function writeReports(
  status: "pass" | "fail",
  startedAt: string,
  completedAt: string,
  results: E2eStepResult[],
): Promise<void> {
  const report = {
    status,
    startedAt,
    completedAt,
    outputDir,
    coverage: {
      quantitativeCoverageIsSignalOnly: true,
      functionalAcceptanceRequiresRuntimeSmokes: true,
    },
    exclusions: [
      "Receita Web live/massiva: modo assistido/experimental, validacao manual separada",
      "cnpja-open live: provider externo opt-in sujeito a rede/rate limit",
      "publish, signing, notarization, updater real, telemetry and diagnostic sending",
    ],
    results,
  };

  await writeFile(
    join(outputDir, "e2e-all-report.json"),
    JSON.stringify(report, null, 2) + "\n",
    "utf8",
  );
  await writeFile(
    join(outputDir, "e2e-all-report.md"),
    renderMarkdown(report),
    "utf8",
  );

  console.log(JSON.stringify(report, null, 2));
}

function renderMarkdown(report: {
  status: "pass" | "fail";
  startedAt: string;
  completedAt: string;
  outputDir: string;
  exclusions: string[];
  results: E2eStepResult[];
}): string {
  const lines = [
    "# Fiscal Desk E2E Report",
    "",
    `Status: ${report.status}`,
    `Started at: ${report.startedAt}`,
    `Completed at: ${report.completedAt}`,
    `Output dir: ${report.outputDir}`,
    "",
    "## Steps",
    "",
    "| Step | Status | Duration | Validates |",
    "|---|---:|---:|---|",
    ...report.results.map(
      (result) =>
        `| \`${result.name}\` | ${result.status} | ${result.durationMs} ms | ${result.validates.join("; ")} |`,
    ),
    "",
    "## Exclusions",
    "",
    ...report.exclusions.map((item) => `- ${item}`),
    "",
  ];

  return lines.join("\n");
}

function formatCommand(step: E2eStep): string {
  const env = Object.entries(step.env ?? {})
    .map(([key, value]) => `${key}=${value}`)
    .join(" ");
  const command = [step.command, ...step.args].join(" ");

  return env ? `${env} ${command}` : command;
}

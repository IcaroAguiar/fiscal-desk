import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  compareProcessedCsvWithProvider,
  COMPARISON_MODE,
  type ComparisonMode,
} from "../src/core/comparison/provider-comparison";
import { ReceitaConsultaOptantesAdapter } from "../src/core/simples/adapters/receita-web";

const args = parseArgs(process.argv.slice(2));

if (!args.inputPath) {
  printUsage();
  process.exit(1);
}

const inputCsv = await readFile(args.inputPath, "utf8");
const provider = new ReceitaConsultaOptantesAdapter();
const outputPath =
  args.outputPath ?? createDefaultOutputPath(args.inputPath, args.mode);

const result = await compareProcessedCsvWithProvider(inputCsv, provider, {
  limit: args.limit,
  mode: args.mode,
  onProgress(progress) {
    console.log(
      JSON.stringify({
        completed: progress.completed,
        currentCnpj: maskCnpj(progress.currentCnpj),
        total: progress.total,
      }),
    );
  },
});

await writeFile(outputPath, result.outputCsv, "utf8");

console.log(
  JSON.stringify(
    {
      mode: args.mode,
      outputPath,
      status: "ok",
      summary: result.summary,
    },
    null,
    2,
  ),
);

type CompareArgs = {
  inputPath: string | null;
  limit?: number;
  mode: ComparisonMode;
  outputPath?: string;
};

function parseArgs(rawArgs: string[]): CompareArgs {
  let inputPath: string | null = null;
  let outputPath: string | undefined;
  let mode: ComparisonMode = COMPARISON_MODE.SAMPLE;
  let limit: number | undefined;

  for (let index = 0; index < rawArgs.length; index += 1) {
    const arg = rawArgs[index];

    if (arg === "--mode") {
      mode = parseMode(rawArgs[index + 1]);
      index += 1;
      continue;
    }

    if (arg === "--limit") {
      limit = parseLimit(rawArgs[index + 1]);
      index += 1;
      continue;
    }

    if (arg === "--all") {
      mode = COMPARISON_MODE.ALL;
      limit = undefined;
      continue;
    }

    if (arg === "--errors") {
      mode = COMPARISON_MODE.ERRORS;
      continue;
    }

    if (!arg?.startsWith("--") && !inputPath) {
      inputPath = arg ?? null;
      continue;
    }

    if (!arg?.startsWith("--") && !outputPath) {
      outputPath = arg;
      continue;
    }

    throw new Error(`Argumento desconhecido: ${arg ?? ""}`);
  }

  return {
    inputPath,
    ...(limit !== undefined ? { limit } : {}),
    mode,
    ...(outputPath ? { outputPath } : {}),
  };
}

function parseMode(value: string | undefined): ComparisonMode {
  if (
    value === COMPARISON_MODE.ALL ||
    value === COMPARISON_MODE.ERRORS ||
    value === COMPARISON_MODE.SAMPLE
  ) {
    return value;
  }

  throw new Error("Modo invalido. Use all, errors ou sample.");
}

function parseLimit(value: string | undefined): number {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error("Limit invalido. Use um numero positivo.");
  }

  return Math.floor(parsed);
}

function createDefaultOutputPath(
  inputPath: string,
  mode: ComparisonMode,
): string {
  const parsed = path.parse(inputPath);
  return path.join(parsed.dir, `${parsed.name}-comparativo-${mode}.csv`);
}

function printUsage(): void {
  console.log(
    [
      "Uso:",
      "  pnpm compare:receita-web <csv-processado> [saida.csv] [--mode sample|errors|all] [--limit 10]",
      "",
      "Padrao: --mode sample --limit 10. Em --errors, sem --limit, reconsulta todos os erros.",
      "Receita Web abre navegador visivel e pode exigir desbloqueio manual de CAPTCHA.",
    ].join("\n"),
  );
}

function maskCnpj(cnpj: string): string {
  const normalized = cnpj.replace(/\D/g, "");

  if (normalized.length !== 14) {
    return "***";
  }

  return `${normalized.slice(0, 2)}********${normalized.slice(-4)}`;
}

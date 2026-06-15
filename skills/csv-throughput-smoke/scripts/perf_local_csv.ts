#!/usr/bin/env tsx
import { performance } from "node:perf_hooks";
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import type { ProcessCsvDeliveryFormat } from "../src/core/app/process-csv.types";
import { processCsv } from "../src/core/app/process-csv.use-case";
import { LocalPublicBaseStore } from "../src/core/public-base/local-public-base.store";
import { LocalPublicBaseSimplesLookupAdapter } from "../src/core/simples/adapters/local-public-base-simples-lookup.adapter";
import { MockSimplesLookupAdapter } from "../src/core/simples/adapters/mock-simples-lookup.adapter";
import type { SimplesLookupPort } from "../src/core/simples/simples-lookup.port";
import {
  SIMPLES_PROVIDER,
  type SimplesProviderName,
} from "../src/core/simples/simples-provider.names";

const args = parseArgs(process.argv.slice(2));
const totalRows = args.rows ?? Number(process.env.FISCAL_DESK_PERF_ROWS ?? 5000);
const minimumRowsPerSecond = args.minRowsPerSecond ?? Number(process.env.FISCAL_DESK_PERF_MIN_ROWS_PER_SECOND ?? 1000);
const deliveryFormat = resolveDeliveryFormat(args.deliveryFormat ?? process.env.FISCAL_DESK_PERF_DELIVERY_FORMAT);
const providerName = resolveProvider(args.provider ?? process.env.FISCAL_DESK_PERF_PROVIDER);
const localBaseCsvPath = args.localBaseCsvPath ?? process.env.FISCAL_DESK_PERF_LOCAL_BASE_CSV_PATH ?? fileURLToPath(new URL("../test/fixtures/smoke/base-publica-local.csv", import.meta.url));
const tempDir = await mkdtemp(join(tmpdir(), "csv-throughput-smoke-"));
const csv = buildCsv(totalRows);
const startedAt = performance.now();
const result = await processCsv(csv, await createProvider(providerName, tempDir, localBaseCsvPath), { cnpjColumn: "cnpj", deliveryFormat });
const elapsedMs = performance.now() - startedAt;
const rowsPerSecond = result.summary.totalLinhas / (elapsedMs / 1000);

const report = {
  status: rowsPerSecond >= minimumRowsPerSecond ? "pass" : "fail",
  totalRows: result.summary.totalLinhas,
  totalUniqueLookups: result.summary.totalCnpjsUnicosConsultados,
  provider: providerName,
  deliveryFormat,
  outputBytes: deliveryFormat === "xlsx" ? (result.outputXlsx?.byteLength ?? 0) : Buffer.byteLength(result.outputCsv, "utf8"),
  elapsedMs: Math.round(elapsedMs),
  rowsPerSecond: Math.round(rowsPerSecond),
  minimumRowsPerSecond,
};

console.log(JSON.stringify(report, null, 2));
if (report.status !== "pass") process.exit(1);

function parseArgs(argv: string[]) {
  const out: { rows?: number; minRowsPerSecond?: number; deliveryFormat?: string; provider?: string; localBaseCsvPath?: string } = {};
  for (let i = 0; i < argv.length; i += 1) {
    const current = argv[i];
    const next = argv[i + 1];
    if ((current === "--rows" || current === "-r") && next) out.rows = Number(next);
    if (current === "--min-rows-per-second" && next) out.minRowsPerSecond = Number(next);
    if (current === "--delivery-format" && next) out.deliveryFormat = next;
    if (current === "--provider" && next) out.provider = next;
    if (current === "--local-base-csv-path" && next) out.localBaseCsvPath = next;
  }
  return out;
}

function resolveDeliveryFormat(value: string | undefined): ProcessCsvDeliveryFormat {
  return value === "xlsx" ? "xlsx" : "csv";
}

function resolveProvider(value: string | undefined): SimplesProviderName {
  return value === SIMPLES_PROVIDER.BASE_PUBLICA_LOCAL ? SIMPLES_PROVIDER.BASE_PUBLICA_LOCAL : SIMPLES_PROVIDER.MOCK;
}

async function createProvider(providerName: SimplesProviderName, tempDir: string, localBaseCsvPath: string): Promise<SimplesLookupPort> {
  if (providerName === SIMPLES_PROVIDER.BASE_PUBLICA_LOCAL) {
    const store = new LocalPublicBaseStore(join(tempDir, "public-base"));
    const sourceFilePath = fileURLToPath(new URL(localBaseCsvPath, `file://${process.cwd()}/`));
    const content = await readFile(sourceFilePath, "utf8");
    const prepareResult = await store.prepareFromCsv({ content, sourceFileName: "base-publica-local.csv", sourceFilePath });
    const index = await store.loadIndex();
    if (!index || prepareResult.status.state !== "ready") throw new Error("Perf nao preparou a Base Publica Local.");
    return new LocalPublicBaseSimplesLookupAdapter(index, prepareResult.status);
  }
  return new MockSimplesLookupAdapter();
}

function buildCsv(rows: number): string {
  const lines = ["empresa;cnpj;observacao"];
  for (let index = 0; index < rows; index += 1) lines.push([`Empresa ${index + 1}`, index % 2 === 0 ? "00.000.000/0001-91" : "33.000.167/0001-01", "perf local"].join(";"));
  return lines.join("\n");
}

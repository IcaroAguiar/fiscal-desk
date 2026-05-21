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

const totalRows = Number(process.env.FISCAL_DESK_PERF_ROWS ?? 5_000);
const minimumRowsPerSecond = Number(
  process.env.FISCAL_DESK_PERF_MIN_ROWS_PER_SECOND ?? 1_000,
);
const deliveryFormat = resolveDeliveryFormat(
  process.env.FISCAL_DESK_PERF_DELIVERY_FORMAT,
);
const providerName = resolveProvider(process.env.FISCAL_DESK_PERF_PROVIDER);
const tempDir = await mkdtemp(join(tmpdir(), "fiscal-desk-perf-"));
const csv = buildCsv(totalRows);
const startedAt = performance.now();
const result = await processCsv(csv, await createProvider(providerName), {
  cnpjColumn: "cnpj",
  deliveryFormat,
});
const elapsedMs = performance.now() - startedAt;
const rowsPerSecond = result.summary.totalLinhas / (elapsedMs / 1000);

const report = {
  status: rowsPerSecond >= minimumRowsPerSecond ? "pass" : "fail",
  totalRows: result.summary.totalLinhas,
  totalUniqueLookups: result.summary.totalCnpjsUnicosConsultados,
  provider: providerName,
  deliveryFormat,
  outputBytes:
    deliveryFormat === "xlsx"
      ? (result.outputXlsx?.byteLength ?? 0)
      : Buffer.byteLength(result.outputCsv, "utf8"),
  elapsedMs: Math.round(elapsedMs),
  rowsPerSecond: Math.round(rowsPerSecond),
  minimumRowsPerSecond,
};

console.log(JSON.stringify(report, null, 2));

if (report.status !== "pass") {
  process.exit(1);
}

function resolveDeliveryFormat(
  value: string | undefined,
): ProcessCsvDeliveryFormat {
  return value === "xlsx" ? "xlsx" : "csv";
}

function resolveProvider(value: string | undefined): SimplesProviderName {
  if (value === SIMPLES_PROVIDER.BASE_PUBLICA_LOCAL) {
    return SIMPLES_PROVIDER.BASE_PUBLICA_LOCAL;
  }

  return SIMPLES_PROVIDER.MOCK;
}

async function createProvider(
  providerName: SimplesProviderName,
): Promise<SimplesLookupPort> {
  if (providerName === SIMPLES_PROVIDER.BASE_PUBLICA_LOCAL) {
    const store = new LocalPublicBaseStore(join(tempDir, "public-base"));
    const sourceFilePath = fileURLToPath(
      new URL("../test/fixtures/smoke/base-publica-local.csv", import.meta.url),
    );
    const content = await readFile(sourceFilePath, "utf8");
    const prepareResult = await store.prepareFromCsv({
      content,
      sourceFileName: "base-publica-local.csv",
      sourceFilePath,
    });
    const index = await store.loadIndex();

    if (!index || prepareResult.status.state !== "ready") {
      throw new Error("Perf nao preparou a Base Publica Local.");
    }

    return new LocalPublicBaseSimplesLookupAdapter(index, prepareResult.status);
  }

  return new MockSimplesLookupAdapter();
}

function buildCsv(rows: number): string {
  const lines = ["empresa;cnpj;observacao"];

  for (let index = 0; index < rows; index += 1) {
    lines.push(
      [
        `Empresa ${index + 1}`,
        index % 2 === 0 ? "00.000.000/0001-91" : "33.000.167/0001-01",
        "perf local",
      ].join(";"),
    );
  }

  return lines.join("\n");
}

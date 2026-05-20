import { performance } from "node:perf_hooks";

import { processCsv } from "../src/core/app/process-csv.use-case";
import { MockSimplesLookupAdapter } from "../src/core/simples/adapters/mock-simples-lookup.adapter";

const totalRows = Number(process.env.FISCAL_DESK_PERF_ROWS ?? 5_000);
const minimumRowsPerSecond = Number(
  process.env.FISCAL_DESK_PERF_MIN_ROWS_PER_SECOND ?? 1_000,
);
const csv = buildCsv(totalRows);
const startedAt = performance.now();
const result = await processCsv(csv, new MockSimplesLookupAdapter(), {
  cnpjColumn: "cnpj",
});
const elapsedMs = performance.now() - startedAt;
const rowsPerSecond = result.summary.totalLinhas / (elapsedMs / 1000);

const report = {
  status: rowsPerSecond >= minimumRowsPerSecond ? "pass" : "fail",
  totalRows: result.summary.totalLinhas,
  totalUniqueLookups: result.summary.totalCnpjsUnicosConsultados,
  elapsedMs: Math.round(elapsedMs),
  rowsPerSecond: Math.round(rowsPerSecond),
  minimumRowsPerSecond,
};

console.log(JSON.stringify(report, null, 2));

if (report.status !== "pass") {
  process.exit(1);
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

import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { processCsv } from "../src/core/app/process-csv.use-case";
import {
  createSimplesLookupProvider,
  type SimplesProviderName,
} from "../src/core/simples/simples-provider.factory";

const allowedProviders = new Set<SimplesProviderName>([
  "mock",
  "cnpja-open",
]);
const providerName = readProviderName();
const fixturePath = fileURLToPath(
  new URL("../test/fixtures/smoke/cnpjs-publicos-reais.csv", import.meta.url),
);
const inputCsv = await readFile(fixturePath, "utf8");
const provider = createSimplesLookupProvider(providerName);
const result = await processCsv(inputCsv, provider, { cnpjColumn: "cnpj" });
const outputDir = await mkdtemp(join(tmpdir(), "fiscal-desk-smoke-"));
const outputPath = join(outputDir, `resultado-${providerName}.csv`);

await writeFile(outputPath, result.outputCsv, "utf8");
assertSmokeResult(result.outputCsv);

if (result.summary.totalLinhas !== 5) {
  throw new Error(`Esperado 5 linhas, recebido ${result.summary.totalLinhas}`);
}

if (result.summary.totalCnpjsEncontrados !== 5) {
  throw new Error(
    `Esperado 5 CNPJs encontrados, recebido ${result.summary.totalCnpjsEncontrados}`,
  );
}

if (result.summary.totalCnpjsValidos !== 4) {
  throw new Error(
    `Esperado 4 CNPJs validos, recebido ${result.summary.totalCnpjsValidos}`,
  );
}

if (result.summary.totalCnpjsUnicosConsultados !== 3) {
  throw new Error(
    `Esperado 3 CNPJs unicos, recebido ${result.summary.totalCnpjsUnicosConsultados}`,
  );
}

console.log(
  JSON.stringify(
    {
      status: "pass",
      provider: providerName,
      input: fixturePath,
      output: outputPath,
      summary: result.summary,
    },
    null,
    2,
  ),
);

function readProviderName(): SimplesProviderName {
  const rawProvider = process.env.SMOKE_PROVIDER ?? "mock";

  if (!allowedProviders.has(rawProvider as SimplesProviderName)) {
    throw new Error(
      `SMOKE_PROVIDER invalido: ${rawProvider}. Use mock ou cnpja-open. Receita Web e assistido/experimental e deve ter smoke manual separado.`,
    );
  }

  return rawProvider as SimplesProviderName;
}

function assertSmokeResult(outputCsv: string): void {
  const requiredFragments = [
    "00000000000191",
    "33000167000101",
    "00360305000104",
    "INVALID_CNPJ",
  ];

  for (const fragment of requiredFragments) {
    if (!outputCsv.includes(fragment)) {
      throw new Error(`Resultado do smoke nao contem ${fragment}`);
    }
  }
}

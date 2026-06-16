import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { processCsv } from "../src/core/app/process-csv.use-case";
import { LocalPublicBaseStore } from "../src/core/public-base/local-public-base.store";
import { LocalPublicBaseSimplesLookupAdapter } from "../src/core/simples/adapters/local-public-base-simples-lookup.adapter";
import {
  createSimplesLookupProvider,
} from "../src/core/simples/simples-provider.factory";
import {
  SIMPLES_PROVIDER,
  type SimplesProviderName,
} from "../src/core/simples/simples-provider.names";

const allowedProviders = new Set<SimplesProviderName>([
  SIMPLES_PROVIDER.MOCK,
  SIMPLES_PROVIDER.BASE_PUBLICA_LOCAL,
]);
const providerName = readProviderName();
const fixturePath = fileURLToPath(
  new URL("../test/fixtures/smoke/cnpjs-sinteticos-smoke.csv", import.meta.url),
);
const localPublicBaseFixturePath = fileURLToPath(
  new URL("../test/fixtures/smoke/base-publica-local.csv", import.meta.url),
);
const inputCsv = await readFile(fixturePath, "utf8");
const outputDir = await mkdtemp(join(tmpdir(), "fiscal-desk-smoke-"));
const provider = await createSmokeProvider(providerName, outputDir);
const result = await processCsv(inputCsv, provider, { cnpjColumn: "cnpj" });
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
  const rawProvider = process.env.SMOKE_PROVIDER ?? SIMPLES_PROVIDER.MOCK;

  if (!allowedProviders.has(rawProvider as SimplesProviderName)) {
    throw new Error(
      `SMOKE_PROVIDER invalido: ${rawProvider}. Use mock ou base-publica-local. Providers externos exigem CSV proprio e validacao manual separada.`,
    );
  }

  return rawProvider as SimplesProviderName;
}

function assertSmokeResult(outputCsv: string): void {
  const requiredFragments = [
    "11222333000181",
    "98765432000198",
    "12345678000195",
    "INVALID_CNPJ",
  ];

  for (const fragment of requiredFragments) {
    if (!outputCsv.includes(fragment)) {
      throw new Error(`Resultado do smoke nao contem ${fragment}`);
    }
  }
}

async function createSmokeProvider(
  provider: SimplesProviderName,
  directory: string,
) {
  if (provider !== SIMPLES_PROVIDER.BASE_PUBLICA_LOCAL) {
    return createSimplesLookupProvider(provider);
  }

  const store = new LocalPublicBaseStore(join(directory, "public-base"));
  const content = await readFile(localPublicBaseFixturePath, "utf8");
  const prepareResult = await store.prepareFromCsv({
    content,
    consent: {
      accepted: true,
      acceptedAt: new Date().toISOString(),
      baseDateAcknowledged: "2026-05-20",
      stalenessWarningAcknowledged:
        "Fixture local de smoke com Data da Base 2026-05-20.",
    },
    sourceFileName: "base-publica-local.csv",
    sourceFilePath: localPublicBaseFixturePath,
  });
  const index = await store.loadIndex();

  if (!index || prepareResult.status.state !== "ready") {
    throw new Error("Smoke nao preparou a Base Publica Local.");
  }

  return new LocalPublicBaseSimplesLookupAdapter(index, prepareResult.status);
}

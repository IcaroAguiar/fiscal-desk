import type { Readable } from "node:stream";
import { parse } from "csv-parse";
import {
  assertLocalPublicBasePreparationConsent,
  createLocalPublicBaseStatus,
} from "./local-public-base.index";
import type {
  LocalPublicBasePrepareOfficialZipInput,
  LocalPublicBasePrepareResult,
  LocalPublicBaseRecord,
} from "./local-public-base.types";

type OfficialSimplesParseResult = LocalPublicBasePrepareResult & {
  records: LocalPublicBaseRecord[];
};

const OFFICIAL_SIMPLES_COLUMNS = {
  CNPJ_BASICO: 0,
  OPCAO_SIMPLES: 1,
  DATA_OPCAO_SIMPLES: 2,
  DATA_EXCLUSAO_SIMPLES: 3,
  OPCAO_SIMEI: 4,
  DATA_OPCAO_SIMEI: 5,
  DATA_EXCLUSAO_SIMEI: 6,
} as const;

export async function prepareLocalPublicBaseFromOfficialSimplesStream(
  stream: Readable,
  input: LocalPublicBasePrepareOfficialZipInput,
): Promise<OfficialSimplesParseResult> {
  assertLocalPublicBasePreparationConsent(input.consent);

  const records = new Map<string, LocalPublicBaseRecord>();
  let estimatedRows = 0;
  let rejectedRows = 0;

  await new Promise<void>((resolve, reject) => {
    const parser = parse({
      delimiter: ";",
      relaxColumnCount: true,
      skip_empty_lines: true,
      trim: true,
    });

    parser.on("readable", () => {
      for (;;) {
        const row = parser.read() as string[] | null;

        if (row === null) {
          break;
        }

        estimatedRows += 1;
        const record = createRecordFromOfficialSimplesRow(
          row,
          input.source.baseDate,
        );

        if (!record) {
          rejectedRows += 1;
          continue;
        }

        records.set(record.cnpjBasico ?? record.cnpj.slice(0, 8), record);
      }
    });
    parser.on("error", reject);
    parser.on("end", resolve);

    stream.on("error", reject);
    stream.pipe(parser);
  });

  const acceptedRecords = Array.from(records.values());
  const status = createLocalPublicBaseStatus({
    baseDate: input.source.baseDate,
    estimatedRows,
    preparedAt: new Date().toISOString(),
    preparedRows: acceptedRecords.length,
    rejectedRows,
    sourceFileName: input.source.fileName,
    sourceSizeBytes: input.sourceSizeBytes,
    state: acceptedRecords.length > 0 ? "ready" : "error",
  });

  return {
    acceptedRows: acceptedRecords.length,
    rejectedRows,
    records: acceptedRecords,
    status:
      acceptedRecords.length > 0
        ? status
        : {
            ...status,
            errorMessage:
              "Nenhum registro válido foi encontrado no Simples.zip oficial.",
          },
  };
}

export function createRecordFromOfficialSimplesRow(
  row: readonly string[],
  baseDate: string,
): LocalPublicBaseRecord | null {
  const cnpjBasico = onlyDigits(row[OFFICIAL_SIMPLES_COLUMNS.CNPJ_BASICO]);

  if (cnpjBasico.length !== 8) {
    return null;
  }

  const simplesNacional = parseOfficialBoolean(
    row[OFFICIAL_SIMPLES_COLUMNS.OPCAO_SIMPLES],
  );
  const simei = parseOfficialBoolean(row[OFFICIAL_SIMPLES_COLUMNS.OPCAO_SIMEI]);

  if (simplesNacional === null || simei === null) {
    return null;
  }

  return {
    cnpj: createSyntheticHeadOfficeCnpj(cnpjBasico),
    cnpjBasico,
    razaoSocial: `CNPJ básico ${cnpjBasico}`,
    simplesNacional,
    simei,
    updatedAt: resolveOfficialUpdatedAt(row) ?? baseDate,
  };
}

function parseOfficialBoolean(value: string | undefined): boolean | null {
  const normalized = value?.trim().toUpperCase();

  if (normalized === "S") {
    return true;
  }

  if (normalized === "N") {
    return false;
  }

  return null;
}

function resolveOfficialUpdatedAt(row: readonly string[]): string | null {
  return (
    [
      row[OFFICIAL_SIMPLES_COLUMNS.DATA_EXCLUSAO_SIMEI],
      row[OFFICIAL_SIMPLES_COLUMNS.DATA_OPCAO_SIMEI],
      row[OFFICIAL_SIMPLES_COLUMNS.DATA_EXCLUSAO_SIMPLES],
      row[OFFICIAL_SIMPLES_COLUMNS.DATA_OPCAO_SIMPLES],
    ]
      .map((value) => value?.trim())
      .filter((value): value is string => Boolean(value))
      .sort()
      .at(-1) ?? null
  );
}

function createSyntheticHeadOfficeCnpj(cnpjBasico: string): string {
  const base = `${cnpjBasico}0001`;
  const firstDigit = calculateCnpjDigit(
    base,
    [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2],
  );
  const secondDigit = calculateCnpjDigit(
    `${base}${firstDigit}`,
    [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2],
  );

  return `${base}${firstDigit}${secondDigit}`;
}

function calculateCnpjDigit(value: string, weights: readonly number[]): number {
  const sum = weights.reduce((total, weight, index) => {
    return total + Number(value[index] ?? 0) * weight;
  }, 0);
  const remainder = sum % 11;

  return remainder < 2 ? 0 : 11 - remainder;
}

function onlyDigits(value: string | undefined): string {
  return value?.replace(/\D/g, "") ?? "";
}

import { once } from "node:events";
import { createWriteStream, type WriteStream } from "node:fs";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Readable } from "node:stream";
import { parse } from "csv-parse";
import { normalizeCnpj } from "../cnpj/normalize-cnpj";
import {
  assertLocalPublicBasePreparationConsent,
  createLocalPublicBaseStatus,
  type LocalPublicBaseLookupIndex,
} from "./local-public-base.index";
import {
  createRecordFromOfficialSimplesRow,
  createSyntheticHeadOfficeCnpj,
} from "./local-public-base.official-simples";
import type {
  LocalPublicBasePrepareOfficialZipInput,
  LocalPublicBasePrepareResult,
  LocalPublicBaseRecord,
} from "./local-public-base.types";

const SHARD_PREFIX_LENGTH = 3;
const MAX_OPEN_WRITE_SHARDS = 32;
const MAX_CACHED_READ_SHARDS = 16;
const SHARD_ENCODING = "utf8";
const SHARD_SEPARATOR = "\t";
const OFFICIAL_INDEX_METADATA_FILE = "metadata.json";

type OfficialDiskIndexPrepareInput = LocalPublicBasePrepareOfficialZipInput & {
  outputDirectory: string;
};

export type OfficialDiskIndexPrepareResult = LocalPublicBasePrepareResult & {
  outputDirectory: string;
};

export class OfficialSimplesDiskIndex implements LocalPublicBaseLookupIndex {
  private readonly shardCache = new Map<
    string,
    Promise<ReadonlyMap<string, LocalPublicBaseRecord>>
  >();

  constructor(private readonly directory: string) {}

  async findByCnpj(cnpj: string): Promise<LocalPublicBaseRecord | null> {
    const cnpjBasico = normalizeCnpj(cnpj).slice(0, 8);

    if (!/^\d{8}$/.test(cnpjBasico)) {
      return null;
    }

    const shard = await this.readShard(
      cnpjBasico.slice(0, SHARD_PREFIX_LENGTH),
    );

    return shard.get(cnpjBasico) ?? null;
  }

  private async readShard(
    shardKey: string,
  ): Promise<ReadonlyMap<string, LocalPublicBaseRecord>> {
    const cached = this.shardCache.get(shardKey);

    if (cached) {
      this.shardCache.delete(shardKey);
      this.shardCache.set(shardKey, cached);

      return cached;
    }

    const loaded = loadShard(path.join(this.directory, `${shardKey}.tsv`));
    this.shardCache.set(shardKey, loaded);
    pruneReadCache(this.shardCache);

    return loaded;
  }
}

export async function prepareOfficialSimplesDiskIndexFromStream(
  stream: Readable,
  input: OfficialDiskIndexPrepareInput,
): Promise<OfficialDiskIndexPrepareResult> {
  assertLocalPublicBasePreparationConsent(input.consent);
  await rm(input.outputDirectory, { force: true, recursive: true });
  await mkdir(input.outputDirectory, { recursive: true });

  const writerPool = new ShardWriterPool(input.outputDirectory);
  let estimatedRows = 0;
  let acceptedRows = 0;
  let rejectedRows = 0;

  try {
    const parser = stream.pipe(
      parse({
        delimiter: ";",
        relaxColumnCount: true,
        skip_empty_lines: true,
        trim: true,
      }),
    );

    for await (const row of parser) {
      estimatedRows += 1;
      const record = createRecordFromOfficialSimplesRow(
        row as string[],
        input.source.baseDate,
      );

      if (!record?.cnpjBasico) {
        rejectedRows += 1;
        continue;
      }

      await writerPool.write(record.cnpjBasico, serializeRecord(record));
      acceptedRows += 1;
    }
  } finally {
    await writerPool.closeAll();
  }

  const status = createLocalPublicBaseStatus({
    baseDate: input.source.baseDate,
    estimatedRows,
    preparedAt: new Date().toISOString(),
    preparedRows: acceptedRows,
    rejectedRows,
    sourceFileName: input.source.fileName,
    sourceSizeBytes: input.sourceSizeBytes,
    state: acceptedRows > 0 ? "ready" : "error",
  });

  await writeFile(
    path.join(input.outputDirectory, OFFICIAL_INDEX_METADATA_FILE),
    `${JSON.stringify(
      {
        baseDate: input.source.baseDate,
        preparedRows: acceptedRows,
        rejectedRows,
        sourceFileName: input.source.fileName,
      },
      null,
      2,
    )}\n`,
    SHARD_ENCODING,
  );

  return {
    acceptedRows,
    outputDirectory: input.outputDirectory,
    rejectedRows,
    status:
      acceptedRows > 0
        ? status
        : {
            ...status,
            errorMessage:
              "Nenhum registro válido foi encontrado no Simples.zip oficial.",
          },
  };
}

class ShardWriterPool {
  private readonly streams = new Map<string, WriteStream>();

  constructor(private readonly directory: string) {}

  async write(cnpjBasico: string, line: string): Promise<void> {
    const shardKey = cnpjBasico.slice(0, SHARD_PREFIX_LENGTH);
    const stream = await this.getStream(shardKey);

    if (!stream.write(line, SHARD_ENCODING)) {
      await once(stream, "drain");
    }
  }

  async closeAll(): Promise<void> {
    const streams = Array.from(this.streams.values());
    this.streams.clear();
    await Promise.all(streams.map(closeStream));
  }

  private async getStream(shardKey: string): Promise<WriteStream> {
    const cached = this.streams.get(shardKey);

    if (cached) {
      this.streams.delete(shardKey);
      this.streams.set(shardKey, cached);

      return cached;
    }

    const stream = createWriteStream(
      path.join(this.directory, `${shardKey}.tsv`),
      {
        flags: "a",
      },
    );
    this.streams.set(shardKey, stream);

    if (this.streams.size > MAX_OPEN_WRITE_SHARDS) {
      const [oldestShardKey, oldestStream] = this.streams.entries().next()
        .value as [string, WriteStream];
      this.streams.delete(oldestShardKey);
      await closeStream(oldestStream);
    }

    return stream;
  }
}

async function loadShard(
  filePath: string,
): Promise<ReadonlyMap<string, LocalPublicBaseRecord>> {
  let content: string;

  try {
    content = await readFile(filePath, SHARD_ENCODING);
  } catch (error) {
    if (isNoEntryError(error)) {
      return new Map();
    }

    throw error;
  }

  const records = new Map<string, LocalPublicBaseRecord>();

  for (const line of content.split("\n")) {
    if (!line) {
      continue;
    }

    const [cnpjBasico, simplesNacional, simei, updatedAt] =
      line.split(SHARD_SEPARATOR);

    if (!cnpjBasico || !/^\d{8}$/.test(cnpjBasico)) {
      continue;
    }

    records.set(cnpjBasico, {
      cnpj: createSyntheticHeadOfficeCnpj(cnpjBasico),
      cnpjBasico,
      razaoSocial: `CNPJ básico ${cnpjBasico}`,
      simplesNacional: simplesNacional === "1",
      simei: simei === "1",
      updatedAt: updatedAt || "data não informada",
    });
  }

  return records;
}

function serializeRecord(record: LocalPublicBaseRecord): string {
  return [
    record.cnpjBasico ?? record.cnpj.slice(0, 8),
    record.simplesNacional ? "1" : "0",
    record.simei ? "1" : "0",
    sanitizeShardField(record.updatedAt),
  ]
    .join(SHARD_SEPARATOR)
    .concat("\n");
}

function sanitizeShardField(value: string): string {
  return value.replace(/[\n\r\t]/g, " ").trim() || "data não informada";
}

function pruneReadCache(
  cache: Map<string, Promise<ReadonlyMap<string, LocalPublicBaseRecord>>>,
): void {
  while (cache.size > MAX_CACHED_READ_SHARDS) {
    const oldestKey = cache.keys().next().value as string | undefined;

    if (!oldestKey) {
      return;
    }

    cache.delete(oldestKey);
  }
}

function closeStream(stream: WriteStream): Promise<void> {
  return new Promise((resolve, reject) => {
    stream.once("error", reject);
    stream.end(resolve);
  });
}

function isNoEntryError(error: unknown): boolean {
  return (
    error !== null &&
    typeof error === "object" &&
    "code" in error &&
    error.code === "ENOENT"
  );
}

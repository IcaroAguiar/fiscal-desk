import { stat } from "node:fs/promises";
import type { Readable } from "node:stream";
import { crc32 } from "node:zlib";
import { type Entry, open, type ZipFile } from "yauzl";
import { prepareLocalPublicBaseFromOfficialSimplesStream } from "./local-public-base.official-simples";
import type {
  LocalPublicBasePrepareOfficialZipInput,
  LocalPublicBasePrepareResult,
  LocalPublicBaseRecord,
} from "./local-public-base.types";

type OfficialZipPrepareResult = LocalPublicBasePrepareResult & {
  records: LocalPublicBaseRecord[];
};

export async function prepareLocalPublicBaseFromOfficialSimplesZip(
  input: Omit<LocalPublicBasePrepareOfficialZipInput, "sourceSizeBytes"> & {
    sourceSizeBytes?: number;
  },
): Promise<OfficialZipPrepareResult> {
  const sourceSizeBytes =
    input.sourceSizeBytes ?? (await stat(input.zipFilePath)).size;
  const zipFile = await openZip(input.zipFilePath);

  try {
    const entry = await findSimplesCsvEntry(zipFile);
    const stream = await openEntryReadStream(zipFile, entry);

    return await prepareLocalPublicBaseFromOfficialSimplesStream(stream, {
      ...input,
      sourceSizeBytes,
    });
  } finally {
    zipFile.close();
  }
}

export async function assertReadableOfficialSimplesZip(
  filePath: string,
): Promise<void> {
  const zipFile = await openZip(filePath);

  try {
    const entry = await findSimplesCsvEntry(zipFile);
    await assertEntryContentIntegrity(zipFile, entry);
  } finally {
    zipFile.close();
  }
}

function openZip(filePath: string): Promise<ZipFile> {
  return new Promise((resolve, reject) => {
    open(filePath, { lazyEntries: true }, (error, zipFile) => {
      if (error) {
        reject(error);
        return;
      }

      if (!zipFile) {
        reject(new Error("Não foi possível abrir o Simples.zip oficial."));
        return;
      }

      resolve(zipFile);
    });
  });
}

function findSimplesCsvEntry(zipFile: ZipFile): Promise<Entry> {
  return new Promise((resolve, reject) => {
    zipFile.once("error", reject);
    zipFile.once("end", () => {
      reject(
        new Error("CSV de Simples Nacional não encontrado no ZIP oficial."),
      );
    });
    zipFile.on("entry", (entry: Entry) => {
      if (isSimplesCsvEntry(entry)) {
        resolve(entry);
        return;
      }

      zipFile.readEntry();
    });
    zipFile.readEntry();
  });
}

function openEntryReadStream(
  zipFile: ZipFile,
  entry: Entry,
): Promise<Readable> {
  return new Promise((resolve, reject) => {
    zipFile.openReadStream(entry, (error, stream) => {
      if (error) {
        reject(error);
        return;
      }

      if (!stream) {
        reject(new Error("Não foi possível ler o CSV do Simples.zip oficial."));
        return;
      }

      resolve(stream);
    });
  });
}

async function assertEntryContentIntegrity(
  zipFile: ZipFile,
  entry: Entry,
): Promise<void> {
  const stream = await openEntryReadStream(zipFile, entry);
  let checksum = 0;
  let uncompressedSize = 0;

  for await (const chunk of stream) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    uncompressedSize += buffer.byteLength;
    checksum = crc32(buffer, checksum);
  }

  if (uncompressedSize !== entry.uncompressedSize) {
    throw new Error("Tamanho inválido no CSV do Simples.zip oficial.");
  }

  if (checksum >>> 0 !== entry.crc32 >>> 0) {
    throw new Error("CRC inválido no CSV do Simples.zip oficial.");
  }
}

function isSimplesCsvEntry(entry: Entry): boolean {
  const fileName = entry.fileName.toLowerCase();

  return (
    !fileName.endsWith("/") &&
    fileName.includes("simples") &&
    fileName.endsWith(".csv")
  );
}

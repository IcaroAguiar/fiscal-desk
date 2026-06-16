import { createWriteStream } from "node:fs";
import {
  mkdir,
  readFile,
  rename,
  stat,
  unlink,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import type { ReadableStream as NodeReadableStream } from "node:stream/web";
import { assertReadableOfficialSimplesZip } from "./local-public-base.official-zip";
import type { LocalPublicBaseOfficialSource } from "./local-public-base.types";

type DownloadInput = {
  directory: string;
  fetchFile?: typeof fetch;
  source: LocalPublicBaseOfficialSource;
};

export type LocalPublicBaseOfficialDownloadResult = {
  filePath: string;
  resumed: boolean;
  sizeBytes: number;
};

type OfficialDownloadMetadata = {
  baseDate: string;
  fileName: string;
  fileUrl: string;
  kind: LocalPublicBaseOfficialSource["kind"];
  lastModified: string;
  sizeLabel: string;
};

type OfficialDownloadRequest = {
  headers: Record<string, string>;
  url: string;
};

export async function downloadLocalPublicBaseOfficialSource(
  input: DownloadInput,
): Promise<LocalPublicBaseOfficialDownloadResult> {
  await mkdir(input.directory, { recursive: true });

  const metadata = createOfficialDownloadMetadata(input.source);
  const finalPath = path.join(
    input.directory,
    createOfficialDownloadFileName(input.source),
  );
  const partialPath = `${finalPath}.part`;
  const metadataPath = `${finalPath}.metadata.json`;
  const partialMetadataPath = `${partialPath}.metadata.json`;
  const existingFinalSize = await getFileSize(finalPath);

  if (existingFinalSize > 0) {
    if (
      (await matchesOfficialDownloadMetadata(metadataPath, metadata)) &&
      (await isReadableOfficialSimplesZip(finalPath))
    ) {
      return {
        filePath: finalPath,
        resumed: false,
        sizeBytes: existingFinalSize,
      };
    }

    await unlink(finalPath).catch(() => undefined);
    await unlink(metadataPath).catch(() => undefined);
    await unlink(partialPath).catch(() => undefined);
    await unlink(partialMetadataPath).catch(() => undefined);
  }

  const partialSize = await getFileSize(partialPath);
  const canAttemptResume =
    partialSize > 0 &&
    (await matchesOfficialDownloadMetadata(partialMetadataPath, metadata));
  const effectivePartialSize = canAttemptResume ? partialSize : 0;

  if (partialSize > 0 && !canAttemptResume) {
    await unlink(partialPath).catch(() => undefined);
    await unlink(partialMetadataPath).catch(() => undefined);
  }

  const downloadRequest = createOfficialDownloadRequest(input.source);
  const response = await (input.fetchFile ?? fetch)(downloadRequest.url, {
    ...(effectivePartialSize > 0
      ? {
          headers: {
            ...downloadRequest.headers,
            Range: `bytes=${effectivePartialSize}-`,
          },
        }
      : Object.keys(downloadRequest.headers).length > 0
        ? { headers: downloadRequest.headers }
        : {}),
  });

  if (!response.ok) {
    throw new Error(
      `Fonte oficial indisponível para download (${response.status}).`,
    );
  }

  if (!response.body) {
    throw new Error("Fonte oficial não retornou conteúdo para download.");
  }

  const canResume = effectivePartialSize > 0 && response.status === 206;
  const writeStream = createWriteStream(partialPath, {
    flags: canResume ? "a" : "w",
  });

  await writeOfficialDownloadMetadata(partialMetadataPath, metadata);
  await pipeline(
    Readable.fromWeb(
      response.body as unknown as NodeReadableStream<Uint8Array>,
    ),
    writeStream,
  );

  const downloadedSize = await getFileSize(partialPath);

  if (downloadedSize <= 0) {
    await unlink(partialPath).catch(() => undefined);
    throw new Error("Download oficial não gerou arquivo válido.");
  }

  if (!(await isReadableOfficialSimplesZip(partialPath))) {
    await unlink(partialPath).catch(() => undefined);
    await unlink(partialMetadataPath).catch(() => undefined);
    throw new Error("Download oficial não retornou um Simples.zip válido.");
  }

  await rename(partialPath, finalPath);
  await writeOfficialDownloadMetadata(metadataPath, metadata);
  await unlink(partialMetadataPath).catch(() => undefined);

  return {
    filePath: finalPath,
    resumed: canResume,
    sizeBytes: downloadedSize,
  };
}

async function isReadableOfficialSimplesZip(
  filePath: string,
): Promise<boolean> {
  try {
    await assertReadableOfficialSimplesZip(filePath);
    return true;
  } catch {
    return false;
  }
}

function createOfficialDownloadFileName(
  source: LocalPublicBaseOfficialSource,
): string {
  const safeBaseDate = source.baseDate.replace(/[^\d-]/g, "");
  const safeFileName = path.basename(source.fileName).replace(/[^\w.-]/g, "_");

  return `${safeBaseDate || "atual"}-${safeFileName || "Simples.zip"}`;
}

function createOfficialDownloadMetadata(
  source: LocalPublicBaseOfficialSource,
): OfficialDownloadMetadata {
  return {
    baseDate: source.baseDate,
    fileName: source.fileName,
    fileUrl: source.fileUrl,
    kind: source.kind,
    lastModified: source.lastModified,
    sizeLabel: source.sizeLabel,
  };
}

function createOfficialDownloadRequest(
  source: LocalPublicBaseOfficialSource,
): OfficialDownloadRequest {
  const nextcloudToken = extractNextcloudPublicShareTokenFromUrl(
    source.fileUrl,
  );

  if (nextcloudToken && source.directoryUrl.includes("/public.php/webdav/")) {
    return {
      headers: {
        Authorization: createBasicAuthHeader(nextcloudToken),
      },
      url: new URL(
        path.basename(source.fileName),
        source.directoryUrl,
      ).toString(),
    };
  }

  return {
    headers: {},
    url: source.fileUrl,
  };
}

function extractNextcloudPublicShareTokenFromUrl(
  fileUrl: string,
): string | null {
  try {
    const url = new URL(fileUrl);
    const match = url.pathname.match(/\/s\/([^/]+)\//);

    return match?.[1] ?? null;
  } catch {
    return null;
  }
}

function createBasicAuthHeader(username: string): string {
  return `Basic ${Buffer.from(`${username}:`).toString("base64")}`;
}

async function matchesOfficialDownloadMetadata(
  metadataPath: string,
  expected: OfficialDownloadMetadata,
): Promise<boolean> {
  try {
    const raw = await readFile(metadataPath, "utf8");
    const parsed = JSON.parse(raw) as Partial<OfficialDownloadMetadata>;

    return (
      parsed.baseDate === expected.baseDate &&
      parsed.fileName === expected.fileName &&
      parsed.fileUrl === expected.fileUrl &&
      parsed.kind === expected.kind &&
      parsed.lastModified === expected.lastModified &&
      parsed.sizeLabel === expected.sizeLabel
    );
  } catch {
    return false;
  }
}

async function writeOfficialDownloadMetadata(
  metadataPath: string,
  metadata: OfficialDownloadMetadata,
): Promise<void> {
  await writeFile(
    metadataPath,
    `${JSON.stringify(metadata, null, 2)}\n`,
    "utf8",
  );
}

async function getFileSize(filePath: string): Promise<number> {
  try {
    return (await stat(filePath)).size;
  } catch {
    return 0;
  }
}

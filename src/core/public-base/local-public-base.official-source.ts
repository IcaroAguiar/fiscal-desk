import type { LocalPublicBaseOfficialSource } from "./local-public-base.types";

const OFFICIAL_CNPJ_OPEN_DATA_BASE_URL =
  "https://arquivos.receitafederal.gov.br/dados/cnpj/dados_abertos_cnpj/";
const DEFAULT_OFFICIAL_SOURCE_TIMEOUT_MS = 15_000;
const MIN_OFFICIAL_SOURCE_TIMEOUT_MS = 500;
const MAX_OFFICIAL_SOURCE_TIMEOUT_MS = 60_000;
const SIMPLES_ARCHIVE_FILE_NAME = "Simples.zip";
const MONTHLY_DIRECTORY_PATTERN = /^\d{4}-\d{2}\/$/;

type FetchTextOptions = {
  signal?: AbortSignal;
};

type FetchText = (url: string, options?: FetchTextOptions) => Promise<string>;

type DiscoverOfficialSourceInput = {
  baseUrl?: string;
  fetchText?: FetchText;
  timeoutMs?: number;
};

type ApacheIndexEntry = {
  href: string;
  name: string;
  lastModified: string;
  sizeLabel: string;
};

export async function discoverLocalPublicBaseOfficialSource(
  input: DiscoverOfficialSourceInput = {},
): Promise<LocalPublicBaseOfficialSource> {
  const baseUrl = normalizeOfficialBaseUrl(
    input.baseUrl ?? OFFICIAL_CNPJ_OPEN_DATA_BASE_URL,
  );
  const fetchText = input.fetchText ?? fetchOfficialSourceText;
  const timeoutMs = normalizeOfficialSourceTimeoutMs(input.timeoutMs);
  const rootHtml = await fetchTextWithTimeout(fetchText, baseUrl, timeoutMs);
  const directories = parseApacheIndexEntries(rootHtml)
    .filter((entry) => MONTHLY_DIRECTORY_PATTERN.test(entry.name))
    .sort((first, second) => second.name.localeCompare(first.name));

  for (const directory of directories) {
    const directoryUrl = resolveOfficialMonthlyDirectoryUrl(
      directory.href,
      directory.name,
      baseUrl,
    );

    if (!directoryUrl) {
      continue;
    }

    const directoryHtml = await fetchTextWithTimeout(
      fetchText,
      directoryUrl,
      timeoutMs,
    );
    const source = parseOfficialSourceDirectoryIndex(
      directoryHtml,
      directoryUrl,
      baseUrl,
    );

    if (source) {
      return source;
    }
  }

  throw new Error(
    "Nenhuma fonte oficial Simples.zip foi encontrada no índice público da Receita.",
  );
}

export function parseOfficialSourceDirectoryIndex(
  html: string,
  directoryUrl: string,
  sourcePageUrl: string,
): LocalPublicBaseOfficialSource | null {
  const sourceEntry = parseApacheIndexEntries(html).find(
    (entry) => entry.name === SIMPLES_ARCHIVE_FILE_NAME,
  );

  if (!sourceEntry) {
    return null;
  }

  const baseDate = extractOfficialDirectoryBaseDate(
    directoryUrl,
    sourcePageUrl,
  );

  if (!baseDate) {
    return null;
  }

  const fileUrl = resolveOfficialArchiveUrl(sourceEntry.href, directoryUrl);

  if (!fileUrl) {
    return null;
  }

  return {
    kind: "simples",
    baseDate,
    directoryUrl,
    fileName: sourceEntry.name,
    fileUrl,
    lastModified: sourceEntry.lastModified,
    sizeLabel: sourceEntry.sizeLabel,
    sourcePageUrl,
  };
}

export function parseApacheIndexEntries(html: string): ApacheIndexEntry[] {
  const entries: ApacheIndexEntry[] = [];
  const entryPattern =
    /<a\b[^>]*\bhref=["']([^"']+)["'][^>]*>([^<]+)<\/a>([\s\S]*?)(?=<a\b[^>]*\bhref=|$)/gi;

  for (const match of html.matchAll(entryPattern)) {
    const [, href, name, metadataHtml] = match;
    const metadata = (metadataHtml ?? "")
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ");
    const metadataMatch = metadata.match(
      /(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2})\s+([0-9.]+[KMGTP]?|-)/i,
    );
    const lastModified = metadataMatch?.[1];
    const sizeLabel = metadataMatch?.[2];

    if (!href || !name || !lastModified || !sizeLabel) {
      continue;
    }

    entries.push({
      href: decodeHtmlAttribute(href),
      name: decodeHtmlText(name),
      lastModified,
      sizeLabel,
    });
  }

  return entries;
}

async function fetchTextWithTimeout(
  fetchText: FetchText,
  url: string,
  timeoutMs: number,
): Promise<string> {
  const controller = new AbortController();
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      controller.abort();
      reject(
        new Error(
          "Tempo limite ao consultar a fonte oficial da Base Pública Local.",
        ),
      );
    }, timeoutMs);
  });

  try {
    return await Promise.race([
      fetchText(url, { signal: controller.signal }),
      timeout,
    ]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

function normalizeOfficialSourceTimeoutMs(timeoutMs?: number): number {
  if (typeof timeoutMs !== "number" || !Number.isFinite(timeoutMs)) {
    return DEFAULT_OFFICIAL_SOURCE_TIMEOUT_MS;
  }

  return Math.min(
    MAX_OFFICIAL_SOURCE_TIMEOUT_MS,
    Math.max(MIN_OFFICIAL_SOURCE_TIMEOUT_MS, Math.trunc(timeoutMs)),
  );
}

function normalizeOfficialBaseUrl(baseUrl: string): string {
  const url = new URL(baseUrl);

  if (!url.pathname.endsWith("/")) {
    url.pathname = `${url.pathname}/`;
  }

  url.search = "";
  url.hash = "";

  return url.toString();
}

function resolveOfficialMonthlyDirectoryUrl(
  href: string,
  directoryName: string,
  baseUrl: string,
): string | null {
  if (hasParentTraversal(href)) {
    return null;
  }

  const base = new URL(baseUrl);
  const resolved = new URL(href, base);
  const expected = new URL(directoryName, base);

  if (
    resolved.origin !== base.origin ||
    resolved.origin !== expected.origin ||
    resolved.pathname !== expected.pathname ||
    !resolved.pathname.startsWith(base.pathname) ||
    resolved.search ||
    resolved.hash
  ) {
    return null;
  }

  return resolved.toString();
}

function resolveOfficialArchiveUrl(
  href: string,
  directoryUrl: string,
): string | null {
  if (hasParentTraversal(href)) {
    return null;
  }

  const directory = new URL(directoryUrl);
  const resolved = new URL(href, directory);
  const expected = new URL(SIMPLES_ARCHIVE_FILE_NAME, directory);

  if (
    resolved.origin !== directory.origin ||
    resolved.origin !== expected.origin ||
    resolved.pathname !== expected.pathname ||
    resolved.search ||
    resolved.hash
  ) {
    return null;
  }

  return resolved.toString();
}

function extractOfficialDirectoryBaseDate(
  directoryUrl: string,
  sourcePageUrl: string,
): string | null {
  const sourcePage = new URL(normalizeOfficialBaseUrl(sourcePageUrl));
  const directory = new URL(directoryUrl);
  const baseDate = directory.pathname.match(/\/(\d{4}-\d{2})\/$/)?.[1];

  if (
    !baseDate ||
    directory.origin !== sourcePage.origin ||
    !directory.pathname.startsWith(sourcePage.pathname) ||
    directory.search ||
    directory.hash
  ) {
    return null;
  }

  return baseDate;
}

function hasParentTraversal(href: string): boolean {
  const pathOnly = href.split(/[?#]/, 1)[0] ?? "";

  try {
    return pathOnly
      .split("/")
      .some((segment) => decodeURIComponent(segment) === "..");
  } catch {
    return true;
  }
}

function decodeHtmlAttribute(value: string): string {
  return value.replace(/&amp;/g, "&");
}

function decodeHtmlText(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

async function fetchOfficialSourceText(
  url: string,
  options: FetchTextOptions = {},
): Promise<string> {
  const response = await fetch(url, {
    headers: {
      Accept: "text/html,text/plain",
    },
    ...(options.signal ? { signal: options.signal } : {}),
  });

  if (!response.ok) {
    throw new Error(
      "Não foi possível consultar a fonte oficial da Base Pública Local.",
    );
  }

  return response.text();
}

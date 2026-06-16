import type { LocalPublicBaseOfficialSource } from "./local-public-base.types";

const OFFICIAL_CNPJ_OPEN_DATA_BASE_URL =
  "https://arquivos.receitafederal.gov.br/dados/cnpj/dados_abertos_cnpj/";
// Public Receita landing page used to discover the official public Nextcloud share.
// This URL is intentionally versioned; it is not a private credential.
const OFFICIAL_NEXTCLOUD_PUBLIC_SHARE_URL =
  "https://arquivos.receitafederal.gov.br/";
const DEFAULT_OFFICIAL_SOURCE_TIMEOUT_MS = 15_000;
const MIN_OFFICIAL_SOURCE_TIMEOUT_MS = 500;
const MAX_OFFICIAL_SOURCE_TIMEOUT_MS = 60_000;
const SIMPLES_ARCHIVE_FILE_NAME = "Simples.zip";
const MONTHLY_DIRECTORY_PATTERN = /^\d{4}-\d{2}\/$/;
const NEXTCLOUD_PUBLIC_WEBDAV_PATH = "/public.php/webdav/";
const MAX_NEXTCLOUD_DIRECTORIES_TO_SCAN = 120;

type FetchTextOptions = {
  body?: string;
  headers?: Record<string, string>;
  method?: "GET" | "PROPFIND";
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

type NextcloudWebDavEntry = {
  href: string;
  isDirectory: boolean;
  lastModified: string;
  name: string;
  path: string;
  sizeLabel: string;
};

export async function discoverLocalPublicBaseOfficialSource(
  input: DiscoverOfficialSourceInput = {},
): Promise<LocalPublicBaseOfficialSource> {
  const fetchText = input.fetchText ?? fetchOfficialSourceText;
  const timeoutMs = normalizeOfficialSourceTimeoutMs(input.timeoutMs);
  const candidateBaseUrls = input.baseUrl
    ? [normalizeOfficialBaseUrl(input.baseUrl)]
    : [
        normalizeOfficialBaseUrl(OFFICIAL_NEXTCLOUD_PUBLIC_SHARE_URL),
        normalizeOfficialBaseUrl(OFFICIAL_CNPJ_OPEN_DATA_BASE_URL),
      ];
  const errors: string[] = [];

  for (const baseUrl of candidateBaseUrls) {
    try {
      return await discoverSingleOfficialSource({
        baseUrl,
        fetchText,
        timeoutMs,
      });
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
    }
  }

  throw new Error(errors.at(-1) ?? "Fonte oficial indisponível.");
}

async function discoverSingleOfficialSource(input: {
  baseUrl: string;
  fetchText: FetchText;
  timeoutMs: number;
}): Promise<LocalPublicBaseOfficialSource> {
  const { baseUrl, fetchText, timeoutMs } = input;
  const rootHtml = await fetchTextWithTimeout(fetchText, baseUrl, timeoutMs);
  const nextcloudToken = extractNextcloudPublicShareToken(rootHtml);

  if (nextcloudToken) {
    return discoverNextcloudOfficialSource({
      baseUrl,
      fetchText,
      timeoutMs,
      token: nextcloudToken,
    });
  }

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

async function discoverNextcloudOfficialSource(input: {
  baseUrl: string;
  fetchText: FetchText;
  timeoutMs: number;
  token: string;
}): Promise<LocalPublicBaseOfficialSource> {
  const queue = [""];
  const visited = new Set<string>();
  const candidates: LocalPublicBaseOfficialSource[] = [];

  while (queue.length > 0 && visited.size < MAX_NEXTCLOUD_DIRECTORIES_TO_SCAN) {
    const currentPath = queue.shift() ?? "";
    if (visited.has(currentPath)) {
      continue;
    }

    visited.add(currentPath);

    const entries = await fetchNextcloudWebDavEntries({
      ...input,
      directoryPath: currentPath,
    });
    const currentBaseDate = extractMonthlyBaseDateFromPath(currentPath);
    const simplesArchive = entries.find(
      (entry) => !entry.isDirectory && entry.name === SIMPLES_ARCHIVE_FILE_NAME,
    );

    if (simplesArchive && currentBaseDate) {
      candidates.push(
        createNextcloudOfficialSource({
          baseDate: currentBaseDate,
          directoryPath: currentPath,
          entry: simplesArchive,
          publicShareUrl: input.baseUrl,
          token: input.token,
        }),
      );
      continue;
    }

    const nextDirectories = entries
      .filter((entry) => entry.isDirectory)
      .filter((entry) => shouldScanNextcloudDirectory(entry.path));

    queue.push(...nextDirectories.map((entry) => entry.path));
  }

  const latest = candidates.sort((first, second) =>
    second.baseDate.localeCompare(first.baseDate),
  )[0];

  if (!latest) {
    throw new Error(
      "Nenhuma fonte oficial Simples.zip foi encontrada no compartilhamento público da Receita.",
    );
  }

  return latest;
}

async function fetchNextcloudWebDavEntries(input: {
  baseUrl: string;
  directoryPath: string;
  fetchText: FetchText;
  timeoutMs: number;
  token: string;
}): Promise<NextcloudWebDavEntry[]> {
  const directoryUrl = createNextcloudWebDavDirectoryUrl(
    input.baseUrl,
    input.directoryPath,
  );
  const xml = await fetchTextWithTimeout(
    input.fetchText,
    directoryUrl,
    input.timeoutMs,
    {
      headers: {
        Authorization: createBasicAuthHeader(input.token),
        Depth: "1",
      },
      method: "PROPFIND",
    },
  );

  return parseNextcloudWebDavEntries(xml, input.directoryPath);
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

export function parseNextcloudWebDavEntries(
  xml: string,
  currentDirectoryPath: string,
): NextcloudWebDavEntry[] {
  const entries: NextcloudWebDavEntry[] = [];
  const currentPath = normalizeNextcloudPath(currentDirectoryPath);
  const responsePattern =
    /<(?:d:)?response\b[^>]*>([\s\S]*?)<\/(?:d:)?response>/gi;

  for (const match of xml.matchAll(responsePattern)) {
    const responseXml = match[1] ?? "";
    const href = decodeXmlText(
      matchFirst(responseXml, /<(?:d:)?href\b[^>]*>([\s\S]*?)<\/(?:d:)?href>/i),
    );
    const path = extractNextcloudWebDavPath(href);

    if (path === null || path === currentPath) {
      continue;
    }

    const name =
      decodeXmlText(
        matchFirst(
          responseXml,
          /<(?:d:)?displayname\b[^>]*>([\s\S]*?)<\/(?:d:)?displayname>/i,
        ),
      ) || getLastNextcloudPathSegment(path);

    if (!name) {
      continue;
    }

    entries.push({
      href,
      isDirectory: /<(?:d:)?collection\s*\/?>/i.test(responseXml),
      lastModified:
        decodeXmlText(
          matchFirst(
            responseXml,
            /<(?:d:)?getlastmodified\b[^>]*>([\s\S]*?)<\/(?:d:)?getlastmodified>/i,
          ),
        ) || "data não informada",
      name,
      path,
      sizeLabel: formatByteSizeLabel(
        Number(
          matchFirst(
            responseXml,
            /<(?:d:)?getcontentlength\b[^>]*>(\d+)<\/(?:d:)?getcontentlength>/i,
          ),
        ),
      ),
    });
  }

  return entries;
}

async function fetchTextWithTimeout(
  fetchText: FetchText,
  url: string,
  timeoutMs: number,
  options: Omit<FetchTextOptions, "signal"> = {},
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
      fetchText(url, { ...options, signal: controller.signal }),
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

function extractNextcloudPublicShareToken(html: string): string | null {
  const encodedToken = matchFirst(
    html,
    /id=["']initial-state-files_sharing-sharingToken["'][^>]*\bvalue=["']([^"']+)["']/i,
  );

  if (!encodedToken) {
    return null;
  }

  try {
    const decoded = Buffer.from(decodeHtmlAttribute(encodedToken), "base64")
      .toString("utf8")
      .trim();
    const parsed = JSON.parse(decoded) as unknown;

    return typeof parsed === "string" && parsed ? parsed : null;
  } catch {
    return null;
  }
}

function createNextcloudWebDavDirectoryUrl(
  baseUrl: string,
  directoryPath: string,
): string {
  const url = new URL(NEXTCLOUD_PUBLIC_WEBDAV_PATH, baseUrl);
  const normalizedPath = normalizeNextcloudPath(directoryPath);
  const suffix = normalizedPath
    .split("/")
    .filter(Boolean)
    .map(encodeURIComponent)
    .join("/");

  url.pathname = `${url.pathname}${suffix}${suffix ? "/" : ""}`;

  return url.toString();
}

function createBasicAuthHeader(username: string): string {
  return `Basic ${Buffer.from(`${username}:`).toString("base64")}`;
}

function parseNextcloudDownloadFileUrl(input: {
  directoryPath: string;
  fileName: string;
  publicShareUrl: string;
  token: string;
}): string {
  const url = new URL(
    `/index.php/s/${input.token}/download`,
    input.publicShareUrl,
  );
  const directoryPath = normalizeNextcloudPath(input.directoryPath);

  url.searchParams.set("path", directoryPath ? `/${directoryPath}` : "/");
  url.searchParams.set("files", input.fileName);

  return url.toString();
}

function createNextcloudOfficialSource(input: {
  baseDate: string;
  directoryPath: string;
  entry: NextcloudWebDavEntry;
  publicShareUrl: string;
  token: string;
}): LocalPublicBaseOfficialSource {
  const directoryUrl = createNextcloudWebDavDirectoryUrl(
    input.publicShareUrl,
    input.directoryPath,
  );

  return {
    kind: "simples",
    baseDate: input.baseDate,
    directoryUrl,
    fileName: input.entry.name,
    fileUrl: parseNextcloudDownloadFileUrl({
      directoryPath: input.directoryPath,
      fileName: input.entry.name,
      publicShareUrl: input.publicShareUrl,
      token: input.token,
    }),
    lastModified: input.entry.lastModified,
    sizeLabel: input.entry.sizeLabel,
    sourcePageUrl: input.publicShareUrl,
  };
}

function shouldScanNextcloudDirectory(path: string): boolean {
  const normalizedPath = normalizeNextcloudPath(path);
  const segment = getLastNextcloudPathSegment(normalizedPath).toLowerCase();

  return (
    MONTHLY_DIRECTORY_PATTERN.test(`${segment}/`) ||
    segment.includes("cnpj") ||
    segment.includes("cadastros") ||
    segment.includes("dados") ||
    segment.includes("publico") ||
    segment.includes("público")
  );
}

function extractMonthlyBaseDateFromPath(path: string): string | null {
  return (
    normalizeNextcloudPath(path).match(/(?:^|\/)(\d{4}-\d{2})\/?$/)?.[1] ?? null
  );
}

function extractNextcloudWebDavPath(href: string): string | null {
  const marker = NEXTCLOUD_PUBLIC_WEBDAV_PATH;
  const markerIndex = href.indexOf(marker);

  if (markerIndex === -1) {
    return null;
  }

  const rawPath =
    href.slice(markerIndex + marker.length).split(/[?#]/, 1)[0] ?? "";

  try {
    return normalizeNextcloudPath(decodeURIComponent(rawPath));
  } catch {
    return null;
  }
}

function normalizeNextcloudPath(pathValue: string): string {
  return pathValue
    .split("/")
    .filter(Boolean)
    .filter((segment) => segment !== ".")
    .join("/");
}

function getLastNextcloudPathSegment(pathValue: string): string {
  return (
    normalizeNextcloudPath(pathValue).split("/").filter(Boolean).at(-1) ?? ""
  );
}

function formatByteSizeLabel(size: number): string {
  if (!Number.isFinite(size) || size <= 0) {
    return "-";
  }

  const units = ["B", "K", "M", "G", "T"] as const;
  let value = size;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${Number.isInteger(value) ? value : value.toFixed(1)}${units[unitIndex]}`;
}

function matchFirst(value: string, pattern: RegExp): string {
  return value.match(pattern)?.[1]?.trim() ?? "";
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

function decodeXmlText(value: string): string {
  return decodeHtmlText(value).replace(/&apos;/g, "'");
}

async function fetchOfficialSourceText(
  url: string,
  options: FetchTextOptions = {},
): Promise<string> {
  const response = await fetch(url, {
    headers: {
      Accept: "text/html,text/plain",
      ...(options.headers ?? {}),
    },
    ...(options.body ? { body: options.body } : {}),
    ...(options.method ? { method: options.method } : {}),
    ...(options.signal ? { signal: options.signal } : {}),
  });

  if (!response.ok) {
    throw new Error(
      `Não foi possível consultar a fonte oficial da Base Pública Local (${response.status} ${response.statusText || "sem detalhe"} em ${url}). Use "Preparar base" com um CSV local confiável ou tente novamente mais tarde.`,
    );
  }

  return response.text();
}

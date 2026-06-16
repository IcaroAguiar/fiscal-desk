import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { Readable } from "node:stream";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  assertLocalPublicBasePreparationConsent,
  createLocalPublicBaseIndex,
  createLocalPublicBaseIndexFromRecords,
  getLocalPublicBaseStatus,
  prepareLocalPublicBaseFromCsv,
} from "../../src/core/public-base/local-public-base.index";
import { downloadLocalPublicBaseOfficialSource } from "../../src/core/public-base/local-public-base.official-download";
import {
  createRecordFromOfficialSimplesRow,
  prepareLocalPublicBaseFromOfficialSimplesStream,
} from "../../src/core/public-base/local-public-base.official-simples";
import {
  discoverLocalPublicBaseOfficialSource,
  parseApacheIndexEntries,
  parseNextcloudWebDavEntries,
  parseOfficialSourceDirectoryIndex,
} from "../../src/core/public-base/local-public-base.official-source";
import { prepareLocalPublicBaseFromOfficialSimplesZip } from "../../src/core/public-base/local-public-base.official-zip";
import { LocalPublicBaseStore } from "../../src/core/public-base/local-public-base.store";
import type { LocalPublicBaseOfficialSource } from "../../src/core/public-base/local-public-base.types";
import { LocalPublicBaseSimplesLookupAdapter } from "../../src/core/simples/adapters/local-public-base-simples-lookup.adapter";

const tempDirs: string[] = [];
const fixturePath = resolve("test/fixtures/smoke/base-publica-local.csv");
const localPublicBaseIndexFileName = "local-public-base-index.json";
const acceptedConsent = {
  accepted: true,
  acceptedAt: "2026-06-13T00:00:00.000Z",
  baseDateAcknowledged: "2026-05-20",
  stalenessWarningAcknowledged: "A Base Pública Local pode estar defasada.",
} as const;
const officialSimplesZipBase64 =
  "UEsDBAoAAAAAAC5yzlw7lekoGQAAABkAAAAVABwARi5LMDMyMDBXLlNJTVBMRVMuQ1NWVVQJAAMo4i5qKOIuanV4CwABBPUBAAAEAAAAADExMjIyMzMzO1M7MjAyMDAxMDE7O047OwpQSwECHgMKAAAAAAAucs5cO5XpKBkAAAAZAAAAFQAYAAAAAAABAAAApIEAAAAARi5LMDMyMDBXLlNJTVBMRVMuQ1NWVVQFAAMo4i5qdXgLAAEE9QEAAAQAAAAAUEsFBgAAAAABAAEAWwAAAGgAAAAAAA==";
const officialZipWithoutSimplesBase64 =
  "UEsDBAoAAAAAAD1yzlw7lekoGQAAABkAAAAJABwAT1VUUk8uQ1NWVVQJAANF4i5qReIuanV4CwABBPUBAAAEAAAAADExMjIyMzMzO1M7MjAyMDAxMDE7O047OwpQSwECHgMKAAAAAAA9cs5cO5XpKBkAAAAZAAAACQAYAAAAAAABAAAApIEAAAAAT1VUUk8uQ1NWVVQFAANF4i5qdXgLAAEE9QEAAAQAAAAAUEsFBgAAAAABAAEATwAAAFwAAAAAAA==";
type CapturedWarning = {
  message: string;
  metadata: Record<string, unknown>;
};

function createWebDavResponse(
  entries: Array<{
    href: string;
    isDirectory: boolean;
    name: string;
    size?: number;
  }>,
): string {
  return `<?xml version="1.0"?>
    <d:multistatus xmlns:d="DAV:">
      ${entries
        .map(
          (entry) => `<d:response>
            <d:href>${entry.href}</d:href>
            <d:propstat>
              <d:prop>
                <d:displayname>${entry.name}</d:displayname>
                <d:getlastmodified>Mon, 15 Jun 2026 10:00:00 GMT</d:getlastmodified>
                <d:getcontentlength>${entry.size ?? 0}</d:getcontentlength>
                <d:resourcetype>${entry.isDirectory ? "<d:collection/>" : ""}</d:resourcetype>
              </d:prop>
            </d:propstat>
          </d:response>`,
        )
        .join("\n")}
    </d:multistatus>`;
}

afterEach(async () => {
  await Promise.all(
    tempDirs
      .splice(0)
      .map((directory) => rm(directory, { force: true, recursive: true })),
  );
});

describe("Base Pública Local", () => {
  it("parses Receita Federal public CNPJ index entries", () => {
    const entries = parseApacheIndexEntries(`
      <a class="dir" href='2026-01/'>2026-01/</a> 2026-01-11 14:59 -
      <a href="cnpj.tar.gz?download=1&amp;mirror=main">cnpj.tar.gz</a> 2026-01-27 12:21 60G
    `);

    expect(entries).toEqual([
      {
        href: "2026-01/",
        lastModified: "2026-01-11 14:59",
        name: "2026-01/",
        sizeLabel: "-",
      },
      {
        href: "cnpj.tar.gz?download=1&mirror=main",
        lastModified: "2026-01-27 12:21",
        name: "cnpj.tar.gz",
        sizeLabel: "60G",
      },
    ]);
  });

  it("discovers the latest official Simples archive without requiring the 60GB bundle", async () => {
    const rootUrl =
      "https://arquivos.receitafederal.gov.br/dados/cnpj/dados_abertos_cnpj/";
    const responses = new Map([
      [
        rootUrl,
        [
          '<a href="cnpj.tar.gz">cnpj.tar.gz</a> 2026-01-27 12:21 60G',
          '<a href="2025-12/">2025-12/</a> 2025-12-14 15:37 -',
          '<a href="2026-01/">2026-01/</a> 2026-01-11 14:59 -',
        ].join("\n"),
      ],
      [
        `${rootUrl}2026-01/`,
        [
          '<a href="Socios0.zip">Socios0.zip</a> 2026-01-11 14:59 203M',
          '<a href="Simples.zip">Simples.zip</a> 2026-01-11 14:58 268M',
        ].join("\n"),
      ],
    ]);

    await expect(
      discoverLocalPublicBaseOfficialSource({
        baseUrl: rootUrl,
        fetchText: async (url) => responses.get(url) ?? "",
      }),
    ).resolves.toEqual({
      baseDate: "2026-01",
      directoryUrl: `${rootUrl}2026-01/`,
      fileName: "Simples.zip",
      fileUrl: `${rootUrl}2026-01/Simples.zip`,
      kind: "simples",
      lastModified: "2026-01-11 14:58",
      sizeLabel: "268M",
      sourcePageUrl: rootUrl,
    });
  });

  it("discovers official Simples archive from the Receita public Nextcloud share", async () => {
    const shareUrl = "https://arquivos.receitafederal.gov.br/";
    const token = "public-share-token";
    const encodedToken = Buffer.from(JSON.stringify(token)).toString("base64");
    const responses = new Map([
      [
        shareUrl,
        `<input id="initial-state-files_sharing-sharingToken" value="${encodedToken}">`,
      ],
      [
        `${shareUrl}public.php/webdav/`,
        createWebDavResponse([
          { href: "/public.php/webdav/", isDirectory: true, name: "" },
          {
            href: "/public.php/webdav/Dados/",
            isDirectory: true,
            name: "Dados",
          },
        ]),
      ],
      [
        `${shareUrl}public.php/webdav/Dados/`,
        createWebDavResponse([
          {
            href: "/public.php/webdav/Dados/",
            isDirectory: true,
            name: "Dados",
          },
          {
            href: "/public.php/webdav/Dados/Cadastros/",
            isDirectory: true,
            name: "Cadastros",
          },
        ]),
      ],
      [
        `${shareUrl}public.php/webdav/Dados/Cadastros/`,
        createWebDavResponse([
          {
            href: "/public.php/webdav/Dados/Cadastros/",
            isDirectory: true,
            name: "Cadastros",
          },
          {
            href: "/public.php/webdav/Dados/Cadastros/CNPJ/",
            isDirectory: true,
            name: "CNPJ",
          },
        ]),
      ],
      [
        `${shareUrl}public.php/webdav/Dados/Cadastros/CNPJ/`,
        createWebDavResponse([
          {
            href: "/public.php/webdav/Dados/Cadastros/CNPJ/",
            isDirectory: true,
            name: "CNPJ",
          },
          {
            href: "/public.php/webdav/Dados/Cadastros/CNPJ/2026-05/",
            isDirectory: true,
            name: "2026-05",
          },
          {
            href: "/public.php/webdav/Dados/Cadastros/CNPJ/2026-06/",
            isDirectory: true,
            name: "2026-06",
          },
        ]),
      ],
      [
        `${shareUrl}public.php/webdav/Dados/Cadastros/CNPJ/2026-06/`,
        createWebDavResponse([
          {
            href: "/public.php/webdav/Dados/Cadastros/CNPJ/2026-06/",
            isDirectory: true,
            name: "2026-06",
          },
          {
            href: "/public.php/webdav/Dados/Cadastros/CNPJ/2026-06/Simples.zip",
            isDirectory: false,
            name: "Simples.zip",
            size: 281018368,
          },
        ]),
      ],
    ]);

    const fetchText = vi.fn(async (url: string) => responses.get(url) ?? "");

    await expect(
      discoverLocalPublicBaseOfficialSource({ fetchText }),
    ).resolves.toMatchObject({
      baseDate: "2026-06",
      fileName: "Simples.zip",
      fileUrl: expect.stringContaining(`/index.php/s/${token}/download`),
      kind: "simples",
      sizeLabel: "268M",
      sourcePageUrl: shareUrl,
    });
    expect(fetchText).toHaveBeenCalledWith(
      `${shareUrl}public.php/webdav/`,
      expect.objectContaining({
        headers: expect.objectContaining({ Depth: "1" }),
        method: "PROPFIND",
      }),
    );
  });

  it("parses Nextcloud public WebDAV entries", () => {
    expect(
      parseNextcloudWebDavEntries(
        createWebDavResponse([
          { href: "/public.php/webdav/CNPJ/", isDirectory: true, name: "CNPJ" },
          {
            href: "/public.php/webdav/CNPJ/Simples.zip",
            isDirectory: false,
            name: "Simples.zip",
            size: 1024 * 1024,
          },
        ]),
        "",
      ),
    ).toEqual([
      expect.objectContaining({
        isDirectory: true,
        name: "CNPJ",
        path: "CNPJ",
        sizeLabel: "-",
      }),
      expect.objectContaining({
        isDirectory: false,
        name: "Simples.zip",
        path: "CNPJ/Simples.zip",
        sizeLabel: "1M",
      }),
    ]);
  });

  it("does not follow official source links outside the configured Receita root", async () => {
    const rootUrl =
      "https://arquivos.receitafederal.gov.br/dados/cnpj/dados_abertos_cnpj/";
    const externalUrl = "https://evil.example/2026-01/";
    const responses = new Map([
      [
        rootUrl,
        [
          `<a href="${externalUrl}">2026-01/</a> 2026-01-11 14:59 -`,
          '<a href="2025-12/">2025-12/</a> 2025-12-14 15:37 -',
        ].join("\n"),
      ],
      [
        `${rootUrl}2025-12/`,
        '<a href="Simples.zip">Simples.zip</a> 2025-12-14 15:37 260M',
      ],
    ]);
    const fetchText = vi.fn(async (url: string) => responses.get(url) ?? "");

    await expect(
      discoverLocalPublicBaseOfficialSource({
        baseUrl: rootUrl,
        fetchText,
      }),
    ).resolves.toMatchObject({
      baseDate: "2025-12",
      fileUrl: `${rootUrl}2025-12/Simples.zip`,
    });
    expect(fetchText).not.toHaveBeenCalledWith(externalUrl, expect.anything());
  });

  it("times out official source discovery when the network request never settles", async () => {
    vi.useFakeTimers();

    try {
      const rejection = expect(
        discoverLocalPublicBaseOfficialSource({
          baseUrl: "https://example.test/",
          fetchText: async () => new Promise<string>(() => {}),
          timeoutMs: 1,
        }),
      ).rejects.toThrow(
        "Tempo limite ao consultar a fonte oficial da Base Pública Local.",
      );

      await vi.advanceTimersByTimeAsync(500);
      await rejection;
    } finally {
      vi.useRealTimers();
    }
  });

  it("returns null for monthly official directories without Simples archive", () => {
    expect(
      parseOfficialSourceDirectoryIndex(
        '<a href="Empresas0.zip">Empresas0.zip</a> 2026-01-11 14:52 466M',
        "https://example.test/2026-01/",
        "https://example.test/",
      ),
    ).toBeNull();
  });

  it("rejects official Simples archive links outside the monthly Receita directory", () => {
    expect(
      parseOfficialSourceDirectoryIndex(
        '<a href="https://evil.example/Simples.zip">Simples.zip</a> 2026-01-11 14:58 268M',
        "https://example.test/2026-01/",
        "https://example.test/",
      ),
    ).toBeNull();
    expect(
      parseOfficialSourceDirectoryIndex(
        '<a href="../Simples.zip">Simples.zip</a> 2026-01-11 14:58 268M',
        "https://example.test/2026-01/",
        "https://example.test/",
      ),
    ).toBeNull();
  });

  it("rejects direct official directory parsing outside the configured source page", () => {
    expect(
      parseOfficialSourceDirectoryIndex(
        '<a href="Simples.zip">Simples.zip</a> 2026-01-11 14:58 268M',
        "https://evil.example/2026-01/",
        "https://example.test/",
      ),
    ).toBeNull();
  });

  it("prepares official Simples rows and indexes by CNPJ básico", async () => {
    const source = {
      baseDate: "2026-01",
      directoryUrl: "https://example.test/2026-01/",
      fileName: "Simples.zip",
      fileUrl: "https://example.test/2026-01/Simples.zip",
      kind: "simples" as const,
      lastModified: "2026-01-11 14:58",
      sizeLabel: "268M",
      sourcePageUrl: "https://example.test/",
    };
    const prepared = await prepareLocalPublicBaseFromOfficialSimplesStream(
      Readable.from([
        [
          "11222333;S;20200101;;N;;",
          "00987654;N;20190101;;S;20200202;",
          "invalido;S;20200101;;N;;",
        ].join("\n"),
      ]),
      {
        consent: acceptedConsent,
        source,
        sourceSizeBytes: 128,
        zipFilePath: "/tmp/Simples.zip",
      },
    );
    const adapter = new LocalPublicBaseSimplesLookupAdapter(
      createLocalPublicBaseIndexFromRecords(prepared.records),
      prepared.status,
    );

    expect(prepared).toMatchObject({
      acceptedRows: 2,
      rejectedRows: 1,
      status: {
        baseDate: "2026-01",
        sourceFileName: "Simples.zip",
        state: "ready",
      },
    });
    await expect(adapter.lookup("11.222.333/0001-81")).resolves.toMatchObject({
      raw: {
        baseDate: "2026-01",
        razaoSocial: "CNPJ básico 11222333",
      },
      simei: false,
      simplesNacional: true,
      source: "base-publica-local",
      status: "SUCCESS",
    });
  });

  it("normalizes official Simples rows into synthetic head-office records", () => {
    expect(
      createRecordFromOfficialSimplesRow(
        ["11222333", "S", "20200101", "", "N", "", ""],
        "2026-01",
      ),
    ).toMatchObject({
      cnpj: "11222333000181",
      cnpjBasico: "11222333",
      razaoSocial: "CNPJ básico 11222333",
      simei: false,
      simplesNacional: true,
      updatedAt: "20200101",
    });

    expect(
      createRecordFromOfficialSimplesRow(
        ["11222333", "?", "20200101", "", "N", "", ""],
        "2026-01",
      ),
    ).toBeNull();
  });

  it("downloads the official source into a resumable local file", async () => {
    const directory = await mkdtemp(join(tmpdir(), "public-base-download-"));
    tempDirs.push(directory);

    const result = await downloadLocalPublicBaseOfficialSource({
      directory,
      fetchFile: vi.fn(async () => createOfficialZipResponse()),
      source: createOfficialSource(),
    });

    expect(result).toMatchObject({
      resumed: false,
      sizeBytes: officialSimplesZipBuffer().byteLength,
    });
    expect(result.filePath.endsWith("2026-01-Simples.zip")).toBe(true);
    expect(await readFile(result.filePath)).toEqual(officialSimplesZipBuffer());
  });

  it("downloads Receita public Nextcloud sources through the WebDAV file endpoint", async () => {
    const directory = await mkdtemp(join(tmpdir(), "public-base-download-"));
    const fetchFile = vi.fn(async () => createOfficialZipResponse());
    tempDirs.push(directory);

    const result = await downloadLocalPublicBaseOfficialSource({
      directory,
      fetchFile,
      source: createOfficialSource({
        directoryUrl:
          "https://arquivos.receitafederal.gov.br/public.php/webdav/Dados/Cadastros/CNPJ/2026-06/",
        fileUrl:
          "https://arquivos.receitafederal.gov.br/index.php/s/public-share-token/download?path=%2FDados%2FCadastros%2FCNPJ%2F2026-06&files=Simples.zip",
      }),
    });

    expect(result.sizeBytes).toBe(officialSimplesZipBuffer().byteLength);
    expect(fetchFile).toHaveBeenCalledWith(
      "https://arquivos.receitafederal.gov.br/public.php/webdav/Dados/Cadastros/CNPJ/2026-06/Simples.zip",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: expect.stringMatching(/^Basic /),
        }),
      }),
    );
  });

  it("reuses a downloaded official source only when metadata matches", async () => {
    const directory = await mkdtemp(join(tmpdir(), "public-base-download-"));
    const fetchFile = vi.fn(async () => createOfficialZipResponse());
    tempDirs.push(directory);

    const first = await downloadLocalPublicBaseOfficialSource({
      directory,
      fetchFile,
      source: createOfficialSource(),
    });
    const second = await downloadLocalPublicBaseOfficialSource({
      directory,
      fetchFile,
      source: createOfficialSource(),
    });

    expect(fetchFile).toHaveBeenCalledTimes(1);
    expect(second).toEqual({
      filePath: first.filePath,
      resumed: false,
      sizeBytes: officialSimplesZipBuffer().byteLength,
    });
  });

  it("redownloads the official source when cached metadata is stale", async () => {
    const directory = await mkdtemp(join(tmpdir(), "public-base-download-"));
    const fetchFile = vi
      .fn()
      .mockResolvedValueOnce(createOfficialZipResponse())
      .mockResolvedValueOnce(createOfficialZipResponse());
    tempDirs.push(directory);

    const first = await downloadLocalPublicBaseOfficialSource({
      directory,
      fetchFile,
      source: createOfficialSource(),
    });
    const second = await downloadLocalPublicBaseOfficialSource({
      directory,
      fetchFile,
      source: createOfficialSource({
        lastModified: "2026-01-12 09:00",
      }),
    });

    expect(first.filePath).toBe(second.filePath);
    expect(fetchFile).toHaveBeenCalledTimes(2);
    expect(await readFile(second.filePath)).toEqual(officialSimplesZipBuffer());
  });

  it("does not reuse a final official ZIP without metadata", async () => {
    const directory = await mkdtemp(join(tmpdir(), "public-base-download-"));
    const fetchFile = vi.fn(async () => createOfficialZipResponse());
    tempDirs.push(directory);
    await writeFile(join(directory, "2026-01-Simples.zip"), "stale-content");

    const result = await downloadLocalPublicBaseOfficialSource({
      directory,
      fetchFile,
      source: createOfficialSource(),
    });

    expect(fetchFile).toHaveBeenCalledTimes(1);
    expect(await readFile(result.filePath)).toEqual(officialSimplesZipBuffer());
  });

  it("redownloads a cached official ZIP when metadata matches but the ZIP is invalid", async () => {
    const directory = await mkdtemp(join(tmpdir(), "public-base-download-"));
    const source = createOfficialSource();
    const fetchFile = vi.fn(async () => createOfficialZipResponse());
    tempDirs.push(directory);
    await writeFile(join(directory, "2026-01-Simples.zip"), "not-a-zip");
    await writeOfficialDownloadMetadataFixture(directory, source);

    const result = await downloadLocalPublicBaseOfficialSource({
      directory,
      fetchFile,
      source,
    });

    expect(fetchFile).toHaveBeenCalledTimes(1);
    expect(await readFile(result.filePath)).toEqual(officialSimplesZipBuffer());
  });

  it("redownloads a cached official ZIP when metadata matches but the Simples payload CRC fails", async () => {
    const directory = await mkdtemp(join(tmpdir(), "public-base-download-"));
    const source = createOfficialSource();
    const fetchFile = vi.fn(async () => createOfficialZipResponse());
    tempDirs.push(directory);
    await writeFile(
      join(directory, "2026-01-Simples.zip"),
      corruptedOfficialSimplesZipBuffer(),
    );
    await writeOfficialDownloadMetadataFixture(directory, source);

    const result = await downloadLocalPublicBaseOfficialSource({
      directory,
      fetchFile,
      source,
    });

    expect(fetchFile).toHaveBeenCalledTimes(1);
    expect(await readFile(result.filePath)).toEqual(officialSimplesZipBuffer());
  });

  it("rejects a successful official download response that is not a readable Simples ZIP", async () => {
    const directory = await mkdtemp(join(tmpdir(), "public-base-download-"));
    tempDirs.push(directory);

    await expect(
      downloadLocalPublicBaseOfficialSource({
        directory,
        fetchFile: vi.fn(async () => new Response("not-a-zip")),
        source: createOfficialSource(),
      }),
    ).rejects.toThrow("Simples.zip válido");
  });

  it("rejects a successful official download response with a corrupt Simples payload", async () => {
    const directory = await mkdtemp(join(tmpdir(), "public-base-download-"));
    tempDirs.push(directory);

    await expect(
      downloadLocalPublicBaseOfficialSource({
        directory,
        fetchFile: vi.fn(
          async () =>
            new Response(new Uint8Array(corruptedOfficialSimplesZipBuffer())),
        ),
        source: createOfficialSource(),
      }),
    ).rejects.toThrow("Simples.zip válido");
  });

  it("prepares the local public base from a real official ZIP entry", async () => {
    const directory = await mkdtemp(join(tmpdir(), "public-base-zip-"));
    tempDirs.push(directory);
    const zipFilePath = join(directory, "Simples.zip");
    await writeFile(
      zipFilePath,
      Buffer.from(officialSimplesZipBase64, "base64"),
    );

    const prepared = await prepareLocalPublicBaseFromOfficialSimplesZip({
      consent: acceptedConsent,
      source: createOfficialSource(),
      sourceSizeBytes: 256,
      zipFilePath,
    });

    expect(prepared).toMatchObject({
      acceptedRows: 1,
      rejectedRows: 0,
      status: {
        baseDate: "2026-01",
        sourceFileName: "Simples.zip",
        state: "ready",
      },
    });
    expect(prepared.records[0]).toMatchObject({
      cnpjBasico: "11222333",
      simplesNacional: true,
      simei: false,
    });
  });

  it("persists official preparation as disk-backed shards instead of an in-memory JSON record list", async () => {
    const directory = await mkdtemp(join(tmpdir(), "public-base-official-"));
    tempDirs.push(directory);
    const zipFilePath = join(directory, "Simples.zip");
    await writeFile(
      zipFilePath,
      Buffer.from(officialSimplesZipBase64, "base64"),
    );
    const store = new LocalPublicBaseStore(directory);

    const result = await store.prepareFromOfficialZip({
      consent: acceptedConsent,
      source: createOfficialSource(),
      sourceSizeBytes: 256,
      zipFilePath,
    });
    const rawDocument = JSON.parse(
      await readFile(join(directory, localPublicBaseIndexFileName), "utf8"),
    ) as Record<string, unknown>;
    const prepared = await store.loadPreparedBase();
    const record = await prepared?.index.findByCnpj("11222333");
    const adapter = new LocalPublicBaseSimplesLookupAdapter(
      prepared?.index ?? createLocalPublicBaseIndexFromRecords([]),
      prepared?.status ?? getLocalPublicBaseStatus(),
    );

    expect(result).toMatchObject({
      acceptedRows: 1,
      rejectedRows: 0,
      status: {
        baseDate: "2026-01",
        state: "ready",
      },
    });
    expect(rawDocument).toMatchObject({
      storage: "official-simples-shards",
      officialIndexDirectory: "official-simples-index",
      records: [],
    });
    expect(record).toMatchObject({
      cnpjBasico: "11222333",
      simplesNacional: true,
      simei: false,
    });
    await expect(adapter.lookup(record?.cnpj ?? "")).resolves.toMatchObject({
      source: "base-publica-local",
      status: "SUCCESS",
      raw: {
        baseDate: "2026-01",
      },
    });
  });

  it("rejects official ZIP files without a Simples CSV entry", async () => {
    const directory = await mkdtemp(join(tmpdir(), "public-base-zip-"));
    tempDirs.push(directory);
    const zipFilePath = join(directory, "Outro.zip");
    await writeFile(
      zipFilePath,
      Buffer.from(officialZipWithoutSimplesBase64, "base64"),
    );

    await expect(
      prepareLocalPublicBaseFromOfficialSimplesZip({
        consent: acceptedConsent,
        source: createOfficialSource(),
        sourceSizeBytes: 256,
        zipFilePath,
      }),
    ).rejects.toThrow("CSV de Simples Nacional não encontrado");
  });

  it("exposes not-prepared status before a local CSV is prepared", () => {
    const status = getLocalPublicBaseStatus();

    expect(status).toMatchObject({
      state: "not-prepared",
      baseDate: null,
      preparedRows: 0,
    });
    expect(status.estimatedSizeLabel).toContain("menos de 1 MB");
    expect(status.diskUsageLabel).toContain("sem base preparada");
    expect(status.freshnessWarning).toContain("Prepare a Base Pública Local");
  });

  it("indexes known public fixture records by normalized CNPJ", () => {
    const index = createLocalPublicBaseIndex();

    expect(index.findByCnpj("11222333000181")).toMatchObject({
      cnpj: "11222333000181",
      razaoSocial: "Empresa Alfa Demo Ltda.",
      simplesNacional: true,
      simei: false,
    });
    expect(index.findByCnpj("22333444000181")).toBeNull();
  });

  it("returns Resultado Simples with Data da Base for known and missing CNPJs", async () => {
    const prepared = prepareLocalPublicBaseFromCsv({
      content: [
        "cnpj;razao_social;simples_nacional;simei;data_base",
        "11222333000181;Empresa Alfa Demo Ltda.;sim;nao;2026-05-20",
      ].join("\n"),
      consent: acceptedConsent,
      sourceFileName: "base.csv",
      sourceFilePath: "/tmp/base.csv",
    });
    const index = createLocalPublicBaseIndexFromRecords(prepared.records);
    const adapter = new LocalPublicBaseSimplesLookupAdapter(
      index,
      prepared.status,
    );

    await expect(adapter.lookup("11.222.333/0001-81")).resolves.toMatchObject({
      cnpj: "11222333000181",
      simplesNacional: true,
      simei: false,
      source: "base-publica-local",
      status: "SUCCESS",
      message: expect.stringContaining("2026-05-20"),
      raw: {
        baseDate: "2026-05-20",
      },
    });

    await expect(adapter.lookup("invalido")).resolves.toMatchObject({
      cnpj: "",
      simplesNacional: null,
      simei: null,
      source: "base-publica-local",
      status: "INVALID_CNPJ",
      raw: {
        baseDate: "2026-05-20",
      },
    });

    await expect(adapter.lookup("22333444000181")).resolves.toMatchObject({
      cnpj: "22333444000181",
      simplesNacional: null,
      simei: null,
      source: "base-publica-local",
      status: "NOT_FOUND",
      message: expect.stringContaining("não encontrado"),
      raw: {
        baseDate: "2026-05-20",
      },
    });
  });

  it("validates the offline fixture used for local prepare/index/lookup", async () => {
    const content = await readFile(fixturePath, "utf8");
    const prepared = prepareLocalPublicBaseFromCsv({
      content,
      consent: acceptedConsent,
      sourceFileName: "base-publica-local.csv",
      sourceFilePath: fixturePath,
    });
    const adapter = new LocalPublicBaseSimplesLookupAdapter(
      createLocalPublicBaseIndexFromRecords(prepared.records),
      prepared.status,
    );

    expect(prepared).toMatchObject({
      acceptedRows: 3,
      rejectedRows: 0,
      status: {
        baseDate: "2026-05-20",
        preparedRows: 3,
        state: "ready",
      },
    });
    expect(prepared.status.freshnessWarning).toContain("defasada");
    await expect(adapter.lookup("98765432000198")).resolves.toMatchObject({
      simplesNacional: false,
      simei: false,
      source: "base-publica-local",
      status: "SUCCESS",
      raw: {
        baseDate: "2026-05-20",
        razaoSocial: "Empresa Beta Demo Ltda.",
      },
    });
  });

  it("rejects malformed explicit local preparation consent", () => {
    expect(() =>
      assertLocalPublicBasePreparationConsent({
        accepted: false,
        acceptedAt: "",
        baseDateAcknowledged: null,
        stalenessWarningAcknowledged: "",
      } as never),
    ).toThrow("Consentimento explícito");
  });

  it("prepares a deduplicated local index from a CSV source", () => {
    const prepared = prepareLocalPublicBaseFromCsv({
      content: [
        "cnpj;razao_social;simples_nacional;simei;data_base",
        "11.222.333/0001-81;Empresa Alfa Demo Ltda.;sim;nao;2026-05-20",
        "98.765.432/0001-98;Empresa Beta Demo;nao;nao;2026-05-20",
        "invalido;Linha invalida;sim;nao;2026-05-20",
      ].join("\n"),
      consent: acceptedConsent,
      sourceFileName: "base-publica.csv",
      sourceFilePath: "/tmp/base-publica.csv",
    });

    expect(prepared).toMatchObject({
      acceptedRows: 2,
      rejectedRows: 1,
      status: {
        baseDate: "2026-05-20",
        preparedRows: 2,
        rejectedRows: 1,
        sourceFileName: "base-publica.csv",
        state: "ready",
      },
    });
    expect(prepared.records).toHaveLength(2);
  });

  it("persists and reloads a prepared local base index", async () => {
    const directory = await mkdtemp(join(tmpdir(), "public-base-test-"));
    tempDirs.push(directory);
    const store = new LocalPublicBaseStore(directory);

    const result = await store.prepareFromCsv({
      content: [
        "cnpj;razao_social;simples_nacional;simei;data_base",
        "11222333000181;Empresa Alfa Demo Ltda.;sim;nao;2026-05-20",
      ].join("\n"),
      consent: acceptedConsent,
      sourceFileName: "base.csv",
      sourceFilePath: join(directory, "base.csv"),
    });
    const status = await store.getStatus();
    const index = await store.loadIndex();

    expect(result.status.state).toBe("ready");
    expect(status).toMatchObject({
      baseDate: "2026-05-20",
      preparedRows: 1,
      sourceFileName: "base.csv",
      state: "ready",
    });
    expect(index?.findByCnpj("11222333000181")).toMatchObject({
      razaoSocial: "Empresa Alfa Demo Ltda.",
    });
  });

  it("persists an error state and invalidates the previous index after an invalid preparation", async () => {
    const directory = await mkdtemp(join(tmpdir(), "public-base-test-"));
    tempDirs.push(directory);
    const store = new LocalPublicBaseStore(directory);

    await store.prepareFromCsv({
      content: [
        "cnpj;razao_social;simples_nacional;simei;data_base",
        "11222333000181;Empresa Alfa Demo Ltda.;sim;nao;2026-05-20",
      ].join("\n"),
      consent: acceptedConsent,
      sourceFileName: "base-valida.csv",
      sourceFilePath: join(directory, "base-valida.csv"),
    });

    const failed = await store.prepareFromCsv({
      content: [
        "cnpj;razao_social;simples_nacional;simei;data_base",
        "invalido;Linha invalida;sim;nao;2026-05-21",
      ].join("\n"),
      consent: {
        ...acceptedConsent,
        baseDateAcknowledged: "2026-05-21",
      },
      sourceFileName: "base-invalida.csv",
      sourceFilePath: join(directory, "base-invalida.csv"),
    });

    expect(failed.status).toMatchObject({
      sourceFileName: "base-invalida.csv",
      state: "error",
    });
    await expect(store.getStatus()).resolves.toMatchObject({
      sourceFileName: "base-invalida.csv",
      state: "error",
    });
    await expect(store.loadIndex()).resolves.toBeNull();
    await expect(store.loadPreparedBase()).resolves.toBeNull();
  });

  it("rejects preparation without consent before persisting a local index", async () => {
    const directory = await mkdtemp(join(tmpdir(), "public-base-test-"));
    tempDirs.push(directory);
    const store = new LocalPublicBaseStore(directory);

    await expect(
      store.prepareFromCsv({
        content: [
          "cnpj;razao_social;simples_nacional;simei;data_base",
          "11222333000181;Empresa Alfa Demo Ltda.;sim;nao;2026-05-20",
        ].join("\n"),
        sourceFileName: "base-sem-consentimento.csv",
        sourceFilePath: join(directory, "base-sem-consentimento.csv"),
      }),
    ).rejects.toThrow("Consentimento explícito");
    await expect(store.getStatus()).resolves.toMatchObject({
      state: "not-prepared",
    });
    await expect(store.loadIndex()).resolves.toBeNull();
  });

  it("discards persisted indexes with malformed records", async () => {
    const directory = await mkdtemp(join(tmpdir(), "public-base-test-"));
    const warnings: CapturedWarning[] = [];
    tempDirs.push(directory);
    await mkdir(directory, { recursive: true });
    await writeFile(
      join(directory, localPublicBaseIndexFileName),
      `${JSON.stringify({
        version: 1,
        state: "ready",
        sourceFileName: "malformada.csv",
        sourceFilePath: join(directory, "malformada.csv"),
        preparedAt: "2026-05-21T00:00:00.000Z",
        baseDate: "2026-05-20",
        estimatedRows: 1,
        preparedRows: 1,
        rejectedRows: 0,
        sourceSizeBytes: 10,
        errorMessage: null,
        records: [{ cnpj: "11222333000181" }],
      })}\n`,
      "utf8",
    );

    const store = new LocalPublicBaseStore(directory, {
      warn(message, metadata) {
        warnings.push({ message, metadata });
      },
    });

    await expect(store.getStatus()).resolves.toMatchObject({
      state: "not-prepared",
    });
    await expect(store.loadIndex()).resolves.toBeNull();
    expect(warnings).toEqual([
      {
        message: "[base-publica-local] indice local descartado",
        metadata: {
          reason: "incompatible_index_document",
        },
      },
      {
        message: "[base-publica-local] indice local descartado",
        metadata: {
          reason: "incompatible_index_document",
        },
      },
    ]);
    expect(JSON.stringify(warnings)).not.toContain(directory);
    expect(JSON.stringify(warnings)).not.toContain(
      localPublicBaseIndexFileName,
    );
    expect(JSON.stringify(warnings)).not.toContain("11222333000181");
    expect(JSON.stringify(warnings)).not.toContain("malformada.csv");
  });

  it("sanitizes warning metadata when a persisted index cannot be parsed", async () => {
    const directory = await mkdtemp(join(tmpdir(), "public-base-test-"));
    const warnings: CapturedWarning[] = [];
    tempDirs.push(directory);
    await mkdir(directory, { recursive: true });
    await writeFile(
      join(directory, localPublicBaseIndexFileName),
      "{ raw payload with CNPJ 11222333000181 and Razao Social }\n",
      "utf8",
    );

    const store = new LocalPublicBaseStore(directory, {
      warn(message, metadata) {
        warnings.push({ message, metadata });
      },
    });

    await expect(store.getStatus()).resolves.toMatchObject({
      state: "not-prepared",
    });

    expect(warnings).toEqual([
      {
        message: "[base-publica-local] indice local descartado",
        metadata: {
          reason: "invalid_json",
        },
      },
    ]);
    expect(JSON.stringify(warnings)).not.toContain(directory);
    expect(JSON.stringify(warnings)).not.toContain("raw payload");
    expect(JSON.stringify(warnings)).not.toContain("11222333000181");
    expect(JSON.stringify(warnings)).not.toContain("Razao Social");
  });

  it("sanitizes warning metadata when a persisted index read fails", async () => {
    const directory = await mkdtemp(join(tmpdir(), "public-base-test-"));
    const warnings: CapturedWarning[] = [];
    tempDirs.push(directory);
    await mkdir(join(directory, localPublicBaseIndexFileName), {
      recursive: true,
    });

    const store = new LocalPublicBaseStore(directory, {
      warn(message, metadata) {
        warnings.push({ message, metadata });
      },
    });

    await expect(store.loadIndex()).resolves.toBeNull();

    expect(warnings).toEqual([
      {
        message: "[base-publica-local] indice local indisponivel",
        metadata: {
          reason: "read_failed",
        },
      },
    ]);
    expect(JSON.stringify(warnings)).not.toContain(directory);
    expect(JSON.stringify(warnings)).not.toContain(
      localPublicBaseIndexFileName,
    );
    expect(JSON.stringify(warnings)).not.toContain("EISDIR");
    expect(JSON.stringify(warnings)).not.toContain("illegal operation");
  });
});

function createOfficialSource(
  overrides: Partial<LocalPublicBaseOfficialSource> = {},
): LocalPublicBaseOfficialSource {
  return {
    baseDate: "2026-01",
    directoryUrl: "https://example.test/2026-01/",
    fileName: "Simples.zip",
    fileUrl: "https://example.test/2026-01/Simples.zip",
    kind: "simples",
    lastModified: "2026-01-11 14:58",
    sizeLabel: "268M",
    sourcePageUrl: "https://example.test/",
    ...overrides,
  };
}

function officialSimplesZipBuffer(): Buffer {
  return Buffer.from(officialSimplesZipBase64, "base64");
}

function corruptedOfficialSimplesZipBuffer(): Buffer {
  const buffer = officialSimplesZipBuffer();
  const payloadIndex = buffer.indexOf("11222333;S;");

  if (payloadIndex < 0) {
    throw new Error("Fixture ZIP oficial não contém o payload esperado.");
  }

  buffer[payloadIndex] = buffer[payloadIndex] === 0x31 ? 0x32 : 0x31;

  return buffer;
}

function createOfficialZipResponse(): Response {
  return new Response(new Uint8Array(officialSimplesZipBuffer()));
}

async function writeOfficialDownloadMetadataFixture(
  directory: string,
  source: LocalPublicBaseOfficialSource,
): Promise<void> {
  await writeFile(
    join(directory, "2026-01-Simples.zip.metadata.json"),
    `${JSON.stringify(
      {
        baseDate: source.baseDate,
        fileName: source.fileName,
        fileUrl: source.fileUrl,
        kind: source.kind,
        lastModified: source.lastModified,
        sizeLabel: source.sizeLabel,
      },
      null,
      2,
    )}\n`,
  );
}

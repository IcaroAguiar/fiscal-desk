import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

type AssetKind =
  | "blockmap"
  | "macos-dmg"
  | "macos-zip"
  | "update-metadata"
  | "windows-installer"
  | "other";

type CliOptions = {
  artifactRunId?: string;
  expectedSha?: string;
  expectedVersion?: string;
  inputDir: string;
  outputDir: string;
  tag?: string;
};

type PackageJson = {
  name: string;
  version: string;
};

type ReleaseAsset = {
  kind: AssetKind;
  name: string;
  path: string;
  sha256: string;
  sizeBytes: number;
};

type RequiredAssetCheck = {
  description: string;
  id: string;
  matches: (asset: ReleaseAsset) => boolean;
};

const WINDOWS_ARTIFACT_DIR = "fiscal-desk-windows-x64";
const MACOS_ARTIFACT_DIR = "fiscal-desk-macos";
const MANIFEST_FILE_NAME = "release-manifest.json";
const CHECKSUMS_FILE_NAME = "SHA256SUMS.txt";
const REQUIRED_ASSET_CHECKS: readonly RequiredAssetCheck[] = [
  {
    description: "Windows x64 installer .exe",
    id: "windows-installer",
    matches: (asset) =>
      isInsideArtifactDir(asset, WINDOWS_ARTIFACT_DIR) &&
      asset.kind === "windows-installer",
  },
  {
    description: "Windows update metadata .yml",
    id: "windows-update-metadata",
    matches: (asset) =>
      isInsideArtifactDir(asset, WINDOWS_ARTIFACT_DIR) &&
      asset.kind === "update-metadata",
  },
  {
    description: "Windows blockmap",
    id: "windows-blockmap",
    matches: (asset) =>
      isInsideArtifactDir(asset, WINDOWS_ARTIFACT_DIR) &&
      asset.kind === "blockmap",
  },
  {
    description: "macOS DMG",
    id: "macos-dmg",
    matches: (asset) =>
      isInsideArtifactDir(asset, MACOS_ARTIFACT_DIR) &&
      asset.kind === "macos-dmg",
  },
  {
    description: "macOS ZIP",
    id: "macos-zip",
    matches: (asset) =>
      isInsideArtifactDir(asset, MACOS_ARTIFACT_DIR) &&
      asset.kind === "macos-zip",
  },
  {
    description: "macOS update metadata .yml",
    id: "macos-update-metadata",
    matches: (asset) =>
      isInsideArtifactDir(asset, MACOS_ARTIFACT_DIR) &&
      asset.kind === "update-metadata",
  },
  {
    description: "macOS blockmap",
    id: "macos-blockmap",
    matches: (asset) =>
      isInsideArtifactDir(asset, MACOS_ARTIFACT_DIR) &&
      asset.kind === "blockmap",
  },
];

const options = parseArgs(process.argv.slice(2));
const packageJson = await readPackageJson();
const gitSha = readGitSha();

if (
  options.expectedVersion &&
  packageJson.version !== options.expectedVersion
) {
  throw new Error(
    `Versao esperada ${options.expectedVersion} nao bate com package.json ${packageJson.version}.`,
  );
}

if (options.expectedSha && !shaMatches(gitSha, options.expectedSha)) {
  throw new Error(
    `SHA esperado ${options.expectedSha} nao bate com checkout atual ${gitSha}.`,
  );
}

const inputDir = path.resolve(options.inputDir);
const outputDir = path.resolve(options.outputDir);
const assetPaths = await collectFiles(inputDir);
const assets = await Promise.all(
  assetPaths
    .filter((assetPath) => !isGeneratedOutput(assetPath))
    .map((assetPath) => createAssetRecord(inputDir, assetPath)),
);
const missingChecks = REQUIRED_ASSET_CHECKS.filter(
  (check) => !assets.some((asset) => check.matches(asset)),
).map((check) => check.id);
const validationStatus = missingChecks.length === 0 ? "pass" : "fail";
const sortedAssets = assets.sort((a, b) => a.path.localeCompare(b.path));
const generatedAt = new Date().toISOString();

await mkdir(outputDir, { recursive: true });
await writeFile(
  path.join(outputDir, CHECKSUMS_FILE_NAME),
  renderChecksums(sortedAssets),
  "utf8",
);
await writeFile(
  path.join(outputDir, MANIFEST_FILE_NAME),
  `${JSON.stringify(
    {
      schemaVersion: 1,
      generatedAt,
      package: packageJson,
      source: {
        gitSha,
        expectedSha: options.expectedSha ?? null,
        tag: options.tag ?? null,
        artifactRunId: options.artifactRunId ?? null,
      },
      distribution: {
        signed: false,
        notarized: false,
        autoUpdater: false,
        publishPerformed: false,
      },
      validation: {
        status: validationStatus,
        requiredAssetChecks: REQUIRED_ASSET_CHECKS.map((check) => ({
          description: check.description,
          id: check.id,
        })),
        missingAssetChecks: missingChecks,
      },
      assets: sortedAssets,
    },
    null,
    2,
  )}\n`,
  "utf8",
);

console.log(
  JSON.stringify(
    {
      assets: sortedAssets.length,
      checksumsPath: path.join(outputDir, CHECKSUMS_FILE_NAME),
      manifestPath: path.join(outputDir, MANIFEST_FILE_NAME),
      missingAssetChecks: missingChecks,
      status: validationStatus,
    },
    null,
    2,
  ),
);

if (validationStatus !== "pass") {
  process.exit(1);
}

function parseArgs(rawArgs: string[]): CliOptions {
  const optionsFromArgs: Partial<CliOptions> = {};

  for (let index = 0; index < rawArgs.length; index += 1) {
    const arg = rawArgs[index];

    if (arg === "--") {
      continue;
    }

    if (arg === "--help") {
      printUsage();
      process.exit(0);
    }

    if (arg === "--input-dir") {
      optionsFromArgs.inputDir = readRequiredValue(rawArgs, index, arg);
      index += 1;
      continue;
    }

    if (arg === "--output-dir") {
      optionsFromArgs.outputDir = readRequiredValue(rawArgs, index, arg);
      index += 1;
      continue;
    }

    if (arg === "--expected-sha") {
      optionsFromArgs.expectedSha = readRequiredValue(rawArgs, index, arg);
      index += 1;
      continue;
    }

    if (arg === "--expected-version") {
      optionsFromArgs.expectedVersion = readRequiredValue(rawArgs, index, arg);
      index += 1;
      continue;
    }

    if (arg === "--artifact-run-id") {
      optionsFromArgs.artifactRunId = readRequiredValue(rawArgs, index, arg);
      index += 1;
      continue;
    }

    if (arg === "--tag") {
      optionsFromArgs.tag = readRequiredValue(rawArgs, index, arg);
      index += 1;
      continue;
    }

    throw new Error(`Argumento desconhecido: ${arg ?? ""}`);
  }

  return {
    artifactRunId: optionsFromArgs.artifactRunId ?? process.env.GITHUB_RUN_ID,
    expectedSha: optionsFromArgs.expectedSha ?? process.env.GITHUB_SHA,
    expectedVersion: optionsFromArgs.expectedVersion,
    inputDir: optionsFromArgs.inputDir ?? "release",
    outputDir: optionsFromArgs.outputDir ?? "release-verification",
    tag: optionsFromArgs.tag ?? process.env.GITHUB_REF_NAME,
  };
}

function readRequiredValue(
  rawArgs: string[],
  index: number,
  flag: string,
): string {
  const value = rawArgs[index + 1];

  if (!value || value.startsWith("--")) {
    throw new Error(`Valor obrigatorio ausente para ${flag}.`);
  }

  return value;
}

async function readPackageJson(): Promise<PackageJson> {
  const parsed = JSON.parse(
    await readFile(path.resolve("package.json"), "utf8"),
  ) as Partial<PackageJson>;

  if (typeof parsed.name !== "string" || typeof parsed.version !== "string") {
    throw new Error("package.json precisa declarar name e version.");
  }

  return {
    name: parsed.name,
    version: parsed.version,
  };
}

function readGitSha(): string {
  return execFileSync("git", ["rev-parse", "HEAD"], {
    encoding: "utf8",
  }).trim();
}

function shaMatches(actualSha: string, expectedSha: string): boolean {
  const normalizedExpectedSha = expectedSha.trim();

  if (normalizedExpectedSha.length < 40) {
    return actualSha.startsWith(normalizedExpectedSha);
  }

  return actualSha === normalizedExpectedSha;
}

async function collectFiles(rootDir: string): Promise<string[]> {
  const entries = await readdir(rootDir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const entryPath = path.join(rootDir, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectFiles(entryPath)));
      continue;
    }

    if (entry.isFile()) {
      files.push(entryPath);
    }
  }

  return files;
}

function isGeneratedOutput(assetPath: string): boolean {
  const name = path.basename(assetPath);
  return name === MANIFEST_FILE_NAME || name === CHECKSUMS_FILE_NAME;
}

async function createAssetRecord(
  rootDir: string,
  assetPath: string,
): Promise<ReleaseAsset> {
  const contents = await readFile(assetPath);
  const fileStat = await stat(assetPath);
  const relativePath = toPosixPath(path.relative(rootDir, assetPath));

  return {
    kind: classifyAsset(assetPath),
    name: path.basename(assetPath),
    path: relativePath,
    sha256: createHash("sha256").update(contents).digest("hex"),
    sizeBytes: fileStat.size,
  };
}

function classifyAsset(assetPath: string): AssetKind {
  const fileName = path.basename(assetPath).toLowerCase();

  if (fileName.endsWith(".exe")) {
    return "windows-installer";
  }

  if (fileName.endsWith(".dmg")) {
    return "macos-dmg";
  }

  if (fileName.endsWith(".zip")) {
    return "macos-zip";
  }

  if (fileName.endsWith(".yml") || fileName.endsWith(".yaml")) {
    return "update-metadata";
  }

  if (fileName.endsWith(".blockmap")) {
    return "blockmap";
  }

  return "other";
}

function renderChecksums(assets: ReleaseAsset[]): string {
  return `${assets
    .map((asset) => `${asset.sha256}  ${asset.path}`)
    .join("\n")}\n`;
}

function isInsideArtifactDir(asset: ReleaseAsset, artifactDir: string): boolean {
  return (
    asset.path === artifactDir || asset.path.startsWith(`${artifactDir}/`)
  );
}

function toPosixPath(value: string): string {
  return value.split(path.sep).join(path.posix.sep);
}

function printUsage(): void {
  console.log(
    [
      "Uso:",
      "  pnpm release:manifest -- --input-dir release-artifacts --output-dir release-verification --expected-sha <sha> --expected-version <versao>",
      "",
      "Gera release-manifest.json e SHA256SUMS.txt sem publicar Release.",
    ].join("\n"),
  );
}

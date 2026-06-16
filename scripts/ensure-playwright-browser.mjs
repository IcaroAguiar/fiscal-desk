import { mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";

const [, , hostPlatformOverride, targetDirectoryArg] = process.argv;

if (!hostPlatformOverride || !targetDirectoryArg) {
  console.error(
    "Uso: node scripts/ensure-playwright-browser.mjs <host-platform> <target-dir>",
  );
  process.exit(1);
}

const targetDirectory = path.resolve(targetDirectoryArg);

await rm(targetDirectory, { recursive: true, force: true });
await mkdir(targetDirectory, { recursive: true });

const env = {
  ...process.env,
  PLAYWRIGHT_BROWSERS_PATH: targetDirectory,
  PLAYWRIGHT_HOST_PLATFORM_OVERRIDE: hostPlatformOverride,
};

await new Promise((resolve, reject) => {
  const child = spawn(
    process.platform === "win32" ? "pnpm.cmd" : "pnpm",
    ["exec", "playwright", "install", "chromium"],
    {
      env,
      shell: process.platform === "win32",
      stdio: "inherit",
    },
  );

  child.on("exit", (code) => {
    if (code === 0) {
      resolve(undefined);
      return;
    }

    reject(new Error(`Falha ao instalar browser do Playwright (exit ${code ?? "null"}).`));
  });

  child.on("error", reject);
});

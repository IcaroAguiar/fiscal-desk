import { readFile } from "node:fs/promises";
import path from "node:path";
import { app, dialog, ipcMain } from "electron";
import { assertLocalPublicBasePreparationConsent } from "../../core/public-base/local-public-base.index";
import { downloadLocalPublicBaseOfficialSource } from "../../core/public-base/local-public-base.official-download";
import { discoverLocalPublicBaseOfficialSource } from "../../core/public-base/local-public-base.official-source";
import { LocalPublicBaseStore } from "../../core/public-base/local-public-base.store";
import type { LocalPublicBasePreparationConsent } from "../../core/public-base/local-public-base.types";
import { LocalPublicBaseSimplesLookupAdapter } from "../../core/simples/adapters/local-public-base-simples-lookup.adapter";
import type { SimplesLookupPort } from "../../core/simples/simples-lookup.port";
import type { SimplesProviderName } from "../../core/simples/simples-provider.names";
import { SIMPLES_PROVIDER } from "../../core/simples/simples-provider.names";

type PrepareLocalPublicBaseInput = {
  content: string;
  consent?: LocalPublicBasePreparationConsent;
  sourceFileName: string;
  sourceFilePath: string;
};
type PrepareOfficialLocalPublicBaseInput = {
  consent?: LocalPublicBasePreparationConsent;
};

let activeLocalPublicBasePreparation: Promise<unknown> | null = null;

export function registerLocalPublicBaseIpc(): void {
  ipcMain.handle("local-public-base:get-status", async () => {
    return createLocalPublicBaseStore().getStatus();
  });

  ipcMain.handle("local-public-base:discover-official-source", async () => {
    return discoverLocalPublicBaseOfficialSource();
  });

  ipcMain.handle("local-public-base:pick-source-file", async () => {
    const result = await dialog.showOpenDialog({
      title: "Selecionar CSV da Base Pública Local",
      properties: ["openFile"],
      filters: [{ name: "CSV", extensions: ["csv"] }],
    });

    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }

    const filePath = result.filePaths[0];
    if (!filePath) {
      return null;
    }

    return {
      content: await readFile(filePath, "utf8"),
      fileName: filePath.split(/[\\/]/).pop() ?? "base-publica-local.csv",
      filePath,
    };
  });

  ipcMain.handle(
    "local-public-base:prepare",
    async (_event, input: PrepareLocalPublicBaseInput) => {
      if (activeLocalPublicBasePreparation) {
        throw new Error(
          "Ja existe um preparo de Base Pública Local em andamento.",
        );
      }

      const preparation = createLocalPublicBaseStore().prepareFromCsv({
        content: input.content,
        ...(input.consent ? { consent: input.consent } : {}),
        sourceFileName: input.sourceFileName,
        sourceFilePath: input.sourceFilePath,
      });

      activeLocalPublicBasePreparation = preparation;

      try {
        return await preparation;
      } finally {
        activeLocalPublicBasePreparation = null;
      }
    },
  );

  ipcMain.handle(
    "local-public-base:prepare-official-source",
    async (_event, input: PrepareOfficialLocalPublicBaseInput = {}) => {
      if (activeLocalPublicBasePreparation) {
        throw new Error(
          "Ja existe um preparo de Base Pública Local em andamento.",
        );
      }

      const preparation = prepareOfficialLocalPublicBase(input);
      activeLocalPublicBasePreparation = preparation;

      try {
        return await preparation;
      } finally {
        activeLocalPublicBasePreparation = null;
      }
    },
  );
}

export function isLocalPublicBasePreparing(): boolean {
  return activeLocalPublicBasePreparation !== null;
}

export function createLocalPublicBaseStore(): LocalPublicBaseStore {
  return new LocalPublicBaseStore(
    path.join(app.getPath("userData"), "public-base"),
  );
}

async function prepareOfficialLocalPublicBase(
  input: PrepareOfficialLocalPublicBaseInput,
) {
  assertLocalPublicBasePreparationConsent(input.consent);

  const source = await discoverLocalPublicBaseOfficialSource();
  if (input.consent.baseDateAcknowledged !== source.baseDate) {
    throw new Error(
      "A fonte oficial mudou desde o aceite. Busque a fonte novamente e confirme a Data da Base antes de preparar.",
    );
  }

  const downloaded = await downloadLocalPublicBaseOfficialSource({
    directory: path.join(app.getPath("userData"), "public-base", "downloads"),
    source,
  });

  return createLocalPublicBaseStore().prepareFromOfficialZip({
    consent: input.consent,
    source,
    sourceSizeBytes: downloaded.sizeBytes,
    zipFilePath: downloaded.filePath,
  });
}

export async function createLocalPublicBaseRuntimeProvider(
  providerName: SimplesProviderName,
): Promise<SimplesLookupPort | null> {
  if (providerName !== SIMPLES_PROVIDER.BASE_PUBLICA_LOCAL) {
    return null;
  }

  assertNotPreparing();
  const prepared = await createLocalPublicBaseStore().loadPreparedBase();

  if (!prepared) {
    throw new Error(
      "Prepare a Base Pública Local antes de iniciar uma execução com este provedor.",
    );
  }

  return new LocalPublicBaseSimplesLookupAdapter(
    prepared.index,
    prepared.status,
  );
}

export async function assertLocalPublicBaseReady(
  providerName: SimplesProviderName,
): Promise<void> {
  if (providerName !== SIMPLES_PROVIDER.BASE_PUBLICA_LOCAL) {
    return;
  }

  assertNotPreparing();
  const status = await createLocalPublicBaseStore().getStatus();

  if (status.state !== "ready") {
    throw new Error(
      "Prepare a Base Pública Local antes de iniciar uma execução com este provedor.",
    );
  }
}

function assertNotPreparing(): void {
  if (isLocalPublicBasePreparing()) {
    throw new Error(
      "Aguarde o preparo da Base Pública Local terminar antes de iniciar a execução.",
    );
  }
}

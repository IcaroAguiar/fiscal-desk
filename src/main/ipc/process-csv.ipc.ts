import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  app,
  BrowserWindow,
  dialog,
  type IpcMainInvokeEvent,
  ipcMain,
  powerSaveBlocker,
} from "electron";
import { PROCESS_CSV_IPC_CHANNEL } from "../../core/app/process-csv.types";
import { processCsv } from "../../core/app/process-csv.use-case";
import { parseProcessCsvDeliveryFormat } from "../../core/app/process-csv-delivery";
import { resolvePackagedWindowsBrowserPath } from "../../core/simples/adapters/receita-web/receita-browser-path";
import type { SimplesLookupPort } from "../../core/simples/simples-lookup.port";
import { loadProviderConfig } from "../../core/simples/simples-provider.config";
import {
  createSimplesLookupProvider,
  type SimplesProviderName,
} from "../../core/simples/simples-provider.factory";
import { SIMPLES_PROVIDER } from "../../core/simples/simples-provider.names";
import {
  createInputFingerprint,
  FileProcessExecutionLedger,
  type FileProcessExecutionSession,
} from "../execution/file-process-execution-ledger";
import { FISCAL_DESK_DISABLE_COMPLETION_DIALOG_ENV } from "../runtime-env";
import {
  assertLocalPublicBaseReady,
  createLocalPublicBaseRuntimeProvider,
  createLocalPublicBaseStore,
  registerLocalPublicBaseIpc,
} from "./local-public-base.ipc";
import { resolveIpcDeliverySelection } from "./process-csv-delivery-selection";
import {
  attemptAutoSave,
  getAutoSaveOutputPath,
  writeOutputFile,
} from "./process-csv-output-files";

type ProcessCsvInput = {
  acceptedLocalPublicBaseNotice?: boolean;
  content: string;
  deliveryFormat?: unknown;
  deliveryOptionId?: unknown;
  provider: SimplesProviderName;
  cnpjColumn?: string;
  providerConfigVersion?: string;
  sourceFilePath?: string;
};

type ResumeProcessExecutionInput = {
  acceptedLocalPublicBaseNotice?: boolean;
  deliveryFormat?: unknown;
  deliveryOptionId?: unknown;
  ledgerKey: string;
};

type SaveOutputInput = {
  content: string | number[];
  defaultName: string;
  format: unknown;
};

type ProcessingSession = {
  controller: AbortController;
  blockerId: number;
  startedAt: number;
};

type ProcessingCompletionListener = () => void;

let activeProcessingSession: ProcessingSession | null = null;
const completionListeners = new Set<ProcessingCompletionListener>();

function getMainWindow(): BrowserWindow | undefined {
  const windows = BrowserWindow.getAllWindows();
  return windows[0];
}

export function registerCsvIpc(): void {
  ipcMain.handle("app:get-defaults", async () => {
    const provider = resolveDefaultProvider();

    return {
      localPublicBaseStatus: await createLocalPublicBaseStore().getStatus(),
      provider,
      receitaWebAvailable: isReceitaWebAvailable(),
    };
  });

  ipcMain.handle(PROCESS_CSV_IPC_CHANNEL.PICK_INPUT_FILE, async () => {
    const result = await dialog.showOpenDialog({
      title: "Selecionar CSV",
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
    const content = await readFile(filePath, "utf8");

    return {
      filePath,
      fileName: filePath.split(/[\\/]/).pop() ?? "arquivo.csv",
      content,
    };
  });

  ipcMain.handle(
    PROCESS_CSV_IPC_CHANNEL.PROCESS,
    async (event, input: ProcessCsvInput) => {
      return processCsvWithLedger(event, input);
    },
  );

  registerLocalPublicBaseIpc();

  ipcMain.handle(PROCESS_CSV_IPC_CHANNEL.LIST_EXECUTIONS, async () => {
    return createExecutionLedger().listRuns({ limit: 8 });
  });

  ipcMain.handle(
    PROCESS_CSV_IPC_CHANNEL.RESUME_EXECUTION,
    async (event, input: ResumeProcessExecutionInput) => {
      const deliverySelection = resolveIpcDeliverySelection(input);
      const execution = await createExecutionLedger().getRun(input.ledgerKey);

      if (!execution) {
        throw new Error("Execução não encontrada no histórico local.");
      }

      if (!execution.canResume) {
        throw new Error(
          execution.resumeBlockedReason ??
            "Esta execução não pode ser retomada.",
        );
      }

      if (
        execution.providerName === SIMPLES_PROVIDER.BASE_PUBLICA_LOCAL &&
        input.acceptedLocalPublicBaseNotice !== true
      ) {
        throw new Error(
          "Confirme o aviso de Data da Base antes de retomar com a Base Pública Local.",
        );
      }

      await assertLocalPublicBaseReady(execution.providerName);

      if (!execution.sourceFilePath) {
        throw new Error(
          "Esta execução não registra o caminho do CSV original. Selecione o arquivo novamente para reexecutar.",
        );
      }

      const content = await readFile(execution.sourceFilePath, "utf8");
      const currentFingerprint = createInputFingerprint({
        ...(execution.cnpjColumn ? { cnpjColumn: execution.cnpjColumn } : {}),
        inputCsv: content,
        providerConfigVersion: execution.providerConfigVersion,
        providerName: execution.providerName,
        sourceFilePath: execution.sourceFilePath,
      });
      const expectedFingerprint = input.ledgerKey
        .replace(`${execution.providerName}-`, "")
        .replace(/\.json$/, "");

      if (!currentFingerprint.startsWith(expectedFingerprint)) {
        throw new Error(
          "O CSV original mudou desde o checkpoint. Selecione o arquivo manualmente para iniciar uma nova execução.",
        );
      }

      return processCsvWithLedger(event, {
        content,
        ...(input.acceptedLocalPublicBaseNotice !== undefined
          ? {
              acceptedLocalPublicBaseNotice:
                input.acceptedLocalPublicBaseNotice,
            }
          : {}),
        ...deliverySelection,
        provider: execution.providerName,
        ...(execution.cnpjColumn ? { cnpjColumn: execution.cnpjColumn } : {}),
        providerConfigVersion: execution.providerConfigVersion,
        sourceFilePath: execution.sourceFilePath,
      });
    },
  );

  ipcMain.handle(PROCESS_CSV_IPC_CHANNEL.CANCEL_PROCESSING, () => {
    if (!activeProcessingSession) {
      return false;
    }

    activeProcessingSession.controller.abort();
    console.info("[csv] cancelamento solicitado", {
      elapsedMs: Date.now() - activeProcessingSession.startedAt,
    });

    return true;
  });

  ipcMain.handle(
    PROCESS_CSV_IPC_CHANNEL.SAVE_OUTPUT_FILE,
    async (_event, input: SaveOutputInput): Promise<string | null> => {
      const format = parseProcessCsvDeliveryFormat(input.format);
      const extension = format === "xlsx" ? "xlsx" : "csv";
      const result = await dialog.showSaveDialog({
        title:
          format === "xlsx"
            ? "Salvar planilha processada"
            : "Salvar CSV processado",
        defaultPath: input.defaultName,
        filters: [
          format === "xlsx"
            ? { name: "Excel", extensions: [extension] }
            : { name: "CSV", extensions: [extension] },
        ],
      });

      if (result.canceled || !result.filePath) {
        return null;
      }

      await writeOutputFile(result.filePath, format, input.content);

      return result.filePath;
    },
  );

  ipcMain.handle(
    PROCESS_CSV_IPC_CHANNEL.AUTO_SAVE_OUTPUT_FILE,
    async (
      _event,
      input: { content: string; sourceFilePath: string },
    ): Promise<string> => {
      const outputPath = getAutoSaveOutputPath(input.sourceFilePath, "csv");

      await writeOutputFile(outputPath, "csv", input.content);

      return outputPath;
    },
  );
}

export function hasActiveProcessing(): boolean {
  return activeProcessingSession !== null;
}

export function resolveDefaultProvider(): SimplesProviderName {
  return normalizeProvider(loadProviderConfig());
}

export function requestProcessingCancel(): boolean {
  if (!activeProcessingSession) {
    return false;
  }

  activeProcessingSession.controller.abort();
  return true;
}

export function onProcessingCompleted(
  listener: ProcessingCompletionListener,
): () => void {
  completionListeners.add(listener);

  return () => {
    completionListeners.delete(listener);
  };
}

async function processCsvWithLedger(
  event: IpcMainInvokeEvent,
  input: ProcessCsvInput,
) {
  const deliverySelection = resolveIpcDeliverySelection(input);

  if (activeProcessingSession) {
    throw new Error("Ja existe um processamento em andamento.");
  }

  if (
    input.provider === SIMPLES_PROVIDER.BASE_PUBLICA_LOCAL &&
    input.acceptedLocalPublicBaseNotice !== true
  ) {
    throw new Error(
      "Confirme o aviso de Data da Base antes de usar a Base Pública Local.",
    );
  }

  if (
    input.provider === SIMPLES_PROVIDER.RECEITA_WEB &&
    !isReceitaWebAvailable()
  ) {
    throw new Error(
      "O provider assistido da Receita nesta release está disponível apenas no Windows. " +
        "Use 'mock' para testes locais ou 'cnpja-open' para o fluxo principal.",
    );
  }

  const options = input.cnpjColumn?.trim();
  const controller = new AbortController();
  const blockerId = powerSaveBlocker.start("prevent-app-suspension");
  const startedAt = Date.now();
  activeProcessingSession = {
    controller,
    blockerId,
    startedAt,
  };
  let lastLoggedAt = startedAt;
  let executionSession: FileProcessExecutionSession | null = null;

  try {
    await assertLocalPublicBaseReady(input.provider);
    const provider = await createRuntimeProvider(input.provider);

    executionSession = await createExecutionLedger().startRun({
      ...(options ? { cnpjColumn: options } : {}),
      inputCsv: input.content,
      ...(input.providerConfigVersion
        ? { providerConfigVersion: input.providerConfigVersion }
        : {}),
      providerName: input.provider,
      ...(input.sourceFilePath ? { sourceFilePath: input.sourceFilePath } : {}),
    });

    console.info("[csv] processamento iniciado", {
      deliveryFormat:
        "deliveryFormat" in deliverySelection
          ? deliverySelection.deliveryFormat
          : null,
      deliveryOptionId:
        "deliveryOptionId" in deliverySelection
          ? deliverySelection.deliveryOptionId
          : null,
      hasSourceFile: Boolean(input.sourceFilePath),
      provider: input.provider,
      runId: executionSession.runId,
    });

    const result = await processCsv(input.content, provider, {
      ...(options ? { cnpjColumn: options } : {}),
      ...deliverySelection,
      executionLedger: executionSession,
      signal: controller.signal,
      onLookupProgress(progress) {
        event.sender.send(PROCESS_CSV_IPC_CHANNEL.LOOKUP_PROGRESS, progress);
        const shouldLog =
          progress.completedUniqueLookups === 1 ||
          progress.completedUniqueLookups === progress.totalUniqueLookups ||
          progress.completedUniqueLookups % 10 === 0 ||
          Date.now() - lastLoggedAt >= 60_000;

        if (shouldLog) {
          lastLoggedAt = Date.now();
          console.info("[csv] progresso", {
            completedUniqueLookups: progress.completedUniqueLookups,
            elapsedMs: progress.elapsedMs,
            estimatedRemainingMs: progress.estimatedRemainingMs,
            totalUniqueLookups: progress.totalUniqueLookups,
          });
        }
      },
    });

    const autoSaveResult = await attemptAutoSave(input.sourceFilePath ?? null, {
      delivery: result.delivery,
      outputCsv: result.outputCsv,
      outputXlsx: result.outputXlsx,
    });
    await executionSession.finish({
      status: result.runStatus,
      outputPath: autoSaveResult.savedPath,
      summary: result.summary,
    });

    console.info("[csv] processamento finalizado", {
      deliveryFormat: result.delivery.format,
      elapsedMs: Date.now() - startedAt,
      hasAutoSavedOutput: Boolean(autoSaveResult.savedPath),
      runId: executionSession.runId,
      runStatus: result.runStatus,
      summary: result.summary,
      resumedUniqueLookups: result.execution?.resumedUniqueLookups ?? 0,
    });

    // Mostrar diálogo de sucesso se o arquivo foi salvo automaticamente
    if (
      autoSaveResult.savedPath &&
      result.runStatus === "SUCCESS" &&
      process.env[FISCAL_DESK_DISABLE_COMPLETION_DIALOG_ENV] !== "1"
    ) {
      const mainWindow = getMainWindow();
      if (mainWindow) {
        dialog
          .showMessageBox(mainWindow, {
            type: "info",
            title: "Processamento concluído",
            message: "Arquivo salvo com sucesso!",
            detail: `O arquivo foi salvo em:\n${autoSaveResult.savedPath}`,
            buttons: ["OK"],
            defaultId: 0,
          })
          .catch(() => {
            // Ignora erros do diálogo
          });
      }
    }

    return {
      ...result,
      outputXlsx: result.outputXlsx ? Array.from(result.outputXlsx) : null,
      savedPath: autoSaveResult.savedPath,
      warningMessage: autoSaveResult.warningMessage,
    };
  } catch (error) {
    await executionSession?.finish({
      status: "FAILED",
      outputPath: null,
      summary: null,
    });
    throw error;
  } finally {
    if (
      activeProcessingSession &&
      powerSaveBlocker.isStarted(activeProcessingSession.blockerId)
    ) {
      powerSaveBlocker.stop(activeProcessingSession.blockerId);
    }

    activeProcessingSession = null;
    notifyProcessingCompleted();
  }
}

function createExecutionLedger(): FileProcessExecutionLedger {
  return new FileProcessExecutionLedger(
    path.join(app.getPath("userData"), "execution-ledgers"),
  );
}

async function createRuntimeProvider(
  providerName: SimplesProviderName,
): Promise<SimplesLookupPort> {
  const localProvider =
    await createLocalPublicBaseRuntimeProvider(providerName);

  if (localProvider) {
    return localProvider;
  }

  return createSimplesLookupProvider(providerName);
}

function normalizeProvider(value: string | undefined): SimplesProviderName {
  if (value === SIMPLES_PROVIDER.BASE_PUBLICA_LOCAL) {
    return SIMPLES_PROVIDER.BASE_PUBLICA_LOCAL;
  }

  if (value === SIMPLES_PROVIDER.CNPJA_OPEN) {
    return SIMPLES_PROVIDER.CNPJA_OPEN;
  }

  if (value === SIMPLES_PROVIDER.RECEITA_WEB) {
    return isReceitaWebAvailable()
      ? SIMPLES_PROVIDER.RECEITA_WEB
      : SIMPLES_PROVIDER.MOCK;
  }

  return SIMPLES_PROVIDER.MOCK;
}

function isReceitaWebAvailable(): boolean {
  if (!app.isPackaged) {
    return true;
  }

  if (process.platform !== "win32") {
    return false;
  }

  return Boolean(resolvePackagedWindowsBrowserPath());
}

function notifyProcessingCompleted(): void {
  for (const listener of completionListeners) {
    listener();
  }
}

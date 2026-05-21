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
import { processCsv } from "../../core/app/process-csv.use-case";
import { parseProcessCsvDeliveryFormat } from "../../core/app/process-csv-delivery";
import { getLocalPublicBaseStatus } from "../../core/public-base/local-public-base.index";
import { resolvePackagedWindowsBrowserPath } from "../../core/simples/adapters/receita-web/receita-browser-path";
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
  attemptAutoSave,
  getAutoSaveOutputPath,
  writeOutputFile,
} from "./process-csv-output-files";

type ProcessCsvInput = {
  acceptedLocalPublicBaseNotice?: boolean;
  content: string;
  deliveryFormat?: unknown;
  provider: SimplesProviderName;
  cnpjColumn?: string;
  providerConfigVersion?: string;
  sourceFilePath?: string;
};

type ResumeProcessExecutionInput = {
  acceptedLocalPublicBaseNotice?: boolean;
  deliveryFormat?: unknown;
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
  ipcMain.handle("app:get-defaults", () => {
    const provider = resolveDefaultProvider();

    return {
      localPublicBaseStatus: getLocalPublicBaseStatus(),
      provider,
      receitaWebAvailable: isReceitaWebAvailable(),
    };
  });

  ipcMain.handle("csv:pick-input-file", async () => {
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

  ipcMain.handle("csv:process", async (event, input: ProcessCsvInput) => {
    return processCsvWithLedger(event, input);
  });

  ipcMain.handle("csv:list-executions", async () => {
    return createExecutionLedger().listRuns({ limit: 8 });
  });

  ipcMain.handle(
    "csv:resume-execution",
    async (event, input: ResumeProcessExecutionInput) => {
      const deliveryFormat = parseProcessCsvDeliveryFormat(
        input.deliveryFormat,
      );
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
        deliveryFormat,
        provider: execution.providerName,
        ...(execution.cnpjColumn ? { cnpjColumn: execution.cnpjColumn } : {}),
        providerConfigVersion: execution.providerConfigVersion,
        sourceFilePath: execution.sourceFilePath,
      });
    },
  );

  ipcMain.handle("csv:cancel-processing", () => {
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
    "csv:save-output-file",
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
    "csv:auto-save-output-file",
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
  const deliveryFormat = parseProcessCsvDeliveryFormat(input.deliveryFormat);

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

  const provider = createSimplesLookupProvider(input.provider);
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
      provider: input.provider,
      sourceFilePath: input.sourceFilePath ?? null,
      runId: executionSession.runId,
      checkpointPath: executionSession.checkpointPath,
    });

    const result = await processCsv(input.content, provider, {
      ...(options ? { cnpjColumn: options } : {}),
      deliveryFormat,
      executionLedger: executionSession,
      signal: controller.signal,
      onLookupProgress(progress) {
        event.sender.send("csv:lookup-progress", progress);
        const shouldLog =
          progress.completedUniqueLookups === 1 ||
          progress.completedUniqueLookups === progress.totalUniqueLookups ||
          progress.completedUniqueLookups % 10 === 0 ||
          Date.now() - lastLoggedAt >= 60_000;

        if (shouldLog) {
          lastLoggedAt = Date.now();
          console.info("[csv] progresso", {
            completedUniqueLookups: progress.completedUniqueLookups,
            totalUniqueLookups: progress.totalUniqueLookups,
            currentCnpj: progress.currentCnpj,
            elapsedMs: progress.elapsedMs,
            estimatedRemainingMs: progress.estimatedRemainingMs,
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
      runStatus: result.runStatus,
      elapsedMs: Date.now() - startedAt,
      savedPath: autoSaveResult.savedPath,
      runId: executionSession.runId,
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

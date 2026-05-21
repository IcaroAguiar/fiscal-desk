import { writeFile } from "node:fs/promises";
import path from "node:path";
import type {
  ProcessCsvDeliveryFormat,
  ProcessCsvOutputDelivery,
} from "../../core/app/process-csv.types";

type ProcessCsvOutput = {
  delivery: ProcessCsvOutputDelivery;
  outputCsv: string;
  outputXlsx: Uint8Array | null;
};

export async function attemptAutoSave(
  sourceFilePath: string | null,
  output: ProcessCsvOutput,
): Promise<{ savedPath: string | null; warningMessage: string | null }> {
  if (!sourceFilePath) {
    return {
      savedPath: null,
      warningMessage: null,
    };
  }

  try {
    const content =
      output.delivery.format === "xlsx" ? output.outputXlsx : output.outputCsv;

    if (!content) {
      throw new Error("Entrega XLSX não foi gerada.");
    }

    const savedPath = await autoSaveOutputFile(
      sourceFilePath,
      output.delivery.format,
      content,
    );

    return {
      savedPath,
      warningMessage: null,
    };
  } catch (error) {
    return {
      savedPath: null,
      warningMessage:
        error instanceof Error && error.message.trim()
          ? `Processamento concluído, mas o auto-save falhou: ${error.message}`
          : "Processamento concluído, mas o auto-save falhou.",
    };
  }
}

export function getAutoSaveOutputPath(
  sourceFilePath: string,
  format: ProcessCsvDeliveryFormat,
): string {
  const parsedPath = path.parse(sourceFilePath);
  return path.join(parsedPath.dir, `${parsedPath.name}-processado.${format}`);
}

export async function writeOutputFile(
  filePath: string,
  format: ProcessCsvDeliveryFormat,
  content: string | number[] | Uint8Array,
): Promise<void> {
  if (format === "xlsx") {
    await writeFile(filePath, Buffer.from(content as number[] | Uint8Array));
    return;
  }

  await writeFile(filePath, String(content), "utf8");
}

async function autoSaveOutputFile(
  sourceFilePath: string,
  format: ProcessCsvDeliveryFormat,
  content: string | Uint8Array,
): Promise<string> {
  const outputPath = getAutoSaveOutputPath(sourceFilePath, format);

  await writeOutputFile(outputPath, format, content);

  return outputPath;
}

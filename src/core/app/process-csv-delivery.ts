import {
  FISCAL_EXPORT_ARTIFACT_ID,
  type FiscalExportDeliveryOptionSelectionResult,
  getDefaultFiscalExportDeliveryOption,
  listFiscalExportArtifactDescriptors,
  selectFiscalExportArtifactDescriptor,
  validateFiscalExportDeliveryOptionSelection,
} from "../export/export-artifacts";
import {
  FISCAL_EXPORT_DELIVERY_OPTION_ID,
  type FiscalExportDeliveryOptionId,
} from "../export/export-contract";
import type {
  ProcessCsvDeliveryFormat,
  ProcessCsvOutputDelivery,
} from "./process-csv.types";

const DELIVERY_FORMATS = new Set<ProcessCsvDeliveryFormat>(
  listFiscalExportArtifactDescriptors().map((artifact) => artifact.format),
);

const DELIVERY_OPTION_BY_FORMAT = {
  csv: FISCAL_EXPORT_DELIVERY_OPTION_ID.PRESERVE_COLUMNS_CSV,
  xlsx: FISCAL_EXPORT_DELIVERY_OPTION_ID.CURRENT_RESULT_WORKBOOK,
} as const satisfies Record<
  ProcessCsvDeliveryFormat,
  FiscalExportDeliveryOptionId
>;

export type ProcessCsvDeliverySelectionInput = {
  deliveryFormat?: ProcessCsvDeliveryFormat;
  deliveryOptionId?: FiscalExportDeliveryOptionId | null;
};

export function parseProcessCsvDeliveryFormat(
  value: unknown,
): ProcessCsvDeliveryFormat {
  if (value === undefined || value === null || value === "") {
    return "csv";
  }

  if (typeof value === "string" && DELIVERY_FORMATS.has(value as never)) {
    return value as ProcessCsvDeliveryFormat;
  }

  throw new Error("Formato de entrega invalido. Use CSV ou Excel.");
}

export function resolveProcessCsvOutputDelivery(
  input: ProcessCsvDeliverySelectionInput = {},
): ProcessCsvOutputDelivery {
  const optionId =
    input.deliveryOptionId ??
    DELIVERY_OPTION_BY_FORMAT[
      parseProcessCsvDeliveryFormat(input.deliveryFormat)
    ] ??
    getDefaultFiscalExportDeliveryOption().id;
  const selection = validateFiscalExportDeliveryOptionSelection(optionId);

  if (!selection.ok) {
    throw new Error(getDeliveryOptionSelectionErrorMessage(selection));
  }

  if (!isCurrentProcessCsvArtifact(selection.artifact.id)) {
    throw new Error("Opcao de entrega sem artefato executavel atual.");
  }

  return {
    extension: selection.artifact.extension,
    format: selection.artifact.format,
    mimeType: selection.artifact.mimeType,
  };
}

export function getProcessCsvOutputDelivery(
  format: ProcessCsvDeliveryFormat,
): ProcessCsvOutputDelivery {
  const artifact = selectFiscalExportArtifactDescriptor(format);

  return {
    extension: artifact.extension,
    format,
    mimeType: artifact.mimeType,
  };
}

function getDeliveryOptionSelectionErrorMessage(
  selection: Exclude<FiscalExportDeliveryOptionSelectionResult, { ok: true }>,
): string {
  if (selection.reason === "unknown_option") {
    return "Opcao de entrega desconhecida.";
  }

  return "Opcao de entrega indisponivel ou sem artefato executavel atual.";
}

function isCurrentProcessCsvArtifact(id: string): boolean {
  return (
    id === FISCAL_EXPORT_ARTIFACT_ID.CSV_RESULT_DATASET ||
    id === FISCAL_EXPORT_ARTIFACT_ID.XLSX_RESULT_WORKBOOK
  );
}

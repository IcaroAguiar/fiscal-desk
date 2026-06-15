import {
  PROCESS_CSV_DELIVERY_OPTION_ID,
  type ProcessCsvDeliveryFormat,
  type ProcessCsvDeliveryOptionId,
} from "../../core/app/process-csv.types";
import {
  parseProcessCsvDeliveryFormat,
  resolveProcessCsvOutputDelivery,
} from "../../core/app/process-csv-delivery";
import type { FiscalExportDeliveryOptionId } from "../../core/export/export-contract";

export function resolveIpcDeliverySelection(input: {
  deliveryFormat?: unknown;
  deliveryOptionId?: unknown;
}):
  | { deliveryFormat: ProcessCsvDeliveryFormat }
  | { deliveryOptionId: ProcessCsvDeliveryOptionId } {
  if (Object.hasOwn(input, "deliveryOptionId")) {
    return {
      deliveryOptionId: parseIpcDeliveryOptionId(input.deliveryOptionId),
    };
  }

  return {
    deliveryFormat: parseProcessCsvDeliveryFormat(input.deliveryFormat),
  };
}

function parseIpcDeliveryOptionId(value: unknown): ProcessCsvDeliveryOptionId {
  if (typeof value !== "string") {
    throw new Error("Opcao de entrega desconhecida.");
  }

  const delivery = resolveProcessCsvOutputDelivery({
    deliveryOptionId: value as FiscalExportDeliveryOptionId,
  });

  if (
    delivery.format === "csv" &&
    value === PROCESS_CSV_DELIVERY_OPTION_ID.PRESERVE_COLUMNS_CSV
  ) {
    return PROCESS_CSV_DELIVERY_OPTION_ID.PRESERVE_COLUMNS_CSV;
  }

  if (
    delivery.format === "xlsx" &&
    value === PROCESS_CSV_DELIVERY_OPTION_ID.CURRENT_RESULT_WORKBOOK
  ) {
    return PROCESS_CSV_DELIVERY_OPTION_ID.CURRENT_RESULT_WORKBOOK;
  }

  throw new Error(
    "Opcao de entrega indisponivel ou sem artefato executavel atual.",
  );
}

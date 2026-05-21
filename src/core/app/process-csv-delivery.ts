import type {
  ProcessCsvDeliveryFormat,
  ProcessCsvOutputDelivery,
} from "./process-csv.types";

const DELIVERY_FORMATS = new Set<ProcessCsvDeliveryFormat>(["csv", "xlsx"]);

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

export function getProcessCsvOutputDelivery(
  format: ProcessCsvDeliveryFormat,
): ProcessCsvOutputDelivery {
  if (format === "xlsx") {
    return {
      extension: "xlsx",
      format,
      mimeType:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    };
  }

  return {
    extension: "csv",
    format,
    mimeType: "text/csv;charset=utf-8",
  };
}

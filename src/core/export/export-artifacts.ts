import {
  FISCAL_EXPORT_ARTIFACTS,
  FISCAL_EXPORT_DELIVERY_OPTION_AVAILABILITY,
  FISCAL_EXPORT_DELIVERY_OPTIONS,
  FISCAL_EXPORT_FORMAT,
  FISCAL_EXPORT_TEMPLATE_AVAILABILITY,
  type FiscalExportArtifactContract,
  type FiscalExportArtifactContractId,
  type FiscalExportDeliveryOptionContract,
  type FiscalExportDeliveryOptionId,
  type FiscalExportFormat,
  type FiscalExportTemplateAvailability,
} from "./export-contract";

export type FiscalExportArtifactId = FiscalExportArtifactContractId;

export const FISCAL_EXPORT_ARTIFACT_ID = {
  CSV_RESULT_DATASET: "CSV_RESULT_DATASET",
  XLSX_RESULT_WORKBOOK: "XLSX_RESULT_WORKBOOK",
} as const satisfies Record<FiscalExportArtifactId, FiscalExportArtifactId>;

export type FiscalExportDeliveryOptionSelectionResult =
  | {
      artifact: FiscalExportArtifactDescriptor;
      ok: true;
      option: FiscalExportDeliveryOptionContract;
    }
  | {
      ok: false;
      reason: "unknown_option" | "unavailable_option";
    };

export type FiscalExportTemplateState =
  | {
      availability: Extract<FiscalExportTemplateAvailability, "none">;
      state: "not_applicable";
      templateId: null;
    }
  | {
      availability: Extract<
        FiscalExportTemplateAvailability,
        "not_implemented"
      >;
      state: "not_implemented";
      templateId: null;
    };

export type FiscalExportArtifactDescriptor = {
  contract: FiscalExportArtifactContract;
  extension: FiscalExportFormat;
  format: FiscalExportFormat;
  id: FiscalExportArtifactId;
  label: string;
  mimeType: string;
  template: FiscalExportTemplateState;
};

const FISCAL_EXPORT_ARTIFACT_ORDER = [
  FISCAL_EXPORT_ARTIFACT_ID.CSV_RESULT_DATASET,
  FISCAL_EXPORT_ARTIFACT_ID.XLSX_RESULT_WORKBOOK,
] as const satisfies readonly FiscalExportArtifactId[];

const FISCAL_EXPORT_ARTIFACT_LABELS = {
  [FISCAL_EXPORT_ARTIFACT_ID.CSV_RESULT_DATASET]: "CSV de resultados",
  [FISCAL_EXPORT_ARTIFACT_ID.XLSX_RESULT_WORKBOOK]:
    "Planilha XLSX de resultados",
} as const satisfies Record<FiscalExportArtifactId, string>;

const FISCAL_EXPORT_ARTIFACT_BY_FORMAT = {
  [FISCAL_EXPORT_FORMAT.CSV]: FISCAL_EXPORT_ARTIFACT_ID.CSV_RESULT_DATASET,
  [FISCAL_EXPORT_FORMAT.XLSX]: FISCAL_EXPORT_ARTIFACT_ID.XLSX_RESULT_WORKBOOK,
} as const satisfies Record<FiscalExportFormat, FiscalExportArtifactId>;

const FISCAL_EXPORT_DELIVERY_OPTION_ORDER = [
  FISCAL_EXPORT_DELIVERY_OPTIONS.PRESERVE_COLUMNS_CSV.id,
  FISCAL_EXPORT_DELIVERY_OPTIONS.CURRENT_RESULT_WORKBOOK.id,
  FISCAL_EXPORT_DELIVERY_OPTIONS.NORMALIZED_WORKBOOK.id,
  FISCAL_EXPORT_DELIVERY_OPTIONS.DETAILED_AUDIT_WORKBOOK.id,
  FISCAL_EXPORT_DELIVERY_OPTIONS.SUMMARY_WORKBOOK.id,
  FISCAL_EXPORT_DELIVERY_OPTIONS.GUIDED_CUSTOM_WORKBOOK.id,
  FISCAL_EXPORT_DELIVERY_OPTIONS.EXECUTIVE_PDF.id,
  FISCAL_EXPORT_DELIVERY_OPTIONS.DETAILED_JSON.id,
] as const satisfies readonly FiscalExportDeliveryOptionId[];

const FISCAL_EXPORT_DELIVERY_OPTION_BY_ID = Object.fromEntries(
  Object.values(FISCAL_EXPORT_DELIVERY_OPTIONS).map((option) => [
    option.id,
    option,
  ]),
) as Record<FiscalExportDeliveryOptionId, FiscalExportDeliveryOptionContract>;

export function listFiscalExportArtifactDescriptors(): FiscalExportArtifactDescriptor[] {
  return FISCAL_EXPORT_ARTIFACT_ORDER.map((id) =>
    describeFiscalExportArtifact(id),
  );
}

export function listFiscalExportDeliveryOptions(): FiscalExportDeliveryOptionContract[] {
  return FISCAL_EXPORT_DELIVERY_OPTION_ORDER.map(
    (id) => FISCAL_EXPORT_DELIVERY_OPTION_BY_ID[id],
  );
}

export function getDefaultFiscalExportDeliveryOption(): FiscalExportDeliveryOptionContract {
  return FISCAL_EXPORT_DELIVERY_OPTIONS.PRESERVE_COLUMNS_CSV;
}

export function describeFiscalExportDeliveryOption(
  id: FiscalExportDeliveryOptionId,
): FiscalExportDeliveryOptionContract {
  return FISCAL_EXPORT_DELIVERY_OPTION_BY_ID[id];
}

export function validateFiscalExportDeliveryOptionSelection(
  id: unknown,
): FiscalExportDeliveryOptionSelectionResult {
  if (
    typeof id !== "string" ||
    !Object.hasOwn(FISCAL_EXPORT_DELIVERY_OPTION_BY_ID, id)
  ) {
    return {
      ok: false,
      reason: "unknown_option",
    };
  }

  const option =
    FISCAL_EXPORT_DELIVERY_OPTION_BY_ID[id as FiscalExportDeliveryOptionId];

  if (
    option.availability !==
      FISCAL_EXPORT_DELIVERY_OPTION_AVAILABILITY.CURRENT ||
    option.artifactId === null
  ) {
    return {
      ok: false,
      reason: "unavailable_option",
    };
  }

  return {
    artifact: describeFiscalExportArtifact(option.artifactId),
    ok: true,
    option,
  };
}

export function selectFiscalExportArtifactDescriptor(
  format: FiscalExportFormat,
): FiscalExportArtifactDescriptor {
  return describeFiscalExportArtifact(FISCAL_EXPORT_ARTIFACT_BY_FORMAT[format]);
}

export function getFiscalExportArtifactContract(
  format: FiscalExportFormat,
): FiscalExportArtifactContract {
  return FISCAL_EXPORT_ARTIFACTS[FISCAL_EXPORT_ARTIFACT_BY_FORMAT[format]];
}

export function describeFiscalExportArtifact(
  id: FiscalExportArtifactId,
): FiscalExportArtifactDescriptor {
  const contract = FISCAL_EXPORT_ARTIFACTS[id];

  return {
    contract,
    extension: contract.extension,
    format: contract.format,
    id,
    label: FISCAL_EXPORT_ARTIFACT_LABELS[id],
    mimeType: contract.mimeType,
    template: describeFiscalExportTemplate(contract),
  };
}

export function describeFiscalExportTemplate(
  contract: FiscalExportArtifactContract,
): FiscalExportTemplateState {
  if (
    contract.template.availability === FISCAL_EXPORT_TEMPLATE_AVAILABILITY.NONE
  ) {
    return {
      availability: contract.template.availability,
      state: "not_applicable",
      templateId: null,
    };
  }

  return {
    availability: contract.template.availability,
    state: "not_implemented",
    templateId: null,
  };
}

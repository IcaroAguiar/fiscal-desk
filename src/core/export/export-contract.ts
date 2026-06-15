export const FISCAL_EXPORT_FORMAT = {
  CSV: "csv",
  XLSX: "xlsx",
} as const;

export type FiscalExportFormat =
  (typeof FISCAL_EXPORT_FORMAT)[keyof typeof FISCAL_EXPORT_FORMAT];

export const FISCAL_EXPORT_ARTIFACT_KIND = {
  RESULT_DATASET: "result_dataset",
  RESULT_WORKBOOK: "result_workbook",
} as const;

export type FiscalExportArtifactKind =
  (typeof FISCAL_EXPORT_ARTIFACT_KIND)[keyof typeof FISCAL_EXPORT_ARTIFACT_KIND];

export const FISCAL_EXPORT_TEMPLATE_AVAILABILITY = {
  NONE: "none",
  NOT_IMPLEMENTED: "not_implemented",
} as const;

export type FiscalExportTemplateAvailability =
  (typeof FISCAL_EXPORT_TEMPLATE_AVAILABILITY)[keyof typeof FISCAL_EXPORT_TEMPLATE_AVAILABILITY];

export type FiscalExportTemplateContract = {
  availability: FiscalExportTemplateAvailability;
  templateId: string | null;
};

export type FiscalExportArtifactContract = {
  extension: FiscalExportFormat;
  format: FiscalExportFormat;
  kind: FiscalExportArtifactKind;
  mimeType: string;
  template: FiscalExportTemplateContract;
};

export const FISCAL_EXPORT_ARTIFACTS = {
  CSV_RESULT_DATASET: {
    extension: FISCAL_EXPORT_FORMAT.CSV,
    format: FISCAL_EXPORT_FORMAT.CSV,
    kind: FISCAL_EXPORT_ARTIFACT_KIND.RESULT_DATASET,
    mimeType: "text/csv;charset=utf-8",
    template: {
      availability: FISCAL_EXPORT_TEMPLATE_AVAILABILITY.NONE,
      templateId: null,
    },
  },
  XLSX_RESULT_WORKBOOK: {
    extension: FISCAL_EXPORT_FORMAT.XLSX,
    format: FISCAL_EXPORT_FORMAT.XLSX,
    kind: FISCAL_EXPORT_ARTIFACT_KIND.RESULT_WORKBOOK,
    mimeType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    template: {
      availability: FISCAL_EXPORT_TEMPLATE_AVAILABILITY.NOT_IMPLEMENTED,
      templateId: null,
    },
  },
} as const satisfies Record<string, FiscalExportArtifactContract>;

export type FiscalExportArtifactContractId =
  keyof typeof FISCAL_EXPORT_ARTIFACTS;

export const FISCAL_EXPORT_DELIVERY_OPTION_AVAILABILITY = {
  CURRENT: "current",
  PLANNED: "planned",
  DISABLED: "disabled",
} as const;

export type FiscalExportDeliveryOptionAvailability =
  (typeof FISCAL_EXPORT_DELIVERY_OPTION_AVAILABILITY)[keyof typeof FISCAL_EXPORT_DELIVERY_OPTION_AVAILABILITY];

export const FISCAL_EXPORT_DELIVERY_OUTPUT_FORMAT = {
  CSV: FISCAL_EXPORT_FORMAT.CSV,
  XLSX: FISCAL_EXPORT_FORMAT.XLSX,
  PDF: "pdf",
  JSON: "json",
} as const;

export type FiscalExportDeliveryOutputFormat =
  (typeof FISCAL_EXPORT_DELIVERY_OUTPUT_FORMAT)[keyof typeof FISCAL_EXPORT_DELIVERY_OUTPUT_FORMAT];

export const FISCAL_EXPORT_DELIVERY_OPTION_ID = {
  PRESERVE_COLUMNS_CSV: "preserve-columns-csv",
  CURRENT_RESULT_WORKBOOK: "current-result-workbook",
  NORMALIZED_WORKBOOK: "normalized-workbook",
  DETAILED_AUDIT_WORKBOOK: "detailed-audit-workbook",
  SUMMARY_WORKBOOK: "summary-workbook",
  GUIDED_CUSTOM_WORKBOOK: "guided-custom-workbook",
  EXECUTIVE_PDF: "executive-pdf",
  DETAILED_JSON: "detailed-json",
} as const;

export type FiscalExportDeliveryOptionId =
  (typeof FISCAL_EXPORT_DELIVERY_OPTION_ID)[keyof typeof FISCAL_EXPORT_DELIVERY_OPTION_ID];

export const FISCAL_EXPORT_DELIVERY_COLUMN_POLICY = {
  PRESERVE_ORIGINAL_APPEND_APP: "preserve_original_append_app",
  NORMALIZED_APP_FIELDS: "normalized_app_fields",
  SELECTABLE_GUIDED_FIELDS: "selectable_guided_fields",
  NOT_APPLICABLE: "not_applicable",
} as const;

export type FiscalExportDeliveryColumnPolicy =
  (typeof FISCAL_EXPORT_DELIVERY_COLUMN_POLICY)[keyof typeof FISCAL_EXPORT_DELIVERY_COLUMN_POLICY];

export const FISCAL_EXPORT_DELIVERY_MODEL_AVAILABILITY = {
  DEFERRED: "deferred",
} as const;

export type FiscalExportDeliveryModelAvailability =
  (typeof FISCAL_EXPORT_DELIVERY_MODEL_AVAILABILITY)[keyof typeof FISCAL_EXPORT_DELIVERY_MODEL_AVAILABILITY];

export type FiscalExportDeliveryReusableModelContract = {
  availability: FiscalExportDeliveryModelAvailability;
  persistence: "none";
  versioning: "reserved";
};

export type FiscalExportDeliveryTemplateContract = {
  availability: FiscalExportTemplateAvailability;
  templateId: string | null;
};

export type FiscalExportDeliveryExecutionSeparation = {
  affectsConfirmationPolicy: false;
  affectsFailurePolicy: false;
  affectsProviderSelection: false;
  affectsSpeed: false;
};

export type FiscalExportDeliveryOptionContract = {
  artifactId: FiscalExportArtifactContractId | null;
  availability: FiscalExportDeliveryOptionAvailability;
  columnPolicy: FiscalExportDeliveryColumnPolicy;
  defaultRecommended: boolean;
  execution: FiscalExportDeliveryExecutionSeparation;
  id: FiscalExportDeliveryOptionId;
  includes: {
    appFields: boolean;
    audit: boolean;
    divergences: boolean;
    originalColumns: boolean;
    summary: boolean;
  };
  label: string;
  outputFormat: FiscalExportDeliveryOutputFormat;
  reusableModel: FiscalExportDeliveryReusableModelContract;
  template: FiscalExportDeliveryTemplateContract;
  unavailableReason: string | null;
};

const DEFERRED_REUSABLE_DELIVERY_MODEL = {
  availability: FISCAL_EXPORT_DELIVERY_MODEL_AVAILABILITY.DEFERRED,
  persistence: "none",
  versioning: "reserved",
} as const satisfies FiscalExportDeliveryReusableModelContract;

const DELIVERY_DOES_NOT_AFFECT_EXECUTION = {
  affectsConfirmationPolicy: false,
  affectsFailurePolicy: false,
  affectsProviderSelection: false,
  affectsSpeed: false,
} as const satisfies FiscalExportDeliveryExecutionSeparation;

export const FISCAL_EXPORT_DELIVERY_OPTIONS = {
  PRESERVE_COLUMNS_CSV: {
    artifactId: "CSV_RESULT_DATASET",
    availability: FISCAL_EXPORT_DELIVERY_OPTION_AVAILABILITY.CURRENT,
    columnPolicy:
      FISCAL_EXPORT_DELIVERY_COLUMN_POLICY.PRESERVE_ORIGINAL_APPEND_APP,
    defaultRecommended: true,
    execution: DELIVERY_DOES_NOT_AFFECT_EXECUTION,
    id: FISCAL_EXPORT_DELIVERY_OPTION_ID.PRESERVE_COLUMNS_CSV,
    includes: {
      appFields: true,
      audit: false,
      divergences: false,
      originalColumns: true,
      summary: false,
    },
    label: "CSV atual com colunas originais",
    outputFormat: FISCAL_EXPORT_DELIVERY_OUTPUT_FORMAT.CSV,
    reusableModel: DEFERRED_REUSABLE_DELIVERY_MODEL,
    template: {
      availability: FISCAL_EXPORT_TEMPLATE_AVAILABILITY.NONE,
      templateId: null,
    },
    unavailableReason: null,
  },
  CURRENT_RESULT_WORKBOOK: {
    artifactId: "XLSX_RESULT_WORKBOOK",
    availability: FISCAL_EXPORT_DELIVERY_OPTION_AVAILABILITY.CURRENT,
    columnPolicy:
      FISCAL_EXPORT_DELIVERY_COLUMN_POLICY.PRESERVE_ORIGINAL_APPEND_APP,
    defaultRecommended: false,
    execution: DELIVERY_DOES_NOT_AFFECT_EXECUTION,
    id: FISCAL_EXPORT_DELIVERY_OPTION_ID.CURRENT_RESULT_WORKBOOK,
    includes: {
      appFields: true,
      audit: true,
      divergences: true,
      originalColumns: true,
      summary: true,
    },
    label: "Planilha XLSX atual de resultados",
    outputFormat: FISCAL_EXPORT_DELIVERY_OUTPUT_FORMAT.XLSX,
    reusableModel: DEFERRED_REUSABLE_DELIVERY_MODEL,
    template: {
      availability: FISCAL_EXPORT_TEMPLATE_AVAILABILITY.NOT_IMPLEMENTED,
      templateId: null,
    },
    unavailableReason: null,
  },
  NORMALIZED_WORKBOOK: {
    artifactId: null,
    availability: FISCAL_EXPORT_DELIVERY_OPTION_AVAILABILITY.PLANNED,
    columnPolicy: FISCAL_EXPORT_DELIVERY_COLUMN_POLICY.NORMALIZED_APP_FIELDS,
    defaultRecommended: false,
    execution: DELIVERY_DOES_NOT_AFFECT_EXECUTION,
    id: FISCAL_EXPORT_DELIVERY_OPTION_ID.NORMALIZED_WORKBOOK,
    includes: {
      appFields: true,
      audit: false,
      divergences: false,
      originalColumns: false,
      summary: false,
    },
    label: "Planilha normalizada",
    outputFormat: FISCAL_EXPORT_DELIVERY_OUTPUT_FORMAT.XLSX,
    reusableModel: DEFERRED_REUSABLE_DELIVERY_MODEL,
    template: {
      availability: FISCAL_EXPORT_TEMPLATE_AVAILABILITY.NOT_IMPLEMENTED,
      templateId: null,
    },
    unavailableReason: "Planejado; sem contrato executavel neste corte.",
  },
  DETAILED_AUDIT_WORKBOOK: {
    artifactId: null,
    availability: FISCAL_EXPORT_DELIVERY_OPTION_AVAILABILITY.PLANNED,
    columnPolicy: FISCAL_EXPORT_DELIVERY_COLUMN_POLICY.NORMALIZED_APP_FIELDS,
    defaultRecommended: false,
    execution: DELIVERY_DOES_NOT_AFFECT_EXECUTION,
    id: FISCAL_EXPORT_DELIVERY_OPTION_ID.DETAILED_AUDIT_WORKBOOK,
    includes: {
      appFields: true,
      audit: true,
      divergences: true,
      originalColumns: true,
      summary: true,
    },
    label: "Planilha detalhada com auditoria",
    outputFormat: FISCAL_EXPORT_DELIVERY_OUTPUT_FORMAT.XLSX,
    reusableModel: DEFERRED_REUSABLE_DELIVERY_MODEL,
    template: {
      availability: FISCAL_EXPORT_TEMPLATE_AVAILABILITY.NOT_IMPLEMENTED,
      templateId: null,
    },
    unavailableReason: "Planejado; abas e campos ainda nao sao selecionaveis.",
  },
  SUMMARY_WORKBOOK: {
    artifactId: null,
    availability: FISCAL_EXPORT_DELIVERY_OPTION_AVAILABILITY.PLANNED,
    columnPolicy: FISCAL_EXPORT_DELIVERY_COLUMN_POLICY.NORMALIZED_APP_FIELDS,
    defaultRecommended: false,
    execution: DELIVERY_DOES_NOT_AFFECT_EXECUTION,
    id: FISCAL_EXPORT_DELIVERY_OPTION_ID.SUMMARY_WORKBOOK,
    includes: {
      appFields: true,
      audit: false,
      divergences: false,
      originalColumns: false,
      summary: true,
    },
    label: "Planilha resumida",
    outputFormat: FISCAL_EXPORT_DELIVERY_OUTPUT_FORMAT.XLSX,
    reusableModel: DEFERRED_REUSABLE_DELIVERY_MODEL,
    template: {
      availability: FISCAL_EXPORT_TEMPLATE_AVAILABILITY.NOT_IMPLEMENTED,
      templateId: null,
    },
    unavailableReason: "Planejado; resumo dedicado ainda nao foi implementado.",
  },
  GUIDED_CUSTOM_WORKBOOK: {
    artifactId: null,
    availability: FISCAL_EXPORT_DELIVERY_OPTION_AVAILABILITY.PLANNED,
    columnPolicy: FISCAL_EXPORT_DELIVERY_COLUMN_POLICY.SELECTABLE_GUIDED_FIELDS,
    defaultRecommended: false,
    execution: DELIVERY_DOES_NOT_AFFECT_EXECUTION,
    id: FISCAL_EXPORT_DELIVERY_OPTION_ID.GUIDED_CUSTOM_WORKBOOK,
    includes: {
      appFields: true,
      audit: true,
      divergences: true,
      originalColumns: true,
      summary: true,
    },
    label: "Saida personalizada guiada",
    outputFormat: FISCAL_EXPORT_DELIVERY_OUTPUT_FORMAT.XLSX,
    reusableModel: DEFERRED_REUSABLE_DELIVERY_MODEL,
    template: {
      availability: FISCAL_EXPORT_TEMPLATE_AVAILABILITY.NOT_IMPLEMENTED,
      templateId: null,
    },
    unavailableReason:
      "Planejado; selecao guiada, reproducibilidade e modelos salvos foram deferidos.",
  },
  EXECUTIVE_PDF: {
    artifactId: null,
    availability: FISCAL_EXPORT_DELIVERY_OPTION_AVAILABILITY.DISABLED,
    columnPolicy: FISCAL_EXPORT_DELIVERY_COLUMN_POLICY.NOT_APPLICABLE,
    defaultRecommended: false,
    execution: DELIVERY_DOES_NOT_AFFECT_EXECUTION,
    id: FISCAL_EXPORT_DELIVERY_OPTION_ID.EXECUTIVE_PDF,
    includes: {
      appFields: true,
      audit: false,
      divergences: false,
      originalColumns: false,
      summary: true,
    },
    label: "PDF executivo",
    outputFormat: FISCAL_EXPORT_DELIVERY_OUTPUT_FORMAT.PDF,
    reusableModel: DEFERRED_REUSABLE_DELIVERY_MODEL,
    template: {
      availability: FISCAL_EXPORT_TEMPLATE_AVAILABILITY.NOT_IMPLEMENTED,
      templateId: null,
    },
    unavailableReason: "Desabilitado; PDF/OCR nao pertence a este corte.",
  },
  DETAILED_JSON: {
    artifactId: null,
    availability: FISCAL_EXPORT_DELIVERY_OPTION_AVAILABILITY.DISABLED,
    columnPolicy: FISCAL_EXPORT_DELIVERY_COLUMN_POLICY.NOT_APPLICABLE,
    defaultRecommended: false,
    execution: DELIVERY_DOES_NOT_AFFECT_EXECUTION,
    id: FISCAL_EXPORT_DELIVERY_OPTION_ID.DETAILED_JSON,
    includes: {
      appFields: true,
      audit: true,
      divergences: true,
      originalColumns: false,
      summary: true,
    },
    label: "JSON detalhado",
    outputFormat: FISCAL_EXPORT_DELIVERY_OUTPUT_FORMAT.JSON,
    reusableModel: DEFERRED_REUSABLE_DELIVERY_MODEL,
    template: {
      availability: FISCAL_EXPORT_TEMPLATE_AVAILABILITY.NOT_IMPLEMENTED,
      templateId: null,
    },
    unavailableReason:
      "Desabilitado; formato avancado sem contrato executavel neste corte.",
  },
} as const satisfies Record<string, FiscalExportDeliveryOptionContract>;

export const FISCAL_EXPORT_BOUNDARY = {
  responsibility:
    "Describe output artifacts, delivery options, formats, mime types and template availability after lookup results exist.",
  mustNotOwn:
    "Input parsing, provider lookup, execution ledger state, execution speed, confirmation policy, failure policy, IPC, renderer copy or file picker behavior.",
} as const;

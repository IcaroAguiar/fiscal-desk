import { describe, expect, it } from "vitest";

import {
  describeFiscalExportArtifact,
  describeFiscalExportTemplate,
  FISCAL_EXPORT_ARTIFACT_ID,
  getDefaultFiscalExportDeliveryOption,
  getFiscalExportArtifactContract,
  listFiscalExportArtifactDescriptors,
  listFiscalExportDeliveryOptions,
  selectFiscalExportArtifactDescriptor,
  validateFiscalExportDeliveryOptionSelection,
} from "../../src/core/export/export-artifacts";
import {
  FISCAL_EXPORT_ARTIFACT_KIND,
  FISCAL_EXPORT_ARTIFACTS,
  FISCAL_EXPORT_DELIVERY_COLUMN_POLICY,
  FISCAL_EXPORT_DELIVERY_OPTION_AVAILABILITY,
  FISCAL_EXPORT_DELIVERY_OPTION_ID,
  FISCAL_EXPORT_DELIVERY_OUTPUT_FORMAT,
  FISCAL_EXPORT_FORMAT,
  FISCAL_EXPORT_TEMPLATE_AVAILABILITY,
} from "../../src/core/export/export-contract";

describe("fiscal export artifacts", () => {
  it("lists the executable CSV and XLSX delivery descriptors from the contract registry", () => {
    expect(listFiscalExportArtifactDescriptors()).toEqual([
      {
        contract: FISCAL_EXPORT_ARTIFACTS.CSV_RESULT_DATASET,
        extension: FISCAL_EXPORT_FORMAT.CSV,
        format: FISCAL_EXPORT_FORMAT.CSV,
        id: FISCAL_EXPORT_ARTIFACT_ID.CSV_RESULT_DATASET,
        label: "CSV de resultados",
        mimeType: "text/csv;charset=utf-8",
        template: {
          availability: FISCAL_EXPORT_TEMPLATE_AVAILABILITY.NONE,
          state: "not_applicable",
          templateId: null,
        },
      },
      {
        contract: FISCAL_EXPORT_ARTIFACTS.XLSX_RESULT_WORKBOOK,
        extension: FISCAL_EXPORT_FORMAT.XLSX,
        format: FISCAL_EXPORT_FORMAT.XLSX,
        id: FISCAL_EXPORT_ARTIFACT_ID.XLSX_RESULT_WORKBOOK,
        label: "Planilha XLSX de resultados",
        mimeType:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        template: {
          availability: FISCAL_EXPORT_TEMPLATE_AVAILABILITY.NOT_IMPLEMENTED,
          state: "not_implemented",
          templateId: null,
        },
      },
    ]);
  });

  it("selects existing CSV and XLSX artifacts without claiming templates are ready", () => {
    expect(getFiscalExportArtifactContract(FISCAL_EXPORT_FORMAT.CSV)).toBe(
      FISCAL_EXPORT_ARTIFACTS.CSV_RESULT_DATASET,
    );
    expect(getFiscalExportArtifactContract(FISCAL_EXPORT_FORMAT.XLSX)).toBe(
      FISCAL_EXPORT_ARTIFACTS.XLSX_RESULT_WORKBOOK,
    );

    expect(
      selectFiscalExportArtifactDescriptor(FISCAL_EXPORT_FORMAT.XLSX),
    ).toMatchObject({
      format: FISCAL_EXPORT_FORMAT.XLSX,
      id: FISCAL_EXPORT_ARTIFACT_ID.XLSX_RESULT_WORKBOOK,
      template: {
        availability: FISCAL_EXPORT_TEMPLATE_AVAILABILITY.NOT_IMPLEMENTED,
        state: "not_implemented",
        templateId: null,
      },
    });
  });

  it("keeps workbook templates unavailable until a real template contract exists", () => {
    const workbook = describeFiscalExportArtifact(
      FISCAL_EXPORT_ARTIFACT_ID.XLSX_RESULT_WORKBOOK,
    );

    expect(workbook.contract.kind).toBe(
      FISCAL_EXPORT_ARTIFACT_KIND.RESULT_WORKBOOK,
    );
    expect(describeFiscalExportTemplate(workbook.contract)).toEqual({
      availability: FISCAL_EXPORT_TEMPLATE_AVAILABILITY.NOT_IMPLEMENTED,
      state: "not_implemented",
      templateId: null,
    });
  });

  it("lists current, planned and disabled delivery options without changing executable artifacts", () => {
    expect(listFiscalExportDeliveryOptions()).toMatchObject([
      {
        artifactId: FISCAL_EXPORT_ARTIFACT_ID.CSV_RESULT_DATASET,
        availability: FISCAL_EXPORT_DELIVERY_OPTION_AVAILABILITY.CURRENT,
        columnPolicy:
          FISCAL_EXPORT_DELIVERY_COLUMN_POLICY.PRESERVE_ORIGINAL_APPEND_APP,
        defaultRecommended: true,
        id: FISCAL_EXPORT_DELIVERY_OPTION_ID.PRESERVE_COLUMNS_CSV,
        outputFormat: FISCAL_EXPORT_DELIVERY_OUTPUT_FORMAT.CSV,
        template: {
          availability: FISCAL_EXPORT_TEMPLATE_AVAILABILITY.NONE,
          templateId: null,
        },
      },
      {
        artifactId: FISCAL_EXPORT_ARTIFACT_ID.XLSX_RESULT_WORKBOOK,
        availability: FISCAL_EXPORT_DELIVERY_OPTION_AVAILABILITY.CURRENT,
        columnPolicy:
          FISCAL_EXPORT_DELIVERY_COLUMN_POLICY.PRESERVE_ORIGINAL_APPEND_APP,
        id: FISCAL_EXPORT_DELIVERY_OPTION_ID.CURRENT_RESULT_WORKBOOK,
        outputFormat: FISCAL_EXPORT_DELIVERY_OUTPUT_FORMAT.XLSX,
        template: {
          availability: FISCAL_EXPORT_TEMPLATE_AVAILABILITY.NOT_IMPLEMENTED,
          templateId: null,
        },
      },
      {
        artifactId: null,
        availability: FISCAL_EXPORT_DELIVERY_OPTION_AVAILABILITY.PLANNED,
        id: FISCAL_EXPORT_DELIVERY_OPTION_ID.NORMALIZED_WORKBOOK,
        outputFormat: FISCAL_EXPORT_DELIVERY_OUTPUT_FORMAT.XLSX,
      },
      {
        artifactId: null,
        availability: FISCAL_EXPORT_DELIVERY_OPTION_AVAILABILITY.PLANNED,
        id: FISCAL_EXPORT_DELIVERY_OPTION_ID.DETAILED_AUDIT_WORKBOOK,
        outputFormat: FISCAL_EXPORT_DELIVERY_OUTPUT_FORMAT.XLSX,
      },
      {
        artifactId: null,
        availability: FISCAL_EXPORT_DELIVERY_OPTION_AVAILABILITY.PLANNED,
        id: FISCAL_EXPORT_DELIVERY_OPTION_ID.SUMMARY_WORKBOOK,
        outputFormat: FISCAL_EXPORT_DELIVERY_OUTPUT_FORMAT.XLSX,
      },
      {
        artifactId: null,
        availability: FISCAL_EXPORT_DELIVERY_OPTION_AVAILABILITY.PLANNED,
        id: FISCAL_EXPORT_DELIVERY_OPTION_ID.GUIDED_CUSTOM_WORKBOOK,
        outputFormat: FISCAL_EXPORT_DELIVERY_OUTPUT_FORMAT.XLSX,
      },
      {
        artifactId: null,
        availability: FISCAL_EXPORT_DELIVERY_OPTION_AVAILABILITY.DISABLED,
        id: FISCAL_EXPORT_DELIVERY_OPTION_ID.EXECUTIVE_PDF,
        outputFormat: FISCAL_EXPORT_DELIVERY_OUTPUT_FORMAT.PDF,
      },
      {
        artifactId: null,
        availability: FISCAL_EXPORT_DELIVERY_OPTION_AVAILABILITY.DISABLED,
        id: FISCAL_EXPORT_DELIVERY_OPTION_ID.DETAILED_JSON,
        outputFormat: FISCAL_EXPORT_DELIVERY_OUTPUT_FORMAT.JSON,
      },
    ]);
  });

  it("keeps the recommended default as preserved original columns plus app fields", () => {
    expect(getDefaultFiscalExportDeliveryOption()).toMatchObject({
      columnPolicy:
        FISCAL_EXPORT_DELIVERY_COLUMN_POLICY.PRESERVE_ORIGINAL_APPEND_APP,
      defaultRecommended: true,
      id: FISCAL_EXPORT_DELIVERY_OPTION_ID.PRESERVE_COLUMNS_CSV,
      includes: {
        appFields: true,
        audit: false,
        divergences: false,
        originalColumns: true,
        summary: false,
      },
      reusableModel: {
        availability: "deferred",
        persistence: "none",
        versioning: "reserved",
      },
    });
  });

  it("validates only current delivery options backed by existing artifacts", () => {
    expect(
      validateFiscalExportDeliveryOptionSelection(
        FISCAL_EXPORT_DELIVERY_OPTION_ID.PRESERVE_COLUMNS_CSV,
      ),
    ).toMatchObject({
      artifact: {
        id: FISCAL_EXPORT_ARTIFACT_ID.CSV_RESULT_DATASET,
      },
      ok: true,
      option: {
        outputFormat: FISCAL_EXPORT_FORMAT.CSV,
      },
    });

    expect(
      validateFiscalExportDeliveryOptionSelection(
        FISCAL_EXPORT_DELIVERY_OPTION_ID.CURRENT_RESULT_WORKBOOK,
      ),
    ).toMatchObject({
      artifact: {
        id: FISCAL_EXPORT_ARTIFACT_ID.XLSX_RESULT_WORKBOOK,
      },
      ok: true,
      option: {
        outputFormat: FISCAL_EXPORT_FORMAT.XLSX,
      },
    });

    expect(
      validateFiscalExportDeliveryOptionSelection(
        FISCAL_EXPORT_DELIVERY_OPTION_ID.GUIDED_CUSTOM_WORKBOOK,
      ),
    ).toEqual({
      ok: false,
      reason: "unavailable_option",
    });
    expect(
      validateFiscalExportDeliveryOptionSelection(
        FISCAL_EXPORT_DELIVERY_OPTION_ID.EXECUTIVE_PDF,
      ),
    ).toEqual({
      ok: false,
      reason: "unavailable_option",
    });
    expect(
      validateFiscalExportDeliveryOptionSelection("template-pronto"),
    ).toEqual({
      ok: false,
      reason: "unknown_option",
    });
  });
});

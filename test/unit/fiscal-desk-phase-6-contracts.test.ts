import { describe, expect, it } from "vitest";
import {
  FISCAL_EXPORT_ARTIFACT_KIND,
  FISCAL_EXPORT_ARTIFACTS,
  FISCAL_EXPORT_BOUNDARY,
  FISCAL_EXPORT_DELIVERY_OPTION_AVAILABILITY,
  FISCAL_EXPORT_DELIVERY_OPTIONS,
  FISCAL_EXPORT_FORMAT,
  FISCAL_EXPORT_TEMPLATE_AVAILABILITY,
  type FiscalExportArtifactContract,
  type FiscalExportDeliveryOptionContract,
} from "../../src/core/export/export-contract";
import {
  FISCAL_INGESTION_BOUNDARY,
  FISCAL_INGESTION_INPUT_FORMAT,
  FISCAL_INGESTION_ISSUE_KIND,
  FISCAL_INGESTION_ISSUE_SEVERITY,
  FISCAL_INGESTION_SOURCE_KIND,
  type FiscalIngestionBatch,
} from "../../src/core/ingestion/ingestion-contract";

describe("Fiscal Desk F6 contracts", () => {
  it("keeps ingestion source, invalid and duplicate semantics provider-free", () => {
    const batch = {
      entries: [
        {
          cnpjNormalizado: "00000000000191",
          cnpjOriginal: "00.000.000/0001-91",
          row: {
            cnpj: "00.000.000/0001-91",
            razao_social: "Empresa exemplo",
          },
          rowNumber: 1,
        },
      ],
      issues: [
        {
          cnpjNormalizado: null,
          cnpjOriginal: "abc",
          kind: FISCAL_INGESTION_ISSUE_KIND.INVALID_CNPJ,
          message: "CNPJ invalido",
          rowNumber: 2,
          severity: FISCAL_INGESTION_ISSUE_SEVERITY.ERROR,
        },
        {
          cnpjNormalizado: "00000000000191",
          cnpjOriginal: "00.000.000/0001-91",
          kind: FISCAL_INGESTION_ISSUE_KIND.DUPLICATE_CNPJ,
          message: "CNPJ duplicado na entrada",
          rowNumber: 3,
          severity: FISCAL_INGESTION_ISSUE_SEVERITY.WARNING,
        },
      ],
      summary: {
        duplicateCnpjs: 1,
        invalidRows: 1,
        source: {
          format: FISCAL_INGESTION_INPUT_FORMAT.CSV,
          kind: FISCAL_INGESTION_SOURCE_KIND.LOCAL_FILE,
          label: "entrada.csv",
          receivedAt: "2026-06-13T00:00:00.000Z",
        },
        totalRows: 3,
        uniqueValidCnpjs: 1,
        validRows: 2,
      },
    } satisfies FiscalIngestionBatch;

    expect(batch.summary.source.format).toBe("csv");
    expect(batch.entries).toEqual([
      {
        cnpjNormalizado: "00000000000191",
        cnpjOriginal: "00.000.000/0001-91",
        row: {
          cnpj: "00.000.000/0001-91",
          razao_social: "Empresa exemplo",
        },
        rowNumber: 1,
      },
    ]);
    expect(batch.issues.map((issue) => issue.kind)).toEqual([
      "invalid_cnpj",
      "duplicate_cnpj",
    ]);
    expect(FISCAL_INGESTION_BOUNDARY.mustNotOwn).toContain("Provider");
  });

  it("separates export artifacts from template readiness and execution state", () => {
    const artifacts = Object.values(
      FISCAL_EXPORT_ARTIFACTS,
    ) satisfies FiscalExportArtifactContract[];

    expect(artifacts).toEqual([
      {
        extension: FISCAL_EXPORT_FORMAT.CSV,
        format: FISCAL_EXPORT_FORMAT.CSV,
        kind: FISCAL_EXPORT_ARTIFACT_KIND.RESULT_DATASET,
        mimeType: "text/csv;charset=utf-8",
        template: {
          availability: FISCAL_EXPORT_TEMPLATE_AVAILABILITY.NONE,
          templateId: null,
        },
      },
      {
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
    ]);
    expect(
      artifacts.some(
        (artifact) => artifact.template.availability === "not_implemented",
      ),
    ).toBe(true);
    expect(FISCAL_EXPORT_BOUNDARY.mustNotOwn).toContain(
      "execution ledger state",
    );
  });

  it("keeps delivery options separate from execution/provider models", () => {
    const deliveryOptions = Object.values(
      FISCAL_EXPORT_DELIVERY_OPTIONS,
    ) satisfies FiscalExportDeliveryOptionContract[];

    expect(
      deliveryOptions.filter(
        (option) =>
          option.availability ===
          FISCAL_EXPORT_DELIVERY_OPTION_AVAILABILITY.CURRENT,
      ),
    ).toMatchObject([
      {
        artifactId: "CSV_RESULT_DATASET",
        id: "preserve-columns-csv",
        outputFormat: FISCAL_EXPORT_FORMAT.CSV,
      },
      {
        artifactId: "XLSX_RESULT_WORKBOOK",
        id: "current-result-workbook",
        outputFormat: FISCAL_EXPORT_FORMAT.XLSX,
      },
    ]);
    expect(
      deliveryOptions
        .filter(
          (option) =>
            option.availability !==
            FISCAL_EXPORT_DELIVERY_OPTION_AVAILABILITY.CURRENT,
        )
        .every((option) => option.artifactId === null),
    ).toBe(true);
    expect(
      deliveryOptions.every(
        (option) =>
          option.execution.affectsProviderSelection === false &&
          option.execution.affectsSpeed === false &&
          option.execution.affectsConfirmationPolicy === false &&
          option.execution.affectsFailurePolicy === false,
      ),
    ).toBe(true);
    expect(
      deliveryOptions.every(
        (option) =>
          option.reusableModel.availability === "deferred" &&
          option.reusableModel.persistence === "none" &&
          option.reusableModel.versioning === "reserved",
      ),
    ).toBe(true);
  });
});

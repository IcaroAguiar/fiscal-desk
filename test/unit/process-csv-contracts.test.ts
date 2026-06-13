import { describe, expect, it } from "vitest";
import {
  PROCESS_CSV_DELIVERY_FORMAT,
  PROCESS_CSV_DELIVERY_OPTION_ID,
  PROCESS_CSV_EVENT_KIND,
  PROCESS_CSV_EXECUTION_BOUNDARIES,
  PROCESS_CSV_EXECUTION_STATUS,
  PROCESS_CSV_IPC_CHANNEL,
  PROCESS_CSV_RUN_STATUS,
  PROCESS_CSV_TERMINAL_EXECUTION_STATUSES,
  type ProcessCsvBridgeEvent,
  type ProcessCsvDomainEvent,
  type ProcessCsvExecutionStatus,
} from "../../src/core/app/process-csv.types";
import {
  getProcessCsvOutputDelivery,
  resolveProcessCsvOutputDelivery,
} from "../../src/core/app/process-csv-delivery";
import { selectFiscalExportArtifactDescriptor } from "../../src/core/export/export-artifacts";
import {
  FISCAL_EXPORT_DELIVERY_OPTION_ID,
  FISCAL_EXPORT_FORMAT,
  FISCAL_EXPORT_TEMPLATE_AVAILABILITY,
} from "../../src/core/export/export-contract";

describe("process CSV contracts", () => {
  it("derives execution statuses from the canonical contract", () => {
    const executionStatuses = new Set<ProcessCsvExecutionStatus>(
      Object.values(PROCESS_CSV_EXECUTION_STATUS),
    );

    expect(executionStatuses).toEqual(
      new Set(["RUNNING", "SUCCESS", "CANCELLED", "FAILED"]),
    );
    expect(PROCESS_CSV_EXECUTION_STATUS.SUCCESS).toBe(
      PROCESS_CSV_RUN_STATUS.SUCCESS,
    );
    expect(PROCESS_CSV_EXECUTION_STATUS.CANCELLED).toBe(
      PROCESS_CSV_RUN_STATUS.CANCELLED,
    );
    expect(PROCESS_CSV_TERMINAL_EXECUTION_STATUSES).toEqual([
      "SUCCESS",
      "CANCELLED",
      "FAILED",
    ]);
  });

  it("keeps delivery formats, domain events and IPC channels centralized", () => {
    expect(PROCESS_CSV_DELIVERY_FORMAT).toEqual({
      CSV: "csv",
      XLSX: "xlsx",
    });
    expect(PROCESS_CSV_DELIVERY_OPTION_ID).toEqual({
      CURRENT_RESULT_WORKBOOK: "current-result-workbook",
      PRESERVE_COLUMNS_CSV: "preserve-columns-csv",
    });
    expect(PROCESS_CSV_EVENT_KIND).toEqual({
      EXECUTION_STATE_CHANGED: "execution-state-changed",
      LOOKUP_PROGRESS_REPORTED: "lookup-progress-reported",
      OUTPUT_DELIVERY_READY: "output-delivery-ready",
      EXECUTION_ERROR_REPORTED: "execution-error-reported",
    });
    expect(PROCESS_CSV_IPC_CHANNEL).toEqual({
      AUTO_SAVE_OUTPUT_FILE: "csv:auto-save-output-file",
      CANCEL_PROCESSING: "csv:cancel-processing",
      LIST_EXECUTIONS: "csv:list-executions",
      LOOKUP_PROGRESS: "csv:lookup-progress",
      PICK_INPUT_FILE: "csv:pick-input-file",
      PROCESS: "csv:process",
      RESUME_EXECUTION: "csv:resume-execution",
      SAVE_OUTPUT_FILE: "csv:save-output-file",
    });
  });

  it("derives runtime delivery metadata from fiscal export descriptors without enabling templates", () => {
    const csvArtifact = selectFiscalExportArtifactDescriptor(
      FISCAL_EXPORT_FORMAT.CSV,
    );
    const xlsxArtifact = selectFiscalExportArtifactDescriptor(
      FISCAL_EXPORT_FORMAT.XLSX,
    );

    expect(
      getProcessCsvOutputDelivery(PROCESS_CSV_DELIVERY_FORMAT.CSV),
    ).toEqual({
      extension: csvArtifact.extension,
      format: PROCESS_CSV_DELIVERY_FORMAT.CSV,
      mimeType: csvArtifact.mimeType,
    });
    expect(
      getProcessCsvOutputDelivery(PROCESS_CSV_DELIVERY_FORMAT.XLSX),
    ).toEqual({
      extension: xlsxArtifact.extension,
      format: PROCESS_CSV_DELIVERY_FORMAT.XLSX,
      mimeType: xlsxArtifact.mimeType,
    });
    expect(xlsxArtifact.template).toEqual({
      availability: FISCAL_EXPORT_TEMPLATE_AVAILABILITY.NOT_IMPLEMENTED,
      state: "not_implemented",
      templateId: null,
    });
  });

  it("resolves runtime delivery from the F6E1 current option ids and legacy delivery formats", () => {
    expect(resolveProcessCsvOutputDelivery()).toEqual(
      getProcessCsvOutputDelivery(PROCESS_CSV_DELIVERY_FORMAT.CSV),
    );
    expect(
      resolveProcessCsvOutputDelivery({
        deliveryFormat: PROCESS_CSV_DELIVERY_FORMAT.XLSX,
      }),
    ).toEqual(getProcessCsvOutputDelivery(PROCESS_CSV_DELIVERY_FORMAT.XLSX));
    expect(
      resolveProcessCsvOutputDelivery({
        deliveryOptionId: FISCAL_EXPORT_DELIVERY_OPTION_ID.PRESERVE_COLUMNS_CSV,
      }),
    ).toEqual(getProcessCsvOutputDelivery(PROCESS_CSV_DELIVERY_FORMAT.CSV));
    expect(
      resolveProcessCsvOutputDelivery({
        deliveryOptionId:
          FISCAL_EXPORT_DELIVERY_OPTION_ID.CURRENT_RESULT_WORKBOOK,
      }),
    ).toEqual(getProcessCsvOutputDelivery(PROCESS_CSV_DELIVERY_FORMAT.XLSX));
  });

  it.each([
    {
      deliveryOptionId: "",
      message: "Opcao de entrega desconhecida.",
    },
    {
      deliveryOptionId: "unknown-delivery-option",
      message: "Opcao de entrega desconhecida.",
    },
    {
      deliveryOptionId: FISCAL_EXPORT_DELIVERY_OPTION_ID.NORMALIZED_WORKBOOK,
      message: "Opcao de entrega indisponivel",
    },
    {
      deliveryOptionId: FISCAL_EXPORT_DELIVERY_OPTION_ID.EXECUTIVE_PDF,
      message: "Opcao de entrega indisponivel",
    },
    {
      deliveryOptionId: FISCAL_EXPORT_DELIVERY_OPTION_ID.DETAILED_JSON,
      message: "Opcao de entrega indisponivel",
    },
  ])("rejects non-executable runtime delivery option $deliveryOptionId", ({
    deliveryOptionId,
    message,
  }) => {
    expect(() =>
      resolveProcessCsvOutputDelivery({
        deliveryOptionId: deliveryOptionId as never,
      }),
    ).toThrow(message);
  });

  it("documents the shared core, main and renderer boundaries", () => {
    expect(PROCESS_CSV_EXECUTION_BOUNDARIES.CORE.owner).toBe("core");
    expect(PROCESS_CSV_EXECUTION_BOUNDARIES.MAIN.owner).toBe("main");
    expect(PROCESS_CSV_EXECUTION_BOUNDARIES.RENDERER.owner).toBe("renderer");
  });

  it("describes typed event payloads without requiring runtime IPC", () => {
    const event = {
      kind: PROCESS_CSV_EVENT_KIND.LOOKUP_PROGRESS_REPORTED,
      payload: {
        execution: {
          checkpointPath: "/tmp/run.json",
          completedUniqueLookups: 1,
          resumedUniqueLookups: 0,
          runId: "run-1",
          status: PROCESS_CSV_EXECUTION_STATUS.RUNNING,
          totalUniqueLookups: 1,
        },
        occurredAt: "2026-06-13T00:00:00.000Z",
        progress: {
          completedUniqueLookups: 1,
          currentCnpj: "00000000000191",
          elapsedMs: 10,
          estimatedRemainingMs: 0,
          totalUniqueLookups: 1,
        },
      },
    } satisfies ProcessCsvDomainEvent;
    const bridgeEvent = {
      channel: PROCESS_CSV_IPC_CHANNEL.LOOKUP_PROGRESS,
      event: event.payload.progress,
    } satisfies ProcessCsvBridgeEvent;

    expect(event.payload.execution.runId).toBe("run-1");
    expect(bridgeEvent.event.completedUniqueLookups).toBe(1);
  });
});

import { describe, expect, it } from "vitest";

import { initialState } from "../../src/renderer/ui/app.types";
import { type AppRefs, collectAppRefs } from "../../src/renderer/ui/app-refs";
import { syncUi } from "../../src/renderer/ui/app-sync";
import { shouldDisableLocalPublicBasePrepareButton } from "../../src/renderer/ui/app-sync-rules";

describe("app sync", () => {
  it("keeps Base Pública Local preparation disabled until notice acceptance survives sync", () => {
    expect(
      shouldDisableLocalPublicBasePrepareButton({
        ...initialState,
        provider: "base-publica-local",
      }),
    ).toBe(true);

    expect(
      shouldDisableLocalPublicBasePrepareButton({
        ...initialState,
        localPublicBaseNoticeAccepted: true,
        provider: "base-publica-local",
      }),
    ).toBe(false);
  });

  it("syncs operational panel copy without exposing run ids or checkpoint filenames", () => {
    const refs = makeRefs();

    syncUi(refs, {
      ...initialState,
      execution: {
        checkpointPath: "/tmp/fiscal-desk/ledger.json",
        completedUniqueLookups: 4,
        resumedUniqueLookups: 2,
        runId: "run-technical-id",
        status: "RUNNING",
        totalUniqueLookups: 10,
      },
      fileName: "clientes.csv",
      progress: {
        completedUniqueLookups: 4,
        currentCnpj: "11222333000144",
        elapsedMs: 60_000,
        estimatedRemainingMs: 90_000,
        totalUniqueLookups: 10,
      },
      status: "processing",
    });

    expect(refs.sessionEntry?.textContent).toBe("Consultando 11222333000144");
    expect(refs.sessionDedupe?.textContent).toBe(
      "estimativa móvel: cerca de 1m 30s restantes.",
    );
    expect(refs.executionBlocker?.textContent).toBe(
      "Sem bloqueio sistêmico detectado.",
    );
    expect(refs.executionCheckpointCopy?.textContent).toBe(
      "2 CNPJs retomados do checkpoint local.",
    );
    expect(refs.executionRunId?.textContent).toBe("registrada");
    expect(refs.executionCheckpoint?.textContent).toBe("disponível");
    expect(refs.executionRunId?.textContent).not.toContain("run-technical-id");
    expect(refs.executionCheckpoint?.textContent).not.toContain("ledger.json");
  });

  it("collects operational panel refs by stable data slots", () => {
    const queries: string[] = [];
    const appRoot = {
      querySelector: (selector: string) => {
        queries.push(selector);
        return element();
      },
      querySelectorAll: () => [],
    } as unknown as HTMLElement;

    const refs = collectAppRefs(appRoot);

    expect(refs.executionBlocker).not.toBeNull();
    expect(refs.executionCheckpointCopy).not.toBeNull();
    expect(refs.executionSuggestion).not.toBeNull();
    expect(queries).toContain('[data-slot="execution-blocker"]');
    expect(queries).toContain('[data-slot="execution-checkpoint-copy"]');
    expect(queries).toContain('[data-slot="execution-suggestion"]');
  });
});

function element(): HTMLElement {
  return {
    classList: {
      toggle: () => undefined,
    },
    className: "",
    dataset: {},
    hidden: false,
    innerHTML: "",
    removeAttribute: () => undefined,
    setAttribute: () => undefined,
    style: {},
    textContent: "",
  } as unknown as HTMLElement;
}

function makeRefs(): AppRefs {
  const button = () =>
    ({
      ...element(),
      disabled: false,
    }) as unknown as HTMLButtonElement;

  return {
    cancelButton: button(),
    columnInput: null,
    commandHint: null,
    commandSummary: null,
    currentCnpj: null,
    dedupeLabel: null,
    deliveryFormatBadge: null,
    deliverySelect: null,
    executionBlocker: element(),
    executionCheckpoint: element(),
    executionCheckpointCopy: element(),
    executionHistory: null,
    executionResume: null,
    executionRunId: element(),
    executionStatus: null,
    executionSuggestion: element(),
    fileBadge: null,
    fileDropzoneHint: null,
    fileDropzoneTitle: null,
    kpiErrors: null,
    kpiPending: null,
    kpiProcessed: null,
    kpiTotalLines: null,
    localPublicBaseDate: null,
    localPublicBaseNotice: null,
    localPublicBaseNoticePanel: null,
    localPublicBasePrepareButton: null,
    localPublicBasePrepPanel: null,
    localPublicBaseStatusLine: null,
    localPublicBaseWarning: null,
    message: null,
    outputPreview: null,
    outputSavePath: null,
    outputStatus: null,
    pickButton: button(),
    processButton: button(),
    progressBar: null,
    progressLine: null,
    progressSection: null,
    protocolBase: null,
    protocolBaseHint: null,
    protocolEntry: null,
    protocolEntryHint: null,
    protocolOutput: null,
    protocolOutputHint: null,
    protocolResume: null,
    protocolStatus: null,
    providerSelect: null,
    providerStatus: null,
    queueActiveHint: null,
    queueActiveName: null,
    queueActiveStatus: null,
    queueCount: null,
    runStatusPill: null,
    saveButton: button(),
    saveInfo: null,
    sessionCheckpoint: element(),
    sessionDedupe: element(),
    sessionEntry: element(),
    sessionRun: element(),
    sessionState: element(),
    summary: null,
    topStatusPill: null,
    viewLinks: [],
    viewPanels: [],
  };
}

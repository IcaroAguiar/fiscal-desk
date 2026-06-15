import { describe, expect, it } from "vitest";

import { initialState } from "../../src/renderer/ui/app.types";
import { type AppRefs, collectAppRefs } from "../../src/renderer/ui/app-refs";
import { syncUi } from "../../src/renderer/ui/app-sync";
import {
  shouldDisableLocalPublicBaseDiscoverButton,
  shouldDisableLocalPublicBasePrepareButton,
  shouldDisableLocalPublicBasePrepareOfficialButton,
} from "../../src/renderer/ui/app-sync-rules";

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

    expect(
      shouldDisableLocalPublicBaseDiscoverButton({
        ...initialState,
        localPublicBaseOfficialSourceStatus: "loading",
      }),
    ).toBe(true);

    expect(
      shouldDisableLocalPublicBasePrepareOfficialButton({
        ...initialState,
        localPublicBaseNoticeAccepted: true,
        localPublicBaseOfficialSource: null,
        provider: "base-publica-local",
      }),
    ).toBe(true);

    expect(
      shouldDisableLocalPublicBasePrepareOfficialButton({
        ...initialState,
        localPublicBaseNoticeAccepted: true,
        localPublicBaseOfficialSource: {
          baseDate: "2026-01",
          directoryUrl: "https://example.test/2026-01/",
          fileName: "Simples.zip",
          fileUrl: "https://example.test/2026-01/Simples.zip",
          kind: "simples",
          lastModified: "2026-01-11 14:58",
          sizeLabel: "268M",
          sourcePageUrl: "https://example.test/",
        },
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
        currentCnpj: "11********0144",
        elapsedMs: 60_000,
        estimatedRemainingMs: 90_000,
        totalUniqueLookups: 10,
      },
      status: "processing",
    });

    expect(refs.sessionEntry?.textContent).toBe("Consultando 11********0144");
    expect(refs.sessionDedupe?.textContent).toBe(
      "estimativa móvel: cerca de 1m 30s restantes.",
    );
    expect(refs.executionBlocker?.textContent).toBe(
      "Sem bloqueio sistêmico detectado.",
    );
    expect(refs.speedPlanLabel?.textContent).toBe("Simulação rápida");
    expect(refs.activitySpeedLabel?.textContent).toBe("Simulação rápida");
    expect(refs.activitySpeedDetail?.textContent).toBe(
      "Valida o fluxo sem internet; troque de base antes de consultar dados reais.",
    );
    expect(refs.speedControlLabel?.textContent).toBe(
      "Use Pausar para checkpoint e retomada; Cancelar interrompe a execução.",
    );
    expect(refs.activityControlLabel?.textContent).toBe(
      "Use Pausar para checkpoint e retomada; Cancelar interrompe a execução.",
    );
    expect(refs.executionCheckpointCopy?.textContent).toBe(
      "2 CNPJs retomados do checkpoint local.",
    );
    expect(refs.activitySuggestion?.textContent).toBe(
      "Sugestão: simulação valida o fluxo; troque para Base local antes de dados reais.",
    );
    expect(refs.pauseButton?.disabled).toBe(false);
    expect(refs.cancelButton?.disabled).toBe(false);
    expect(refs.executionRunId?.textContent).toBe("registrada");
    expect(refs.executionCheckpoint?.textContent).toBe("disponível");
    expect(refs.executionRunId?.textContent).not.toContain("run-technical-id");
    expect(refs.executionCheckpoint?.textContent).not.toContain("ledger.json");

    syncUi(refs, initialState);

    expect(refs.pauseButton?.disabled).toBe(true);
    expect(refs.cancelButton?.disabled).toBe(true);
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
    expect(refs.activitySpeedLabel).not.toBeNull();
    expect(refs.activitySpeedDetail).not.toBeNull();
    expect(refs.activityControlLabel).not.toBeNull();
    expect(refs.activitySuggestion).not.toBeNull();
    expect(refs.speedPlanLabel).not.toBeNull();
    expect(refs.speedPlanDetail).not.toBeNull();
    expect(refs.speedControlLabel).not.toBeNull();
    expect(refs.speedProfileSelect).not.toBeNull();
    expect(refs.pauseButton).not.toBeNull();
    expect(refs.localPublicBaseDiscoverButton).not.toBeNull();
    expect(refs.localPublicBasePrepareOfficialButton).not.toBeNull();
    expect(refs.localPublicBaseOfficialSourceLine).not.toBeNull();
    expect(queries).toContain('[data-slot="execution-blocker"]');
    expect(queries).toContain('[data-slot="execution-checkpoint-copy"]');
    expect(queries).toContain('[data-slot="execution-suggestion"]');
    expect(queries).toContain('[data-slot="activity-speed-label"]');
    expect(queries).toContain('[data-slot="activity-speed-detail"]');
    expect(queries).toContain('[data-slot="activity-control-label"]');
    expect(queries).toContain('[data-slot="activity-suggestion"]');
    expect(queries).toContain('[data-slot="speed-plan-label"]');
    expect(queries).toContain('[data-slot="speed-plan-detail"]');
    expect(queries).toContain('[data-slot="speed-control-label"]');
    expect(queries).toContain('[data-field="execution-speed-profile"]');
    expect(queries).toContain('[data-field="receita-web-experimental-notice"]');
    expect(queries).toContain(
      '[data-slot="receita-web-experimental-notice-panel"]',
    );
    expect(queries).toContain('[data-action="pause-processing"]');
    expect(queries).toContain('[data-action="discover-official-source"]');
    expect(queries).toContain('[data-action="prepare-official-source"]');
    expect(queries).toContain(
      '[data-slot="local-public-base-official-source-line"]',
    );
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
    activityControlLabel: element(),
    activitySpeedDetail: element(),
    activitySpeedLabel: element(),
    activitySuggestion: element(),
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
    localPublicBaseDiscoverButton: null,
    localPublicBaseNotice: null,
    localPublicBaseNoticePanel: null,
    localPublicBaseOfficialSourceLine: null,
    localPublicBasePrepareButton: null,
    localPublicBasePrepareOfficialButton: null,
    localPublicBasePrepPanel: null,
    localPublicBaseStatusLine: null,
    localPublicBaseWarning: null,
    message: null,
    outputPreview: null,
    outputSavePath: null,
    outputStatus: null,
    pauseButton: button(),
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
    receitaWebExperimentalNotice: null,
    receitaWebExperimentalNoticePanel: null,
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
    speedControlLabel: element(),
    speedPlanDetail: element(),
    speedPlanLabel: element(),
    speedProfileSelect: null,
    summary: null,
    topStatusPill: null,
    viewLinks: [],
    viewPanels: [],
  };
}

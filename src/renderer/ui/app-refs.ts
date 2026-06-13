export type AppRefs = {
  cancelButton: HTMLButtonElement | null;
  columnInput: HTMLInputElement | null;
  commandHint: HTMLElement | null;
  commandSummary: HTMLElement | null;
  currentCnpj: HTMLElement | null;
  dedupeLabel: HTMLElement | null;
  deliveryFormatBadge: HTMLElement | null;
  deliverySelect: HTMLSelectElement | null;
  executionCheckpoint: HTMLElement | null;
  executionCheckpointCopy: HTMLElement | null;
  executionBlocker: HTMLElement | null;
  executionHistory: HTMLElement | null;
  executionResume: HTMLElement | null;
  executionRunId: HTMLElement | null;
  executionSuggestion: HTMLElement | null;
  executionStatus: HTMLElement | null;
  fileBadge: HTMLElement | null;
  fileDropzoneHint: HTMLElement | null;
  fileDropzoneTitle: HTMLElement | null;
  localPublicBaseDate: HTMLElement | null;
  localPublicBaseNotice: HTMLInputElement | null;
  localPublicBaseNoticePanel: HTMLElement | null;
  localPublicBasePrepareButton: HTMLButtonElement | null;
  localPublicBasePrepPanel: HTMLElement | null;
  localPublicBaseStatusLine: HTMLElement | null;
  localPublicBaseWarning: HTMLElement | null;
  message: HTMLElement | null;
  outputStatus: HTMLElement | null;
  outputPreview: HTMLElement | null;
  outputSavePath: HTMLElement | null;
  kpiErrors: HTMLElement | null;
  kpiPending: HTMLElement | null;
  kpiProcessed: HTMLElement | null;
  kpiTotalLines: HTMLElement | null;
  pickButton: HTMLButtonElement | null;
  processButton: HTMLButtonElement | null;
  progressBar: HTMLElement | null;
  progressLine: HTMLElement | null;
  progressSection: HTMLElement | null;
  providerSelect: HTMLSelectElement | null;
  providerStatus: HTMLElement | null;
  protocolBase: HTMLElement | null;
  protocolBaseHint: HTMLElement | null;
  protocolEntry: HTMLElement | null;
  protocolEntryHint: HTMLElement | null;
  protocolOutput: HTMLElement | null;
  protocolOutputHint: HTMLElement | null;
  protocolResume: HTMLElement | null;
  protocolStatus: HTMLElement | null;
  queueActiveHint: HTMLElement | null;
  queueActiveName: HTMLElement | null;
  queueActiveStatus: HTMLElement | null;
  queueCount: HTMLElement | null;
  saveButton: HTMLButtonElement | null;
  saveInfo: HTMLElement | null;
  sessionCheckpoint: HTMLElement | null;
  sessionDedupe: HTMLElement | null;
  sessionEntry: HTMLElement | null;
  sessionRun: HTMLElement | null;
  sessionState: HTMLElement | null;
  summary: HTMLElement | null;
  topStatusPill: HTMLElement | null;
  runStatusPill: HTMLElement | null;
  viewLinks: HTMLElement[];
  viewPanels: HTMLElement[];
};

export function collectAppRefs(appRoot: HTMLElement): AppRefs {
  return {
    pickButton: appRoot.querySelector<HTMLButtonElement>(
      '[data-action="pick-file"]',
    ),
    processButton: appRoot.querySelector<HTMLButtonElement>(
      '[data-action="process-file"]',
    ),
    saveButton: appRoot.querySelector<HTMLButtonElement>(
      '[data-action="save-file"]',
    ),
    cancelButton: appRoot.querySelector<HTMLButtonElement>(
      '[data-action="cancel-processing"]',
    ),
    providerSelect: appRoot.querySelector<HTMLSelectElement>(
      '[data-field="provider"]',
    ),
    columnInput: appRoot.querySelector<HTMLInputElement>(
      '[data-field="cnpj-column"]',
    ),
    deliverySelect: appRoot.querySelector<HTMLSelectElement>(
      '[data-field="delivery-format"]',
    ),
    localPublicBaseNotice: appRoot.querySelector<HTMLInputElement>(
      '[data-field="local-public-base-notice"]',
    ),
    localPublicBaseNoticePanel: appRoot.querySelector<HTMLElement>(
      '[data-slot="local-public-base-notice-panel"]',
    ),
    localPublicBaseDate: appRoot.querySelector<HTMLElement>(
      '[data-slot="local-public-base-date"]',
    ),
    localPublicBaseWarning: appRoot.querySelector<HTMLElement>(
      '[data-slot="local-public-base-warning"]',
    ),
    localPublicBaseStatusLine: appRoot.querySelector<HTMLElement>(
      '[data-slot="local-public-base-status-line"]',
    ),
    localPublicBasePrepareButton: appRoot.querySelector<HTMLButtonElement>(
      '[data-action="prepare-local-public-base"]',
    ),
    localPublicBasePrepPanel: appRoot.querySelector<HTMLElement>(
      '[data-slot="local-public-base-prep-panel"]',
    ),
    message: appRoot.querySelector<HTMLElement>('[data-slot="message"]'),
    commandSummary: appRoot.querySelector<HTMLElement>(
      '[data-slot="command-summary"]',
    ),
    commandHint: appRoot.querySelector<HTMLElement>(
      '[data-slot="command-hint"]',
    ),
    fileBadge: appRoot.querySelector<HTMLElement>('[data-slot="file-badge"]'),
    fileDropzoneTitle: appRoot.querySelector<HTMLElement>(
      '[data-slot="file-dropzone-title"]',
    ),
    fileDropzoneHint: appRoot.querySelector<HTMLElement>(
      '[data-slot="file-dropzone-hint"]',
    ),
    outputPreview: appRoot.querySelector<HTMLElement>(
      '[data-slot="output-preview"]',
    ),
    outputSavePath: appRoot.querySelector<HTMLElement>(
      '[data-slot="output-save-path"]',
    ),
    saveInfo: appRoot.querySelector<HTMLElement>('[data-slot="save-info"]'),
    topStatusPill: appRoot.querySelector<HTMLElement>(
      '[data-slot="top-status-pill"]',
    ),
    runStatusPill: appRoot.querySelector<HTMLElement>(
      '[data-slot="run-status-pill"]',
    ),
    progressSection: appRoot.querySelector<HTMLElement>(
      '[data-slot="progress-section"]',
    ),
    summary: appRoot.querySelector<HTMLElement>('[data-slot="summary"]'),
    outputStatus: appRoot.querySelector<HTMLElement>(
      '[data-slot="output-status"]',
    ),
    deliveryFormatBadge: appRoot.querySelector<HTMLElement>(
      '[data-slot="delivery-format-badge"]',
    ),
    providerStatus: appRoot.querySelector<HTMLElement>(
      '[data-slot="provider-status"]',
    ),
    protocolStatus: appRoot.querySelector<HTMLElement>(
      '[data-slot="protocol-status"]',
    ),
    protocolEntry: appRoot.querySelector<HTMLElement>(
      '[data-slot="protocol-entry"]',
    ),
    protocolEntryHint: appRoot.querySelector<HTMLElement>(
      '[data-slot="protocol-entry-hint"]',
    ),
    protocolBase: appRoot.querySelector<HTMLElement>(
      '[data-slot="protocol-base"]',
    ),
    protocolBaseHint: appRoot.querySelector<HTMLElement>(
      '[data-slot="protocol-base-hint"]',
    ),
    protocolOutput: appRoot.querySelector<HTMLElement>(
      '[data-slot="protocol-output"]',
    ),
    protocolOutputHint: appRoot.querySelector<HTMLElement>(
      '[data-slot="protocol-output-hint"]',
    ),
    protocolResume: appRoot.querySelector<HTMLElement>(
      '[data-slot="protocol-resume"]',
    ),
    sessionState: appRoot.querySelector<HTMLElement>(
      '[data-slot="session-state"]',
    ),
    sessionEntry: appRoot.querySelector<HTMLElement>(
      '[data-slot="session-entry"]',
    ),
    sessionDedupe: appRoot.querySelector<HTMLElement>(
      '[data-slot="session-dedupe"]',
    ),
    sessionRun: appRoot.querySelector<HTMLElement>('[data-slot="session-run"]'),
    sessionCheckpoint: appRoot.querySelector<HTMLElement>(
      '[data-slot="session-checkpoint"]',
    ),
    kpiTotalLines: appRoot.querySelector<HTMLElement>(
      '[data-slot="kpi-total-lines"]',
    ),
    kpiProcessed: appRoot.querySelector<HTMLElement>(
      '[data-slot="kpi-processed"]',
    ),
    kpiPending: appRoot.querySelector<HTMLElement>('[data-slot="kpi-pending"]'),
    kpiErrors: appRoot.querySelector<HTMLElement>('[data-slot="kpi-errors"]'),
    queueActiveName: appRoot.querySelector<HTMLElement>(
      '[data-slot="queue-active-name"]',
    ),
    queueActiveHint: appRoot.querySelector<HTMLElement>(
      '[data-slot="queue-active-hint"]',
    ),
    queueActiveStatus: appRoot.querySelector<HTMLElement>(
      '[data-slot="queue-active-status"]',
    ),
    queueCount: appRoot.querySelector<HTMLElement>('[data-slot="queue-count"]'),
    dedupeLabel: appRoot.querySelector<HTMLElement>(
      '[data-slot="dedupe-label"]',
    ),
    progressLine: appRoot.querySelector<HTMLElement>(
      '[data-slot="progress-line"]',
    ),
    progressBar: appRoot.querySelector<HTMLElement>(
      '[data-slot="progress-bar"]',
    ),
    currentCnpj: appRoot.querySelector<HTMLElement>(
      '[data-slot="current-cnpj"]',
    ),
    executionStatus: appRoot.querySelector<HTMLElement>(
      '[data-slot="execution-status"]',
    ),
    executionRunId: appRoot.querySelector<HTMLElement>(
      '[data-slot="execution-run-id"]',
    ),
    executionResume: appRoot.querySelector<HTMLElement>(
      '[data-slot="execution-resume"]',
    ),
    executionCheckpoint: appRoot.querySelector<HTMLElement>(
      '[data-slot="execution-checkpoint"]',
    ),
    executionCheckpointCopy: appRoot.querySelector<HTMLElement>(
      '[data-slot="execution-checkpoint-copy"]',
    ),
    executionBlocker: appRoot.querySelector<HTMLElement>(
      '[data-slot="execution-blocker"]',
    ),
    executionSuggestion: appRoot.querySelector<HTMLElement>(
      '[data-slot="execution-suggestion"]',
    ),
    executionHistory: appRoot.querySelector<HTMLElement>(
      '[data-slot="execution-history"]',
    ),
    viewLinks: Array.from(appRoot.querySelectorAll<HTMLElement>("[data-view]")),
    viewPanels: Array.from(
      appRoot.querySelectorAll<HTMLElement>("[data-view-panel]"),
    ),
  };
}

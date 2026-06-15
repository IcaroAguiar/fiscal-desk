import {
  createFiscalDeskDefaultConsentState,
  FISCAL_DESK_COMMERCIAL_BOUNDARY,
  FISCAL_DESK_CONSENT_KEY,
  FISCAL_DESK_DIAGNOSTIC_PACKAGE_POLICY,
  FISCAL_DESK_DISTRIBUTION_CHANNEL_STATE,
  FISCAL_DESK_UPDATE_CAPABILITY_STATE,
} from "../../core/app/fiscal-desk-local-contract";
import { escapeHtml } from "./app-helpers";

type LocalTrustStateItem = {
  label: string;
  detail: string;
};

type LocalTrustState = {
  distribution: LocalTrustStateItem;
  update: LocalTrustStateItem;
  consent: LocalTrustStateItem;
  diagnostic: LocalTrustStateItem;
  commercial: LocalTrustStateItem;
};

export function renderLocalTrustGrid(): string {
  const localTrustState = buildLocalTrustState();

  return `
    <div class="session-grid" aria-label="Limites locais e futuros">
      <div>
        <span class="ops-label">Distribuição</span>
        <strong data-slot="local-distribution-state">${escapeHtml(localTrustState.distribution.label)}</strong>
        <p class="body" data-slot="local-distribution-copy">${escapeHtml(localTrustState.distribution.detail)}</p>
      </div>
      <div>
        <span class="ops-label">Atualização</span>
        <strong data-slot="local-update-state">${escapeHtml(localTrustState.update.label)}</strong>
        <p class="body" data-slot="local-update-copy">${escapeHtml(localTrustState.update.detail)}</p>
      </div>
      <div>
        <span class="ops-label">Consentimentos</span>
        <strong data-slot="local-consent-state">${escapeHtml(localTrustState.consent.label)}</strong>
        <p class="body" data-slot="local-consent-copy">${escapeHtml(localTrustState.consent.detail)}</p>
      </div>
      <div>
        <span class="ops-label">Diagnóstico</span>
        <strong data-slot="local-diagnostic-state">${escapeHtml(localTrustState.diagnostic.label)}</strong>
        <p class="body" data-slot="local-diagnostic-copy">${escapeHtml(localTrustState.diagnostic.detail)}</p>
      </div>
      <div>
        <span class="ops-label">Comercial</span>
        <strong data-slot="local-commercial-state">${escapeHtml(localTrustState.commercial.label)}</strong>
        <p class="body" data-slot="local-commercial-copy">${escapeHtml(localTrustState.commercial.detail)}</p>
      </div>
    </div>
  `;
}

function buildLocalTrustState(): LocalTrustState {
  const telemetryConsent = createFiscalDeskDefaultConsentState(
    FISCAL_DESK_CONSENT_KEY.TELEMETRY_BASIC_OPT_IN,
  );
  const diagnosticConsent = createFiscalDeskDefaultConsentState(
    FISCAL_DESK_CONSENT_KEY.DIAGNOSTIC_PACKAGE_MANUAL_SHARE,
  );
  const manualUpdateConsent = createFiscalDeskDefaultConsentState(
    FISCAL_DESK_CONSENT_KEY.UPDATE_MANUAL_CHECK,
  );

  return {
    commercial: {
      detail: [
        formatCommercialBoundary(
          FISCAL_DESK_COMMERCIAL_BOUNDARY.MUST_NOT_BLOCK_BASIC_LOCAL_USE,
        ),
        formatCommercialBoundary(
          FISCAL_DESK_COMMERCIAL_BOUNDARY.MUST_NOT_BLOCK_EXPORTS,
        ),
        formatCommercialBoundary(
          FISCAL_DESK_COMMERCIAL_BOUNDARY.MUST_PRESERVE_MOCK_OFFLINE,
        ),
      ].join(" • "),
      label: formatCommercialBoundary(
        FISCAL_DESK_COMMERCIAL_BOUNDARY.FUTURE_PRO_OPTIONAL,
      ),
    },
    consent: {
      detail: `Telemetria, diagnóstico e verificação manual seguem ${formatConsentGrant(telemetryConsent.granted)}, ${formatConsentGrant(diagnosticConsent.granted)} e ${formatConsentGrant(manualUpdateConsent.granted)} por padrão.`,
      label: "Desligados por padrão",
    },
    diagnostic: {
      detail: `Pacote ${formatDiagnosticPolicy(FISCAL_DESK_DIAGNOSTIC_PACKAGE_POLICY.LOCATION)}, ${formatDiagnosticPolicy(FISCAL_DESK_DIAGNOSTIC_PACKAGE_POLICY.TRIGGER)}, ${formatDiagnosticPolicy(FISCAL_DESK_DIAGNOSTIC_PACKAGE_POLICY.REVIEW)} e ${formatDiagnosticPolicy(FISCAL_DESK_DIAGNOSTIC_PACKAGE_POLICY.SHARE)}.`,
      label: "Local e manual",
    },
    distribution: {
      detail:
        "Sem canal, assinatura ou metadados de release definidos para atualização real.",
      label: formatDistributionState(
        FISCAL_DESK_DISTRIBUTION_CHANNEL_STATE.LOCAL_ONLY,
      ),
    },
    update: {
      detail:
        "Sem busca, download, instalação ou reinício pelo app nesta fase.",
      label: formatUpdateState(
        FISCAL_DESK_UPDATE_CAPABILITY_STATE.BLOCKED_NO_CHANNEL,
      ),
    },
  };
}

function formatDistributionState(
  state: (typeof FISCAL_DESK_DISTRIBUTION_CHANNEL_STATE)[keyof typeof FISCAL_DESK_DISTRIBUTION_CHANNEL_STATE],
): string {
  if (state === FISCAL_DESK_DISTRIBUTION_CHANNEL_STATE.LOCAL_ONLY) {
    return "Local ou interno";
  }

  if (
    state === FISCAL_DESK_DISTRIBUTION_CHANNEL_STATE.OFFICIAL_CHANNEL_PENDING
  ) {
    return "Canal oficial pendente";
  }

  return "Canal oficial futuro";
}

function formatUpdateState(
  state: (typeof FISCAL_DESK_UPDATE_CAPABILITY_STATE)[keyof typeof FISCAL_DESK_UPDATE_CAPABILITY_STATE],
): string {
  if (state === FISCAL_DESK_UPDATE_CAPABILITY_STATE.BLOCKED_NO_CHANNEL) {
    return "Bloqueado sem canal";
  }

  if (state === FISCAL_DESK_UPDATE_CAPABILITY_STATE.CHECK_AVAILABLE_MANUAL) {
    return "Manual futuro";
  }

  return "Bloqueado para fase futura";
}

function formatConsentGrant(granted: boolean): string {
  return granted ? "ativado" : "desligado";
}

function formatDiagnosticPolicy(
  policy: (typeof FISCAL_DESK_DIAGNOSTIC_PACKAGE_POLICY)[keyof typeof FISCAL_DESK_DIAGNOSTIC_PACKAGE_POLICY],
): string {
  if (policy === FISCAL_DESK_DIAGNOSTIC_PACKAGE_POLICY.LOCATION) {
    return "local";
  }

  if (policy === FISCAL_DESK_DIAGNOSTIC_PACKAGE_POLICY.TRIGGER) {
    return "sob demanda";
  }

  if (policy === FISCAL_DESK_DIAGNOSTIC_PACKAGE_POLICY.REVIEW) {
    return "revisável";
  }

  if (policy === FISCAL_DESK_DIAGNOSTIC_PACKAGE_POLICY.SHARE) {
    return "compartilhamento manual";
  }

  return "independente de telemetria";
}

function formatCommercialBoundary(
  boundary: (typeof FISCAL_DESK_COMMERCIAL_BOUNDARY)[keyof typeof FISCAL_DESK_COMMERCIAL_BOUNDARY],
): string {
  if (boundary === FISCAL_DESK_COMMERCIAL_BOUNDARY.FUTURE_PRO_OPTIONAL) {
    return "Pro futuro opcional";
  }

  if (
    boundary === FISCAL_DESK_COMMERCIAL_BOUNDARY.MUST_NOT_BLOCK_BASIC_LOCAL_USE
  ) {
    return "uso local básico preservado";
  }

  if (boundary === FISCAL_DESK_COMMERCIAL_BOUNDARY.MUST_NOT_BLOCK_EXPORTS) {
    return "exportações preservadas";
  }

  if (boundary === FISCAL_DESK_COMMERCIAL_BOUNDARY.MUST_PRESERVE_MOCK_OFFLINE) {
    return "simulação offline preservada";
  }

  return "dados e histórico preservados";
}

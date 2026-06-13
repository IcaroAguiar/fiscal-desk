# Phase 8B Local Update/Diagnostic UI Scope Review

Date: 2026-06-13
Status: `approved_scope_candidate`
Thread role: docs-only scope review, pending judge

## Summary

The earlier `blocked_missing_local_docs` blocker is obsolete. The orchestrator
copied the ignored local docs into this worktree, and all mandatory documents
were revalidated as present before this review continued.

F8B can be released as a narrow UI-only worker that exposes local, transparent,
blocked update/diagnostic/consent states using the already integrated F8A
contract. The worker must not implement real updater behavior, network calls,
telemetry transport, diagnostic package generation or sending, release config,
signature verification, metadata fetches, package/lockfile changes or license
validation.

Recommended split: approve only `F8B1 UI static/local blocked-state exposure`.
If a later slice needs runtime state from main process, persistence, IPC,
preload bridge or settings storage, open a new judge-owned split with one owner
for those shared boundaries.

## Files Read

- `AGENTS.md`
- `docs/goals/fiscal-desk-orchestration/goal.md`
- `docs/goals/fiscal-desk-orchestration/state.yaml`
- `docs/goals/fiscal-desk-orchestration/subagent-registry.md`
- `docs/goals/fiscal-desk-orchestration/integration-plan.md`
- `docs/goals/fiscal-desk-orchestration/phases/phase-8-distribuicao-update-comercial.md`
- `docs/goals/fiscal-desk-orchestration/contracts/phase-8-distribuicao-update-comercial-contract.md`
- `docs/goals/fiscal-desk-orchestration/results/phase-8a-local-update-diagnostic-contract.md`
- `docs/goals/fiscal-desk-orchestration/results/phase-8a-local-update-diagnostic-contract-security-review.md`
- `docs/goals/fiscal-desk-orchestration/results/phase-8a-local-update-diagnostic-contract-judge-decision.md`
- `docs/goals/fiscal-desk-orchestration/results/integration-wave-10-f6e2a-f8a.md`
- `docs/fiscal-desk/product-spec.md`
- `docs/fiscal-desk/phase-orchestration.md`
- `docs/fiscal-desk/spec-audit.md`
- `docs/adr/0028-community-first-com-limites-comerciais-futuros.md`
- `docs/adr/0029-atualizacao-pelo-app.md`
- `docs/adr/0030-core-open-source-com-marca-e-distribuicao-oficial-controladas.md`
- `docs/adr/0031-telemetria-opcional-desligada-por-padrao.md`
- `docs/adr/0032-pacote-de-diagnostico-local-e-revisavel.md`
- `docs/adr/0033-licenca-pro-local-sem-conta-online-obrigatoria.md`
- `src/core/app/fiscal-desk-local-contract.ts`
- `src/main/types.ts`
- `src/main/preload.ts`
- `src/renderer/ui/app.types.ts`
- `src/renderer/ui/app-view.ts`
- `src/renderer/ui/app.ts`
- `test/unit/app-view.test.ts`
- `test/unit/fiscal-desk-local-contract.test.ts`
- `package.json`

Renderer inventory checked:

- `src/renderer/index.html`
- `src/renderer/main.ts`
- `src/renderer/styles.css`
- `src/renderer/ui/app-delivery.ts`
- `src/renderer/ui/app-helpers.ts`
- `src/renderer/ui/app-history-view.ts`
- `src/renderer/ui/app-local-public-base-copy.ts`
- `src/renderer/ui/app-local-public-base.ts`
- `src/renderer/ui/app-provider.ts`
- `src/renderer/ui/app-refs.ts`
- `src/renderer/ui/app-sync-reference.ts`
- `src/renderer/ui/app-sync.ts`
- `src/renderer/ui/app-view-lists.ts`
- `src/renderer/ui/app-view.ts`
- `src/renderer/ui/app.ts`
- `src/renderer/ui/app.types.ts`
- `src/renderer/ui/components/button.ts`
- `src/renderer/ui/components/index.ts`
- `src/renderer/ui/components/progress-bar.ts`
- `src/renderer/ui/components/status-pill.ts`
- `src/renderer/ui/operational-copy.ts`
- `src/renderer/ui/render-summary.ts`
- `src/renderer/vite-env.d.ts`

## Missing-Docs Recovery

Initial review stopped correctly because these required docs were missing:

- `docs/fiscal-desk/product-spec.md`
- `docs/fiscal-desk/phase-orchestration.md`
- `docs/fiscal-desk/spec-audit.md`
- `docs/adr/0028-community-first-com-limites-comerciais-futuros.md`
- `docs/adr/0029-atualizacao-pelo-app.md`
- `docs/adr/0030-core-open-source-com-marca-e-distribuicao-oficial-controladas.md`
- `docs/adr/0031-telemetria-opcional-desligada-por-padrao.md`
- `docs/adr/0032-pacote-de-diagnostico-local-e-revisavel.md`
- `docs/adr/0033-licenca-pro-local-sem-conta-online-obrigatoria.md`

After orchestrator recovery, `test -f` revalidation passed for every mandatory
document and the blocker was discarded as stale.

## Scope Recommended For F8B Worker

Approve a material worker only for a local renderer surface that communicates
trust states already defined by F8A:

- distribution state shown as local/internal or official channel pending;
- update capability shown as blocked/manual/future, never as active updater;
- consent cards for telemetry, diagnostic package share and manual update check
  shown as default-off/local only;
- diagnostic package shown as local, on-demand, reviewable and manual-share-only;
- commercial boundary shown as future optional, never blocking existing data,
  history, exports, basic local use, `mock` offline or telemetry default-off;
- blocked-state copy that makes absent channel/signature/metadata explicit.

The UI may import F8A constants/types directly from
`src/core/app/fiscal-desk-local-contract.ts` to avoid duplicating
boundary-defining strings. It may render non-persistent default state derived
from `createFiscalDeskDefaultConsentState`.

The UI must not present any button, event handler, promise, bridge call or copy
that implies actual update check, download, install, diagnostic generation,
diagnostic send, telemetry send, license activation or account login.

## Owned Files And Allowed Writes For Eventual F8B1

Exact allowed writes for the recommended worker:

- `src/renderer/ui/app.types.ts`
- `src/renderer/ui/app-view.ts`
- `test/unit/app-view.test.ts`
- `docs/goals/fiscal-desk-orchestration/results/phase-8b-local-update-diagnostic-ui-implementation.md`

Conditional only if visual layout cannot remain professional without CSS:

- `src/renderer/styles.css`

If `src/renderer/styles.css` is used, F8B1 becomes the only active owner of
`styles_css`, must document the selector impact, and must run visual checks.

No other writes are authorized by this scope review.

## Do Not Touch

- `src/main/**`
- `src/main/preload.ts`
- `src/main/types.ts`
- `src/main/ipc/**`
- `src/core/app/fiscal-desk-local-contract.ts`
- `src/core/app/process-csv*`
- `src/core/ingestion/**`
- `src/core/export/**`
- `src/core/simples/**`
- `src/core/public-base/**`
- `test/integration/**`
- tests outside the exact allowed test file
- `package.json`
- `pnpm-lock.yaml`
- `electron-builder.yml`
- release/update/signing/notarization metadata or config
- `docs/fiscal-desk/**`
- `docs/adr/**`
- `docs/goals/fiscal-desk-orchestration/state.yaml`
- `docs/goals/fiscal-desk-orchestration/integration-plan.md`
- stage, commit, push or PR

## Collision With F6E2B / UI / IPC / Preload / Renderer

F8B1 collides with renderer ownership, not with F6E2A runtime selection already
integrated. It must not run concurrently with any F6E2B UI worker or any worker
touching `src/renderer/ui/app-view.ts`, `src/renderer/ui/app.types.ts`,
`test/unit/app-view.test.ts` or `src/renderer/styles.css`.

F8B1 must avoid IPC/preload/types entirely. If the worker concludes that
`src/main/types.ts`, `src/main/preload.ts` or `src/main/ipc/**` are necessary,
it must stop and return a `needs_rework` receipt asking the judge for a new
single-owner split. That split would block F6E2B UI/IPC/preload concurrently.

Current evidence:

- F8A is integrated as `src/core/app/fiscal-desk-local-contract.ts`, core-only.
- `src/main/types.ts` does not export F8A types.
- `src/main/preload.ts` exposes only current CSV/local-base/history bridges.
- renderer has no existing F8 update/diagnostic/consent surface.
- `app-view.ts` is the main shell renderer surface and already has focused
  tests in `test/unit/app-view.test.ts`.

## Mandatory Checks For Eventual Worker

Minimum commands for F8B1:

- `pnpm exec vitest run test/unit/app-view.test.ts test/unit/fiscal-desk-local-contract.test.ts`
- `pnpm typecheck`
- `pnpm lint`
- `pnpm build`
- `git diff --check -- src/renderer/ui/app.types.ts src/renderer/ui/app-view.ts test/unit/app-view.test.ts docs/goals/fiscal-desk-orchestration/results/phase-8b-local-update-diagnostic-ui-implementation.md`
- updater scan over F8B touched files and package/config:
  `rg -n "electron-updater|autoUpdater|checkForUpdates|setFeedURL|downloadUpdate|quitAndInstall" <touched files> package.json pnpm-lock.yaml electron-builder.yml`
- network/telemetry scan over F8B touched files:
  `rg -n "fetch\\(|axios|XMLHttpRequest|sendBeacon|net\\.request|https?://" <touched files>`
- sensitive-data scan over F8B touched files:
  `rg -n "currentCnpj|cnpj|razaoSocial|nomeEmpresarial|simplesNacional|simei|sourceFilePath|filePath|html|screenshot|cookie|token|authorization|header|providerResponse|response|payload|csv|xlsx" <touched files>`

Additional checks if `src/renderer/styles.css` changes:

- `pnpm smoke:visual`
- `pnpm smoke:electron-ui`
- before/after screenshots or visual evidence referenced in the worker receipt
- ratchet impact statement

Additional checks if the judge later opens IPC/preload/main in a separate split:

- focused IPC/preload tests
- `pnpm smoke:electron-ui`
- security review before judge acceptance

## Stop Conditions

Stop and return `needs_rework` or `blocked` if any of these occur:

- any required local doc becomes missing again;
- worker needs network, real updater, metadata fetch, download, install,
  signature verification, release config, package or lockfile change;
- worker needs telemetry transport, analytics SDK, persistent identifier,
  diagnostic generation, diagnostic upload/send, storage or license validation;
- UI requires `src/main/**`, `src/main/preload.ts`, `src/main/types.ts` or
  `src/main/ipc/**`;
- UI copy implies update/check/send is functional rather than blocked/manual
  future state;
- any F8B allowlist duplicates F8A boundary strings instead of importing the
  canonical contract;
- F6E2B or another worker owns renderer shell, `styles.css`, IPC/preload/types
  at the same time;
- sensitive/fiscal/local data appears in telemetry/diagnostic allowed fields or
  user-facing diagnostic examples;
- checks fail twice with the same signature.

## Residual Risks

- This is a visual/user-facing slice, so the harness
  `visual_surface_change=1` warning is relevant. The worker must provide visual
  evidence if CSS/layout changes are made.
- Boundary strings are sensitive in this phase. The harness
  `magic_string_boundary=23` warning should be handled by importing F8A
  constants/types and avoiding new duplicated enum literals in the renderer.
- The worktree is broadly dirty outside this scope. The worker must only touch
  the exact allowed files and must not normalize unrelated files.
- A UI-only blocked state is useful but not dynamic. Real runtime state,
  persistence and consent changes require a later split with IPC/preload/storage
  ownership and security review.

## Recommendation To Judge

Release a material worker only for `F8B1 UI static/local blocked-state
exposure` with the exact allowed writes listed above.

Do not release any worker for real update, network, updater metadata,
signature, telemetry transport, diagnostic generation/send, package/lockfile,
release config, license validation or account flow.

If the judge wants interactive consent persistence or a real app bridge state,
ask for a new split before implementation. That split must have one owner for
IPC/preload/types/main and must block concurrent F6E2B UI/IPC/preload work.

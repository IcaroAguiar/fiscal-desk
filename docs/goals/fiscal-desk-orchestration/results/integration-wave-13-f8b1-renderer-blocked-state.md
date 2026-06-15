# Integration Wave 13 - F8B1 Renderer Blocked State

Date: 2026-06-13
Status: `integrated_validated_selective`
Canonical branch context: `feat/fiscal-desk-local-base-prep`

## Scope

Integrated F8B1 as a selective renderer-local change after independent review.

F8B1 adds a static Fiscal Desk "Limites locais e futuros" surface to expose
local/future blocked states for distribution, update, consent, diagnostic and
commercial boundaries. It consumes the already integrated F8A contract and does
not implement update, network, telemetry, diagnostic package generation,
license/account behavior, release config, IPC/preload or persistence.

## Integrated Files

- `src/renderer/ui/app-view.ts`
- `test/unit/app-view.test.ts`
- `docs/goals/fiscal-desk-orchestration/results/phase-8b-local-update-diagnostic-ui-implementation.md`
- `docs/goals/fiscal-desk-orchestration/results/phase-8b-local-update-diagnostic-ui-implementation-review.md`
- `docs/goals/fiscal-desk-orchestration/results/phase-8b-local-update-diagnostic-ui-implementation-judge-decision.md`
- `docs/goals/fiscal-desk-orchestration/state.yaml`
- `docs/goals/fiscal-desk-orchestration/integration-plan.md`

## Explicitly Not Integrated

- `src/renderer/styles.css`
- `src/renderer/ui/app.types.ts`
- `src/main/**`
- `src/core/**` beyond consuming the existing F8A contract
- `src/core/simples/**`
- `src/core/export/**`
- `src/core/ingestion/**`
- `package.json`, `pnpm-lock.yaml`, `electron-builder.yml`
- release/update/network/telemetry/diagnostic real flows

## Integration Notes

- The F8B1 worker worktree contained broad dirty state inherited from the
  starting point. The integration was performed manually and selectively.
- The independent reviewer approved the narrow F8B1 candidate and explicitly
  recommended not accepting the whole worker worktree.
- No CSS was integrated for F8B1. Visual risk was handled through smoke checks.

## Verification

- `pnpm exec vitest run test/unit/app-view.test.ts test/unit/fiscal-desk-local-contract.test.ts`
  - Pass, 2 files / 12 tests.
- `git diff --check -- src/renderer/ui/app-view.ts test/unit/app-view.test.ts docs/goals/fiscal-desk-orchestration/results/phase-8b-local-update-diagnostic-ui-implementation.md docs/goals/fiscal-desk-orchestration/results/phase-8b-local-update-diagnostic-ui-implementation-review.md`
  - Pass.
- Updater scan over F8B1 code and package/config
  - Pass, no code occurrences.
- Network/telemetry scan over F8B1 code
  - Pass, no occurrences.
- Sensitive-data scan over F8B1 code/test
  - Existing renderer/test references only; no new telemetry, diagnostic,
    transport, credential or raw provider artifact surface.
- `pnpm typecheck`
  - Pass.
- `pnpm lint`
  - Pass.
- `pnpm build`
  - Pass.
- `pnpm test`
  - Pass, 38 files / 253 tests.
- `pnpm smoke:visual`
  - Pass across desktop, tablet and mobile viewports.
- `pnpm smoke:electron-ui`
  - Pass with mock provider and XLSX delivery.

## Residual Risk

- The canonical worktree remains a broad local integration package. This receipt
  only certifies the F8B1 selective integration.
- Harness warnings `magic_string_boundary` and `visual_surface_change` were
  reviewed. F8 boundary symbols are consumed from the F8A contract; visual
  surface risk was covered by visual and Electron smokes.
- Future runtime behavior remains blocked until separately scoped, reviewed and
  integrated.

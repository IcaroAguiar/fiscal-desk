# F9A/F9B Speed Control Core/UI Receipt - 2026-06-14

Status: `validated_reworked_review_approved_for_f9a_f9b`

## Scope

This slice responds to the 2026-06-14 gap audit: documented velocity,
parallelization and user control existed as product direction, but the runtime
still processed unique CNPJs serially and the UI only displayed explanatory
copy.

Implemented in the canonical worktree/branch:

- typed execution speed profiles;
- renderer speed selector in user-facing language;
- IPC/preload forwarding of the selected profile;
- effective concurrency resolution in `main` by provider;
- bounded concurrent lookup queue in `processCsv`;
- tests proving bounded concurrency, output order, bridge forwarding and
provider-specific limits;
- coordinated worker shutdown on lookup failure;
- cancellation observation during output assembly/finalization.

## Provider Policy

- `mock`: may use selected local profile.
- `base-publica-local`: may use selected local profile when prepared.
- `cnpja-open`: remains concurrency `1` because the public provider has rate
  limits.
- `receita-web`: remains concurrency `1`; no batch, no hidden parallel headed
  browsers, no CAPTCHA bypass.

## Files Changed

- `src/core/app/process-csv.types.ts`
- `src/core/app/process-csv.use-case.ts`
- `src/main/ipc/process-csv.ipc.ts`
- `src/main/preload.ts`
- `src/main/types.ts`
- `src/renderer/ui/app.ts`
- `src/renderer/ui/app-refs.ts`
- `src/renderer/ui/app-sync.ts`
- `src/renderer/ui/app-view.ts`
- `src/renderer/ui/app.types.ts`
- `src/renderer/ui/operational-copy.ts`
- `test/integration/process-csv-progress.test.ts`
- `test/integration/process-csv-cancel.test.ts`
- `test/unit/process-csv.ipc.delivery.test.ts`
- `test/unit/preload.test.ts`
- `test/unit/app-view.test.ts`
- `test/unit/app-sync.test.ts`
- `test/unit/renderer-operational-copy.test.ts`
- `README.md`
- `docs/goals/fiscal-desk-orchestration/phases/phase-9-velocidade-controle-base-assistida.md`
- `docs/goals/fiscal-desk-orchestration/state.yaml`

## Checks

Passed:

- `pnpm exec vitest run test/integration/process-csv-progress.test.ts test/integration/process-csv-cancel.test.ts test/unit/process-csv.ipc.delivery.test.ts test/unit/preload.test.ts test/unit/app-view.test.ts test/unit/app-sync.test.ts test/unit/renderer-operational-copy.test.ts`
- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`
- `pnpm smoke:visual`
- `pnpm smoke:electron-ui`
- `git diff --check`
- independent review found two blocking findings and both were reworked
- independent re-review confirmed both findings closed and reran
  `pnpm vitest run test/integration/process-csv-progress.test.ts test/integration/process-csv-cancel.test.ts`

## Review Findings Closed

- Lookup failure in one concurrent worker no longer lets `processCsv` reject
  before remaining workers settle. The queue now records the first worker error,
  stops new scheduling, suppresses post-error checkpoint/progress side effects,
  awaits `Promise.allSettled(workers)` and then rethrows.
- Cancellation after lookup completion is observed during result assembly and
  before/after CSV/XLSX generation, so the returned execution status reflects a
  late cancellation.

## Residual Risks

- Base Publica assisted discovery/download is not implemented in this slice.
- Pause/resume without cancellation is not implemented in this slice.
- Concurrent in-flight lookups can complete after a cancellation request, but
  the queue suppresses cache/checkpoint/progress side effects once cancellation
  or a worker error is observed.
- Ledger checkpoint writes remain serialized by the core queue to avoid local
  file races.
- Receita Web parallelism remains blocked pending explicit experimental owner
  window.

## Next Required Slice

Open F9C for Base Publica assisted acquisition:

- discover official monthly files;
- estimate required download size;
- download only the needed Simples/SIMEI source when feasible;
- index in streaming;
- support pause/resume of the preparation flow.

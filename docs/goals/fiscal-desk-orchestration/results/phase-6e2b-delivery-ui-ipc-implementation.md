# Phase 6E2B - Delivery UI/IPC Implementation

Date: 2026-06-13

## Status

`ready_for_judge_review`

F6E2B exposes the current executable delivery option ids through the public
IPC/preload/types path while preserving the legacy `deliveryFormat` contract.
The candidate is not self-approved. It remains pending judge review and
independent review.

## Files Read

- `AGENTS.md`
- `docs/goals/fiscal-desk-orchestration/goal.md`
- `docs/goals/fiscal-desk-orchestration/state.yaml`
- `docs/goals/fiscal-desk-orchestration/integration-plan.md`
- `docs/goals/fiscal-desk-orchestration/results/phase-6e2b-delivery-ui-ipc-scope-review.md`
- `docs/goals/fiscal-desk-orchestration/results/phase-6e2b-delivery-ui-ipc-scope-review-judge-decision.md`
- `docs/goals/fiscal-desk-orchestration/results/phase-6e2-delivery-runtime-ui-implementation.md`
- `docs/goals/fiscal-desk-orchestration/results/phase-6e2-delivery-runtime-ui-implementation-judge-decision.md`
- `docs/goals/fiscal-desk-orchestration/results/integration-wave-10-f6e2a-f8a.md`
- `docs/goals/fiscal-desk-orchestration/results/integration-wave-11-scope-reviews.md`
- `docs/fiscal-desk/product-spec.md`
- `docs/fiscal-desk/phase-orchestration.md`
- `docs/fiscal-desk/spec-audit.md`
- `docs/adr/0018-formato-de-entrega-escolhido-pelo-usuario.md`
- `docs/adr/0019-saida-personalizada-guiada.md`
- `docs/adr/0020-modelos-reutilizaveis-de-entrega.md`
- `docs/adr/0021-modelos-de-execucao-separados-de-modelos-de-entrega.md`
- `src/core/app/process-csv.types.ts`
- `src/core/app/process-csv.use-case.ts`
- `src/core/app/process-csv-delivery.ts`
- `src/core/export/export-contract.ts`
- `src/core/export/export-artifacts.ts`
- `src/main/types.ts`
- `src/main/preload.ts`
- `src/main/ipc/process-csv.ipc.ts`
- `test/unit/process-csv.ipc.test.ts`
- `test/unit/process-csv-contracts.test.ts`
- `test/integration/process-csv.use-case.test.ts`

## Files Changed

- `src/core/app/process-csv.types.ts`
- `src/main/types.ts`
- `src/main/preload.ts`
- `src/main/ipc/process-csv.ipc.ts`
- `test/unit/process-csv.ipc.test.ts`
- `test/unit/preload.test.ts`
- `test/unit/process-csv-contracts.test.ts`
- `docs/goals/fiscal-desk-orchestration/results/phase-6e2b-delivery-ui-ipc-implementation.md`

No stage, commit, push or PR was performed.

## Diff Summary

- Added the narrow public `PROCESS_CSV_DELIVERY_OPTION_ID` /
  `ProcessCsvDeliveryOptionId` contract for the two executable current options:
  `preserve-columns-csv` and `current-result-workbook`.
- Re-exported the new public delivery option id contract through
  `src/main/types.ts`.
- Extended preload `processCsv` and `resumeExecution` inputs to forward
  `deliveryOptionId` while keeping the existing `deliveryFormat` parameters.
- Updated process CSV IPC to validate `deliveryOptionId` before ledger,
  provider, Receita Web, autosave or runtime side effects.
- IPC accepts only the current CSV and XLSX option ids, and rejects unknown,
  planned, disabled or artifact-less ids before calling `processCsv`.
- Kept the existing `deliveryFormat` path compatible for process, resume and
  save-output flows.
- Added focused IPC/preload/contract tests for current option ids and rejection
  cases.

## Checks Executed

- Initial `pnpm exec vitest run test/unit/process-csv.ipc.test.ts test/unit/preload.test.ts test/unit/process-csv-contracts.test.ts`
  - failed before tests because `vitest` was not installed in `node_modules`.
- `pnpm install`
  - pass; lockfile was already up to date and no package/lockfile changes were
    made.
- `pnpm exec vitest run test/unit/process-csv.ipc.test.ts test/unit/preload.test.ts test/unit/process-csv-contracts.test.ts`
  - pass, 3 files / 37 tests.
- `pnpm exec vitest run test/integration/process-csv.use-case.test.ts test/unit/process-csv-contracts.test.ts`
  - pass, 2 files / 26 tests.
- Initial `pnpm typecheck`
  - failed once on the local IPC cast into the F6E2A delivery validator.
- Re-run `pnpm typecheck`
  - pass.
- Initial `pnpm lint`
  - failed only on import ordering/formatting in touched files.
- `pnpm exec biome check --write src/core/app/process-csv.types.ts src/main/types.ts src/main/preload.ts src/main/ipc/process-csv.ipc.ts test/unit/process-csv.ipc.test.ts test/unit/preload.test.ts test/unit/process-csv-contracts.test.ts`
  - pass; fixed formatting/import order only.
- Re-run `pnpm exec vitest run test/unit/process-csv.ipc.test.ts test/unit/preload.test.ts test/unit/process-csv-contracts.test.ts`
  - pass, 3 files / 37 tests.
- Re-run `pnpm exec vitest run test/integration/process-csv.use-case.test.ts test/unit/process-csv-contracts.test.ts`
  - pass, 2 files / 26 tests.
- Re-run `pnpm typecheck`
  - pass.
- Re-run `pnpm lint`
  - pass, 114 files.
- `git diff --check -- src/core/app/process-csv.types.ts src/main/types.ts src/main/preload.ts src/main/ipc/process-csv.ipc.ts test/unit/process-csv.ipc.test.ts test/unit/preload.test.ts test/unit/process-csv-contracts.test.ts`
  - pass.

## Scope Declaration

This worker did not touch renderer, F8, update, network, release, diagnostics
transport, package metadata, lockfile, provider behavior, fallback, Receita Web
behavior, ingestion, export contracts, saved delivery models, product docs or
ADRs.

The worktree still contains broad pre-existing dirty/untracked state, including
renderer/F8-adjacent files from earlier integrated or queued phases. Those files
were not edited for this F6E2B candidate.

## Residual Risks

- Independent review and judge review are still required before acceptance.
- The preload `resumeExecution` bridge keeps the existing positional signature
  and adds `deliveryOptionId` as an optional fourth parameter to preserve
  compatibility. A later renderer owner should decide whether to wrap this in a
  structured object when it touches UI.
- `test/unit/preload.test.ts` and `test/unit/process-csv-contracts.test.ts`
  are currently untracked in this worktree state; they are included in the
  focused checks and diff-check path, but final integration should stage them
  deliberately only after judge approval.
- Harness warnings remained worktree-level:
  `magic_string_boundary=21` and `visual_surface_change=1`. This slice
  centralizes new public ids in `PROCESS_CSV_DELIVERY_OPTION_ID` and does not
  change visual surfaces.

## Stop Conditions

None encountered after dependency installation restored the local test runner.

The candidate would need rework if the judge requires no new positional preload
parameter, or if final integration decides that the public option id constants
must live outside `process-csv.types.ts`.

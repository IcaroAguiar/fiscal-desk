# Phase 6E2A - Delivery Runtime Selection Independent Review After Rework

Updated: 2026-06-13

## Status

`approved_candidate_after_rework`

Review target: `/Users/icaroaguiar/.codex/worktrees/6582/consulta-simples-csv`

## Decision

Approve F6E2A after rework for judge/orchestrator selective integration.

The previous material functional finding is fixed: `processCsv` now forwards
`deliveryOptionId` by field presence instead of truthiness, so
`deliveryOptionId: ""` reaches the F6E1 selection validator, rejects as unknown,
and does not call the provider.

No material findings remain in the F6E2A runtime selection slice.

## Evidence Reviewed

- `src/core/app/process-csv.use-case.ts`
  - `deliveryOptionId` is forwarded with
    `Object.hasOwn(options, "deliveryOptionId")`, not truthiness.
  - delivery resolution still happens before CSV parsing, ledger setup and
    provider lookup.
- `src/core/app/process-csv-delivery.ts`
  - `resolveProcessCsvOutputDelivery` validates option ids through
    `validateFiscalExportDeliveryOptionSelection`.
  - nullish/omitted option id preserves legacy `deliveryFormat` fallback and
    default CSV.
- `test/integration/process-csv.use-case.test.ts`
  - includes `deliveryOptionId: ""` in the rejection matrix and asserts provider
    calls remain empty.
  - keeps current CSV/XLSX option id and legacy XLSX coverage.
- `test/unit/process-csv-contracts.test.ts`
  - includes empty id as unknown at helper level.
  - keeps default CSV, legacy `deliveryFormat`, current option ids and
    unavailable option rejection coverage.
- `docs/goals/fiscal-desk-orchestration/results/phase-6e2-delivery-runtime-ui-implementation.md`
  - records the rework and the current check results.

## Findings

None material.

## Acceptance Criteria

- `deliveryOptionId` by field presence, not truthiness: passed.
- `deliveryOptionId: ""` rejects deterministically as unknown before lookup:
  passed through integration test and code inspection.
- Default without `deliveryOptionId` remains CSV: passed through unit/integration
  coverage.
- Legacy `deliveryFormat` CSV/XLSX remains functional: passed.
- Current CSV/XLSX F6E1 option ids resolve to current artifacts: passed.
- Planned/disabled/artifact-less/unknown options reject deterministically:
  passed for the covered matrix.
- No F6E2A rework-introduced UI/IPC/preload/renderer/provider/export/ingestion/
  release/package surface found in the reviewed slice: passed, with residual
  integration risk below.

## Checks Executed

- `pnpm exec vitest run test/integration/process-csv.use-case.test.ts test/unit/process-csv-contracts.test.ts test/unit/fiscal-export-artifacts.test.ts test/unit/fiscal-desk-phase-6-contracts.test.ts`
  - pass, 4 files / 35 tests.
- `pnpm exec vitest run test/integration/process-csv-cancel.test.ts test/integration/process-csv-ledger-resume.test.ts`
  - pass, 2 files / 4 tests.
- `pnpm typecheck`
  - pass.
- `pnpm lint`
  - pass, 111 files.
- `git diff --check -- src/core/app/process-csv.use-case.ts src/core/app/process-csv-delivery.ts src/core/app/process-csv.types.ts test/integration/process-csv.use-case.test.ts test/integration/process-csv-cancel.test.ts test/unit/process-csv-contracts.test.ts docs/goals/fiscal-desk-orchestration/results/phase-6e2-delivery-runtime-ui-implementation.md`
  - pass.
- `node /Users/icaroaguiar/.agents/skills/agentic-code-review/scripts/collect-review-context.mjs --root /Users/icaroaguiar/.codex/worktrees/6582/consulta-simples-csv`
  - completed; packet remains noisy because the worker worktree contains broad
    inherited/parallel dirty state outside F6E2A.

Vitest runs required escalation because Vite writes cache under
`node_modules/.vite-temp` in the worker worktree, which is outside this review
thread's writable sandbox roots. No code was modified in the worker worktree.

## Scope And Residual Risk

The worker worktree still contains broad dirty/untracked state in IPC, preload,
renderer, provider, export, ingestion, scripts and docs. Per the updated judge
instruction, this inherited worktree dirt is not treated as a blocker for the
F6E2A re-review.

Residual risk: integration must be selective. Judge/orchestrator should apply
only the F6E2A files attributed in the implementation receipt:

- `src/core/app/process-csv-delivery.ts`
- `src/core/app/process-csv.use-case.ts`
- `test/integration/process-csv.use-case.test.ts`
- `test/unit/process-csv-contracts.test.ts`
- `docs/goals/fiscal-desk-orchestration/results/phase-6e2-delivery-runtime-ui-implementation.md`

`src/core/app/process-csv.types.ts` and
`test/integration/process-csv-cancel.test.ts` are present in the focused
diff-check set because they are part of the phase surface, but the worker receipt
states they were pre-existing modified files and not edited by F6E2A.

Harness warnings `magic_string_boundary=23` and `visual_surface_change=1` remain
worktree-level noise from broader changes. The reviewed F6E2A runtime rework adds
no visual surface and does not expose the internal `deliveryOptionId` through
IPC/preload or renderer UI.

## Recommendation For Judge

Promote to `approved_candidate_after_rework` and integrate selectively, not by
blindly taking the full dirty worker worktree.

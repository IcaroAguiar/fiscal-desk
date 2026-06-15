# Integration Wave 10 - F6E2A and F8A

Date: 2026-06-13

## Status

`integrated_validated`

## Integrated Phases

- F6E2A delivery runtime selection:
  `approved_by_judge_integrated_validated`
- F8A local update diagnostic contract:
  `approved_by_judge_integrated_validated`

## Integrated Files

F6E2A:

- `src/core/app/process-csv-delivery.ts`
- `src/core/app/process-csv.use-case.ts`
- `test/integration/process-csv.use-case.test.ts`
- `test/unit/process-csv-contracts.test.ts`
- `docs/goals/fiscal-desk-orchestration/results/phase-6e2-delivery-runtime-ui-implementation.md`
- `docs/goals/fiscal-desk-orchestration/results/phase-6e2-delivery-runtime-ui-implementation-review.md`
- `docs/goals/fiscal-desk-orchestration/results/phase-6e2-delivery-runtime-ui-implementation-review-after-rework.md`
- `docs/goals/fiscal-desk-orchestration/results/phase-6e2-delivery-runtime-ui-implementation-judge-decision.md`

F8A:

- `src/core/app/fiscal-desk-local-contract.ts`
- `test/unit/fiscal-desk-local-contract.test.ts`
- `docs/goals/fiscal-desk-orchestration/results/phase-8a-local-update-diagnostic-contract.md`
- `docs/goals/fiscal-desk-orchestration/results/phase-8a-local-update-diagnostic-contract-security-review.md`
- `docs/goals/fiscal-desk-orchestration/results/phase-8a-local-update-diagnostic-contract-judge-decision.md`

## Verification

- `pnpm exec vitest run test/integration/process-csv.use-case.test.ts test/unit/process-csv-contracts.test.ts test/unit/fiscal-export-artifacts.test.ts test/unit/fiscal-desk-phase-6-contracts.test.ts`: pass, 35 tests.
- `pnpm exec vitest run test/integration/process-csv-cancel.test.ts test/integration/process-csv-ledger-resume.test.ts`: pass, 4 tests.
- `pnpm exec vitest run test/unit/fiscal-desk-local-contract.test.ts`: pass, 7 tests.
- `pnpm typecheck`: pass.
- `pnpm lint`: pass.
- `git diff --check -- <wave 10 files and receipts>`: pass.
- F8A updater scan: pass, no updater occurrences.
- F8A network scan: pass for F8A scope; only pre-existing CSS data URL and
  localhost dev server URL outside the contract.
- F8A sensitive field scan: pass for allowlists; occurrences are forbidden data
  classes and test rejection probes only.

## Scope Controls

Integration was selective. The broad dirty state in worker worktrees was not
merged. No Wave 10 integration touched IPC, preload, renderer UI, provider
adapters, export contracts, ingestion contracts, package/lockfile, release or
real updater behavior.

## Residual Risk

- Harness warnings remain worktree-level: `magic_string_boundary=23` and
  `visual_surface_change=1`.
- F6E2A intentionally does not expose delivery option ids through UI/IPC yet.
- F8A is a local contract only; future runtime behavior still needs separate
  implementation and review gates.

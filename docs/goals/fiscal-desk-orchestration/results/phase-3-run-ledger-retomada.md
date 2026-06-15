# Phase 3: RunLedger E Retomada Local

Updated: 2026-06-13

## Status

`approved_candidate`

## Scope

F3 fechou a execucao local rastreavel e retomavel em cima dos contratos F1 ja integrados, sem alterar renderer, provider adapters, base publica, release, backend remoto, banco, PDF, stage, commit, push ou PR.

## Files Read

- `docs/goals/fiscal-desk-orchestration/phases/phase-3-run-ledger-retomada.md`
- `docs/goals/fiscal-desk-orchestration/results/integration-wave-1-f1-f2-f4.md`
- `docs/goals/fiscal-desk-orchestration/goal.md`
- `docs/goals/fiscal-desk-orchestration/subagent-registry.md`
- `docs/goals/fiscal-desk-orchestration/integration-plan.md`
- `docs/goals/fiscal-desk-orchestration/state.yaml`
- `docs/goals/fiscal-desk-orchestration/results/phase-1-judge-decision.md`
- `docs/goals/fiscal-desk-orchestration/results/phase-4-judge-decision.md`
- `src/core/app/process-csv.use-case.ts`
- `src/core/app/process-csv.types.ts`
- `src/core/app/process-execution-ledger.port.ts`
- `src/main/execution/file-process-execution-ledger.ts`
- `src/main/ipc/process-csv.ipc.ts`
- `src/main/preload.ts`
- `src/main/types.ts`
- `test/integration/process-csv-cancel.test.ts`
- `test/integration/process-csv-ledger-resume.test.ts`
- `test/unit/main/file-process-execution-ledger.test.ts`
- `test/unit/process-csv.ipc.test.ts`
- `test/unit/process-csv-contracts.test.ts`
- `scripts/smoke-electron-ui.ts`

## Files Changed

- `src/core/app/process-csv.use-case.ts`
- `src/core/app/process-csv.types.ts`
- `src/main/ipc/process-csv.ipc.ts`
- `src/main/preload.ts`
- `src/main/types.ts`
- `test/integration/process-csv-cancel.test.ts`
- `test/unit/process-csv-contracts.test.ts`
- `scripts/smoke-electron-ui.ts`
- `docs/goals/fiscal-desk-orchestration/results/phase-3-run-ledger-retomada.md`

Note: `src/main/types.ts`, `src/core/app/process-csv.types.ts` and `test/unit/process-csv-contracts.test.ts` include F1 contract material already validated in wave 1; F3 reworked the bridge event payload alignment and runtime channel usage.

## Ledger Contract And Implementation

- Core consumes `ProcessExecutionLedgerSession` with `runId`, `checkpointPath`, `setTotalUniqueLookups`, `restoreLookup` and `saveLookup`.
- `processCsv` computes unique valid CNPJs, restores reusable checkpoints before provider calls, and skips provider lookup for restored CNPJs.
- Reusable checkpoint statuses are intentionally stable only: `SUCCESS`, `NOT_FOUND` and `PERMANENT_ERROR`.
- Retryable or assisted-failure statuses stay available inside the current run cache but are not persisted as reusable checkpoints.
- `FileProcessExecutionLedger` persists one JSON ledger per provider and input fingerprint under Electron `userData/execution-ledgers`.
- Input fingerprint includes ledger policy version, parser version, normalizer version, provider name, provider config version, optional CNPJ column and CSV content.
- `startRun` reuses checkpoints only from `RUNNING`, `CANCELLED` or `FAILED` ledgers with matching provider and fingerprint; successful ledgers become history-only.
- Writes are atomic via temp file plus rename.
- History uses safe ledger keys only, rejects traversal, reports checkpoint count, output path, summary, source file metadata and resume eligibility.

## Resume, Cancellation And Partial Export

- IPC exposes `csv:list-executions`, `csv:resume-execution` and `csv:cancel-processing` through the preload bridge.
- Resume reads the original source CSV path, recomputes the fingerprint prefix from the current file and blocks if the CSV changed.
- Resume passes the same provider, provider config version and CNPJ column back through `processCsvWithLedger`, so restored CNPJs are not reprocessed.
- Cancellation aborts the active `AbortController`; core stops scheduling new provider lookups and marks remaining valid rows as `CANCELLED`.
- Partial export is still generated and auto-save is attempted for cancelled runs when a source path is available.
- Rework after review fixed cancellation summaries so `totalCnpjsValidos` reflects all valid CNPJs in the CSV, not only the subset processed before cancellation.
- Rework aligned `ProcessCsvBridgeEvent` with the real preload/runtime payload: `LookupProgress` is sent on `PROCESS_CSV_IPC_CHANNEL.LOOKUP_PROGRESS`.
- Rework replaced CSV IPC channel magic strings in `process-csv.ipc.ts` and `preload.ts` with `PROCESS_CSV_IPC_CHANNEL`.

## Checks

- `pnpm install`: pass; restored local dependencies from lock/cache.
- Focused pre-review: `pnpm exec vitest run test/integration/process-csv-ledger-resume.test.ts test/integration/process-csv-cancel.test.ts test/unit/main/file-process-execution-ledger.test.ts test/unit/process-csv.ipc.test.ts test/unit/process-csv-contracts.test.ts`: pass, 5 files and 32 tests.
- `pnpm typecheck`: pass.
- Initial `pnpm lint`: failed on import ordering after rework.
- `pnpm lint`: pass after import order fix, 103 files.
- `pnpm test`: pass, 33 files and 200 tests.
- `pnpm smoke:electron-ui`: pass after rework, including build, provider `mock`, resumed history text `1 CNPJs retomados`, XLSX auto-save, ledger checkpoint and summary.
- `git diff --check`: pass.

## Independent Review

- Reviewer agent `019ebf42-bdfb-7981-b459-66e09a3e1db8` first returned `needs_rework`.
- Finding 1: cancellation summary undercounted `totalCnpjsValidos` for rows marked `CANCELLED` after abort.
- Finding 2: `ProcessCsvBridgeEvent` described enveloped domain events while IPC/preload delivered raw `LookupProgress`.
- Both findings were fixed.
- Reviewer recheck returned no remaining findings on those issues and final verdict `approved_candidate`.
- Reviewer recheck ran focused vitest for 5 relevant files and reported 32 passing tests.

## Stop Conditions

- F1 integrated insufficiency: not hit. Wave 1 receipt marks F1 integrated and validated.
- Need to touch renderer: not hit. No `src/renderer/**` edits were made by F3.
- Need to touch provider adapters: not hit. No provider adapter edits were made by F3.
- Retomada requiring reprocessing completed CNPJs: not hit. Restored checkpointed CNPJs are skipped before provider lookup.
- Collision with F6: not observed in this worktree; F6 should remain blocked until F3 is integrated by the orchestrator.

## Risks And Residual Notes

- `state.yaml` was intentionally not edited; central orchestration state remains owner responsibility.
- This worktree contains unrelated integrated changes from F2/F4 and untracked orchestration docs; F3 did not revert or stage them.
- Ledger key uses a 24-hex fingerprint prefix by design. This is acceptable for local accidental-collision resistance, but it is not a cryptographic authorization boundary.
- Resume depends on the original CSV path still existing and matching the checkpoint fingerprint; missing or changed source files are blocked with user-facing errors.
- Harness `magic_string_boundary` warning is reduced for CSV IPC channels by using `PROCESS_CSV_IPC_CHANNEL`; remaining literals include user-facing copy, app defaults and non-F3 surfaces.
- Harness `visual_surface_change` remains inherited from F2 renderer changes; F3 did not edit renderer and Electron smoke passed.

## Integration Recommendation

Integrate F3 into `feat/fiscal-desk-local-base-prep` as `approved_candidate`, preserving the owner boundary over `src/core/app/**`, `src/main/execution/**`, `src/main/ipc/process-csv.ipc.ts`, `src/main/preload.ts`, `src/main/types.ts`, focused tests and `scripts/smoke-electron-ui.ts`.

After integration, rerun:

- `pnpm exec vitest run test/integration/process-csv-ledger-resume.test.ts test/integration/process-csv-cancel.test.ts test/unit/main/file-process-execution-ledger.test.ts test/unit/process-csv.ipc.test.ts test/unit/process-csv-contracts.test.ts`
- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`
- `pnpm smoke:electron-ui`
- `git diff --check`

F6 may be unblocked only after the orchestrator integrates F3 and validates the shared execution contracts in the final worktree.

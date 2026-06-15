# Phase 6D Runtime Wiring Judge Decision

Updated: 2026-06-13

## Decision

`approved_by_judge`

The F6D runtime-core wiring candidate is accepted for integration into the
canonical branch.

## Evidence Reviewed

- Worker thread: `019ebf77-c94b-7432-92e1-4d542b696e40`
- Reviewer thread: `019ebf7c-0e44-7b13-a523-9ab57e7c25ed`
- Worker receipt:
  `docs/goals/fiscal-desk-orchestration/results/phase-6d-runtime-wiring.md`
- Accepted runtime files:
  - `src/core/app/process-csv.use-case.ts`
  - `src/core/app/process-csv-delivery.ts`
  - `test/integration/process-csv.use-case.test.ts`
  - `test/unit/process-csv-contracts.test.ts`

The raw worker worktree diff included inherited phase changes, so the judge
compared worker files against the canonical worktree and copied only the real
F6D delta.

## Judge Checks In Worker Worktree

- `pnpm exec vitest run test/unit/fiscal-ingestion.test.ts test/unit/fiscal-export-artifacts.test.ts test/unit/fiscal-desk-phase-6-contracts.test.ts test/unit/process-csv-contracts.test.ts test/integration/process-csv.use-case.test.ts`
  - pass, 5 files / 22 tests.
- `pnpm exec vitest run test/integration/process-csv-progress.test.ts test/integration/process-csv-cancel.test.ts test/integration/process-csv-ledger-resume.test.ts`
  - pass, 3 files / 5 tests.
- `pnpm typecheck`
  - pass.
- `pnpm lint`
  - pass, 111 files.
- `git diff --check -- <F6D files>`
  - pass.

## Rationale

F6D connects the accepted F6B ingestion helper to `processCsv` as the source of
unique valid CNPJs for lookup, ledger and progress totals, while preserving the
existing row emission path. It also connects the accepted F6C export descriptors
to runtime delivery metadata without making XLSX templates look ready.

The implementation stays inside `src/core/app/**` plus focused tests, does not
touch IPC/preload/renderer/provider adapters/Receita Web, and keeps template
customization blocked.

## Accepted Risk

`processCsv` now parses the CSV twice: once for the existing row-emission flow
and once through `ingestFiscalCsv` for the F6B handoff. This is accepted as a
transitional cost because both paths share the same CSV/CNPJ helpers and the
focused, progress, cancellation, resume, full test and Electron smoke coverage
preserve current behavior.

## Result

F6D runtime wiring is approved for canonical integration. F6 is still not a
final user-facing capability until all accepted F6 slices and final integrated
validation remain green in the single branch.

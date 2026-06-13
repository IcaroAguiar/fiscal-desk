# Phase 6B: Ingestion Implementation

Updated: 2026-06-13

## Status

`approved_candidate`

F6B implementa a producao isolada de `FiscalIngestionBatch` para entrada CSV dentro de `src/core/ingestion/**`, reaproveitando os contratos F6A e helpers existentes de ingestion/CNPJ. A implementacao nao foi conectada ao use case principal, IPC, preload, renderer, providers, RunLedger, export, release/update, backend remoto, banco ou PDF.

## Source Thread

- Delegated source thread: `019ebe5c-3853-79c2-87ad-8ddace386c93`
- Execution worktree: `/Users/icaroaguiar/.codex/worktrees/a4aa/consulta-simples-csv`
- Phase goal: `docs/goals/fiscal-desk-orchestration/phases/phase-6-ingestao-entrega.md`

## Files Read

- `docs/goals/fiscal-desk-orchestration/goal.md`
- `docs/goals/fiscal-desk-orchestration/subagent-registry.md`
- `docs/goals/fiscal-desk-orchestration/integration-plan.md`
- `docs/goals/fiscal-desk-orchestration/state.yaml`
- `docs/goals/fiscal-desk-orchestration/results/integration-wave-3-f6a-f7a.md`
- `docs/goals/fiscal-desk-orchestration/results/phase-6a-ingestao-entrega-contract.md`
- `docs/goals/fiscal-desk-orchestration/results/phase-6a-judge-decision.md`
- `docs/goals/fiscal-desk-orchestration/phases/phase-6-ingestao-entrega.md`
- `src/core/ingestion/ingestion-contract.ts`
- `src/core/ingestion/csv-reader.ts`
- `src/core/ingestion/detect-cnpj-column.ts`
- `src/core/cnpj/normalize-cnpj.ts`
- `src/core/cnpj/validate-cnpj.ts`
- `src/core/app/process-csv.use-case.ts`
- `test/unit/csv-reader.test.ts`
- `test/unit/detect-cnpj-column.test.ts`
- `test/unit/fiscal-desk-phase-6-contracts.test.ts`

## Files Changed

- `src/core/ingestion/ingestion-contract.ts`
- `src/core/ingestion/fiscal-ingestion.ts`
- `test/unit/fiscal-ingestion.test.ts`
- `docs/goals/fiscal-desk-orchestration/results/phase-6b-ingestion-implementation.md`

`docs/goals/fiscal-desk-orchestration/state.yaml` was not edited.

## Behavior Implemented

- Added `ingestFiscalCsv(inputCsv, options)` as an isolated ingestion producer.
- Reuses `readCsv`, `detectCnpjColumn`, `normalizeCnpj` and `validateCnpj`.
- Produces `FiscalIngestionBatch.entries` for unique valid CNPJs with original row and row number.
- Records source metadata: format, kind, label and received timestamp.
- Records `invalid_cnpj` issues for invalid rows.
- Records `duplicate_cnpj` issues for repeated normalized CNPJs and keeps duplicates out of `entries`.
- Records `missing_cnpj_column` with parsed row count when no supported/overridden CNPJ column exists.
- Records `unsupported_input_format` before parsing when format is not `csv`.
- Preserves current CSV flow by not importing or calling `ingestFiscalCsv` from `processCsv`, IPC/preload, renderer or providers.

`validRows` counts rows with a syntactically valid CNPJ, including duplicates. `uniqueValidCnpjs` counts only unique entries emitted for lookup handoff.

## Checks

- Initial `pnpm exec vitest run test/unit/fiscal-ingestion.test.ts test/unit/fiscal-desk-phase-6-contracts.test.ts`: blocked because local dependencies were absent (`Command "vitest" not found`).
- `pnpm install`: pass, lockfile already up to date.
- `pnpm typecheck`: pass.
- `pnpm lint`: pass, 109 files.
- `pnpm exec vitest run test/unit/fiscal-ingestion.test.ts test/unit/fiscal-desk-phase-6-contracts.test.ts`: pass, 2 files / 6 tests.
- `git diff --check -- src/core/ingestion/ingestion-contract.ts src/core/ingestion/fiscal-ingestion.ts test/unit/fiscal-ingestion.test.ts`: pass.
- `rg -n "ingestFiscalCsv" src test`: pass; usage limited to the new ingestion module and its unit test.

## Independent Review

- Reviewer agent: `019ebf63-a5da-7913-be29-d32a8702689f`
- Status: `approved_candidate`
- Findings: no blocking findings.
- Reviewer notes: the batch is provider-free, covers unsupported format before parsing, missing column, invalid rows and duplicates, and is not imported by the principal flow.
- Residual reviewer risk: the overall worktree has many unrelated changes from other phases, so only the F6B recorte should be judged here.

## Risks And Boundaries

- This phase does not declare F6 complete; it only implements CSV ingestion batch production.
- Runtime orchestration still uses the existing CSV reader directly until a later judge-approved owner window connects ingestion to the principal flow.
- Unsupported formats are represented in source metadata but not parsed or implemented.
- Harness warnings `magic_string_boundary=29` and `visual_surface_change=1` remain broader worktree warnings. F6B did not touch visual surfaces, and its boundary literals are centralized in ingestion contract/constants or unit-test fixtures.
- The worktree contains unrelated dirty/untracked files from integrated/parallel phases; this receipt attributes only the files listed above.

## Recommendation

- Treat F6B as `approved_candidate` for judge/orchestrator review.
- F6C can proceed with export metadata/implementation inside `src/core/export/**`, without provider, renderer or IPC changes.
- F6D/templates should remain blocked from ready-state claims until implementation and checks exist.
- Any future connection of `FiscalIngestionBatch` to `src/core/app/**`, IPC/preload, renderer, providers or RunLedger requires a new judge-approved owner window.

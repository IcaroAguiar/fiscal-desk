# Phase 6A: Ingestao E Entrega Contract

Updated: 2026-06-13

## Status

`approved_candidate_contract_only`

F6A estabiliza contratos core para ingestion e export/entrega sem conectar fluxo de produto amplo. O resultado deve ser tratado como candidato aprovado para destravar F6B/F6C/F6D, sujeito ao judge/orquestrador central e a integracao posterior na branch final.

## Source Thread

- Delegated source thread: `019ebe5c-3853-79c2-87ad-8ddace386c93`
- Execution worktree: `/Users/icaroaguiar/.codex/worktrees/11c2/consulta-simples-csv`
- Phase goal: `docs/goals/fiscal-desk-orchestration/phases/phase-6-ingestao-entrega.md`

## Files Read

- `AGENTS.md`
- `docs/goals/fiscal-desk-orchestration/goal.md`
- `docs/goals/fiscal-desk-orchestration/subagent-registry.md`
- `docs/goals/fiscal-desk-orchestration/integration-plan.md`
- `docs/goals/fiscal-desk-orchestration/state.yaml`
- `docs/goals/fiscal-desk-orchestration/results/integration-wave-1-f1-f2-f4.md`
- `docs/goals/fiscal-desk-orchestration/results/integration-wave-2-f3-f5.md`
- `docs/goals/fiscal-desk-orchestration/results/phase-3-judge-decision.md`
- `docs/goals/fiscal-desk-orchestration/results/phase-5-judge-decision.md`
- `src/core/app/process-csv.types.ts`
- `src/core/app/process-csv.use-case.ts`
- `src/core/app/process-csv-delivery.ts`
- `src/core/ingestion/csv-reader.ts`
- `src/core/ingestion/detect-cnpj-column.ts`
- `src/core/export/csv-writer.ts`
- `src/core/export/xlsx-writer.ts`
- `test/unit/process-csv-contracts.test.ts`

## Files Changed

- `src/core/ingestion/ingestion-contract.ts`
- `src/core/export/export-contract.ts`
- `test/unit/fiscal-desk-phase-6-contracts.test.ts`
- `docs/goals/fiscal-desk-orchestration/results/phase-6a-ingestao-entrega-contract.md`

No files were changed in `src/renderer/**`, provider adapters, Receita Web, RunLedger runtime, IPC/preload, release/update, backend remoto, database or PDF surfaces. `docs/goals/fiscal-desk-orchestration/state.yaml` was not edited.

## Proposed Contract

### Ingestion

`src/core/ingestion/ingestion-contract.ts` defines a provider-free ingestion boundary:

- Supported input format is currently only `csv`.
- Source metadata is represented by `FiscalIngestionSource`, with source kind, label, format and received timestamp.
- `FiscalIngestionEntry` is the handoff payload to the consultation stage: normalized CNPJ, original CNPJ, original parsed row and row number.
- `FiscalIngestionIssue` records invalid, duplicate, missing-column and unsupported-format issues with row-level metadata and severity.
- `FiscalIngestionBatch` groups `entries`, `issues` and `summary`.

This contract intentionally does not select providers, execute lookups, save files, touch IPC or define renderer copy.

### Consulta

Consulta remains owned by the existing provider/lookup ports and the current process CSV use case. F6A does not alter provider adapters or lookup behavior. The intended boundary is that future F6B ingestion implementation produces `FiscalIngestionBatch.entries`, and a later approved worker can adapt process orchestration to consume it without moving provider-specific rules into ingestion.

### Export / Entrega

`src/core/export/export-contract.ts` defines output artifacts after lookup results exist:

- `FISCAL_EXPORT_FORMAT` currently allows `csv` and `xlsx`.
- `FISCAL_EXPORT_ARTIFACTS.CSV_RESULT_DATASET` describes CSV result delivery with no template.
- `FISCAL_EXPORT_ARTIFACTS.XLSX_RESULT_WORKBOOK` describes existing XLSX workbook delivery, but its template availability is `not_implemented` and `templateId` is `null`.
- `FISCAL_EXPORT_BOUNDARY` states that export must not own input parsing, provider lookup, execution ledger state, IPC, renderer copy or file-picker behavior.

### Templates

Templates are contract-reserved only. F6A does not claim template implementation, template validation, Excel input, PDF input, Word input or OCR readiness. The explicit availability value is `not_implemented` for the XLSX workbook template slot to avoid suggesting that templates are ready.

## Checks

- `pnpm install`: pass, installed local dependencies needed for verification; lockfile was already up to date.
- Initial `pnpm exec vitest run test/unit/fiscal-desk-phase-6-contracts.test.ts`: pass after dependencies were installed.
- Initial `pnpm typecheck`: pass.
- Initial `pnpm lint`: failed on formatting/import organization in new files; fixed with Biome.
- `pnpm exec biome check --write src/core/export/export-contract.ts src/core/ingestion/ingestion-contract.ts test/unit/fiscal-desk-phase-6-contracts.test.ts`: pass, fixed formatting.
- Rework `pnpm exec vitest run test/unit/fiscal-desk-phase-6-contracts.test.ts`: pass, 1 file / 2 tests.
- Rework `pnpm typecheck`: pass.
- Rework `pnpm lint`: pass, 106 files.
- Rework `git diff --check`: pass.

## Independent Review

- Reviewer agent `019ebf54-8d8b-7013-862d-5fb22a1dc477` first returned `needs_rework`.
- Finding: `FiscalIngestionBatch` had only `issues` and `summary`, so it did not expose the valid normalized entries required for the ingestion-to-consulta handoff.
- Rework: added `FiscalIngestionEntry`, `FiscalIngestionBatch.entries`, test coverage for entries, and changed template availability from `reserved` to `not_implemented`.
- Reviewer agent `019ebf57-0e91-7301-9f43-3766cb5815e3` rechecked the rework and returned `approved_candidate_contract_only` with no blocking findings.

## Risks And Boundaries

- This is contract-only. Runtime ingestion is not yet wired to `FiscalIngestionBatch`, and process CSV still uses the existing CSV reader directly.
- No integration runtime path was validated because F6A intentionally avoids product-flow implementation.
- The current worktree has unrelated dirty changes from integrated/parallel phases; this receipt attributes only the F6A files listed above.
- Harness warnings `magic_string_boundary=29` and `visual_surface_change=1` remain broader worktree warnings. The F6A literals are centralized contract constants or test fixtures, and F6A did not touch visual surfaces.
- `src/core/app/process-csv.types.ts` was read but not changed to avoid colliding with prior F1/F3 ownership unless a later phase explicitly needs that shared boundary.

## Recommendation

- Treat F6A as `approved_candidate_contract_only`.
- Next F6B should implement ingestion production of `FiscalIngestionBatch` inside `src/core/ingestion/**`, with focused tests for CSV source metadata, invalid rows, duplicates and valid entries.
- Next F6C should adapt export metadata toward `FiscalExportArtifactContract` without changing provider or renderer surfaces.
- F6D/templates should remain blocked from any ready-state claim until there is implementation plus checks. If renderer, IPC/preload, RunLedger or provider changes become necessary, stop and return to the judge/orchestrator for a new owner window.

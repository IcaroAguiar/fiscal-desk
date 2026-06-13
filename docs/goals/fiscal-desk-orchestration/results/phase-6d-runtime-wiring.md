# Phase 6D: Runtime Core Wiring

Updated: 2026-06-13

## Status

`approved_candidate`

F6D conecta os helpers aceitos de F6B/F6C ao fluxo core `processCsv` sem
expandir para IPC, preload, renderer, providers, Receita Web, templates,
backend remoto, banco, PDF/OCR, stage, commit, push ou PR.

Esta fase nao declara F6 pronta. F6 so pode ser considerada completa depois de
judge integration e validacao final na branch canonica.

## Source Thread

- Delegated source thread: `019ebe5c-3853-79c2-87ad-8ddace386c93`
- Execution worktree:
  `/Users/icaroaguiar/.codex/worktrees/23e6/consulta-simples-csv`
- Phase goal:
  `docs/goals/fiscal-desk-orchestration/phases/phase-6-ingestao-entrega.md`

## Files Read

- `AGENTS.md`
- `docs/goals/fiscal-desk-orchestration/goal.md`
- `docs/goals/fiscal-desk-orchestration/state.yaml`
- `docs/goals/fiscal-desk-orchestration/subagent-registry.md`
- `docs/goals/fiscal-desk-orchestration/integration-plan.md`
- `docs/goals/fiscal-desk-orchestration/phases/phase-6-ingestao-entrega.md`
- `docs/goals/fiscal-desk-orchestration/results/phase-6a-ingestao-entrega-contract.md`
- `docs/goals/fiscal-desk-orchestration/results/phase-6a-judge-decision.md`
- `docs/goals/fiscal-desk-orchestration/results/phase-6b-ingestion-implementation.md`
- `docs/goals/fiscal-desk-orchestration/results/phase-6b-judge-decision.md`
- `docs/goals/fiscal-desk-orchestration/results/phase-6c-export-delivery-implementation.md`
- `docs/goals/fiscal-desk-orchestration/results/phase-6c-judge-decision.md`
- `docs/goals/fiscal-desk-orchestration/results/integration-wave-4-f6b-f6c.md`
- `docs/goals/fiscal-desk-orchestration/results/phase-6d-runtime-owner-scope-review.md`
- `docs/goals/fiscal-desk-orchestration/results/phase-6d-scope-review-judge-decision.md`
- `src/core/app/process-csv.use-case.ts`
- `src/core/app/process-csv.types.ts`
- `src/core/app/process-csv-delivery.ts`
- `src/core/ingestion/fiscal-ingestion.ts`
- `src/core/ingestion/ingestion-contract.ts`
- `src/core/export/export-artifacts.ts`
- `src/core/export/export-contract.ts`
- `test/unit/fiscal-ingestion.test.ts`
- `test/unit/fiscal-export-artifacts.test.ts`
- `test/unit/fiscal-desk-phase-6-contracts.test.ts`
- `test/unit/process-csv-contracts.test.ts`
- `test/integration/process-csv.use-case.test.ts`
- `test/integration/process-csv-progress.test.ts`
- `test/integration/process-csv-cancel.test.ts`
- `test/integration/process-csv-ledger-resume.test.ts`

## Files Changed

- `src/core/app/process-csv.use-case.ts`
- `src/core/app/process-csv-delivery.ts`
- `test/unit/process-csv-contracts.test.ts`
- `test/integration/process-csv.use-case.test.ts`
- `docs/goals/fiscal-desk-orchestration/results/phase-6d-runtime-wiring.md`

`docs/goals/fiscal-desk-orchestration/state.yaml` was not edited.

## Behavior Changed

- `processCsv` now uses `ingestFiscalCsv(inputCsv, options)` as the accepted
  F6B handoff for the ordered list of unique valid CNPJs used by lookup,
  progress totals and ledger resume.
- `processCsv` still uses the existing parsed rows to emit every output row, so
  current CSV output, XLSX output, summary row counts, invalid CNPJ rows,
  duplicate output rows and line numbers are preserved.
- Core delivery metadata now derives CSV/XLSX extension and MIME type from the
  accepted F6C export artifact descriptors.
- XLSX templates remain explicitly unavailable through descriptor state
  `not_implemented` with `templateId: null`; no template customization or raw
  template implementation was added.

No provider-specific rule was added to ingestion or export.

## Commands Run

- `pnpm exec vitest run test/unit/fiscal-ingestion.test.ts test/unit/fiscal-export-artifacts.test.ts test/unit/fiscal-desk-phase-6-contracts.test.ts test/unit/process-csv-contracts.test.ts test/integration/process-csv.use-case.test.ts`: initial fail, `vitest` not found before dependencies were restored.
- `pnpm install`: pass, lockfile already up to date.
- `pnpm exec vitest run test/unit/fiscal-ingestion.test.ts test/unit/fiscal-export-artifacts.test.ts test/unit/fiscal-desk-phase-6-contracts.test.ts test/unit/process-csv-contracts.test.ts test/integration/process-csv.use-case.test.ts`: pass, 5 files / 22 tests.
- `pnpm exec vitest run test/integration/process-csv-progress.test.ts test/integration/process-csv-cancel.test.ts test/integration/process-csv-ledger-resume.test.ts`: pass, 3 files / 5 tests.
- Initial `pnpm typecheck`: fail on `exactOptionalPropertyTypes` for passing `cnpjColumn: undefined` into `ingestFiscalCsv`.
- Initial `pnpm lint`: fail on import order/formatting in `test/unit/process-csv-contracts.test.ts`.
- `pnpm exec biome check --write src/core/app/process-csv.use-case.ts src/core/app/process-csv-delivery.ts test/unit/process-csv-contracts.test.ts test/integration/process-csv.use-case.test.ts`: pass, fixed formatting in 1 file.
- Re-run `pnpm exec vitest run test/unit/fiscal-ingestion.test.ts test/unit/fiscal-export-artifacts.test.ts test/unit/fiscal-desk-phase-6-contracts.test.ts test/unit/process-csv-contracts.test.ts test/integration/process-csv.use-case.test.ts`: pass, 5 files / 22 tests.
- Re-run `pnpm exec vitest run test/integration/process-csv-progress.test.ts test/integration/process-csv-cancel.test.ts test/integration/process-csv-ledger-resume.test.ts`: pass, 3 files / 5 tests.
- Re-run `pnpm typecheck`: pass.
- Re-run `pnpm lint`: pass, 111 files.
- `git diff --check`: pass.

## Checks Pass/Fail

- Focused F6/process tests: pass.
- Progress/cancel/resume regression tests: pass.
- Typecheck: pass after narrow optional-property fix.
- Lint: pass after Biome formatting.
- Diff whitespace check: pass.
- Independent review: pass, `approved_candidate`.

## Assumptions

- The accepted F6B ingestion helper is allowed to parse the same CSV text in the
  core flow because it reuses the same CSV reader and CNPJ column detection
  helpers as `processCsv`.
- Keeping row emission on the existing parsed rows is the safest way to preserve
  current CSV/XLSX output semantics while connecting the accepted ingestion
  handoff.
- F6C descriptor wiring is limited to runtime delivery metadata; it does not
  expose template readiness or change renderer copy.

## Risks

- `processCsv` now parses the CSV twice: once for current row emission and once
  through `ingestFiscalCsv` for the F6B unique-lookup handoff. This is accepted
  as a narrow transitional runtime wiring tradeoff because both paths use the
  same ingestion helpers and regression tests cover CSV output, progress,
  cancellation and resume semantics.
- The worktree has broad pre-existing dirty/untracked files from prior
  integrated phases. This receipt attributes only the files listed above.
- Harness warnings `magic_string_boundary=29` and `visual_surface_change=1`
  remain broader worktree warnings. This F6D recorte did not touch visual
  surfaces; delivery/template literals are centralized in export descriptors or
  test assertions.

## Stop Conditions Hit

None.

This slice did not require IPC/preload/renderer/provider adapter/Receita Web
changes, template customization, Excel/PDF/Word input, OCR, broad RunLedger
redesign, or local-only `docs/fiscal-desk/**` docs to define expected behavior.

## Independent Review

- Reviewer agent: `019ebf7c-0e44-7b13-a523-9ab57e7c25ed`
- Status: `approved_candidate`
- Findings: no blocking findings.
- Reviewer notes: the recorte connects `processCsv` to F6B/F6C narrowly,
  preserves output/progress/cancel/resume behavior, keeps templates unavailable,
  and has no visual/provider/IPC/renderer expansion.
- Reviewer residual risk: double CSV parse is a transitional cost/coupling, not
  a functional blocker under the current shared helpers and tests.

## Required Completion Statement

F6 is not complete until judge integration and final validation in the canonical
branch pass. This F6D result is only an `approved_candidate` for the runtime core
wiring slice.

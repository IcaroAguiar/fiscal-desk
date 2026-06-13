# Phase 6E1: Output Customization Export Contract

Updated: 2026-06-13

## Status

`approved_candidate`

F6E1 implementa somente o contrato core/export para opcoes de entrega e
customizacao. Esta fatia nao declara templates prontos, nao conecta selecao de
entrega ao runtime, nao altera IPC/preload/renderer e nao declara F6 pronta.

## Source Thread

- Delegated source thread: `019ebe5c-3853-79c2-87ad-8ddace386c93`
- Execution worktree:
  `/Users/icaroaguiar/.codex/worktrees/5f74/consulta-simples-csv`
- Phase goal:
  `docs/goals/fiscal-desk-orchestration/phases/phase-6-ingestao-entrega.md`

## Files Read

- `AGENTS.md`
- `docs/goals/fiscal-desk-orchestration/goal.md`
- `docs/goals/fiscal-desk-orchestration/state.yaml`
- `docs/goals/fiscal-desk-orchestration/subagent-registry.md`
- `docs/goals/fiscal-desk-orchestration/integration-plan.md`
- `docs/goals/fiscal-desk-orchestration/phases/phase-6-ingestao-entrega.md`
- `docs/goals/fiscal-desk-orchestration/results/phase-6e-output-templates-scope-review.md`
- `docs/goals/fiscal-desk-orchestration/results/phase-6e-output-templates-scope-review-judge-decision.md`
- `docs/fiscal-desk/executor-packets/012-output-customization-templates.md`
- `docs/fiscal-desk/product-spec.md`
- `docs/adr/0018-formato-de-entrega-escolhido-pelo-usuario.md`
- `docs/adr/0019-saida-personalizada-guiada.md`
- `docs/adr/0020-modelos-reutilizaveis-de-entrega.md`
- `docs/adr/0021-modelos-de-execucao-separados-de-modelos-de-entrega.md`
- `docs/goals/fiscal-desk-orchestration/results/phase-6a-ingestao-entrega-contract.md`
- `docs/goals/fiscal-desk-orchestration/results/phase-6c-export-delivery-implementation.md`
- `docs/goals/fiscal-desk-orchestration/results/phase-6d-runtime-wiring.md`
- `src/core/export/csv-writer.ts`
- `src/core/export/xlsx-writer.ts`
- `src/core/export/export-contract.ts`
- `src/core/export/export-artifacts.ts`
- `src/core/app/process-csv.types.ts`
- `src/core/app/process-csv-delivery.ts`
- `test/unit/fiscal-export-artifacts.test.ts`
- `test/unit/fiscal-desk-phase-6-contracts.test.ts`
- `package.json`

## Files Changed

- `src/core/export/export-contract.ts`
- `src/core/export/export-artifacts.ts`
- `test/unit/fiscal-export-artifacts.test.ts`
- `test/unit/fiscal-desk-phase-6-contracts.test.ts`
- `docs/goals/fiscal-desk-orchestration/results/phase-6e-output-templates-implementation.md`

No changes were made to `docs/fiscal-desk/**`, `docs/adr/**`,
`docs/goals/fiscal-desk-orchestration/state.yaml`, `src/core/ingestion/**`,
`src/core/app/process-csv.types.ts`, `src/core/app/process-csv.use-case.ts`,
`src/core/app/process-csv-delivery.ts`, `src/main/**`, `src/renderer/**`,
`src/core/simples/**`, provider adapters, Receita Web, scripts,
release/update, backend remote, database, PDF/OCR, package manager files,
stage, commit, push or PR.

## Behavior Implemented

- Added a canonical delivery option contract in `src/core/export`.
- Kept executable export formats limited to current CSV and current XLSX
  artifacts.
- Added current/planned/disabled availability for delivery options.
- Kept reusable delivery models as `deferred`, with `persistence: "none"` and
  `versioning: "reserved"`.
- Added execution-separation metadata proving delivery options do not change
  provider selection, speed, confirmation policy or failure policy.
- Added helpers to list delivery options, return the recommended default and
  validate a selected option.
- Validation accepts only current options backed by real CSV/XLSX artifacts and
  rejects unknown, planned or disabled options.

## Delivery Option Matrix

| Option | Status | Format | Artifact | Template | Notes |
|---|---|---|---|---|---|
| `preserve-columns-csv` | current | CSV | `CSV_RESULT_DATASET` | none | Recommended default: preserve original columns and append app fields. |
| `current-result-workbook` | current | XLSX | `XLSX_RESULT_WORKBOOK` | not implemented | Preserves current XLSX availability; no reusable template is claimed. |
| `normalized-workbook` | planned | XLSX | none | not implemented | Planned normalized workbook. |
| `detailed-audit-workbook` | planned | XLSX | none | not implemented | Planned detailed/audit workbook. |
| `summary-workbook` | planned | XLSX | none | not implemented | Planned summary workbook. |
| `guided-custom-workbook` | planned | XLSX | none | not implemented | Planned guided custom output; saved models deferred. |
| `executive-pdf` | disabled | PDF | none | not implemented | Disabled because PDF/OCR is outside this slice. |
| `detailed-json` | disabled | JSON | none | not implemented | Disabled advanced output with no executable contract in this slice. |

## Deferred Gaps

- Runtime delivery selection through `processCsv`.
- IPC/preload payloads for delivery selection.
- Renderer guided customization UI.
- Saved local delivery templates.
- Import/export/share of delivery models.
- Template validation and template preview.
- Formatted Excel beyond current XLSX artifact behavior.
- PDF/OCR/Word input and executive PDF.
- JSON export implementation.
- Monetization, entitlement, license enforcement, remote backend, database,
  release or auto-update.

## Commands And Checks

- `ls docs/fiscal-desk`: pass after orchestrator restored read-only context.
- `ls docs/adr`: pass after orchestrator restored read-only context.
- `pnpm exec vitest run test/unit/fiscal-export-artifacts.test.ts test/unit/fiscal-desk-phase-6-contracts.test.ts`: first attempt failed because `vitest` was not installed in `node_modules`.
- `pnpm install`: pass; lockfile was already up to date.
- `pnpm exec vitest run test/unit/fiscal-export-artifacts.test.ts test/unit/fiscal-desk-phase-6-contracts.test.ts`: pass, 2 files / 9 tests.
- `pnpm typecheck`: pass.
- Initial `pnpm lint`: failed on formatting/import order in touched files.
- `pnpm exec biome check --write src/core/export/export-contract.ts src/core/export/export-artifacts.ts test/unit/fiscal-export-artifacts.test.ts test/unit/fiscal-desk-phase-6-contracts.test.ts`: pass, fixed formatting only in scoped files.
- Re-run `pnpm exec vitest run test/unit/fiscal-export-artifacts.test.ts test/unit/fiscal-desk-phase-6-contracts.test.ts`: pass, 2 files / 9 tests.
- Re-run `pnpm typecheck`: pass.
- Re-run `pnpm lint`: pass, 111 files.
- `git diff --check -- src/core/export/export-contract.ts src/core/export/export-artifacts.ts test/unit/fiscal-export-artifacts.test.ts test/unit/fiscal-desk-phase-6-contracts.test.ts docs/goals/fiscal-desk-orchestration/results/phase-6e-output-templates-implementation.md`: pass.

## Independent Review

- Reviewer agent: `019ebf97-6767-7b41-94cf-665d3f1e13db`
- Status: `approved_candidate`.
- Findings: no blocking or medium/high-severity findings in the reviewed F6E1
  scope.
- Reviewer evidence: reviewed `src/core/export/export-contract.ts`,
  `src/core/export/export-artifacts.ts`,
  `test/unit/fiscal-export-artifacts.test.ts` and
  `test/unit/fiscal-desk-phase-6-contracts.test.ts`; ran focused export tests
  and `pnpm typecheck`.
- Reviewer notes: current CSV/XLSX are preserved; planned/disabled options are
  not executable; reusable models remain deferred with no persistence; delivery
  choices stay separated from provider, speed, confirmation and failure policy.
- Reviewer residual risk: broader dirty/untracked worktree was not reviewed,
  and runtime/browser/IPC smoke was not run because this slice is contract-only.

## Risks And Notes

- The four F6 export/test files are untracked in this worktree because prior
  integrated phases are present as local context. This receipt attributes the
  current content of those files plus this receipt to F6E1 and does not stage or
  commit them.
- Harness warnings `magic_string_boundary=29` and `visual_surface_change=1`
  are broader worktree warnings. F6E1 centralizes delivery/template literals in
  `src/core/export` and does not touch visual surfaces.
- This slice is contract/helper-only. Exact product behavior still depends on a
  later owner window for runtime, IPC/preload and renderer.

## Stop Conditions Hit

None after the orchestrator restored `docs/fiscal-desk/**` and `docs/adr/**` as
read-only context.

## Required Completion Statement

F6 is not ready. F6E1 is only an `approved_candidate` for the narrow
output-customization export-contract slice and still requires judge integration
and final validation in the canonical branch.

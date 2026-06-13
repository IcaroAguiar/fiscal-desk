# Phase 6E2A - Delivery Runtime Selection Implementation

Updated: 2026-06-13

## Status

`implementation_candidate_pending_review`

F6E2A implementa somente a selecao runtime de entrega para `processCsv`.
O runtime agora aceita uma selecao interna por delivery option id F6E1, preserva
o caminho existente `deliveryFormat`, usa CSV como default e rejeita opcoes
desconhecidas, planejadas, desabilitadas ou sem artefato executavel atual.

Rework pontual aplicado apos review independente: `deliveryOptionId: ""` agora
e encaminhado ao validador como campo presente, rejeita como opcao desconhecida
e nao cai no default CSV nem chama provider.

Esta fatia nao altera UI, IPC/preload, modelos salvos, providers, Receita Web,
ingestion/export contracts, docs de produto/ADRs, release/update, package/lock,
stage, commit, push ou PR.

## Source Thread

- Delegated source thread: `019ebe5c-3853-79c2-87ad-8ddace386c93`
- Execution worktree:
  `/Users/icaroaguiar/.codex/worktrees/6582/consulta-simples-csv`
- Phase gate:
  `docs/goals/fiscal-desk-orchestration/results/phase-6e2-delivery-runtime-ui-scope-review.md`

## Files Read

- `AGENTS.md`
- `docs/goals/fiscal-desk-orchestration/goal.md`
- `docs/goals/fiscal-desk-orchestration/state.yaml`
- `docs/goals/fiscal-desk-orchestration/subagent-registry.md`
- `docs/goals/fiscal-desk-orchestration/integration-plan.md`
- `docs/goals/fiscal-desk-orchestration/phases/phase-6-ingestao-entrega.md`
- `docs/goals/fiscal-desk-orchestration/results/phase-6e-output-templates-implementation.md`
- `docs/goals/fiscal-desk-orchestration/results/phase-6e-output-templates-implementation-judge-decision.md`
- `docs/goals/fiscal-desk-orchestration/results/phase-6e2-delivery-runtime-ui-scope-review.md`
- `docs/goals/fiscal-desk-orchestration/results/phase-6e2-delivery-runtime-ui-scope-review-judge-decision.md`
- `docs/goals/fiscal-desk-orchestration/results/integration-wave-9-scope-reviews.md`
- `docs/fiscal-desk/executor-packets/012-output-customization-templates.md`
- `docs/fiscal-desk/product-spec.md`
- `docs/adr/0018-formato-de-entrega-escolhido-pelo-usuario.md`
- `docs/adr/0019-saida-personalizada-guiada.md`
- `docs/adr/0020-modelos-reutilizaveis-de-entrega.md`
- `docs/adr/0021-modelos-de-execucao-separados-de-modelos-de-entrega.md`
- `src/core/export/export-contract.ts`
- `src/core/export/export-artifacts.ts`
- `src/core/app/process-csv.types.ts`
- `src/core/app/process-csv.use-case.ts`
- `src/core/app/process-csv-delivery.ts`
- `test/integration/process-csv.use-case.test.ts`
- `test/integration/process-csv-cancel.test.ts`
- `test/unit/process-csv-contracts.test.ts`

## Files Changed

- `src/core/app/process-csv-delivery.ts`
- `src/core/app/process-csv.use-case.ts`
- `test/integration/process-csv.use-case.test.ts`
- `test/unit/process-csv-contracts.test.ts`
- `docs/goals/fiscal-desk-orchestration/results/phase-6e2-delivery-runtime-ui-implementation.md`

No changes were made to `src/core/export/**`, `src/main/**`,
`src/renderer/**`, `src/core/simples/**`, `src/core/ingestion/**`,
`src/core/app/process-csv.types.ts`, `test/integration/process-csv-cancel.test.ts`,
scripts, styles, package/lockfile, product docs, ADRs, `state.yaml`,
release/update, stage, commit, push or PR.

## Behavior Implemented

- Added `resolveProcessCsvOutputDelivery` as the runtime selection point in
  `src/core/app/process-csv-delivery.ts`.
- Kept legacy `deliveryFormat` compatibility:
  - empty or omitted selection resolves to current CSV;
  - `deliveryFormat: "csv"` resolves to `preserve-columns-csv`;
  - `deliveryFormat: "xlsx"` resolves to `current-result-workbook`.
- Added internal runtime support for current F6E1 delivery option ids:
  - `preserve-columns-csv` generates the current CSV delivery and no workbook;
  - `current-result-workbook` generates the current XLSX workbook while
    preserving the CSV output contract.
- Reuses F6E1 `validateFiscalExportDeliveryOptionSelection` before output
  generation.
- Rejects unknown, planned, disabled or artifact-less option ids before any
  provider lookup starts.
- Keeps output generation, progress, cancel, resume and autosave compatible by
  changing only the delivery resolution used by the existing output branch.

## Rejected Runtime Options Covered

- Unknown id: `unknown-delivery-option`.
- Planned/artifact-less id: `normalized-workbook`.
- Disabled/artifact-less id: `executive-pdf`.
- Disabled JSON/artifact-less id: `detailed-json`.

## Diff Summary

- `process-csv-delivery.ts`: now maps legacy formats to current F6E1 delivery
  options, validates selected option ids, and returns output delivery metadata
  only for current CSV/XLSX artifacts.
- `process-csv.use-case.ts`: resolves delivery once at the start and uses the
  resolved artifact format to decide whether to build XLSX. Rework: checks
  field presence for `deliveryOptionId` instead of truthiness, so an empty id is
  validated and rejected.
- `process-csv.use-case.test.ts`: adds runtime coverage for CSV/XLSX via option
  id and deterministic rejection before lookup, including `deliveryOptionId:
  ""`.
- `process-csv-contracts.test.ts`: adds contract-level coverage for
  `deliveryFormat` fallback, default CSV, current option ids and non-executable
  option rejection, including empty id as unknown.

## Checks Executed

- Rework run `pnpm exec vitest run test/integration/process-csv.use-case.test.ts test/unit/process-csv-contracts.test.ts test/unit/fiscal-export-artifacts.test.ts test/unit/fiscal-desk-phase-6-contracts.test.ts`
  - pass, 4 files / 35 tests.
- Rework run `pnpm exec vitest run test/integration/process-csv-cancel.test.ts test/integration/process-csv-ledger-resume.test.ts`
  - pass, 2 files / 4 tests.
- Rework run `pnpm typecheck`
  - pass.
- Rework run `pnpm lint`
  - pass, 111 files.
- Initial implementation run `pnpm exec vitest run test/integration/process-csv.use-case.test.ts test/unit/process-csv-contracts.test.ts test/unit/fiscal-export-artifacts.test.ts test/unit/fiscal-desk-phase-6-contracts.test.ts`
  - pass, 4 files / 33 tests.
- Initial implementation run `pnpm exec vitest run test/integration/process-csv-cancel.test.ts test/integration/process-csv-ledger-resume.test.ts`
  - pass, 2 files / 4 tests.
- Initial implementation run `pnpm typecheck`
  - pass.
- Initial implementation run `pnpm lint`
  - first run failed on formatting/import order in touched files.
- `pnpm exec biome check --write src/core/app/process-csv-delivery.ts src/core/app/process-csv.use-case.ts test/integration/process-csv.use-case.test.ts test/unit/process-csv-contracts.test.ts`
  - pass, fixed formatting/import order only in touched files.
- Initial implementation re-run `pnpm exec vitest run test/integration/process-csv.use-case.test.ts test/unit/process-csv-contracts.test.ts test/unit/fiscal-export-artifacts.test.ts test/unit/fiscal-desk-phase-6-contracts.test.ts`
  - pass, 4 files / 33 tests.
- Initial implementation re-run `pnpm exec vitest run test/integration/process-csv-cancel.test.ts test/integration/process-csv-ledger-resume.test.ts`
  - pass, 2 files / 4 tests.
- Initial implementation re-run `pnpm typecheck`
  - pass.
- Initial implementation re-run `pnpm lint`
  - pass, 111 files.
- `git diff --check -- src/core/app/process-csv-delivery.ts src/core/app/process-csv.use-case.ts src/core/app/process-csv.types.ts test/integration/process-csv.use-case.test.ts test/integration/process-csv-cancel.test.ts test/unit/process-csv-contracts.test.ts docs/goals/fiscal-desk-orchestration/results/phase-6e2-delivery-runtime-ui-implementation.md`
  - pass.

Dependency note: the first mandatory Vitest attempt failed because `vitest` was
not installed in `node_modules`. `pnpm install` then passed with lockfile already
up to date and no package/lockfile changes.

## Worktree Attribution

The worktree already contains broader dirty/untracked files from prior
integrated or parallel phases. This F6E2A pass intentionally attributes only the
files listed under "Files Changed" to this candidate. In particular,
`src/core/app/process-csv.types.ts` and
`test/integration/process-csv-cancel.test.ts` were present as modified before
this pass and were not edited for F6E2A.

## Risks And Notes

- `deliveryOptionId` remains an internal `processCsv` option in this slice. It
  is not exposed through IPC/preload or renderer UI.
- The empty-string edge found by review is covered in integration and helper
  contract tests; broader runtime inputs still depend on later IPC/preload
  validation before user-facing exposure.
- The helper contains a defensive allowlist for the two current executable
  artifacts. If F6E1 later adds another current artifact, F6E2A should be
  revisited instead of making it executable implicitly.
- Planned/disabled F6E1 labels for PDF/JSON remain metadata only and are not
  executable.
- Harness warnings `magic_string_boundary=23` and `visual_surface_change=1`
  were emitted at worktree level. This slice centralizes new runtime literals in
  `process-csv-delivery.ts` and does not touch visual surfaces.

## Stop Conditions Found

None after the local docs package was present in this worktree.

## Independent Review

Required. This is an implementation candidate pending independent review and
judge decision. No completion or self-approval is claimed.

# Phase 6D Runtime Owner Scope Review

Updated: 2026-06-13

## Status

`approved_candidate`

This review recommends releasing a narrow F6D runtime owner window for core
ingestion/export wiring in the principal CSV processing flow. It does not
recommend templates/output customization as the next executable phase, and it
does not declare F6 ready.

## Source Thread

- Delegated source thread: `019ebe5c-3853-79c2-87ad-8ddace386c93`
- Review worktree:
  `/Users/icaroaguiar/.codex/worktrees/f44c/consulta-simples-csv`
- Scope: docs-only F6D runtime owner window review.

## Files Read

- `docs/goals/fiscal-desk-orchestration/goal.md`
- `docs/goals/fiscal-desk-orchestration/state.yaml`
- `docs/goals/fiscal-desk-orchestration/subagent-registry.md`
- `docs/goals/fiscal-desk-orchestration/integration-plan.md`
- `docs/goals/fiscal-desk-orchestration/phases/phase-6-ingestao-entrega.md`
- `docs/goals/fiscal-desk-orchestration/phases/phase-7-receita-web-assistida.md`
- `docs/goals/fiscal-desk-orchestration/results/integration-wave-3-f6a-f7a.md`
- `docs/goals/fiscal-desk-orchestration/results/integration-wave-4-f6b-f6c.md`
- `docs/goals/fiscal-desk-orchestration/results/phase-6a-ingestao-entrega-contract.md`
- `docs/goals/fiscal-desk-orchestration/results/phase-6a-judge-decision.md`
- `docs/goals/fiscal-desk-orchestration/results/phase-6b-ingestion-implementation.md`
- `docs/goals/fiscal-desk-orchestration/results/phase-6b-judge-decision.md`
- `docs/goals/fiscal-desk-orchestration/results/phase-6c-export-delivery-implementation.md`
- `docs/goals/fiscal-desk-orchestration/results/phase-6c-judge-decision.md`
- `docs/goals/fiscal-desk-orchestration/results/phase-7a-judge-decision.md`
- `src/core/app/process-csv.types.ts` (read-only boundary inspection)
- `src/core/app/process-csv.use-case.ts` (read-only boundary inspection)
- `src/core/app/process-csv-delivery.ts` (read-only boundary inspection)
- `package.json` (verification command inspection)

Attempted but absent in this worktree:

- `docs/fiscal-desk/phase-orchestration.md`
- `docs/fiscal-desk/executor-packets/012-output-customization-templates.md`

The judge/orchestrator clarified that these two paths are local-only/ignored
docs and may be absent here. This review does not invent or rely on their
contents.

## Files Changed

- `docs/goals/fiscal-desk-orchestration/results/phase-6d-runtime-owner-scope-review.md`

No changes were made to `state.yaml`, `src/**`, `test/**`, `scripts/**`,
provider adapters, renderer, IPC/preload, release/update, backend remote,
database, PDF, staging, commits, pushes or PRs.

## Recommended Decision

Recommended next executable slice:

`F6D runtime core wiring for ingestion/export in the principal process flow`

This is closest to option 1, but should be narrower than a broad runtime +
IPC + renderer window. The next worker should first wire already accepted F6A,
F6B and F6C core helpers into the core process CSV path only, then stop unless
the judge explicitly grants broader shared-boundary ownership.

Do not dispatch `F6D templates/output customization` next. The available F6A,
F6C and wave 4 receipts repeatedly state that templates remain
`not_implemented`, XLSX templates are not ready, and no Excel/PDF/Word input
readiness is claimed. The absent local-only templates packet also means this
worktree lacks enough primary source material to safely define a template
implementation window.

Do not dispatch F7B in the same wave. F7B remains held until a fresh
security/scope review, and Receita Web must remain assisted, experimental,
visible-browser-only, outside automatic fallback and outside deterministic
smoke.

## Why Runtime Core Wiring Is Safe Enough

Evidence from available primary docs is sufficient for a bounded runtime-core
slice:

- F6A accepted provider-free ingestion/export contracts.
- F6B accepted `FiscalIngestionBatch` production for CSV, but left it
  disconnected from `processCsv`.
- F6C accepted executable export artifact descriptors, but left them
  disconnected from runtime delivery selection.
- Wave 4 integrated and validated F6B/F6C in the canonical branch while
  documenting that the full F6 feature is still not user-visible.
- `process-csv` already owns CSV orchestration and delivery metadata, so it is
  the correct owner boundary for a narrow runtime connection.

The missing `docs/fiscal-desk/**` docs are a residual risk, but not a blocker
for this narrow recommendation because the already judged F6A/F6B/F6C receipts
define the implementation limits and explicitly keep templates out.

## Proposed Owner Window

Single owner: `F6D runtime-core-owner`

Primary owned boundary:

- `src/core/app/**`

Allowed only if strictly needed by the core runtime connection:

- `src/core/ingestion/**`
- `src/core/export/**`
- focused tests under `test/unit/**` and `test/integration/**`
- F6D receipt under `docs/goals/fiscal-desk-orchestration/results/**`

Shared boundaries that must remain under this single owner while active:

- `process_csv_contracts`
- `export_types`
- core delivery metadata
- core CSV ingestion orchestration

Boundaries not granted by default:

- IPC contracts
- preload bridge
- renderer shell
- `styles.css`
- provider types
- Receita Web adapter contract
- release/update

If implementation discovers that IPC/preload, renderer, provider contracts or
RunLedger semantics must change to make the slice useful, the worker must stop
and return `needs_rework` instead of expanding scope.

## Phases Blocked While Window Is Active

Block these until F6D runtime-core-owner closes or returns to judge:

- any other worker touching `src/core/app/**`
- any worker touching `process-csv` contracts or delivery metadata
- F6D templates/output customization
- renderer workers that consume new F6 runtime state
- IPC/preload workers that expose new F6 runtime state
- F7B if it would touch provider selection, runtime fallback, deterministic
  smoke or shared app contracts

F7B remains independently held by its own security/scope review requirement
even if it does not collide with this F6D slice.

## Allowed Writes For Next Worker

Recommended allowed writes for the next implementation thread:

- `src/core/app/process-csv.use-case.ts`
- `src/core/app/process-csv.types.ts`
- `src/core/app/process-csv-delivery.ts`
- `src/core/ingestion/fiscal-ingestion.ts`, only for small compatibility fixes
  required by runtime wiring
- `src/core/ingestion/ingestion-contract.ts`, only if the existing accepted
  contract has a narrow proven gap
- `src/core/export/export-artifacts.ts`, only to connect accepted descriptors
  to runtime delivery selection
- `src/core/export/export-contract.ts`, only if the existing accepted contract
  has a narrow proven gap
- `test/unit/fiscal-ingestion.test.ts`
- `test/unit/fiscal-export-artifacts.test.ts`
- `test/unit/fiscal-desk-phase-6-contracts.test.ts`
- `test/unit/process-csv-contracts.test.ts`
- `test/integration/process-csv.use-case.test.ts`
- `test/integration/process-csv-progress.test.ts`, only if progress semantics
  are intentionally affected
- `test/integration/process-csv-cancel.test.ts`, only if cancellation
  semantics are intentionally affected
- `test/integration/process-csv-ledger-resume.test.ts`, only if resume
  semantics are intentionally affected
- `docs/goals/fiscal-desk-orchestration/results/phase-6d-runtime-wiring.md`

## Do Not Touch For Next Worker

- `docs/goals/fiscal-desk-orchestration/state.yaml`
- `src/main/**`
- `src/renderer/**`
- `src/core/simples/**`
- provider adapters
- Receita Web
- IPC/preload
- release/update
- backend remote
- database
- PDF/OCR
- raw templates or template customization UI
- stage, commit, push or PR

## Gates

Minimum gates for the next worker:

- focused F6/process tests proving current CSV flow still works;
- focused ingestion tests proving invalid, duplicate and missing-column behavior
  still matches F6B;
- focused export tests proving CSV/XLSX descriptor selection still keeps
  templates unavailable when no real template exists;
- `pnpm exec vitest run test/unit/fiscal-ingestion.test.ts test/unit/fiscal-export-artifacts.test.ts test/unit/fiscal-desk-phase-6-contracts.test.ts test/unit/process-csv-contracts.test.ts test/integration/process-csv.use-case.test.ts`;
- `pnpm typecheck`;
- `pnpm lint`;
- `git diff --check`;
- independent reviewer for the material runtime diff.

Recommended broader gates if the diff touches progress, cancellation or resume:

- `pnpm exec vitest run test/integration/process-csv-progress.test.ts test/integration/process-csv-cancel.test.ts test/integration/process-csv-ledger-resume.test.ts`

Recommended final/integration gates after judge integration:

- `pnpm test`;
- `pnpm build`;
- `pnpm smoke:real-csv` with offline/default-safe provider behavior;
- `pnpm smoke:electron-ui` if any runtime output observable by UI changes;
- `pnpm smoke:visual` only if renderer/styles are later granted and touched;
- `node docs/ai/quality-gate/check-ratchet.mjs`.

## Risks

- The local-only docs
  `docs/fiscal-desk/phase-orchestration.md` and
  `docs/fiscal-desk/executor-packets/012-output-customization-templates.md`
  are absent, so template-specific planning remains under-specified in this
  worktree.
- The worktree is already broadly dirty from prior integrated/parallel changes;
  the next worker must attribute only its own diff and avoid cleanup/refactor.
- Runtime wiring touches shared app semantics and must keep a single owner.
- Replacing direct CSV parsing inside `processCsv` with `FiscalIngestionBatch`
  may expose subtle differences in row counts, duplicate counting, invalid rows,
  progress totals, cancellation and resume behavior.
- Export descriptor wiring must not accidentally claim templates, Excel input,
  PDF input, Word input or OCR readiness.
- Harness warnings `magic_string_boundary=29` and `visual_surface_change=1`
  remain broader worktree warnings. This docs-only review did not touch visual
  surfaces; the next runtime worker must centralize any new boundary literals or
  document why they are local test fixtures.

## Stop Conditions For Next Worker

Return `needs_rework` immediately if:

- `processCsv` cannot consume F6B ingestion entries without changing public
  IPC/preload/renderer contracts;
- the implementation requires provider adapter changes;
- the implementation requires Receita Web fallback, deterministic smoke or
  assisted-browser behavior;
- template customization is required to make the runtime slice coherent;
- Excel/PDF/Word input or OCR becomes part of the implementation;
- RunLedger resume/cancellation semantics require broad redesign;
- tests show changed CSV output semantics that are not explicitly accepted;
- the absent `docs/fiscal-desk/**` docs become necessary to define expected
  behavior.

## Prompt For Next Subagent

```text
/goal
Execute a fase F6D runtime-core wiring do Fiscal Desk, mantendo escopo
estritamente limitado ao fluxo core `processCsv`.

Contexto:
- F6A, F6B e F6C ja foram julgadas, integradas e validadas na branch canonica.
- F6B implementou `FiscalIngestionBatch` para CSV, mas nao conectou ao fluxo
  principal.
- F6C implementou descriptors/helpers de export/entrega, mas nao conectou a
  selecao runtime.
- A scope review F6D recomendou uma janela menor de runtime core owner, nao
  templates/output customization.
- Nao declare F6 pronta.

Leia obrigatoriamente:
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

Allowed writes:
- `src/core/app/process-csv.use-case.ts`
- `src/core/app/process-csv.types.ts`
- `src/core/app/process-csv-delivery.ts`
- `src/core/ingestion/fiscal-ingestion.ts`, only for small compatibility fixes
- `src/core/ingestion/ingestion-contract.ts`, only for a narrow proven contract gap
- `src/core/export/export-artifacts.ts`, only for accepted descriptor wiring
- `src/core/export/export-contract.ts`, only for a narrow proven contract gap
- `test/unit/fiscal-ingestion.test.ts`
- `test/unit/fiscal-export-artifacts.test.ts`
- `test/unit/fiscal-desk-phase-6-contracts.test.ts`
- `test/unit/process-csv-contracts.test.ts`
- `test/integration/process-csv.use-case.test.ts`
- `test/integration/process-csv-progress.test.ts`, only if progress changes
- `test/integration/process-csv-cancel.test.ts`, only if cancellation changes
- `test/integration/process-csv-ledger-resume.test.ts`, only if resume changes
- `docs/goals/fiscal-desk-orchestration/results/phase-6d-runtime-wiring.md`

Do not touch:
- `docs/goals/fiscal-desk-orchestration/state.yaml`
- `src/main/**`
- `src/renderer/**`
- `src/core/simples/**`
- provider adapters
- Receita Web
- IPC/preload
- release/update
- backend remoto
- banco
- PDF/OCR
- template customization UI or raw template implementation
- stage, commit, push or PR

Implementation target:
- Connect the accepted F6B ingestion helper to the principal `processCsv` path
  only if current CSV behavior can be preserved.
- Connect accepted F6C export descriptors to core delivery selection only if it
  does not make templates look ready.
- Preserve current CSV output, XLSX output, summary, progress, cancellation and
  resume semantics unless a changed behavior is explicitly justified and tested.
- Keep provider-specific rules out of ingestion/export.

Stop conditions:
- Need to modify IPC/preload/renderer/provider adapters/Receita Web.
- Need template customization to complete the slice.
- Need Excel/PDF/Word input or OCR.
- Need broad RunLedger redesign.
- Current CSV regression cannot be preserved.
- Missing local-only docs under `docs/fiscal-desk/**` become necessary to define
  expected behavior.

Verification commands:
- `pnpm exec vitest run test/unit/fiscal-ingestion.test.ts test/unit/fiscal-export-artifacts.test.ts test/unit/fiscal-desk-phase-6-contracts.test.ts test/unit/process-csv-contracts.test.ts test/integration/process-csv.use-case.test.ts`
- If progress/cancel/resume touched: `pnpm exec vitest run test/integration/process-csv-progress.test.ts test/integration/process-csv-cancel.test.ts test/integration/process-csv-ledger-resume.test.ts`
- `pnpm typecheck`
- `pnpm lint`
- `git diff --check`

Receipt obrigatorio:
Create `docs/goals/fiscal-desk-orchestration/results/phase-6d-runtime-wiring.md`
with status `approved_candidate | needs_rework | blocked`, files read, files
changed, behavior changed, commands run, checks pass/fail, assumptions, risks,
stop conditions hit, and explicit statement that F6 is not complete until judge
integration and final validation.
```

## Brain Update

No Brain note was updated because this thread's allowed writes are restricted to
this receipt file only.

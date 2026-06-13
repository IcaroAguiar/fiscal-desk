# Phase 6E2B - Delivery UI/IPC Scope Review

Date: 2026-06-13

## Status

`approved_scope_candidate`

This is a docs-only scope candidate for judge review. It does not self-approve
completion and does not authorize code changes until the judge releases a
material worker with exact file ownership.

The initial review stopped as `blocked_missing_local_docs` because mandatory
local ignored docs under `docs/fiscal-desk/**` and `docs/adr/**` were absent.
The orchestrator/judge reported that those docs were copied into this worktree.
Presence was revalidated and the missing-docs blocker is now obsolete.

No implementation code was changed. No `src/**`, `test/**`, package/lockfile,
product docs, ADRs, `state.yaml`, `integration-plan.md`, stage, commit, push or
PR was touched.

## Files Read

- `AGENTS.md`
- `docs/goals/fiscal-desk-orchestration/goal.md`
- `docs/goals/fiscal-desk-orchestration/state.yaml`
- `docs/goals/fiscal-desk-orchestration/subagent-registry.md`
- `docs/goals/fiscal-desk-orchestration/integration-plan.md`
- `docs/goals/fiscal-desk-orchestration/phases/phase-6-ingestao-entrega.md`
- `docs/goals/fiscal-desk-orchestration/results/phase-6e2-delivery-runtime-ui-scope-review.md`
- `docs/goals/fiscal-desk-orchestration/results/phase-6e2-delivery-runtime-ui-scope-review-judge-decision.md`
- `docs/goals/fiscal-desk-orchestration/results/phase-6e2-delivery-runtime-ui-implementation.md`
- `docs/goals/fiscal-desk-orchestration/results/phase-6e2-delivery-runtime-ui-implementation-judge-decision.md`
- `docs/goals/fiscal-desk-orchestration/results/integration-wave-10-f6e2a-f8a.md`
- `docs/fiscal-desk/product-spec.md`
- `docs/fiscal-desk/phase-orchestration.md`
- `docs/fiscal-desk/spec-audit.md`
- `docs/fiscal-desk/first-release.md`
- `docs/fiscal-desk/executor-packets/012-output-customization-templates.md`
- `docs/adr/0018-formato-de-entrega-escolhido-pelo-usuario.md`
- `docs/adr/0019-saida-personalizada-guiada.md`
- `docs/adr/0020-modelos-reutilizaveis-de-entrega.md`
- `docs/adr/0021-modelos-de-execucao-separados-de-modelos-de-entrega.md`
- `src/core/app/process-csv.types.ts`
- `src/core/app/process-csv.use-case.ts`
- `src/core/app/process-csv-delivery.ts`
- `src/main/types.ts`
- `src/main/preload.ts`
- `src/main/ipc/process-csv.ipc.ts`
- `src/renderer/**` mapped read-only with `rg --files` and targeted reads of:
  - `src/renderer/ui/app.types.ts`
  - `src/renderer/ui/app.ts`
  - `src/renderer/ui/app-view.ts`

## Mandatory Docs Revalidation

Recovered and present after judge/orchestrator update:

- `docs/fiscal-desk/product-spec.md`
- `docs/fiscal-desk/phase-orchestration.md`
- `docs/fiscal-desk/spec-audit.md`
- `docs/adr/0018-formato-de-entrega-escolhido-pelo-usuario.md`
- `docs/adr/0019-saida-personalizada-guiada.md`
- `docs/adr/0020-modelos-reutilizaveis-de-entrega.md`
- `docs/adr/0021-modelos-de-execucao-separados-de-modelos-de-entrega.md`

The recovered docs support the same split already established by F6E2:
delivery choice is valid product direction, but planned formats, guided output,
saved delivery models and execution models must not be exposed as ready.

## Current Runtime/UI Mapping

- F6E2A is integrated and validated as runtime-only delivery selection.
- `processCsv` accepts an internal `deliveryOptionId` path in
  `src/core/app/process-csv.use-case.ts`, while preserving the legacy
  `deliveryFormat` path.
- `src/core/app/process-csv-delivery.ts` maps current executable formats to
  F6E1 option ids and rejects unknown, planned, disabled or artifact-less
  selections.
- `src/main/types.ts` exports `ProcessCsvDeliveryFormat` and
  `ProcessCsvOutputDelivery`, but does not expose a public delivery option id
  contract.
- `src/main/preload.ts` exposes `processCsv` and `resumeExecution` with
  `deliveryFormat?: ProcessCsvDeliveryFormat`; no `deliveryOptionId` is exposed.
- `src/main/ipc/process-csv.ipc.ts` parses `deliveryFormat`, not option ids,
  before calling `processCsv`.
- The renderer still owns a simple `deliveryFormat` state and select control
  with current visible values CSV and Excel with tabs.

## Recommended Scope For F6E2B

Release only an IPC/preload/types worker.

Goal:

- expose current delivery option selection through the main IPC input, preload
  bridge and exported app types;
- preserve backwards compatibility for existing `deliveryFormat`;
- permit only current executable CSV and XLSX delivery selections;
- reject unknown, planned, disabled and artifact-less option ids before provider
  lookup;
- keep process/resume semantics coherent with F6E2A runtime validation.

Out of scope:

- renderer UI replacement;
- saved/reusable delivery models;
- templates UI;
- PDF, JSON, formatted Excel promises or other planned formats as executable;
- provider behavior, provider fallback, Receita Web, ingestion and release or
  update behavior.

Recommended subphase split remains:

1. F6E2B: IPC/preload/types only.
2. F6E2C: renderer guided delivery selection after F6E2B is judged and
   integrated.
3. Saved/reusable delivery models: deferred behind a separate storage and
   versioning contract.

## Owned Files And Allowed Writes

For this docs-only scope review, the exact allowed write was:

- `docs/goals/fiscal-desk-orchestration/results/phase-6e2b-delivery-ui-ipc-scope-review.md`

Recommended exact allowed writes for a future material F6E2B worker:

- `src/main/ipc/process-csv.ipc.ts`
- `src/main/preload.ts`
- `src/main/types.ts`
- `src/core/app/process-csv.types.ts`
- focused IPC/preload/process tests under `test/unit/**` or
  `test/integration/**`
- `docs/goals/fiscal-desk-orchestration/results/phase-6e2b-delivery-ui-ipc-implementation.md`

`src/core/app/process-csv.types.ts` should be used only for narrow public bridge
types/constants needed by IPC/preload. Do not reopen F6E2A runtime behavior
unless a blocker proves the current internal contract is insufficient and the
worker returns `needs_rework`.

## Do Not Touch

For this scope-review receipt:

- any `src/**`
- any `test/**`
- package or lockfile
- `docs/fiscal-desk/**`
- `docs/adr/**`
- `docs/goals/fiscal-desk-orchestration/state.yaml`
- `docs/goals/fiscal-desk-orchestration/integration-plan.md`
- stage, commit, push or PR

For a future F6E2B worker unless explicitly reopened by judge:

- `src/renderer/**`
- `src/renderer/styles.css`
- `src/core/export/**`
- `src/core/ingestion/**`
- `src/core/simples/**`
- provider adapters, provider factory, fallback and Receita Web behavior
- scripts and visual smoke harnesses
- release/update, diagnostics transport, package metadata and commercial gates
- saved/reusable delivery model persistence
- product docs and ADRs

## Collision Review

F6E2B necessarily touches shared `ipc_contracts`, `preload_bridge` and
`process_csv_contracts`; it must have one active owner.

F6E2B must block concurrent F8 UI/IPC/preload/renderer work. F8A is integrated
as a local contract only and did not touch UI, IPC, preload, release or
telemetry transport. A future F8 UI, diagnostic UI, update UI or release surface
would collide if it needs `src/main/**`, `src/renderer/**`,
`src/main/types.ts`, `src/main/preload.ts` or `PROCESS_CSV_IPC_CHANNEL`.

F6E2B and F6E2C must not run concurrently. F6E2B owns the bridge contract;
F6E2C renderer work should start only after F6E2B is judged and integrated.

F6E2B must not collide with provider work. Delivery selection happens after
provider choice and must not alter which provider runs, fallback policy, speed,
confirmation policy or Receita Web behavior.

## Mandatory Checks For Eventual Worker

- focused IPC tests for valid current CSV and XLSX delivery option selections;
- focused IPC tests rejecting unknown, planned, disabled and artifact-less ids;
- focused resume tests preserving selected delivery behavior;
- backwards compatibility tests for existing `deliveryFormat`;
- `pnpm exec vitest run test/integration/process-csv.use-case.test.ts test/unit/process-csv-contracts.test.ts`
- relevant IPC/preload focused test files once identified or added;
- `pnpm typecheck`
- `pnpm lint`
- `git diff --check -- <changed files>`
- independent review, because IPC/preload/types are shared contracts.

No screenshot is required for IPC/preload-only F6E2B. Screenshot or smoke
becomes mandatory only when renderer UI changes.

## Stop Conditions

Stop and return `blocked` or `needs_rework` if:

- any mandatory local product/ADR document becomes missing again;
- the worker needs renderer UI to make IPC/preload changes meaningful;
- the worker needs to change `src/core/export/**`, ingestion, provider,
  Receita Web, release/update, package/lockfile or product docs;
- planned, disabled or artifact-less options become executable;
- copy or UI implies PDF, JSON, formatted Excel, templates UI or saved delivery
  models are ready;
- delivery models become coupled to provider selection, speed, confirmation
  policy, fallback policy or Receita Web behavior;
- existing CSV default, current XLSX, progress, cancel, resume or autosave
  behavior regresses;
- another active worker owns IPC/preload/types/renderer/F8 UI surfaces.

## Residual Risks

- The worktree has broad pre-existing dirty state in `src/**`, `test/**` and
  `docs/goals/**`; this receipt does not attribute or validate those changes.
- Product docs still describe Excel/PDF/JSON/guided output as broader roadmap.
  F6E2B must not translate that roadmap into executable UI or bridge options
  beyond current CSV/XLSX.
- The renderer mapping was read-only and targeted; it was enough to identify the
  existing `deliveryFormat` surface but not to approve renderer behavior.
- Harness warnings remain worktree-level: `magic_string_boundary=23` and
  `visual_surface_change=1`. This docs-only receipt adds no runtime literals and
  changes no visual surface.

## Recommendation To Judge

Liberar worker material only for F6E2B IPC/preload/types with the exact allowed
writes above, and block concurrent F8 UI/IPC/preload/renderer work while it is
active.

Do not release renderer UI, templates UI or saved delivery models in the same
worker. If the judge wants user-visible delivery selection next, require F6E2B
to land first, then release F6E2C as a separate renderer owner window.

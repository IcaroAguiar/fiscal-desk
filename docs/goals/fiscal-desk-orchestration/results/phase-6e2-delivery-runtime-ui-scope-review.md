# Phase 6E2: Delivery Runtime/UI Scope Review

Updated: 2026-06-13

## Status

`approved_candidate`

F6E2 pode ser liberada somente como uma sequencia de subfases pequenas. O
menor proximo worker executavel e `F6E2A delivery-runtime-selection`, uma fatia
runtime-only em `src/core/app/**` que consome o contrato F6E1 para validar e
resolver uma opcao de entrega atual em artefato CSV/XLSX, preservando a
compatibilidade com `deliveryFormat`.

Nao ha liberacao para uma feature completa de saida personalizada, UI guiada,
IPC/preload, modelos reutilizaveis salvos, PDF/JSON executavel, monetizacao,
provider/fallback ou Receita Web nesta janela.

## Source Thread

- Delegated source thread: `019ebfa7-d70f-7283-955a-646d7736735d`
- Review worktree:
  `/Users/icaroaguiar/.codex/worktrees/c6a2/consulta-simples-csv`
- Scope: docs-only scope review para a proxima owner window apos F6E1.

## Files Read

- `AGENTS.md`
- `docs/goals/fiscal-desk-orchestration/goal.md`
- `docs/goals/fiscal-desk-orchestration/state.yaml`
- `docs/goals/fiscal-desk-orchestration/subagent-registry.md`
- `docs/goals/fiscal-desk-orchestration/integration-plan.md`
- `docs/goals/fiscal-desk-orchestration/phases/phase-6-ingestao-entrega.md`
- `docs/goals/fiscal-desk-orchestration/results/phase-6e-output-templates-scope-review.md`
- `docs/goals/fiscal-desk-orchestration/results/phase-6e-output-templates-scope-review-judge-decision.md`
- `docs/goals/fiscal-desk-orchestration/results/phase-6e-output-templates-implementation.md`
- `docs/goals/fiscal-desk-orchestration/results/phase-6e-output-templates-implementation-judge-decision.md`
- `docs/goals/fiscal-desk-orchestration/results/integration-wave-8-f6e1-f7b.md`
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
- `src/main/ipc/process-csv.ipc.ts`
- `src/main/preload.ts`
- `src/main/types.ts`
- `src/renderer/ui/app.types.ts`
- `src/renderer/ui/app.ts`
- `src/renderer/ui/app-view.ts`

Additional read for collision mapping:

- `src/renderer/ui/app-delivery.ts`
- `rg -n "deliveryFormat|deliveryOption|ProcessCsvDelivery|FISCAL_EXPORT" test src docs/goals/fiscal-desk-orchestration/results -g '!node_modules'`

## Files Changed

- `docs/goals/fiscal-desk-orchestration/results/phase-6e2-delivery-runtime-ui-scope-review.md`

No changes were made to `src/**`, `test/**`, `docs/fiscal-desk/**`,
`docs/adr/**`, `docs/goals/fiscal-desk-orchestration/state.yaml`, package or
lock files, provider adapters, Receita Web, release/update, backend remoto,
banco, PDF/OCR, stage, commit, push or PR.

## Decision

Approve only the next worker:

`F6E2A delivery-runtime-selection`

Recommended owner window:

- role: backend-builder/API designer with focused tests
- risk class: structural but narrow
- owner boundary: runtime delivery selection in `src/core/app/**`
- excluded boundaries: IPC/preload/types, renderer UI, persisted delivery
  models, provider factory/fallback, Receita Web, release/update

The worker should connect F6E1's `validateFiscalExportDeliveryOptionSelection`
and current delivery option matrix to `processCsv` runtime behavior while
keeping the existing CSV/XLSX behavior and the existing `deliveryFormat` path
compatible.

## Why Runtime First

F6E1 is already integrated and validated as export-contract/helper-only:

- current executable options exist for CSV and current XLSX;
- planned/disabled delivery options are metadata only;
- unknown, planned, disabled and artifact-less options are rejected by the
  F6E1 selection helper;
- reusable delivery models are `deferred`, with no persistence;
- delivery metadata is explicitly separated from provider selection, speed,
  confirmation policy and failure policy.

The current runtime still accepts only `deliveryFormat?: "csv" | "xlsx"` and
does not consume `FiscalExportDeliveryOptionId`. Releasing UI or IPC first
would expose a product control before the runtime has a canonical enforcement
point for planned/disabled options.

## Recommended Subphase Split

### F6E2A - Runtime-Only Selection

Status: approved next executable candidate.

Goal:

- allow `processCsv` runtime internals to resolve a delivery option selection
  through F6E1 helpers;
- preserve the current `deliveryFormat` fallback and default CSV behavior;
- keep the only executable outputs as current CSV and current XLSX;
- reject planned, disabled, unknown or artifact-less delivery option ids with
  deterministic errors;
- keep output generation, progress, cancel, resume and autosave behavior
  compatible.

Allowed writes:

- `src/core/app/process-csv.use-case.ts`
- `src/core/app/process-csv-delivery.ts`
- `src/core/app/process-csv.types.ts`, only if a narrow additive runtime type
  is required; prefer avoiding it if the change can stay internal
- `test/integration/process-csv.use-case.test.ts`
- `test/integration/process-csv-cancel.test.ts`, only if cancellation/resume
  behavior is affected
- `test/unit/process-csv-contracts.test.ts`
- new focused unit tests under `test/unit/**` only for runtime delivery
  selection
- `docs/goals/fiscal-desk-orchestration/results/phase-6e2-delivery-runtime-ui-implementation.md`

Do not write:

- `src/core/export/**`, unless a blocker proves F6E1's accepted contract is
  insufficient and the worker returns `needs_rework` before broadening scope
- `src/main/**`
- `src/renderer/**`
- provider adapters or `src/core/simples/**`
- `src/core/ingestion/**`
- scripts, styles, package/lockfile, docs/ADR/product docs, release/update

Mandatory checks:

- focused tests for `processCsv` default CSV behavior;
- focused tests for current XLSX via existing `deliveryFormat`;
- focused tests for current CSV/XLSX via delivery option id if the worker adds
  that internal input;
- focused tests proving planned/disabled/unknown delivery options are rejected;
- focused regression for cancellation/resume if touched;
- `pnpm exec vitest run test/integration/process-csv.use-case.test.ts test/unit/process-csv-contracts.test.ts test/unit/fiscal-export-artifacts.test.ts test/unit/fiscal-desk-phase-6-contracts.test.ts`
- `pnpm typecheck`
- `pnpm lint`
- `git diff --check -- <changed files>`
- independent review, because this is a shared runtime boundary.

No screenshot is required if this remains runtime-only.

### F6E2B - IPC/Preload/Types

Status: blocked until F6E2A is judged and integrated.

Goal:

- expose the accepted current delivery option selection through the main IPC
  input, preload bridge and exported app types;
- preserve backwards compatibility for `deliveryFormat`;
- keep save/resume inputs coherent with runtime validation;
- expose only current executable options as selectable values unless UI needs
  planned/disabled metadata read-only.

Likely allowed writes after F6E2A:

- `src/main/ipc/process-csv.ipc.ts`
- `src/main/preload.ts`
- `src/main/types.ts`
- `src/core/app/process-csv.types.ts`, only for public bridge type additions
- focused IPC/preload tests under `test/unit/**` or `test/integration/**`
- its own result receipt

Mandatory checks after release:

- focused IPC invalid-selection tests, including unknown/planned/disabled;
- focused resume tests preserving selected delivery behavior;
- `pnpm exec vitest run test/unit/process-csv.ipc.test.ts test/integration/process-csv.use-case.test.ts`
- `pnpm typecheck`
- `pnpm lint`
- `git diff --check -- <changed files>`
- independent review.

### F6E2C - Renderer Guided Delivery Customization

Status: blocked until F6E2B is judged and integrated.

Goal:

- replace the raw `deliveryFormat` dropdown with a guided delivery selection
  backed by the bridge contract;
- show planned/disabled options honestly without enabling execution;
- preserve the current simple CSV/XLSX path;
- keep UI copy factual and avoid claiming formatted Excel, PDF, JSON or saved
  models are ready.

Likely allowed writes after F6E2B:

- `src/renderer/ui/**`
- `src/renderer/styles.css`, only if explicitly granted a visual owner window
- renderer-focused tests
- smoke/visual scripts only if the renderer worker's prompt explicitly allows
  them
- its own result receipt

Mandatory checks after release:

- focused renderer tests;
- `pnpm typecheck`
- `pnpm lint`
- `pnpm test` or a justified focused subset plus integration tests;
- screenshot or smoke of delivery selection, as packet 012 requires when UI is
  altered;
- `pnpm smoke:visual` and/or `pnpm smoke:electron-ui` if the existing harness is
  applicable;
- independent review and visual review.

### F6E2D - Saved Reusable Delivery Models

Status: blocked/deferred.

Goal:

- only after delivery formats and guided UI stabilize, add local-first saved
  delivery models for fields, tabs, format and organization.

Blocked until:

- runtime selection is integrated;
- IPC/preload contract is integrated;
- renderer guided customization is integrated and verified;
- a separate storage/versioning contract is approved.

Explicitly not allowed yet:

- persistence;
- edit/delete/import/export/share models;
- cloud/account behavior;
- license or entitlement gates;
- coupling delivery models to provider, speed, confirmation or failure policy.

## Dependencies Ready

Ready from prior waves:

- F6A/F6B/F6C/F6D are integrated and validated.
- F6D wired process CSV runtime core without templates, IPC/renderer or
  provider changes.
- F6E scope review was accepted as docs-only and released only F6E1.
- F6E1 is integrated and validated as export contract/helper-only.
- Wave 8 is closed with F6E1 and F7B integrated/validated.
- F7B hardening stayed inside Receita Web adapter-core and did not claim UI,
  provider factory/fallback or live smoke.

Still blocking UI:

- runtime does not yet select delivery by F6E1 delivery option id;
- IPC/preload do not expose delivery option selection;
- renderer still uses `deliveryFormat` and has only CSV/Excel selection;
- reusable delivery models have no storage/versioning contract;
- planned/disabled option metadata must not become executable or misleading.

## Collision Review

### F8A

No collision for F6E2A if it stays in `src/core/app/**` and tests. F8 is
distribution/update/commercial docs-only and release/update remains explicitly
blocked here. Do not add paywall, license checks, entitlement, telemetry,
diagnostics, auto-update, package metadata or commercial gating.

### F7

No collision for F6E2A if provider surfaces remain untouched. F7/F7B own
Receita Web assisted behavior and adapter-core hardening. F6E2 must not touch
`src/core/simples/**`, provider factory/fallback, provider catalog/health,
browser automation, live Receita Web smoke or provider copy.

### Provider Boundaries

No provider-boundary collision if delivery option selection remains after
lookup results exist and does not affect provider selection, speed,
confirmation policy or failure policy. Stop if a delivery option changes which
provider runs, how fast it runs, whether Receita Web is used, how fallback works
or how failures are classified.

### Shared App/IPC/Renderer Boundaries

F6E2A must not touch `src/main/**` or `src/renderer/**`. F6E2B and F6E2C should
not run concurrently because the renderer will consume the bridge contract.

## Stop Conditions

Return `blocked` or `needs_rework` before implementation if:

- any required document is missing again;
- the worker needs to change IPC/preload/renderer to make runtime selection
  meaningful;
- the worker needs to modify `src/core/export/**` beyond consuming F6E1 helpers;
- the worker needs provider, Receita Web, ingestion, fallback, release/update,
  backend remoto, banco, PDF/OCR, package/lockfile or `state.yaml` changes;
- runtime selection would make planned/disabled options executable;
- UI copy or metadata would imply PDF, JSON, formatted Excel, saved models or
  guided customization are ready;
- delivery models become coupled to execution models, providers, speed,
  confirmation or failure policy;
- CSV default behavior or current XLSX behavior regresses;
- cancellation, progress, resume or autosave behavior loses coverage;
- the worktree dirty state makes it impossible to attribute only the allowed
  files.

## Risks

- `process-csv.types.ts` is a shared public type surface. Prefer keeping F6E2A
  internal unless an additive type is necessary.
- Current IPC/preload and renderer still use `deliveryFormat`; adding
  `deliveryOptionId` in UI before runtime/bridge validation would create an
  unstable product promise.
- Planned/disabled labels from F6E1 include PDF/JSON. They are acceptable as
  metadata only, but any user-facing UI must render them as unavailable.
- Harness warnings `magic_string_boundary=29` and `visual_surface_change=1`
  are broader worktree warnings. This docs-only review does not change visual
  surfaces; F6E2A should centralize new literals in the core/app delivery
  selection helper or consume F6E1 constants.
- The worktree is broadly dirty from prior integrated or parallel phase work.
  The next worker must attribute only its allowed files and avoid cleanup.

## Checks Run For This Review

- Required-file presence check: pass.
- Read-only inspection of required docs and code surfaces: pass.
- No executable tests were run because this is a docs-only scope review.

## Required Check For This Receipt

- `git diff --check -- docs/goals/fiscal-desk-orchestration/results/phase-6e2-delivery-runtime-ui-scope-review.md`

## Recommended Prompt For Next Subagent

```text
/goal
Execute F6E2A delivery-runtime-selection for Fiscal Desk.

Context:
- F6E1 export contract is integrated and validated.
- This is the smallest next owner window after Wave 8.
- Implement runtime-only delivery option selection in `src/core/app/**`.
- Do not touch IPC/preload, renderer, providers, Receita Web, export contract,
  ingestion, release/update, backend remoto, banco, PDF/OCR, package/lockfile,
  state.yaml, stage, commit, push or PR.

Read:
- AGENTS.md
- docs/goals/fiscal-desk-orchestration/goal.md
- docs/goals/fiscal-desk-orchestration/state.yaml
- docs/goals/fiscal-desk-orchestration/subagent-registry.md
- docs/goals/fiscal-desk-orchestration/integration-plan.md
- docs/goals/fiscal-desk-orchestration/phases/phase-6-ingestao-entrega.md
- docs/goals/fiscal-desk-orchestration/results/phase-6e-output-templates-scope-review.md
- docs/goals/fiscal-desk-orchestration/results/phase-6e-output-templates-scope-review-judge-decision.md
- docs/goals/fiscal-desk-orchestration/results/phase-6e-output-templates-implementation.md
- docs/goals/fiscal-desk-orchestration/results/phase-6e-output-templates-implementation-judge-decision.md
- docs/goals/fiscal-desk-orchestration/results/integration-wave-8-f6e1-f7b.md
- docs/fiscal-desk/executor-packets/012-output-customization-templates.md
- docs/fiscal-desk/product-spec.md
- docs/adr/0018-formato-de-entrega-escolhido-pelo-usuario.md
- docs/adr/0019-saida-personalizada-guiada.md
- docs/adr/0020-modelos-reutilizaveis-de-entrega.md
- docs/adr/0021-modelos-de-execucao-separados-de-modelos-de-entrega.md
- src/core/export/export-contract.ts
- src/core/export/export-artifacts.ts
- src/core/app/process-csv.types.ts
- src/core/app/process-csv.use-case.ts
- src/core/app/process-csv-delivery.ts

Allowed writes:
- src/core/app/process-csv.use-case.ts
- src/core/app/process-csv-delivery.ts
- src/core/app/process-csv.types.ts only if a narrow additive runtime type is
  required
- test/integration/process-csv.use-case.test.ts
- test/integration/process-csv-cancel.test.ts only if cancellation/resume is
  affected
- test/unit/process-csv-contracts.test.ts
- new focused unit tests under test/unit/** only for runtime delivery selection
- docs/goals/fiscal-desk-orchestration/results/phase-6e2-delivery-runtime-ui-implementation.md

Implement:
- consume F6E1 delivery option validation in runtime delivery selection;
- keep existing deliveryFormat behavior as backward-compatible input;
- default to current CSV/preserve-columns behavior;
- allow only current CSV and current XLSX options to generate output;
- reject unknown, planned, disabled or artifact-less option ids;
- do not make UI/IPC claims and do not persist delivery models.

Checks:
- pnpm exec vitest run test/integration/process-csv.use-case.test.ts test/unit/process-csv-contracts.test.ts test/unit/fiscal-export-artifacts.test.ts test/unit/fiscal-desk-phase-6-contracts.test.ts
- include test/integration/process-csv-cancel.test.ts if cancellation/resume was touched
- pnpm typecheck
- pnpm lint
- git diff --check -- <changed files>
- independent review for material runtime diff

Stop if runtime selection requires IPC/preload/renderer/provider/export-contract
changes, planned/disabled options become executable, CSV/XLSX regress, or dirty
worktree attribution is unclear.
```

## Completion Statement

F6E2 is not complete. This receipt approves only F6E2A as the next candidate.
IPC/preload/types, renderer guided customization and saved reusable delivery
models remain separate blocked gates.

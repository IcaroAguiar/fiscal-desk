# P3 Renderer Missing Column Normalizer Dispatch

Data: 2026-06-13 17:32:52 -03
Status: `dispatched_material_pending_thread`
Judge thread: `019ebe5c-3853-79c2-87ad-8ddace386c93`
Target branch: `feat/fiscal-desk-local-base-prep`
Target min commit: `032d563`

## Objective

Executar a owner window material
`p3_renderer_missing_column_normalizer_can_hide_new_core_guidance`.

O objetivo e alinhar a normalizacao de mensagem do renderer para que a UI
Electron nao esconda a orientacao nova emitida pelo core quando a coluna CNPJ
nao e encontrada.

## Source Decisions

- Scope selection:
  `results/post-csv-input-intake-next-owner-window-selection-2026-06-13.md`
- Judge decision:
  `results/post-csv-input-intake-next-owner-window-selection-judge-decision-2026-06-13.md`
- Previous integration:
  `results/post-local-base-regate-csv-input-intake-hardening-integration-judge-decision-2026-06-13.md`

## Allowed Write

- `src/renderer/ui/app-helpers.ts`
- `test/unit/app-helpers.test.ts`
- `docs/goals/fiscal-desk-orchestration/results/p3-renderer-missing-column-normalizer-can-hide-new-core-guidance-2026-06-13.md`

## Do Not Touch

- `src/core/**`
- `src/main/**`
- `src/preload/**`
- `src/core/simples/**`
- `src/core/export/**`
- `src/core/public-base/**`
- `src/renderer/ui/app-view.ts`
- `src/renderer/ui/app-sync.ts`
- `src/renderer/ui/app.types.ts`
- `src/renderer/ui/operational-copy.ts`
- `src/renderer/styles.css`
- `test/integration/**`
- qualquer `test/unit/**` exceto `test/unit/app-helpers.test.ts`
- `package.json`
- `pnpm-lock.yaml`
- `electron-builder.yml`
- `.github/**`
- `docs/fiscal-desk/**`
- `docs/adr/**`
- `docs/goals/fiscal-desk-orchestration/state.yaml`
- `docs/goals/fiscal-desk-orchestration/integration-plan.md`
- release/package config, updater, diagnostics, telemetry, license/account,
  storage/network, templates/modelos reutilizaveis, PDF/Word/OCR, Receita Web
  live/massiva, Base Publica Local/preparo/consentimento.

## Required Checks

- `git status --short --branch --untracked-files=all` before and after.
- `pnpm exec vitest run test/unit/app-helpers.test.ts`
- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`
- `git diff --check`
- `pnpm smoke:visual`

`pnpm smoke:electron-ui` is not required unless the worker touches app flow,
selectors, sync, IPC/preload or visible state beyond normalized message copy.

## Stop Conditions

- Any required edit outside the allowed write set.
- Need to change core, IPC, preload, provider, export, release, package,
  lockfile, CI or local ignored docs.
- Dirty worktree outside allowed write set that prevents safe attribution.
- Same failing signature twice without a new diagnosis.

## Required Output

The worker must write:

- `docs/goals/fiscal-desk-orchestration/results/p3-renderer-missing-column-normalizer-can-hide-new-core-guidance-2026-06-13.md`

The receipt must include status, files read/changed, diff summary, checks,
skipped checks, review need, residual risks and integration recommendation.

Independent review is required before integration.

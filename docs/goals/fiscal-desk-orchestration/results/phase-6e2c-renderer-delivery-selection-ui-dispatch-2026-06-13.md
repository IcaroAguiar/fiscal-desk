# Phase 6E2C Renderer Delivery Selection UI Dispatch

Date: 2026-06-13 14:26 -03
Judge: Codex primary orchestrator
Status: `dispatched_pending_result`

## Owner Window

`f6e2c_renderer_delivery_selection_ui`

## Thread

- Thread: `019ec204-2c67-7f92-84d6-c9433bd84a0c`
- Worktree: `/Users/icaroaguiar/.codex/worktrees/634f/consulta-simples-csv`
- Model: GPT-5.5
- Reasoning: medium

## Reason For Dispatch

The first release rebaseline was accepted by the judge and recommended
`f6e2c_renderer_delivery_selection_ui` as the next material owner window.

Before dispatch, the judge confirmed that the current renderer already has a
`data-field="delivery-format"` select with CSV/XLSX options, and that
`scripts/smoke-electron-ui.ts` exercises XLSX. Therefore the worker was
explicitly instructed to audit first and produce a no-code candidate if the
current implementation already satisfies the objective.

## Scope

Objective: validate and, only if a real gap remains, adjust the renderer UI so
the current CSV/XLSX delivery selection/state is clear and honest without
promising templates, reusable models, PDF/Word/OCR, auto-update, telemetry,
diagnostics, license/account behavior or release/package work.

Allowed writes:

- `src/renderer/ui/app-view.ts`
- `src/renderer/ui/app.ts`
- `src/renderer/ui/app-sync.ts`, only if sync is required
- `src/renderer/ui/app.types.ts`, only if local typing is required
- `test/unit/app-view.test.ts`
- `test/unit/app-sync.test.ts`, only if sync is touched
- `docs/goals/fiscal-desk-orchestration/results/phase-6e2c-renderer-delivery-selection-ui.md`

Do not touch:

- `src/main/**`
- `src/core/**`
- `src/main/preload.ts`
- IPC/preload contracts
- providers
- ingestion/export core
- update/release
- telemetry
- diagnostics
- license/account
- storage/network
- package/lock/config files
- `.github/**`
- `docs/fiscal-desk/**`
- orchestration `state.yaml` or `integration-plan.md`
- stage, commit, push, PR, deploy or release

## Required Checks

- `pnpm exec vitest run test/unit/app-view.test.ts`
- `pnpm exec vitest run test/unit/app-sync.test.ts` if `app-sync.ts` changes
- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`
- `pnpm build`
- `pnpm smoke:visual`
- `pnpm smoke:electron-ui`
- `FISCAL_DESK_SMOKE_PROVIDER=base-publica-local pnpm smoke:electron-ui` if
  the change can affect Base Publica Local/prep/consent/shared runtime state
- `git diff --check -- <changed files>`
- `git status --short --branch --untracked-files=all`

## Stop Conditions

- The fix requires touching IPC/preload, main, core, provider, export,
  package/lock, release/update, telemetry, diagnostics, license/account or
  storage/network.
- The worker would need to promise templates, reusable models, PDF/Word/OCR,
  auto-update, telemetry, diagnostics, license/account behavior or release.
- Electron smoke or visual smoke cannot run and no concrete blocker/risk is
  documented.

No acceptance is implied by this dispatch. The worker result remains candidate
until judge review.

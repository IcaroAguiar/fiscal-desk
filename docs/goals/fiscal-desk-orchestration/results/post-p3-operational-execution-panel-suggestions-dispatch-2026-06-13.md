# Post P3 Operational Execution Panel Suggestions Dispatch

Data: 2026-06-13
Orquestrador/Judge: `019ebe5c-3853-79c2-87ad-8ddace386c93`
Branch canonica: `feat/fiscal-desk-local-base-prep`
Target commit minimo: `231686b docs: close post-ratchet readiness review`
Status: `prepared_for_codex_app_thread`

## Owner Window

`post_p3_operational_execution_panel_suggestions`

## Mission Card

Routing decision: `delegated`.

Intended role: `high-writer`.

Runtime role/adapter: Codex App project worktree with `/goal`, model
`gpt-5.5`, reasoning `medium`.

Reason for delegation: this is a bounded material renderer slice after the
post-ratchet readiness gate. It should be implemented in an isolated worktree
and judged before integration into the canonical branch.

Mandatory closeout gates: focused tests, typecheck, lint, full tests, build,
visual smoke, Electron smoke, independent reviewer after worker result and
judge integration only after the receipt is accepted.

## Objective

Implement the next material slice from packet `010`:

- make the execution panel more operationally honest for real runs;
- show ETA/progress/failures/blockers/last-save state using existing renderer
  state and already-integrated execution/progress signals;
- add assisted suggestions only when existing signals justify them;
- keep notifications non-interruptive;
- avoid technical logs as the main user surface.

This owner window is intentionally renderer-local. If the worker concludes that
new IPC/preload/main/core signals are required, it must stop with a blocker
instead of expanding scope.

## Required Context

Read before editing:

- `AGENTS.md`
- `CONTEXT.md`
- `docs/goals/fiscal-desk-orchestration/goal.md`
- `docs/goals/fiscal-desk-orchestration/state.yaml`
- `docs/goals/fiscal-desk-orchestration/integration-plan.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-large-file-ratchet-rework-final-readiness-review-judge-decision-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-integrated-validation-large-file-ratchet-rework-integration-judge-decision-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/phase-6e2c-renderer-delivery-selection-ui-judge-decision-2026-06-13.md`
- `docs/fiscal-desk/executor-packets/010-execution-dashboard-notifications.md`
- `.visual-fidelity/visual-spec.md`
- `.visual-fidelity/component-map.json`
- `src/renderer/ui/app-view.ts`
- `src/renderer/ui/app-sync.ts`
- `src/renderer/ui/app-helpers.ts`
- `src/renderer/ui/operational-copy.ts`
- `src/renderer/ui/app-view-lists.ts`

## Allowed Writes

Only these paths:

- `src/renderer/ui/app-view.ts`
- `src/renderer/ui/app-sync.ts`
- `src/renderer/ui/app-refs.ts`
- `src/renderer/ui/app-helpers.ts`
- `src/renderer/ui/operational-copy.ts`
- `src/renderer/ui/app-view-lists.ts`
- `src/renderer/styles.css`
- `test/unit/renderer-operational-copy.test.ts`
- `test/unit/app-view.test.ts`
- `test/unit/app-helpers.test.ts`
- `test/unit/app-sync.test.ts`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-operational-execution-panel-suggestions-2026-06-13.md`

## Do Not Touch

- `src/main/**`
- `src/core/**`
- `src/main/preload.ts`
- IPC/preload contracts
- providers and provider adapters
- ingestion/export core
- release/update/package/signing/notarization
- diagnostics generation/sending
- telemetry
- license/account behavior
- storage/network/backend
- reusable templates or saved delivery models
- PDF/Word/OCR real behavior
- Receita Web live/massiva or automatic fallback
- `package.json`
- `pnpm-lock.yaml`
- `electron-builder.yml`
- `.github/**`
- `docs/fiscal-desk/**`
- orchestration `state.yaml` or `integration-plan.md`
- stage, commit, push, PR, deploy or release

## Acceptance Criteria

- The user can understand execution progress, ETA uncertainty, current item,
  checkpoint/resume state, last output/save state and visible blockers without
  reading technical logs.
- Item-level failures and systemic execution blockers are visually and
  semantically separated when the existing state allows that distinction.
- Suggestions are assisted and conditional, not noisy or interruptive.
- ETA copy does not promise exact timing.
- Existing CSV/XLSX delivery selection continues to work and is not reframed as
  templates, reusable models or future formats.
- No new runtime contract, provider behavior or persistence model is introduced.
- The worker receipt states whether the implementation is complete or blocked,
  and why.

## Required Checks

Run, unless blocked by environment with concrete evidence:

- `pnpm exec vitest run test/unit/renderer-operational-copy.test.ts test/unit/app-view.test.ts test/unit/app-helpers.test.ts test/unit/app-sync.test.ts`
- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`
- `pnpm build`
- `pnpm smoke:visual`
- `pnpm smoke:electron-ui`
- `FISCAL_DESK_SMOKE_PROVIDER=base-publica-local pnpm smoke:electron-ui`
- `git diff --check -- <changed files>`
- `git status --short --branch --untracked-files=all`

## Stop Conditions

- The implementation needs IPC/preload, main, core, provider, ingestion/export,
  package/lock, release/update, telemetry, diagnostics, license/account,
  storage/network, reusable templates/models, PDF/Word/OCR or Receita Web
  live/massiva.
- The worker cannot run Electron smoke or visual smoke and cannot provide a
  precise blocker plus residual risk.
- The worker needs to create a new provider/fallback policy, change provider
  health semantics or make Receita Web automatic/massive.
- The worker would need to stage, commit, push, open PR, deploy, publish or
  release.

## Receipt Format

Write only:

`docs/goals/fiscal-desk-orchestration/results/post-p3-operational-execution-panel-suggestions-2026-06-13.md`

The receipt must include:

- `Status: ready_for_judge_review`, `Status: no_code_ready_for_judge_review` or
  `Status: blocked`;
- observed HEAD and worktree path;
- files read;
- files changed;
- commands run and pass/fail;
- behavioral summary of the panel/suggestions;
- screenshots or visual smoke output path if produced;
- checks skipped and why;
- risks/residual assumptions;
- explicit statement that the result is candidate-only and needs judge review.

No acceptance is implied by this dispatch.

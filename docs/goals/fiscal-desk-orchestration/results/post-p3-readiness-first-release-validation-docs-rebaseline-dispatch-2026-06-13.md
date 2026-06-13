# Dispatch - Post P3 Readiness First Release Validation Docs Rebaseline

Date: 2026-06-13
Dispatch status: `prepared_pending_thread`
Owner: judge/orchestrator `019ebe5c-3853-79c2-87ad-8ddace386c93`
Model requirement: `gpt-5.5`
Reasoning requirement: `medium`
Branch: `feat/fiscal-desk-local-base-prep`
Target minimum commit: `6807684`

## Purpose

Rebaseline `docs/qa/first-release-validation.md` so the first-release
validation criteria match the post-P3 first-release cut and integrated coverage
gate.

This is a docs-only window. No code, test, release, package, workflow, builder
config, dist, publish, deploy, telemetry, diagnostic sending, updater,
license/account or external side effect is released by this dispatch.

## Ready-To-Send Goal

```text
/goal Execute docs-only validation-doc rebaseline `post_p3_readiness_first_release_validation_docs_rebaseline` for Fiscal Desk.

You are running as an independent Codex App thread/worktree. The current thread is the judge/orchestrator and will decide whether to accept your receipt. Do not self-approve. Do not implement code.

Use model `gpt-5.5` and reasoning `medium`. Use Portuguese-BR in the receipt.

Canonical branch: `feat/fiscal-desk-local-base-prep`.
Judge/orchestrator thread: `019ebe5c-3853-79c2-87ad-8ddace386c93`.
Target minimum commit: `6807684`.

Read first:
- `AGENTS.md`
- `docs/goals/fiscal-desk-orchestration/goal.md`
- `docs/goals/fiscal-desk-orchestration/state.yaml`
- `docs/goals/fiscal-desk-orchestration/integration-plan.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-readiness-first-release-validation-docs-rebaseline-dispatch-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-rebaseline-readiness-next-owner-window-selection-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-rebaseline-readiness-next-owner-window-selection-judge-decision-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-rebaseline-first-release-readiness-review-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-rebaseline-first-release-readiness-review-judge-decision-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/testing-infra-coverage-gate-canonical-integration-2026-06-13.md`
- recent receipts for P3 renderer, CSV input intake hardening, Base Publica Local re-gate, F8B1, F6E2C, coverage gate and release/security reviews.

If `docs/fiscal-desk/**` is absent in your worktree, use the canonical absolute copy under `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/fiscal-desk/**` for read-only inspection. Record the limitation, but do not block automatically unless both local and canonical copies are unavailable.

Task:
1. Rebaseline only `docs/qa/first-release-validation.md` so it matches the post-P3 first-release cut and the integrated coverage gate.
2. Remove stale language saying coverage is warning-only because the project does not generate `coverage/lcov.info`.
3. Preserve the distinction that coverage is a regression signal, not functional proof; Electron/visual/CSV smokes remain qualitative obligations by touched surface.
4. Do not mark release, update real, diagnostic sending, telemetry, license/account, templates/modelos, PDF/Word/OCR or Receita Web live/massiva as available.
5. Do not run tests, build, smokes, coverage, dist, publish, deploy, signing, notarization or external side effects in this docs-only window.
6. Return a Portuguese-BR receipt with status exactly one of `ready_for_judge_review`, `needs_more_info`, or `blocked`.

Allowed write only:
- `docs/qa/first-release-validation.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-readiness-first-release-validation-docs-rebaseline-2026-06-13.md`

Forbidden writes:
- `src/**`
- `test/**`
- `docs/fiscal-desk/**`
- `docs/adr/**`
- `package.json`
- `pnpm-lock.yaml`
- `.github/**`
- `electron-builder.yml`
- `docs/goals/fiscal-desk-orchestration/state.yaml`
- `docs/goals/fiscal-desk-orchestration/integration-plan.md`
- `dist/**`
- `dist-electron/**`
- `release/**`
- any file outside the allowed write set
- stage, commit, push, PR, deploy, publish, dist, signing, notarization, updater, telemetry, diagnostic sending, release, packaging distribution or any external side effect

Read-only checks expected:
- `git status --short --branch --untracked-files=all`
- `git log -1 --oneline`
- proportional `rg` scans over `docs/qa/first-release-validation.md`, `docs/goals/fiscal-desk-orchestration`, `docs/fiscal-desk` if present or the canonical absolute copy, and recent receipts for `coverage`, `lcov`, `coverage-summary`, `warning-only`, `smoke:electron-ui`, `smoke:visual`, `smoke:real-csv`, `test:coverage`, `release`, `publish`, `dist`, `update`, `diagnostico`, `telemetria`, `licenca`, `templates`, `PDF`, `Word`, `OCR`, `Receita Web`, `Base Publica`, `F8B1`, `F6E2C`, `P3`, `CSV`.
- `git diff --check -- docs/qa/first-release-validation.md docs/goals/fiscal-desk-orchestration/results/post-p3-readiness-first-release-validation-docs-rebaseline-2026-06-13.md` after writing.

End final message with `ready_for_judge_review` and the receipt path if successful.
```

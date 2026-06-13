# Dispatch - Post P3 Rebaseline Readiness Next Owner Window Selection

Date: 2026-06-13
Dispatch status: `prepared_pending_thread`
Owner: judge/orchestrator `019ebe5c-3853-79c2-87ad-8ddace386c93`
Model requirement: `gpt-5.5`
Reasoning requirement: `medium`
Branch: `feat/fiscal-desk-local-base-prep`
Target minimum commit: `51e2aa4`

## Purpose

Select exactly one next owner window after the post-P3 first-release readiness
review was accepted by the judge.

No material worker is released by this dispatch.

## Ready-To-Send Goal

```text
/goal Execute read-only owner-window selection `post_p3_rebaseline_readiness_next_owner_window_selection` for Fiscal Desk.

You are running as an independent Codex App thread/worktree. The current thread is the judge/orchestrator and will decide whether to release any worker after reading your receipt. Do not self-approve. Do not implement code.

Use model `gpt-5.5` and reasoning `medium`. Use Portuguese-BR in the receipt.

Canonical branch: `feat/fiscal-desk-local-base-prep`.
Judge/orchestrator thread: `019ebe5c-3853-79c2-87ad-8ddace386c93`.
Target minimum commit: `51e2aa4`.

Read first:
- `AGENTS.md`
- `docs/goals/fiscal-desk-orchestration/goal.md`
- `docs/goals/fiscal-desk-orchestration/state.yaml`
- `docs/goals/fiscal-desk-orchestration/integration-plan.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-rebaseline-readiness-next-owner-window-selection-dispatch-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-rebaseline-first-release-readiness-review-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-rebaseline-first-release-readiness-review-judge-decision-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-first-release-status-rebaseline-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-first-release-status-rebaseline-judge-decision-2026-06-13.md`
- recent receipts for P3 renderer, CSV input intake hardening, Base Publica Local re-gate, F8B1, F6E2C, coverage gate, release/security and post-rework reviews.

If `docs/fiscal-desk/**` is absent in your worktree, use the canonical absolute copy under `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/fiscal-desk/**` for read-only inspection. Record the limitation, but do not block automatically unless both local and canonical copies are unavailable.

Task:
1. Confirm queue state after the post-P3 first-release readiness review was accepted.
2. Recommend exactly one next owner window, or return `blocked` / `needs_more_info` if no safe slice can be isolated.
3. Classify the recommended window as material, docs-only, read-only gate, release/security review, or blocked.
4. Define exact allowed write set, do-not-touch set, affected shared boundaries, dependency/collision analysis, checks, review need, residual risks and stop conditions.
5. If status is `approved_scope_candidate`, include a ready-to-send `/goal` prompt for the next thread using `gpt-5.5` and `medium`.
6. Do not select a broad release/distribution execution window unless it can be strictly scoped without dist, publish, signing, notarization, updater, telemetry, diagnostic sending, license/account behavior or external side effects.

Allowed write only:
- `docs/goals/fiscal-desk-orchestration/results/post-p3-rebaseline-readiness-next-owner-window-selection-2026-06-13.md`

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
- any file outside the single allowed receipt path
- stage, commit, push, PR, deploy, publish, dist, signing, notarization, updater, telemetry, diagnostic sending, release, packaging distribution or any external side effect

Read-only checks expected:
- `git status --short --branch --untracked-files=all`
- `git log -1 --oneline`
- proportional `rg` scans over `docs/goals/fiscal-desk-orchestration`, `docs/fiscal-desk` if present or the canonical absolute copy, package/workflow/builder config, and recent receipts for `next owner`, `blocked`, `release`, `publish`, `dist`, `update`, `diagnostico`, `telemetria`, `licenca`, `templates`, `PDF`, `Word`, `OCR`, `Receita Web`, `Base Publica`, `F8B1`, `F6E2C`, `P3`, `CSV`.
- `git diff --check -- docs/goals/fiscal-desk-orchestration/results/post-p3-rebaseline-readiness-next-owner-window-selection-2026-06-13.md` after writing the receipt.

Receipt final status must be exactly one of: `approved_scope_candidate`, `needs_more_info`, `blocked`.

End final message with `ready_for_judge_review` and the receipt path.
```

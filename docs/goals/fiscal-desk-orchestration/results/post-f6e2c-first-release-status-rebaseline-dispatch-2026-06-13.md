# Post-F6E2C First Release Status Rebaseline Dispatch - 2026-06-13

Status: `dispatched_docs_only_active`

Dispatched at: `2026-06-13 14:49:57 -03`

Pending worktree id: `local:0c8fedac-afcc-4bcd-adf9-c52b16048627`

Thread id: `019ec21a-b297-7402-96f8-cf3eb791aa93`

Thread title: `Atualiza status do primeiro release`

Worktree: `/Users/icaroaguiar/.codex/worktrees/2c9e/consulta-simples-csv`

## Purpose

Open the next docs-only owner window accepted by the judge after
`post_f6e2c_next_owner_window_selection`.

F6E2C has already closed as `approved_by_judge_no_code`, but local product docs
still recommend F6E2C as the next owner window. This window must remove that
stale guidance before any release/security review or material worker is
released.

## Scope

Owner window: `post_f6e2c_first_release_status_rebaseline`.

Classification: docs-only.

No source, tests, package manager, release configuration, PR, deploy or release
work is released by this dispatch.

## Model

- Model: `gpt-5.5`
- Reasoning: `medium`

## Allowed Writes

- `docs/fiscal-desk/first-release.md`
- `docs/fiscal-desk/status.md`
- `docs/fiscal-desk/product-spec.md`, only if needed to remove stale delivery
  pending-decision language
- `docs/goals/fiscal-desk-orchestration/results/post-f6e2c-first-release-status-rebaseline-2026-06-13.md`

## Do Not Touch

- `src/**`
- `test/**`
- `package.json`
- `pnpm-lock.yaml`
- `electron-builder.yml`
- `.github/**`
- release/package config
- `docs/adr/**`
- `docs/goals/fiscal-desk-orchestration/state.yaml`
- `docs/goals/fiscal-desk-orchestration/integration-plan.md`
- stage, commit, push, PR, deploy or release

## Required Outcome

- Replace stale guidance that says F6E2C is the current next owner window.
- Record F6E2C as accepted no-code.
- Record no active material worker.
- Recommend `first_release_candidate_release_security_review` as the next
  read-only gate after this rebaseline is judged.
- Keep update, diagnostic, telemetry, license/account, release/package,
  storage/network, templates, reusable models, PDF/Word/OCR and Receita Web
  live/mass automation blocked until separate owner windows.
- Preserve coverage as a quantitative signal, not functional proof.

## Judge Gate

No material worker is released by this dispatch. The main judge must read and
accept the rebaseline receipt before release/security review or any material
worker can be dispatched.

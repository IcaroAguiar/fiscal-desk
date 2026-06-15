# Post-F6E2C Next Owner Window Selection Dispatch - 2026-06-13

Status: `dispatched_docs_only_active`

Dispatched at: `2026-06-13 14:43:02 -03`

Pending worktree id: `local:19734829-daaa-4a4a-b875-c5ba8ed4a823`

Thread id: `019ec213-dd46-7202-a1fd-5747d3376844`

Thread title: `Definir próxima owner window`

Worktree: `/Users/icaroaguiar/.codex/worktrees/3316/consulta-simples-csv`

## Purpose

Open a docs-only scope review after F6E2C closed as no-code. The first-release
docs still recommend F6E2C as the next owner window, so a fresh selection gate is
required before any new material worker can be released.

## Scope

Owner window: `post_f6e2c_next_owner_window_selection`.

This is a planning/scope-review thread only. It must recommend the next owner
window, classify whether it is docs-only/material/security-review/release-review,
and provide exact allowed writes, blocked surfaces, checks, stop conditions and
parallelization rules.

## Model

- Model: `gpt-5.5`
- Reasoning: `medium`

## Allowed Write

- `docs/goals/fiscal-desk-orchestration/results/post-f6e2c-next-owner-window-selection-2026-06-13.md`

## Do Not Touch

- `src/**`
- `test/**`
- `package.json`
- `pnpm-lock.yaml`
- `.github/**`
- `electron-builder.yml`
- release/package config
- `docs/fiscal-desk/**`
- `docs/adr/**`
- `docs/goals/fiscal-desk-orchestration/state.yaml`
- `docs/goals/fiscal-desk-orchestration/integration-plan.md`
- stage, commit, push, PR, deploy or release

## Required Read Set

The worker was instructed to read canonical absolute docs from
`/Users/icaroaguiar/dev/pessoal/consulta-simples-csv` if its new worktree does
not contain local ignored docs:

- `AGENTS.md`
- `docs/goals/fiscal-desk-orchestration/goal.md`
- `docs/goals/fiscal-desk-orchestration/state.yaml`
- `docs/goals/fiscal-desk-orchestration/integration-plan.md`
- `results/orchestration-observation-2026-06-13-1438.md`
- first-release rebaseline result and judge decision
- F6E2C result and judge decision
- `docs/fiscal-desk/first-release.md`
- `docs/fiscal-desk/status.md`
- `docs/fiscal-desk/roadmap.md`
- `docs/fiscal-desk/product-spec.md`
- `docs/fiscal-desk/implementation-plan.md`
- `docs/fiscal-desk/quality-gates.md`
- `docs/fiscal-desk/executor-packets/013-first-release-cut.md`
- relevant F6E/F6E2/F8A/F8B/Wave 13 scope and judge receipts if needed

## Required Questions

The receipt must answer:

- What is the recommended next owner window after F6E2C?
- Should it be docs-only, material, security-review, release-review or split?
- What is the exact allowed write set?
- Which surfaces remain blocked?
- Which qualitative and quantitative checks become mandatory if material?
- Can any window run concurrently without boundary collision?
- Does the stale F6E2C recommendation in local first-release/status docs require
  rebaseline before material work?
- What stop conditions should return `blocked` or `needs_rework`?

## Judge Gate

No new material worker is released by this dispatch. The main judge must read
the scope-review receipt and either accept a next owner window, request rework,
or keep the queue blocked.

# First Release Rebaseline Dispatch 2026-06-13

Status: `docs_only_owner_window_dispatched`

## Decision

The judge selected `first_release_rebaseline_after_integrated_fiscal_desk` as
the next owner window.

This is not a material Fiscal Desk feature worker. It is a docs-only scope to
reconcile the first-release and status documents with the current integrated
branch before any new feature implementation starts.

## Thread

- Thread: `019ec1f1-82b7-77d0-93ba-a85c07efacd8`
- Pending worktree: `local:4a4e90ae-c20e-4f13-b274-03331dcb8a0b`
- Worktree observed from Codex App: `/Users/icaroaguiar/.codex/worktrees/8bf3/consulta-simples-csv`
- Model: `gpt-5.5`
- Reasoning: `medium`
- Dispatched at: `2026-06-13 14:06:11 -03`

## Rationale

The canonical package is integrated and validated, but product-facing docs such
as `docs/fiscal-desk/status.md` and `docs/fiscal-desk/first-release.md` still
contain historical pre-Wave-13 framing. Releasing a material feature from those
docs would create scope ambiguity.

The safe next move is to rebaseline the first-release cut and recommend the
next material owner window with explicit boundaries.

## Allowed Writes

- `docs/fiscal-desk/first-release.md`
- `docs/fiscal-desk/status.md`
- `docs/fiscal-desk/roadmap.md`, only if macro sequence drift must be corrected
- `docs/fiscal-desk/product-spec.md`, only to align the availability matrix
- `docs/fiscal-desk/implementation-plan.md`, only to mark historical sections
- `docs/fiscal-desk/quality-gates.md`, only to reflect the integrated coverage
  policy
- `docs/fiscal-desk/executor-packets/013-first-release-cut.md`, only to correct
  its allowed-doc list for this rebaseline
- `docs/goals/fiscal-desk-orchestration/results/first-release-rebaseline-2026-06-13.md`

## Blocked Surfaces

- `src/**`
- `test/**`
- package/lockfile/build/release configuration
- `.github/**`
- ADR changes
- orchestration state/plan changes from the worker
- release/update real behavior
- telemetry real transport
- diagnostic package generation/sending
- license/account behavior
- storage/network expansion
- stage, commit, push, PR, deploy or release

## Required Result

The worker must return a receipt with status
`ready_for_judge_review | needs_rework | blocked`, the updated first-release
matrix, the recommended next owner window, checks run and residual risks.

## Judge Policy

No material worker is released while this docs-only owner window is active. The
next material worker may start only after this result is read, judged and, if
accepted, used to define a fresh exact scope.

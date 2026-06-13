# Phase 8A Scope Review Judge Decision

Date: 2026-06-13

## Status

`approved_by_judge_docs_only`

The F8A scope review is accepted as a documentation-only gate. It does not
approve UI-first update work. It approves only a core local contract worker for
update state, consent, telemetry allowlists and diagnostic package policy.

## Source

- Thread: `019ebfa8-32e5-7270-9407-ad7606bea554`
- Worktree: `/Users/icaroaguiar/.codex/worktrees/194e/consulta-simples-csv`
- Receipt: `results/phase-8a-local-update-diagnostic-contract-scope-review.md`

The first attempt blocked because local ignored docs were missing from the
thread worktree. The missing docs context was copied into the worktree, the goal
was resumed, and the substantive scope review was completed.

## Judge Notes

- The receipt correctly narrows F8A away from UI-first execution.
- The next executable worker must create a pure local contract in core code.
- The contract must be default-off, allowlist-based and unable to perform
  update, telemetry, network, diagnostic generation or release side effects.
- `security-reviewer` is required before judge acceptance of the material F8A
  implementation because the surface defines telemetry, diagnostic and consent
  boundaries.
- `release-reviewer` remains blocked until a future phase touches updater,
  channel, signature, metadata, packaging or release config.

## Approved Next Worker

`F8A local-update-diagnostic-consent-contract`

Allowed write scope for the worker:

- `src/core/app/fiscal-desk-local-contract.ts`
- `test/unit/fiscal-desk-local-contract.test.ts`
- `docs/goals/fiscal-desk-orchestration/results/phase-8a-local-update-diagnostic-contract.md`

Blocked write scope:

- `src/main/preload.ts`
- `src/main/main.ts`
- `src/main/ipc/**`
- `src/main/types.ts`, unless a later judge release explicitly accepts the
  type-only shared-boundary risk
- `src/renderer/**`
- `src/core/simples/**`
- `src/core/export/**`
- `src/core/ingestion/**`
- `docs/fiscal-desk/**`
- `docs/adr/**`
- `docs/goals/fiscal-desk-orchestration/state.yaml`
- package/lockfile, release config, updater, network, telemetry transport,
  diagnostic package generation, license enforcement, backend, database, PDF/OCR

## Checks Accepted For This Gate

- Scope receipt reviewed by judge.
- Receipt diff-check passed in the source worktree.
- No executable checks were required because this was docs-only and did not
  alter `src/**` or `test/**`.

Executable checks and independent security review become mandatory for the F8A
material worker.

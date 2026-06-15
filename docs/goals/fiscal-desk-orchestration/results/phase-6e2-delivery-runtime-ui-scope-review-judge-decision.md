# Phase 6E2 Scope Review Judge Decision

Date: 2026-06-13

## Status

`approved_by_judge_docs_only`

The F6E2 scope review is accepted as a documentation-only gate. It does not
approve the full delivery customization feature. It approves only the next
bounded worker: `F6E2A delivery-runtime-selection`.

## Source

- Thread: `019ebfa7-d70f-7283-955a-646d7736735d`
- Worktree: `/Users/icaroaguiar/.codex/worktrees/c6a2/consulta-simples-csv`
- Receipt: `results/phase-6e2-delivery-runtime-ui-scope-review.md`

The first attempt blocked because local ignored docs were missing from the
thread worktree. The missing docs context was copied into the worktree, the goal
was resumed, and the substantive scope review was completed.

## Judge Notes

- The receipt is coherent with F6A/F6B/F6C/F6D/F6E1 and keeps F6E2 split into
  runtime, IPC/preload, renderer, and saved-model subphases.
- The next executable change must be runtime-only and must preserve the existing
  `deliveryFormat` behavior.
- F6E2A may consume the F6E1 export contract/helper surface, but must not widen
  the F6E1 contract unless it returns `needs_rework`.
- IPC/preload, renderer UI, reusable delivery models, PDF/JSON execution,
  provider/fallback and Receita Web remain blocked.

## Approved Next Worker

`F6E2A delivery-runtime-selection`

Allowed write scope for the worker:

- `src/core/app/process-csv.use-case.ts`
- `src/core/app/process-csv-delivery.ts`
- `src/core/app/process-csv.types.ts`, only for narrow additive runtime typing
- `test/integration/process-csv.use-case.test.ts`
- `test/integration/process-csv-cancel.test.ts`, only if cancel/resume behavior
  is touched
- `test/unit/process-csv-contracts.test.ts`
- focused unit tests under `test/unit/**` only for runtime delivery selection
- `docs/goals/fiscal-desk-orchestration/results/phase-6e2-delivery-runtime-ui-implementation.md`

Blocked write scope:

- `src/core/export/**`
- `src/main/**`
- `src/renderer/**`
- `src/core/simples/**`
- `src/core/ingestion/**`
- scripts, styles, package/lockfile, product docs, ADRs, release/update

## Checks Accepted For This Gate

- Scope receipt reviewed by judge.
- Receipt diff-check passed in the source worktree.
- No executable checks were required because this was docs-only and did not
  alter `src/**` or `test/**`.

Executable checks become mandatory for F6E2A.

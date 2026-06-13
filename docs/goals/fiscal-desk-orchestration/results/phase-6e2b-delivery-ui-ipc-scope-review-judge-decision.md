# Phase 6E2B Scope Review Judge Decision

Date: 2026-06-13

## Status

`approved_by_judge_docs_only`

The F6E2B scope review is accepted as a documentation-only gate. It does not
approve renderer delivery UI, saved delivery models, templates UI or new output
formats. It approves only the next bounded worker:
`F6E2B delivery IPC/preload/types exposure`.

## Source

- Thread: `019ebfcf-32e0-79f3-a508-13b7044444e4`
- Worktree: `/Users/icaroaguiar/.codex/worktrees/2d55/consulta-simples-csv`
- Receipt:
  `results/phase-6e2b-delivery-ui-ipc-scope-review.md`

The first attempt blocked because local ignored docs were missing from the
thread worktree. The docs context was copied into the worktree, the goal was
resumed, and the missing-docs blocker was discarded after revalidation.

## Judge Notes

- The receipt is coherent with the already integrated F6E2A runtime selection.
- The next executable change must expose only current executable CSV/XLSX
  delivery selection through IPC/preload/types.
- Existing `deliveryFormat` behavior must stay backward compatible.
- Unknown, planned, disabled or artifact-less delivery ids must be rejected
  before provider/runtime behavior is affected.
- Renderer UI, templates UI, saved/reusable delivery models, provider behavior,
  Receita Web and release/update surfaces remain blocked.

## Approved Next Worker

`F6E2B delivery IPC/preload/types exposure`

Allowed write scope for the worker:

- `src/main/ipc/process-csv.ipc.ts`
- `src/main/preload.ts`
- `src/main/types.ts`
- `src/core/app/process-csv.types.ts`, only for narrow public bridge typing
- focused IPC/preload/process tests under `test/unit/**` or
  `test/integration/**`
- `docs/goals/fiscal-desk-orchestration/results/phase-6e2b-delivery-ui-ipc-implementation.md`

Blocked write scope:

- `src/renderer/**`
- `src/renderer/styles.css`
- `src/core/export/**`
- `src/core/ingestion/**`
- `src/core/simples/**`
- provider adapters, fallback and Receita Web behavior
- scripts, package/lockfile, release/update, diagnostics transport,
  product docs, ADRs and saved delivery model persistence

## Collision Decision

F6E2B owns `ipc_contracts`, `preload_bridge` and `process_csv_contracts` while
active. It must run before any worker that needs delivery renderer UI or shared
bridge changes.

F8B1 is approved as a future renderer-only blocked-state slice, but it is not
released concurrently in this judge window because the F6E2B receipt flags F8
UI/IPC/preload/renderer as a possible owner-window collision.

## Checks Accepted For This Gate

- Scope receipt reviewed by judge.
- Missing local docs recovery was recorded in the receipt.
- No executable checks were required because this was docs-only and did not
  alter `src/**` or `test/**`.

Executable checks and independent review are mandatory for the F6E2B material
worker.

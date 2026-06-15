# Phase 8B Scope Review Judge Decision

Date: 2026-06-13

## Status

`approved_by_judge_docs_only_queued`

The F8B scope review is accepted as a documentation-only gate. It does not
approve updater behavior, network, telemetry transport, diagnostic package
generation or release configuration. It approves a future renderer-only worker:
`F8B1 UI static/local blocked-state exposure`.

The material worker is queued behind F6E2B. It must not start until the current
F6E2B IPC/preload/types owner window is integrated or explicitly cleared by the
judge.

## Source

- Thread: `019ebfcf-32e0-79f3-a508-13ce650952b1`
- Worktree: `/Users/icaroaguiar/.codex/worktrees/63dc/consulta-simples-csv`
- Receipt:
  `results/phase-8b-local-update-diagnostic-ui-scope-review.md`

The first attempt blocked because local ignored docs were missing from the
thread worktree. The docs context was copied into the worktree, the goal was
resumed, and the missing-docs blocker was discarded after revalidation.

## Judge Notes

- The receipt correctly constrains F8B to a local blocked-state renderer slice.
- The UI may import the F8A contract directly instead of duplicating
  boundary-defining strings.
- The slice must remain non-persistent and must not call `main`, preload, IPC,
  network, updater, telemetry, diagnostic-generation or license flows.
- If F8B needs runtime state, consent persistence, preload/IPC or `src/main/**`,
  it must stop and return `needs_rework` for a new split with one owner.

## Approved Future Worker

`F8B1 UI static/local blocked-state exposure`

Allowed write scope for the future worker:

- `src/renderer/ui/app.types.ts`
- `src/renderer/ui/app-view.ts`
- `test/unit/app-view.test.ts`
- `docs/goals/fiscal-desk-orchestration/results/phase-8b-local-update-diagnostic-ui-implementation.md`

Conditional write, only if layout cannot remain professional otherwise:

- `src/renderer/styles.css`

Blocked write scope:

- `src/main/**`
- `src/main/preload.ts`
- `src/main/types.ts`
- `src/main/ipc/**`
- `src/core/app/fiscal-desk-local-contract.ts`
- `src/core/app/process-csv*`
- `src/core/ingestion/**`
- `src/core/export/**`
- `src/core/simples/**`
- package/lockfile, updater/release/signing config, product docs and ADRs

## Collision Decision

F8B1 is safe only as renderer-local work. It must not run while another worker
owns `src/renderer/ui/app-view.ts`, `src/renderer/ui/app.types.ts`,
`test/unit/app-view.test.ts` or `src/renderer/styles.css`.

F8B1 is intentionally not released in the same wave as F6E2B material work.
After F6E2B is integrated, the judge can release F8B1 if the canonical worktree
still has no renderer owner-window conflict.

## Checks Accepted For This Gate

- Scope receipt reviewed by judge.
- Missing local docs recovery was recorded in the receipt.
- No executable checks were required because this was docs-only and did not
  alter `src/**` or `test/**`.

Executable checks, visual evidence for CSS/layout changes, and independent
review are mandatory for the F8B1 material worker.

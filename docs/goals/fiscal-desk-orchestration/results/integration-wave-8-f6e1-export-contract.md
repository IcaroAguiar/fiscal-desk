# Integration Wave 8: F6E1 Export Contract

Updated: 2026-06-13

## Status

`partially_integrated_validated`

F6E1 was copied into the canonical branch `feat/fiscal-desk-local-base-prep`
after worker completion, independent review and judge validation. F7B remains
active and is not included in this receipt.

## Integrated Scope

- `src/core/export/export-contract.ts`
- `src/core/export/export-artifacts.ts`
- `test/unit/fiscal-export-artifacts.test.ts`
- `test/unit/fiscal-desk-phase-6-contracts.test.ts`
- `docs/goals/fiscal-desk-orchestration/results/phase-6e-output-templates-implementation.md`
- `docs/goals/fiscal-desk-orchestration/results/phase-6e-output-templates-implementation-judge-decision.md`

Not integrated from the F6E1 worker worktree:

- inherited dirty/untracked files from earlier phases;
- docs copied as read-only context under `docs/fiscal-desk/**` and `docs/adr/**`;
- any runtime, IPC/preload, renderer, provider, ingestion, Receita Web, script,
  package, release, backend, database, PDF/OCR or state-file changes.

## Canonical Validation

- `pnpm exec vitest run test/unit/fiscal-export-artifacts.test.ts test/unit/fiscal-desk-phase-6-contracts.test.ts`
  - pass, 2 files / 9 tests.
- `pnpm typecheck`
  - pass.
- `pnpm lint`
  - pass, 111 files.
- `git diff --check -- <F6E1 files>`
  - pass.

## Residual Risk

- This is a contract/helper-only slice. Runtime selection, IPC/preload payloads,
  renderer customization UI and saved delivery models remain separate gates.
- Planned and disabled delivery options, including PDF and JSON labels, are
  metadata only; the selection helper rejects them because they have no current
  executable artifact.
- The broader harness warnings `magic_string_boundary=29` and
  `visual_surface_change=1` remain worktree-level warnings. F6E1 centralizes
  delivery literals in `src/core/export` and does not touch visual surfaces.

## Next Gate

Continue monitoring F7B adapter-core hardening. Do not dispatch runtime/UI
template work until F7B is judged and the next non-colliding owner window is
selected.

# Integration Wave 6: F6D Runtime Wiring

Updated: 2026-06-13

## Status

`integrated_validated`

F6D runtime-core wiring was copied into the canonical branch
`feat/fiscal-desk-local-base-prep` after judge review.

## Integrated Scope

- `src/core/app/process-csv.use-case.ts`
- `src/core/app/process-csv-delivery.ts`
- `test/integration/process-csv.use-case.test.ts`
- `test/unit/process-csv-contracts.test.ts`
- `docs/goals/fiscal-desk-orchestration/results/phase-6d-runtime-wiring.md`
- `docs/goals/fiscal-desk-orchestration/results/phase-6d-runtime-wiring-judge-decision.md`

Not integrated from the worker worktree:

- inherited dirty changes already present in prior phases;
- `process-csv.types.ts`, which matched the canonical worktree;
- progress/cancel/resume test files, which matched the canonical worktree;
- any IPC/preload/renderer/provider/template changes.

## Canonical Validation

- `pnpm exec vitest run test/unit/fiscal-ingestion.test.ts test/unit/fiscal-export-artifacts.test.ts test/unit/fiscal-desk-phase-6-contracts.test.ts test/unit/process-csv-contracts.test.ts test/integration/process-csv.use-case.test.ts`
  - pass, 5 files / 22 tests.
- `pnpm exec vitest run test/integration/process-csv-progress.test.ts test/integration/process-csv-cancel.test.ts test/integration/process-csv-ledger-resume.test.ts`
  - pass, 3 files / 5 tests.
- `pnpm typecheck`
  - pass.
- `pnpm lint`
  - pass, 111 files.
- `pnpm test`
  - pass, 36 files / 214 tests.
- `pnpm smoke:real-csv`
  - pass, provider `mock`, 5 rows, 3 unique CNPJ lookups.
- `node docs/ai/quality-gate/check-ratchet.mjs`
  - pass with existing warnings for missing coverage, temporary
    `styles.css` large-file exception and non-enforced agentic review.
- `pnpm smoke:electron-ui`
  - pass, build + Electron smoke, provider `mock`, delivery `xlsx`,
    5 rows, 3 unique CNPJ lookups, 1 resumed lookup.
- `pnpm smoke:visual`
  - pass across desktop, tablet and mobile viewports, with no overflow, clipped
    buttons or overlaps.
- `git diff --check -- <F6D files>`
  - pass.

## Residual Risk

- The F6D runtime wiring intentionally keeps a double CSV parse as a
  transitional bridge. This should be revisited if performance work or larger
  CSV batches become part of the roadmap.
- The repository still has a broader harness warning unrelated to the F6D
  recorte: `magic_string_boundary=29`. The `visual_surface_change=1` warning is
  covered for this integrated state by the passing `pnpm smoke:visual` run.

## Next Gate

Do not dispatch template customization or F7B implementation until the next
judge decision confirms a non-colliding scope. IPC/preload/renderer/provider
surfaces remain blocked for this wave.

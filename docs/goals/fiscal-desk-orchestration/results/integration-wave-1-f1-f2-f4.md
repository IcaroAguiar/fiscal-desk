# Integration Wave 1: F1, F2 And F4

Updated: 2026-06-13

## Status

`integrated_validated`

Integration branch/worktree: `feat/fiscal-desk-local-base-prep`

## Integrated Phases

- F1 - Execution State Contracts
- F2 - Renderer Surface V5
- F4 - Provider Catalog Health Fallback

## Integration Method

The orchestrator copied only judge-approved files from each phase worktree into the single final worktree. Inherited renderer/docs/skills/state files from phase worktrees were excluded unless explicitly required by the approved package.

## Files Integrated From F1

- `src/core/app/process-csv.types.ts`
- `src/main/types.ts`
- `test/unit/process-csv-contracts.test.ts`

## Files Integrated From F2

- `scripts/smoke-visual-ui.ts`
- `scripts/visual-smoke-fixture.ts`
- `src/renderer/styles.css`
- `src/renderer/ui/app-sync.ts`
- `src/renderer/ui/app-view.ts`
- `src/renderer/ui/app-sync-reference.ts`
- `src/renderer/ui/app-view-lists.ts`

Other F2 renderer files already matched the final worktree and were not recopied.

## Files Integrated From F4

- `src/core/simples/simples-provider.catalog.ts`
- `src/core/simples/simples-provider.health.ts`
- `src/core/simples/simples-provider.fallback.ts`
- `src/core/simples/simples-provider.factory.ts`
- `src/core/simples/simples-provider.config.ts`
- `src/core/simples/adapters/cnpja-open-simples-lookup.adapter.ts`
- `test/unit/simples-provider.catalog.test.ts`
- `test/unit/simples-provider.health.test.ts`
- `test/unit/simples-provider.fallback.test.ts`
- `test/unit/cnpja-open-simples-lookup.retry.test.ts`

## Post-Integration Checks

- `pnpm exec vitest run test/unit/process-csv-contracts.test.ts test/unit/app-view.test.ts test/unit/renderer-operational-copy.test.ts test/unit/simples-provider.catalog.test.ts test/unit/simples-provider.fallback.test.ts test/unit/simples-provider.health.test.ts test/unit/cnpja-open-simples-lookup.retry.test.ts`: pass, 26 tests.
- `pnpm typecheck`: pass.
- `pnpm lint`: pass.
- `git diff --check`: pass.
- `pnpm test`: pass, 33 files and 200 tests.
- `node docs/ai/quality-gate/check-ratchet.mjs`: pass.
- `pnpm smoke:visual`: pass.
- `pnpm smoke:electron-ui`: pass, including build, provider `mock`, XLSX delivery, saved output, checkpoint, history count and resume text.

## Unblocked Work

- F3 can now start, but owns `process-csv`/IPC/preload while active.
- F5 can start in parallel with F3 only if restricted away from IPC/preload/factory/shared provider semantics.
- F6 remains blocked while F3 owns shared execution contracts.
- F7 remains blocked until provider/factory ownership is free or a contract-only task is explicitly scoped.

## Residual Risks

- Harness `magic_string_boundary=29` remains visible. F1 and F4 centralize contract literals; F2 still carries renderer selector/data-slot/copy literals.
- Harness `visual_surface_change=1` remains expected because F2 changed renderer surface; visual smoke passed.
- Ratchet warnings remain non-blocking: no coverage artifact, large `styles.css` exception until 2026-06-30, agentic review not enforced in CI.
- `docs/goals/fiscal-desk-orchestration/` is still untracked and should be intentionally staged later if this package is versioned.

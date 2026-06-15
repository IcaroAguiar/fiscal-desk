# Phase 6E2B - Delivery UI/IPC Implementation Review

Date: 2026-06-13

## Status

`needs_rework`

The narrow F6E2B IPC/preload/types implementation is technically sound in the
reviewed files, but the F6E2B worktree cannot be accepted as a clean candidate
because its active diff still contains blocked surfaces outside the approved
worker scope. No code changes, stage, commit, push or PR were performed by this
review.

## Review Scope

Reviewed F6E2B worktree:

- `/Users/icaroaguiar/.codex/worktrees/cb3c/consulta-simples-csv`

Mandatory files read in that worktree:

- `AGENTS.md`
- `docs/goals/fiscal-desk-orchestration/results/phase-6e2b-delivery-ui-ipc-implementation.md`
- `docs/goals/fiscal-desk-orchestration/results/phase-6e2b-delivery-ui-ipc-scope-review.md`
- `docs/goals/fiscal-desk-orchestration/results/phase-6e2b-delivery-ui-ipc-scope-review-judge-decision.md`
- `docs/goals/fiscal-desk-orchestration/results/integration-wave-11-scope-reviews.md`
- `src/core/app/process-csv.types.ts`
- `src/main/types.ts`
- `src/main/preload.ts`
- `src/main/ipc/process-csv.ipc.ts`
- `test/unit/process-csv.ipc.test.ts`
- `test/unit/preload.test.ts`
- `test/unit/process-csv-contracts.test.ts`

Additional files read to validate the delivery contract:

- `src/core/app/process-csv-delivery.ts`
- `src/core/export/export-contract.ts`

## Findings

### High - Worktree diff is not cleanly scoped to F6E2B

- **Impact:** the judge cannot independently confirm from the F6E2B worktree
  diff that this candidate avoids renderer, provider, ingestion/export,
  scripts, F8/update/network/release-adjacent surfaces. This violates the
  mandatory scope check unless the judge explicitly isolates only the allowed
  F6E2B files during integration.
- **Where:** `git diff --name-only` in
  `/Users/icaroaguiar/.codex/worktrees/cb3c/consulta-simples-csv` includes
  blocked paths such as `src/renderer/styles.css`,
  `src/renderer/ui/app.ts`, `src/core/simples/**`,
  `src/core/public-base/**`, `scripts/smoke-visual-ui.ts`,
  `test/integration/process-csv-cancel.test.ts` and several provider tests.
  `git status --short` also shows untracked `src/core/export/**`,
  `src/core/ingestion/**`, `src/renderer/**`, provider health/fallback files
  and F8/update-related orchestration docs.
- **Why this is a problem:** F6E2B was released only for
  `src/core/app/process-csv.types.ts`, `src/main/types.ts`,
  `src/main/preload.ts`, `src/main/ipc/process-csv.ipc.ts`, focused tests and
  the implementation receipt. The target worktree contains broader phase state,
  so the review can approve the narrow slice but cannot certify the whole
  worktree diff as scoped.
- **Suggestion:** before judge acceptance, isolate/stage/integrate only the
  F6E2B allowed files, or provide a clean F6E2B-only worktree/diff for final
  acceptance. No code rework was found in the narrow F6E2B implementation.
- **Severity:** alta

## Narrow F6E2B Assessment

No material code findings were found in the reviewed F6E2B files.

- `deliveryFormat` remains accepted and backward compatible. If
  `deliveryOptionId` is absent, IPC still parses `deliveryFormat` through
  `parseProcessCsvDeliveryFormat`, preserving the existing CSV default and XLSX
  behavior.
- Public `deliveryOptionId` is narrowed to
  `preserve-columns-csv` and `current-result-workbook` through
  `PROCESS_CSV_DELIVERY_OPTION_ID` / `ProcessCsvDeliveryOptionId`.
- IPC validates `deliveryOptionId` before ledger creation, provider creation,
  Receita Web availability checks, autosave and runtime processing. Invalid
  format/option resume inputs are also rejected before reading execution
  history.
- Unknown, planned, disabled and artifact-less option ids are rejected via the
  runtime delivery selection contract, then narrowed again to the two current
  Process CSV ids.
- Non-string `deliveryOptionId` is rejected before runtime/provider by
  `parseIpcDeliveryOptionId`.
- Preload forwards `deliveryOptionId` in `processCsv` and
  `resumeExecution` only; it does not create UI, renderer behavior or external
  side effects.
- Cancel, progress, save-output, autosave and history IPC were not broadened in
  behavior; hardcoded CSV channel strings were centralized into
  `PROCESS_CSV_IPC_CHANNEL`.

## Checks Executed

Initial sandboxed Vitest attempt:

- `pnpm exec vitest run test/unit/process-csv.ipc.test.ts test/unit/preload.test.ts test/unit/process-csv-contracts.test.ts`
- Result: blocked by sandbox because Vitest needed to write
  `node_modules/.vite-temp` in the F6E2B worktree, which is outside this review
  thread's writable roots.

Executed with escalated filesystem permission for the F6E2B worktree:

- `pnpm exec vitest run test/unit/process-csv.ipc.test.ts test/unit/preload.test.ts test/unit/process-csv-contracts.test.ts`
  - pass, 3 files / 37 tests.
- `pnpm exec vitest run test/integration/process-csv.use-case.test.ts test/unit/process-csv-contracts.test.ts`
  - pass, 2 files / 26 tests.
- `pnpm typecheck`
  - pass.
- `pnpm lint`
  - pass, `biome check .`, 114 files checked, no fixes applied.
- `git diff --check -- src/core/app/process-csv.types.ts src/main/types.ts src/main/preload.ts src/main/ipc/process-csv.ipc.ts test/unit/process-csv.ipc.test.ts test/unit/preload.test.ts test/unit/process-csv-contracts.test.ts docs/goals/fiscal-desk-orchestration/results/phase-6e2b-delivery-ui-ipc-implementation.md`
  - pass.

Additional reviewer support:

- `node /Users/icaroaguiar/.agents/skills/agentic-code-review/scripts/collect-review-context.mjs --root /Users/icaroaguiar/.codex/worktrees/cb3c/consulta-simples-csv`
  - completed, but reported the whole worktree as 182 changed files with
    frontend/visual and boundary signals. This supports the scope finding above
    and is not treated as approval or as focused F6E2B evidence.

## Residual Risks

- The worktree-level harness warnings `magic_string_boundary=21` and
  `visual_surface_change=1` remain worktree-level signals. The F6E2B slice
  centralizes the new public delivery ids and IPC channel strings, and this
  review did not inspect or approve the unrelated visual-surface changes.
- `test/unit/preload.test.ts`, `test/unit/process-csv-contracts.test.ts` and
  the F6E2B implementation receipt are untracked in the reviewed worktree. They
  were included in the executed tests and `git diff --check` path, but final
  integration must deliberately include only the allowed F6E2B files.
- The review validated Electron main/preload behavior through unit/integration
  tests and static inspection, not through a running Electron app. That is
  acceptable for IPC/preload-only F6E2B because renderer UI is blocked out of
  scope.

## Recommendation To Judge

Do not accept the whole F6E2B worktree as-is.

Approve the F6E2B implementation candidate only if the judge/integrator
isolates the allowed F6E2B file set and excludes the broader dirty renderer,
provider, ingestion/export, scripts, F8/update/network/release-adjacent state.
Within the reviewed narrow file set, I found no material rework required.

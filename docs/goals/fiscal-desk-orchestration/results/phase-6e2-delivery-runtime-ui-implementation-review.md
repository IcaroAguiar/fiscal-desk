# Phase 6E2A - Delivery Runtime Selection Independent Review

Updated: 2026-06-13

## Status

`needs_rework`

Review target: `/Users/icaroaguiar/.codex/worktrees/6582/consulta-simples-csv`

Worker status reviewed: `implementation_candidate_pending_review`

## Verdict

F6E2A is close on the core runtime behavior: legacy `deliveryFormat` remains
compatible, default CSV remains unchanged, current CSV/XLSX delivery option ids
resolve to the existing artifacts, and the focused process/cancel/resume checks
pass.

It should not be accepted by judge yet because one mandatory scope check fails at
worktree diff level, and `processCsv` has a small but real boundary bug where an
empty unknown `deliveryOptionId` is silently treated as omitted and starts lookup
instead of being rejected before provider execution.

## Findings

### High - Worktree diff is not isolated to the approved F6E2A scope

The F6E2A scope review and judge decision explicitly block writes to
`src/main/**`, `src/renderer/**`, provider adapters, `src/core/export/**`,
`src/core/ingestion/**`, scripts, styles, package/lockfile and release/update
surfaces for this worker. The implementation receipt also claims this slice does
not alter UI, IPC/preload, providers, ingestion/export contracts, scripts,
styles, or package/lock.

However, `git diff --name-only -- src/main src/renderer src/core/simples
src/core/export src/core/ingestion scripts package.json pnpm-lock.yaml release`
in the F6E2A worktree returns changes under:

- `scripts/smoke-electron-ui.ts`
- `scripts/smoke-visual-ui.ts`
- `src/core/simples/**`
- `src/main/ipc/process-csv.ipc.ts`
- `src/main/preload.ts`
- `src/main/types.ts`
- `src/renderer/**`

`git status --short` also shows untracked `src/core/export/**`,
`src/core/ingestion/**`, renderer files, scripts, skills, and docs. This may be
pre-existing or parallel phase state, as the F6E2A receipt says, but the
mandatory reviewer check was to confirm the diff does not touch those surfaces.
It does touch them in the submitted worktree, so the candidate is not cleanly
approvable as an isolated F6E2A patch.

References:

- `/Users/icaroaguiar/.codex/worktrees/6582/consulta-simples-csv/docs/goals/fiscal-desk-orchestration/results/phase-6e2-delivery-runtime-ui-scope-review.md:138`
- `/Users/icaroaguiar/.codex/worktrees/6582/consulta-simples-csv/docs/goals/fiscal-desk-orchestration/results/phase-6e2-delivery-runtime-ui-scope-review-judge-decision.md:50`
- `/Users/icaroaguiar/.codex/worktrees/6582/consulta-simples-csv/docs/goals/fiscal-desk-orchestration/results/phase-6e2-delivery-runtime-ui-implementation.md:14`
- `/Users/icaroaguiar/.codex/worktrees/6582/consulta-simples-csv/docs/goals/fiscal-desk-orchestration/results/phase-6e2-delivery-runtime-ui-implementation.md:62`

### Medium - Empty unknown `deliveryOptionId` bypasses deterministic rejection

`processCsv` only forwards `deliveryOptionId` to
`resolveProcessCsvOutputDelivery` when the value is truthy:

- `/Users/icaroaguiar/.codex/worktrees/6582/consulta-simples-csv/src/core/app/process-csv.use-case.ts:63`
- `/Users/icaroaguiar/.codex/worktrees/6582/consulta-simples-csv/src/core/app/process-csv.use-case.ts:67`

The resolver itself would reject an empty string as an unknown option through
`validateFiscalExportDeliveryOptionSelection`, but the wrapper omits `""` and
falls back to default CSV. A runtime probe confirmed this starts the provider and
returns CSV:

```json
{"ok":true,"calls":["00000000000191"],"delivery":{"extension":"csv","format":"csv","mimeType":"text/csv;charset=utf-8"}}
```

This violates the F6E2A requirement that unknown option ids reject
deterministically before lookup. The fix is narrow: preserve omission/default
only when the property is absent or explicitly nullish according to the intended
contract, but pass present string values, including `""`, into the F6E1
selection validator.

## Positive Checks

- `deliveryFormat` compatibility is preserved for omitted/default CSV and
  `deliveryFormat: "xlsx"` through `resolveProcessCsvOutputDelivery`.
- Current F6E1 option ids resolve as expected:
  `preserve-columns-csv` to CSV and `current-result-workbook` to XLSX.
- Planned/disabled/artifact-less examples covered by tests reject before lookup:
  `normalized-workbook`, `executive-pdf`, `detailed-json`.
- The delivery resolution is executed before `readCsv`, ingestion, ledger setup,
  provider lookup and output generation in `processCsv`, which is the right
  ordering for deterministic rejection.
- Cancellation and ledger resume tests passed with the new resolution point.
- `mock` remains untouched by the reviewed F6E2A runtime selection files.

## Checks Executed

- Read mandatory F6E2A instructions, scope receipts, judge decision, integration
  wave receipt, implementation receipt, `processCsv` runtime files and focused
  tests.
- `node /Users/icaroaguiar/.agents/skills/agentic-code-review/scripts/collect-review-context.mjs --root /Users/icaroaguiar/.codex/worktrees/6582/consulta-simples-csv`
  - completed; noisy packet because the worktree has 166 changed files, including
    blocked scope surfaces.
- `git -C /Users/icaroaguiar/.codex/worktrees/6582/consulta-simples-csv diff --name-only -- src/main src/renderer src/core/simples src/core/export src/core/ingestion scripts package.json pnpm-lock.yaml release`
  - failed the required scope expectation by returning blocked-scope paths.
- `pnpm exec vitest run test/integration/process-csv.use-case.test.ts test/unit/process-csv-contracts.test.ts test/unit/fiscal-export-artifacts.test.ts test/unit/fiscal-desk-phase-6-contracts.test.ts`
  - pass, 4 files / 33 tests.
- `pnpm exec vitest run test/integration/process-csv-cancel.test.ts test/integration/process-csv-ledger-resume.test.ts`
  - pass, 2 files / 4 tests.
- `pnpm typecheck`
  - pass.
- `pnpm lint`
  - pass, 111 files.
- `git diff --check -- src/core/app/process-csv.use-case.ts src/core/app/process-csv-delivery.ts src/core/app/process-csv.types.ts test/integration/process-csv.use-case.test.ts test/integration/process-csv-cancel.test.ts test/unit/process-csv-contracts.test.ts docs/goals/fiscal-desk-orchestration/results/phase-6e2-delivery-runtime-ui-implementation.md`
  - pass.
- Runtime probe with `pnpm exec tsx -e ...` for `deliveryOptionId: ""`.
  - confirmed the medium finding.

Initial Vitest and `tsx` attempts hit sandbox restrictions because the F6E2A
worktree is outside this review thread's writable roots and Vite/tsx write cache
or IPC temp files. Re-runs with explicit escalation succeeded. No code was
modified in the F6E2A worktree.

## Residual Risks

- The broad dirty/untracked worktree makes attribution fragile. Even if the F6E2A
  code slice is extracted cleanly, judge should review the extracted patch or a
  clean diff before acceptance.
- Existing tests do not cover every planned artifact-less workbook id
  (`detailed-audit-workbook`, `summary-workbook`, `guided-custom-workbook`), but
  they cover the shared unavailable branch and F6E1 contract tests cover the
  catalog behavior.
- Harness warnings `magic_string_boundary=29` and `visual_surface_change=1`
  appear to be worktree-level noise from broader changes. The reviewed F6E2A
  runtime slice adds one local reason literal check in `process-csv-delivery.ts`
  and no visual surface.

## Recommendation For Judge

Return `needs_rework`.

Required before approval:

- Provide an isolated F6E2A diff or clean worktree where the mandatory blocked
  surfaces are not part of the candidate review packet.
- Fix `processCsv` option forwarding so present unknown `deliveryOptionId`
  values, including `""`, reach F6E1 validation and reject before lookup.
- Add a focused regression for the empty-id path or equivalent falsy unknown id
  behavior at the `processCsv` boundary.

# F9A/F9B Judge Decision - Speed Control Core/UI - 2026-06-14

Decision: `approved_for_f9a_f9b_only`

## Approved Scope

- Execution speed profile contract.
- Renderer speed selector and operational copy.
- IPC/preload forwarding of the selected profile.
- Provider-aware effective concurrency.
- Bounded concurrent lookup queue for providers allowed to run locally.
- CNPJa Open and Receita Web kept at concurrency `1`.
- Core safeguards for worker failure, cancellation, checkpoint serialization and
  output order.

## Evidence

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm smoke:visual`
- `pnpm smoke:electron-ui`
- `git diff --check`
- Focused rework tests:
  - `test/integration/process-csv-progress.test.ts`
  - `test/integration/process-csv-cancel.test.ts`
- Independent review initially found two material concurrency/cancellation
  findings.
- Independent re-review confirmed both findings closed and reran the focused
  regression tests.

## Not Approved As Done

F9 is not complete. The following slices remain pending and require separate
owner windows before they can be considered done:

- F9C: Base Publica assisted discovery/download/streaming index.
- F9D: pause/resume fine control and stronger partial/export workflows.
- F9E: Receita Web parallel experimental mode, only after explicit new decision.

## Residual Risk

No blocking F9A/F9B finding remains open. The remaining product risk is scope
gap, not regression in this slice: Base Publica automatic acquisition and pause
control are still future slices.

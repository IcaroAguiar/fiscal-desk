# First Release Post-Rework Security Review

Date: 2026-06-13
Thread: `019ec250-ce73-78c3-9660-a7e5122b3417`
Worktree: `/Users/icaroaguiar/.codex/worktrees/d0d5/consulta-simples-csv`
Commit reviewed: `dd64d86`
Status: `approved_candidate_with_blocker_followup`

## Reviewer Note

This is a reviewer opinion, not a judge approval. The review was read-only for
the integrated IPC and ledger privacy rework. It found the targeted IPC/ledger
blockers fixed, but also surfaced a separate Base Publica Local warning-log
privacy gap outside the earlier owner window.

## Targeted Findings

- `process-csv.ipc.ts` operational logs no longer emit raw CNPJ, source path,
  checkpoint path, saved path, CSV/XLSX payload, or provider raw response.
- `FileProcessExecutionLedger.saveLookup` projects lookup checkpoints to the
  minimal persisted shape and does not persist provider `raw`,
  `providerResponse`, provider message, `razaoSocial`, or extra payload fields.
- Legacy checkpoints are sanitized before reuse.
- Ledger warnings avoid absolute paths and raw `error.message`; they use
  categorical/sanitized reasons and basename-level context.

## Checks Passed

- `pnpm install --frozen-lockfile`: pass.
- `pnpm exec vitest run test/unit/main/file-process-execution-ledger.test.ts test/unit/process-csv.ipc.test.ts test/unit/process-csv.ipc.delivery.test.ts`: pass, 3 files / 36 tests.
- `pnpm typecheck`: pass.
- `pnpm lint`: pass.
- `pnpm test`: pass, 40 files / 259 tests.
- `git diff --check`: pass.
- Focused `rg` scans for sensitive runtime logs and raw provider payloads:
  executed and manually interpreted by the reviewer.

## Blocker Surfaced For Judge

`src/core/public-base/local-public-base.store.ts` still logs Base Publica Local
warnings with local `indexPath` and raw `error.message` when the local index is
invalid or unavailable.

The reviewer treated this as a follow-up outside the IPC/ledger rework. The
canonical judge escalated it to a formal blocker because Base Publica Local is a
supported first-release flow and the warning can expose local filesystem data.

## Residual Risks

- CNPJ and local paths remain in local storage where required for resume,
  history, autosave/export, and Base Publica Local offline behavior.
- Local storage remains unencrypted and without retention cleanup in this cut.
- Receita Web remains assisted/experimental and was not treated as deterministic
  live smoke coverage.
- Future diagnostic, telemetry, or support-package work must keep a positive
  allowlist and avoid attaching `userData`, ledgers, indices, or raw stdout.

## Recommendation To Judge

Accept the IPC/ledger rework gate input as improved, but keep material feature
work blocked until the Base Publica Local warning-log hardening is implemented,
reviewed, integrated, and the security gate is repeated or explicitly closed by
the judge.

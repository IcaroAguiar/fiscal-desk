# First Release Rework Owner Windows Dispatch - 2026-06-13

Status: `dispatched_active`

Dispatched at: `2026-06-13 15:13:55 -03`

## Purpose

Open the two rework owner windows selected by the judge decision
`results/first-release-candidate-release-security-review-judge-decision-2026-06-13.md`.

The previous read-only release/security gate closed as
`needs_rework_blocker_formal`. These owner windows are not new feature work.
They are first-release rework needed before the release/security gate can be
rerun.

## Threads

| Owner window | Thread | Pending worktree id | Scope |
|---|---|---|---|
| `first_release_local_privacy_hardening` | `019ec230-33f3-7d63-87ee-85e957bce7c4` | `local:523a66bb-2e9f-4161-bae8-87400f4398e1` | `/Users/icaroaguiar/.codex/worktrees/15ad/consulta-simples-csv` |
| `first_release_package_identity_and_publish_safety` | `019ec230-9f62-7cb0-bc46-8d107a055d4b` | `local:5c0c2e4d-3fe2-4997-a76e-c2d82feec9d6` | `/Users/icaroaguiar/.codex/worktrees/98af/consulta-simples-csv` |

## Model

- Model: `gpt-5.5`
- Reasoning: `medium`

## Allowed Writes

`first_release_local_privacy_hardening`:

- `src/main/ipc/process-csv.ipc.ts`
- `src/main/execution/file-process-execution-ledger.ts`
- `test/unit/main/file-process-execution-ledger.test.ts`
- `test/unit/process-csv.ipc.test.ts`
- `test/unit/process-csv.ipc.delivery.test.ts`
- `docs/goals/fiscal-desk-orchestration/results/first-release-local-privacy-hardening-2026-06-13.md`

`first_release_package_identity_and_publish_safety`:

- `package.json`
- `electron-builder.yml`
- `.github/workflows/pr-quality-gate.yml`
- `docs/goals/fiscal-desk-orchestration/results/first-release-package-identity-and-publish-safety-2026-06-13.md`

## Collision Rules

The two windows may run concurrently because the write scopes are disjoint.

The privacy hardening thread must not touch package/release/CI files. The
package identity/publish safety thread must not touch `src/**`, `test/**` or
`scripts/**`.

If either thread needs to cross its allowed write set, it must stop as
`blocked_allowed_write_scope_insufficient`.

## Verification Expectations

Privacy hardening must prove behavior with focused tests for ledger and IPC,
plus scans/manual inspection showing logs and checkpoints no longer retain raw
CNPJ/path/provider payload beyond the documented local-resume requirement.

Package identity/publish safety must run typecheck, lint, test, build and any
new coverage check it introduces. It must not run `dist:*`, signing,
notarization, updater or publish.

Both workers must deliver receipts and cannot approve themselves. Material
changes require independent review before judge acceptance.

## Material Work Gate

Feature work remains blocked. These two owner windows are first-release rework
only.

The release/security gate must be rerun or explicitly rejudged after these
windows are integrated in the canonical branch.

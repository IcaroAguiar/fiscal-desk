# First Release Rework Candidates Judge Decision

Updated: `2026-06-13 15:29:43 -03`

## Verdict

`needs_rework_reopened`

The two first-release rework candidates returned receipts and were reviewed by
the judge plus independent read-only reviewers. No candidate is integrated into
the canonical branch by this decision.

The current phase is still first-release blocker rework, not documentation-only
planning and not unrelated feature work.

## Candidate Receipts Checked

- `first_release_local_privacy_hardening`
  - Thread: `019ec230-33f3-7d63-87ee-85e957bce7c4`
  - Worktree:
    `/Users/icaroaguiar/.codex/worktrees/15ad/consulta-simples-csv`
  - Receipt:
    `results/first-release-local-privacy-hardening-2026-06-13.md`
  - Worker status: `ready_for_judge_review`
  - Judge result: `needs_rework`

- `first_release_package_identity_and_publish_safety`
  - Thread: `019ec230-9f62-7cb0-bc46-8d107a055d4b`
  - Worktree:
    `/Users/icaroaguiar/.codex/worktrees/98af/consulta-simples-csv`
  - Receipt:
    `results/first-release-package-identity-and-publish-safety-2026-06-13.md`
  - Worker status: `ready_for_judge_review`
  - Judge result: `needs_rework_scope_expansion_required`

## Judge Evidence

### Local Privacy Hardening

The candidate stayed inside its allowed write set and reduced direct runtime
log exposure. The judge reran:

- focused privacy tests:
  `pnpm exec vitest run test/unit/main/file-process-execution-ledger.test.ts test/unit/process-csv.ipc.test.ts test/unit/process-csv.ipc.delivery.test.ts`;
- `pnpm typecheck`;
- `git diff --check`;
- focused log scan for direct `console.*` sensitive fields.

The focused tests passed after escalated execution was used for the detached
worktree cache write. `pnpm typecheck` and `git diff --check` passed.

Independent security review did not approve the candidate because:

1. checkpoints from older ledgers can still be copied/restored with `raw` or
   provider payload unless sanitized or discarded during reuse;
2. checkpoint `message` can retain provider-derived fiscal data such as Base
   Publica Local `razaoSocial`;
3. ledger read warnings still log `error.message`, which can include absolute
   local paths.

The judge accepts these findings. The candidate remains useful partial work but
is not accepted until these three findings are corrected and covered by tests or
scans.

### Package Identity And Publish Safety

The candidate stayed inside its original allowed write set and resolves the
direct release review findings for:

- package/product identity in `package.json` and `electron-builder.yml`;
- `--publish never` in all `dist:*` scripts;
- `pnpm test:coverage` in the PR quality gate.

The judge checked that all `dist:*` scripts in the candidate include
`--publish never`, `pnpm-lock.yaml` has no diff, `pnpm typecheck` passed, and
`pnpm test:coverage` passed after escalated execution was used for detached
worktree cache and coverage writes.

Independent release review approved the direct candidate but found a broader
publish-safety gap outside the original allowed write set:

- `.github/workflows/windows-exe.yml` can still publish GitHub releases through
  `softprops/action-gh-release` on manual dispatch and tag pushes;
- the Windows artifact name still uses the legacy
  `consulta-simples-csv-windows` name.

The judge accepts the direct package changes as directionally correct but does
not integrate them yet. The owner window is reopened with expanded write scope
for `.github/workflows/windows-exe.yml` so package identity and publish safety
can be judged as a coherent release-safety unit.

## Rework Sent

Both existing Codex App threads were resumed with `/goal`, GPT-5.5 and medium
reasoning.

### Privacy Rework

Thread `019ec230-33f3-7d63-87ee-85e957bce7c4` was instructed to:

- sanitize or discard legacy checkpoint results when reusing previous ledgers;
- prevent checkpoint persistence of provider raw payload and provider-derived
  fiscal `message` values such as `razaoSocial`;
- sanitize ledger read warning reasons so absolute local paths are not logged;
- add tests for legacy ledger reuse and sanitized warning/error behavior;
- update the same receipt with a `Rework after independent security review`
  section.

### Package/Release Workflow Rework

Thread `019ec230-9f62-7cb0-bc46-8d107a055d4b` was instructed to:

- expand allowed write scope to include `.github/workflows/windows-exe.yml`;
- remove or disable GitHub release publishing from the Windows workflow;
- reduce workflow permissions to the minimum needed for artifact upload;
- rename the Windows artifact to the Fiscal Desk identity;
- keep `--publish never`, Fiscal Desk package identity and PR coverage gate;
- update the same receipt with a `Rework after independent release review`
  section.

## Current Blocking State

- No material feature work is released.
- No candidate code/config is integrated into the canonical branch.
- Final first-release release/security readiness remains blocked until both
  reworked candidates return, pass independent review, and are serially
  integrated into the single canonical branch.

## Residual Risks

- The package candidate's current worktree contains valid partial changes, but
  it must not be treated as release-safe until the Windows workflow no longer
  publishes releases.
- The privacy candidate's current worktree contains valid partial changes, but
  it must not be treated as security-go until legacy checkpoint reuse and
  provider-derived message persistence are addressed.
- Coverage remains auxiliary. Behavior still needs focused tests and final
  single-worktree checks after integration.

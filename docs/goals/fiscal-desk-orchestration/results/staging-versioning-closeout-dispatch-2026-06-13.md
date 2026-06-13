# Staging Versioning Closeout Dispatch - 2026-06-13

Status: `queued_pending_worktree`

Dispatched at: `2026-06-13 05:16:30 -03`

Pending worktree id: `local:d967fba3-bf05-4915-ba0b-1ec2852de5cd`

Thread materialized at: `2026-06-13 05:17:17 -03`

Thread id: `019ec00d-c200-7dc0-87fc-c40d141ea7cb`

Thread title: `Preparar staging Fiscal Desk`

Closeout worktree:
`/Users/icaroaguiar/.codex/worktrees/ce1f/consulta-simples-csv`

## Purpose

Release a non-material closeout gate after final integration review acceptance.
The goal is to classify the broad dirty/untracked Fiscal Desk package and
produce a safe staging/versioning strategy before any future stage, commit, PR
or new feature worker. The thread is now active.

## Why This Was Released

- F0 is accepted by the judge and remains a sentinel.
- Final integration review was accepted by the judge.
- No material worker queue is pending.
- The final review identified broad dirty/untracked state as the main remaining
  operational risk.
- The next material worker must not be auto-released from a dirty package
  without a fresh judge scope or a staging/versioning closeout.

## Thread Contract

The dispatched closeout agent must:

- use `/goal`, GPT-5.5 and reasoning medium;
- read canonical docs/worktree at
  `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv` if local ignored docs
  are missing from its own worktree;
- not edit code;
- not run `git add`, `git commit`, `git push`, `gh pr`, deploy or destructive
  commands;
- write only
  `docs/goals/fiscal-desk-orchestration/results/staging-versioning-closeout.md`
  in its own worktree;
- produce a candidate classification and proposed stage commands for the judge,
  without executing those commands.

## Required Focus

- Classify tracked modified files, untracked versionable docs/code/tests,
  generated artifacts, ignored/local docs and mandatory exclusions.
- Preserve F0 decisions: include `docs/goals/**`; exclude `skills/**` from the
  F0 PR by default; never stage `.inputs.json`; keep `.visual-fidelity/**`
  ignored by default; keep `docs/fiscal-desk/**` local-only unless the judge
  decides otherwise.
- Confirm Wave 12/13/final review receipts are part of the versionable
  `docs/goals/**` package.
- Propose exact stage command groups without running them.
- Report residual risk and any human decision needed before actual stage/commit.

## Judge State

No new feature worker was released.

The next judge action is to observe the staging/versioning closeout thread,
collect its receipt, then decide whether to stage/version, request rework, or
open a fresh feature scope.

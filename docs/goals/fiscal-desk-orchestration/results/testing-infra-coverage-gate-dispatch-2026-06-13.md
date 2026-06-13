# Testing-Infra Coverage Gate Dispatch

Date: 2026-06-13 13:14:36 -03
Judge: Codex primary orchestrator
Status: `dispatched_then_integrated_validated_pass_with_risk`
Thread: `019ec1c2-abc1-7ce2-8b68-212c2e152a19`
Pending worktree id: `local:c764f0f0-faec-4154-be84-1d301c4522d4`
Worktree: `/Users/icaroaguiar/.codex/worktrees/3547/consulta-simples-csv`
Branch base: `feat/fiscal-desk-local-base-prep`

## Decision

The judge selected the non-feature `testing_infra_coverage_gate` window after
post-commit closeout. This opens only the testing infrastructure gap identified
in the testability audit:

- missing Vitest coverage provider/report generation;
- quality-gate coverage command still unset;
- direct preload unit coverage missing for `prepareLocalPublicBase`.

No Fiscal Desk feature worker is released by this decision.

## Allowed Writes

- `package.json`
- `pnpm-lock.yaml`
- `vitest.config.ts`
- `docs/ai/quality-gate/quality-gate.config.json`
- `docs/ai/quality-gate/README.md`
- `test/unit/preload.test.ts`
- `docs/goals/fiscal-desk-orchestration/results/testing-infra-coverage-gate.md`

## Do Not Touch

- `src/**`, except read-only inspection of `src/main/preload.ts`
- `test/**`, except `test/unit/preload.test.ts`
- `docs/fiscal-desk/**`
- `docs/adr/**`
- `docs/goals/fiscal-desk-orchestration/state.yaml`
- `docs/goals/fiscal-desk-orchestration/integration-plan.md`
- renderer UI, providers, IPC handlers, CSV processing, export, ingestion
- release/update, diagnostics, telemetry, license/account behavior
- generated `coverage/**`, `dist/**`, `dist-electron/**`, screenshots or reports
- stage, commit, push, PR or deploy

## Required Worker Checks

- dependency install or equivalent lockfile update for the coverage provider;
- focused preload test;
- full `pnpm test`;
- canonical coverage script;
- proof that `coverage/coverage-summary.json` and `coverage/lcov.info` are
  generated locally and left unversioned;
- `node docs/ai/quality-gate/check-ratchet.mjs`;
- `pnpm typecheck`;
- `pnpm lint`;
- `pnpm build`;
- `git diff --check` for the allowed write set;
- `git status --short --branch --untracked-files=all`.

## Judge Follow-Up

When the worker finishes, the primary judge must read
`results/testing-infra-coverage-gate.md`, inspect the diff, verify the generated
coverage artifacts are not staged/versioned, and decide whether to integrate,
request rework or mark a blocker.

## Superseding Closeout

This dispatch receipt is now historical. The worker returned, reworked the
first ratchet issue, passed independent review, and was integrated in the
canonical worktree as `integrated_validated_pass_with_risk`.

Closeout receipts:

- `results/testing-infra-coverage-gate-canonical-integration-2026-06-13.md`
- `results/testing-infra-coverage-gate-canonical-review-2026-06-13.md`

# Goal: Fiscal Desk Orchestration

## Objective

Orquestrar a execucao faseada do Fiscal Desk com documentos, goals e subagentes
estabilizados, mantendo aceite centralizado pelo judge, integracao em uma unica
worktree/branch e liberacao de novas ondas somente quando dependencias e
boundaries estiverem fechados.

## Current Status

- Status: orchestrating-active
- Current blocking phase: none; F0 had a self-approval blocker and was accepted
  by the external judge/orchestrator.
- Canonical phase source: `docs/fiscal-desk/phase-orchestration.md`
- Canonical execution package source: `docs/goals/fiscal-desk-orchestration/`
- Current branch context: `feat/fiscal-desk-local-base-prep`
- Integrated validated waves: F1/F2/F4, F3/F5, F6A/F7A, F6B/F6C,
  F6D runtime, F6E1/F7B, F6E2/F8A scope reviews, F6E2A/F8A material slices.
- Held scopes: F6E2 UI/IPC/renderer exposure, F8 real update/release,
  telemetry transport, diagnostic generation and any package/lockfile or
  release metadata work until a new judge-owned scope opens those surfaces.

## Oracle

This goal can be closed only when:

- all phases F0-F8 have an explicit phase goal document;
- every phase defines outcome, oracle, non-goals, allowed writes, do-not-touch, subagents, gates and stop conditions;
- the subagent registry defines role boundaries and prevents write collisions;
- the judge review records the accepted, rejected or conditional parts of each subagent result;
- F0 remains the historical blocker record and cannot be self-approved by its
  own thread;
- no implementation worker is released without a phase goal and judge approval;
- no phase claims completion without evidence, checks and independent review when material.
- every accepted phase result is integrated and validated in the canonical
  branch before the user is asked to validate the app.

## Non-Goals

- Do not implement broad Fiscal Desk features directly in the orchestrator
  thread except for judged integration/doc-control patches.
- Do not change provider behavior, renderer behavior, IPC, preload, storage, release or packaging.
- Do not resolve the existing dirty worktree here.
- Do not bypass the quality ratchet.
- Do not use Receita Web as a deterministic smoke, automatic fallback or mass automation promise.
- Do not create backend remoto, banco, PDF pipeline, deploy or real auto-update.

## Global Rules

- F0 blocks all feature implementation until accepted by the judge/orchestrator.
- Scouts may run read-only in parallel after a judge approves the prompt.
- Workers may write only one phase slice with an exclusive write set.
- Shared contracts require a single owner: IPC, preload, `process-csv`, provider types, export types, renderer shell and `styles.css`.
- Spark/executor-style agents can execute closed packets but cannot approve quality.
- The main Codex agent is the judge for phase transitions, completion claims and conflict resolution.
- Material code work requires deterministic checks and an independent reviewer.
- If the same failure signature appears twice, stop and escalate to judge diagnosis before another patch.

## Required Documents

- `state.yaml`: live orchestration state and phase readiness.
- `subagent-registry.md`: role registry, routing rules and collision controls.
- `judge-review.md`: judge assessment of the planning subagents.
- `integration-plan.md`: final single-worktree, single-branch merge and validation model.
- `phases/phase-0-current-branch-closeout.md`
- `phases/phase-1-execution-state-contracts.md`
- `phases/phase-2-renderer-surface-v5.md`
- `phases/phase-3-run-ledger-retomada.md`
- `phases/phase-4-provider-catalog-health-fallback.md`
- `phases/phase-5-base-publica-local.md`
- `phases/phase-6-ingestao-entrega.md`
- `phases/phase-7-receita-web-assistida.md`
- `phases/phase-8-distribuicao-update-comercial.md`

## Phase Transition Rule

A phase can move from `planned` to `active` only when the judge confirms:

- F0 is closed, unless the phase is F0 itself;
- dependencies are closed or explicitly accepted as read-only inputs;
- write scope is exclusive;
- shared boundaries have one owner;
- verification commands are known and feasible;
- stop conditions are explicit;
- reviewer role is assigned when risk is material.

## Final Integration Rule

Parallel threads are execution units, not the final delivery state. The final user validation must happen in one integrated worktree and one final branch after approved phase outputs are merged by the judge/orchestrator. A phase is not user-accepted until it passes integration checks in that final branch.

## Closeout

The orchestration goal closes only when the accepted phase outputs are integrated
in the canonical worktree, final validation has run there, blocked/deferred
scopes are explicit, and the judge can point each future subagent to a
phase-specific goal without relying on chat history.

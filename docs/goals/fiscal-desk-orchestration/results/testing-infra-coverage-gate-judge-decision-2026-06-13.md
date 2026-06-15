# Testing-Infra Coverage Gate Judge Decision

Date: 2026-06-13 13:23:21 -03
Judge: Codex primary orchestrator
Thread: `019ec1c2-abc1-7ce2-8b68-212c2e152a19`
Worktree: `/Users/icaroaguiar/.codex/worktrees/3547/consulta-simples-csv`
Status: `needs_rework_rework_dispatched_then_superseded_by_canonical_closeout`

## Decision

The first worker result is not accepted. It made the narrow coverage and preload
changes, but the required quality gate did not pass.

The failing check was `node docs/ai/quality-gate/check-ratchet.mjs`. It failed
twice because the ratchet compared `origin/main...HEAD` and pulled a broad
historical diff into a detached worker worktree. That surfaced inherited noise
outside the worker scope, including `test/unit/receita-browser.client.test.ts`.

The worker correctly did not edit that inherited file. The judge therefore
requested rework in the same thread instead of approving or opening a new
feature phase.

## Rework Scope

The rework may update `docs/ai/quality-gate/check-ratchet.mjs` and quality-gate
docs/config to add an opt-in worker/worktree diff mode. The default PR/CI gate
must remain equivalent unless an explicit local mode is selected.

Required qualitative evidence for the next receipt:

- quantitative coverage: generated `coverage/coverage-summary.json`,
  `coverage/lcov.info`, and reported global/changed-line coverage when
  available;
- preload bridge: direct assertion that `prepareLocalPublicBase` forwards the
  complete payload to `ipcRenderer.invoke("local-public-base:prepare", input)`;
- Electron runtime: either rerun `pnpm smoke:electron-ui` or explicitly depend
  on prior accepted Electron receipts and state the residual risk;
- quality gate behavior: prove the scoped worker mode evaluates this worker
  recut rather than the historical branch diff;
- final risk: default PR/CI ratchet and final integrated branch validation still
  need to run before app-wide acceptance.

## Superseding Closeout

This decision records the first rejection and rework dispatch. It was later
superseded by the canonical integration closeout after the worker rework,
independent review, integration into the final branch and full local validation.

Current canonical status: `integrated_validated_pass_with_risk`.

Current receipts:

- `results/testing-infra-coverage-gate-review-dispatch-2026-06-13.md`
- `results/testing-infra-coverage-gate-canonical-review-2026-06-13.md`
- `results/testing-infra-coverage-gate-canonical-integration-2026-06-13.md`

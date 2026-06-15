# Post-F6E2C Next Owner Window Selection - 2026-06-13

Status: `approved_scope_candidate`

Thread/worktree: `/Users/icaroaguiar/.codex/worktrees/3316/consulta-simples-csv`

Owner window reviewed: `post_f6e2c_next_owner_window_selection`

## Decision Summary

F6E2C is closed as `approved_by_judge_no_code`. The next immediate owner
window should not be material feature work.

Recommended next owner window:

`post_f6e2c_first_release_status_rebaseline`

Classification: `docs-only`.

Purpose: update the local first-release/status docs that still name
`f6e2c_renderer_delivery_selection_ui` as the next window, because that window
has already been accepted with no code. This rebaseline should replace the stale
recommendation with a release/security review gate for the first release cut, or
with a freshly judged material candidate if the judge explicitly rejects release
review as the next move.

Recommended follow-up after that docs-only correction:

`first_release_candidate_release_security_review`

Classification: split `release-review` + `security-review`, read-only first.
It should decide whether the integrated local-first package is ready for
release/PR preparation, or whether a fresh material owner window is still
needed. No material worker should be released directly from this receipt.

## Files Read

Canonical required files read from
`/Users/icaroaguiar/dev/pessoal/consulta-simples-csv`:

- `AGENTS.md`
- `docs/goals/fiscal-desk-orchestration/goal.md`
- `docs/goals/fiscal-desk-orchestration/state.yaml`
- `docs/goals/fiscal-desk-orchestration/integration-plan.md`
- `docs/goals/fiscal-desk-orchestration/results/orchestration-observation-2026-06-13-1438.md`
- `docs/goals/fiscal-desk-orchestration/results/first-release-rebaseline-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/first-release-rebaseline-judge-decision-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/phase-6e2c-renderer-delivery-selection-ui.md`
- `docs/goals/fiscal-desk-orchestration/results/phase-6e2c-renderer-delivery-selection-ui-judge-decision-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-f6e2c-next-owner-window-selection-dispatch-2026-06-13.md`
- `docs/fiscal-desk/first-release.md`
- `docs/fiscal-desk/status.md`
- `docs/fiscal-desk/roadmap.md`
- `docs/fiscal-desk/product-spec.md`
- `docs/fiscal-desk/implementation-plan.md`
- `docs/fiscal-desk/quality-gates.md`
- `docs/fiscal-desk/executor-packets/013-first-release-cut.md`

Relevant receipts also inspected:

- `docs/goals/fiscal-desk-orchestration/results/phase-6e-output-templates-scope-review.md`
- `docs/goals/fiscal-desk-orchestration/results/phase-6e2-delivery-runtime-ui-scope-review.md`
- `docs/goals/fiscal-desk-orchestration/results/phase-6e2b-delivery-ui-ipc-scope-review.md`
- `docs/goals/fiscal-desk-orchestration/results/phase-8a-local-update-diagnostic-contract-scope-review.md`
- `docs/goals/fiscal-desk-orchestration/results/phase-8b-local-update-diagnostic-ui-scope-review.md`
- `docs/goals/fiscal-desk-orchestration/results/integration-wave-13-f8b1-renderer-blocked-state.md`

## Queue State

- F0: accepted by judge and retained only as operational sentinel.
- Final integration review: accepted by judge.
- Staging/versioning closeout: accepted and executed earlier in canonical flow.
- Coverage gate: integrated and validated with risk; coverage remains a signal,
  not functional proof.
- First-release rebaseline: accepted after factual rework.
- F6E2C: accepted as `approved_by_judge_no_code`; no source or test code
  changed.
- Active material worker: none.
- Approved integration queue: none.
- Pending integration queue: none.

## Why This Is Not Ready For Direct Material Work

`docs/fiscal-desk/first-release.md` and `docs/fiscal-desk/status.md` still point
to `f6e2c_renderer_delivery_selection_ui` as the current recommended next
window. That recommendation was correct before the F6E2C audit, but it is now
stale because the judge accepted F6E2C at 2026-06-13 14:33 -03.

The orchestration docs are newer and coherent: after F6E2C there is no active
material queue, no pending integration queue, and any future worker needs fresh
judge selection. The product docs are the drift source. A material worker using
those docs as inputs would risk re-opening a closed no-code window or widening
scope from stale guidance.

## Exact Allowed Write Set For Recommended Next Window

For `post_f6e2c_first_release_status_rebaseline`:

- `docs/fiscal-desk/first-release.md`
- `docs/fiscal-desk/status.md`
- `docs/fiscal-desk/product-spec.md`, only if needed to remove the now-stale
  "UI/materializacao segura de formatos de entrega" pending decision.
- `docs/goals/fiscal-desk-orchestration/results/post-f6e2c-first-release-status-rebaseline-2026-06-13.md`

No source, tests, package, lockfile, release config, ADR, `state.yaml`,
`integration-plan.md`, stage, commit, push, PR, deploy or release work should be
allowed.

For the later `first_release_candidate_release_security_review`:

- result receipt only, for example
  `docs/goals/fiscal-desk-orchestration/results/first-release-candidate-release-security-review-2026-06-13.md`

That follow-up should be read-only unless the judge opens a separate docs-only
or material worker after reading its receipt.

## Do Not Touch

Blocked for the immediate docs-only rebaseline:

- `src/**`
- `test/**`
- `package.json`
- `pnpm-lock.yaml`
- `electron-builder.yml`
- `.github/**`
- release/package config
- `docs/adr/**`
- `docs/goals/fiscal-desk-orchestration/state.yaml`
- `docs/goals/fiscal-desk-orchestration/integration-plan.md`
- stage, commit, push, PR, deploy or release

Blocked until their own future owner windows:

- runtime update behavior
- updater metadata
- release/package configuration
- diagnostic package generation or sending
- telemetry transport
- license/account behavior
- storage/network/backend expansion
- guided delivery customization beyond current CSV/XLSX selection
- renderer template UI
- reusable delivery models
- PDF/Word/OCR real ingestion or export
- Receita Web live/mass automation

## Mandatory Checks If The Next Work Becomes Material

Qualitative checks by touched surface:

- core/domain/export/provider: focused contract or integration tests plus
  `pnpm test`.
- renderer/UI/copy/layout: focused renderer tests plus `pnpm smoke:visual`.
- Electron app function, IPC/preload, delivery or execution: focused tests plus
  `pnpm smoke:electron-ui`.
- Base Publica Local/preparo/consentimento: include
  `FISCAL_DESK_SMOKE_PROVIDER=base-publica-local pnpm smoke:electron-ui` when
  applicable.
- CSV/provider behavior: include `pnpm smoke:real-csv` or a documented blocker
  with accepted residual risk.
- sensitive surfaces such as diagnostics, telemetry, license, update, release,
  credentials or Receita Web: security review and sanitized-data scan.

Quantitative and deterministic checks:

- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`
- `pnpm test:coverage`, with coverage reported as a regression signal only.
- `pnpm build`
- `git diff --check -- <changed files>`
- ratchet/quality gate in the mode appropriate to the worktree or PR context.
- independent review for any material code/UI/runtime diff.

No material worker may close on coverage percentage, ratchet or unit tests
alone when runtime/UI/CSV/provider behavior was touched.

## Parallelization Decision

Immediate recommendation: serial.

Reason: the next docs-only rebaseline writes `docs/fiscal-desk/first-release.md`
and `docs/fiscal-desk/status.md`, which are the same decision surfaces that
would define any release-review or next material prompt. Running a release
review or material worker in parallel would make it consume stale inputs.

Safe concurrency after the docs-only rebaseline is judged:

- read-only release review and read-only security review may run in parallel if
  each writes a distinct result receipt only.
- no material worker should run in parallel with those reviews unless the judge
  explicitly proves the write set is disjoint and independent from release,
  security, renderer, IPC/preload, provider and package/release surfaces.

Material concurrency remains allowed only by the existing orchestration rule:
separate Codex App threads, exact disjoint allowed writes, one owner per shared
boundary, independent receipts, and judge acceptance before integration.

## Required Answers

1. Next recommended owner window after F6E2C:
   `post_f6e2c_first_release_status_rebaseline`.

2. Classification:
   docs-only now. After it is judged, split into read-only release-review and
   security-review before selecting any new material worker.

3. Exact allowed write set:
   for the immediate next window, only `docs/fiscal-desk/first-release.md`,
   `docs/fiscal-desk/status.md`, optionally `docs/fiscal-desk/product-spec.md`
   for the now-stale delivery-selection pending decision, and its own result
   receipt under `docs/goals/fiscal-desk-orchestration/results/`.

4. Surfaces still blocked:
   all source/tests/package/release/orchestration-state surfaces for the
   docs-only rebaseline; update, diagnostic, telemetry, license/account,
   storage/network, templates, reusable models, PDF/Word/OCR and Receita Web
   live/mass automation until separate owner windows.

5. Checks if material:
   focused tests for the touched contract plus `typecheck`, `lint`, `test`,
   `test:coverage` as signal, `build`, `diff --check`, applicable Electron,
   visual, real CSV/Base Publica smokes, ratchet/quality gate, and independent
   review.

6. Parallelization:
   not for the immediate docs correction. After that, read-only release/security
   reviews may run in parallel if their receipt files are distinct.

7. Does the stale F6E2C recommendation need rebaseline before material work?
   yes. It does not invalidate the F6E2C judge acceptance, but it should be
   corrected before any material worker uses `first-release.md` or `status.md`
   as scope input.

8. Stop conditions:
   return `blocked` if canonical required docs are missing again, if docs-only
   edits require touching forbidden files, if a fresh material scope cannot be
   chosen without release/security decisions, or if worktree state prevents
   attribution. Return `needs_rework` if a doc update still recommends F6E2C as
   pending, contradicts the no-code judge decision, marks blocked future
   features as available, treats coverage as functional proof, or omits
   mandatory runtime/visual/security checks for touched surfaces.

## Residual Risks

- `docs/fiscal-desk/**` remains local/ignored in canonical history. Future
  workers that need those docs must receive canonical copies or the project must
  decide to version them.
- This receipt is a scope candidate, not judge acceptance.
- The release/security review may discover a concrete material gap and select a
  different next worker.
- Fixture-sized Electron smokes do not prove large-file/performance behavior.
- Release/package configuration remains blocked; review may classify it as a
  blocker before any public release action.

## Recommended Prompt For Next Subagent

```text
/goal
Execute a docs-only `post_f6e2c_first_release_status_rebaseline` for Fiscal Desk.

Context:
- You are in an independent Codex App thread/worktree for `consulta-simples-csv`.
- F6E2C was accepted as `approved_by_judge_no_code` on 2026-06-13 14:33 -03.
- The renderer already exposes CSV/XLSX delivery selection and the judge
  revalidated `test/unit/app-view.test.ts` and `pnpm smoke:electron-ui`.
- Local product docs still recommend F6E2C as the next owner window; this is
  stale and must be corrected before material work.
- This is docs-only. Do not implement code.
- Do not stage, commit, push, PR, deploy or release.
- Return a candidate for judge; do not self-approve.

Read canonical docs from `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv`
if local ignored docs are missing:
- AGENTS.md
- docs/goals/fiscal-desk-orchestration/goal.md
- docs/goals/fiscal-desk-orchestration/state.yaml
- docs/goals/fiscal-desk-orchestration/integration-plan.md
- docs/goals/fiscal-desk-orchestration/results/orchestration-observation-2026-06-13-1438.md
- docs/goals/fiscal-desk-orchestration/results/phase-6e2c-renderer-delivery-selection-ui.md
- docs/goals/fiscal-desk-orchestration/results/phase-6e2c-renderer-delivery-selection-ui-judge-decision-2026-06-13.md
- docs/goals/fiscal-desk-orchestration/results/post-f6e2c-next-owner-window-selection-2026-06-13.md
- docs/fiscal-desk/first-release.md
- docs/fiscal-desk/status.md
- docs/fiscal-desk/product-spec.md
- docs/fiscal-desk/quality-gates.md

Allowed writes:
- docs/fiscal-desk/first-release.md
- docs/fiscal-desk/status.md
- docs/fiscal-desk/product-spec.md only if needed to remove stale delivery
  pending-decision language
- docs/goals/fiscal-desk-orchestration/results/post-f6e2c-first-release-status-rebaseline-2026-06-13.md

Do not touch:
- src/**
- test/**
- package.json
- pnpm-lock.yaml
- electron-builder.yml
- .github/**
- release/package config
- docs/adr/**
- docs/goals/fiscal-desk-orchestration/state.yaml
- docs/goals/fiscal-desk-orchestration/integration-plan.md
- stage, commit, push, PR, deploy or release

Implement:
- replace stale "next owner window is F6E2C" language with post-F6E2C state;
- record that no active material worker exists;
- recommend read-only first-release release/security review as the next gate;
- keep update, diagnostic, telemetry, license/account, release/package,
  storage/network, templates, reusable models, PDF/Word/OCR and Receita Web live
  blocked until separate owner windows.

Checks:
- git diff --check -- <changed files>
- rg for stale F6E2C "next owner window" language in changed docs
- no code tests required unless forbidden files are touched accidentally

Stop if canonical docs are missing, if the update requires source/test/release
files, if it would mark future blocked features as available, or if stale docs
cannot be reconciled without a judge decision.
```

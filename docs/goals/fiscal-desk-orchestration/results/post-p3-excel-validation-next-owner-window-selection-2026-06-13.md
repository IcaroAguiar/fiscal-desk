# Post P3 Excel Validation Next Owner Window Selection

Status: approved_scope_candidate

## Observed State

- Thread/worktree: delegated read-only Codex App worker.
- Observed HEAD: `0d9bdf3 docs: dispatch post excel owner selection`.
- Expected minimum HEAD: `0d9bdf3 docs: dispatch post excel owner selection`.
- Worktree status: detached HEAD with inherited untracked `skills/csv-throughput-smoke/**` and `skills/electron-ui-evidence-capture/**`; this worker did not touch them.
- Local `docs/fiscal-desk/**`: absent in this worktree. Per dispatch, fiscal desk docs were read from `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/fiscal-desk/` only.

## Read Evidence

- `AGENTS.md`: repository must stay minimal Electron desktop, preserve port/adapters, keep `mock` offline default, and treat `receita-web` as assisted/experimental.
- `docs/goals/fiscal-desk-orchestration/goal.md`: no implementation worker may be released without a phase goal and judge approval; release/update/PDF/backend surfaces remain held unless explicitly opened.
- `docs/goals/fiscal-desk-orchestration/state.yaml`: post-Excel validation is marked accepted/validated, and `material_worker_released` is `none_active_pending_next_owner_window_selection`.
- `docs/goals/fiscal-desk-orchestration/integration-plan.md`: post-Excel integrated validation accepted after lint, typecheck, tests, coverage, CSV smoke, XLSX Electron smokes, visual smoke, build, gitleaks, ratchet, and diff check; no material worker is released by the owner-selection dispatch.
- `results/post-p3-excel-runtime-docs-rebaseline-integrated-first-release-validation-judge-decision-2026-06-13.md`: judge accepted the integrated validation and recorded residual blockers for release/public distribution, updater, diagnostics, telemetry, license/account, templates/models, PDF/Word/OCR, and Receita Web live/massiva.
- `results/post-p3-excel-runtime-docs-rebaseline-integrated-first-release-validation-2026-06-13.md`: runtime validation exercised CSV preservation, Electron XLSX input for `mock` and `base-publica-local`, preload/IPC via `window.appBridge.processCsv`, RunLedger/checkpoint/resume, autosave XLSX, Base Publica consent, and visual smoke.
- `docs/qa/first-release-validation.md`: material PRs require behavioral validation by touched surface; coverage alone is not functional proof; first release does not include public release, real update, sent diagnostics, telemetry, license/account, templates/models, PDF/Word/OCR, or Receita Web live/massiva.
- Canonical fiscal docs: `first-release.md`, `status.md`, `product-spec.md`, `roadmap.md`, `implementation-plan.md`, and `quality-gates.md` align that CSV, current Excel/XLSX input, current XLSX output, RunLedger/checkpoint/resume, Base Publica Local, and P3 renderer are in the first cut, while the remaining expansion surfaces stay blocked until their own owner windows.

Read-only checks performed:

- `git status --short --branch --untracked-files=all`
- `git log -5 --oneline`
- `rg -n "blocked|needs_rework|next owner|release|security|coverage|test:coverage|smoke:electron-ui|smoke:visual|smoke:real-csv|Base Publica|CSV|XLSX|Excel|Receita Web|update|diagnostico|telemetria|licenca|templates|modelos|PDF|Word|OCR|first release|PR" ...` over required local orchestration/QA docs and canonical fiscal docs.

## Recommended Owner Window

Recommended next owner window: `post_p3_first_release_final_readiness_pr_closeout`.

Classification: `read_only_review`.

Purpose: perform a final first-release/PR closeout readiness review after the accepted post-Excel integrated validation, without opening a new material implementation surface.

Rationale:

- The first-release functional cut is now validated enough to move from feature/runtime verification into closeout judgment.
- The docs explicitly keep feature expansions blocked; selecting guided XLSX delivery, diagnostics, update/release, templates/models, PDF/Word/OCR, license/account, telemetry, storage/network, or Receita Web live now would prematurely open a new material surface.
- A read-only PR/readiness closeout is the narrowest safe next step because it can decide whether the branch is ready for final orchestrator integration/PR preparation or whether a concrete blocker remains.
- This does not approve release package changes, publish, signing, notarization, auto-update, diagnostics sending, telemetry, licensing, or any product feature expansion.

## Recommended Write Set For Next Worker

Allowed write set:

- `docs/goals/fiscal-desk-orchestration/results/post-p3-first-release-final-readiness-pr-closeout-2026-06-13.md`

No other persistent writes should be allowed for that worker.

## Do Not Touch

- Code, tests, scripts, package files, lockfile, configs, fiscal docs, QA docs, ADRs, `state.yaml`, `integration-plan.md`, `.visual-fidelity`, release/update config, diagnostics, telemetry, license/account, renderer, IPC, preload, core, providers, ingestion/export, PR, stage, commit, push, publish, dist, signing, notarization, deploy.

## Dependencies And Boundary Collisions

- The worker must treat the accepted post-Excel integrated validation as evidence, not as approval to implement new features.
- `docs/fiscal-desk/**` may be absent in detached worktrees; if absent, the worker must read canonical docs from `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/fiscal-desk/` and must not copy or edit them.
- Release/package config review is not selected as the next window because docs do not show it as the immediate real blocker after post-Excel validation; it remains a separate blocked/review-only candidate.
- Guided/local XLSX delivery without reusable templates is not selected because the first-release closeout should happen before a new delivery feature is opened.
- Diagnostic local review is not selected because the docs still require an explicit diagnostic contract owner window and keep generated/sent diagnostics blocked.

## Required Checks For Next Worker

The next worker should remain read-only and should run only lightweight inspection:

- `git status --short --branch --untracked-files=all`
- `git log -5 --oneline`
- inspect latest owner-selection, post-Excel validation, judge decision, first-release, status, QA validation, quality gates, and integration plan docs;
- inspect branch diff/file list only as read-only evidence for PR closeout scope;
- run proportional `rg` for blockers and PR/readiness terms across required docs;
- after writing its receipt, run `git diff --check -- docs/goals/fiscal-desk-orchestration/results/post-p3-first-release-final-readiness-pr-closeout-2026-06-13.md`.

The next worker should not run lint, typecheck, tests, coverage, build, smokes, gitleaks, ratchet, dist, publish, signing, notarization, or deploy unless a later judge prompt explicitly changes that scope.

## Residual Risks

- Coverage remains below the target threshold noted in the accepted validation, although qualitative Electron/runtime evidence is strong for the post-Excel first-release cut.
- `agentic-review.not-enforced` remains a governance warning; final material readiness still needs orchestrator/judge handling.
- Detached worker contexts may not include local-only fiscal docs; canonical fallback must remain explicit to avoid false blockers.
- Untracked inherited `skills/**` files are present in this worktree and should remain ignored unless a separate owner explicitly addresses them.

## Still Blocked

- Public release/distribution, release package config changes, `dist`/publish, signing, notarization, real updater/update, diagnostics generated/sent externally, telemetry, license/account, storage/network/backend, templates/models reutilizaveis, formatted/modelable Excel output, PDF/Word/OCR, PDF executive, and Receita Web live/massiva.

## Recommendation To Judge

Approve only the read-only `post_p3_first_release_final_readiness_pr_closeout` owner window. Keep all material feature, release, telemetry, diagnostics, licensing, provider-live, and document-ingestion expansions blocked until a separate judge-owned scope is opened.

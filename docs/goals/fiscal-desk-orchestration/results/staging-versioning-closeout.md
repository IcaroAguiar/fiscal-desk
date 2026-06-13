# Fiscal Desk Staging/Versioning Closeout

Date: 2026-06-13
Thread role: staging/versioning closeout
Source/orchestrator thread: `019ebe5c-3853-79c2-87ad-8ddace386c93`
Canonical worktree audited: `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv`
Current worktree audited: `/Users/icaroaguiar/.codex/worktrees/ce1f/consulta-simples-csv`

## Status

`approved_candidate`

This is a staging/versioning recommendation only. No `git add`, commit, push,
PR, deploy, release, generated artifact deletion, or product-code edit was
performed.

## Executive Summary

The integrated Fiscal Desk package is classifiable for a future stage/commit/PR,
but it must be staged intentionally in groups. The recommended PR package should
include the integrated source/test/script changes and the durable
`docs/goals/**` orchestration receipts, including Wave 12, Wave 13 and final
integration review receipts.

Mandatory exclusions remain:

- `skills/**` by default, and especially every `.inputs.json`.
- `.visual-fidelity/**` by default, except optional force-add of the two JSON
  evidence files if the judge explicitly requires machine-readable visual proof.
- `docs/fiscal-desk/**` while it remains local-only under `.git/info/exclude`.
- generated build/smoke output under `dist/**`, `dist-electron/**` and visual
  screenshot/report trees unless separately approved.

The package is not ready for an automatic blind `git add .`. The safe path is a
reviewed, path-explicit stage followed by `git diff --cached --check`, fresh
secret scan with redaction, and the full validation suite already named by prior
receipts.

## Files And Docs Read

Mandatory canonical docs read from
`/Users/icaroaguiar/dev/pessoal/consulta-simples-csv`:

- `AGENTS.md`
- `docs/goals/fiscal-desk-orchestration/goal.md`
- `docs/goals/fiscal-desk-orchestration/state.yaml`
- `docs/goals/fiscal-desk-orchestration/integration-plan.md`
- `docs/goals/fiscal-desk-orchestration/results/phase-0-stage-set.md`
- `docs/goals/fiscal-desk-orchestration/results/phase-0-judge-decision.md`
- `docs/goals/fiscal-desk-orchestration/results/final-integration-review.md`
- `docs/goals/fiscal-desk-orchestration/results/final-integration-review-judge-decision.md`
- `docs/goals/fiscal-desk-orchestration/results/next-owner-window-observation-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/integration-wave-12-f6e2b-delivery-ipc-preload.md`
- `docs/goals/fiscal-desk-orchestration/results/integration-wave-13-f8b1-renderer-blocked-state.md`

Other integration-wave files audited for presence/listing:

- `results/integration-wave-1-f1-f2-f4.md`
- `results/integration-wave-2-f3-f5.md`
- `results/integration-wave-3-f6a-f7a.md`
- `results/integration-wave-4-f6b-f6c.md`
- `results/integration-wave-6-f6d-runtime-wiring.md`
- `results/integration-wave-7-scope-reviews.md`
- `results/integration-wave-8-f6e1-export-contract.md`
- `results/integration-wave-8-f6e1-f7b.md`
- `results/integration-wave-9-scope-reviews.md`
- `results/integration-wave-10-f6e2a-f8a.md`
- `results/integration-wave-11-scope-reviews.md`
- `results/integration-wave-12-f6e2b-delivery-ipc-preload.md`
- `results/integration-wave-13-f8b1-renderer-blocked-state.md`

## Worktree Classification

### Canonical Worktree

`git status --short --branch --untracked-files=all`:

- Branch: `feat/fiscal-desk-local-base-prep`.
- Tracked modified: 34 files across `scripts/**`, `src/**`, and `test/**`.
- Untracked versionable candidates:
  - `docs/goals/fiscal-desk-orchestration/**`
  - `docs/goals/fiscal-desk-v5-fidelity/**`
  - new integrated app files under `src/**`
  - new tests under `test/**`
  - new visual-smoke helper scripts under `scripts/**`
- Untracked local/excluded candidates:
  - `skills/**`, excluded from the Fiscal Desk PR by default.
  - `skills/**/.inputs.json`, never stage.
- Ignored/local-only:
  - `docs/fiscal-desk/**`, ignored by `.git/info/exclude`.
  - `.visual-fidelity/**`, ignored by `.gitignore`.
  - `dist/**`, ignored by `.gitignore`.
  - `dist-electron/**`, ignored by `.gitignore`.

`git diff --name-only` tracked-modified package:

- `scripts/smoke-electron-ui.ts`
- `scripts/smoke-visual-ui.ts`
- `src/core/app/process-csv-delivery.ts`
- `src/core/app/process-csv.types.ts`
- `src/core/app/process-csv.use-case.ts`
- `src/core/public-base/local-public-base.index.ts`
- `src/core/public-base/local-public-base.types.ts`
- `src/core/simples/adapters/cnpja-open-simples-lookup.adapter.ts`
- `src/core/simples/adapters/local-public-base-simples-lookup.adapter.ts`
- `src/core/simples/adapters/receita-web/index.ts`
- `src/core/simples/adapters/receita-web/receita-browser.client.ts`
- `src/core/simples/adapters/receita-web/receita-consulta-optantes.adapter.ts`
- `src/core/simples/adapters/receita-web/receita-result.parser.ts`
- `src/core/simples/simples-provider.config.ts`
- `src/core/simples/simples-provider.factory.ts`
- `src/main/ipc/process-csv.ipc.ts`
- `src/main/preload.ts`
- `src/main/types.ts`
- `src/renderer/styles.css`
- `src/renderer/ui/app-sync.ts`
- `src/renderer/ui/app-view.ts`
- `src/renderer/ui/app.ts`
- `src/renderer/ui/app.types.ts`
- `src/renderer/ui/operational-copy.ts`
- `test/integration/process-csv-cancel.test.ts`
- `test/integration/process-csv.use-case.test.ts`
- `test/unit/app-view.test.ts`
- `test/unit/cnpja-open-simples-lookup.retry.test.ts`
- `test/unit/local-public-base.test.ts`
- `test/unit/process-csv.ipc.test.ts`
- `test/unit/receita-browser.client.test.ts`
- `test/unit/receita-consulta-optantes.adapter.test.ts`
- `test/unit/receita-result.parser.test.ts`
- `test/unit/renderer-operational-copy.test.ts`

`git diff --stat` summary:

- 34 tracked files changed.
- 2,734 insertions.
- 1,110 deletions.

### Current Closeout Worktree

`git status --short --branch --untracked-files=all`:

- Branch state: detached `HEAD (no branch)`.
- Tracked modified: same 34 tracked files as the canonical package.
- Untracked versionable candidates: same broad integrated source/test/script and
  `docs/goals/**` set, except the canonical-only dispatch receipt
  `results/staging-versioning-closeout-dispatch-2026-06-13.md` was not present
  in this current worktree before this closeout file.
- Allowed write performed: this file only,
  `docs/goals/fiscal-desk-orchestration/results/staging-versioning-closeout.md`.

## Recommended Inclusions

Recommended for a future Fiscal Desk integrated PR, after judge confirmation and
fresh staged checks:

1. Integrated source/test/script package:
   - all tracked modified `scripts/**`, `src/**`, and `test/**` files listed
     above;
   - untracked integrated app/test/script files reported by
     `git ls-files -o --exclude-standard`, including:
     - `scripts/visual-smoke-checks.ts`
     - `scripts/visual-smoke-fixture.ts`
     - `src/core/app/fiscal-desk-local-contract.ts`
     - `src/core/export/export-artifacts.ts`
     - `src/core/export/export-contract.ts`
     - `src/core/ingestion/fiscal-ingestion.ts`
     - `src/core/ingestion/ingestion-contract.ts`
     - `src/core/simples/adapters/receita-web/receita-diagnostics.ts`
     - `src/core/simples/simples-provider.catalog.ts`
     - `src/core/simples/simples-provider.fallback.ts`
     - `src/core/simples/simples-provider.health.ts`
     - `src/renderer/ui/app-history-view.ts`
     - `src/renderer/ui/app-local-public-base-copy.ts`
     - `src/renderer/ui/app-refs.ts`
     - `src/renderer/ui/app-sync-reference.ts`
     - `src/renderer/ui/app-view-lists.ts`
     - `src/renderer/vite-env.d.ts`
     - `test/unit/fiscal-desk-local-contract.test.ts`
     - `test/unit/fiscal-desk-phase-6-contracts.test.ts`
     - `test/unit/fiscal-export-artifacts.test.ts`
     - `test/unit/fiscal-ingestion.test.ts`
     - `test/unit/preload.test.ts`
     - `test/unit/process-csv-contracts.test.ts`
     - `test/unit/simples-provider.catalog.test.ts`
     - `test/unit/simples-provider.fallback.test.ts`
     - `test/unit/simples-provider.health.test.ts`
2. Durable orchestration package:
   - `docs/goals/fiscal-desk-orchestration/**`
   - `docs/goals/fiscal-desk-v5-fidelity/**`
3. Receipts required by Wave 12/13 and final review:
   - `docs/goals/fiscal-desk-orchestration/results/integration-wave-12-f6e2b-delivery-ipc-preload.md`
   - `docs/goals/fiscal-desk-orchestration/results/integration-wave-13-f8b1-renderer-blocked-state.md`
   - `docs/goals/fiscal-desk-orchestration/results/final-integration-review.md`
   - `docs/goals/fiscal-desk-orchestration/results/final-integration-review-judge-decision.md`
   - related phase implementation/review/judge receipts for F6E2B and F8B1.

## Mandatory Exclusions

Do not stage these by default:

- `skills/**`
- `skills/csv-throughput-smoke/.inputs.json`
- `skills/electron-ui-evidence-capture/.inputs.json`
- `.visual-fidelity/**`
- `dist/**`
- `dist-electron/**`
- `docs/fiscal-desk/**` while ignored by `.git/info/exclude`
- package/release surfaces not changed by this package:
  - `package.json`
  - `pnpm-lock.yaml`
  - `electron-builder.yml`
- any future runtime update, diagnostic package generation, telemetry transport,
  license/account, updater metadata, release/package configuration, storage or
  network behavior not covered by a fresh judge scope.

## Human Decisions Still Required

Before real staging, the judge/human must decide:

- Whether `docs/fiscal-desk/**` should remain local-only or become versioned by
  removing/changing `.git/info/exclude`. Current recommendation: keep local-only
  for this PR.
- Whether `.visual-fidelity/**` remains ignored or whether exactly these two
  files should be force-added:
  - `.visual-fidelity/runs/reference-v5-a/fraud-proof-closeout.json`
  - `.visual-fidelity/runs/reference-v5-a/visual-smoke-report.json`
  Current recommendation: keep ignored unless PR review requires machine
  evidence.
- Whether any `skills/**` files deserve a later dedicated skills PR. Current
  recommendation: exclude all `skills/**` from the Fiscal Desk integrated PR.
- Whether to stage the canonical-only dispatch receipt
  `docs/goals/fiscal-desk-orchestration/results/staging-versioning-closeout-dispatch-2026-06-13.md`
  together with this closeout receipt. Current recommendation: include both if
  present in the final staging worktree, because they explain this gate.

## Proposed Stage Commands

Do not run these until the judge explicitly opens the staging action.

Block 1: integrated app source, tests and smoke helpers.

```bash
git add scripts/smoke-electron-ui.ts
git add scripts/smoke-visual-ui.ts
git add scripts/visual-smoke-checks.ts
git add scripts/visual-smoke-fixture.ts
git add src/core/app/process-csv-delivery.ts
git add src/core/app/process-csv.types.ts
git add src/core/app/process-csv.use-case.ts
git add src/core/app/fiscal-desk-local-contract.ts
git add src/core/public-base/local-public-base.index.ts
git add src/core/public-base/local-public-base.types.ts
git add src/core/export/export-artifacts.ts
git add src/core/export/export-contract.ts
git add src/core/ingestion/fiscal-ingestion.ts
git add src/core/ingestion/ingestion-contract.ts
git add src/core/simples/adapters/cnpja-open-simples-lookup.adapter.ts
git add src/core/simples/adapters/local-public-base-simples-lookup.adapter.ts
git add src/core/simples/adapters/receita-web/index.ts
git add src/core/simples/adapters/receita-web/receita-browser.client.ts
git add src/core/simples/adapters/receita-web/receita-consulta-optantes.adapter.ts
git add src/core/simples/adapters/receita-web/receita-diagnostics.ts
git add src/core/simples/adapters/receita-web/receita-result.parser.ts
git add src/core/simples/simples-provider.catalog.ts
git add src/core/simples/simples-provider.config.ts
git add src/core/simples/simples-provider.factory.ts
git add src/core/simples/simples-provider.fallback.ts
git add src/core/simples/simples-provider.health.ts
git add src/main/ipc/process-csv.ipc.ts
git add src/main/preload.ts
git add src/main/types.ts
git add src/renderer/styles.css
git add src/renderer/ui/app-history-view.ts
git add src/renderer/ui/app-local-public-base-copy.ts
git add src/renderer/ui/app-refs.ts
git add src/renderer/ui/app-sync-reference.ts
git add src/renderer/ui/app-sync.ts
git add src/renderer/ui/app-view-lists.ts
git add src/renderer/ui/app-view.ts
git add src/renderer/ui/app.ts
git add src/renderer/ui/app.types.ts
git add src/renderer/ui/operational-copy.ts
git add src/renderer/vite-env.d.ts
git add test/integration/process-csv-cancel.test.ts
git add test/integration/process-csv.use-case.test.ts
git add test/unit/app-view.test.ts
git add test/unit/cnpja-open-simples-lookup.retry.test.ts
git add test/unit/fiscal-desk-local-contract.test.ts
git add test/unit/fiscal-desk-phase-6-contracts.test.ts
git add test/unit/fiscal-export-artifacts.test.ts
git add test/unit/fiscal-ingestion.test.ts
git add test/unit/local-public-base.test.ts
git add test/unit/preload.test.ts
git add test/unit/process-csv-contracts.test.ts
git add test/unit/process-csv.ipc.test.ts
git add test/unit/receita-browser.client.test.ts
git add test/unit/receita-consulta-optantes.adapter.test.ts
git add test/unit/receita-result.parser.test.ts
git add test/unit/renderer-operational-copy.test.ts
git add test/unit/simples-provider.catalog.test.ts
git add test/unit/simples-provider.fallback.test.ts
git add test/unit/simples-provider.health.test.ts
```

Block 2: durable orchestration docs and receipts.

```bash
git add docs/goals/fiscal-desk-orchestration
git add docs/goals/fiscal-desk-v5-fidelity
```

Block 3: optional visual machine evidence only if explicitly required.

```bash
git add -f .visual-fidelity/runs/reference-v5-a/fraud-proof-closeout.json
git add -f .visual-fidelity/runs/reference-v5-a/visual-smoke-report.json
```

Block 4: defensive unstage commands if a broad stage was accidentally used.

```bash
git restore --staged skills
git restore --staged docs/fiscal-desk
git restore --staged dist
git restore --staged dist-electron
git restore --staged .visual-fidelity
git restore --staged skills/csv-throughput-smoke/.inputs.json
git restore --staged skills/electron-ui-evidence-capture/.inputs.json
```

## Checks Executed And Results

- `git status --short --branch --untracked-files=all` in canonical worktree:
  pass for audit; broad dirty branch classified.
- `git status --short --branch --untracked-files=all` in current worktree:
  pass for audit; detached dirty worktree classified.
- `git diff --name-only` in canonical worktree: pass for audit; 34 tracked
  modified files listed.
- `git diff --stat` in canonical worktree: pass for audit; 34 files, 2,734
  insertions, 1,110 deletions.
- `git ls-files -o --exclude-standard` in canonical and current worktrees:
  pass for audit; versionable untracked files listed.
- `git check-ignore -v` for selected sensitive/local/generated paths:
  - `docs/fiscal-desk/**` ignored by `.git/info/exclude`.
  - `.visual-fidelity/**` ignored by `.gitignore`.
  - `dist/**` ignored by `.gitignore`.
  - `dist-electron/**` ignored by `.gitignore`.
  - `.inputs.json` files were not ignored by git rules, which reinforces the
    explicit never-stage rule.
- `git status --short --ignored --untracked-files=all docs/fiscal-desk .visual-fidelity dist dist-electron skills docs/goals`:
  pass for audit; confirmed ignored/local/generated categories.
- `git diff --check` in canonical worktree: pass.
- `git diff --check` in current worktree: pass.
- Light secret-risk scan with `rg -l -i` over `docs/goals`, `src`, `test`,
  `scripts`, and `skills`: path-only triage found files containing sensitive
  class terms such as token, credential, authorization, cookie, password or
  security. No values were printed. The paths are consistent with security
  receipts, tests, UI copy and contract text, not confirmed leaked secrets.

## Residual Risks

- The canonical worktree remains a broad dirty local integration package until
  an explicit stage/commit/PR action is approved.
- `docs/goals/**` is versionable and recommended, but still untracked until the
  real stage action.
- `.inputs.json` files are not ignored by git, so a careless `git add .` would
  stage them. They must remain excluded.
- `.visual-fidelity/**` contains many ignored screenshots/reports. Force-adding
  the whole directory would create unnecessary large artifact churn.
- `docs/fiscal-desk/**` is ignored via `.git/info/exclude`; changing that is a
  human/versioning decision outside this closeout.
- The secret scan was lightweight and path-only. Before a real PR, run a
  redacted secret scanner such as `gitleaks detect --source . --redact --no-banner`.
- Harness warnings `magic_string_boundary=22` and `visual_surface_change=1`
  remain visible. Prior final review accepted them as non-blocking; staging must
  keep them in PR risk notes.
- The read commands referenced protected canonical paths intentionally because
  the delegation required auditing absolute canonical docs and state.

## Recommendation To Judge

Approve this as the staging/versioning candidate.

Recommended next step is a judge-authorized staging action using the path-explicit
blocks above, followed immediately by:

```bash
git diff --cached --check
gitleaks detect --source . --redact --no-banner
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm smoke:visual
pnpm smoke:electron-ui
```

Do not release a new material Fiscal Desk feature worker from this dirty package
until the stage/PR boundary is either completed or consciously deferred by the
judge with the exclusions above still active.

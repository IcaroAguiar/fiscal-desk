# Post PR E2E And Desktop Build Workflow

Date: 2026-06-14
Status: validated_local_stage_set_prepared_pending_commit_and_ci

## Objective

Add a deterministic local-first e2e command and update GitHub Actions so the
release-candidate branch can validate behavior and generate unsigned desktop
artifacts for Windows and macOS without enabling publish, signing,
notarization, updater real, telemetry or diagnostic sending.

## Scope

Changed surfaces:

- `package.json`
- `.gitignore`
- `scripts/e2e-all.ts`
- `.github/workflows/pr-quality-gate.yml`
- `.github/workflows/windows-exe.yml`
- `README.md`
- `docs/qa/first-release-validation.md`

## E2E Coverage

`pnpm test:e2e` aggregates:

- coverage-backed unit/integration contracts;
- real CSV smoke with `mock`;
- real CSV smoke with `base-publica-local`;
- runtime build;
- Electron smoke with CSV + `mock`;
- Electron smoke with CSV + `base-publica-local`;
- Electron smoke with XLSX + `mock`;
- Electron smoke with XLSX + `base-publica-local`;
- visual smoke across responsive viewports.

Intentional exclusions:

- Receita Web live/massiva remains assisted and experimental;
- `cnpja-open` live remains opt-in because it depends on network, external
  availability and rate limits;
- publish, signing, notarization, updater real, telemetry and diagnostic
  sending remain out of scope.

## GitHub Actions

`PR Quality Gate` now uses `pnpm test:e2e` under `xvfb-run` and uploads
`docs/qa/e2e-artifacts/**`.

`Desktop unsigned builds` now runs a Windows/macOS matrix:

- Windows x64 unsigned installer through `pnpm dist:win`;
- macOS unsigned DMG through `pnpm dist:mac`.

The workflow keeps `permissions.contents: read` and uses upload-artifact only.
It does not create or update GitHub Releases.

## Validation

Local validation executed:

- `pnpm typecheck`: pass.
- `pnpm lint`: pass, 124 files.
- `pnpm test:e2e`: pass outside sandbox after the known `tsx` IPC pipe
  sandbox failure.
- `pnpm test:e2e` evidence:
  - `pnpm test:coverage`: pass, 43 files and 283 tests, 76.38% line coverage.
  - `SMOKE_PROVIDER=mock pnpm smoke:real-csv`: pass.
  - `SMOKE_PROVIDER=base-publica-local pnpm smoke:real-csv`: pass.
  - `pnpm build`: pass inside the e2e runtime-build step.
  - Electron CSV + `mock`: pass with XLSX autosave, checkpoint, history and
    resume.
  - Electron CSV + `base-publica-local`: pass with XLSX autosave, checkpoint,
    history and resume.
  - Electron XLSX + `mock`: pass with XLSX autosave, checkpoint, history and
    resume.
  - Electron XLSX + `base-publica-local`: pass with XLSX autosave, checkpoint,
    history and resume.
  - `pnpm smoke:visual`: pass, desktop/tablet/mobile overflow, clipping and
    overlap checks all clean.
- `git diff --check`: pass.

The first `pnpm test:e2e` attempt inside the sandbox failed before app
execution with `listen EPERM` on the `tsx` IPC pipe. The command was rerun with
approval outside the sandbox and passed.

Not executed locally:

- `pnpm dist:win`
- `pnpm dist:mac`
- GitHub Actions matrix execution

Reason: local validation proves runtime behavior and production build. The
Windows/macOS installer generation is configured in Actions and should be
verified by the next CI run on native `windows-latest` and `macos-latest`
runners.

## Independent Review

Read-only independent review:

- command: `codex exec --ephemeral -s read-only -m gpt-5.5 ...`;
- scope: current uncommitted changes, ignoring `skills/**`;
- result: two findings, both addressed.

Findings and resolution:

- Medium: `package.json` and workflows depend on `pnpm test:e2e`, but
  `scripts/e2e-all.ts` was untracked at review time. Resolution: include
  `scripts/e2e-all.ts` in the explicit stage/commit set with `package.json` and
  both workflows; do not stage only the tracked edits.
- Low: `docs/qa/first-release-validation.md` still referenced
  `docs/qa/visual-smoke-artifacts/` for CI visual artifacts. Resolution:
  updated the doc to point to `docs/qa/e2e-artifacts/visual-smoke/`.

The reviewer found no publish/release regression: workflow permissions remain
`contents: read`, artifacts use `actions/upload-artifact`, and package scripts
still use `--publish never`.

## Stage Set

The explicit stage set for this slice must include:

- `.github/workflows/pr-quality-gate.yml`
- `.github/workflows/windows-exe.yml`
- `.gitignore`
- `README.md`
- `docs/goals/fiscal-desk-orchestration/integration-plan.md`
- `docs/goals/fiscal-desk-orchestration/state.yaml`
- `docs/goals/fiscal-desk-orchestration/results/post-pr-e2e-desktop-build-workflow-2026-06-14.md`
- `docs/qa/first-release-validation.md`
- `package.json`
- `scripts/e2e-all.ts`

It must exclude `skills/**`, `dist/**`, `dist-electron/**`, `coverage/**`,
`release/**` and generated e2e/visual artifacts.

## Diff Policy Notes

- `package.json` changed only to add the `test:e2e` script. No dependency was
  added and `pnpm-lock.yaml` remains unchanged.
- Boundary-like literals in the e2e runner are centralized through existing app
  contracts where available: provider names use `SIMPLES_PROVIDER`, input
  formats use `PROCESS_CSV_INPUT_FORMAT`, and smoke environment variable names
  are declared once in `scripts/e2e-all.ts`.

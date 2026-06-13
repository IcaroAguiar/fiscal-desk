# Fiscal Desk Testability Coverage Audit

Date: 2026-06-13 12:40:02 -03
Judge: Codex primary orchestrator
Status: `pass_with_risk`
Branch: `feat/fiscal-desk-local-base-prep`

## Question

The audit answers whether the current validation proves real Fiscal Desk
behavior in the Electron app, not only whether the repository has a high test
count or line coverage percentage.

## Decision

Qualitative coverage is strong enough to keep the integrated package eligible
for the next judge-selected owner window, with named residual risk. Quantitative
coverage is still not available and must not be marked as passed.

The current result is `PASS_WITH_RISK`, not `PASS`, because:

- `@vitest/coverage-v8` is not installed, so Vitest coverage reports cannot be
  generated yet;
- the Base Pública Local preload bridge is covered through the real Electron
  smoke, but not by a direct unit test in `test/unit/preload.test.ts`;
- Receita Web remains assisted and experimental, so there is no robust automated
  live batch E2E promise;
- Windows packaging/release/updater/diagnostic/telemetry/license flows remain
  outside the approved scope.

## Test Obligation Matrix

| Obligation | Level | Evidence | Result | Residual risk |
|---|---|---|---|---|
| Core CSV processing, CNPJ normalization, duplicate handling and summary totals | integration/unit | `pnpm test`; `pnpm smoke:real-csv`; `TMPDIR=/private/tmp SMOKE_PROVIDER=base-publica-local pnpm smoke:real-csv` | pass | No line coverage percentage yet |
| Run ledger, cancellation and resume semantics | integration/unit + Electron smoke | `test/integration/process-csv-ledger-resume.test.ts`; `test/unit/main/file-process-execution-ledger.test.ts`; `pnpm smoke:electron-ui` | pass | Smoke uses fixture-sized CSV |
| IPC validation before side effects | unit | `test/unit/process-csv.ipc.test.ts`; `test/unit/process-csv.ipc.delivery.test.ts` | pass | Electron APIs are mocked in unit tests |
| Preload forwarding for process and resume delivery options | unit | `test/unit/preload.test.ts` | pass | Direct preload coverage for local-base prepare is still missing |
| Renderer initial state and post-sync local-base preparation gating | unit | `test/unit/app-view.test.ts`; `test/unit/app-sync.test.ts` | pass | Unit checks assert HTML/rule state, not full browser interaction |
| Electron app real bridge/IPC/history/checkpoint/autosave XLSX | runtime smoke | `pnpm smoke:electron-ui`; `FISCAL_DESK_SMOKE_PROVIDER=base-publica-local pnpm smoke:electron-ui` | pass | Fixture data only; not large-file stress |
| Visual/responsive behavior and obvious layout regressions | browser/visual | `pnpm smoke:visual` | pass | No pixel-diff baseline gate; smoke checks overflow, clipped buttons and overlaps |
| Quantitative coverage report | coverage tooling | `pnpm exec vitest run --coverage --coverage.reporter=text-summary --coverage.reporter=json-summary` | blocked | Missing `@vitest/coverage-v8` |

## Finding And Fix During Audit

The Base Pública Local CLI smoke path was not qualitatively sound after the
consent hardening. Running
`SMOKE_PROVIDER=base-publica-local pnpm smoke:real-csv` outside the sandbox
failed with:

`Consentimento explícito é obrigatório antes de preparar a Base Pública Local.`

The smoke harness was fixed in `scripts/smoke-real-csv.ts` to pass explicit Data
da Base consent when preparing the local fixture. After the fix,
`TMPDIR=/private/tmp SMOKE_PROVIDER=base-publica-local pnpm smoke:real-csv`
passed and validated:

- provider `base-publica-local`;
- 5 input rows;
- 5 CNPJs found;
- 4 valid CNPJs;
- 3 unique lookups;
- 2 optantes;
- 2 não optantes;
- 1 error.

## Evidence Ledger

| Evidence | Scope | Result |
|---|---|---|
| `pnpm lint` | repository lint | pass, 119 files checked |
| `pnpm typecheck` | TypeScript project | pass |
| `pnpm test` | full Vitest suite | pass, 40 files and 255 tests |
| `TMPDIR=/private/tmp SMOKE_PROVIDER=base-publica-local pnpm smoke:real-csv` | CLI real CSV with Base Pública Local fixture | pass |
| `pnpm smoke:electron-ui` | built Electron app with mock provider | pass, XLSX autosave, checkpoint and history validated |
| `FISCAL_DESK_SMOKE_PROVIDER=base-publica-local pnpm smoke:electron-ui` | built Electron app with Base Pública Local | pass, base preparation, consent, resume, XLSX autosave and history validated |
| `pnpm smoke:visual` | Chromium visual/responsive smoke | pass, no overflow, clipped buttons or overlaps |
| `pnpm exec vitest run --coverage --coverage.reporter=text-summary --coverage.reporter=json-summary` | quantitative coverage | blocked, missing `@vitest/coverage-v8` |

## Closeout

The qualitative gate validates real behavior for the current approved Fiscal
Desk surfaces: core processing, IPC/preload processing path, renderer state,
Electron runtime smoke, local history, checkpoint resume, XLSX output and visual
layout.

The next testing-infra owner window should add the Vitest coverage provider,
define the canonical coverage script, activate the quality gate only after the
report is generated, and add direct preload unit coverage for
`prepareLocalPublicBase`.

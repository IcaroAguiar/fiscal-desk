# Testing-Infra Coverage Gate Canonical Integration

Date: 2026-06-13 13:40 -03
Judge: Codex primary orchestrator
Worker thread: `019ec1c2-abc1-7ce2-8b68-212c2e152a19`
Canonical branch: `feat/fiscal-desk-local-base-prep`
Status: `integrated_validated_pass_with_risk`

## Decision

The reworked `testing_infra_coverage_gate` candidate is integrated in the
canonical worktree as a non-feature testing-infra slice.

The first worker result was rejected because the default ratchet compared
`origin/main...HEAD` and pulled historical branch noise into the detached
worker context. The rework preserved the default PR/CI behavior and added an
explicit local worker mode: `QUALITY_GATE_DIFF_MODE=worktree`.

During canonical integration, the judge corrected the coverage universe to
`src/**/*.{ts,tsx}` so the report measures Electron app source instead of local
docs, scripts, skills or orchestration artifacts.

## Integrated Files

- `package.json`
- `pnpm-lock.yaml`
- `vitest.config.ts`
- `docs/ai/quality-gate/check-ratchet.mjs`
- `docs/ai/quality-gate/quality-gate.config.json`
- `docs/ai/quality-gate/README.md`
- `test/unit/preload.test.ts`
- `docs/goals/fiscal-desk-orchestration/results/testing-infra-coverage-gate-*.md`

## Test Obligation Matrix

| Obligation | Level | Required | Coverage | Execution | Result | Residual risk |
|---|---|---|---|---|---|---|
| Generate quantitative coverage for app source | coverage | yes | `pnpm test:coverage`, `coverage/coverage-summary.json`, `coverage/lcov.info` | `pnpm test:coverage` | pass, 40 files / 256 tests | Global coverage is a baseline signal, not functional proof |
| Keep coverage scoped to Electron app source | config | yes | `vitest.config.ts` include `src/**/*.{ts,tsx}` | inspected and reran coverage | pass | Non-product files are excluded from the metric |
| Prove preload bridge for Base Publica Local preparation | unit/contract | yes | `test/unit/preload.test.ts` | `pnpm exec vitest run test/unit/preload.test.ts` | pass, 1 file / 3 tests | Future IPC handler changes still require runtime smoke |
| Preserve final PR/CI ratchet behavior | CI | yes | default `check-ratchet.mjs` mode unchanged | `node docs/ai/quality-gate/check-ratchet.mjs` | contextual fail in current branch | Fails on historical `origin/main...HEAD` diff; preserved for final branch/PR validation |
| Prove bounded worker ratchet mode | CI/local | yes | `QUALITY_GATE_DIFF_MODE=worktree` | `QUALITY_GATE_DIFF_MODE=worktree node docs/ai/quality-gate/check-ratchet.mjs` | pass | Local mode is not a substitute for PR/CI |
| Confirm integrated app behavior through Electron | smoke/E2E | yes | existing smoke commands rerun in canonical worktree | `pnpm smoke:electron-ui`; `FISCAL_DESK_SMOKE_PROVIDER=base-publica-local pnpm smoke:electron-ui` | pass | Receita Web live remains assisted/experimental |
| Confirm CSV/provider behavior outside Electron | smoke | yes | Base Publica Local real CSV smoke | `TMPDIR=/private/tmp SMOKE_PROVIDER=base-publica-local pnpm smoke:real-csv` | pass | Sandbox required escalation for tsx pipe creation |
| Confirm UI layout remains coherent | visual | yes | visual smoke desktop/tablet/mobile | `pnpm smoke:visual` | pass | Visual proof is smoke-level, not exhaustive manual QA |
| Validate repo health after dependency change | build/test | yes | install, lint, typecheck, full tests, build | commands below | pass | Dependency file warning is expected and documented |

## Evidence Ledger

| Evidence | Scope | Result |
|---|---|---|
| `pnpm install --offline` | lockfile and dependency provider availability | pass |
| `pnpm exec vitest run test/unit/preload.test.ts` | direct preload bridge test | pass, 1 file / 3 tests |
| `pnpm test:coverage` | full Vitest suite with coverage over `src/**` | pass, 40 files / 256 tests |
| `QUALITY_GATE_DIFF_MODE=worktree node docs/ai/quality-gate/check-ratchet.mjs` | bounded worker quality gate | pass, no failures |
| `pnpm test` | full Vitest suite without coverage | pass, 40 files / 256 tests |
| `pnpm typecheck` | TypeScript project check | pass |
| `pnpm lint` | Biome lint/check | pass, 119 files checked |
| `pnpm build` | Vite + tsup build | pass |
| `TMPDIR=/private/tmp SMOKE_PROVIDER=base-publica-local pnpm smoke:real-csv` | real CSV/Base Publica Local smoke | pass |
| `pnpm smoke:electron-ui` | Electron runtime with `mock` provider | pass |
| `FISCAL_DESK_SMOKE_PROVIDER=base-publica-local pnpm smoke:electron-ui` | Electron runtime with Base Publica Local provider | pass |
| `pnpm smoke:visual` | desktop/tablet/mobile visual smoke | pass |
| `git diff --check` | whitespace/conflict marker check | pass |
| `node docs/ai/quality-gate/check-ratchet.mjs` | default final-branch/PR ratchet | contextual fail on historical branch diff |

Coverage summary for `src/**`:

- lines: 69.24%
- statements: 69.24%
- functions: 86.82%
- branches: 75.32%

## Dependency Warning

The harness reported `dependency_file_change=2` because `package.json` and
`pnpm-lock.yaml` changed. This is expected for this owner window: Vitest coverage
requires the `@vitest/coverage-v8@3.2.4` provider. The risk was validated by
offline install, full tests, coverage, build and runtime smokes.

## Residual Risk

- Coverage is below an operational 80% baseline and cannot be used as sole
  acceptance proof.
- The default ratchet still needs final PR/CI or equivalent branch context; the
  current local branch keeps historical diff noise.
- Receita Web remains assisted/experimental and is not promised as robust live
  batch automation.
- Windows packaging, updater, telemetry, license/account behavior, release
  configuration, storage/network expansion and guided delivery customization
  remain blocked until a fresh owner window.
- Untracked `skills/**` paths are intentionally excluded local workflow bundles,
  not part of this integration package.

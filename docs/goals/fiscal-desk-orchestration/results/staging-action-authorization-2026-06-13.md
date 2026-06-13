# Fiscal Desk Staging Action Authorization

Date: 2026-06-13 12:00:10 -03
Judge: Codex primary orchestrator

## Decision

`authorized_by_judge`

The approved staging/versioning closeout is now treated as authorization for the
primary orchestrator to execute the path-explicit staging action. This corrects
the previous operational gap where an approved closeout still left the project
waiting on an extra manual gate.

This authorization does not approve a blind `git add .`, production deploy,
release, push or PR creation. It approves only the staged package described by
`results/staging-versioning-closeout.md` and the exclusions accepted in
`results/staging-versioning-closeout-judge-decision.md`.

## Authorized Action

The orchestrator must:

- stage the integrated source, tests, scripts and durable `docs/goals/**`
  package by explicit paths only;
- keep `skills/**`, every `.inputs.json`, `.visual-fidelity/**`,
  `docs/fiscal-desk/**`, `dist/**` and `dist-electron/**` out of the stage set;
- run cached-diff validation immediately after staging;
- keep runtime update, diagnostic package generation, telemetry transport,
  license/account behavior, updater metadata, release/package configuration,
  storage/network behavior, guided delivery customization, renderer template UI
  and reusable delivery models blocked until a fresh owner-window decision.

## Required Post-Stage Checks

- `git diff --cached --name-only` reviewed for excluded paths.
- `git diff --cached --check`.
- Redacted secret scan when available; if `gitleaks` is unavailable, record the
  blocker and run a path-only fallback without exposing values.
- `pnpm lint`.
- `pnpm typecheck`.
- `pnpm test`.
- Coverage status recorded. Coverage cannot be reported as pass until the repo
  has the Vitest coverage provider and a generated `coverage/coverage-summary.json`.
- `pnpm build`.
- Visual/Electron smoke when environment permits.

## Stop Conditions

Stop and mark `needs_rework` if:

- the staged diff includes excluded paths;
- cached diff check fails;
- secret scan reports a material leak;
- validation fails twice with the same signature;
- staging requires package/release/update/network/telemetry/license surfaces
  outside the accepted package.

## Next Owner Window Policy

After path-explicit staging and cached validation pass, the current integrated
phase package is considered closed for orchestration purposes. The next material
Fiscal Desk work may be scoped by the judge, but only as a fresh owner window
with explicit allowed writes and no collision with the staged package.

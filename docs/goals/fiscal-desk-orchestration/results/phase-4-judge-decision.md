# Judge Decision: F4 Provider Catalog Health Fallback

Updated: 2026-06-13

## Verdict

`approved_by_judge_pending_integration`

The F4 contract package is accepted for integration. F5 and F7 are not released until F4 is integrated into the single final worktree and revalidated there.

## Evidence Reviewed

- Thread `019ebf2a-4b59-78c0-85dd-7c93093e8043` completed idle with status `approved_candidate`.
- Receipt: `results/phase-4-provider-catalog-health-fallback.md`.
- Diff scoped to provider catalog/health/fallback/factory/config/CNPJa retry and focused tests.
- Judge reran focused provider tests: pass, 11 tests.
- `git diff --check`: pass.
- Independent reviewer and security-reviewer final results: no blocking findings.

## Integration Queue

Integrate F4 as a core provider contract package, excluding inherited renderer/scripts/state/skills files from that worktree.

Required post-integration checks:

- `pnpm exec vitest run test/unit/simples-provider.catalog.test.ts test/unit/simples-provider.fallback.test.ts test/unit/simples-provider.health.test.ts test/unit/cnpja-open-simples-lookup.retry.test.ts`
- `pnpm typecheck`
- `pnpm lint`
- `git diff --check`

## Residual Risk Accepted

The fallback wrapper is intentionally not wired into runtime yet. F5/F7 should consume the contract after integration, and any runtime wiring must be separately judged.

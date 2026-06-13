# F4 Provider Catalog, Health And Fallback Receipt

Updated: 2026-06-13

## Status

`approved_candidate`

Thread: `019ebf2a-4b59-78c0-85dd-7c93093e8043`
Worktree: `/Users/icaroaguiar/.codex/worktrees/2c20/consulta-simples-csv`

F4 defined provider catalog, health/cooldown and fallback semantics without touching renderer, IPC/preload, `process-csv`, stage, commit, push or PR.

## Files Changed

- `src/core/simples/simples-provider.catalog.ts`
- `src/core/simples/simples-provider.health.ts`
- `src/core/simples/simples-provider.fallback.ts`
- `src/core/simples/simples-provider.factory.ts`
- `src/core/simples/simples-provider.config.ts`
- `src/core/simples/adapters/cnpja-open-simples-lookup.adapter.ts`
- `test/unit/simples-provider.catalog.test.ts`
- `test/unit/simples-provider.health.test.ts`
- `test/unit/simples-provider.fallback.test.ts`
- `test/unit/cnpja-open-simples-lookup.retry.test.ts`

## Checks

- `pnpm install`: pass in F4, lockfile unchanged.
- Focused provider tests: pass in F4.
- `pnpm typecheck`: pass in F4.
- `pnpm test`: pass in F4, 196 tests.
- Focused `pnpm exec biome check ...`: pass in F4.
- `git diff --check`: pass.
- Judge reran focused provider tests: pass, 11 tests.
- Independent reviewer and security-reviewer final rechecks: no blocking findings.

## Provider Catalog Contract

F4 introduced explicit provider metadata:

- provider name/label;
- mode: `offline`, `local`, `online` or `assisted`;
- capabilities for automatic fallback, batch lookup, deterministic smoke, offline lookup and visible browser;
- requirements and limits;
- retry policy with `maxAttempts` and `cooldownMs`.

Semantics:

- `mock`: offline deterministic primary, excluded from automatic fallback.
- `base-publica-local`: local/offline-capable and eligible for automatic fallback when prepared.
- `cnpja-open`: online provider, eligible for automatic fallback with centralized retry/cooldown.
- `receita-web`: assisted, experimental, visible-browser only, no batch, no deterministic smoke and no automatic fallback.

`loadProviderConfig()` now derives valid providers from the catalog.

## Health And Fallback Contract

- `SimplesProviderHealthRegistry` tracks health, consecutive failures, cooldown, last check and public failure messages.
- Retryable statuses are centralized: `TEMPORARY_ERROR`, `BLOCKED`, `CAPTCHA_REQUIRED`, `UNPARSABLE_RESULT`.
- Terminal statuses do not trigger hidden fallback: `SUCCESS`, `NOT_FOUND`, `PERMANENT_ERROR`, `INVALID_CNPJ`.
- Assisted providers are never attempted automatically.
- Fallback candidates require `automaticFallback: true`.
- CNPJa is single-attempt inside the fallback wrapper, preserving direct-use default retry while preventing multiplied retry budgets.
- Exception messages are sanitized before reaching public result/health state.

## Security Review Rework

Valid findings fixed:

- `mock` could mask real provider failures if used in automatic fallback.
- CNPJa retry budget could multiply between adapter and wrapper.
- Raw exception messages could leak provider/browser/HTTP details into output or health.
- Removing `mock` from fallback initially risked breaking mock as explicit primary; this was fixed and covered by test.

## Dependencies

F4 can unblock F5 and F7 only after its code is integrated into the final branch and checked there. Until then, F5/F7 remain blocked by integration.

## Residual Risks

- `raw?: unknown` remains in the existing `SimplesLookupResult` surface; future UI/export wiring must continue sanitizing diagnostics.
- Provider modes/status literals are centralized contract values and remain visible to the harness `magic_string_boundary` warning.
- Fallback wrapper is not wired into IPC or `process-csv` in F4 because those surfaces were out of scope.
- Worktree had inherited renderer/script/skills changes outside F4; they are excluded.

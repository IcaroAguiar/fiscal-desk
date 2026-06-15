# Phase 7A - Receita Web Assisted Contract

Updated: 2026-06-13

## Status

`approved_candidate`

F7A fechou contrato e implementacao minima de diagnostico sanitizado para Receita Web assistida dentro do adapter. O resultado nao declara automacao robusta, fallback automatico, smoke deterministico, UI nova, backend remoto, banco, PDF, release ou execucao real contra a Receita.

## Source Thread

- Delegated source thread: `019ebe5c-3853-79c2-87ad-8ddace386c93`
- Execution worktree: `/Users/icaroaguiar/.codex/worktrees/a3a8/consulta-simples-csv`

## Files Read

- `docs/goals/fiscal-desk-orchestration/goal.md`
- `docs/goals/fiscal-desk-orchestration/subagent-registry.md`
- `docs/goals/fiscal-desk-orchestration/integration-plan.md`
- `docs/goals/fiscal-desk-orchestration/state.yaml`
- `docs/goals/fiscal-desk-orchestration/results/integration-wave-1-f1-f2-f4.md`
- `docs/goals/fiscal-desk-orchestration/results/integration-wave-2-f3-f5.md`
- `docs/goals/fiscal-desk-orchestration/results/phase-4-judge-decision.md`
- `docs/goals/fiscal-desk-orchestration/phases/phase-7-receita-web-assistida.md`
- `src/core/simples/simples-lookup.types.ts`
- `src/core/simples/simples-lookup.port.ts`
- `src/core/simples/simples-provider.catalog.ts`
- `src/core/simples/simples-provider.names.ts`
- `src/core/simples/simples-provider.factory.ts`
- `src/core/simples/adapters/receita-web/index.ts`
- `src/core/simples/adapters/receita-web/receita-browser.client.ts`
- `src/core/simples/adapters/receita-web/receita-consulta-optantes.adapter.ts`
- `src/core/simples/adapters/receita-web/receita-result.parser.ts`
- `src/core/simples/adapters/receita-web/receita.selectors.ts`
- `test/unit/receita-result.parser.test.ts`
- `test/unit/receita-consulta-optantes.adapter.test.ts`
- `test/unit/receita-browser.client.test.ts`
- `test/unit/simples-provider.catalog.test.ts`
- `test/unit/simples-provider.health.test.ts`
- `test/unit/simples-provider.factory.test.ts`
- `test/unit/simples-provider.config.test.ts`
- `package.json`

## Files Changed

- `src/core/simples/adapters/receita-web/receita-diagnostics.ts`
- `src/core/simples/adapters/receita-web/index.ts`
- `src/core/simples/adapters/receita-web/receita-consulta-optantes.adapter.ts`
- `src/core/simples/adapters/receita-web/receita-result.parser.ts`
- `test/unit/receita-result.parser.test.ts`
- `test/unit/receita-consulta-optantes.adapter.test.ts`

## Files Not Changed

- `src/core/simples/simples-lookup.types.ts`
- `src/core/simples/simples-provider.factory.ts`
- `src/renderer/**`
- F6 ingestion/export surfaces
- RunLedger, IPC, preload, release/update, backend remoto, banco, PDF, smoke deterministico
- `docs/goals/fiscal-desk-orchestration/state.yaml`

## Contract

Central contract owner: `src/core/simples/adapters/receita-web/receita-diagnostics.ts`.

Status and payload shape:

- Public lookup statuses remain the existing `SimplesLookupStatus` values: `SUCCESS`, `INVALID_CNPJ`, `NOT_FOUND`, `TEMPORARY_ERROR`, `PERMANENT_ERROR`, `CANCELLED`, `BLOCKED`, `CAPTCHA_REQUIRED`, `UNPARSABLE_RESULT`.
- Receita Web diagnostic codes are centralized in `RECEITA_WEB_DIAGNOSTIC_CODE`: `browser_unavailable`, `captcha_required`, `fill_failed`, `invalid_cnpj`, `navigation_failed`, `not_found`, `portal_blocked`, `result_success`, `submit_failed`, `temporary_error`, `unparsable_result`, `wait_result_failed`.
- `createReceitaWebResult` keeps the normal `SimplesLookupResult` envelope, with `source: "receita-web"` and `raw` set only to `ReceitaWebDiagnostic`.
- `ReceitaWebDiagnostic` is explicit about assisted mode: `assisted: true`, `experimental: true`, `visibleBrowserRequired: true`.
- Diagnostic payloads declare and enforce `containsRawHtml: false` and `containsCnpj: false`.
- Optional diagnostic metadata is limited to `htmlLength`, `hasCaptcha`, `hasError`, and `hasResult`.

## Sanitization

- Raw HTML remains local to `receita-result.parser.ts` classification and is not copied into `raw`, logs, fixtures, receipt, or public output.
- Browser client errors are not propagated verbatim from navigation, fill, submit, wait-result, or missing-browser paths; adapter messages are fixed and sanitized.
- Tests touched in F7A use sanitized identifiers such as `cnpj-sanitizado` and text snippets instead of numeric CNPJs or raw HTML fixtures.
- Focused scan found no raw HTML fixture marker, numeric/formatted CNPJ pattern, screenshot, cookie, token or credential in changed Receita Web files and touched tests.

## Security Review

Independent security reviewer: `019ebf55-9712-7ae3-a7c1-4d77a9b49b81`.

Result: no blocking findings, low risk.

Reviewer evidence:

- `receita-diagnostics.ts` declares `containsRawHtml: false` and `containsCnpj: false`, builds controlled metadata only, and places only that diagnostic in `raw`.
- `receita-consulta-optantes.adapter.ts` substitutes raw browser-client errors with fixed messages.
- `receita-result.parser.ts` uses HTML only for classification and stores only `htmlLength`, flags and code in `raw`.
- Touched tests use sanitized identifiers and validate that diagnostic `raw` does not contain page text or lookup identifier.

Residual from reviewer: review was limited to F7A scope. Other dirty worktree changes from prior integrated phases were not re-reviewed here.

## Checks

- Initial focused test before dependency install failed because `node_modules` was absent: `pnpm exec vitest ...` returned `Command "vitest" not found`.
- `pnpm install`: pass, lockfile already up to date and packages reused from local store.
- Focused tests after implementation: `pnpm exec vitest run test/unit/receita-result.parser.test.ts test/unit/receita-consulta-optantes.adapter.test.ts test/unit/simples-provider.catalog.test.ts test/unit/simples-provider.health.test.ts`: pass, 4 files / 34 tests.
- `pnpm typecheck`: pass.
- `pnpm test`: pass, 33 files / 203 tests.
- `pnpm lint`: pass after formatting fixes.
- Focused scan: `rg` for raw HTML markers, numeric/formatted CNPJ, screenshot, cookie, token and credential in changed Receita Web files/tests: no matches.
- `git diff --check`: pass.

## Mock And Smoke Determinism

- `mock` remains the offline default provider; no default-provider config was changed in F7A.
- `receita-web` was not added to deterministic smoke.
- Existing provider catalog semantics remain: Receita Web is `mode: "assisted"`, `automaticFallback: false`, `batchLookup: false`, `deterministicSmoke: false`, `visibleBrowser: true`.

## Stop Conditions

Not hit:

- Requirement to expose raw HTML/CNPJ outside adapter.
- Requirement to make Receita Web fallback automatico.
- Requirement to add Receita Web to deterministic smoke.
- Requirement to validate real Receita Web behavior through CAPTCHA/blocking automation.

Accepted limitation:

- No live Receita Web smoke was attempted. The phase keeps CAPTCHA, anti-bot blocking, slow visible browser and partial/manual recovery as assisted-mode constraints.

## Residual Risks

- Parser still depends on text indicators from a public web page that can change without notice.
- CAPTCHA, IP blocking and browser availability remain runtime constraints.
- `htmlLength` is retained as low-sensitivity diagnostic metadata; it is useful for parser diagnosis but should not be expanded into content snippets.
- Worktree has unrelated dirty changes from prior integrated phases; F7A did not revert or validate those beyond full `pnpm test`, `pnpm typecheck`, `pnpm lint`, and scope review.
- Harness warnings `magic_string_boundary=29` and `visual_surface_change=1` remain inherited from broader worktree context; F7A centralizes its new Receita Web literals in `receita-diagnostics.ts` and did not touch visual surfaces.

## Recommendation

Next subphase should be judged as F7B only after integration review accepts F7A. Recommended order:

1. Integrate the F7A adapter contract into the final worktree.
2. Re-run focused Receita Web tests, provider catalog/fallback tests, `pnpm typecheck`, `pnpm lint`, `pnpm test`.
3. Only then consider UI or assisted-selection copy, still without deterministic smoke or batch-automation promise.
4. Keep any real Receita Web validation manual/assisted and stop on CAPTCHA or structural anti-bot blocking.

# Phase 7B - Receita Web Adapter-Core Hardening

Updated: 2026-06-13

## Status

`approved_candidate`

F7B endureceu apenas o core do adapter Receita Web assistido. O candidate
continua limitado a modo assistido, experimental, opcional e com navegador
visivel. Esta fase nao declara F7 pronta e nao aprova robustez em lote, fallback
automatico, provider health, UI, smoke real, CI/network validation, CAPTCHA
automation, diagnostico compartilhado, backend remoto, banco, PDF/OCR, release
ou qualquer mudanca fora da janela do adapter.

Este status vale somente para o diff F7B isolado. A worktree contem mudancas
preexistentes fora de F7B; elas permanecem risco de integracao/judge e nao sao
reivindicadas por este receipt.

## Files Read

- `AGENTS.md`
- `docs/goals/fiscal-desk-orchestration/goal.md`
- `docs/goals/fiscal-desk-orchestration/state.yaml`
- `docs/goals/fiscal-desk-orchestration/subagent-registry.md`
- `docs/goals/fiscal-desk-orchestration/integration-plan.md`
- `docs/goals/fiscal-desk-orchestration/phases/phase-7-receita-web-assistida.md`
- `docs/goals/fiscal-desk-orchestration/results/phase-7a-receita-web-assisted-contract.md`
- `docs/goals/fiscal-desk-orchestration/results/phase-7a-judge-decision.md`
- `docs/goals/fiscal-desk-orchestration/results/integration-wave-3-f6a-f7a.md`
- `docs/goals/fiscal-desk-orchestration/results/phase-7b-receita-web-security-scope-review.md`
- `docs/goals/fiscal-desk-orchestration/results/phase-7b-receita-web-security-scope-review-judge-decision.md`
- `docs/fiscal-desk/phase-orchestration.md`
- `docs/fiscal-desk/product-spec.md`
- `docs/fiscal-desk/executor-packets/011-provider-health-fallback-policy.md`
- `docs/adr/0003-receita-web-como-confirmacao-faseada.md`
- `docs/adr/0010-status-e-teste-seguro-de-conexao-de-provedor.md`
- `docs/adr/0013-divergencias-sem-vencedor-automatico-oculto.md`
- `docs/adr/0032-pacote-de-diagnostico-local-e-revisavel.md`
- `src/core/simples/adapters/receita-web/index.ts`
- `src/core/simples/adapters/receita-web/receita-browser-path.ts`
- `src/core/simples/adapters/receita-web/receita-browser.client.ts`
- `src/core/simples/adapters/receita-web/receita-consulta-optantes.adapter.ts`
- `src/core/simples/adapters/receita-web/receita-diagnostics.ts`
- `src/core/simples/adapters/receita-web/receita-result.parser.ts`
- `src/core/simples/adapters/receita-web/receita.selectors.ts`
- `test/unit/receita-result.parser.test.ts`
- `test/unit/receita-consulta-optantes.adapter.test.ts`
- `test/unit/receita-browser.client.test.ts`

## Files Changed

Edited in this F7B pass:

- `src/core/simples/adapters/receita-web/receita-browser.client.ts`
- `src/core/simples/adapters/receita-web/receita-consulta-optantes.adapter.ts`
- `src/core/simples/adapters/receita-web/receita-result.parser.ts`
- `test/unit/receita-result.parser.test.ts`
- `test/unit/receita-consulta-optantes.adapter.test.ts`
- `test/unit/receita-browser.client.test.ts`
- `docs/goals/fiscal-desk-orchestration/results/phase-7b-receita-web-implementation.md`

In-scope dependency from the integrated F7A contract, reviewed but not newly
edited here:

- `src/core/simples/adapters/receita-web/receita-diagnostics.ts`
- `src/core/simples/adapters/receita-web/index.ts`

Not edited:

- `docs/fiscal-desk/**`
- `docs/adr/**`
- `docs/goals/fiscal-desk-orchestration/state.yaml`
- provider factory/config/catalog/fallback/health
- app/main/renderer/ingestion/export/scripts/integration tests

## Implementation Notes

- `ReceitaBrowserClient` now returns fixed internal error codes for navigation,
  fill, submit, wait-result and disconnected-browser failures instead of copying
  raw `Error.message` values into `ReceitaNavigationResult.error`.
- `ReceitaConsultaOptantesAdapter` keeps ignoring browser-client raw errors and
  returns fixed assisted-mode messages plus sanitized `ReceitaWebDiagnostic`
  codes for navigation, fill, submit, wait-result and browser-unavailable
  failures.
- Browser unavailable classification now covers common launch failure shapes and
  still does not copy the exception message to public result or `raw`.
- `parseReceitaResult` now classifies portal blocking by text before relying on
  visible error selectors, so a blocked portal page can return `BLOCKED` even
  when `.alert-danger/.erro/.text-danger` is absent.
- Browser-client unit tests no longer contain HTML-like fixtures or
  numeric/formatted CNPJ values.
- Parser/adapter tests assert that diagnostic `raw` does not contain lookup id,
  page text, HTML-like marker, browser error marker or dynamically constructed
  sensitive markers.

## Commands And Checks

- `rg -n "rawHtml|<html|<!DOCTYPE|screenshot|cookie|token|credential|[0-9]{2}\\.?[0-9]{3}\\.?[0-9]{3}/?[0-9]{4}-?[0-9]{2}" src/core/simples/adapters/receita-web test/unit/receita-result.parser.test.ts test/unit/receita-consulta-optantes.adapter.test.ts test/unit/receita-browser.client.test.ts`: pass, no matches.
- `pnpm exec vitest run test/unit/receita-result.parser.test.ts test/unit/receita-consulta-optantes.adapter.test.ts test/unit/receita-browser.client.test.ts`: initial blocked because `vitest` was not installed in this worktree.
- `pnpm install`: pass, lockfile already up to date, packages reused from local store. The project postinstall ran local Playwright setup; no Receita Web live smoke or portal validation was run.
- `pnpm exec vitest run test/unit/receita-result.parser.test.ts test/unit/receita-consulta-optantes.adapter.test.ts test/unit/receita-browser.client.test.ts`: pass after final parser fix, 3 files / 74 tests.
- `pnpm exec vitest run test/unit/simples-provider.catalog.test.ts test/unit/simples-provider.health.test.ts test/unit/simples-provider.fallback.test.ts`: pass, 3 files / 9 tests.
- `pnpm typecheck`: pass.
- `pnpm lint`: pass, 111 files.
- `git diff --check`: pass.

No live Receita Web smoke was run. No CAPTCHA was automated, bypassed or solved.
No stage, commit, push or PR was performed.

## Sensitive Scan Result

Final sensitive scan over `src/core/simples/adapters/receita-web` and the three
Receita unit test files returned no matches for raw HTML fixture markers,
numeric/formatted CNPJ, screenshots, cookies, tokens, credentials or `rawHtml`.

The receipt itself documents the scan command and privacy terms, but it is not
part of the scanned code/test path.

## Independent Review

First independent security review result: `needs_rework`.

- Blocking finding: worktree has preexisting dirty changes outside F7B, including
  provider/fallback/health/UI/runtime surfaces. Executor response: not corrected
  because reverting unrelated user/integration changes is prohibited; documented
  here as integration/judge risk and excluded from this candidate claim.
- Residual finding: `BLOCKED` classification depended on `hasError`. Corrected
  in `receita-result.parser.ts` and covered by a new parser test with
  `hasError: false`.

Second independent security review result after correction: `approved_candidate`
for the isolated F7B diff, with no blocking findings.

Reviewer evidence:

- Browser client no longer copies raw `Error.message` into failure results.
- Adapter ignores browser raw errors and returns fixed messages plus diagnostic
  codes.
- Browser-unavailable handling is sanitized.
- Diagnostics remain limited to provider, code, flags and `htmlLength`.
- Abort returns `CANCELLED` without diagnostic raw payload.
- No coupling with UI/factory/fallback/catalog/health was found in the isolated
  F7B diff.

## Stop Conditions

Not hit:

- Need to automate, bypass or solve CAPTCHA.
- Need live Receita Web deterministic smoke or CI/network validation.
- Need robust batch automation, automatic fallback or provider health/fallback
  policy changes.
- Need to persist, log, fixture or publish raw HTML, screenshots, CNPJ bruto or
  fiscal-identifiable content.
- Need renderer/UI and adapter core in the same implementation.
- Need provider factory/fallback/catalog ownership.
- Need browser download/install, release/update or anti-bot evasion beyond the
  current visible-browser experiment.

## Risks

- Receita Web remains visible-browser, assisted and experimental. CAPTCHA,
  portal blocking, browser availability and page text/selector drift remain
  expected runtime constraints.
- `ReceitaBrowserClient` still transports page content internally from the
  browser to the parser on success. This must stay local to parser
  classification and must not be logged, exported, fixture-persisted or copied
  into diagnostics.
- The worktree contains broader preexisting changes outside F7B. This receipt
  does not approve those changes and the judge/integration step must isolate the
  accepted F7B file set.
- Harness warnings `magic_string_boundary=29` and `visual_surface_change=1` are
  inherited from broader worktree context. F7B did not touch renderer or visual
  surfaces; new boundary literals remain confined to the Receita Web adapter
  boundary.
- The command harness reported protected-path-reference warnings for commands or
  review output containing absolute paths. No protected path was edited outside
  the allowed write set.

## Completion Claim

No completion is claimed without judge integration. This receipt only presents
an `approved_candidate` for the bounded F7B adapter-core hardening diff and the
focused evidence above.

# Phase 7B - Receita Web Security Scope Review

Updated: 2026-06-13

## Status

`approved_candidate`

F7B pode virar uma proxima thread de implementacao somente como recorte pequeno
de hardening do core Receita Web assistida, sem declarar F7 pronta e sem
converter Receita Web em provider massivo, fallback automatico ou smoke
deterministico.

Esta aprovacao candidata nao libera UI, runtime compartilhado, templates F6,
release, backend remoto, banco, PDF/OCR, automacao de CAPTCHA, nem validacao
real deterministica contra o portal da Receita.

## Source Thread

- Delegated source thread: `019ebe5c-3853-79c2-87ad-8ddace386c93`
- Review worktree:
  `/Users/icaroaguiar/.codex/worktrees/1d37/consulta-simples-csv`

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
- `docs/fiscal-desk/phase-orchestration.md`
- `docs/fiscal-desk/product-spec.md`
- `docs/fiscal-desk/executor-packets/011-provider-health-fallback-policy.md`
- `docs/adr/0003-receita-web-como-confirmacao-faseada.md`
- `docs/adr/0010-status-e-teste-seguro-de-conexao-de-provedor.md`
- `docs/adr/0013-divergencias-sem-vencedor-automatico-oculto.md`
- `docs/adr/0032-pacote-de-diagnostico-local-e-revisavel.md`
- `src/core/simples/adapters/receita-web/receita-diagnostics.ts`
- `src/core/simples/adapters/receita-web/receita-consulta-optantes.adapter.ts`
- `src/core/simples/adapters/receita-web/receita-browser.client.ts`
- `src/core/simples/adapters/receita-web/receita-result.parser.ts`
- `src/core/simples/adapters/receita-web/receita.selectors.ts`
- `src/core/simples/adapters/receita-web/receita-browser-path.ts`
- `src/core/simples/simples-provider.factory.ts`
- `test/unit/receita-consulta-optantes.adapter.test.ts`
- `test/unit/receita-result.parser.test.ts`

Earlier in this review, `docs/fiscal-desk/**` was not present in the delegated
worktree. The orchestrator copied it back as read-only context, and this receipt
was updated after reading the mandatory product/fallback documents. No required
input remains missing for this docs-only scope review.

## Decision

Approved candidate for one bounded worker:

- harden the existing Receita Web adapter/client/parser diagnostics;
- sanitize existing browser-client test evidence that currently uses literal
  HTML snippets and numeric fake CNPJ values;
- add focused unit coverage for stop conditions and sanitized diagnostics;
- keep all live Receita behavior manual/assisted and non-deterministic.
- keep any future large-volume Receita Web semantics outside F7B. Product docs
  allow only conservative, phased, user-controlled Receita Web usage later; F7B
  does not implement that queue/orchestration layer.

Not approved:

- renderer/UI copy or controls;
- provider factory ownership changes;
- automatic fallback policy changes;
- deterministic smoke with `receita-web`;
- real Receita portal smoke as an acceptance gate;
- execution queue, phased large-volume orchestration, provider health UI or
  divergence policy implementation;
- F6E/templates or output customization.

## Security And Contract Gaps

- Raw HTML currently remains local to parser/client flow, but
  `test/unit/receita-browser.client.test.ts` still contains literal mock HTML
  strings and numeric fake CNPJ values. F7B must sanitize that test file if it
  touches browser-client coverage.
- `ReceitaWebDiagnostic` correctly declares `containsRawHtml: false` and
  `containsCnpj: false`; F7B must not add snippets, selectors, page text, CNPJ,
  screenshots, response excerpts or browser errors to `raw`, logs, fixtures or
  receipts.
- The public `SimplesLookupResult.cnpj` is an existing provider contract. F7B
  must not duplicate the identifier inside diagnostics and must not broaden
  public evidence with fiscal-identifiable page content.
- Product and ADR context requires diagnostic packages to be local, sanitized
  and user-reviewable. F7B must not add automatic upload, telemetry, support
  package generation or sharing flows.
- The fallback packet requires budgets/cooldowns and explicitly says Receita
  Web must not be fallback automatico para lista grande. F7B must not alter
  fallback policy or provider health state.
- ADR 0013 forbids hidden automatic winners for provider divergence. F7B must
  not use Receita Web to silently override another provider result.
- Browser-client methods return raw page HTML internally. F7B may test that
  internal behavior only with sanitized symbolic text, never real portal HTML
  or realistic CNPJ.
- CAPTCHA and anti-bot handling must end in `CAPTCHA_REQUIRED`, `BLOCKED`,
  `TEMPORARY_ERROR` or `UNPARSABLE_RESULT`; F7B must not attempt CAPTCHA
  solving or stealth escalation.
- Windows Chrome/Edge detection can stay limited to local executable discovery.
  F7B must not bundle browsers, download browsers, mutate user installs or add
  release/update behavior.
- `--disable-blink-features=AutomationControlled` and fixed user-agent behavior
  are anti-bot-sensitive surfaces. F7B may document or test bounded behavior,
  but must stop if the implementation requires stronger evasion.

## Evidence Rules

Allowed sanitized evidence:

- symbolic CNPJ labels such as `cnpj-sanitizado`;
- short non-HTML page-text tokens such as `pagina sem resultado`;
- boolean flags: `hasCaptcha`, `hasError`, `hasResult`;
- numeric `htmlLength` only if it remains content-free;
- diagnostic codes from `RECEITA_WEB_DIAGNOSTIC_CODE`;
- test assertions proving `raw` does not contain lookup id or page text.
- aggregated provider health/failure states only if content-free and local to
  tests; no provider credential values or real portal response content.

Forbidden logs, fixtures and public receipts:

- raw HTML, HTML-like fixtures such as `<html>...</html>` or `<!DOCTYPE ...>`;
- screenshots, video captures or OCR output from the Receita page;
- numeric or formatted CNPJ, even fake-looking examples;
- fiscal-identifiable page content, company names, taxpayer status excerpts tied
  to an identifier, cookies, localStorage, tokens, browser profiles or full
  Playwright errors that may include page state;
- any evidence from real Receita Web runs unless manually redacted and kept out
  of versioned fixtures/results.
- automatic diagnostic package output containing CNPJ bruto, fiscal status,
  screenshots, raw page content, cookies, tokens or credentials.

## Recommended Owner Window

Single owner: `receita_web_adapter_core_hardening`.

The worker may own only Receita Web adapter-core files and focused unit tests.
It must not also own renderer/UI, IPC/preload, process-csv runtime, provider
factory, fallback policy or F6 templates. If provider selection, fallback or UI
copy becomes necessary, stop and request a separate judge window.

Future Receita Web volume/faseamento, if ever approved, needs a separate owner
window for execution queue, provider health/fallback budget and user-facing
copy. It must not be smuggled into this adapter-core hardening worker.

## Allowed Writes For Next Thread

- `src/core/simples/adapters/receita-web/receita-diagnostics.ts`
- `src/core/simples/adapters/receita-web/receita-consulta-optantes.adapter.ts`
- `src/core/simples/adapters/receita-web/receita-browser.client.ts`
- `src/core/simples/adapters/receita-web/receita-result.parser.ts`
- `src/core/simples/adapters/receita-web/receita.selectors.ts`
- `src/core/simples/adapters/receita-web/receita-browser-path.ts`
- `test/unit/receita-consulta-optantes.adapter.test.ts`
- `test/unit/receita-result.parser.test.ts`
- `test/unit/receita-browser.client.test.ts`
- `docs/goals/fiscal-desk-orchestration/results/phase-7b-receita-web-implementation.md`

Optional only if the worker proves the current exports are insufficient and
keeps the change inside the adapter boundary:

- `src/core/simples/adapters/receita-web/index.ts`

## Do Not Touch For Next Thread

- `src/core/simples/simples-provider.factory.ts`
- `src/core/simples/simples-provider.config.ts`
- `src/core/simples/simples-provider.fallback.ts`
- `src/core/simples/simples-provider.catalog.ts`
- `src/core/simples/simples-lookup.types.ts`
- `src/core/app/**`
- `src/main/**`
- `src/renderer/**`
- `src/core/ingestion/**`
- `src/core/export/**`
- `scripts/**`
- `test/integration/**`
- smoke scripts or deterministic smoke fixtures
- F6 templates/output customization
- `docs/goals/fiscal-desk-orchestration/state.yaml`

## Stop Conditions

Stop and return `blocked` or `needs_rework` if the implementation needs any of
the following:

- automate, bypass or solve CAPTCHA;
- validate Receita Web real in deterministic smoke or CI;
- promise robust batch automation or mass fallback;
- persist, log, fixture or publish raw HTML, screenshots, CNPJ bruto or fiscal
  identifiable content;
- touch renderer/UI and adapter core in the same implementation;
- touch provider factory/fallback policy without a single owner window;
- implement provider health UI, divergence policy, automatic winner selection
  or large-volume phased queue;
- modify F6E/templates or output customization;
- download/install browsers or change release/update behavior;
- rely on browser stealth or anti-bot evasion beyond the current bounded
  visible-browser experiment.

## Verification Commands For Next Thread

Minimum focused checks:

```sh
pnpm exec vitest run test/unit/receita-result.parser.test.ts test/unit/receita-consulta-optantes.adapter.test.ts test/unit/receita-browser.client.test.ts
pnpm exec vitest run test/unit/simples-provider.catalog.test.ts test/unit/simples-provider.health.test.ts test/unit/simples-provider.fallback.test.ts
pnpm typecheck
pnpm lint
git diff --check
```

Sensitive-evidence scan before closeout:

```sh
rg -n "rawHtml|<html|<!DOCTYPE|screenshot|cookie|token|credential|[0-9]{2}\\.?[0-9]{3}\\.?[0-9]{3}/?[0-9]{4}-?[0-9]{2}" src/core/simples/adapters/receita-web test/unit/receita-result.parser.test.ts test/unit/receita-consulta-optantes.adapter.test.ts test/unit/receita-browser.client.test.ts
```

Expected result after F7B: no matches except lines that intentionally document
the scan command in the F7B result receipt.

Prohibited as acceptance gates:

- `receita-web` live smoke;
- CI/network Receita Web validation;
- deterministic browser automation against the Receita portal.

## Risks

- The Receita page can change text, selectors or flow without notice.
- CAPTCHA, IP blocking and anti-bot defenses are expected runtime outcomes, not
  bugs to bypass.
- Visible browser availability differs by OS; Windows release depends on Chrome
  or Edge already installed.
- Product docs allow Receita Web only as assisted confirmation, sample,
  divergence or phased mode. That future product scope still needs separate
  orchestration and UI gates; this F7B decision does not approve it.
- The existing worktree has broader dirty integrated changes and harness
  warnings (`magic_string_boundary=29`, `visual_surface_change=1`). They are not
  F7B-specific approval, and the next worker must not expand the visual surface.

## Prompt For Next Subagent

```text
/goal
Execute F7B Receita Web adapter-core hardening for Fiscal Desk.

Use gpt-5.5 with thinking medium. Work in a fresh independent Codex
thread/worktree. Do not claim F7 ready.

Read:
- AGENTS.md
- docs/goals/fiscal-desk-orchestration/goal.md
- docs/goals/fiscal-desk-orchestration/state.yaml
- docs/goals/fiscal-desk-orchestration/subagent-registry.md
- docs/goals/fiscal-desk-orchestration/integration-plan.md
- docs/goals/fiscal-desk-orchestration/phases/phase-7-receita-web-assistida.md
- docs/goals/fiscal-desk-orchestration/results/phase-7a-receita-web-assisted-contract.md
- docs/goals/fiscal-desk-orchestration/results/phase-7a-judge-decision.md
- docs/goals/fiscal-desk-orchestration/results/integration-wave-3-f6a-f7a.md
- docs/goals/fiscal-desk-orchestration/results/phase-7b-receita-web-security-scope-review.md
- docs/fiscal-desk/phase-orchestration.md
- docs/fiscal-desk/product-spec.md
- docs/fiscal-desk/executor-packets/011-provider-health-fallback-policy.md
- docs/adr/0003-receita-web-como-confirmacao-faseada.md
- docs/adr/0010-status-e-teste-seguro-de-conexao-de-provedor.md
- docs/adr/0013-divergencias-sem-vencedor-automatico-oculto.md
- docs/adr/0032-pacote-de-diagnostico-local-e-revisavel.md
- src/core/simples/adapters/receita-web/**
- test/unit/receita-result.parser.test.ts
- test/unit/receita-consulta-optantes.adapter.test.ts
- test/unit/receita-browser.client.test.ts

Allowed writes:
- src/core/simples/adapters/receita-web/receita-diagnostics.ts
- src/core/simples/adapters/receita-web/receita-consulta-optantes.adapter.ts
- src/core/simples/adapters/receita-web/receita-browser.client.ts
- src/core/simples/adapters/receita-web/receita-result.parser.ts
- src/core/simples/adapters/receita-web/receita.selectors.ts
- src/core/simples/adapters/receita-web/receita-browser-path.ts
- src/core/simples/adapters/receita-web/index.ts only if strictly needed
- test/unit/receita-result.parser.test.ts
- test/unit/receita-consulta-optantes.adapter.test.ts
- test/unit/receita-browser.client.test.ts
- docs/goals/fiscal-desk-orchestration/results/phase-7b-receita-web-implementation.md

Do not touch:
- src/core/simples/simples-provider.factory.ts
- src/core/simples/simples-provider.config.ts
- src/core/simples/simples-provider.fallback.ts
- src/core/simples/simples-provider.catalog.ts
- src/core/simples/simples-lookup.types.ts
- src/core/app/**
- src/main/**
- src/renderer/**
- src/core/ingestion/**
- src/core/export/**
- scripts/**
- test/integration/**
- deterministic smoke, F6 templates/output customization, state.yaml, release,
  backend remoto, banco, PDF/OCR.

Tasks:
- Keep Receita Web assisted, visible-browser, experimental and optional.
- Sanitize receita-browser unit tests so no raw HTML fixture or numeric/formatted
  CNPJ remains.
- Add/adjust focused tests proving diagnostics do not contain lookup id, page
  text, raw HTML, screenshots, browser errors, cookies, tokens or credentials.
- Harden adapter/client/parser behavior only where needed for sanitized
  CAPTCHA, blocked, unavailable browser, abort and unparseable-result handling.
- Do not run live Receita Web smoke. Do not automate CAPTCHA. Do not promise
  batch robustness.
- Do not implement provider health, automatic fallback, divergence winner,
  phased large-volume orchestration or diagnostic package sharing.

Verification:
- pnpm exec vitest run test/unit/receita-result.parser.test.ts test/unit/receita-consulta-optantes.adapter.test.ts test/unit/receita-browser.client.test.ts
- pnpm exec vitest run test/unit/simples-provider.catalog.test.ts test/unit/simples-provider.health.test.ts test/unit/simples-provider.fallback.test.ts
- pnpm typecheck
- pnpm lint
- git diff --check
- rg sensitive scan from the F7B scope review, expecting no matches except the
  receipt line documenting the scan.

Receipt:
Create docs/goals/fiscal-desk-orchestration/results/phase-7b-receita-web-implementation.md
with files read, files changed, commands, checks, sensitive scan result, stop
conditions, risks and explicit statement that no completion is claimed without
judge integration.
```

## Completion Claim

This thread is docs-only and does not declare F7 complete. It only recommends a
bounded F7B implementation candidate subject to judge release, focused checks,
sensitive-evidence scan and later integration review in the canonical branch.

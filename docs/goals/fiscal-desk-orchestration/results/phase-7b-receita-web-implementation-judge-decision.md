# Phase 7B Receita Web Implementation Judge Decision

Updated: 2026-06-13

## Decision

`approved_by_judge`

The F7B Receita Web adapter-core hardening candidate is accepted for selective
integration into the canonical branch.

## Evidence Reviewed

- Worker thread: `019ebf8e-61a9-7de2-91ff-5f096803c26f`
- Worker receipt:
  `docs/goals/fiscal-desk-orchestration/results/phase-7b-receita-web-implementation.md`
- Independent review:
  - first pass: `needs_rework`;
  - second pass after parser correction: `approved_candidate`.
- Accepted files:
  - `src/core/simples/adapters/receita-web/receita-browser.client.ts`
  - `src/core/simples/adapters/receita-web/receita-consulta-optantes.adapter.ts`
  - `src/core/simples/adapters/receita-web/receita-result.parser.ts`
  - `test/unit/receita-browser.client.test.ts`
  - `test/unit/receita-consulta-optantes.adapter.test.ts`
  - `test/unit/receita-result.parser.test.ts`

The worker worktree contained inherited dirty/untracked files from earlier
phases. The judge compared and copied only the isolated F7B Receita Web adapter
delta plus its receipt.

## Judge Checks In Worker Worktree

- `pnpm exec vitest run test/unit/receita-result.parser.test.ts test/unit/receita-consulta-optantes.adapter.test.ts test/unit/receita-browser.client.test.ts`
  - pass, 3 files / 74 tests.
- `pnpm exec vitest run test/unit/simples-provider.catalog.test.ts test/unit/simples-provider.health.test.ts test/unit/simples-provider.fallback.test.ts`
  - pass, 3 files / 9 tests.
- `pnpm typecheck`
  - pass.
- `pnpm lint`
  - pass, 111 files.
- `git diff --check`
  - pass.
- Sensitive scan over `src/core/simples/adapters/receita-web` and the three
  Receita unit test files
  - pass, no matches.

## Rationale

F7B stays inside the approved Receita Web adapter-core boundary. It removes raw
browser error propagation from public adapter results, keeps assisted-mode
diagnostics sanitized, broadens browser-unavailable classification, and ensures
portal-blocking text can classify as `BLOCKED` even without visible error
selectors.

The candidate does not touch renderer/UI, provider factory, fallback policy,
provider health/catalog, IPC/preload, app runtime, export/ingestion flows,
release packaging or live Receita Web automation.

## Accepted Risk

Receita Web remains assisted, experimental and optional. CAPTCHA, anti-bot
blocking, browser availability and selector/text drift are expected runtime
constraints, so this phase is not evidence of robust batch automation.

The browser client still transports page content internally to the parser on a
successful visible-browser lookup. That content must remain local to parser
classification and must not be logged, exported, fixture-persisted or copied
into diagnostics.

The broader harness warnings `magic_string_boundary=29` and
`visual_surface_change=1` remain worktree-level warnings. F7B confines new
literals to the Receita Web adapter boundary and does not touch visual surfaces.

## Result

F7B is approved for selective canonical integration. F7 is still not complete:
no live Receita Web smoke, CAPTCHA automation, robust batch operation, provider
fallback policy or UI flow is approved by this decision.

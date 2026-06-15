# Integration Wave 8: F6E1 Export Contract + F7B Receita Web Hardening

Updated: 2026-06-13

## Status

`integrated_validated`

Wave 8 is integrated into the canonical branch
`feat/fiscal-desk-local-base-prep`. F6E1 had already been integrated and
validated as a partial Wave 8 slice; F7B was then judged, selectively copied and
validated in the same canonical worktree.

## Integrated Scope

F6E1 export contract:

- `src/core/export/export-contract.ts`
- `src/core/export/export-artifacts.ts`
- `test/unit/fiscal-export-artifacts.test.ts`
- `test/unit/fiscal-desk-phase-6-contracts.test.ts`
- `docs/goals/fiscal-desk-orchestration/results/phase-6e-output-templates-implementation.md`
- `docs/goals/fiscal-desk-orchestration/results/phase-6e-output-templates-implementation-judge-decision.md`

F7B Receita Web adapter-core hardening:

- `src/core/simples/adapters/receita-web/receita-browser.client.ts`
- `src/core/simples/adapters/receita-web/receita-consulta-optantes.adapter.ts`
- `src/core/simples/adapters/receita-web/receita-result.parser.ts`
- `test/unit/receita-browser.client.test.ts`
- `test/unit/receita-consulta-optantes.adapter.test.ts`
- `test/unit/receita-result.parser.test.ts`
- `docs/goals/fiscal-desk-orchestration/results/phase-7b-receita-web-implementation.md`
- `docs/goals/fiscal-desk-orchestration/results/phase-7b-receita-web-implementation-judge-decision.md`

Not integrated from the F7B worker worktree:

- inherited dirty/untracked files from earlier phases;
- docs copied as read-only context under `docs/fiscal-desk/**` and
  `docs/adr/**`;
- provider factory/config/catalog/fallback/health changes outside the accepted
  F7B adapter files;
- UI, IPC/preload, app runtime, export/ingestion, scripts, release, backend,
  database, PDF/OCR or live Receita Web smoke changes.

## Blocker Recovery

Both Wave 8 workers initially blocked because `docs/fiscal-desk/**` and
`docs/adr/**` are local/ignored context and were absent from their generated
worktrees. The judge recovered the wave by copying the documentation context to
each worker worktree and resuming the original bounded prompts.

This blocker remains documented so future subagents receive local docs context
before dispatch.

## Canonical Validation

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
- `pnpm test`
  - pass, 36 files / 221 tests.

## Residual Risk

- F6E1 is still contract/helper-only for delivery options. Runtime selection,
  IPC/preload payloads, renderer customization UI and saved delivery models
  remain separate gates.
- Planned/disabled delivery options, including PDF and JSON labels, remain
  metadata only and are rejected by the selection helper.
- Receita Web remains visible-browser, assisted, experimental and optional.
  CAPTCHA, portal blocking, browser availability and selector/text drift remain
  expected runtime constraints.
- No live Receita Web smoke was run and no CAPTCHA was automated, bypassed or
  solved.
- F7B keeps browser page content local to parser classification on successful
  visible-browser lookup; that content must not be logged, exported,
  fixture-persisted or copied into diagnostics.
- The broader harness warnings `magic_string_boundary=29` and
  `visual_surface_change=1` remain worktree-level warnings. Wave 8 did not touch
  visual surfaces, and new literals stay inside export-contract or Receita Web
  adapter boundaries.

## Next Gate

Wave 8 is closed. The next dispatch requires a fresh owner-window decision.
Runtime delivery, IPC/preload, renderer templates/customization, provider
factory/fallback or live Receita Web work must not be dispatched concurrently
unless their write scopes are explicitly separated.

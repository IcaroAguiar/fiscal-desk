# Post CSV Input Intake Next Owner Window Selection Judge Decision

Data: 2026-06-13 17:31:33 -03
Status: `approved_by_judge_scope_candidate`
Judge thread: `019ebe5c-3853-79c2-87ad-8ddace386c93`
Scope-selection thread: `019ec2ab-1703-7453-8e1d-9b570d471122`

## Decision

O receipt `post_csv_input_intake_next_owner_window_selection` esta aprovado
como candidato de escopo.

A proxima janela material liberavel e unica:

`p3_renderer_missing_column_normalizer_can_hide_new_core_guidance`

Essa escolha e coerente com o risco residual aceito na integracao anterior:
o renderer ainda pode interceptar a mensagem nova de coluna CNPJ ausente e
substitui-la por copy antiga, escondendo parte da orientacao emitida pelo core.

## Release Scope

Liberar no maximo uma thread material, serial, com modelo `gpt-5.5` e reasoning
`medium`.

Allowed write:

- `src/renderer/ui/app-helpers.ts`
- `test/unit/app-helpers.test.ts`
- `docs/goals/fiscal-desk-orchestration/results/p3-renderer-missing-column-normalizer-can-hide-new-core-guidance-2026-06-13.md`

Do not touch:

- `src/core/**`
- `src/main/**`
- `src/preload/**`
- `src/core/simples/**`
- `src/core/export/**`
- `src/core/public-base/**`
- `src/renderer/ui/app-view.ts`
- `src/renderer/ui/app-sync.ts`
- `src/renderer/ui/app.types.ts`
- `src/renderer/ui/operational-copy.ts`
- `src/renderer/styles.css`
- `test/integration/**`
- qualquer `test/unit/**` exceto `test/unit/app-helpers.test.ts`
- `package.json`
- `pnpm-lock.yaml`
- `electron-builder.yml`
- `.github/**`
- `docs/fiscal-desk/**`
- `docs/adr/**`
- `docs/goals/fiscal-desk-orchestration/state.yaml`
- `docs/goals/fiscal-desk-orchestration/integration-plan.md`
- release/package config, updater, diagnostics, telemetry, license/account,
  storage/network, templates/modelos reutilizaveis, PDF/Word/OCR, Receita Web
  live/massiva, Base Publica Local/preparo/consentimento.

## Required Checks For Worker

- `git status --short --branch --untracked-files=all` before and after.
- `pnpm exec vitest run test/unit/app-helpers.test.ts`
- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`
- `git diff --check`
- `pnpm smoke:visual`

`pnpm smoke:electron-ui` so deve ser exigido se o worker tocar fluxo de app,
seletores, sincronizacao, IPC/preload ou estado visivel alem da mensagem
normalizada.

## Review Gate

Review independente e obrigatorio antes de qualquer integracao, porque a janela
altera copy exibida no renderer Electron.

## Judge Notes

Nenhum worker material adicional esta liberado em paralelo para renderer/copy,
layout, fluxo Electron, entrada CSV, core, IPC, preload, provider, export,
release, update, diagnostics, telemetry ou license/account.

O proximo passo do orquestrador e despachar a thread material exatamente neste
escopo.

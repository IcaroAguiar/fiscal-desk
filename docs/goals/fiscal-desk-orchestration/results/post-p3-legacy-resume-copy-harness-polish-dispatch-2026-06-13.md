# Post P3 Legacy Resume Copy Harness Polish Dispatch

Data: 2026-06-13 20:32:00 -03
Status: prepared_for_codex_app_thread

## Goal

Executar `/goal` em thread separada do Codex App para o owner window:

`post_p3_legacy_resume_copy_harness_polish`

Modelo exigido: `gpt-5.5`
Reasoning exigido: `medium`

## Context

- Repo canonico: `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv`
- Branch final de integracao: `feat/fiscal-desk-local-base-prep`
- Source judge commit: `e88f013 docs: approve post panel owner window`
- Source selection result: `docs/goals/fiscal-desk-orchestration/results/post-p3-operational-panel-next-owner-window-selection-2026-06-13.md`
- Source judge decision: `docs/goals/fiscal-desk-orchestration/results/post-p3-operational-panel-next-owner-window-selection-judge-decision-2026-06-13.md`

## Mission

Corrigir somente o copy legado do resumo de retomada exposto no slot
`data-slot="execution-resume"` e alinhar o harness Electron que reporta/valida
`uiResumeText`.

O problema conhecido e o texto legado `1 CNPJs retomados`; o painel operacional
novo ja foi integrado e deve ser preservado.

## Allowed Writes

O worker pode escrever somente:

- `src/renderer/ui/operational-copy.ts`
- `src/renderer/ui/app-view-lists.ts`
- `test/unit/renderer-operational-copy.test.ts`
- `test/unit/app-view.test.ts`
- `test/unit/app-sync.test.ts`
- `scripts/smoke-electron-ui.ts`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-legacy-resume-copy-harness-polish-2026-06-13.md`

## Stop And Ask Judge If Needed

Parar com status `blocked_scope_expansion_required` se a solucao exigir editar:

- `src/renderer/ui/app-view.ts`
- `src/renderer/ui/app-sync.ts`
- `src/renderer/styles.css`
- `src/core/**`
- `src/main/**`
- IPC, preload, provider, ingestion/export, package/lock, docs fiscais local-only ou `.visual-fidelity/**`.

## Explicitly Blocked

Nao implementar, alterar ou validar como parte deste goal:

- Excel/entrada nova;
- entrega guiada/modelos/templates;
- diagnostico gerado ou enviado;
- telemetria;
- licenca/account;
- update/release/dist/publish/signing/notarization;
- storage/network/backend remoto;
- PDF/Word/OCR reais;
- Receita Web live/massiva;
- refatoracao ampla do renderer.

## Required Checks

Antes de declarar `ready_for_judge_review`, rodar:

- `git status --short --branch --untracked-files=all`
- `pnpm exec vitest run test/unit/renderer-operational-copy.test.ts test/unit/app-view.test.ts test/unit/app-sync.test.ts`
- `pnpm smoke:electron-ui`
- `FISCAL_DESK_SMOKE_PROVIDER=base-publica-local pnpm smoke:electron-ui`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm test:coverage`
- `QUALITY_GATE_DIFF_MODE=worktree node docs/ai/quality-gate/check-ratchet.mjs`
- `pnpm build`
- `git diff --check`

`pnpm smoke:visual` e obrigatorio se houver mudanca de DOM/layout/classe ou
qualquer alteracao visual alem de copy/harness. Se o smoke Electron falhar por
sandbox/ambiente, rerodar no contexto permitido ou registrar blocker concreto
com log.

## Receipt Required

Escrever:

`docs/goals/fiscal-desk-orchestration/results/post-p3-legacy-resume-copy-harness-polish-2026-06-13.md`

O receipt deve incluir:

- status final exatamente um de `ready_for_judge_review`, `needs_rework` ou `blocked_scope_expansion_required`;
- HEAD observado;
- arquivos alterados;
- resumo do diff;
- checks executados com resultado;
- qualquer blocker ou risco residual;
- confirmacao de que nenhum item bloqueado foi tocado;
- confirmacao de que nao houve stage, commit, push, PR, deploy, publish, signing ou side effect externo.

## Judge Rule

O worker nao se autoaprova. O Codex primario/orquestrador julgara o resultado,
rodara validacoes canonicas proporcionais, solicitara review independente e so
entao podera integrar.

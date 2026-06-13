# Post P3 Operational Panel Next Owner Window Selection Judge Decision

Data: 2026-06-13 20:29:55 -03
Status: approved_by_judge_scope_candidate

## Decision

Aceito o receipt `post-p3-operational-panel-next-owner-window-selection-2026-06-13.md` como candidato de escopo aprovado.

Isso encerra a espera documental/read-only desta janela. A proxima janela autorizada e material, pequena e single-writer:

`post_p3_legacy_resume_copy_harness_polish`

## Evidence Reviewed

- Codex App thread `019ec34e-024e-7040-846d-9ec73093c156` terminou `idle/completed`.
- A worktree do seletor tinha somente o receipt permitido como untracked:
  `docs/goals/fiscal-desk-orchestration/results/post-p3-operational-panel-next-owner-window-selection-2026-06-13.md`.
- `git diff --check -- docs/goals/fiscal-desk-orchestration/results/post-p3-operational-panel-next-owner-window-selection-2026-06-13.md` passou.
- O receipt confirmou que `docs/fiscal-desk/**` estava ausente na worktree isolada e foi usado somente pela copia canonica absoluta read-only, como autorizado no dispatch.
- O candidato selecionado corresponde ao risco residual aceito no painel operacional: `legacy_uiResumeText_1_CNPJs_retomados_remains_harness_bound_future_polish`.

## Approved Scope

O proximo worker pode corrigir apenas o copy legado do slot `data-slot="execution-resume"` e alinhar o harness Electron que reporta/valida `uiResumeText`.

Allowed writes para o worker:

- `src/renderer/ui/operational-copy.ts`
- `src/renderer/ui/app-view-lists.ts`
- `test/unit/renderer-operational-copy.test.ts`
- `test/unit/app-view.test.ts`
- `test/unit/app-sync.test.ts`
- `scripts/smoke-electron-ui.ts`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-legacy-resume-copy-harness-polish-2026-06-13.md`

O worker nao deve editar `src/renderer/ui/app-view.ts` ou `src/renderer/ui/app-sync.ts` sem parar e pedir ampliacao explicita de escopo. Esses arquivos podem ser lidos para entender consumo, mas nao estao liberados para escrita nesta primeira tentativa.

## Required Worker Checks

Minimos antes de declarar `ready_for_judge_review`:

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

`pnpm smoke:visual` e recomendado se qualquer alteracao mudar DOM/renderizacao visual alem de texto do slot legado/harness. Se algum smoke Electron falhar por sandbox/ambiente, o worker deve rerodar no contexto permitido ou registrar blocker concreto com log.

## Still Blocked

Esta decisao nao libera:

- Excel/entrada nova;
- entrega guiada/modelos/templates;
- diagnostico gerado ou enviado;
- telemetria;
- licenca/account;
- update/release/dist/publish/signing/notarization;
- storage/network/backend remoto;
- PDF/Word/OCR reais;
- Receita Web live/massiva;
- mudancas em `src/core/**`, `src/main/**`, IPC/preload, providers, ingestion/export, package/lock, docs fiscais local-only ou `.visual-fidelity/**`.

## Next Action

Preparar e despachar uma nova thread Codex App `/goal` com modelo `gpt-5.5` e reasoning `medium` para `post_p3_legacy_resume_copy_harness_polish`, mantendo esta branch como base final de integracao e exigindo review independente antes de qualquer merge.

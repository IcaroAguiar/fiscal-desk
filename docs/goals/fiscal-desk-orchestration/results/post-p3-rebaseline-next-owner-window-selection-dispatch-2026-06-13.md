# Post P3 Rebaseline Next Owner Window Selection Dispatch

Data: 2026-06-13 18:12:56 -03
Status: `prepared_for_codex_app_thread`
Judge thread: `019ebe5c-3853-79c2-87ad-8ddace386c93`
Branch canonica: `feat/fiscal-desk-local-base-prep`
Target commit minimo: `a2dbddc`

## Objetivo

Executar selecao read-only da proxima owner window segura depois do rebaseline
docs-only pos-P3.

Esta thread nao deve implementar codigo, nao deve editar specs locais e nao
deve liberar material work por conta propria. O resultado volta ao judge.

## Contexto Obrigatorio

Ler primeiro:

- `AGENTS.md`
- `docs/goals/fiscal-desk-orchestration/goal.md`
- `docs/goals/fiscal-desk-orchestration/state.yaml`
- `docs/goals/fiscal-desk-orchestration/integration-plan.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-first-release-status-rebaseline-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-first-release-status-rebaseline-judge-decision-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-renderer-next-owner-window-selection-judge-decision-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/p3-renderer-missing-column-normalizer-can-hide-new-core-guidance-integration-judge-decision-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-local-base-regate-csv-input-intake-hardening-integration-judge-decision-2026-06-13.md`
- receipts recentes de release/security, F6E2C, F8B1, coverage gate, Base
  Publica Local re-gate, CSV hardening e P3 renderer.

Se `docs/fiscal-desk/**` estiver ausente na worktree, usar somente leitura da
copia canonica absoluta em
`/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/fiscal-desk/**`.
Registrar essa limitacao, mas nao bloquear automaticamente a selecao.

## Tarefa

1. Confirmar que nao ha material worker ativo depois do rebaseline pos-P3.
2. Recomendar exatamente uma proxima owner window, ou retornar `blocked` /
   `needs_more_info` se nenhum recorte seguro puder ser isolado.
3. Classificar a janela como material, docs-only, read-only gate,
   release/security review ou blocked.
4. Definir allowed write set exato, do-not-touch set, boundaries afetadas,
   dependencias, colisoes, checks, necessidade de reviewer independente, riscos
   residuais e stop conditions.
5. Se o status for `approved_scope_candidate`, incluir prompt `/goal` pronto
   para a proxima thread com modelo `gpt-5.5` e reasoning `medium`.

## Allowed Write

- `docs/goals/fiscal-desk-orchestration/results/post-p3-rebaseline-next-owner-window-selection-2026-06-13.md`

## Forbidden Write

- `src/**`
- `test/**`
- `docs/fiscal-desk/**`
- `docs/adr/**`
- `package.json`
- `pnpm-lock.yaml`
- `.github/**`
- `electron-builder.yml`
- `docs/goals/fiscal-desk-orchestration/state.yaml`
- `docs/goals/fiscal-desk-orchestration/integration-plan.md`
- qualquer arquivo fora do receipt permitido
- stage, commit, push, PR, deploy, publish, dist, assinatura, notarizacao,
  updater real ou qualquer efeito externo.

## Checks Esperados

- `git status --short --branch --untracked-files=all`
- `git log -1 --oneline`
- scans/read-only proporcionais em `docs/goals/fiscal-desk-orchestration`,
  `docs/fiscal-desk` se presente ou copia canonica absoluta, e receipts
  recentes para `next owner`, `blocked`, `update`, `diagnostico`,
  `telemetria`, `licenca`, `release`, `templates`, `PDF`, `Word`, `OCR`,
  `Receita Web`, `Base Publica`, `F6E`, `F8B`, `P3`.
- `git diff --check -- docs/goals/fiscal-desk-orchestration/results/post-p3-rebaseline-next-owner-window-selection-2026-06-13.md`

## Status Esperado

O receipt final deve terminar com exatamente um destes status:

- `approved_scope_candidate`
- `needs_more_info`
- `blocked`

# P3 Renderer Missing Column Normalizer Can Hide New Core Guidance

Data: 2026-06-13
Thread fonte/orquestrador: `019ebe5c-3853-79c2-87ad-8ddace386c93`
Worktree: `/Users/icaroaguiar/.codex/worktrees/75bc/consulta-simples-csv`
Status: `ready_for_judge_review`

## Resumo

Owner window executada dentro do allowed write set. O renderer deixou de
substituir a mensagem nova do core para erro de coluna CNPJ ausente por uma copy
antiga. Agora `extractMessage` desembrulha o erro remoto e preserva a orientacao
do core, incluindo `CPF/CNPJ` e a alternativa de informar a coluna manualmente.

Nota de rework: a primeira execucao parou como
`blocked_missing_docs_fiscal_desk`. O judge esclareceu que essa condicao era
over-strict para esta janela estreita e que `docs/fiscal-desk/**` nao e
necessario aqui. Continuei no mesmo worktree, sem criar nova fase e sem editar
`docs/fiscal-desk/**`.

## Evidencia Inicial

- `git status --short --branch --untracked-files=all` antes de editar codigo:
  `## HEAD (no branch)` e este receipt anterior como unico arquivo untracked.
- `git log -1 --oneline`: `5807061 docs: dispatch p3 renderer message worker`.
- Bootstrap minimo necessario: `pnpm install --frozen-lockfile` passou, sem
  alterar `package.json` ou `pnpm-lock.yaml`.

## Arquivos Lidos

- `AGENTS.md` via instrucoes carregadas no contexto da thread.
- `docs/goals/fiscal-desk-orchestration/state.yaml`.
- `docs/goals/fiscal-desk-orchestration/integration-plan.md`.
- `docs/goals/fiscal-desk-orchestration/results/p3-renderer-missing-column-normalizer-can-hide-new-core-guidance-dispatch-2026-06-13.md`.
- `docs/goals/fiscal-desk-orchestration/results/post-csv-input-intake-next-owner-window-selection-2026-06-13.md`.
- `docs/goals/fiscal-desk-orchestration/results/post-csv-input-intake-next-owner-window-selection-judge-decision-2026-06-13.md`.
- `docs/goals/fiscal-desk-orchestration/results/post-local-base-regate-csv-input-intake-hardening-integration-judge-decision-2026-06-13.md`.
- `docs/goals/fiscal-desk-orchestration/results/post-local-base-regate-csv-input-intake-hardening-review-2026-06-13.md`.
- `docs/goals/fiscal-desk-orchestration/results/post-local-base-regate-csv-input-intake-hardening-review-after-rework-2026-06-13.md`.
- `src/renderer/ui/app-helpers.ts`.
- `test/unit/app-helpers.test.ts`.
- Memoria operacional relevante em `/Users/icaroaguiar/.codex/memories/MEMORY.md`.

## Arquivos Alterados

- `src/renderer/ui/app-helpers.ts`.
- `test/unit/app-helpers.test.ts`.
- `docs/goals/fiscal-desk-orchestration/results/p3-renderer-missing-column-normalizer-can-hide-new-core-guidance-2026-06-13.md`.

## Diff Summary

- Em `src/renderer/ui/app-helpers.ts`, o ramo que detecta
  `Nenhuma coluna de CNPJ suportada foi encontrada` agora retorna a mensagem
  desembrulhada do core em vez de substituir por copy antiga.
- Em `test/unit/app-helpers.test.ts`, adicionado teste focado para erro remoto
  embrulhado por `Error invoking remote method`, provando que `CPF/CNPJ` e
  `informe a coluna manualmente` continuam visiveis no renderer.
- Nenhum arquivo de core, main, preload, provider, export, view/sync/types,
  styles, package, lockfile, CI, release ou `docs/fiscal-desk/**` foi alterado.

## Checks

- `pnpm install --frozen-lockfile`: pass; bootstrap local, lockfile intacto.
- `pnpm exec vitest run test/unit/app-helpers.test.ts`: pass, 1 arquivo / 6
  testes.
- `pnpm typecheck`: pass.
- `pnpm lint`: pass, 119 arquivos.
- `pnpm test`: pass, 40 arquivos / 264 testes.
- `git diff --check`: pass.
- `pnpm smoke:visual`: pass; desktop/tablet/mobile sem overflow, botoes
  cortados ou sobreposicoes.

## Checks Pulados

- `pnpm smoke:electron-ui`: nao executado. A janela ficou limitada a helper
  puro de normalizacao de mensagem e teste unitario; nao toquei fluxo de app,
  seletores, sync, IPC/preload ou estado visivel alem da copy normalizada.

## Necessidade de Review

Review independente continua obrigatorio antes de integracao, conforme dispatch
e judge decision, porque a mudanca altera copy exibida no renderer Electron.
Este receipt nao e auto-aprovacao.

## Riscos Residuais

- `pnpm smoke:visual` prova ausencia de regressao visual geral, mas nao exercita
  especificamente a tela real de erro de coluna ausente. A prova primaria do
  comportamento alterado e o teste unitario de `extractMessage`.
- A janela nao altera mensagens emitidas pelo core; se a copy do core mudar em
  commit futuro, a revisao deve revalidar o teste contra a nova mensagem.

## Recomendacao de Integracao

Recomendo `ready_for_judge_review`. O diff e pequeno, fica no allowed write set,
preserva as mensagens novas do core e todos os checks exigidos passaram. Ainda
precisa de review independente antes de qualquer integracao.

ready_for_judge_review:
`docs/goals/fiscal-desk-orchestration/results/p3-renderer-missing-column-normalizer-can-hide-new-core-guidance-2026-06-13.md`

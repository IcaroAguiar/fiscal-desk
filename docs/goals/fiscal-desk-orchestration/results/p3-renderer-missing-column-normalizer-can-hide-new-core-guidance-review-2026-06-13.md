# P3 Renderer Missing Column Normalizer Independent Review

Data: 2026-06-13
Reviewer thread: `019ec2b8-2e29-7553-b9f5-ce43946bcf65`
Judge/orchestrator thread: `019ebe5c-3853-79c2-87ad-8ddace386c93`
Worker thread: `019ec2b1-befe-70b3-95ad-61fbda8a089e`
Worker worktree: `/Users/icaroaguiar/.codex/worktrees/75bc/consulta-simples-csv`
Status: `approved_candidate`

## Escopo Revisado

Review independente read-only do candidato
`p3_renderer_missing_column_normalizer_can_hide_new_core_guidance`.

Arquivos do candidato observados na worktree do worker:

- `src/renderer/ui/app-helpers.ts`
- `test/unit/app-helpers.test.ts`
- `docs/goals/fiscal-desk-orchestration/results/p3-renderer-missing-column-normalizer-can-hide-new-core-guidance-2026-06-13.md`

## Resultado

`approved_candidate`.

O diff material fica dentro do allowed write set, preserva a nova orientacao do
core para coluna CNPJ ausente e adiciona teste unitario cobrindo o formato real
embrulhado por `Error invoking remote method`.

Este review nao aprova integracao por conta propria. A recomendacao ao judge e
integrar seletivamente o patch material na branch canonica
`feat/fiscal-desk-local-base-prep`, mantendo os gates finais da orquestracao.

## Evidencias De Leitura

- `AGENTS.md`: regras do repositorio confirmadas, incluindo portugues-BR,
  arquitetura `porta + adapters` e preferencia por testes focados.
- `docs/goals/fiscal-desk-orchestration/state.yaml`: pacote ativo em
  `orchestrating_active`, review independente obrigatorio para mudancas
  materiais, branch final `feat/fiscal-desk-local-base-prep`.
- `docs/goals/fiscal-desk-orchestration/integration-plan.md`: fila ativa aponta
  este candidato como material pronto para review independente.
- `docs/goals/fiscal-desk-orchestration/results/p3-renderer-missing-column-normalizer-can-hide-new-core-guidance-review-dispatch-2026-06-13.md`:
  perguntas e allowed write do review confirmados.
- `docs/goals/fiscal-desk-orchestration/results/p3-renderer-missing-column-normalizer-can-hide-new-core-guidance-dispatch-2026-06-13.md`:
  allowed write do worker e checks requeridos confirmados.
- `docs/goals/fiscal-desk-orchestration/results/p3-renderer-missing-column-normalizer-can-hide-new-core-guidance-2026-06-13.md`:
  receipt do worker lido na worktree do worker.
- `docs/goals/fiscal-desk-orchestration/results/post-csv-input-intake-next-owner-window-selection-judge-decision-2026-06-13.md`:
  selecao desta janela como proximo escopo material confirmada.
- Diff do worker lido com `git -C /Users/icaroaguiar/.codex/worktrees/75bc/consulta-simples-csv diff -- src/renderer/ui/app-helpers.ts test/unit/app-helpers.test.ts`.

## Evidencias Tecnicas

- `src/renderer/ui/app-helpers.ts:166-168`: quando a mensagem desembrulhada
  contem `Nenhuma coluna de CNPJ suportada foi encontrada`, o renderer retorna
  a mensagem do core em vez de substitui-la pela copy antiga.
- `src/renderer/ui/app-helpers.ts:173-176`: o helper continua desembrulhando o
  prefixo `Error invoking remote method '...': Error:` antes das regras de
  normalizacao.
- `src/core/app/process-csv.use-case.ts:81-84`: a mensagem real do core contem
  `CPF/CNPJ` e `informe a coluna manualmente`.
- `test/unit/app-helpers.test.ts:46-56`: o teste novo constrói exatamente o
  formato `Error invoking remote method 'csv:process': Error: ...` e prova que a
  mensagem preservada contem a orientacao nova do core.
- `test/unit/app-helpers.test.ts:6-34`: as normalizacoes existentes para XLSX,
  CSV malformado e delimitador ambiguo continuam cobertas.
- `test/unit/app-helpers.test.ts:36-44`: mensagem amigavel em portugues continua
  preservada.
- `test/unit/app-helpers.test.ts:58-62`: fallback para erro desconhecido
  continua coberto.

## Checks Executados Pelo Reviewer

- `git status --short --branch --untracked-files=all` na worktree de review:
  pass, `## HEAD (no branch)`.
- `git -C /Users/icaroaguiar/.codex/worktrees/75bc/consulta-simples-csv status --short --branch --untracked-files=all`:
  pass para leitura; mostrou somente:
  - `M src/renderer/ui/app-helpers.ts`
  - `M test/unit/app-helpers.test.ts`
  - `?? docs/goals/fiscal-desk-orchestration/results/p3-renderer-missing-column-normalizer-can-hide-new-core-guidance-2026-06-13.md`
- `git -C /Users/icaroaguiar/.codex/worktrees/75bc/consulta-simples-csv diff --name-only`:
  pass; arquivos rastreados alterados somente em `src/renderer/ui/app-helpers.ts`
  e `test/unit/app-helpers.test.ts`.
- `git -C /Users/icaroaguiar/.codex/worktrees/75bc/consulta-simples-csv diff --check`:
  pass.
- `git -C /Users/icaroaguiar/.codex/worktrees/75bc/consulta-simples-csv diff -- src/renderer/ui/app-helpers.ts test/unit/app-helpers.test.ts`:
  pass para inspecao do patch material.
- `rg -n "Nenhuma coluna de CNPJ suportada|CPF/CNPJ|informe a coluna manualmente" src test`
  na worktree do worker: confirmou a correspondencia entre mensagem do core e
  teste novo.
- `git -C /Users/icaroaguiar/.codex/worktrees/75bc/consulta-simples-csv diff b322184 -- src/renderer/ui/app-helpers.ts test/unit/app-helpers.test.ts`:
  confirmou que o patch material continua o mesmo contra a base canonica
  `b322184`.

## Checks Tentados E Bloqueados

- `pnpm exec vitest run test/unit/app-helpers.test.ts` na worktree do worker:
  bloqueado pelo sandbox do reviewer com `EPERM` ao tentar criar arquivo
  temporario em
  `node_modules/.vite-temp/vitest.config.ts.timestamp-*.mjs`.

Nao solicitei escalonamento porque o mandato do review e read-only e a worktree
do worker nao esta dentro do write scope permitido deste reviewer.

## Evidencia Reportada Pelo Worker

Tratada como evidencia reportada, nao executada por este reviewer:

- `pnpm install --frozen-lockfile`: pass, lockfile intacto.
- `pnpm exec vitest run test/unit/app-helpers.test.ts`: pass, 1 arquivo / 6
  testes.
- `pnpm typecheck`: pass.
- `pnpm lint`: pass, 119 arquivos.
- `pnpm test`: pass, 40 arquivos / 264 testes.
- `git diff --check`: pass.
- `pnpm smoke:visual`: pass.
- `pnpm smoke:electron-ui`: pulado pelo worker; aceitavel para este escopo
  porque nao houve toque em fluxo de app, seletores, sync, IPC/preload ou estado
  visivel alem da mensagem normalizada.

## Respostas As Perguntas Do Dispatch

1. O diff fica estritamente dentro do allowed write set?
   Sim. Os arquivos modificados/untracked observados no worker sao os tres
   permitidos.
2. A normalizacao do renderer preserva a nova orientacao do core para coluna
   CNPJ ausente?
   Sim. A regra agora retorna a mensagem desembrulhada.
3. O teste cobre o shape real `Error invoking remote method` e prova que
   `CPF/CNPJ` mais orientacao manual continuam visiveis?
   Sim. O teste usa o wrapper remoto e compara com a mensagem do core.
4. As normalizacoes amigaveis existentes continuam cobertas?
   Sim. XLSX, CSV malformado, delimitador ambiguo, mensagem amigavel em
   portugues e fallback seguem cobertos.
5. O worker tocou superficies proibidas?
   Nao observado. Nenhum diff em core, main, preload, provider, export, styles,
   package, lockfile, CI, release, `docs/fiscal-desk/**` ou `docs/adr/**`.
6. Os checks reportados bastam para esta superficie?
   Sim, para helper/copy renderer: teste unitario focado, typecheck, lint,
   suite completa, diff-check e smoke visual reportados sao proporcionais. O
   smoke Electron nao era obrigatorio pelo proprio dispatch para este recorte.
7. Ha findings P0/P1/P2/P3 que exigem rework antes da integracao?
   Nao.

## Findings

- P0: nenhum.
- P1: nenhum.
- P2: nenhum.
- P3: nenhum que exija rework.

## Observacoes E Riscos Residuais

- A worktree do worker esta em `5807061`, enquanto a branch canonica contem
  `b322184` e commits de orquestracao posteriores. O patch material contra
  `b322184` e identico nos arquivos de codigo/teste, mas o judge deve integrar
  seletivamente o diff material e nao tratar a worktree inteira como base atual.
- O teste focado nao foi executado por este reviewer devido ao bloqueio
  read-only descrito acima; a execucao fica como evidencia reportada pelo
  worker.
- O smoke visual reportado nao exercita especificamente a tela real de erro de
  coluna ausente. Para este helper puro, o teste unitario e a evidencia primaria
  adequada.

## Recomendacao Ao Judge

Recomendo `approved_candidate` para o candidato
`p3_renderer_missing_column_normalizer_can_hide_new_core_guidance`.

Integrar seletivamente:

- `src/renderer/ui/app-helpers.ts`
- `test/unit/app-helpers.test.ts`
- receipt do worker, se ainda necessario no estado canonico do judge

Depois da integracao, rodar os checks proporcionais no worktree canonico,
incluindo pelo menos `pnpm exec vitest run test/unit/app-helpers.test.ts`,
`pnpm typecheck`, `pnpm lint`, `pnpm test` e `git diff --check`.

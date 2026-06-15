# Fiscal Desk F9D2 - Strong Cancel Partial Pending Export

Status: `validated_review_approved_for_f9d2`

Data: 2026-06-14

## Escopo

F9D2 fecha a segunda fatia de controle fino: quando uma execucao e cancelada
ou falha depois de consultar parte dos CNPJs, o Historico passa a informar
saida parcial e quantidade de CNPJs pendentes, e oferece uma acao explicita
para exportar um CSV com as pendencias.

Esta fatia entrega flexibilidade operacional sem prometer paralelismo oculto:
o usuario pode reprocessar o arquivo de pendencias com outro perfil ou provider,
mas o app ainda mantem uma unica execucao ativa por vez.

F9D2 nao entrega:

- suspensao em memoria;
- redistribuicao automatica entre providers;
- multiplas execucoes simultaneas no mesmo app;
- paralelismo headed da Receita Web;
- bypass de CAPTCHA, sessao, anti-bot ou limites de provedor.

## Mudancas

- `src/core/app/process-csv.types.ts`
  adiciona o canal `csv:export-pending-cnpjs` e campos de historico para
  pendencias, parcial e elegibilidade de exportacao.
- `src/main/execution/file-process-execution-ledger.ts`
  expoe `getCheckpointedCnpjs`, calcula `pendingUniqueLookups`,
  `canExportPending` e `hasPartialOutput` a partir do ledger.
- `src/main/ipc/process-csv.ipc.ts`
  registra o handler de exportacao, bloqueia quando ha processamento ativo,
  valida `ledgerKey`, rele o arquivo original, confere fingerprint antes de
  exportar, deduplica CNPJs validos e grava um CSV `cnpj` com os itens ainda
  nao checkpointados.
- `src/main/preload.ts`, `src/main/types.ts` e
  `src/renderer/ui/app.types.ts` expõem o contrato ao renderer.
- `src/renderer/ui/app-history-view.ts` e `src/renderer/ui/app.ts`
  adicionam a acao `Exportar pendencias` no Historico, mantem acoes
  desabilitadas durante processamento e mostram somente nomes de arquivo, nao
  caminhos absolutos.
- `src/renderer/styles.css` adiciona layout responsivo para as acoes do
  Historico.

## Evidencia

Validacao local aceita:

- `pnpm exec vitest run test/unit/process-csv-contracts.test.ts test/unit/main/file-process-execution-ledger.test.ts test/unit/process-csv.ipc.test.ts test/unit/preload.test.ts test/unit/app-view.test.ts`: pass, 5 arquivos, 51 testes;
- `pnpm lint`: pass;
- `pnpm typecheck`: pass;
- `git diff --check`: pass;
- `pnpm test`: pass, 43 arquivos, 319 testes;
- `pnpm build`: pass;
- `pnpm smoke:visual`: pass em desktop, tablet e mobile sem overflow, botoes
  cortados ou sobreposicoes;
- `pnpm smoke:electron-ui`: pass, app Electron real, provider `mock`, CSV,
  XLSX, historico e checkpoint.

O reviewer independente tambem executou foco adicional:

- `pnpm exec vitest run test/unit/process-csv.ipc.test.ts test/unit/main/file-process-execution-ledger.test.ts test/unit/preload.test.ts test/unit/app-view.test.ts test/integration/process-csv-cancel.test.ts test/integration/process-csv-progress.test.ts`: pass, 6 arquivos, 45 testes.

## Review

Review independente (`019ec74d-b703-7d80-ae2f-54ee7a591248`) retornou:

- sem findings P0-P3 bloqueantes;
- `ledgerKey` nao permite traversal;
- exportacao e bloqueada durante processamento ativo;
- fingerprint impede exportar pendencias se o arquivo original mudou;
- pendencias saem deduplicadas pela ingestao valida;
- UI nao mostra caminho absoluto;
- pause/resume/mock continuam cobertos por testes focados.

O reviewer nao revisou mudancas fora da F9D2, incluindo workflows, Base Publica
oficial/download, lockfile/package e docs amplos.

## Riscos Residuais

- A exportacao gera um CSV simples com coluna `cnpj`. Colunas originais e
  contexto de linha nao sao preservados nesta fatia.
- O usuario ainda precisa escolher manualmente o provider/perfil para reprocessar
  o CSV de pendencias.
- Nao ha redistribuicao automatica, filas concorrentes separadas por provider ou
  multiplas execucoes ativas.
- Se o arquivo original for movido, apagado ou alterado, a exportacao e
  bloqueada por seguranca.
- Receita Web continua assistida, serial e sujeita a CAPTCHA/bloqueio.

## Harness Warnings

- `dependency_file_change=3`: herdado/acumulado de F9C2 por `yauzl` e seus
  tipos; F9D2 nao adiciona dependencia nova.
- `magic_string_boundary=13`: os literais relevantes sao contratos IPC/action
  IDs, nomes oficiais de arquivo/metadata e fixtures de teste; documentado como
  warn-only nesta fase.
- `visual_surface_change=2`: esperado pelas acoes de Base Publica oficial e
  Historico/exportacao de pendencias; coberto por `pnpm smoke:visual` e
  `pnpm smoke:electron-ui`.

## Integracao

Integrado na branch/worktree unica `feat/fiscal-desk-local-base-prep`.

Recomendacao: marcar F9D2 como aprovado e manter F9E pendente/bloqueada ate uma
decisao explicita sobre Receita Web paralela experimental.

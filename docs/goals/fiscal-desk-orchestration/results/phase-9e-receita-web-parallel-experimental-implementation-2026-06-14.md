# F9E Receita Web Parallel Experimental Implementation

Status: `validated_review_approved_integrated`

Data: 2026-06-14 19:50 -03

## Decisao

Por decisao explicita do usuario, F9E deixou de ser apenas contrato futuro e
entrou na rodada de core.

A implementacao mantem o provider padrao `receita-web` serial/assistido e cria
um modo separado: `receita-web-parallel-experimental`.

## Entregue

- Novo provider experimental no catalogo:
  `receita-web-parallel-experimental`;
- `receita-web` padrao preservado com `batchLookup: false`,
  `automaticFallback: false`, `deterministicSmoke: false` e navegador visivel;
- modo experimental separado no seletor de Base de consulta;
- aceite explicito antes de iniciar ou retomar execucao experimental;
- concorrencia efetiva do modo experimental:
  - `leve`: 1 janela;
  - `equilibrado`: 2 janelas;
  - `rapido`: 3 janelas;
  - `maximo`: 3 janelas;
- uma unica execucao ativa no app continua obrigatoria;
- o modo experimental usa o mesmo adapter Receita Web assistido, sem backend,
  proxy, CAPTCHA solving, sessao persistente ou fallback automatico;
- `CAPTCHA_REQUIRED` ou `BLOCKED` aciona parada global no core para o modo
  experimental;
- renderer informa limite de janelas, risco de ocupar o computador, parada em
  CAPTCHA/bloqueio e recomendacao de Base Publica Local para volume.

## Captura Real Receita Web

Foi executada captura supervisionada com CNPJ publico real conhecido:

- artifact: `phase-9e-receita-web-public-cnpj-captcha-capture-2026-06-14.md`;
- resultado: `captcha_blocked_no_success_flow`;
- `browser-to-api` encontrou um `POST /consultaoptantes`, mas como form-post
  HTML com `__RequestVerificationToken`, status 200 e confianca baixa;
- nao foi observado endpoint JSON/API de sucesso;
- o portal retornou protecao CAPTCHA/token invalido;
- nenhum CAPTCHA foi resolvido e nenhum valor de cookie/header/token foi
  copiado para docs;
- trace bruto `.o11y` removido por higiene.

## Validacao Focada

Executado apos implementacao:

- `pnpm lint`: pass, 128 arquivos;
- `pnpm typecheck`: pass;
- focused Vitest: pass, 7 arquivos e 56 testes:
  - `test/integration/process-csv-progress.test.ts`;
  - `test/unit/process-csv.ipc.delivery.test.ts`;
  - `test/unit/simples-provider.catalog.test.ts`;
  - `test/unit/simples-provider.factory.test.ts`;
  - `test/unit/renderer-operational-copy.test.ts`;
  - `test/unit/app-view.test.ts`;
  - `test/unit/app-sync.test.ts`.

Rework pos-review em andamento nesta thread:

- progresso `currentCnpj` de core/IPC/UI passou a usar CNPJ mascarado;
- cliente Receita Web removeu flag/user-agent anti-bot legado;
- retomada do modo `receita-web-parallel-experimental` exige aceite explicito
  antes de ler o arquivo original;
- `CAPTCHA_REQUIRED` e `BLOCKED` cobertos no teste de stop global;
- CNPJa Open marcado sem `batchLookup` efetivo no catalogo desta release.

Validacao focada apos rework:

- `pnpm typecheck`: pass;
- `pnpm lint`: pass, 128 arquivos;
- focused Vitest: pass, 9 arquivos e 92 testes:
  - `test/integration/process-csv-progress.test.ts`;
  - `test/unit/process-csv.ipc-resume-delivery.test.ts`;
  - `test/unit/process-csv-contracts.test.ts`;
  - `test/unit/process-csv.ipc.delivery.test.ts`;
  - `test/unit/app-sync.test.ts`;
  - `test/unit/renderer-operational-copy.test.ts`;
  - `test/unit/app-view.test.ts`;
  - `test/unit/receita-browser.client.test.ts`;
  - `test/unit/simples-provider.catalog.test.ts`.

## Limites Preservados

- Sem promessa de sucesso em lote via Receita Web;
- sem smoke live deterministico Receita Web;
- sem bypass de CAPTCHA/anti-bot;
- sem fila de multiplas execucoes ativas;
- sem fallback automatico para Receita Web;
- CNPJa Open segue serial por limite publico.

## Validacao Integrada E Review

O pendente original de validacao integrada foi executado nesta worktree:

- `pnpm lint`: pass, 128 arquivos;
- `pnpm typecheck`: pass;
- `pnpm test`: pass, 43 arquivos e 329 testes;
- `pnpm build`: pass;
- `git diff --check`: pass;
- `test ! -e .o11y`: pass;
- `pnpm smoke:visual`: pass, sem overflow, botoes cortados ou sobreposicoes;
- `pnpm smoke:electron-ui`: pass, app Electron real, provider `mock`, XLSX,
  historico, checkpoint e retomada; run id
  `1da0d1f0-be65-413d-b64c-ff417799c30b`.

Review independente:

- reviewer `019ec864-5928-7c90-86e0-8ef6a394f7a4`;
- sem findings bloqueantes de codigo no recorte F9E;
- finding documental: `state.yaml` ainda tinha evidencia antiga
  de review aprovado enquanto F9E permanecia pendente;
- rework aplicado: campo trocado para
  `current_review_found_state_inconsistency_reworked_pending_rereview...` e
  gates integrados F9E registrados no estado.

Rechecagem:

- reviewer confirmou que a inconsistencia documental de `state.yaml` foi
  resolvida;
- sem findings restantes;
- closeout final pos-F9E emitido em
  `phase-9-final-closeout-post-f9e-2026-06-14.md`.

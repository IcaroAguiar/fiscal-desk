# Fiscal Desk F9 - Final Closeout Pos-F9E

Status: `validated_integrated_closeout`

Data: 2026-06-14 20:10 -03

## Decisao

F9 esta fechada na branch/worktree unica
`feat/fiscal-desk-local-base-prep`, incluindo a reabertura F9E solicitada pelo
usuario para entregar paralelizacao/velocidades nesta rodada.

O provider padrao `receita-web` continua serial, assistido, visivel e sem
promessa de volume. A nova capacidade paralela ficou isolada em
`receita-web-parallel-experimental`, com aceite explicito, limite de janelas e
parada global em CAPTCHA/bloqueio.

## Entregue

- Perfis de velocidade `leve`, `equilibrado`, `rapido` e `maximo` propagados de
  renderer/preload/IPC ate o core;
- worker pool no core para consultas unicas pendentes, preservando ordem de
  saida;
- Base Publica Local e `mock` com concorrencia efetiva por perfil;
- CNPJa Open explicitamente serial por rate limit publico;
- `receita-web` padrao serial e sem batch;
- `receita-web-parallel-experimental` separado, com ate 3 janelas visiveis e
  aceite antes de iniciar ou retomar;
- progresso de CNPJ mascarado na telemetria IPC/UI;
- cliente Receita Web sem flag/user-agent anti-bot legado;
- stop global para `CAPTCHA_REQUIRED` e `BLOCKED` no modo experimental;
- documentacao rebaselined para diferenciar closeout historico, F9E
  implementada e limites reais.

## Receita Web E Endpoints

Foi usado CNPJ publico real em captura supervisionada. Nao foi possivel observar
endpoint de sucesso porque o portal retornou protecao CAPTCHA/token invalido
antes de qualquer resposta reaproveitavel.

O unico contrato observado foi
`POST https://consopt.www8.receita.fazenda.gov.br/consultaoptantes`, como
form-post HTML com `__RequestVerificationToken`, status 200 e baixa confianca.
Nao ha contrato JSON/API de sucesso que sustente cliente API paralelo.

## Validacao Integrada

Executado nesta worktree apos o rework F9E:

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

## Review Independente

Reviewer: `019ec864-5928-7c90-86e0-8ef6a394f7a4`.

Resultado:

- sem findings bloqueantes de codigo no recorte F9E;
- P1/P2/P3 do review anterior foram resolvidos;
- o reviewer encontrou uma inconsistencia documental em `state.yaml`;
- o estado foi corrigido e a rechecagem voltou aprovada sem findings
  restantes.

## Riscos Residuais

- Receita Web live continua assistida/experimental e pode parar em CAPTCHA ou
  bloqueio;
- nao ha smoke deterministico live da Receita Web por politica do projeto;
- F9E nao deve ser tratada como motor confiavel de volume;
- Base Publica Local continua sendo o caminho recomendado para volume;
- o indice local ainda usa o contrato persistido atual; persistencia
  incremental/chunked segue como follow-up separado.

## Resultado

Nao ha fase material F9 pendente nesta worktree. O core planejado para esta
rodada esta validado e integrado dentro dos limites documentados dos providers.

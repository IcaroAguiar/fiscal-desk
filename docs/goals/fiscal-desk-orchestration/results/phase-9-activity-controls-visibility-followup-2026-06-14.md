# Fiscal Desk F9 - Activity Controls Visibility Follow-up

Status: `validated_review_approved`

Data: 2026-06-14 17:10 -03

## Contexto

Durante o teste com CSV de aproximadamente 1000 CNPJs, a aba Atividade ainda
parecia semelhante ao comportamento anterior: o usuario via progresso lento da
Receita Web, mas nao via no mesmo lugar os limites do metodo, a recomendacao de
troca para Base local, nem controles operacionais claros.

O audit do recorte confirmou um bug concreto de UI: o CSS escondia o botao
`Cancelar` em `processing-controls` com `opacity: 0` e `pointer-events: none`.

## Mudancas

- `src/renderer/ui/app-view.ts`
  adiciona um bloco `activity-guidance` dentro da aba Atividade com Metodo,
  Limite, Controle e Proxima acao, reutilizando `buildOperationalPanelCopy`.
- `src/renderer/ui/app-sync.ts` e `src/renderer/ui/app-refs.ts`
  sincronizam os novos slots em tempo real e preservam `textContent`.
- `src/renderer/styles.css`
  cria layout responsivo para `activity-guidance` e remove a regra que escondia
  o botao `Cancelar`.
- `test/unit/app-view.test.ts`
  prova que a aba Atividade mostra limites da Receita Web e renderiza
  `Pausar`/`Cancelar`.
- `test/unit/app-sync.test.ts`
  prova que os novos slots sincronizam e que `Pausar`/`Cancelar` ficam
  habilitados durante processamento e desabilitados fora dele.

## Escopo

Este follow-up nao implementa F9E paralela. Receita Web permanece:

- assistida;
- serial;
- com navegador visivel;
- sem paralelismo por perfil de velocidade;
- sem CAPTCHA solving, stealth, proxy, sessao persistida ou bypass anti-bot.

## Evidencia

Validacao executada na worktree unica `feat/fiscal-desk-local-base-prep`:

- `pnpm exec vitest run test/unit/app-view.test.ts test/unit/app-sync.test.ts test/unit/renderer-operational-copy.test.ts`:
  pass, 3 arquivos, 27 testes;
- `pnpm typecheck`: pass;
- `pnpm lint`: pass;
- `git diff --check -- src/renderer/ui/app-view.ts src/renderer/ui/app-sync.ts src/renderer/ui/app-refs.ts src/renderer/styles.css test/unit/app-view.test.ts test/unit/app-sync.test.ts`:
  pass;
- `pnpm smoke:visual`: pass, desktop/tablet/mobile sem overflow, botoes
  cortados ou sobreposicoes;
- `pnpm smoke:electron-ui`: pass; app Electron real, provider `mock`, CSV,
  XLSX, historico, checkpoint e retomada visivel.

Smoke Electron run id: `2c7193c8-ad4c-4bae-8c1f-9e674e396664`.

## Review Independente

Reviewer read-only: `019ec7be-903a-76d2-8db0-d159858d8408`.

Resultado: `approved_candidate`.

Resumo do review:

- sem achados P0-P3 bloqueantes no recorte revisado;
- `Pausar` e `Cancelar` sao renderizados dentro de `run-zone`;
- os botoes continuam desabilitados quando `state.status !== "processing"`;
- a regra CSS que escondia `Cancelar` foi removida;
- os novos slots usam `textContent` no sync e `escapeHtml` no render inicial;
- nao houve novo vazamento de `runId` ou `checkpointPath`;
- Receita Web continua descrita como assistida/lenta/sem paralelismo.

O reviewer apontou uma lacuna residual inicial: os testes ainda nao assertavam
diretamente `pauseButton.disabled` e `cancelButton.disabled`. Essa lacuna foi
corrigida em `test/unit/app-sync.test.ts` antes do fechamento deste receipt.

## Riscos Residuais

- O smoke Electron real usa provider `mock`; Receita Web live continua fora dos
  smokes deterministico por politica do projeto.
- O CNPJ atual continua visivel no progresso porque ja era parte da superficie
  funcional de andamento local; nao foi adicionado novo diagnostico persistente.
- A investigacao F9E inicial com `browser-trace`/`browser-to-api` foi
  executada depois deste follow-up e nao observou endpoint API; implementacao
  material F9E segue bloqueada pelo contrato experimental.

## Integracao

Integrado na branch/worktree unica `feat/fiscal-desk-local-base-prep`.

Recomendacao: manter F9A/F9B/F9C1/F9C2/F9D1/F9D2 e este follow-up como
validados; manter F9E material bloqueada ate captura/contrato/judge especificos.

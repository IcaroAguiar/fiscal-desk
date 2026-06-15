# Fiscal Desk F9E - Contract API Design Review

Status: `reviewed_contract_docs_only`

Data: 2026-06-14

## Reviewer

API designer read-only: `019ec7a8-545e-71f2-aa9a-d230721e63b5`.

## Decision

O contrato F9E pode seguir como janela documental, desde que preserve estes
pontos:

- F9E deve ser modo avancado separado, sugerido como
  `receita-web-parallel-experimental`;
- F9E nunca deve ser ativado por `executionSpeedProfile`;
- o provider default `receita-web` permanece `assisted`, `experimental`,
  `visibleBrowser: true`, `batchLookup: false`, `automaticFallback: false` e
  `deterministicSmoke: false`;
- IPC/UI so recebem contrato assistido generico e payload sanitizado;
- detalhes do portal, Playwright, CAPTCHA e heuristicas ficam no adapter;
- uma unica execucao ativa no app continua obrigatoria.

## Contract Additions Accepted

- `AssistedParallelExecutionPolicy`;
- `AssistedWindowSlot`;
- `AssistedGlobalStopReason`;
- evento abstrato `ASSISTED_PROVIDER_STATE_CHANGED` sem payload sensivel;
- stop global para `CAPTCHA_REQUIRED` e `BLOCKED`;
- gates deterministicos com doubles para limite de janelas, cooldown, abort,
  cleanup e ausencia de fallback/smoke live.

## Implementation Still Blocked

Este review nao aprova codigo. Antes de qualquer worker material:

- contrato deve ser aceito pelo judge;
- security/architecture review deve validar sanitizacao, stop conditions e uma
  unica execucao ativa;
- allowlist futura deve ser estreita e nao pode transformar Receita Web em
  default, fallback automatico ou motor de volume.

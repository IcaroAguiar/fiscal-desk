# Goal: Fiscal Desk F3 - RunLedger E Retomada

## Outcome

Implementar execucao local rastreavel e retomavel, com estado persistido suficiente para cancelamento, retomada e export parcial, sem mexer em provider adapters ou renderer.

## Oracle

- Execucao interrompida ou cancelada pode retomar sem reprocessar CNPJs concluidos.
- Estado persistido por run/item e fonte de verdade local.
- Cancelamento deixa estado recuperavel.
- Export parcial reflete o estado real.
- Compatibilidade CSV atual e preservada.

## Non-Goals

- Nao implementar painel visual.
- Nao alterar provider adapters.
- Nao criar execucao distribuida/multicomputador.
- Nao adicionar dependencia pesada sem decisao arquitetural.

## Subagents

- `backend-builder`: implementa core local.
- `api-designer`: acionado se F1 estiver insuficiente.
- `test-engineer`: cobre retomada, cancelamento e export parcial.
- `observability-evaluator`: revisa ledger/evidencia se necessario.
- `reviewer`: obrigatorio para diff material.

## Allowed Writes

- `src/core/app/**`
- `src/core/execution/**` ou `src/main/execution/**`, conforme decisao F1.
- `src/main/ipc/process-csv.ipc.ts`, `src/main/preload.ts`, `src/main/types.ts` com owner unico.
- Testes focados.

## Do Not Touch

- `src/renderer/**`, salvo fase separada posterior.
- `src/core/simples/adapters/**`
- F6 ingestion/export templates em paralelo.

## Gates

- F1 fechado.
- Testes de retomada/cancelamento.
- Smoke Electron se IPC/preload mudar.
- Review independente.

## Stop Conditions

- Contrato F1 insuficiente.
- Colisao com F6 em `process-csv`/IPC/preload.
- Retomada exige reprocessar concluidos.

# Goal: Fiscal Desk F1 - Execution And State Contracts

## Outcome

Travar contratos compartilhados de execucao, estado e eventos antes de RunLedger, painel, export parcial, historico e fallback.

## Oracle

- Estados de execucao definidos e centralizados.
- Eventos e payloads IPC/preload descritos antes de implementacao.
- Boundaries entre core, main, renderer e adapters explicitos.
- Sem magic strings de status espalhadas em boundaries.
- Plano de migracao para F3/F6/F2 documentado.

## Non-Goals

- Nao implementar RunLedger.
- Nao implementar painel visual.
- Nao alterar providers.
- Nao fazer fallback real.
- Nao mexer em IPC/preload em paralelo com outro worker.

## Subagents

- `api-designer`: owner do contrato.
- `architect`: revisa boundaries se o contrato cruzar modulos.
- `test-engineer`: define cenarios esperados sem implementar feature.
- `reviewer`: valida contrato antes de workers F3/F6.

## Allowed Writes

- `src/core/app/process-csv.types.ts`
- Novos contratos/types de execucao aprovados.
- Docs do contrato e ADR complementar se necessario.
- Testes de contrato somente se nao implementarem fluxo novo.

## Do Not Touch

- `src/main/ipc/process-csv.ipc.ts`
- `src/main/preload.ts`
- `src/renderer/ui/**`
- `src/core/simples/adapters/**`

## Gates

- Contrato aprovado pelo judge.
- Dono unico para cada boundary compartilhado.
- Dependencias de F3/F6 mapeadas.
- Review independente se contrato publico mudar.

## Stop Conditions

- Contrato exige implementacao de feature para ser entendido.
- Dois subagentes precisam editar o mesmo boundary.
- Literais de status aparecem fora do contrato canonico sem justificativa.

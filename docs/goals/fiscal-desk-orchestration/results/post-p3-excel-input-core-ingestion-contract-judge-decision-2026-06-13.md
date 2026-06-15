# Post P3 Excel Input Core Ingestion Contract Judge Decision

Data: 2026-06-13 21:12:11 -03
Status: needs_rework_scope_violation

## Contexto

- Worker thread: `019ec370-acf3-76e1-b59c-d7f7fccfab56`
- Worktree: `/Users/icaroaguiar/.codex/worktrees/a88b/consulta-simples-csv`
- Worker receipt:
  `docs/goals/fiscal-desk-orchestration/results/post-p3-excel-input-core-ingestion-contract-2026-06-13.md`
- Worker receipt status observado: `ready_for_judge_review`

## Evidencia Do Judge

O judge inspecionou a thread, o receipt, o status e o diff da worktree do
worker.

Checks repetidos pelo judge:

- `pnpm exec vitest run test/unit/fiscal-ingestion.test.ts test/unit/xlsx-reader.test.ts test/unit/fiscal-desk-phase-6-contracts.test.ts`:
  pass, 3 arquivos e 13 testes.
- `pnpm lint`: pass, 124 arquivos.
- `pnpm typecheck`: pass.
- `QUALITY_GATE_DIFF_MODE=worktree node docs/ai/quality-gate/check-ratchet.mjs`:
  pass, PR coverage 100%, warning nao bloqueante
  `agentic-review.not-enforced`.
- `git diff --check`: pass.

Observacao: as primeiras tentativas de Vitest/ratchet pelo judge falharam no
sandbox com `EPERM` ao gravar caches/relatorios dentro da worktree isolada
fora da raiz gravavel. Os mesmos comandos foram repetidos fora do sandbox e
passaram.

## Decisao

O resultado ainda nao pode seguir para review independente nem integracao.

Bloqueio encontrado:

- `test/unit/fiscal-desk-phase-6-contracts.test.ts` foi alterado pelo worker;
- esse arquivo nao constava no allowed write set estrito do dispatch;
- a regra de orquestracao exige que material code candidates respeitem o
  allowed write set antes de qualquer review/integracao.

Isto e rework, nao blocker externo. O worker recebeu rework na mesma thread em
`2026-06-13 21:12:11 -03`.

## Rework Requerido

- Remover completamente a alteracao em
  `test/unit/fiscal-desk-phase-6-contracts.test.ts`.
- Manter a prova de contrato XLSX apenas nos arquivos permitidos:
  - `src/core/ingestion/ingestion-contract.ts`
  - `src/core/ingestion/fiscal-ingestion.ts`
  - `src/core/ingestion/xlsx-reader.ts`
  - `test/unit/fiscal-ingestion.test.ts`
  - `test/unit/xlsx-reader.test.ts`
  - `docs/goals/fiscal-desk-orchestration/results/post-p3-excel-input-core-ingestion-contract-2026-06-13.md`
- Atualizar o receipt para `Status: ready_for_judge_review_after_rework` se
  todos os checks passarem.
- Repetir todos os checks obrigatorios do dispatch.

## Nao Autorizado

- Nenhuma integracao na branch final.
- Nenhum review independente ainda.
- Nenhuma liberacao de UI/IPC/preload/runtime Electron/package/lock.

# Post P3 Excel Input Core Ingestion Contract Review Dispatch

Data: 2026-06-13 21:14:48 -03
Status: dispatch_prepared

## Contexto

- Repo canonico: `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv`
- Branch final: `feat/fiscal-desk-local-base-prep`
- Worker thread: `019ec370-acf3-76e1-b59c-d7f7fccfab56`
- Worker worktree: `/Users/icaroaguiar/.codex/worktrees/a88b/consulta-simples-csv`
- Worker receipt:
  `/Users/icaroaguiar/.codex/worktrees/a88b/consulta-simples-csv/docs/goals/fiscal-desk-orchestration/results/post-p3-excel-input-core-ingestion-contract-2026-06-13.md`
- Original dispatch:
  `docs/goals/fiscal-desk-orchestration/results/post-p3-excel-input-core-ingestion-contract-dispatch-2026-06-13.md`
- Rework judge decision:
  `docs/goals/fiscal-desk-orchestration/results/post-p3-excel-input-core-ingestion-contract-judge-decision-2026-06-13.md`
- After-rework judge decision:
  `docs/goals/fiscal-desk-orchestration/results/post-p3-excel-input-core-ingestion-contract-after-rework-judge-decision-2026-06-13.md`

## Missao Do Reviewer

Revisar independentemente o candidate material `post_p3_excel_input_core_ingestion_contract`
apos rework, sem integrar e sem editar codigo.

O reviewer deve avaliar:

- se todos os arquivos alterados estao dentro do allowed write set;
- se a alteracao fora do allowlist em
  `test/unit/fiscal-desk-phase-6-contracts.test.ts` foi realmente removida;
- se `readXlsx` e `ingestFiscalXlsx` preservam o contrato fiscal de ingestion
  sem regredir CSV;
- se a primeira worksheet relevante, cabecalhos, linhas, row numbers,
  CNPJ invalido, duplicado, coluna ausente e formato nao suportado estao
  coerentemente cobertos;
- se ha risco de integracao futura em UI/IPC/runtime/package/lock apesar do
  recorte ser core-only;
- se os riscos residuais do receipt sao suficientes.

## Allowed Writes Do Reviewer

O reviewer pode escrever somente:

- `docs/goals/fiscal-desk-orchestration/results/post-p3-excel-input-core-ingestion-contract-review-2026-06-13.md`

Nao edite codigo, package/lock, scripts, UI, IPC, runtime, docs fiscais,
QA/ADR ou o worker worktree.

## Checks Sugeridos

No worker worktree, o reviewer pode repetir:

- `git status --short --branch --untracked-files=all`
- `git diff --name-only`
- `git diff -- test/unit/fiscal-desk-phase-6-contracts.test.ts`
- `pnpm exec vitest run test/unit/fiscal-ingestion.test.ts test/unit/xlsx-reader.test.ts test/unit/fiscal-desk-phase-6-contracts.test.ts`
- `pnpm typecheck`
- `pnpm lint`
- `git diff --check`

Se o sandbox bloquear writes de cache/relatorio, registre o blocker e use a
evidencia ja disponivel no worker/judge; nao altere o candidate.

## Receipt

Escreva o receipt em:

`docs/goals/fiscal-desk-orchestration/results/post-p3-excel-input-core-ingestion-contract-review-2026-06-13.md`

Status exatamente um de:

- `approved_candidate`
- `needs_rework`
- `blocked_reviewer_environment`

Inclua arquivos lidos, comandos rodados, findings ordenados por severidade,
decisao, riscos residuais e proxima acao recomendada. Nao se autoaprove como
integrado; o Codex primario continuara sendo judge/integrador.


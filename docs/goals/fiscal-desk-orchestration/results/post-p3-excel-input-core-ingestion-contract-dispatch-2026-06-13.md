# Post P3 Excel Input Core Ingestion Contract Dispatch

Data: 2026-06-13 21:00:05 -03
Status: dispatch_prepared

## Contexto Canonico

- Repo: `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv`
- Branch final: `feat/fiscal-desk-local-base-prep`
- HEAD observado: `e622743 docs: record post legacy owner selection active`
- Goal mestre: `docs/goals/fiscal-desk-orchestration/goal.md`
- Estado: `docs/goals/fiscal-desk-orchestration/state.yaml`
- Plano: `docs/goals/fiscal-desk-orchestration/integration-plan.md`
- Scope selection aceito:
  `results/post-p3-legacy-polish-next-owner-window-selection-judge-decision-2026-06-13.md`

## Missao Do Worker

Implementar somente o owner window material
`post_p3_excel_input_core_ingestion_contract`.

Objetivo estreito: adicionar suporte inicial de ingestao Excel no core de
ingestion, convertendo a primeira planilha/aba relevante para o mesmo contrato
de batch fiscal usado por CSV, preservando deduplicacao, invalidos, falta de
coluna CNPJ e metadados de origem.

Este recorte nao torna Excel disponivel no app. Nao exponha Excel em UI, IPC,
preload, runtime Electron, file picker, smoke Electron ou documentacao fiscal.

## Leitura Obrigatoria

- `AGENTS.md`
- `docs/goals/fiscal-desk-orchestration/goal.md`
- `docs/goals/fiscal-desk-orchestration/state.yaml`
- `docs/goals/fiscal-desk-orchestration/integration-plan.md`
- Este dispatch
- `docs/goals/fiscal-desk-orchestration/results/post-p3-legacy-polish-next-owner-window-selection-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-legacy-polish-next-owner-window-selection-judge-decision-2026-06-13.md`
- `src/core/ingestion/ingestion-contract.ts`
- `src/core/ingestion/fiscal-ingestion.ts`
- `src/core/ingestion/csv-reader.ts`
- `src/core/ingestion/detect-cnpj-column.ts`
- `test/unit/fiscal-ingestion.test.ts`
- `test/unit/fiscal-desk-phase-6-contracts.test.ts`
- `package.json`, apenas para confirmar que `exceljs` ja existe.

## Allowed Writes

- `src/core/ingestion/ingestion-contract.ts`
- `src/core/ingestion/fiscal-ingestion.ts`
- `src/core/ingestion/xlsx-reader.ts`
- `test/unit/fiscal-ingestion.test.ts`
- `test/unit/xlsx-reader.test.ts`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-excel-input-core-ingestion-contract-2026-06-13.md`

## Do-Not-Touch

- `src/renderer/**`
- `src/main/**`
- `src/main/ipc/**`
- `src/main/preload.ts`
- `src/core/app/**`
- `src/core/export/**`
- `src/core/simples/**`
- `src/core/public-base/**`
- `test/integration/**`
- `scripts/**`
- `package.json`
- `pnpm-lock.yaml`
- `electron-builder.yml`
- `.github/**`
- `docs/fiscal-desk/**`
- `docs/qa/**`
- `docs/adr/**`
- `.visual-fidelity/**`
- `dist/**`
- `dist-electron/**`

## Requisitos De Comportamento

- Adicionar `xlsx` ao contrato de formato de entrada fiscal.
- Ler workbook XLSX usando a dependencia ja existente `exceljs`.
- Converter a primeira worksheet relevante para linhas `Record<string, string>`
  compativeis com o pipeline atual.
- Preservar semanticas atuais de:
  - coluna CNPJ detectada automaticamente ou por override;
  - falta de coluna CNPJ;
  - CNPJ invalido;
  - CNPJ duplicado;
  - source metadata;
  - contagem de linhas validas/invalidas/unicas.
- Manter CSV funcionando sem regressao.
- Nao adicionar dependencia nova.
- Nao alterar runtime `processCsv`, IPC, preload, renderer, providers ou export.

## Stop Conditions

Pare com `Status: blocked_scope_expansion_required` se a implementacao exigir
qualquer arquivo fora do allowed write set.

Pare com `Status: blocked_dependency_required` se leitura XLSX exigir dependencia
nova ou mudanca em `package.json`/`pnpm-lock.yaml`.

Pare com `Status: needs_rework` se os testes focados ou full suite falharem por
erro de implementacao que ainda possa ser corrigido dentro do allowed write set.

## Checks Obrigatorios

- `git status --short --branch --untracked-files=all`
- `pnpm exec vitest run test/unit/fiscal-ingestion.test.ts test/unit/xlsx-reader.test.ts test/unit/fiscal-desk-phase-6-contracts.test.ts`
- `pnpm test`
- `pnpm test:coverage`
- `pnpm lint`
- `pnpm typecheck`
- `QUALITY_GATE_DIFF_MODE=worktree node docs/ai/quality-gate/check-ratchet.mjs`
- `git diff --check`

Nao rode `pnpm smoke:electron-ui`, `pnpm smoke:visual`, `pnpm smoke:real-csv`,
dist, publish, deploy, signing ou notarization para este recorte. Se voce achar
que um smoke Electron ou CSV e necessario, pare e registre o motivo no receipt;
nao amplie a superficie por conta propria.

## Receipt

Escreva o receipt em:

`docs/goals/fiscal-desk-orchestration/results/post-p3-excel-input-core-ingestion-contract-2026-06-13.md`

Status exatamente um de:

- `ready_for_judge_review`
- `needs_rework`
- `blocked_scope_expansion_required`
- `blocked_dependency_required`

Inclua:

- HEAD observado;
- arquivos lidos;
- arquivos alterados;
- resumo do diff;
- checks com resultados;
- confirmacao de que CSV continuou coberto;
- confirmacao de que nao houve UI/IPC/preload/runtime Electron/package/lock;
- riscos residuais;
- side effects: confirmar sem stage, commit, push, PR, deploy, publish, dist,
  signing, notarization ou side effect externo.

Nao se autoaprove. O Codex primario julgara, pedira review independente e so
depois podera integrar.

# Post P3 Excel Input Core Ingestion Contract

Data: 2026-06-13
Status: ready_for_judge_review_after_rework

## HEAD Observado

- `3b0d79cd8be457d1b4448ab47988ec9d33804d63 docs: dispatch excel ingestion owner window`
- Worktree: `/Users/icaroaguiar/.codex/worktrees/a88b/consulta-simples-csv`
- Branch/status: `## HEAD (no branch)`

## Arquivos Lidos

- `AGENTS.md`
- `docs/goals/fiscal-desk-orchestration/goal.md`
- `docs/goals/fiscal-desk-orchestration/state.yaml`
- `docs/goals/fiscal-desk-orchestration/integration-plan.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-excel-input-core-ingestion-contract-dispatch-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-legacy-polish-next-owner-window-selection-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-legacy-polish-next-owner-window-selection-judge-decision-2026-06-13.md`
- `src/core/ingestion/ingestion-contract.ts`
- `src/core/ingestion/fiscal-ingestion.ts`
- `src/core/ingestion/csv-reader.ts`
- `src/core/ingestion/detect-cnpj-column.ts`
- `test/unit/fiscal-ingestion.test.ts`
- `test/unit/fiscal-desk-phase-6-contracts.test.ts`
- `package.json`

## Arquivos Alterados

- `src/core/ingestion/ingestion-contract.ts`
- `src/core/ingestion/fiscal-ingestion.ts`
- `src/core/ingestion/xlsx-reader.ts`
- `test/unit/fiscal-ingestion.test.ts`
- `test/unit/xlsx-reader.test.ts`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-excel-input-core-ingestion-contract-2026-06-13.md`

## Rework De Escopo

- Resultado do judge recebido: `needs_rework_scope_violation`.
- Violacao corrigida: a alteracao feita em `test/unit/fiscal-desk-phase-6-contracts.test.ts` foi removida completamente.
- Confirmacao final: `git diff -- test/unit/fiscal-desk-phase-6-contracts.test.ts` nao retorna diff.
- Provas de contrato XLSX ficaram restritas aos arquivos permitidos: `ingestion-contract.ts`, `fiscal-ingestion.ts`, `xlsx-reader.ts`, `fiscal-ingestion.test.ts`, `xlsx-reader.test.ts` e este receipt.

## Resumo Do Diff

- Adicionado `FISCAL_INGESTION_INPUT_FORMAT.XLSX` ao contrato de ingestion.
- Criado `readXlsx` com `exceljs` para ler a primeira worksheet nao vazia/relevante, converter cabecalhos e linhas para `Record<string, string>` e preservar numeros reais das linhas da planilha.
- Adicionado `ingestFiscalXlsx`, assíncrono, reaproveitando a mesma montagem de batch fiscal usada por CSV.
- Mantidas as semanticas de deteccao/override de coluna CNPJ, falta de coluna CNPJ, CNPJ invalido, CNPJ duplicado, metadados de origem e contadores de linhas validas/invalidas/unicas.
- Adicionados testes unitarios para leitor XLSX, ingestao XLSX valida, deduplicacao, invalidos, coluna CNPJ ausente e formato nao suportado.

## Checks

| Check | Resultado |
|---|---|
| `git status --short --branch --untracked-files=all` | pass; `## HEAD (no branch)`, alteracoes somente no allowed write set apos rework |
| `pnpm exec vitest run test/unit/fiscal-ingestion.test.ts test/unit/xlsx-reader.test.ts test/unit/fiscal-desk-phase-6-contracts.test.ts` | pass; 3 arquivos, 13 testes |
| `pnpm test` | pass; 43 arquivos, 278 testes |
| `pnpm test:coverage` | pass; 43 arquivos, 278 testes; coverage global 76.27%, ingestion 90.8%, PR coverage 100% no ratchet |
| `pnpm lint` | pass; Biome check em 124 arquivos |
| `pnpm typecheck` | pass; `tsc --noEmit` |
| `QUALITY_GATE_DIFF_MODE=worktree node docs/ai/quality-gate/check-ratchet.mjs` | pass; changedFiles somente no allowed write set; aviso nao bloqueante `agentic-review.not-enforced`, review independente segue requisito de closeout |
| `git diff --check` | pass |

Observacao de bootstrap: a primeira tentativa de teste focado falhou porque `vitest` nao estava instalado nesta worktree. Rodei `pnpm install`; o lockfile estava atualizado, nada foi alterado em `package.json` ou `pnpm-lock.yaml`.

## Confirmacoes De Escopo

- CSV preservado: `ingestFiscalCsv` continua sincrono e coberto pelos testes existentes e pela suite completa; a logica comum de batch foi apenas reaproveitada.
- Violacao de escopo corrigida: `test/unit/fiscal-desk-phase-6-contracts.test.ts` voltou ao estado do HEAD base e nao aparece no diff final.
- Excel nao foi exposto no app: nao houve alteracao em UI, renderer, IPC, preload, `src/core/app`, runtime Electron, file picker ou smokes.
- Nao houve alteracao em providers, Base Publica Local, export/delivery, scripts, docs fiscais/QA/ADR, release/update, dist, signing ou notarization.
- Nao houve dependencia nova nem mudanca em `package.json`/`pnpm-lock.yaml`; `exceljs` ja existia.

## Riscos Residuais

- O suporte XLSX ainda e core-only; uma janela posterior precisa decidir UI/IPC/runtime antes de qualquer disponibilidade ao usuario.
- O leitor usa uma regra simples: primeira worksheet nao vazia, primeira linha nao vazia como cabecalho, linhas vazias ignoradas. Planilhas reais com cabecalhos mesclados, preambulos complexos, multiplas tabelas ou CNPJs numericos sem zeros a esquerda podem exigir refinamento futuro.
- O ratchet informa que review agentico nao e enforced em CI; review independente continua obrigatorio antes de integracao.
- O harness emitiu aviso warn-only de `magic_string_boundary=2`. O codigo de producao usa `FISCAL_INGESTION_INPUT_FORMAT`; os literais restantes sao asserts de contrato em testes/receipt.

## Side Effects

- Sem stage.
- Sem commit.
- Sem push.
- Sem PR.
- Sem deploy.
- Sem publish.
- Sem dist.
- Sem signing.
- Sem notarization.
- Sem smoke Electron, smoke visual ou smoke real CSV.
- Side effect local limitado a `pnpm install` para materializar `node_modules` nesta worktree isolada; lockfile permaneceu sem alteracao.

## Recomendacao

Resultado pronto para judge review apos rework. Nao autoaprovo. O Codex primario deve validar o diff, solicitar review independente e decidir integracao na branch canonica `feat/fiscal-desk-local-base-prep`.

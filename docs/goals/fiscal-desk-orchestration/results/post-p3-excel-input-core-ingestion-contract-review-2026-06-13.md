# Post P3 Excel Input Core Ingestion Contract Independent Review

Data: 2026-06-13 21:18:19 -03
Status: approved_candidate

## Contexto

- Review thread: `019ec37c-a5f4-70e2-ba8f-5f065163a3ab`
- Worker thread: `019ec370-acf3-76e1-b59c-d7f7fccfab56`
- Worker worktree: `/Users/icaroaguiar/.codex/worktrees/a88b/consulta-simples-csv`
- Branch final de integracao: `feat/fiscal-desk-local-base-prep`
- Candidate revisado: pos-rework, sem integracao.

## Arquivos Lidos

- `AGENTS.md`
- `docs/goals/fiscal-desk-orchestration/goal.md`
- `docs/goals/fiscal-desk-orchestration/state.yaml`
- `docs/goals/fiscal-desk-orchestration/integration-plan.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-excel-input-core-ingestion-contract-review-dispatch-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-excel-input-core-ingestion-contract-dispatch-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-excel-input-core-ingestion-contract-judge-decision-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-excel-input-core-ingestion-contract-after-rework-judge-decision-2026-06-13.md`
- `/Users/icaroaguiar/.codex/worktrees/a88b/consulta-simples-csv/docs/goals/fiscal-desk-orchestration/results/post-p3-excel-input-core-ingestion-contract-2026-06-13.md`
- `/Users/icaroaguiar/.codex/worktrees/a88b/consulta-simples-csv/src/core/ingestion/ingestion-contract.ts`
- `/Users/icaroaguiar/.codex/worktrees/a88b/consulta-simples-csv/src/core/ingestion/fiscal-ingestion.ts`
- `/Users/icaroaguiar/.codex/worktrees/a88b/consulta-simples-csv/src/core/ingestion/xlsx-reader.ts`
- `/Users/icaroaguiar/.codex/worktrees/a88b/consulta-simples-csv/src/core/ingestion/csv-reader.ts`
- `/Users/icaroaguiar/.codex/worktrees/a88b/consulta-simples-csv/src/core/ingestion/detect-cnpj-column.ts`
- `/Users/icaroaguiar/.codex/worktrees/a88b/consulta-simples-csv/test/unit/fiscal-ingestion.test.ts`
- `/Users/icaroaguiar/.codex/worktrees/a88b/consulta-simples-csv/test/unit/xlsx-reader.test.ts`
- `/Users/icaroaguiar/.codex/worktrees/a88b/consulta-simples-csv/package.json`

## Comandos Rodados

No worker worktree:

| Comando | Resultado |
|---|---|
| `git status --short --branch --untracked-files=all` | pass; lista somente arquivos dentro do allowlist, incluindo untracked permitidos |
| `git diff --name-only` | pass; tracked diff restrito a `src/core/ingestion/fiscal-ingestion.ts`, `src/core/ingestion/ingestion-contract.ts`, `test/unit/fiscal-ingestion.test.ts` |
| `git ls-files --others --exclude-standard` | pass; untracked restritos a receipt, `src/core/ingestion/xlsx-reader.ts`, `test/unit/xlsx-reader.test.ts` |
| `git diff -- test/unit/fiscal-desk-phase-6-contracts.test.ts` | pass; sem output, confirmando remocao do diff fora do allowlist |
| `git diff --check` | pass |
| `git diff --stat` | pass; tracked diff com 3 arquivos, 259 insercoes e 8 remocoes |
| `git diff -- package.json pnpm-lock.yaml src/main src/renderer src/core/app src/core/export src/core/simples src/core/public-base scripts docs/fiscal-desk docs/qa docs/adr .github electron-builder.yml` | pass; sem output |
| `git diff --name-only -- src/main src/renderer src/core/app src/core/export src/core/simples src/core/public-base test/integration scripts package.json pnpm-lock.yaml electron-builder.yml .github docs/fiscal-desk docs/qa docs/adr .visual-fidelity dist dist-electron` | pass; sem output |
| `git status --short --untracked-files=all -- package.json pnpm-lock.yaml src/main src/renderer src/core/app src/core/export src/core/simples src/core/public-base test/integration scripts docs/fiscal-desk docs/qa docs/adr .visual-fidelity dist dist-electron electron-builder.yml .github` | pass; sem output |

Nao repeti Vitest/lint/typecheck nesta thread para evitar writes de cache ou relatorio no worker worktree, que esta fora da raiz gravavel deste reviewer. Usei como evidencia complementar os checks repetidos pelo worker e pelo judge apos rework:

- focused Vitest: pass, 3 arquivos e 13 testes;
- `pnpm lint`: pass;
- `pnpm typecheck`: pass;
- ratchet em modo worktree: pass, PR coverage 100%, warning nao bloqueante `agentic-review.not-enforced`;
- `git diff --check`: pass.

## Findings

Nenhum finding bloqueante.

## Avaliacao De Escopo

O candidate esta restrito ao allowed write set do dispatch:

- `src/core/ingestion/ingestion-contract.ts`
- `src/core/ingestion/fiscal-ingestion.ts`
- `src/core/ingestion/xlsx-reader.ts`
- `test/unit/fiscal-ingestion.test.ts`
- `test/unit/xlsx-reader.test.ts`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-excel-input-core-ingestion-contract-2026-06-13.md`

Confirmado: `test/unit/fiscal-desk-phase-6-contracts.test.ts` nao tem diff no worker worktree.

Confirmado: nao ha diff em UI, IPC, preload, runtime Electron, `src/core/app`, export, providers, Base Publica Local, scripts, package/lock, release/update, docs fiscais/QA/ADR, `.github`, `dist` ou `dist-electron`.

## Avaliacao Do Contrato

O patch adiciona `FISCAL_INGESTION_INPUT_FORMAT.XLSX` ao contrato de ingestion e cria `ingestFiscalXlsx` como caminho core-only assíncrono, sem alterar a assinatura sincrona de `ingestFiscalCsv`.

`ingestFiscalXlsx` reaproveita a mesma montagem de batch usada por CSV, preservando:

- deteccao de coluna CNPJ e override via `cnpjColumn`;
- issue de coluna CNPJ ausente com contagem de linhas preservada;
- CNPJ invalido;
- CNPJ duplicado;
- metadados de source;
- contadores de linhas totais, validas, invalidas, unicas e duplicadas.

`readXlsx` usa `exceljs`, dependencia ja existente no `package.json`, normaliza `Buffer`, `ArrayBuffer` e `Uint8Array`, seleciona a primeira worksheet com linhas nao vazias, trata a primeira linha nao vazia como header e preserva os numeros reais das linhas da planilha.

## Avaliacao De Testes

A cobertura adicionada e proporcional ao recorte:

- reader XLSX: primeira worksheet relevante, conversao para records, boolean como string e workbook sem linhas relevantes;
- ingestion XLSX: batch valido, metadados, row numbers, invalidos, duplicados, coluna CNPJ ausente e formato nao suportado antes do parse;
- CSV: testes existentes permanecem no mesmo arquivo e cobrem o caminho sincrono preservado.

O teste de contrato F6 nao foi alterado no candidate final, conforme exigido pelo rework.

## Riscos Residuais

- O suporte XLSX permanece core-only. Uma janela futura ainda precisa decidir UI, IPC, preload, runtime Electron, file picker e smokes antes de disponibilizar Excel ao usuario.
- A heuristica de XLSX e intencionalmente simples: primeira worksheet nao vazia e primeira linha nao vazia como header. Planilhas reais com preambulo, headers mesclados, multiplas tabelas ou dados formatados de modo incomum podem exigir refinamento futuro.
- CNPJs numericos sem zeros a esquerda podem chegar ao core ja sem informacao suficiente para recuperacao perfeita; isso deve ser tratado como risco de ingestao real em janela posterior, nao como regressao deste recorte core-only.
- O ratchet ainda reporta `agentic-review.not-enforced` como warning; este receipt supre o review independente antes da decisao do judge, mas nao substitui enforcement de CI.

## Decisao

`approved_candidate`

O candidate pos-rework esta aprovado para julgamento do Codex primario. Esta revisao nao integra, nao faz stage, nao commita, nao cria PR e nao autoriza validacao de usuario final.

## Proxima Acao Recomendada

O Codex primario deve julgar este receipt, decidir se integra o candidate na branch `feat/fiscal-desk-local-base-prep` e, se integrar, rodar os checks proporcionais na worktree canonica integrada antes de qualquer nova liberacao.

# Post P3 Excel Input Runtime Exposure Rework Review

Data: 2026-06-13
Status: approved_rework

## Escopo

Confirmacao independente restrita ao rework do finding bloqueante anterior sobre
fingerprint/metadado de parser XLSX no candidate
`post_p3_excel_input_runtime_exposure`.

Nao reabri o review completo do candidate, nao editei codigo, nao stageei, nao
commitei, nao fiz push, nao abri PR e nao integrei na branch final.

## Arquivos Lidos

- `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/goals/fiscal-desk-orchestration/results/post-p3-excel-input-runtime-exposure-rework-review-dispatch-2026-06-13.md`
- `/Users/icaroaguiar/.codex/worktrees/16e4/consulta-simples-csv/docs/goals/fiscal-desk-orchestration/results/post-p3-excel-input-runtime-exposure-2026-06-13.md`
- `/Users/icaroaguiar/.codex/worktrees/16e4/consulta-simples-csv/src/main/execution/file-process-execution-ledger.ts`
- `/Users/icaroaguiar/.codex/worktrees/16e4/consulta-simples-csv/test/unit/main/file-process-execution-ledger.test.ts`

## Comandos Rodados

| Comando | Resultado |
|---|---|
| `git -C /Users/icaroaguiar/.codex/worktrees/16e4/consulta-simples-csv status --short --branch --untracked-files=all` | pass; candidate completo ainda em diff, receipt do worker untracked |
| `git -C /Users/icaroaguiar/.codex/worktrees/16e4/consulta-simples-csv diff --name-only` | pass; diff dentro do allowed write set original do worker |
| `git -C /Users/icaroaguiar/.codex/worktrees/16e4/consulta-simples-csv diff -- src/main/execution/file-process-execution-ledger.ts test/unit/main/file-process-execution-ledger.test.ts` | pass; usado para revisar o rework |
| `git -C /Users/icaroaguiar/.codex/worktrees/16e4/consulta-simples-csv diff --check` | pass |
| `rg -n "inputCsv|inputFormat|csv-reader-v1|xlsx-reader-v1|createInputFingerprint" ...` | pass; usado para conferir fallback CSV e teste XLSX |

Nao reexecutei Vitest nesta thread: o dispatch ja traz evidencia do judge para
`pnpm exec vitest run test/unit/main/file-process-execution-ledger.test.ts test/integration/process-csv.use-case.test.ts`
como pass, 2 arquivos e 30 testes. A confirmacao aqui foi semantica e restrita
ao patch de rework.

## Respostas Obrigatorias

1. O fingerprint agora usa a versao efetiva do parser por `inputFormat`?

Sim. Em `src/main/execution/file-process-execution-ledger.ts`, `createInputFingerprint`
normaliza `inputFormat`, calcula `parserVersion = resolveParserVersion(inputFormat)`
e serializa `csvParserVersion: parserVersion` no material do hash. O metadado
operacional usa a mesma resolucao via `resolveParserVersion(normalizeInputFormat(...))`.

2. XLSX entra no material do fingerprint com `xlsx-reader-v1`?

Sim. `resolveParserVersion` retorna `XLSX_PARSER_VERSION` quando
`inputFormat === PROCESS_CSV_INPUT_FORMAT.XLSX`, e `XLSX_PARSER_VERSION` esta
definido como `"xlsx-reader-v1"`. O teste novo monta o hash esperado contendo
`csvParserVersion: "xlsx-reader-v1"` e `inputFormat: "xlsx"`.

3. CSV legado permanece com `csv-reader-v1` e fallback CSV?

Sim. `normalizeInputFormat(undefined)` continua caindo para
`PROCESS_CSV_INPUT_FORMAT.CSV`, e `resolveParserVersion` retorna
`CSV_PARSER_VERSION` para qualquer formato que nao seja XLSX. O tipo de entrada
ainda aceita `inputCsv?: string`, preservando o caminho legado, e o historico
sem `inputFormat` continua exposto como CSV.

4. O teste novo falharia no candidate anterior e cobre o finding?

Sim. O teste `uses the effective XLSX parser version in the execution fingerprint`
calcula o fingerprint esperado com `csvParserVersion: "xlsx-reader-v1"` e depois
afirma que ele nao e igual ao hash com `csvParserVersion: "csv-reader-v1"` para
`inputFormat: "xlsx"`. No candidate anterior, `createInputFingerprint` sempre
serializava `CSV_PARSER_VERSION`, entao a primeira assercao falharia.

5. O rework ficou restrito ao escopo esperado?

Sim para o escopo de confirmacao. O patch relevante ficou em
`src/main/execution/file-process-execution-ledger.ts`,
`test/unit/main/file-process-execution-ledger.test.ts` e no receipt atualizado
do worker. O diff total da worker worktree ainda inclui o candidate original,
mas nao encontrei regressao diretamente causada pelo rework.

## Veredito

O rework resolve o finding bloqueante anterior. Recomendacao ao Codex primario:
pode tratar esta confirmacao como `approved_rework` para fins de julgamento do
candidate, mantendo a regra de que a integracao e a validacao final continuam
sob responsabilidade do judge/integrador na branch
`feat/fiscal-desk-local-base-prep`.

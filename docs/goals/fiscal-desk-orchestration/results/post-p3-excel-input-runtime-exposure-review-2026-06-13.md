# Post P3 Excel Input Runtime Exposure Review

Data: 2026-06-13
Status: needs_rework

## Escopo Do Review

Review independente do candidate material `post_p3_excel_input_runtime_exposure`
na worker worktree `/Users/icaroaguiar/.codex/worktrees/16e4/consulta-simples-csv`,
sem editar codigo do candidato, sem stage, sem commit e sem integracao.

## Comandos E Evidencia

| Comando | Resultado |
|---|---|
| `git -C /Users/icaroaguiar/.codex/worktrees/16e4/consulta-simples-csv status --short --branch --untracked-files=all` | pass; diff tracked restrito ao allowed write set do worker; receipt do worker untracked |
| `git -C /Users/icaroaguiar/.codex/worktrees/16e4/consulta-simples-csv diff --name-only` | pass; nomes alterados dentro do allowed write set do dispatch |
| `git -C /Users/icaroaguiar/.codex/worktrees/16e4/consulta-simples-csv diff --stat` | pass; 20 arquivos, 557 insercoes e 141 remocoes |
| `git -C /Users/icaroaguiar/.codex/worktrees/16e4/consulta-simples-csv diff --check` | pass |
| `pnpm exec vitest run test/unit/main/file-process-execution-ledger.test.ts test/integration/process-csv.use-case.test.ts` na worker worktree | bloqueado pelo sandbox: `EPERM` ao abrir `node_modules/.vite-temp/vitest.config.ts.timestamp-...mjs`; reviewer usou evidencia ja registrada pelo worker e judge |

## Finding Bloqueante

### Fingerprint XLSX nao inclui a versao efetiva do parser XLSX

Severidade: blocking.

Evidencia:

- `src/main/execution/file-process-execution-ledger.ts` define
  `CSV_PARSER_VERSION = "csv-reader-v1"` e
  `XLSX_PARSER_VERSION = "xlsx-reader-v1"`.
- `createInputFingerprint(...)` inclui sempre
  `csvParserVersion: CSV_PARSER_VERSION`, mesmo quando `inputFormat` e XLSX.
- `createOperationalMetadata(...)` grava `XLSX_PARSER_VERSION` quando o formato
  e XLSX, mas esse valor nao participa do fingerprint que decide a retomada.

Impacto:

O candidate distingue CSV/XLSX por `inputFormat` e hash de conteudo, mas nao
amarra o checkpoint a versao efetiva do parser XLSX. Se a heuristica de leitura
XLSX mudar no futuro, o mesmo arquivo XLSX pode continuar gerando a mesma ledger
key e reaproveitar checkpoint antigo, apesar de o conjunto parseado de
linhas/CNPJs poder mudar.

## Rework Requerido

- Fazer o fingerprint usar uma versao de parser normalizada pelo `inputFormat`
  ou um campo canonico equivalente.
- Manter compatibilidade explicita com CSV legado.
- Adicionar teste focado que prove que a versao efetiva do parser XLSX entra no
  material do fingerprint, ou que fingerprints XLSX mudam quando essa versao
  muda.
- Se o campo operacional continuar se chamando `csvParserVersion`, registrar a
  limitacao; se couber no owner window, corrigir para um nome canonico sem
  quebrar leitura de ledgers antigos.

## Avaliacao Qualitativa

A cobertura do candidate e boa para fluxo feliz e separacao basica CSV/XLSX:
core `processCsv` com XLSX, ledger separando CSV/XLSX, picker IPC retornando
bytes e `inputFormat`, preload encaminhando formato, smokes Electron reais com
`mock` e `base-publica-local`, autosave XLSX, checkpoint e retomada.

O gap e especificamente qualitativo: a invalidacao por versao efetiva do parser
XLSX ainda nao esta provada nem implementada no fingerprint.

## Recomendacao Ao Judge

Nao integrar o candidate ainda. Solicitar rework restrito ao ledger
fingerprint/metadado de parser XLSX e teste focado correspondente. Depois do
rework, repetir validacao proporcional e review/confirmacao independente antes
de integrar na branch final `feat/fiscal-desk-local-base-prep`.

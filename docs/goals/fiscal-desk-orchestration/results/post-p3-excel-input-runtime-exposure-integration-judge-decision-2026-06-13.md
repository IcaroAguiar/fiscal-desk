# Post P3 Excel Input Runtime Exposure Integration Judge Decision

Data: 2026-06-13 22:16:15 -03
Status: approved_by_judge_integrated_validated

## Decisao

Aceito e integrado na branch final `feat/fiscal-desk-local-base-prep`.

O candidato expos entrada Excel/XLSX no runtime real do app Electron mantendo o
caminho CSV existente. A integracao inclui picker IPC para `.csv`/`.xlsx`,
preload, contrato de app/core, ledger/fingerprint por formato de entrada,
retomada a partir do arquivo original, renderer com estado de `inputFormat`,
copy minima para CSV/Excel e smoke Electron para entrada XLSX.

Esta decisao fecha somente a janela material
`post_p3_excel_input_runtime_exposure`. Ela nao libera templates/modelos,
diagnosticos externos, telemetria, licenca/account, release/update,
PDF/Word/OCR ou Receita Web live/massiva.

## Threads

- Worker: `019ec38f-785c-7c43-a14b-61392cd1119e`
- Worker worktree:
  `/Users/icaroaguiar/.codex/worktrees/16e4/consulta-simples-csv`
- Worker receipt:
  `results/post-p3-excel-input-runtime-exposure-2026-06-13.md`
- Reviewer inicial: `019ec3a4-8c28-75e2-8315-77b0122fada6`
- Reviewer worktree:
  `/Users/icaroaguiar/.codex/worktrees/190d/consulta-simples-csv`
- Review receipt:
  `results/post-p3-excel-input-runtime-exposure-review-2026-06-13.md`
- Rework review receipt:
  `results/post-p3-excel-input-runtime-exposure-rework-review-2026-06-13.md`

## Review Independente E Rework

O primeiro review independente retornou `needs_rework` por um finding
bloqueante: `createInputFingerprint(...)` ainda serializava sempre
`csv-reader-v1`, enquanto o metadado operacional ja podia gravar
`xlsx-reader-v1`. Isso deixava a versao efetiva do parser XLSX fora da ledger
key.

O rework corrigiu o ledger para resolver a versao de parser por `inputFormat` e
usar o mesmo valor no fingerprint e no metadado operacional. O teste de ledger
agora prova que XLSX entra no material do fingerprint com `xlsx-reader-v1` e que
o hash antigo com `csv-reader-v1` nao e aceito para XLSX.

A confirmacao independente do rework retornou `approved_rework`.

## Ajuste Do Judge Na Integracao

Durante a validacao canonica, o ratchet apontou aumento de arquivos grandes:

- `src/main/execution/file-process-execution-ledger.ts`: acima do limite;
- `test/unit/main/file-process-execution-ledger.test.ts`: acima do limite.

O judge aplicou apenas ajuste mecanico de integracao para reduzir linhas sem
mudar comportamento: compactou a assinatura de `resolveParserVersion(...)` e
removeu duplicacao no teste de fingerprint com helper local. Depois disso, o
ratchet passou. Esse ajuste nao altera contrato, runtime ou semantica de
produto.

## Arquivos Integrados

- `scripts/smoke-electron-ui.ts`
- `src/core/app/process-csv.types.ts`
- `src/core/app/process-csv.use-case.ts`
- `src/main/execution/file-process-execution-ledger.ts`
- `src/main/ipc/process-csv.ipc.ts`
- `src/main/preload.ts`
- `src/main/types.ts`
- `src/renderer/ui/app-view.ts`
- `src/renderer/ui/app.ts`
- `src/renderer/ui/app.types.ts`
- `src/renderer/ui/operational-copy.ts`
- `test/integration/process-csv.use-case.test.ts`
- `test/unit/app-view.test.ts`
- `test/unit/main/file-process-execution-ledger.test.ts`
- `test/unit/preload.test.ts`
- `test/unit/process-csv-contracts.test.ts`
- `test/unit/process-csv.ipc-resume-delivery.test.ts`
- `test/unit/process-csv.ipc.delivery.test.ts`
- `test/unit/process-csv.ipc.test.ts`
- `test/unit/renderer-operational-copy.test.ts`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-excel-input-runtime-exposure-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-excel-input-runtime-exposure-review-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-excel-input-runtime-exposure-review-dispatch-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-excel-input-runtime-exposure-rework-dispatch-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-excel-input-runtime-exposure-rework-review-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-excel-input-runtime-exposure-rework-review-dispatch-2026-06-13.md`

## Evidencia Canonica

Checks rodados na branch final integrada:

| Check | Resultado |
|---|---|
| `git diff --check` | pass |
| `pnpm exec vitest run test/unit/main/file-process-execution-ledger.test.ts test/integration/process-csv.use-case.test.ts test/unit/process-csv.ipc.test.ts test/unit/preload.test.ts test/unit/app-view.test.ts test/unit/renderer-operational-copy.test.ts` | pass; 6 arquivos, 60 testes |
| `pnpm typecheck` | pass |
| `pnpm lint` | pass |
| `pnpm test` | pass; 43 arquivos, 283 testes |
| `pnpm test:coverage` | pass; 43 arquivos, 283 testes; cobertura global 76.39% |
| `pnpm build` | pass |
| `QUALITY_GATE_DIFF_MODE=worktree node docs/ai/quality-gate/check-ratchet.mjs` | primeira execucao falhou por large-file ratchet; apos ajuste do judge passou com cobertura global 76.39%, PR coverage 75.59% e warning nao bloqueante `agentic-review.not-enforced` |
| `pnpm exec vitest run test/unit/main/file-process-execution-ledger.test.ts test/integration/process-csv.use-case.test.ts` apos ajuste de ratchet | pass; 2 arquivos, 30 testes |
| `TMPDIR=/private/tmp FISCAL_DESK_SMOKE_INPUT_FORMAT=xlsx pnpm smoke:electron-ui` | pass; Electron real, provider `mock`, entrada XLSX, autosave XLSX, checkpoint e retomada |
| `TMPDIR=/private/tmp FISCAL_DESK_SMOKE_PROVIDER=base-publica-local FISCAL_DESK_SMOKE_INPUT_FORMAT=xlsx pnpm smoke:electron-ui` | pass; Electron real, provider `base-publica-local`, entrada XLSX, autosave XLSX, checkpoint e retomada |
| `TMPDIR=/private/tmp pnpm smoke:visual` | pass; desktop, tablet e mobile sem overflow, botoes cortados ou overlaps |

Smoke Electron `mock` comprovou `inputFormat: "xlsx"`, `deliveryFormat:
"xlsx"`, arquivo salvo `entrada-processado.xlsx`, checkpoint criado e copy de
retomada `1 CNPJ retomado`.

Smoke Electron `base-publica-local` comprovou o mesmo fluxo real com provider
local e checkpoint separado por provider/formato.

## Avaliacao Qualitativa

Os testes nao validam apenas linhas cobertas. Eles exercitam:

- parse XLSX pelo core app e preservacao do caminho CSV;
- contrato de IPC/preload com bytes serializaveis para XLSX;
- picker retornando `inputFormat`;
- ledger/fingerprint separando CSV e XLSX;
- retomada com formato registrado no ledger;
- renderer mantendo estado de formato e copy de CSV/Excel;
- Electron real com entrada XLSX, autosave XLSX, checkpoint e retomada nos
  providers `mock` e `base-publica-local`.

## Riscos Residuais Aceitos

- O campo operacional segue chamado `csvParserVersion` por compatibilidade com
  ledgers existentes, mas agora carrega a versao efetiva do parser conforme
  `inputFormat`.
- XLSX continua usando a heuristica core ja aceita: primeira worksheet nao
  vazia e primeira linha nao vazia como header.
- CNPJs numericos que ja perderam zeros a esquerda no Excel continuam risco da
  fonte original.
- Receita Web segue assistido/experimental e nao foi alterado por esta janela.
- O harness reportou `magic_string_boundary=3` como warn-only. O risco e aceito
  porque os literais restantes estao em testes/receipts para provar o material
  serializado do fingerprint; a superficie runtime usa constantes centralizadas
  para formato e versao de parser.
- `agentic-review.not-enforced` segue warning do ratchet. A exigencia
  operacional foi cumprida por review independente em thread propria e receipt
  versionado.

## Proximo Gate

Nenhum material worker permanece ativo apos esta integracao. A proxima onda deve
comecar por nova selecao read-only de owner window antes de liberar qualquer
trabalho material concorrente.

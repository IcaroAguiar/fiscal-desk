# Post P3 Excel Input Runtime Exposure

Data: 2026-06-13
Status: ready_for_judge_review

## Escopo

Candidate material para expor entrada Excel/XLSX no fluxo real do app Electron,
sem stage, commit, push, PR ou autoaprovacao. O resultado segue como candidato
para judge/integrador.

## Arquivos Lidos

- `AGENTS.md`
- `docs/goals/fiscal-desk-orchestration/goal.md`
- `docs/goals/fiscal-desk-orchestration/state.yaml`
- `docs/goals/fiscal-desk-orchestration/integration-plan.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-excel-input-runtime-exposure-dispatch-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-excel-ingestion-next-owner-window-selection-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-excel-ingestion-next-owner-window-selection-judge-decision-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-excel-input-core-ingestion-contract-integration-judge-decision-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-excel-input-core-ingestion-contract-review-2026-06-13.md`
- Superficies permitidas de core app, IPC/preload, ledger, renderer, testes e smoke Electron listadas no dispatch.

## Arquivos Alterados

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

Correcao de escopo aplicada: uma alteracao temporaria em
`test/unit/app-provider.test.ts` foi removida por estar fora do allowed write
set. `git diff -- test/unit/app-provider.test.ts` ficou sem output antes dos
checks finais.

## Comportamento Implementado

- `processCsv` aceita entrada CSV textual ou XLSX binaria com
  `inputFormat` explicito, usando `ingestFiscalXlsx`/`readXlsx` do core ja
  integrado para XLSX, sem parser no main ou renderer.
- O picker do Electron aceita `.csv` e `.xlsx`; CSV continua UTF-8 textual e
  XLSX trafega como bytes serializaveis pelo preload/IPC.
- Renderer preserva CSV atual e passa `inputFormat` ao runtime; copy minima foi
  ajustada para "planilha CSV ou Excel".
- Ledger/fingerprint inclui `inputFormat` e hash do conteudo de entrada,
  distinguindo CSV de XLSX para evitar checkpoint cruzado. Historico legado sem
  `inputFormat` permanece tratado como CSV.
- Retomada le o arquivo original conforme o formato registrado no ledger.
- Auto-save de saida segue pelo delivery atual; smokes provaram entrada XLSX
  com entrega XLSX salva.
- Provider `mock` continua default offline. Base Publica Local nao teve core ou
  provider alterados; apenas passou pelo fluxo comum de entrada XLSX no smoke.

## Evidencias De CSV Preservado E XLSX Novo

- Testes existentes de CSV continuam passando em suite focada e suite completa.
- Novo teste de integracao prova XLSX no `processCsv` com duplicado, invalido,
  output CSV preservado e chamadas unicas ao provider.
- Novo teste de ledger prova que CSV e XLSX nao compartilham checkpoint para o
  mesmo conteudo logico.
- Novo teste IPC prova picker XLSX retornando bytes e `inputFormat: "xlsx"`.
- Smokes Electron reais provaram entrada XLSX, checkpoint, retomada e auto-save
  `.xlsx` com `mock` e `base-publica-local`.

## Comandos Rodados

| Comando | Resultado |
|---|---|
| `git status --short` | pass; worktree inicialmente limpa |
| `git rev-parse HEAD` | pass; `c04cca437ffb75d72fe02602b445f3b543506dbd` |
| `pnpm exec vitest run ...` | primeiro bloqueado por `Command "vitest" not found` antes de bootstrap |
| `pnpm install` | pass; lockfile up to date, sem diff em package/lock |
| `pnpm exec vitest run test/integration/process-csv.use-case.test.ts test/integration/process-csv-ledger-resume.test.ts test/unit/main/file-process-execution-ledger.test.ts test/unit/process-csv-contracts.test.ts test/unit/process-csv.ipc.test.ts test/unit/process-csv.ipc.delivery.test.ts test/unit/process-csv.ipc-resume-delivery.test.ts test/unit/preload.test.ts test/unit/app-view.test.ts test/unit/app-helpers.test.ts test/unit/renderer-operational-copy.test.ts` | pass; 11 arquivos, 98 testes |
| `pnpm lint` | pass; 124 arquivos |
| `pnpm typecheck` | pass |
| `pnpm test` | pass; 43 arquivos, 282 testes |
| `pnpm test:coverage` | pass; 43 arquivos, 282 testes; coverage global 76.37% |
| `QUALITY_GATE_DIFF_MODE=worktree node docs/ai/quality-gate/check-ratchet.mjs` | pass; PR coverage 75.53%, coverage global 76.37%; warning `agentic-review.not-enforced` |
| `pnpm build` | pass |
| `FISCAL_DESK_SMOKE_INPUT_FORMAT=xlsx pnpm smoke:electron-ui` | bloqueado no sandbox por `listen EPERM` no pipe do `tsx` |
| `TMPDIR=/private/tmp FISCAL_DESK_SMOKE_INPUT_FORMAT=xlsx pnpm smoke:electron-ui` | bloqueado no sandbox por `listen EPERM` no pipe do `tsx` |
| `TMPDIR=/private/tmp FISCAL_DESK_SMOKE_INPUT_FORMAT=xlsx pnpm smoke:electron-ui` com escalacao | pass; Electron real, provider `mock`, entrada XLSX, autosave XLSX, checkpoint e retomada |
| `TMPDIR=/private/tmp FISCAL_DESK_SMOKE_PROVIDER=base-publica-local FISCAL_DESK_SMOKE_INPUT_FORMAT=xlsx pnpm smoke:electron-ui` com escalacao | pass; Electron real, Base Publica Local preparada, entrada XLSX, autosave XLSX, checkpoint e retomada |
| `TMPDIR=/private/tmp pnpm smoke:visual` | bloqueado no sandbox por `listen EPERM` no pipe do `tsx` |
| `TMPDIR=/private/tmp pnpm smoke:visual` com escalacao | pass; desktop/tablet/mobile sem overflow, botoes cortados ou overlaps |
| `git diff --check` | pass |
| `git status --short --branch --untracked-files=all` | pass; diff tracked restrito ao allowed write set e este receipt; sem untracked |

## Smoke Electron XLSX

Provider `mock`:

- `status`: `pass`
- `inputFormat`: `xlsx`
- `deliveryFormat`: `xlsx`
- `sourceFilePath`: `/private/tmp/fiscal-desk-electron-smoke-dili90/entrada.xlsx`
- `savedPath`: `/private/tmp/fiscal-desk-electron-smoke-dili90/entrada-processado.xlsx`
- `checkpointPath`: `/private/tmp/fiscal-desk-electron-smoke-dili90/user-data/execution-ledgers/mock-869879394328a0c910048fa7.json`
- `uiResumeText`: `1 CNPJ retomado`
- resumo: 5 linhas, 3 CNPJs unicos consultados, 1 retomado.

Provider `base-publica-local`:

- `status`: `pass`
- `inputFormat`: `xlsx`
- `deliveryFormat`: `xlsx`
- `sourceFilePath`: `/private/tmp/fiscal-desk-electron-smoke-Z7mkwk/entrada.xlsx`
- `savedPath`: `/private/tmp/fiscal-desk-electron-smoke-Z7mkwk/entrada-processado.xlsx`
- `checkpointPath`: `/private/tmp/fiscal-desk-electron-smoke-Z7mkwk/user-data/execution-ledgers/base-publica-local-6c942f509a6e182dbb165619.json`
- `uiResumeText`: `1 CNPJ retomado`
- resumo: 5 linhas, 3 CNPJs unicos consultados, 1 retomado.

## Limites E Riscos Residuais

- Review independente ainda nao foi executado nesta thread; ratchet registra
  `agentic-review.not-enforced` como warning operacional para PR/closeout.
- Harness diff policy reportou `magic_string_boundary=2` como warn-only durante
  a execucao. Os novos valores de formato estao centralizados em
  `PROCESS_CSV_INPUT_FORMAT`; os sinais restantes sao literais de teste/copy ou
  compatibilidade CSV local.
- `src/main/ipc/process-csv.ipc.ts` foi mantido abaixo do limite de 500 linhas
  removendo espacamento vertical redundante, porque o dispatch nao permite criar
  arquivo auxiliar para dividir responsabilidades.
- XLSX continua usando a heuristica core ja aceita: primeira worksheet nao vazia
  e primeira linha nao vazia como header.
- CNPJs numericos que ja perderam zeros a esquerda no Excel permanecem risco da
  fonte original.
- Smokes com `tsx` exigiram escalacao por bloqueio de pipe IPC local no sandbox;
  sem escalacao, o erro foi `listen EPERM`.

## Itens Que Seguem Bloqueados

- Package/lock, dependencia nova e release/update.
- Provider, Base Publica Local core/provider, Receita Web live/massiva.
- Export core, templates/modelos, entrega guiada ampla, PDF/Word/OCR.
- Diagnostico enviado, telemetria, licenca/account, storage/network/backend
  remoto.
- Docs fiscais/QA/ADR, `.visual-fidelity`, scripts fora do smoke Electron
  permitido.

## Recomendacao Ao Judge

Aceitar como `ready_for_judge_review` para review independente. Antes de
integracao, o judge deve confirmar novamente que o diff permanece no allowed
write set e rodar/reusar os checks proporcionais na branch final.

## Rework Pos-Review Independente

Data: 2026-06-13
Status: ready_for_judge_review

Review independente `019ec3a4-8c28-75e2-8315-77b0122fada6` retornou
`needs_rework` porque `createInputFingerprint(...)` ainda serializava sempre
`CSV_PARSER_VERSION`, mesmo para entrada XLSX. O metadado operacional ja gravava
`XLSX_PARSER_VERSION`, mas a versao efetiva do parser XLSX nao participava da
ledger key.

Rework aplicado:

- `src/main/execution/file-process-execution-ledger.ts`: `createInputFingerprint`
  agora resolve a versao efetiva do parser a partir de `inputFormat` e usa o
  mesmo valor que `createOperationalMetadata`.
- `test/unit/main/file-process-execution-ledger.test.ts`: novo teste focado
  calcula o hash esperado para XLSX com `csvParserVersion: "xlsx-reader-v1"` e
  prova que o hash anterior com `"csv-reader-v1"` nao e aceito.
- Este receipt foi atualizado. Nenhum outro arquivo foi tocado no rework.

Compatibilidade:

- CSV legado permanece com fallback para `PROCESS_CSV_INPUT_FORMAT.CSV` e
  `csv-reader-v1`.
- O campo operacional segue chamado `csvParserVersion` para compatibilidade do
  documento de ledger atual, mas agora contem a versao efetiva do parser do
  formato de entrada.

Checks minimos do rework:

| Comando | Resultado |
|---|---|
| `git status --short --branch --untracked-files=all` | pass; diff do candidate original permanece, rework restrito a ledger/teste/receipt; receipt aparece untracked permitido |
| `git diff --name-only` | pass; tracked diff dentro do allowed write set original |
| `git diff --check` | pass |
| `pnpm exec vitest run test/unit/main/file-process-execution-ledger.test.ts test/integration/process-csv.use-case.test.ts` | pass; 2 arquivos, 30 testes |
| `pnpm typecheck` | pass |
| `pnpm lint` | pass; 124 arquivos |

Risco residual do rework:

- Harness diff policy reportou `magic_string_boundary=3` como warn-only por
  literais de teste/receipt usados para provar o material serializado do
  fingerprint. A superficie runtime usa constantes centralizadas.

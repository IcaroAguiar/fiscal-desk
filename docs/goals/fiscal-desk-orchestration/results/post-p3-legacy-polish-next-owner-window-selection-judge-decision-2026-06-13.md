# Post P3 Legacy Polish Next Owner Window Selection Judge Decision

Data: 2026-06-13 21:00:05 -03
Status: approved_by_judge_scope_candidate

## Decisao

Aceito o candidato de escopo `post_p3_excel_input_core_ingestion_contract` como
proxima janela material estreita.

Esta decisao nao implementa Excel no app e nao libera UI, IPC, preload, runtime
Electron, release/update, diagnostico, telemetria, licenca/account, templates,
PDF/Word/OCR ou Receita Web live/massiva. Ela apenas autoriza preparar um worker
material single-writer limitado ao core de ingestao e testes unitarios.

## Evidencia Confrontada Pelo Judge

- Receipt do subagente:
  `results/post-p3-legacy-polish-next-owner-window-selection-2026-06-13.md`.
- `package.json`: `exceljs` ja existe como dependencia do projeto.
- `src/core/ingestion/ingestion-contract.ts`: `FISCAL_INGESTION_INPUT_FORMAT`
  declara somente `CSV`.
- `src/core/ingestion/fiscal-ingestion.ts`: `ingestFiscalCsv` rejeita formatos
  diferentes de CSV com `UNSUPPORTED_INPUT_FORMAT`.
- `test/unit/fiscal-ingestion.test.ts`: cobre o bloqueio atual para `format:
  "xlsx"`.
- Docs fiscais canonicos: Entrada Excel aparece como planejada/desabilitada ate
  owner window de ingestao e validacao real.

## Owner Window Aceito

`post_p3_excel_input_core_ingestion_contract`

Classificacao: `material single-writer`.

Escopo aceito: adicionar suporte inicial de ingestao Excel no core de ingestion,
convertendo a primeira planilha/aba relevante para o mesmo contrato de batch
fiscal usado por CSV, preservando deduplicacao, invalidos, falta de coluna CNPJ
e metadados de origem.

## Allowed Write Set Do Worker

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

## Checks Exigidos Do Worker

- `git status --short --branch --untracked-files=all`
- `pnpm exec vitest run test/unit/fiscal-ingestion.test.ts test/unit/xlsx-reader.test.ts test/unit/fiscal-desk-phase-6-contracts.test.ts`
- `pnpm test`
- `pnpm test:coverage`
- `pnpm lint`
- `pnpm typecheck`
- `QUALITY_GATE_DIFF_MODE=worktree node docs/ai/quality-gate/check-ratchet.mjs`
- `git diff --check`

Review independente sera obrigatorio antes de qualquer integracao na branch
canonica.

## Stop Conditions

O worker deve parar como `blocked_scope_expansion_required` se precisar tocar
UI, IPC, preload, runtime Electron, `src/core/app/**`, provider, export,
package/lock, scripts, docs fiscais/QA ou qualquer superficie fora do allowed
write set.

O worker deve parar como `blocked_dependency_required` se a leitura XLSX exigir
dependencia nova ou mudanca em `package.json`/`pnpm-lock.yaml`.

## Itens Ainda Bloqueados

- Expor Excel no app, file picker, IPC, preload ou smoke Electron.
- Entrega guiada/modelos/templates reutilizaveis.
- Diagnostico gerado/enviado.
- Telemetria real.
- Licenca/account real.
- Update/release/dist/publish/signing/notarization.
- Storage/network/backend remoto.
- PDF/Word/OCR reais.
- Receita Web live/massiva.

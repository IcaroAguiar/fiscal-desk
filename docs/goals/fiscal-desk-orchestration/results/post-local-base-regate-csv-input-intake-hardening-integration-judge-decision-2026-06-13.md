# Post Local Base Regate CSV Input Intake Hardening Integration Judge Decision

Data: 2026-06-13 17:20:37 -03
Status: `approved_by_judge_integrated_validated`
Judge thread: `019ebe5c-3853-79c2-87ad-8ddace386c93`
Worker thread: `019ec28a-ddee-7582-9b44-8298dd89f582`
Review thread: `019ec296-2ca5-73b0-b984-6379c1be7d78`

## Decision

O owner window `post_local_base_regate_csv_input_intake_hardening` esta
aprovado, integrado seletivamente na branch canonica
`feat/fiscal-desk-local-base-prep` e validado.

O primeiro review independente retornou `needs_rework` por um P2 em duplicados.
O worker corrigiu a montagem da coluna `mensagem`, adicionou teste focado para
duplicado com `lookupResult.message` preenchida e o re-review independente
retornou `approved_candidate`.

## Integrated Files

- `src/core/app/process-csv.use-case.ts`
- `src/core/ingestion/detect-cnpj-column.ts`
- `src/core/ingestion/fiscal-ingestion.ts`
- `test/integration/process-csv.use-case.test.ts`
- `test/unit/detect-cnpj-column.test.ts`
- `test/unit/fiscal-ingestion.test.ts`
- `docs/goals/fiscal-desk-orchestration/results/post-local-base-regate-csv-input-intake-hardening-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-local-base-regate-csv-input-intake-hardening-review-after-rework-2026-06-13.md`

## Canonical Validation

- `pnpm install --frozen-lockfile`: pass; bootstrap local, sem alterar
  `package.json` ou `pnpm-lock.yaml`.
- `TMPDIR=/private/tmp pnpm exec vitest run test/unit/detect-cnpj-column.test.ts test/unit/fiscal-ingestion.test.ts test/integration/process-csv.use-case.test.ts`:
  pass, 3 arquivos / 26 testes.
- `pnpm typecheck`: pass.
- `pnpm lint`: pass, 119 arquivos.
- `git diff --check`: pass.
- `pnpm test`: pass, 40 arquivos / 263 testes.
- `pnpm smoke:real-csv`: pass com provider `mock`.
- `pnpm smoke:electron-ui`: pass; executou `pnpm build`, abriu app Electron,
  salvou XLSX, registrou checkpoint/historico e retomada.

## Residual Risk Accepted

- O P3 de UI permanece aceito como risco residual: o renderer ainda pode mapear
  o prefixo antigo de coluna ausente e esconder parte da mensagem nova do core.
  Isso nao piora o estado anterior e deve ser tratado em owner window proprio
  se quisermos alinhar a copy exibida no Electron.

## Release

Liberado como etapa integrada. Proximos owner windows materiais podem ser
selecionados pelo judge, mantendo uma unica janela writer por boundary.

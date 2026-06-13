# P3 Renderer Missing Column Normalizer Integration Judge Decision

Data: 2026-06-13 17:47:02 -03
Status: `approved_by_judge_integrated_validated`
Judge thread: `019ebe5c-3853-79c2-87ad-8ddace386c93`
Worker thread: `019ec2b1-befe-70b3-95ad-61fbda8a089e`
Review thread: `019ec2b8-2e29-7553-b9f5-ce43946bcf65`

## Decision

O owner window
`p3_renderer_missing_column_normalizer_can_hide_new_core_guidance` esta
aprovado, integrado seletivamente na branch canonica
`feat/fiscal-desk-local-base-prep` e validado.

O worker primeiro parou em `blocked_missing_docs_fiscal_desk` por uma stop
condition excessiva da delegacao. O judge corrigiu a orientacao, mantendo o
mesmo escopo e a mesma thread. O worker entao entregou o patch material dentro
do allowed write set, e o review independente retornou `approved_candidate`.

## Integrated Files

- `src/renderer/ui/app-helpers.ts`
- `test/unit/app-helpers.test.ts`
- `docs/goals/fiscal-desk-orchestration/results/p3-renderer-missing-column-normalizer-can-hide-new-core-guidance-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/p3-renderer-missing-column-normalizer-can-hide-new-core-guidance-review-2026-06-13.md`

## Behavior Integrated

O renderer deixa de substituir a mensagem nova do core para erro de coluna CNPJ
ausente por uma copy antiga. `extractMessage` continua desembrulhando
`Error invoking remote method` e agora preserva a orientacao completa do core,
incluindo `CPF/CNPJ` e a alternativa de informar a coluna manualmente.

## Canonical Validation

- `pnpm exec vitest run test/unit/app-helpers.test.ts`: pass, 1 arquivo / 6
  testes.
- `pnpm typecheck`: pass.
- `pnpm lint`: pass, 119 arquivos.
- `pnpm test`: pass, 40 arquivos / 264 testes.
- `git diff --check`: pass.
- `pnpm smoke:visual`: pass; desktop/tablet/mobile sem overflow, botoes
  cortados ou sobreposicoes.
- `pnpm smoke:electron-ui`: pass; executou `pnpm build`, abriu app Electron com
  provider `mock`, gerou XLSX, checkpoint/historico e retomada.

## Residual Risk Accepted

- O smoke visual e Electron nao exercitam especificamente a tela real de erro de
  coluna ausente. A prova primaria desse comportamento e o teste unitario focado
  de `extractMessage`.
- Nenhum contrato de core, IPC, preload, provider, export, release, update,
  diagnostics, telemetry, license/account ou Base Publica Local foi alterado.

## Release

Liberado como etapa integrada. Nenhuma outra janela material foi liberada por
esta decisao.

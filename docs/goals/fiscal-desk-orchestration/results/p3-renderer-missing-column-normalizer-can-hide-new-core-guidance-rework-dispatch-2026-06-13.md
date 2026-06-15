# P3 Renderer Missing Column Normalizer Rework Dispatch

Data: 2026-06-13 17:37:10 -03
Status: `rework_requested`
Judge thread: `019ebe5c-3853-79c2-87ad-8ddace386c93`
Worker thread: `019ec2b1-befe-70b3-95ad-61fbda8a089e`

## Reason

O worker retornou `blocked_missing_docs_fiscal_desk` porque a delegacao inicial
incluiu uma stop condition excessiva: parar se `docs/fiscal-desk/**` estivesse
ausente.

Para esta owner window estreita, `docs/fiscal-desk/**` nao e dependencia
material. O escopo esta definido pelos docs versionados em
`docs/goals/fiscal-desk-orchestration/**` e pelos arquivos renderer/teste
autorizados.

## Rework Instruction

Continuar na mesma thread/worktree, sem abrir nova fase e sem expandir escopo.

Allowed write permanece:

- `src/renderer/ui/app-helpers.ts`
- `test/unit/app-helpers.test.ts`
- `docs/goals/fiscal-desk-orchestration/results/p3-renderer-missing-column-normalizer-can-hide-new-core-guidance-2026-06-13.md`

`docs/fiscal-desk/**` continua proibido para escrita e sua ausencia nao deve
bloquear esta janela.

## Expected Outcome

O worker deve atualizar o mesmo receipt com o resultado real de implementacao ou
com um blocker material novo, se houver.

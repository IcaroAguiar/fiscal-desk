# Post P3 Excel Input Runtime Exposure Rework Dispatch

Data: 2026-06-13 22:03:30 -03
Status: dispatch_prepared

## Contexto

- Worker thread: `019ec38f-785c-7c43-a14b-61392cd1119e`
- Worker worktree: `/Users/icaroaguiar/.codex/worktrees/16e4/consulta-simples-csv`
- Review thread: `019ec3a4-8c28-75e2-8315-77b0122fada6`
- Review status: `needs_rework`
- Review receipt canonico:
  `docs/goals/fiscal-desk-orchestration/results/post-p3-excel-input-runtime-exposure-review-2026-06-13.md`
- Dispatch original:
  `docs/goals/fiscal-desk-orchestration/results/post-p3-excel-input-runtime-exposure-dispatch-2026-06-13.md`

## Missao Do Rework

Reabrir o mesmo candidate `post_p3_excel_input_runtime_exposure` apenas para
corrigir o finding bloqueante da review independente: o fingerprint de retomada
precisa incluir a versao efetiva do parser conforme `inputFormat`, incluindo
XLSX.

Nao ampliar escopo para nova fase, UI ampla, provider, export core, ingestion
core, package/lock, release/update, Receita Web, Base Publica Local core/provider
ou docs fiscais/QA/ADR.

## Allowed Write Set

O rework deve ficar dentro do allowed write set original. Para este finding, o
escopo esperado e restrito a:

- `src/main/execution/file-process-execution-ledger.ts`
- `test/unit/main/file-process-execution-ledger.test.ts`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-excel-input-runtime-exposure-2026-06-13.md`

Se for inevitavel tocar outro arquivo do allowlist original, justificar no
receipt. Se for necessario tocar arquivo fora do allowlist original, parar com
`blocked_scope_expansion_required`.

## Requisitos

- O fingerprint deve incorporar uma versao de parser derivada do `inputFormat`.
- CSV legado deve continuar compativel; nao quebrar leitura de ledgers antigos.
- XLSX deve ter versao efetiva propria no material que gera a ledger key.
- O metadado operacional deve permanecer coerente com a decisao do fingerprint.
- Adicionar teste focado que falharia no candidate anterior.
- Manter diff final dentro do allowed write set.

## Checks Obrigatorios

Antes de devolver `ready_for_judge_review`:

- `git status --short --branch --untracked-files=all`
- `git diff --name-only`
- `git diff --check`
- `pnpm exec vitest run test/unit/main/file-process-execution-ledger.test.ts test/integration/process-csv.use-case.test.ts`
- `pnpm typecheck`
- `pnpm lint`

Se o ambiente bloquear cache/relatorio por sandbox, registrar erro exato e
rerodar no contexto permitido quando possivel.

## Receipt

Atualizar o receipt existente:

`docs/goals/fiscal-desk-orchestration/results/post-p3-excel-input-runtime-exposure-2026-06-13.md`

Status final exatamente um de:

- `ready_for_judge_review`
- `blocked_scope_expansion_required`
- `blocked_validation_environment`

Nao stagear, commitar, pushar, abrir PR ou marcar como integrado.

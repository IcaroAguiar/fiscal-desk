# Post P3 Renderer Next Owner Window Selection Dispatch

Data: 2026-06-13 17:50:31 -03
Status: `dispatch_prepared_read_only_scope_selection`
Judge thread: `019ebe5c-3853-79c2-87ad-8ddace386c93`
Target branch: `feat/fiscal-desk-local-base-prep`
Target min commit: `43bbca0`

## Objective

Selecionar a proxima owner window segura apos a integracao validada de
`p3_renderer_missing_column_normalizer_can_hide_new_core_guidance`, sem liberar
trabalho material automaticamente.

## Context

O P3 renderer foi integrado e validado na branch canonica. A fila material esta
vazia. O proximo passo do judge e escolher uma janela nova com allowed write
set, do-not-touch, checks e stop conditions antes de criar qualquer worker.

## Thread Contract

Criar uma thread independente do Codex App com `/goal`, modelo `gpt-5.5` e
reasoning `medium`.

Classificacao: `read_only_scope_selection`.

Allowed write:

- `docs/goals/fiscal-desk-orchestration/results/post-p3-renderer-next-owner-window-selection-2026-06-13.md`

Forbidden writes:

- `src/**`;
- `test/**`;
- `package.json`;
- `pnpm-lock.yaml`;
- `.github/**`;
- `electron-builder.yml`;
- `docs/fiscal-desk/**`;
- `docs/adr/**`;
- `docs/goals/fiscal-desk-orchestration/state.yaml`;
- `docs/goals/fiscal-desk-orchestration/integration-plan.md`;
- qualquer arquivo fora do receipt permitido.

## Required Reading

- `AGENTS.md`;
- `docs/goals/fiscal-desk-orchestration/goal.md`;
- `docs/goals/fiscal-desk-orchestration/state.yaml`;
- `docs/goals/fiscal-desk-orchestration/integration-plan.md`;
- `docs/goals/fiscal-desk-orchestration/results/p3-renderer-missing-column-normalizer-can-hide-new-core-guidance-integration-judge-decision-2026-06-13.md`;
- `docs/goals/fiscal-desk-orchestration/results/post-local-base-regate-csv-input-intake-hardening-integration-judge-decision-2026-06-13.md`;
- os receipts recentes de release/security, post-local-base regate, F6E2C,
  F8B1 e testing-infra coverage gate que forem necessarios para decidir o
  proximo recorte.

Se `docs/fiscal-desk/**` estiver ausente na worktree, nao copie nem edite esses
docs. Use a copia canonica absoluta em
`/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/fiscal-desk/...` se
ela existir e for necessaria para contexto. A ausencia desses docs locais deve
ser registrada como limitacao, nao blocker automatico, a menos que impeça a
selecao confiavel.

## Questions To Answer

1. Qual e a proxima owner window recomendada?
2. Ela e material, docs-only, read-only gate, release/security review ou deve
   permanecer bloqueada?
3. Qual e o allowed write set exato?
4. Quais superficies continuam bloqueadas?
5. Quais checks quantitativos e qualitativos sao obrigatorios?
6. Review independente sera obrigatorio?
7. Pode rodar em paralelo com algo? Se sim, quais boundaries nao colidem?
8. Quais stop conditions devem retornar `blocked` ou `needs_rework`?

## Required Output

O receipt deve conter:

- status final: `approved_scope_candidate`, `needs_more_info` ou `blocked`;
- arquivos/docs lidos e scans executados;
- estado da fila;
- recomendacao objetiva;
- allowed write set;
- explicit do-not-touch set;
- shared boundaries;
- dependencias/colisoes;
- checks obrigatorios;
- necessidade de review independente;
- riscos residuais;
- prompt pronto para a proxima thread, se houver `approved_scope_candidate`.

## Non-goals

- Nao implementar codigo.
- Nao alterar testes.
- Nao editar docs locais `docs/fiscal-desk/**`.
- Nao preparar release, deploy, publish, updater, telemetry, diagnostics ou
  license/account.
- Nao marcar nenhuma fase como completa.

## Judge Follow-up

O Codex primario deve ler o receipt, julgar o escopo e so entao liberar um
worker material ou docs-only, se aplicavel.

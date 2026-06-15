# Post P3 Large File Ratchet Rework Next Owner Window Selection Dispatch

Data: 2026-06-13
Orquestrador/Judge: `019ebe5c-3853-79c2-87ad-8ddace386c93`
Branch canonica: `feat/fiscal-desk-local-base-prep`
Target commit minimo: `e05a85b fix: close fiscal desk large file ratchet`
Status: `prepared_for_codex_app_thread`

## Objetivo

Selecionar o proximo owner window seguro depois do fechamento integrado do
rework `post_p3_integrated_validation_large_file_ratchet_rework`.

Esta e uma tarefa read-only de scoping. Nao e fase documental ampla, nao e
worker de feature e nao pode fazer alteracoes materiais no produto.

## Contexto Obrigatorio

Leia antes de decidir:

- `docs/goals/fiscal-desk-orchestration/goal.md`
- `docs/goals/fiscal-desk-orchestration/state.yaml`
- `docs/goals/fiscal-desk-orchestration/integration-plan.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-integrated-validation-large-file-ratchet-rework-integration-judge-decision-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-validation-docs-rebaseline-integrated-first-release-validation-judge-decision-2026-06-13.md`
- `docs/qa/first-release-validation.md`

## Regras

- Usar `/goal`.
- Modelo requerido: `gpt-5.5`.
- Reasoning requerido: `medium`.
- Nao editar codigo, testes, configs, package/lock, release, updater,
  diagnosticos, telemetria, licenca/account, renderer, IPC, preload, providers
  ou `docs/fiscal-desk/**`.
- Nao executar stage, commit, push, PR, deploy, publish, build de release,
  signing, notarization ou side effect externo.
- Nao aprovar a propria selecao. O resultado e candidato e sera julgado pelo
  orquestrador.

## Allowed Write Set

Somente:

- `docs/goals/fiscal-desk-orchestration/results/post-p3-large-file-ratchet-rework-next-owner-window-selection-2026-06-13.md`

## Pergunta De Decisao

Qual e o proximo owner window mais seguro e util para destravar o roadmap do
Fiscal Desk depois de:

- docs rebaseline fechado;
- validacao executavel integrada feita;
- blocker `code.large-file-ratchet` fechado;
- cobertura quantitativa ativa, mas ainda abaixo de 80%;
- Receita Web ainda assistida/experimental;
- release/public distribution, updater, telemetria, diagnosticos,
  licenca/account, templates/modelos, PDF/Word/OCR e Receita Web live/massiva
  ainda bloqueados ate escopo explicito?

## Formato Do Receipt

O receipt deve conter:

- `Status: approved_scope_candidate` ou `Status: blocked`;
- owner window recomendado;
- classificacao: docs-only, read-only review, non-feature material, ou material
  single-writer;
- allowed write set recomendado para o proximo worker, se houver;
- dependencias e colisao de boundaries;
- checks obrigatorios para o proximo worker;
- riscos residuais;
- lista explicita do que continua bloqueado;
- se for `blocked`, o blocker concreto e a evidencia.

# Post P3 Operational Execution Panel Suggestions Review Dispatch

Data: 2026-06-13
Status: dispatch_prepared

## Objetivo

Revisar de forma independente o candidato material
`post_p3_operational_execution_panel_suggestions` antes de qualquer integracao
na branch final `feat/fiscal-desk-local-base-prep`.

O resultado do worker esta em:

- worktree: `/Users/icaroaguiar/.codex/worktrees/abce/consulta-simples-csv`;
- thread: `019ec327-63be-7143-97ec-84bf9bd7bfd0`;
- receipt: `docs/goals/fiscal-desk-orchestration/results/post-p3-operational-execution-panel-suggestions-2026-06-13.md`;
- status reportado: `ready_for_judge_review`.

## Escopo Do Review

O reviewer deve avaliar se o diff do worker:

- permanece estritamente dentro do allowed write set do dispatch original;
- cumpre o pacote `010` usando apenas estado renderer e sinais ja integrados;
- separa falhas por item de bloqueios sistemicos;
- apresenta ETA, incerteza, ultimo salvamento, retomada/checkpoint e sugestoes
  assistidas sem expor identificadores tecnicos ao usuario;
- nao altera IPC, preload, main, core, providers, ingestion/export, package,
  lockfile, release/update, telemetry, diagnostics, license/account,
  storage/network, templates/models, PDF/Word/OCR ou Receita Web live/massiva;
- possui testes relevantes para a funcionalidade Electron/UI afetada;
- trata de forma aceitavel o risco residual `uiResumeText: "1 CNPJs retomados"`
  observado no smoke legado, ou devolve como finding de rework.

## Allowed Write Do Reviewer

O reviewer pode escrever somente:

- `docs/goals/fiscal-desk-orchestration/results/post-p3-operational-execution-panel-suggestions-review-2026-06-13.md`

Nenhum arquivo de codigo, teste, config, package, lockfile, docs fiscais
local-only ou artefato visual pode ser editado pelo reviewer.

## Checks Esperados

O reviewer deve, quando viavel:

- ler o receipt do worker;
- inspecionar `git status` e `git diff --name-only` na worktree do worker;
- rodar `git diff --check` no diff do worker;
- revisar o diff dos arquivos renderer/teste alterados;
- rerodar pelo menos os testes focados de renderer/copy/sync, ou declarar
  explicitamente por que nao conseguiu;
- classificar findings por severidade e fechar com uma destas decisoes:
  `approved_candidate`, `needs_rework` ou `blocked`.

## Criterio De Saida

Este dispatch nao integra codigo. A saida esperada e apenas um receipt de review
para o judge decidir entre rework e integracao canonica.

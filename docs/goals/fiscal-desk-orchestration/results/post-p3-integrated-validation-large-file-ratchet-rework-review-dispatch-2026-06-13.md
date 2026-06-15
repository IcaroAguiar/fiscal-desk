# Post P3 Integrated Validation Large File Ratchet Rework Review Dispatch

Data: 2026-06-13 19:13 -03
Status: `prepared_for_dispatch`

## Objetivo

Executar review independente do candidato
`post_p3_integrated_validation_large_file_ratchet_rework`.

O worker `019ec305-fa0a-7562-8be4-117cb42ce33d` retornou
`ready_for_judge_review`. O judge ainda nao integrou o codigo. Esta thread deve
avaliar o diff como reviewer independente e retornar `approved_candidate` ou
`needs_rework`.

## Contexto

- Branch canonica: `feat/fiscal-desk-local-base-prep`
- Commit canonico minimo: `86105c6 docs: record large file rework thread`
- Worker thread: `019ec305-fa0a-7562-8be4-117cb42ce33d`
- Worker worktree:
  `/Users/icaroaguiar/.codex/worktrees/c980/consulta-simples-csv`
- Worker receipt:
  `docs/goals/fiscal-desk-orchestration/results/post-p3-integrated-validation-large-file-ratchet-rework-2026-06-13.md`
- Review receipt esperado:
  `docs/goals/fiscal-desk-orchestration/results/post-p3-integrated-validation-large-file-ratchet-rework-review-2026-06-13.md`

## Escopo Do Review

Verificar:

- se o diff do worker esta estritamente dentro do allowed write set;
- se o split do ledger preserva API, formato de checkpoint, fingerprint,
  sanitizacao e semantica de finish/restore/save;
- se os testes foram divididos sem remover cobertura comportamental relevante;
- se `docs/ai/quality-gate/baseline.json` e
  `docs/ai/quality-gate/quality-gate.config.json` nao foram alterados;
- se o ratchet scoped passou por reducao real de large files, nao por excecao;
- se a falha do ratchet default ficou limitada ao contexto
  `origin/main...HEAD`;
- se ha qualquer finding P0/P1/P2 que exija rework antes de integracao.

## Allowed Write

Somente:

- `docs/goals/fiscal-desk-orchestration/results/post-p3-integrated-validation-large-file-ratchet-rework-review-2026-06-13.md`

## Forbidden

- editar `src/**`, `test/**`, `docs/ai/**`, `docs/fiscal-desk/**`,
  `docs/qa/**`, `docs/adr/**`, `package.json`, `pnpm-lock.yaml`,
  `.github/**`, `electron-builder.yml`, `release/**`;
- editar a worker worktree;
- stage, commit, push, PR, deploy, publish, dist, signing, notarization,
  updater, telemetry, diagnostic sending, release ou side effect externo.

## Checks Esperados

Read-only:

- `git status --short --branch --untracked-files=all` na worktree de review;
- `git -C /Users/icaroaguiar/.codex/worktrees/c980/consulta-simples-csv status --short --branch --untracked-files=all`;
- `git -C /Users/icaroaguiar/.codex/worktrees/c980/consulta-simples-csv diff --name-only`;
- `git -C /Users/icaroaguiar/.codex/worktrees/c980/consulta-simples-csv diff --check`;
- `git -C /Users/icaroaguiar/.codex/worktrees/c980/consulta-simples-csv diff -- src/main/execution/file-process-execution-ledger.ts test/unit/process-csv.ipc.test.ts test/unit/receita-browser.client.test.ts`;
- ler os arquivos novos do worker:
  - `src/main/execution/file-process-execution-ledger-session.ts`;
  - `test/unit/process-csv.ipc-resume-delivery.test.ts`;
  - `test/unit/receita-browser.client-result-detection.test.ts`;
- revisar o worker receipt;
- opcional: rodar testes focados na worker worktree se `node_modules` ja
  estiver pronto, sem alterar arquivos.

Nao rode suite completa, coverage, build, smokes ou quality gate novamente salvo
se encontrar contradicao concreta no receipt.

## Output Obrigatorio

Criar o review receipt em portugues-BR com:

- status exatamente `approved_candidate` ou `needs_rework`;
- findings por severidade com arquivo/linha quando aplicavel;
- evidencias lidas;
- checks executados e resultado;
- checks nao executados e motivo;
- avaliacao da falha contextual do ratchet default;
- riscos residuais;
- recomendacao ao judge.

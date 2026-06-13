# Post P3 Integrated Validation Large File Ratchet Rework Dispatch

Data: 2026-06-13 19:06 -03
Status: `prepared_for_dispatch`

## Objetivo

Executar a janela
`post_p3_integrated_validation_large_file_ratchet_rework`.

Esta janela deve fechar o blocker de quality gate encontrado na validacao
executavel integrada: `code.large-file-ratchet` aumentou a contagem de arquivos
grandes de 2 para 4. Nao implementar feature nova.

## Contexto Canonico

- Branch canonica: `feat/fiscal-desk-local-base-prep`
- Commit minimo: `f58284d docs: judge integrated validation ratchet blocker`
- Judge/orquestrador: `019ebe5c-3853-79c2-87ad-8ddace386c93`
- Decisao que abriu este rework:
  `results/post-p3-validation-docs-rebaseline-integrated-first-release-validation-judge-decision-2026-06-13.md`
- Receipt esperado:
  `docs/goals/fiscal-desk-orchestration/results/post-p3-integrated-validation-large-file-ratchet-rework-2026-06-13.md`

## Escopo

Classificacao: `quality_gate_rework_non_feature_material`.

Allowed persistent writes:

- `src/main/execution/file-process-execution-ledger.ts`
- `src/main/execution/file-process-execution-ledger*.ts`
- `test/unit/process-csv.ipc.test.ts`
- `test/unit/process-csv.ipc*.test.ts`
- `test/unit/receita-browser.client.test.ts`
- `test/unit/receita-browser.client*.test.ts`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-integrated-validation-large-file-ratchet-rework-2026-06-13.md`

Forbidden persistent writes:

- `src/renderer/**`
- `src/main/ipc/**`
- `src/main/preload.ts`
- `src/main/main.ts`
- `src/core/**`
- `docs/ai/quality-gate/baseline.json`
- `docs/ai/quality-gate/quality-gate.config.json`
- `docs/fiscal-desk/**`
- `docs/qa/**`
- `docs/adr/**`
- `package.json`
- `pnpm-lock.yaml`
- `.github/**`
- `electron-builder.yml`
- `release/**`
- qualquer arquivo persistente fora do allowed write set

Side effects proibidos:

- stage, commit, push, PR, deploy, publish, dist packaging, signing,
  notarization, updater, telemetry, diagnostic sending, release, packaging
  distribution ou side effect externo.

## Direcao Tecnica

Preferir split/refactor mecanico e coeso, preservando comportamento:

- extrair responsabilidades internas de
  `src/main/execution/file-process-execution-ledger.ts` para novo modulo sob
  `src/main/execution/file-process-execution-ledger*.ts`;
- dividir `test/unit/process-csv.ipc.test.ts` em arquivos menores por contrato
  sem reduzir assertividade;
- dividir `test/unit/receita-browser.client.test.ts` em arquivos menores por
  comportamento sem reduzir assertividade.

Nao atualize baseline, nao adicione nova excecao e nao trate o gate como
cosmetico. O objetivo minimo e deixar a contagem de large files menor ou igual
ao baseline 2. O alvo preferido e manter apenas o CSS legado como large file.

## Leituras Obrigatorias

- `AGENTS.md`
- `docs/goals/fiscal-desk-orchestration/goal.md`
- `docs/goals/fiscal-desk-orchestration/state.yaml`
- `docs/goals/fiscal-desk-orchestration/integration-plan.md`
- `docs/ai/quality-gate/README.md`
- `docs/ai/quality-gate/baseline.json`
- `docs/ai/quality-gate/quality-gate.config.json`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-validation-docs-rebaseline-integrated-first-release-validation-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-validation-docs-rebaseline-integrated-first-release-validation-judge-decision-2026-06-13.md`
- os tres arquivos grandes permitidos.

Se `docs/fiscal-desk/**` estiver ausente na worktree, use a copia canonica
absoluta `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/fiscal-desk/**`
somente para leitura se precisar de contexto. Nao edite esses docs.

## Checks Obrigatorios

Rodar, nesta ordem quando viavel:

- `git status --short --branch --untracked-files=all`
- `git log -3 --oneline`
- `wc -l src/main/execution/file-process-execution-ledger.ts test/unit/process-csv.ipc.test.ts test/unit/receita-browser.client.test.ts`
- focused tests dos arquivos alterados, incluindo qualquer novo arquivo de teste criado;
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm test:coverage`
- `QUALITY_GATE_DIFF_MODE=worktree node docs/ai/quality-gate/check-ratchet.mjs`
- `node docs/ai/quality-gate/check-ratchet.mjs`, registrando separadamente se sobrar falha contextual de `origin/main...HEAD`;
- `git diff --check --` nos arquivos alterados e no receipt.

Smokes Electron/visual/CSV nao sao obrigatorios se o rework for puramente
mecanico e nao tocar IPC, renderer, CSV parser, provider, preload ou contrato
runtime. Se houver qualquer alteracao de comportamento runtime, rode o smoke
aplicavel.

## Output Obrigatorio

Criar o receipt permitido em portugues-BR com:

- status exatamente um de `ready_for_judge_review`, `needs_rework` ou
  `blocked`;
- commit/head validado;
- arquivos alterados e justificativa;
- antes/depois de line count para cada arquivo grande;
- resultado de checks;
- confirmacao de que baseline/config de quality gate nao foram alterados;
- confirmacao de que nao houve feature nova;
- riscos residuais;
- recomendacao ao judge.

Retorne `needs_rework` se o modo
`QUALITY_GATE_DIFF_MODE=worktree` ainda falhar por `code.large-file-ratchet` ou
se os testes focados/full suite quebrarem. Retorne `blocked` se o ambiente
impedir validacao suficiente e nao houver evidencia substituta forte.

# Post P3 Rebaseline Readiness Next Owner Window Selection

Data: 2026-06-13
Thread: Codex App independente
Judge/orquestrador: `019ebe5c-3853-79c2-87ad-8ddace386c93`
Branch canonica alvo: `feat/fiscal-desk-local-base-prep`
Target minimo da delegacao: `e735ed4`
Commit local revisado: `e735ed4 docs: accept post-p3 readiness review`
Status final: `approved_scope_candidate`

## Resumo

Executei a selecao read-only
`post_p3_rebaseline_readiness_next_owner_window_selection`.

Depois do readiness review pos-P3 aceito pelo judge, nao ha worker material
ativo, fila material aprovada ou fila de integracao pendente. O readiness
review foi aceito como gate read-only e nao autorizou release execution,
packaging distribution, publish, signing, notarization, updater, telemetry,
diagnostic sending, license/account behavior ou feature material.

Recomendo exatamente uma proxima owner window:

`post_p3_readiness_first_release_validation_docs_rebaseline`

Classificacao: `docs-only`.

A razao e que `docs/qa/first-release-validation.md` ainda descreve o criterio
de validacao da primeira sequencia de PRs em termos pre-coverage-gate: ele diz
que coverage ainda e warning-only porque o projeto nao gera `coverage/lcov.info`.
Isso conflita com o estado integrado atual, no qual `testing_infra_coverage_gate`
adicionou `@vitest/coverage-v8`, `pnpm test:coverage`, `coverage/lcov.info`,
`coverage/coverage-summary.json` e required coverage no quality gate.

Esta recomendacao nao libera feature material e nao seleciona release/
distribution execution. A janela proposta apenas atualiza o criterio documental
de validacao local do primeiro release para o corte pos-P3, preservando os
bloqueios de dist, publish, signing, notarization, updater, telemetry,
diagnostic sending, license/account e release/package config.

## Limitacao De Docs Locais

`docs/fiscal-desk/**` esta ausente nesta worktree. Usei a copia canonica
absoluta permitida, em modo somente leitura:

`/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/fiscal-desk/**`

Isso nao bloqueou a selecao porque a copia canonica estava disponivel e o
dispatch autorizava esse fallback.

## Evidencia De Estado

- `git status --short --branch --untracked-files=all`: `## HEAD (no branch)`.
- `git log -1 --oneline`: `e735ed4 docs: accept post-p3 readiness review`.
- O dispatch local registra target minimo anterior `51e2aa4`; a delegacao
  recebida por esta thread exige `e735ed4`, e a worktree esta exatamente nesse
  commit.
- `integration-plan.md` registra o reviewer
  `post_p3_rebaseline_first_release_readiness_review` como
  `approved_candidate`, aceito pelo judge em `2026-06-13 18:27:15 -03`.
- `state.yaml` registra
  `post_p3_rebaseline_first_release_readiness_review:
  idle_completed_approved_candidate_judged` e
  `post_p3_rebaseline_readiness_next_owner_window_selection:
  dispatch_prepared_pending_thread`.
- `post-p3-rebaseline-first-release-readiness-review-judge-decision-2026-06-13.md`
  aceita o readiness review e declara que material work permanece bloqueado
  ate uma owner window fresca selecionada pelo judge.

## Arquivos Lidos E Scans

Li o pacote obrigatorio:

- `AGENTS.md`
- `docs/goals/fiscal-desk-orchestration/goal.md`
- `docs/goals/fiscal-desk-orchestration/state.yaml`
- `docs/goals/fiscal-desk-orchestration/integration-plan.md`
- `post-p3-rebaseline-readiness-next-owner-window-selection-dispatch-2026-06-13.md`
- `post-p3-rebaseline-first-release-readiness-review-2026-06-13.md`
- `post-p3-rebaseline-first-release-readiness-review-judge-decision-2026-06-13.md`
- `post-p3-first-release-status-rebaseline-2026-06-13.md`
- `post-p3-first-release-status-rebaseline-judge-decision-2026-06-13.md`

Tambem li ou scaneei proporcionalmente:

- receipts de P3 renderer, hardening de intake CSV, Base Publica Local re-gate,
  F8B1, F6E2C, coverage gate, release/security reviews, post-rework reviews e
  judge decisions;
- `docs/qa/first-release-validation.md`;
- copia canonica de `docs/fiscal-desk/first-release.md`, `status.md` e
  `quality-gates.md`;
- `package.json`, `electron-builder.yml`, `.github/workflows/windows-exe.yml`,
  `.github/**`, `src/**`, `test/**` e `scripts/**` para termos de release,
  publish, dist, updater, telemetria, diagnostico, licenca, Receita Web,
  Base Publica, P3, F8B1, F6E2C e CSV.

Scans read-only executados:

- `rg` sobre `docs/goals/fiscal-desk-orchestration` e receipts recentes para
  `next owner`, `blocked`, `release`, `publish`, `dist`, `update`,
  `diagnostico`, `telemetria`, `licenca`, `templates`, `PDF`, `Word`, `OCR`,
  `Receita Web`, `Base Publica`, `F8B1`, `F6E2C`, `P3` e `CSV`.
- `rg` sobre a copia canonica de `docs/fiscal-desk/**` para os mesmos termos.
- `rg` sobre `package.json`, `electron-builder.yml`, `.github`, `scripts`,
  `src` e `test` para `publish`, `release`, `dist`, `electron-updater`,
  `autoUpdater`, `telemetry`, `diagnostic`, `license`, `sign`, `notar`,
  `GITHUB_TOKEN`, `contents: write` e release actions.

Matches relevantes:

- `package.json` segue `private: true`.
- Scripts `dist:*` seguem com `--publish never`.
- `electron-builder.yml` define output `release`, mas nao define chave
  `publish`.
- `.github/workflows/windows-exe.yml` tem `permissions: contents: read`, roda
  `pnpm dist:win` e publica apenas artifact interno, sem GitHub Release.
- `docs/fiscal-desk/first-release.md` e `status.md` mantem fila material vazia/
  bloqueada ate selecao fresca do judge.
- `docs/fiscal-desk/quality-gates.md` ja reflete coverage quantitativa como
  sinal e smoke Electron/visual/CSV como obrigacoes qualitativas por superficie.
- `docs/qa/first-release-validation.md` permanece defasado sobre coverage e
  deve ser rebaselined antes de ser usado como criterio de primeiro release.

## Racional Da Janela Recomendada

Nao recomendo feature material agora porque:

- o readiness review aceito foi read-only e nao liberou worker material;
- `status.md` exige prompt proprio, owner unico e reviewer independente para
  qualquer nova onda que toque renderer, IPC/preload, update/release,
  package/lockfile, provider ou export/ingestion contracts;
- o corte atual trata F6E2C, F8B1, release/security reviews, reworks,
  Base Publica Local re-gate, CSV hardening e P3 renderer como historicos
  consumidos;
- update real, diagnostico real, telemetria real, licenca/account,
  release/package config, storage/network, templates/modelos reutilizaveis,
  PDF/Word/OCR e Receita Web live/massiva continuam bloqueados ate owner
  windows separados.

Nao recomendo release/distribution execution porque a tarefa atual proibe
selecionar janela ampla de release/distribution se ela envolver dist, publish,
signing, notarization, updater, telemetry, diagnostic sending, license/account
ou side effects externos.

Recomendo uma janela docs-only porque:

- ha drift documental concreto em `docs/qa/first-release-validation.md`;
- a correcao e estritamente documental e ajuda a evitar que o proximo gate de
  release use criterio stale de coverage;
- nao requer runtime, package, workflow, builder config, source, tests, stage,
  commit, push, PR, deploy ou efeito externo;
- deixa o judge com um criterio de validacao coerente antes de decidir entre
  manter fila bloqueada, abrir validacao local executavel ou abrir feature
  material futura.

## Allowed Write Set Da Proxima Thread

Somente:

- `docs/qa/first-release-validation.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-readiness-first-release-validation-docs-rebaseline-2026-06-13.md`

## Do-Not-Touch Da Proxima Thread

- `src/**`
- `test/**`
- `docs/fiscal-desk/**`
- `docs/adr/**`
- `package.json`
- `pnpm-lock.yaml`
- `.github/**`
- `electron-builder.yml`
- `docs/goals/fiscal-desk-orchestration/state.yaml`
- `docs/goals/fiscal-desk-orchestration/integration-plan.md`
- `dist/**`
- `dist-electron/**`
- `release/**`
- qualquer arquivo fora do allowed write set
- stage, commit, push, PR, deploy, publish, dist, signing, notarization,
  updater real, telemetry transport, diagnostic sending, license/account,
  release/package distribution ou qualquer efeito externo

## Boundaries Afetadas

Writer unico apenas em documentacao de QA:

- `docs/qa/first-release-validation.md`
- receipt da janela

Inspecao read-only esperada:

- release/package safety: `package.json`, `electron-builder.yml`, `.github/**`;
- quality gates: `docs/fiscal-desk/quality-gates.md`,
  `docs/ai/quality-gate/**`, `vitest.config.ts`;
- orchestration state: `state.yaml`, `integration-plan.md` e receipts recentes;
- product status: copia canonica de `docs/fiscal-desk/first-release.md` e
  `status.md`, se `docs/fiscal-desk/**` estiver ausente na worktree.

Nenhuma shared boundary de runtime recebe writer: `ipc_contracts`,
`preload_bridge`, `process_csv_contracts`, `provider_types`, `export_types`,
`renderer_shell`, `styles_css` e `receita_web_adapter_contract` ficam apenas em
leitura, se necessario.

## Dependencias E Colisoes

Dependencias fechadas:

- readiness review pos-P3 aceito pelo judge;
- rebaseline docs-only pos-P3 aceito e integrado nos docs canonicos locais;
- P3 renderer integrado/validado;
- CSV input intake hardening integrado/validado;
- F8B1 integrado/validado seletivamente;
- F6E2C aceito no-code pelo judge;
- release/security reviews e reworks tratados como historicos consumidos;
- coverage gate integrado/validado com risco residual.

Colisoes:

- Baixo risco de colisao se a proxima thread obedecer docs-only.
- Nao ha writer concorrente ativo segundo `state.yaml`/`integration-plan.md`.
- Se a thread concluir que precisa editar codigo, testes, docs fiscais locais,
  package/workflow/builder config, state ou integration-plan, deve parar e
  voltar ao judge.

## Checks Recomendados Para A Proxima Thread

Read-only antes de editar:

- `git status --short --branch --untracked-files=all`
- `git log -1 --oneline`
- ler `AGENTS.md`, `goal.md`, `state.yaml`, `integration-plan.md` e este
  receipt;
- ler `docs/qa/first-release-validation.md`;
- ler `docs/fiscal-desk/quality-gates.md`, `first-release.md` e `status.md`
  pela copia local se presente ou pela copia canonica absoluta se ausente;
- ler/scannear receipts de coverage gate, readiness review, P3 renderer,
  CSV hardening, Base Publica Local re-gate, F8B1, F6E2C e release/security.

Scans:

- `rg -n "coverage|lcov|coverage-summary|warning-only|smoke:electron-ui|smoke:visual|smoke:real-csv|test:coverage|dist|publish|release|telemetria|diagnostico|licenca|Receita Web|Base Publica|P3|F8B1|F6E2C|CSV" docs/qa/first-release-validation.md docs/goals/fiscal-desk-orchestration /Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/fiscal-desk`

Depois de escrever:

- `git diff --check -- docs/qa/first-release-validation.md docs/goals/fiscal-desk-orchestration/results/post-p3-readiness-first-release-validation-docs-rebaseline-2026-06-13.md`
- `git diff -- docs/qa/first-release-validation.md docs/goals/fiscal-desk-orchestration/results/post-p3-readiness-first-release-validation-docs-rebaseline-2026-06-13.md` para confirmar que o diff e documental.

Nao rodar testes, build, smoke Electron, smoke visual, smoke CSV, coverage,
dist, publish, deploy, signing, notarization ou qualquer comando com side
effect externo nesta janela docs-only.

## Necessidade De Review

Review independente nao e obrigatorio para esta janela docs-only se o diff ficar
restrito ao criterio documental de QA e ao receipt. O judge ainda deve ler o
receipt e o diff antes de aceitar.

Se a proxima thread transformar o escopo em comportamento executavel,
package/workflow/build config, release/security policy ou source/test changes,
ela deve parar e retornar `needs_more_info` ou `blocked`; esse novo escopo
exigiria owner window propria e possivelmente reviewer independente.

## Riscos Residuais

- `docs/fiscal-desk/**` continua local/ignorado e ausente nesta worktree; a
  janela proposta nao deve editar essa arvore.
- A janela docs-only nao prova runtime fresco; ela apenas corrige o criterio
  documental de validacao.
- O proximo gate executavel, se o judge quiser um, ainda precisara decidir
  explicitamente quais comandos podem escrever artefatos locais (`coverage/**`,
  `dist/**`, `dist-electron/**`, reports de smoke) sem confundir isso com
  release/distribution execution.
- Windows packaging, updater, telemetry, license/account, diagnostic sending,
  release/package config, storage/network expansion, templates/modelos,
  PDF/Word/OCR e Receita Web live/massiva seguem bloqueados.

## Stop Conditions Para A Proxima Thread

Retornar `needs_more_info` ou `blocked` se:

- `docs/qa/first-release-validation.md` nao existir ou houver conflito sobre
  qual documento e fonte de verdade;
- for necessario editar qualquer arquivo fora do allowed write set;
- for necessario rodar `pnpm build`, `pnpm smoke:electron-ui`, `pnpm
  smoke:visual`, `pnpm smoke:real-csv`, `pnpm test:coverage`, `dist:*`,
  publish, deploy, signing, notarization ou comandos com efeitos externos;
- a thread encontrar evidencia conflitante sobre coverage gate, P3 renderer,
  CSV hardening, F8B1, F6E2C ou readiness review;
- a mudanca documental tentar marcar release, update real, diagnostic sending,
  telemetry, license/account, templates/modelos, PDF/Word/OCR ou Receita Web
  live/massiva como disponiveis.

## Prompt Pronto Para A Proxima Thread

```text
/goal Execute docs-only validation-doc rebaseline `post_p3_readiness_first_release_validation_docs_rebaseline` for Fiscal Desk.

You are running as an independent Codex App thread/worktree. The current thread is the judge/orchestrator and will decide whether to accept your receipt. Do not self-approve. Do not implement code.

Use model `gpt-5.5` and reasoning `medium`. Use Portuguese-BR in the receipt.

Canonical branch: `feat/fiscal-desk-local-base-prep`.
Judge/orchestrator thread: `019ebe5c-3853-79c2-87ad-8ddace386c93`.
Target minimum commit: `e735ed4`.

Read first:
- `AGENTS.md`
- `docs/goals/fiscal-desk-orchestration/goal.md`
- `docs/goals/fiscal-desk-orchestration/state.yaml`
- `docs/goals/fiscal-desk-orchestration/integration-plan.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-rebaseline-readiness-next-owner-window-selection-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-rebaseline-first-release-readiness-review-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-rebaseline-first-release-readiness-review-judge-decision-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/testing-infra-coverage-gate-canonical-integration-2026-06-13.md`
- recent receipts for P3 renderer, CSV input intake hardening, Base Publica Local re-gate, F8B1, F6E2C, coverage gate and release/security reviews.

If `docs/fiscal-desk/**` is absent in your worktree, use the canonical absolute copy under `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/fiscal-desk/**` for read-only inspection. Record the limitation, but do not block automatically unless both local and canonical copies are unavailable.

Task:
1. Rebaseline only `docs/qa/first-release-validation.md` so it matches the post-P3 first-release cut and the integrated coverage gate.
2. Remove stale language saying coverage is warning-only because the project does not generate `coverage/lcov.info`.
3. Preserve the distinction that coverage is a regression signal, not functional proof; Electron/visual/CSV smokes remain qualitative obligations by touched surface.
4. Do not mark release, update real, diagnostic sending, telemetry, license/account, templates/modelos, PDF/Word/OCR or Receita Web live/massiva as available.
5. Do not run tests, build, smokes, coverage, dist, publish, deploy, signing, notarization or external side effects in this docs-only window.
6. Return a Portuguese-BR receipt with status exactly one of `ready_for_judge_review`, `needs_more_info`, or `blocked`.

Allowed write only:
- `docs/qa/first-release-validation.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-readiness-first-release-validation-docs-rebaseline-2026-06-13.md`

Forbidden writes:
- `src/**`
- `test/**`
- `docs/fiscal-desk/**`
- `docs/adr/**`
- `package.json`
- `pnpm-lock.yaml`
- `.github/**`
- `electron-builder.yml`
- `docs/goals/fiscal-desk-orchestration/state.yaml`
- `docs/goals/fiscal-desk-orchestration/integration-plan.md`
- `dist/**`
- `dist-electron/**`
- `release/**`
- any file outside the allowed write set
- stage, commit, push, PR, deploy, publish, dist, signing, notarization, updater, telemetry, diagnostic sending, release, packaging distribution or any external side effect

Read-only checks expected:
- `git status --short --branch --untracked-files=all`
- `git log -1 --oneline`
- proportional `rg` scans over `docs/qa/first-release-validation.md`, `docs/goals/fiscal-desk-orchestration`, `docs/fiscal-desk` if present or the canonical absolute copy, and recent receipts for `coverage`, `lcov`, `coverage-summary`, `warning-only`, `smoke:electron-ui`, `smoke:visual`, `smoke:real-csv`, `test:coverage`, `release`, `publish`, `dist`, `update`, `diagnostico`, `telemetria`, `licenca`, `templates`, `PDF`, `Word`, `OCR`, `Receita Web`, `Base Publica`, `F8B1`, `F6E2C`, `P3`, `CSV`.
- `git diff --check -- docs/qa/first-release-validation.md docs/goals/fiscal-desk-orchestration/results/post-p3-readiness-first-release-validation-docs-rebaseline-2026-06-13.md` after writing.

End final message with `ready_for_judge_review` and the receipt path if successful.
```

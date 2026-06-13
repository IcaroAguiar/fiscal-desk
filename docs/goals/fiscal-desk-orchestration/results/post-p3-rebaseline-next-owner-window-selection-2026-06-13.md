# Post P3 Rebaseline Next Owner Window Selection

Data: 2026-06-13
Thread: Codex App independente
Judge/orquestrador: `019ebe5c-3853-79c2-87ad-8ddace386c93`
Branch canonica alvo: `feat/fiscal-desk-local-base-prep`
Commit minimo requerido: `88326f3`
Commit local revisado: `88326f3 docs: dispatch post-p3 rebaseline selection`
Status final: `approved_scope_candidate`

## Resumo

Executei a selecao read-only `post_p3_rebaseline_next_owner_window_selection`.

Nao ha worker material ativo depois do rebaseline docs-only pos-P3. A fila
aprovada esta vazia e a fila ativa aponta somente para esta selecao read-only.

Recomendo exatamente uma proxima owner window:

`post_p3_rebaseline_first_release_readiness_review`

Classificacao: `release/security review`.

Esta recomendacao nao reabre o gate historico
`first_release_candidate_release_security_review` como se ele ainda estivesse
pendente. Aquele gate foi consumido e fechado. A recomendacao e um gate fresco,
read-only, sobre o corte atual pos-P3 em `88326f3`, porque depois do ultimo
release/security review entraram hardening CSV, P3 renderer e rebaseline
documental. Nenhuma feature material deve ser liberada antes desse parecer
voltar ao judge.

## Limitacao de docs locais

`docs/fiscal-desk/**` esta ausente nesta worktree. Usei somente leitura da copia
canonica absoluta permitida:

`/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/fiscal-desk/**`

Isso nao bloqueou a selecao porque o dispatch autorizou essa fallback de
inspecao read-only.

## Evidencia de fila

- `git status --short --branch --untracked-files=all`: `## HEAD (no branch)`.
- `git log -1 --oneline`: `88326f3 docs: dispatch post-p3 rebaseline selection`.
- `integration-plan.md` registra `No approved queue remains after post-P3 docs rebaseline`.
- `integration-plan.md` registra `post_p3_rebaseline_next_owner_window_selection` como unico item ativo/pending e sem worker material liberado.
- `state.yaml` registra `post_p3_first_release_status_rebaseline` como `idle_completed_approved_docs_only_integrated_local_docs`.
- `state.yaml` registra `post_p3_rebaseline_next_owner_window_selection` como `dispatch_prepared_pending_thread`.
- `post-p3-first-release-status-rebaseline-judge-decision-2026-06-13.md` aceitou o rebaseline docs-only e manteve material work bloqueado ate nova selecao read-only.

## Racional da janela recomendada

Razoes para nao liberar feature material diretamente:

- `first-release.md` e `status.md` tratam F6E2C, F8B1, release/security review,
  reworks, re-gate da Base Publica Local, hardening CSV e P3 renderer como
  historicos consumidos.
- `first-release.md` declara a fila material vazia/bloqueada ate selecao fresca
  do judge.
- `status.md` reforca que qualquer nova onda que toque renderer, IPC/preload,
  update/release, package/lockfile, provider ou export/ingestion contracts
  precisa de prompt proprio, owner unico e reviewer independente.
- As frentes de update real, diagnostico gerado/enviado, telemetria real,
  licenca/account, release/package config, storage/network,
  templates/modelos reutilizaveis, PDF/Word/OCR e Receita Web live/massiva
  continuam bloqueadas ate owner windows proprios.

Razoes para escolher um release/security review fresco:

- O ultimo release/security review aprovado revisou estado anterior ao hardening
  CSV, ao P3 renderer e ao rebaseline documental pos-P3.
- O corte atual agora se apresenta como primeiro release local-first com CSV,
  XLSX atual, RunLedger/retomada, Base Publica Local, F8B1 blocked states,
  coverage gate, release/security historico consumido e P3 renderer fechado.
- Antes de abrir nova feature, o judge precisa de um parecer read-only sobre se
  o corte atual ainda preserva publish safety, privacidade local, ausencia de
  updater/rede/telemetria/diagnostico/licenca real e coherencia de docs/status.

## Allowed write set da proxima thread

Somente:

- `docs/goals/fiscal-desk-orchestration/results/post-p3-rebaseline-first-release-readiness-review-2026-06-13.md`

## Do-not-touch da proxima thread

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
- qualquer arquivo fora do receipt permitido
- stage, commit, push, PR, deploy, publish, dist, assinatura, notarizacao,
  updater real, envio de diagnostico, telemetria real ou qualquer efeito externo

## Boundaries afetadas

Read-only inspection de:

- release/package safety: `package.json`, `electron-builder.yml`, `.github/**`;
- privacy/security local: logs, storage local, Base Publica Local warnings,
  IPC/ledger receipts e scans de termos sensiveis;
- docs/status: `docs/fiscal-desk/first-release.md`, `status.md`,
  `quality-gates.md` pela copia canonica absoluta se ausentes na worktree;
- orchestration receipts: release/security, reworks, re-gate local-base,
  hardening CSV, P3 renderer, F6E2C, F8B1 e coverage gate.

Nenhuma boundary recebe writer nesta janela.

## Dependencias e colisoes

Dependencias fechadas:

- F6E2C aceito no-code pelo judge;
- F8B1 integrado/validado seletivamente;
- release/security review historico consumido, com reworks integrados;
- re-gate de warnings da Base Publica Local fechado pelo judge;
- hardening de intake CSV integrado/validado;
- P3 renderer integrado/validado;
- rebaseline docs-only pos-P3 aceito pelo judge.

Colisoes:

- Sem colisao de writer se a proxima thread obedecer receipt-only.
- Qualquer necessidade de alterar `src/**`, `test/**`, package/workflow,
  release config, docs locais ou state/integration-plan deve parar e voltar ao
  judge como `needs_more_info` ou `blocked`.

## Checks recomendados para a proxima thread

Read-only obrigatorios:

- `git status --short --branch --untracked-files=all`
- `git log -1 --oneline`
- ler `AGENTS.md`, `goal.md`, `state.yaml`, `integration-plan.md` e este
  receipt;
- ler os receipts de release/security, reworks, post-rework reviews,
  re-gate Base Publica Local, coverage gate, F6E2C, F8B1, hardening CSV,
  P3 renderer e rebaseline pos-P3;
- se `docs/fiscal-desk/**` estiver ausente, usar a copia canonica absoluta em
  `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/fiscal-desk/**`;
- scans proporcionais para `publish`, `release`, `dist`, `electron-updater`,
  `autoUpdater`, `telemetria`, `diagnostico`, `licenca`, `token`, `secret`,
  `sourceFilePath`, `checkpointPath`, `indexPath`, `error.message`, `raw`,
  `providerResponse`, `CNPJ`, `Receita Web`, `Base Publica`, `F8B1`, `P3`.

Depois de escrever o receipt:

- `git diff --check -- docs/goals/fiscal-desk-orchestration/results/post-p3-rebaseline-first-release-readiness-review-2026-06-13.md`

Nao rodar `dist`, publish, deploy, assinatura, notarizacao, updater real, envio
de diagnostico ou qualquer comando com efeito externo. Build/smokes so devem
ser recomendados ao judge como follow-up se o reviewer concluir que a evidencia
read-only esta insuficiente.

## Necessidade de review

Esta propria proxima janela e um review read-only de release/security. Ela nao
pode aprovar a si mesma nem liberar material work. Deve retornar parecer para o
judge como `approved_candidate`, `needs_rework`, `needs_more_info` ou
`blocked`.

Qualquer owner window material posterior ainda exigira allowed writes proprios,
checks executaveis proporcionais e reviewer independente.

## Riscos residuais

- `docs/fiscal-desk/**` continua local/ignorado e ausente nesta worktree; a
  proxima thread pode precisar da copia canonica absoluta para leitura.
- A recomendacao nao prova runtime fresco em `88326f3`; ela apenas seleciona o
  proximo gate. O review recomendado deve decidir se a evidencia por receipts e
  scans basta ou se pede revalidacao executavel ao judge.
- Update real, diagnostico real, telemetria real, licenca/account,
  release/package config, storage/network, templates/modelos reutilizaveis,
  PDF/Word/OCR e Receita Web live/massiva continuam bloqueados.

## Stop conditions para a proxima thread

- Necessidade de editar qualquer arquivo alem do receipt permitido.
- Necessidade de stage, commit, push, PR, deploy, publish, dist, signing,
  notarizacao, updater, telemetria real ou envio de diagnostico.
- Encontrar publish/release/updater real habilitado ou permissao perigosa sem
  conseguir classificar por scan read-only.
- Encontrar log/diagnostico/telemetria com dado fiscal identificavel,
  caminho absoluto ou payload bruto sem conseguir limitar a evidencia.
- Ausencia dos docs locais e da copia canonica absoluta.
- Evidencia conflitante sobre se F6E2C, F8B1, release/security, Base Publica,
  hardening CSV ou P3 estao fechados.

## Prompt pronto para a proxima thread

```text
/goal Execute read-only release/security readiness review `post_p3_rebaseline_first_release_readiness_review` for Fiscal Desk.

You are running as an independent Codex App thread/worktree. The current thread
is the judge/orchestrator and will decide whether to release any worker after
reading your receipt. Do not self-approve. Do not implement code.

Use model `gpt-5.5` and reasoning `medium`. Use Portuguese-BR in the receipt.

Canonical branch: `feat/fiscal-desk-local-base-prep`.
Judge/orchestrator thread: `019ebe5c-3853-79c2-87ad-8ddace386c93`.
Target minimum commit: `88326f3`.

Read first:
- `AGENTS.md`
- `docs/goals/fiscal-desk-orchestration/goal.md`
- `docs/goals/fiscal-desk-orchestration/state.yaml`
- `docs/goals/fiscal-desk-orchestration/integration-plan.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-rebaseline-next-owner-window-selection-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-first-release-status-rebaseline-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-first-release-status-rebaseline-judge-decision-2026-06-13.md`
- release/security receipts and judge decisions
- first-release rework integration and post-rework release/security receipts
- Base Publica Local security re-gate receipts
- coverage gate receipts
- F6E2C, F8B1, CSV hardening and P3 renderer receipts

If `docs/fiscal-desk/**` is absent in your worktree, use the canonical absolute
copy under `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/fiscal-desk/**`
for read-only inspection. Record the limitation, but do not block automatically
unless both local and canonical copies are unavailable.

Task:
1. Perform a read-only release/security readiness review of the current
   post-P3 first-release cut.
2. Confirm whether the current cut still preserves publish safety, package
   identity safety, local privacy/log safety, no updater/network/telemetry/
   diagnostic/license real behavior, and honest docs/status.
3. Do not re-open `first_release_candidate_release_security_review` as a stale
   pending gate; treat it and its follow-ups as historical inputs.
4. Return a reviewer opinion only: `approved_candidate`, `needs_rework`,
   `needs_more_info`, or `blocked`. The judge decides next steps.
5. If you find any required material change, do not patch it; define the exact
   future owner window, allowed write set, checks, review need and stop
   conditions.

Allowed write only:
- `docs/goals/fiscal-desk-orchestration/results/post-p3-rebaseline-first-release-readiness-review-2026-06-13.md`

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
- any file outside the single allowed receipt path
- stage, commit, push, PR, deploy, publish, dist, signing, notarization,
  updater, telemetry, diagnostic sending, or any external side effect

Read-only checks expected:
- `git status --short --branch --untracked-files=all`
- `git log -1 --oneline`
- proportional `rg` scans over orchestration docs/results, package/workflow/
  builder config, source logs/storage surfaces, and `docs/fiscal-desk` or the
  canonical absolute copy for release, publish, dist, updater, telemetry,
  diagnostic, license, secrets, local paths, raw provider payloads, Base Publica,
  Receita Web, F8B1, P3 and first-release status.
- `git diff --check -- docs/goals/fiscal-desk-orchestration/results/post-p3-rebaseline-first-release-readiness-review-2026-06-13.md`
  after writing the receipt.

Do not run dist, publish, deploy, signing, notarization, updater real, telemetry
transport, diagnostic sending or any external side effect. If executable
validation seems necessary, request it as a judge follow-up instead of running
side-effectful release commands.

End final message with `ready_for_judge_review` and the receipt path.
```

approved_scope_candidate

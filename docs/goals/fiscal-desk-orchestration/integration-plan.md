# Integration Plan

## Purpose

Garantir que a execucao paralela por threads independentes termine em uma unica worktree e uma unica branch integrada, para validacao completa do app.

## Rule

Threads de fase podem trabalhar isoladas, mas nenhuma fase e considerada entregue ao usuario ate que seu resultado esteja integrado na branch final e validado junto com as demais alteracoes aceitas.

## Flow

1. F0 fecha o estado inicial da branch atual.
2. Fases independentes rodam em threads/worktrees separadas com seus phase goals.
3. Cada thread entrega receipt, diff summary, checks e riscos.
4. O Codex primario julga o resultado da fase.
5. Resultados aprovados entram em uma fila de integracao.
6. A integracao acontece em uma unica branch final, em ordem julgada.
7. Conflitos, regressao de checks ou colisao de boundaries voltam para a fase responsavel.
8. O app completo so e validado depois que todas as fases aprovadas estiverem na mesma worktree final.

## Final Branch

Branch final de integracao: `feat/fiscal-desk-local-base-prep`.

Reason: F0 foi aceito pelo judge e confirmou que a branch atual deve ser a base unica de integracao/teste para o app completo.

## Integration Gates

Antes de integrar uma fase:

- phase goal aprovado pelo judge;
- receipt da thread lido;
- arquivos alterados dentro do allowed write scope;
- sem colisao pendente com outra fase;
- checks aplicaveis reportados;
- reviewer independente quando houver codigo material;
- riscos residuais aceitos ou devolvidos para rework.

Depois de integrar cada fase na branch final:

- resolver conflitos sem descartar mudancas alheias;
- rodar checks proporcionais ao diff integrado;
- atualizar `state.yaml`;
- registrar resultado em `results/phase-N-*.md`;
- nao liberar dependentes sem novo julgamento.

## Final Validation

O fechamento geral exige uma validacao do app completo na worktree final:

- `pnpm lint`, se aplicavel;
- `pnpm typecheck`;
- `pnpm test`;
- status de cobertura registrado; cobertura so pode ser marcada como `pass`
  quando `coverage/coverage-summary.json` for gerado no pacote corrente;
- `pnpm build`;
- smokes Electron/visual/CSV conforme superficies tocadas;
- ratchet;
- review independente se o diff final for material;
- resumo de riscos residuais.

## Behavior Validation And Coverage Policy As Of 2026-06-13 13:40

Cobertura quantitativa agora e um gate ativo do repositorio para o pacote
integrado. O owner window `testing_infra_coverage_gate` adicionou
`@vitest/coverage-v8`, o script `pnpm test:coverage`, ativou
`requiredChecks.coverage` em `docs/ai/quality-gate` e limitou o universo de
coverage a `src/**/*.{ts,tsx}` para evitar que docs/scripts locais distorcam o
sinal do app Electron.

Coverage continua sendo evidencia auxiliar, nao criterio suficiente de aceite.
Nenhuma fase pode declarar comportamento funcional aprovado apenas por
porcentagem. O fechamento precisa combinar cobertura quantitativa, testes
focados do contrato alterado e smokes reais quando Electron, UI, IPC, provider
ou CSV forem afetados.

Validacao de comportamento real continua obrigatoria por superficie:

- core/domain/export/provider: focused tests do contrato alterado mais
  `pnpm test`;
- renderer/UI/copy/layout: focused renderer tests mais `pnpm smoke:visual`;
- main/preload/IPC/fluxo Electron: focused IPC/preload tests mais
  `pnpm smoke:electron-ui`;
- CSV/end-to-end local: smoke CSV real ou integracao com fixture local quando o
  ambiente nao permitir arquivo real, com o bloqueio registrado;
- Receita Web: testes sanitizados e prova de modo assistido/experimental, sem
  promessa de automacao robusta em lote.

Se o smoke aplicavel nao rodar, a fase nao fecha como validada: ela deve voltar
para rework ou registrar blocker formal com risco residual aceito pelo judge.

## Qualitative Coverage Audit As Of 2026-06-13 13:40

O audit `results/testability-coverage-audit-2026-06-13.md` classifica a
validacao pre-coverage como `PASS_WITH_RISK`. Depois do
`testing_infra_coverage_gate`, a classificacao permanece `PASS_WITH_RISK`, mas
com cobertura quantitativa ativa e uma lacuna qualitativa corrigida:
`prepareLocalPublicBase` agora tem teste direto de preload provando que o bridge
encaminha o payload completo para
`ipcRenderer.invoke("local-public-base:prepare", input)`.

Evidencia atual:

- `pnpm test`: 40 arquivos e 256 testes passando;
- `pnpm test:coverage`: 40 arquivos e 256 testes passando; coverage de `src/**`
  em 69.24% linhas/statements, 86.82% funcoes e 75.32% branches;
- `QUALITY_GATE_DIFF_MODE=worktree node docs/ai/quality-gate/check-ratchet.mjs`:
  pass para o recorte local do worker, preservando o modo default PR/CI;
- `pnpm smoke:electron-ui`: app Electron real, provider `mock`, retomada,
  historico, checkpoint e XLSX salvos;
- `FISCAL_DESK_SMOKE_PROVIDER=base-publica-local pnpm smoke:electron-ui`: app
  Electron real com preparo da Base Publica Local, aceite de Data da Base,
  retomada, historico, checkpoint e XLSX salvos;
- `TMPDIR=/private/tmp SMOKE_PROVIDER=base-publica-local pnpm smoke:real-csv`:
  smoke CLI com fixture real local, corrigido para enviar consentimento;
- `pnpm smoke:visual`: desktop, tablet e mobile sem overflow, botoes cortados ou
  sobreposicoes.

Uma lacuna qualitativa foi encontrada e corrigida durante o audit: o smoke CLI
da Base Publica Local ainda tentava preparar a base sem consentimento explicito.
O core estava correto ao bloquear; o harness foi ajustado em
`scripts/smoke-real-csv.ts`.

Riscos residuais aceitos para esta etapa:

- cobertura global ainda esta abaixo de um alvo operacional de 80% e deve ser
  tratada como baseline/sinal, nao como prova funcional;
- o ratchet default ainda precisa do contexto PR/CI/final branch para nao
  misturar ruido historico de `origin/main...HEAD`;
- Receita Web continua assistido/experimental;
- release Windows, updater, diagnostico, telemetria e licenca continuam fora de
  escopo ate novo owner window.

## Code Review Model

O review acontece em duas camadas:

1. Phase review: avalia se a thread cumpriu seu goal, escopo e gates.
2. Integration review: avalia se a composicao de todas as fases funciona em conjunto na branch final.

Nenhuma thread individual pode substituir o review da branch final integrada.

## Approved Queue As Of 2026-06-13

| Phase | Judge status | Integration release |
|---|---|---|
| post_p3_legacy_resume_copy_harness_polish | approved_by_judge_integrated_validated | worker `019ec355-e935-7263-b4b3-2c808b58469d`, review `019ec35d-24c2-7f93-b4cf-a8da8ecadaa1`, judge decision `results/post-p3-legacy-resume-copy-harness-polish-integration-judge-decision-2026-06-13.md` |
| post_p3_excel_input_core_ingestion_contract | integrated_validated | worker `019ec370-acf3-76e1-b59c-d7f7fccfab56`, review `019ec37c-a5f4-70e2-ba8f-5f065163a3ab`, judge decision `results/post-p3-excel-input-core-ingestion-contract-integration-judge-decision-2026-06-13.md` |
| post_p3_excel_input_runtime_exposure | approved_by_judge_integrated_validated | worker `019ec38f-785c-7c43-a14b-61392cd1119e`, review `019ec3a4-8c28-75e2-8315-77b0122fada6`, judge decision `results/post-p3-excel-input-runtime-exposure-integration-judge-decision-2026-06-13.md` |

F8B1 was dispatched, independently reviewed and selectively integrated in Wave
13. P3 renderer was integrated and validated after CSV input intake hardening.
Post-P3 legacy copy polish, Excel core ingestion and Excel runtime exposure were
integrated and validated after independent review/rework where required.

## Active Queue As Of 2026-06-13

No material worker is active. The next safe step is a fresh read-only
owner-window selection before releasing any new material work.

The read-only scope-selection gate
`post_p3_operational_panel_next_owner_window_selection` completed as
`approved_scope_candidate` and was accepted by the judge at
`2026-06-13 20:29:55 -03`.

The next authorized window is material and narrow:
`post_p3_legacy_resume_copy_harness_polish`. It may only correct the legacy
`uiResumeText`/`execution-resume` copy and align the Electron smoke harness.
It does not release Excel input, guided delivery/templates, diagnostics,
telemetry, license/account, release/update, PDF/Word/OCR or Receita Web live.

The dispatch file
`results/post-p3-legacy-resume-copy-harness-polish-dispatch-2026-06-13.md`
was prepared at `2026-06-13 20:32:00 -03`.

The Codex App worker was requested at `2026-06-13 20:34:00 -03`, returned
pending worktree `local:6be9c7f0-6b93-4837-9f32-68bc85c0e2e6`, and materialized
as thread `019ec355-e935-7263-b4b3-2c808b58469d` in worktree
`/Users/icaroaguiar/.codex/worktrees/08af/consulta-simples-csv`. It was observed
active at `2026-06-13 20:35:08 -03`.

The worker must run in an isolated Codex App thread with `/goal`, `gpt-5.5`,
reasoning `medium`, explicit allowed writes, real Electron smoke evidence and
independent review before integration.

The worker completed as `ready_for_judge_review` at `2026-06-13 20:39:21 -03`.
The judge inspected the worker worktree at `2026-06-13 20:40:14 -03`: status
and diff were restricted to the allowed write set, `git diff --check` passed,
and the receipt was present. Independent review is now required before any
integration.

Review dispatch prepared:
`results/post-p3-legacy-resume-copy-harness-polish-review-dispatch-2026-06-13.md`.
The Codex App review thread was requested at `2026-06-13 20:41:00 -03` and
returned pending worktree `local:b9514ee2-a346-4d81-8bb9-61c3873b6003`.
It materialized as thread `019ec35d-24c2-7f93-b4cf-a8da8ecadaa1` in worktree
`/Users/icaroaguiar/.codex/worktrees/a105/consulta-simples-csv` and was observed
active at `2026-06-13 20:42:45 -03`.

The independent review returned `approved_candidate` at
`2026-06-13 20:44:58 -03`. The judge integrated the approved narrow patch into
`feat/fiscal-desk-local-base-prep` and validated the canonical branch at
`2026-06-13 20:51:06 -03` with focused tests, Electron smokes for `mock` and
`base-publica-local`, lint, typecheck, full test, coverage, scoped ratchet,
visual smoke, build and diff check.

No material worker remains active after this integration. The next safe step is
a fresh read-only owner-window selection before releasing any new material work.

That read-only selection dispatch was prepared at `2026-06-13 20:54:22 -03`:
`results/post-p3-legacy-polish-next-owner-window-selection-dispatch-2026-06-13.md`.
No material worker is released by this dispatch.

The Codex App selection thread was requested at `2026-06-13 20:56:25 -03` and
returned pending worktree `local:cb6e3ce6-07b3-4d59-9c5e-e6abe2b7b0e0`.
It materialized as thread `019ec36a-345e-7be0-9458-3fa3ef77577e` in worktree
`/Users/icaroaguiar/.codex/worktrees/2519/consulta-simples-csv` and was observed
active at `2026-06-13 20:57:07 -03`.
The selector returned `approved_scope_candidate` at `2026-06-13 20:59:11 -03`,
recommending `post_p3_excel_input_core_ingestion_contract` as a material
single-writer core-ingestion slice. The judge accepted the scope at
`2026-06-13 21:00:05 -03` and prepared dispatch
`results/post-p3-excel-input-core-ingestion-contract-dispatch-2026-06-13.md`.
This dispatch does not release UI, IPC, preload, runtime Electron,
package/lock, release/update, diagnostics, telemetry, license/account,
templates, PDF/Word/OCR or Receita Web live/massiva.
The Codex App worker was requested at `2026-06-13 21:03:27 -03` and returned
pending worktree `local:77cf7326-42ee-4dfc-a3b6-8f5c12d5a8c9`.
It materialized as thread `019ec370-acf3-76e1-b59c-d7f7fccfab56` in worktree
`/Users/icaroaguiar/.codex/worktrees/a88b/consulta-simples-csv` and was observed
active at `2026-06-13 21:04:14 -03`.
The worker completed at `2026-06-13 21:10:05 -03` with receipt status
`ready_for_judge_review`. The judge repeated focused Vitest, lint, typecheck,
ratchet and diff-check successfully, but rejected the candidate at
`2026-06-13 21:12:11 -03` as `needs_rework_scope_violation` because the worker
modified `test/unit/fiscal-desk-phase-6-contracts.test.ts`, which was outside
the strict allowed write set. Rework was sent back to the same thread. No review
independent and no integration are authorized until the worker returns
`ready_for_judge_review_after_rework` with all changed files inside the allowlist.
The worker completed rework at `2026-06-13 21:13:41 -03`. The judge verified
that `test/unit/fiscal-desk-phase-6-contracts.test.ts` no longer has a diff,
repeated focused Vitest/lint/typecheck/ratchet/diff-check, and accepted the
candidate as `ready_for_independent_review_after_rework` at
`2026-06-13 21:14:48 -03`. Review dispatch prepared:
`results/post-p3-excel-input-core-ingestion-contract-review-dispatch-2026-06-13.md`.
The Codex App review thread was requested at `2026-06-13 21:16:33 -03` and
returned pending worktree `local:54bcd436-37f9-45cd-af0a-9e45896bd248`.
It materialized as thread `019ec37c-a5f4-70e2-ba8f-5f065163a3ab` in worktree
`/Users/icaroaguiar/.codex/worktrees/1e64/consulta-simples-csv` and was observed
active at `2026-06-13 21:17:28 -03`.
The independent review returned `approved_candidate` at
`2026-06-13 21:18:19 -03`. The judge integrated the approved post-rework
candidate into `feat/fiscal-desk-local-base-prep` and validated the canonical
branch at `2026-06-13 21:24:08 -03`.

Canonical validation after integration:

- focused ingestion/reader/F6 contract tests: pass, 3 files and 13 tests;
- `pnpm lint`: pass, 124 files;
- `pnpm typecheck`: pass;
- `git diff --check`: pass;
- `pnpm test`: pass, 43 files and 278 tests;
- `pnpm test:coverage`: pass, global coverage 76.27%;
- `QUALITY_GATE_DIFF_MODE=worktree node docs/ai/quality-gate/check-ratchet.mjs`:
  pass, changed-line coverage 100%, global coverage 76.27%, non-blocking
  warning `agentic-review.not-enforced`;
- `pnpm build`: pass.

Decision: `integrated_validated`.

No material worker remains active after this integration. The next safe step is
a fresh read-only owner-window selection before releasing new material work.
The accepted residual risks are documented in
`results/post-p3-excel-input-core-ingestion-contract-integration-judge-decision-2026-06-13.md`.

That read-only selection dispatch was prepared at `2026-06-13 21:27:21 -03`:
`results/post-p3-excel-ingestion-next-owner-window-selection-dispatch-2026-06-13.md`.
No material worker is released by this dispatch.

The Codex App selection thread was requested at `2026-06-13 21:29:23 -03` and
returned pending worktree `local:d250f596-51fc-4559-bbb8-ca5f63656d8b`.
It materialized as thread `019ec388-5dd0-7063-865b-a28039875f4c` in worktree
`/Users/icaroaguiar/.codex/worktrees/0ed9/consulta-simples-csv` and was observed
active at `2026-06-13 21:30:11 -03`.
The selector returned `approved_scope_candidate` at `2026-06-13 21:32:32 -03`,
recommending `post_p3_excel_input_runtime_exposure`. The judge accepted the
scope at `2026-06-13 21:33:24 -03` with an adjusted allowlist that includes
ledger/fingerprint and the Electron smoke harness. Material dispatch prepared:
`results/post-p3-excel-input-runtime-exposure-dispatch-2026-06-13.md`.

No material worker has been requested yet for this dispatch.
The Codex App material worker was requested at `2026-06-13 21:37:05 -03` and
returned pending worktree `local:30c57af9-ed7e-4fa5-b04e-dba25e4b8253`.
It materialized as thread `019ec38f-785c-7c43-a14b-61392cd1119e` in worktree
`/Users/icaroaguiar/.codex/worktrees/16e4/consulta-simples-csv` and was
observed active at `2026-06-13 21:38:23 -03`.

The worker returned `ready_for_judge_review`. Independent review thread
`019ec3a4-8c28-75e2-8315-77b0122fada6` first returned `needs_rework` because
the XLSX parser version did not participate in the ledger fingerprint. Rework
was sent to the same worker and independently confirmed as `approved_rework`.
The judge integrated the approved candidate into
`feat/fiscal-desk-local-base-prep` and validated the canonical branch at
`2026-06-13 22:16:15 -03` with focused tests, full test, coverage, lint,
typecheck, build, ratchet, Electron XLSX smokes for `mock` and
`base-publica-local`, visual smoke and diff check.

Decision: `approved_by_judge_integrated_validated`.

No material worker remains active after this integration. The accepted residual
risks are documented in
`results/post-p3-excel-input-runtime-exposure-integration-judge-decision-2026-06-13.md`.

The judge prepared a fresh read-only owner-window selection after Excel runtime
integration at `2026-06-13 22:21:43 -03`:
`results/post-p3-excel-runtime-next-owner-window-selection-dispatch-2026-06-13.md`.
No material worker is released by this dispatch.
The Codex App selection thread was requested at `2026-06-13 22:23:59 -03`,
returned pending worktree `local:a79de604-97a2-445f-b611-aa779e4ad901`, and
materialized as thread `019ec3b9-f3e2-7863-8fe9-8c98c8e34460` in worktree
`/Users/icaroaguiar/.codex/worktrees/4f76/consulta-simples-csv`.
The selector returned `approved_scope_candidate`, recommending
`post_p3_excel_runtime_docs_rebaseline` as a docs-only rebaseline because local
product/QA docs still described Excel input as planned/disabled after runtime
integration. The judge accepted that scope at `2026-06-13 22:27:41 -03`.
No material worker is released by this decision.
The docs-only dispatch was prepared at `2026-06-13 22:28:55 -03`:
`results/post-p3-excel-runtime-docs-rebaseline-dispatch-2026-06-13.md`.
No material worker is released by this dispatch.
The Codex App docs-only worker was requested at `2026-06-13 22:31:19 -03`,
returned pending worktree `local:2760d2ca-b6a1-499f-ad92-6b442af2e077`, and
materialized as thread `019ec3c0-8180-7813-adb0-e9abe797b3f4` in worktree
`/Users/icaroaguiar/.codex/worktrees/ae44/consulta-simples-csv`.
The worker completed as `ready_for_judge_review`. The judge promoted the
versioned QA doc, the receipt and the local ignored `docs/fiscal-desk/**` edits
back to the canonical worktree, validated the docs-only diff at
`2026-06-13 22:36:47 -03`, and accepted the window as
`approved_docs_only_integrated_local_docs`.
No material worker remains active after this docs-only rebaseline.
The judge prepared a fresh read-only owner-window selection at
`2026-06-13 22:38:34 -03`:
`results/post-p3-excel-runtime-docs-rebaseline-next-owner-window-selection-dispatch-2026-06-13.md`.
No material worker is released by this dispatch.
The Codex App selection thread was requested at `2026-06-13 22:40:40 -03`,
returned pending worktree `local:4c60139a-00c9-4c57-bd90-492b3f5251e8`, and
materialized as thread `019ec3c9-1675-7711-9de3-f926a5f10299` in worktree
`/Users/icaroaguiar/.codex/worktrees/dfd0/consulta-simples-csv`.
The selector returned `approved_scope_candidate`, recommending
`post_p3_excel_runtime_docs_rebaseline_integrated_first_release_validation` as a
non-feature material validation window. The judge accepted that scope at
`2026-06-13 22:46:47 -03`.

Current state:

- the docs-only rebaseline after Excel runtime is closed;
- no feature/material implementation worker is active;
- the next authorized work is executable integrated validation, with only one
  persistent receipt allowed;
- any new feature material remains blocked until that validation is judged.

The next validation window must run lint, typecheck, full tests, coverage, CSV
smoke, XLSX Electron smokes for `mock` and `base-publica-local`, visual smoke,
build, gitleaks and the worktree quality ratchet. If a check fails, it must
return blocker/rework evidence instead of patching code or docs.

Dispatch prepared at `2026-06-13 22:48:14 -03`:
`results/post-p3-excel-runtime-docs-rebaseline-integrated-first-release-validation-dispatch-2026-06-13.md`.

This dispatch allows only one persistent receipt and transient check artifacts.
No feature/material implementation worker is released by this dispatch.

The Codex App validation thread was requested at `2026-06-13 22:50:20 -03`,
returned pending worktree `local:1307995f-c417-44be-9a32-614bc13a20d9`, and
materialized as thread `019ec3d1-fb28-75e2-a3e1-0623fc26bd22` in worktree
`/Users/icaroaguiar/.codex/worktrees/a40e/consulta-simples-csv`.
The first validation attempt found the expected isolated-worktree bootstrap gap:
`pnpm lint` could not find `biome` because `node_modules` was absent. The judge
corrected the dispatch to allow `pnpm install --frozen-lockfile` and
`node_modules/**` as transient ignored bootstrap artifacts only, with no
package/lockfile changes allowed.
At `2026-06-13 22:54:00 -03`, the judge resumed the same validation thread with
that bootstrap authorization. The first `blocked` result is treated as an
orchestration/bootstrap gap, not as product validation failure.
The resumed worker completed as `ready_for_judge_review`. The judge promoted
the receipt and accepted the validation at `2026-06-13 22:58:46 -03`.

Accepted validation evidence:

- `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm test:coverage`;
- `pnpm smoke:real-csv`;
- Electron XLSX smokes for `mock` and `base-publica-local`, after sandbox
  `listen EPERM` reruns outside sandbox;
- `pnpm smoke:visual`, after the same sandbox rerun pattern;
- `pnpm build`;
- `gitleaks detect --source . --redact --no-banner`;
- `QUALITY_GATE_DIFF_MODE=worktree node docs/ai/quality-gate/check-ratchet.mjs`;
- `git diff --check` for the receipt.

No feature/material implementation worker remains active. The next safe action
is a fresh read-only owner-window selection before any additional feature
material.

## Post P3 Excel Validation Next Owner Window Selection Dispatch As Of 2026-06-13

Receipt:
`results/post-p3-excel-validation-next-owner-window-selection-dispatch-2026-06-13.md`.

The judge prepared a fresh read-only owner-window selection at
`2026-06-13 23:02:00 -03`. No material worker is released by this dispatch.
The Codex App selection thread was requested at `2026-06-13 23:04:23 -03`,
returned pending worktree `local:eb1d4c0f-7411-4b9c-a4df-7e01a9363941`, and
materialized as thread `019ec3de-ac9c-7652-8ec2-015c26295071` in worktree
`/Users/icaroaguiar/.codex/worktrees/25c7/consulta-simples-csv`.
The selector returned `approved_scope_candidate`, recommending
`post_p3_first_release_final_readiness_pr_closeout` as a read-only closeout
window. The judge accepted that scope at `2026-06-13 23:08:51 -03`.

## Post P3 First Release Final Readiness PR Closeout Dispatch As Of 2026-06-13

Receipt:
`results/post-p3-first-release-final-readiness-pr-closeout-dispatch-2026-06-13.md`.

The judge prepared the read-only closeout dispatch at
`2026-06-13 23:10:29 -03`. No material worker is released by this dispatch.

The closeout thread may only decide whether the current branch is ready to move
to branch/PR preparation or whether a concrete blocker remains. It may not
implement code, create a PR, package a release, publish, sign, notarize, deploy,
send diagnostics, enable telemetry or open any feature surface.

The Codex App closeout thread was requested at `2026-06-13 23:14:14 -03`,
returned pending worktree `local:ad0c7d79-3063-4e90-907c-a649c3fd16ad`, and
materialized as thread `019ec3e7-b051-7252-bfdc-05e2e40b101e` in worktree
`/Users/icaroaguiar/.codex/worktrees/c162/consulta-simples-csv`. It is active
as a read-only closeout gate with `/goal`, `gpt-5.5`, reasoning `medium`.

The closeout receipt returned `approved_candidate` and was accepted by the judge
at `2026-06-13 23:17:15 -03`:
`results/post-p3-first-release-final-readiness-pr-closeout-judge-decision-2026-06-13.md`.
The branch may move to branch/PR preparation closeout. No material feature
worker, release publication, updater, diagnostics, telemetry, license/account,
templates, PDF/Word/OCR or Receita Web live surface is released by this
decision.

Current state:

- Excel/XLSX runtime and post-Excel integrated validation are closed;
- no material implementation worker is active;
- the first-release readiness/PR closeout gate is accepted by the judge;
- the next authorized work is branch/PR preparation closeout, not feature
  implementation or release publication;
- release/public distribution, updater real, diagnostics sent externally,
  telemetry, license/account, storage/network/backend, templates/models,
  PDF/Word/OCR and Receita Web live/massiva remain blocked until explicit owner
  windows.

`post_local_base_regate_csv_input_intake_hardening` was integrated and validated
at `2026-06-13 17:20:37 -03`. The read-only scope-selection gate
`post_csv_input_intake_next_owner_window_selection` was dispatched at
`2026-06-13 17:26:55 -03`, observed active at `2026-06-13 17:29:28 -03` and
approved by the judge at `2026-06-13 17:31:33 -03`.

## Post P3 Branch PR Preparation Closeout Dispatch As Of 2026-06-13

Receipt:
`results/post-p3-branch-pr-preparation-closeout-dispatch-2026-06-13.md`.

The judge prepared the branch/PR preparation closeout dispatch at
`2026-06-13 23:20:21 -03`. No material worker, PR creation, stage, commit,
push, release, publish, signing, notarization, updater, diagnostics,
telemetry, license/account, templates, PDF/Word/OCR or Receita Web live surface
is released by this dispatch.

The closeout thread may only produce a PR preparation artifact: suggested title,
suggested PR body/checklist, checks to cite, mandatory exclusions, residual
risks, remaining blocked surfaces, and a go/no-go recommendation for a future
PR action. It may not create or update a PR.

The Codex App PR-preparation closeout thread was requested at
`2026-06-13 23:22:38 -03`, returned pending worktree
`local:8ef69773-6b61-4c82-a35a-2a81d9c317f8`, and materialized as thread
`019ec3ef-ae95-7971-90af-02644602eb50` in worktree
`/Users/icaroaguiar/.codex/worktrees/8095/consulta-simples-csv`. It is active
as a read-only PR preparation gate with `/goal`, `gpt-5.5`, reasoning `medium`.

The PR-preparation closeout receipt returned
`approved_pr_preparation_candidate` and was accepted by the judge at
`2026-06-13 23:26:46 -03`:
`results/post-p3-branch-pr-preparation-closeout-judge-decision-2026-06-13.md`.
The branch is ready for an explicit PR action approval. No PR was created or
updated by this decision.

At `2026-06-13 23:30:37 -03`, the orchestrator ran a read-only PR existence
check. `gh pr list --head feat/fiscal-desk-local-base-prep --state all`
returned `[]`, so there is no current PR for this branch in the queried remote.
The observation receipt is
`results/post-p3-pr-action-readiness-observation-2026-06-13.md`.
Creating a PR now requires explicit user authorization.

At `2026-06-13 23:32:27 -03`, the orchestrator also checked remote branch
existence. `git ls-remote --heads origin feat/fiscal-desk-local-base-prep`
returned no output. The local HEAD is
`ac14eb77db955a1c60af3cf718b322913c7a26b8`, and the observation receipt is
`results/post-p3-pr-remote-branch-readiness-observation-2026-06-13.md`.
The next external action requires explicit authorization for both pushing the
branch and creating the PR.

Current state:

- first-release readiness/PR closeout is accepted by the judge;
- branch/PR preparation closeout is accepted by the judge;
- branch `feat/fiscal-desk-local-base-prep` is the single integration branch;
- no material implementation worker is active;
- PR create/update now requires explicit user authorization;
- because the branch is not on origin yet, PR creation also requires explicit
  push authorization;
- `skills/**` remains local/untracked and excluded by default;
- `docs/fiscal-desk/**` remains local-only unless a separate versioning decision
  changes that;

## Post PR E2E And Desktop Build Workflow Update As Of 2026-06-14

Receipt:
`results/post-pr-e2e-desktop-build-workflow-2026-06-14.md`.

After the PR-preparation closeout, a new local material documentation/CI/testing
slice was requested directly by the user: create an e2e that exercises the
deterministic local-first functionality and adjust GitHub Actions to generate
unsigned Windows and macOS builds.

Changes made in the final integration worktree:

- `pnpm test:e2e` aggregates coverage-backed tests, real CSV smoke with `mock`,
  real CSV smoke with `base-publica-local`, runtime build, four Electron smokes
  covering CSV/XLSX x `mock`/`base-publica-local`, and visual smoke.
- `PR Quality Gate` runs `pnpm test:e2e` under `xvfb-run` and uploads
  `docs/qa/e2e-artifacts/**`.
- `Desktop unsigned builds` now runs a Windows/macOS matrix:
  - Windows x64 through `pnpm dist:win`;
  - macOS through `pnpm dist:mac`.
- The build workflow still uses `permissions.contents: read` and upload-artifact
  only; it does not publish GitHub Releases, sign, notarize or enable updater
  real.

Local validation:

- `pnpm typecheck`: pass;
- `pnpm lint`: pass;
- `pnpm test:e2e`: pass outside sandbox after known `tsx` IPC `listen EPERM`
  sandbox failure;
- `git diff --check`: pass.

Current state:

- no material worker is active;
- the new local changes are validated and the explicit stage set must include
  the new `scripts/e2e-all.ts` file with the package/workflow changes;
- PR action now requires a staging/commit decision for this update, then
  explicit authorization for `git push` and `gh pr create`;
- Receita Web live/massiva, `cnpja-open` live, publish, signing, notarization,
  updater real, telemetry, diagnostic sending and license/account remain outside
  this e2e/build workflow slice.
- release/public distribution, updater real, diagnostics sent externally,
  telemetry, license/account, storage/network/backend, templates/models,
  PDF/Word/OCR and Receita Web live/massiva remain blocked until explicit owner
  windows.

The next material owner window dispatch was prepared at
`2026-06-13 17:32:52 -03`; the Codex App worker thread was observed active at
`2026-06-13 17:35:09 -03`. The first worker receipt stopped on
`blocked_missing_docs_fiscal_desk`; the judge rejected that as a material blocker
for this narrow renderer-only slice and sent rework at
`2026-06-13 17:37:10 -03`. The worker returned `ready_for_judge_review`; the
independent review dispatch was prepared at `2026-06-13 17:40:18 -03` and the
reviewer was observed active at `2026-06-13 17:42:13 -03`. The review returned
`approved_candidate`; the judge integrated and validated the patch at
`2026-06-13 17:47:02 -03`.

No material worker is active after the P3 integration. The read-only
scope-selection gate was prepared at `2026-06-13 17:50:31 -03`, observed active
at `2026-06-13 17:53:12 -03`, completed as `approved_scope_candidate`, and was
approved by the judge at `2026-06-13 17:59:46 -03`.

The next authorized window is docs-only:
`post_p3_first_release_status_rebaseline`. Because `docs/fiscal-desk/**` is
local and ignored by `.git/info/exclude`, the orchestrator must provide an
editable copy to the worker worktree before requiring execution. No material
feature work is released by this approval.

The docs-only dispatch was prepared at `2026-06-13 18:01:49 -03`. The Codex App
thread was created and observed active at `2026-06-13 18:04:29 -03`. The
orchestrator copied the local ignored `docs/fiscal-desk/**` tree into the worker
worktree and sent a coordination update, so the worker should not block on
missing docs unless they disappear locally. The thread completed as
`ready_for_judge_review`, and the judge accepted/integrated the local docs into
the canonical worktree at `2026-06-13 18:10:46 -03`.

Material work remains blocked. The next safe step is a fresh read-only
owner-window selection after this rebaseline. That selection dispatch was
prepared at `2026-06-13 18:12:56 -03`; no material worker is released by this
dispatch. The Codex App selection thread was observed active at
`2026-06-13 18:14:49 -03`, completed as `approved_scope_candidate`, and was
approved by the judge at `2026-06-13 18:19:33 -03`.

The next authorized window is
`post_p3_rebaseline_first_release_readiness_review`, classified as a read-only
release/security review. No material feature work is released by this approval.
The review dispatch was prepared at `2026-06-13 18:20:45 -03`. The Codex App
review thread `019ec2dd-3315-7830-b139-b37cbacd665f` was observed active at
`2026-06-13 18:24:17 -03` in
`/Users/icaroaguiar/.codex/worktrees/b9d7/consulta-simples-csv`.
The reviewer returned `approved_candidate`, and the judge accepted the readiness
review at `2026-06-13 18:27:15 -03`.

Material work remains blocked. The next safe step is a fresh read-only
owner-window selection after this readiness gate:
`post_p3_rebaseline_readiness_next_owner_window_selection`. The dispatch was
prepared at `2026-06-13 18:27:15 -03`; no material worker is released by this
dispatch. The Codex App selection thread
`019ec2e3-acd3-7d32-bbde-6c8e2740569f` was observed active at
`2026-06-13 18:29:45 -03` in
`/Users/icaroaguiar/.codex/worktrees/31d4/consulta-simples-csv`.
The selector returned `approved_scope_candidate`, and the judge accepted the
next docs-only window at `2026-06-13 18:35:50 -03`.

The next authorized window is docs-only:
`post_p3_readiness_first_release_validation_docs_rebaseline`. It may only
update `docs/qa/first-release-validation.md` and its receipt so the validation
doc matches the integrated coverage gate and post-P3 first-release cut. No
material feature work, release execution, dist, publish, signing, notarization,
updater, telemetry, diagnostic sending, license/account or external side effect
is released by this approval.
The Codex App docs-only thread `019ec2ec-4d33-7233-9555-d97ec33bb913` was
observed active at `2026-06-13 18:39:15 -03` in
`/Users/icaroaguiar/.codex/worktrees/cf27/consulta-simples-csv`.

Judge decision:
`results/post-local-base-regate-csv-input-intake-hardening-judge-decision-2026-06-13.md`.

Independent review:
`results/post-local-base-regate-csv-input-intake-hardening-review-2026-06-13.md`.

Re-review dispatch:
`results/post-local-base-regate-csv-input-intake-hardening-review-after-rework-dispatch-2026-06-13.md`.

Re-review result:
`results/post-local-base-regate-csv-input-intake-hardening-review-after-rework-2026-06-13.md`.

Integration judge decision:
`results/post-local-base-regate-csv-input-intake-hardening-integration-judge-decision-2026-06-13.md`.

Next owner-window selection dispatch:
`results/post-csv-input-intake-next-owner-window-selection-dispatch-2026-06-13.md`.

Next owner-window selection result:
`results/post-csv-input-intake-next-owner-window-selection-2026-06-13.md`.

Next owner-window selection judge decision:
`results/post-csv-input-intake-next-owner-window-selection-judge-decision-2026-06-13.md`.

Approved next material owner window:
`p3_renderer_missing_column_normalizer_can_hide_new_core_guidance`.

P3 renderer owner-window dispatch:
`results/p3-renderer-missing-column-normalizer-can-hide-new-core-guidance-dispatch-2026-06-13.md`.

P3 renderer owner-window rework dispatch:
`results/p3-renderer-missing-column-normalizer-can-hide-new-core-guidance-rework-dispatch-2026-06-13.md`.

P3 renderer owner-window result:
`results/p3-renderer-missing-column-normalizer-can-hide-new-core-guidance-2026-06-13.md`.

P3 renderer owner-window review dispatch:
`results/p3-renderer-missing-column-normalizer-can-hide-new-core-guidance-review-dispatch-2026-06-13.md`.

P3 renderer owner-window review result:
`results/p3-renderer-missing-column-normalizer-can-hide-new-core-guidance-review-2026-06-13.md`.

P3 renderer owner-window integration judge decision:
`results/p3-renderer-missing-column-normalizer-can-hide-new-core-guidance-integration-judge-decision-2026-06-13.md`.

Post-P3 next owner-window selection dispatch:
`results/post-p3-renderer-next-owner-window-selection-dispatch-2026-06-13.md`.

Post-P3 next owner-window selection result:
`results/post-p3-renderer-next-owner-window-selection-2026-06-13.md`.

Post-P3 next owner-window selection judge decision:
`results/post-p3-renderer-next-owner-window-selection-judge-decision-2026-06-13.md`.

Post-P3 first release/status rebaseline dispatch:
`results/post-p3-first-release-status-rebaseline-dispatch-2026-06-13.md`.

Post-P3 first release/status rebaseline result:
`results/post-p3-first-release-status-rebaseline-2026-06-13.md`.

Post-P3 first release/status rebaseline judge decision:
`results/post-p3-first-release-status-rebaseline-judge-decision-2026-06-13.md`.

Post-P3 rebaseline next owner-window selection dispatch:
`results/post-p3-rebaseline-next-owner-window-selection-dispatch-2026-06-13.md`.

Post-P3 rebaseline next owner-window selection result:
`results/post-p3-rebaseline-next-owner-window-selection-2026-06-13.md`.

Post-P3 rebaseline next owner-window selection judge decision:
`results/post-p3-rebaseline-next-owner-window-selection-judge-decision-2026-06-13.md`.

Post-P3 rebaseline first release readiness review dispatch:
`results/post-p3-rebaseline-first-release-readiness-review-dispatch-2026-06-13.md`.

Post-P3 rebaseline first release readiness review result:
`results/post-p3-rebaseline-first-release-readiness-review-2026-06-13.md`.

Post-P3 rebaseline first release readiness review judge decision:
`results/post-p3-rebaseline-first-release-readiness-review-judge-decision-2026-06-13.md`.

Post-P3 rebaseline readiness next owner-window selection dispatch:
`results/post-p3-rebaseline-readiness-next-owner-window-selection-dispatch-2026-06-13.md`.

Post-P3 rebaseline readiness next owner-window selection result:
`results/post-p3-rebaseline-readiness-next-owner-window-selection-2026-06-13.md`.

Post-P3 rebaseline readiness next owner-window selection judge decision:
`results/post-p3-rebaseline-readiness-next-owner-window-selection-judge-decision-2026-06-13.md`.

Post-P3 readiness first-release validation docs rebaseline dispatch:
`results/post-p3-readiness-first-release-validation-docs-rebaseline-dispatch-2026-06-13.md`.

Independent review threads for the coverage gate:
`019ec1d0-a1f5-7601-97ef-b91f46e0d00c` and canonical follow-up
`019ec1d9-37fa-7760-a442-dec7783aaa0c`.

## Testing-Infra Coverage Gate Closeout As Of 2026-06-13 13:40

The first `testing_infra_coverage_gate` result was `needs_rework` because the
ratchet default compared `origin/main...HEAD` and pulled historical branch noise
into the detached worker context. The rework preserved default PR/CI behavior
and added opt-in `QUALITY_GATE_DIFF_MODE=worktree` for bounded worker receipts.

The judge integrated the reworked candidate into the canonical branch, corrected
the coverage universe to `src/**/*.{ts,tsx}`, reran the full local gate, and
recorded the closeout as `integrated_validated_pass_with_risk`.

Judge receipt:
`results/testing-infra-coverage-gate-judge-decision-2026-06-13.md`.
Canonical integration receipt:
`results/testing-infra-coverage-gate-canonical-integration-2026-06-13.md`.
Canonical review receipt:
`results/testing-infra-coverage-gate-canonical-review-2026-06-13.md`.

Wave 10 had local ignored docs copied into worker worktrees after creation.
F6E2A revalidated and resumed after an initial stale missing-docs blocker, then
passed re-review after targeted rework. F8A received an explicit revalidation
instruction after docs were copied and passed security review.

Wave 11 is integrated as docs-only. Both scope reviews ran concurrently because
they wrote distinct result files only.

Wave 12 integrated F6E2B as a selective integration. The worker worktree was not
accepted as a whole because it had broad dirty state, but the approved
IPC/preload/types files were isolated, integrated and validated in the canonical
worktree.

## Integrated Queue As Of 2026-06-13

| Phase | Integration status | Evidence |
|---|---|---|
| F1 | `integrated_validated` | focused contract test, typecheck, lint, full test, smoke Electron |
| F2 | `integrated_validated` | focused renderer tests, smoke visual, smoke Electron |
| F4 | `integrated_validated` | focused provider tests, typecheck, lint, full test |
| F3 | `integrated_validated` | focused ledger/resume tests, typecheck, lint, full test, smoke Electron |
| F5 | `integrated_validated` | focused local-base tests, typecheck, lint, full test |
| F6A | `integrated_validated` | focused contract tests, typecheck, lint, full test, smoke Electron, smoke visual |
| F7A | `integrated_validated` | focused Receita Web/provider tests, typecheck, lint, full test, smoke Electron, smoke visual |
| F6B | `integrated_validated` | focused ingestion tests, typecheck, lint, full test |
| F6C | `integrated_validated` | focused export tests, typecheck, lint, full test |
| F6D scope review | `integrated_docs_only` | docs-only scope review, single-writer prompt accepted |
| F6D runtime wiring | `integrated_validated` | focused F6/process tests, progress/cancel/resume, typecheck, lint, full test, smoke CSV, smoke Electron |
| F6E scope review | `integrated_docs_only` | docs-only scope review, export-contract-only worker approved |
| F7B security scope review | `integrated_docs_only` | docs-only security/scope review, adapter-hardening worker approved |
| F6E1 export contract | `integrated_validated` | focused export/phase-6 tests, typecheck, lint, diff check, independent review |
| F7B adapter hardening | `integrated_validated` | focused Receita tests, provider regressions, typecheck, lint, sensitive scan, full test |
| F6E2 delivery runtime/UI scope review | `integrated_docs_only` | docs-only scope review, F6E2A runtime-selection worker approved |
| F8A local update diagnostic contract scope review | `integrated_docs_only` | docs-only scope review, F8A core local contract worker approved |
| F6E2A delivery runtime selection | `integrated_validated` | focused F6/process tests, cancel/resume tests, typecheck, lint, independent re-review |
| F8A local update diagnostic contract | `integrated_validated` | focused local contract tests, typecheck, lint, security review, updater/network/sensitive scans |
| F6E2B delivery UI/IPC scope review | `integrated_docs_only` | docs-only scope review, F6E2B IPC/preload/types worker approved |
| F8B local update diagnostic UI scope review | `integrated_docs_only` | docs-only scope review, F8B1 renderer-local worker approved and later closed in Wave 13 |
| F6E2B delivery IPC/preload/types exposure | `integrated_validated_selective` | focused IPC/preload tests, integration/use-case tests, typecheck, lint, full test, build, independent review with selective judge resolution |
| F8B1 local update diagnostic renderer blocked-state | `integrated_validated_selective` | focused renderer/local-contract tests, typecheck, lint, full test, build, smoke visual, smoke Electron UI, independent review with selective judge resolution |
| Post Local Base Regate CSV input intake hardening | `integrated_validated` | focused ingestion/process tests, typecheck, lint, full test, smoke CSV mock, smoke Electron UI mock, independent review after rework |
| P3 Renderer Missing Column Normalizer | `integrated_validated` | focused app-helper test, typecheck, lint, full test, smoke visual, smoke Electron UI, independent review |
| testing_infra_coverage_gate | `integrated_validated_pass_with_risk` | coverage provider/script, required quality-gate coverage, scoped worktree ratchet, direct preload test, full tests, typecheck, lint, build, CSV/Electron/visual smokes, independent review |
| Post P3 Legacy Resume Copy Harness Polish | `integrated_validated` | focused renderer tests, Electron smoke UI `mock` and `base-publica-local`, smoke visual, lint, typecheck, full test, coverage, scoped ratchet, build, independent review |

Wave 1 receipt: `results/integration-wave-1-f1-f2-f4.md`.
Wave 2 receipt: `results/integration-wave-2-f3-f5.md`.
Wave 3 receipt: `results/integration-wave-3-f6a-f7a.md`.
Wave 4 receipt: `results/integration-wave-4-f6b-f6c.md`.
F6D scope review: `results/phase-6d-runtime-owner-scope-review.md`.
Wave 6 receipt: `results/integration-wave-6-f6d-runtime-wiring.md`.
Wave 7 receipt: `results/integration-wave-7-scope-reviews.md`.
Wave 8 partial receipt: `results/integration-wave-8-f6e1-export-contract.md`.
Wave 8 receipt: `results/integration-wave-8-f6e1-f7b.md`.
Wave 9 receipt: `results/integration-wave-9-scope-reviews.md`.
Wave 10 receipt: `results/integration-wave-10-f6e2a-f8a.md`.
Wave 11 receipt: `results/integration-wave-11-scope-reviews.md`.
Wave 12 receipt: `results/integration-wave-12-f6e2b-delivery-ipc-preload.md`.
Wave 13 receipt: `results/integration-wave-13-f8b1-renderer-blocked-state.md`.
Coverage gate receipt:
`results/testing-infra-coverage-gate-canonical-integration-2026-06-13.md`.

Next integration rule: do not dispatch a new material worker until the next
scope is explicitly selected by the judge. Runtime update, diagnostic package
generation, telemetry transport, license/account behavior, IPC/preload/storage
and release configuration remain blocked for future splits.

## Post Local Base Security Regate Closeout As Of 2026-06-13 16:20

The post-local-base security re-gate completed as `approved_candidate` in thread
`019ec26a-fc9a-78b0-a632-ecfc9fafe6e3` and was accepted by the judge as
`approved_by_judge_gate_closed`.

Receipts:

- `results/first-release-post-local-base-rework-security-regate-2026-06-13.md`
- `results/first-release-post-local-base-rework-security-regate-judge-decision-2026-06-13.md`

Effect on execution:

- the specific Base Publica Local warning-log blocker is closed;
- no material feature worker was released automatically;
- a follow-up read-only/docs-only owner-window selection was dispatched as
  `post_local_base_regate_next_owner_window_selection`;
- that selection completed as `approved_scope_candidate` and the judge accepted
  it as `approved_by_judge_docs_only`;
- the next selected owner window is
  `post_local_base_regate_first_release_status_rebaseline`;
- that docs-only rebaseline completed, was imported into the canonical local
  docs and was accepted by the judge as docs-only;
- the next material phase remains blocked until a fresh read-only
  owner-window selection gate is dispatched, completed and judged.

Dispatch receipt:

- `results/post-local-base-regate-next-owner-window-selection-dispatch-2026-06-13.md`

Selection receipt:

- `results/post-local-base-regate-next-owner-window-selection-2026-06-13.md`
- `results/post-local-base-regate-next-owner-window-selection-judge-decision-2026-06-13.md`

Rebaseline receipt:

- `results/post-local-base-regate-first-release-status-rebaseline-2026-06-13.md`
- `results/post-local-base-regate-first-release-status-rebaseline-judge-decision-2026-06-13.md`

Rebaseline dispatch receipt:

- `results/post-local-base-regate-first-release-status-rebaseline-dispatch-2026-06-13.md`

Wave 13 closed F8B1 with selective integration. Its local ignored docs were
copied into the worker worktree immediately after creation to avoid the known
missing-docs blocker. The whole worker worktree was not accepted because it
inherited broad dirty state from the starting point.

## Next Owner-Window Decision As Of 2026-06-13

Current queue state:

- Approved queue: none.
- Active material queue: none.
- Pending integration queue: none.
- Final integration review: accepted by judge as
  `results/final-integration-review-judge-decision.md`.

The next safe owner window is `final_integration_review_before_any_new_feature`.
This is a review gate, not a feature worker. It should inspect the canonical
worktree/branch as one integrated app result and verify the phase receipts,
integration receipts, residual risks, ignored/local docs and selective
integrations before any new Fiscal Desk feature work is released.

F0 remains an operational sentinel. Its former blocker was accepted by the judge
because the F0 thread correctly refused to self-approve, but future blockers of
that class must still be handled explicitly by the judge before releasing
dependent work.

No new material worker was released by the 2026-06-13 observation round recorded
in `results/next-owner-window-observation-2026-06-13.md`.
The final review gate was dispatched afterward and recorded in
`results/final-integration-review-dispatch-2026-06-13.md`.
The reviewer returned `approved_candidate`, and the judge accepted the review in
`results/final-integration-review-judge-decision.md`.

This acceptance makes the next Fiscal Desk work item eligible for fresh scoping,
but no new material worker is released automatically. The judge must first close
the broad dirty package through staging/versioning or explicitly select a fresh
owner window that does not collide with the integrated package.

## Staging Versioning Closeout As Of 2026-06-13

The judge selected staging/versioning closeout as the next non-material gate
before any new feature worker. Thread `019ec00d-c200-7dc0-87fc-c40d141ea7cb`
completed in `/Users/icaroaguiar/.codex/worktrees/ce1f/consulta-simples-csv`.

The closeout receipt is `results/staging-versioning-closeout.md` and the judge
accepted it in `results/staging-versioning-closeout-judge-decision.md`.

No stage, commit, push, PR or deploy action was executed. The closeout only
classified the broad dirty package, listed recommended inclusions and mandatory
exclusions, proposed path-explicit stage commands and recorded residual risks.

The approved closeout now authorizes the primary orchestrator to run the
path-explicit staging action from `results/staging-versioning-closeout.md`.
This removes the extra manual gate that was keeping the project in an artificial
blocked state after F0, final review and staging closeout had all been accepted.

After the path-explicit stage set is applied and cached validation passes, the
current integrated phase package is considered closed. The next material worker
may then be scoped by the judge as a fresh owner window. If cached validation
fails or excluded paths appear in the staged diff, the staging action becomes a
formal blocker and no new material worker may start.

Runtime update behavior, diagnostic package generation, telemetry transport,
license/account behavior, updater metadata, release/package configuration,
storage or network behavior remain blocked for future splits. Guided delivery
customization, renderer template UI and reusable delivery models also require a
fresh scope/owner-window decision before material work.

## Staging Authorization Correction As Of 2026-06-13 12:00

The orchestration plan previously treated the approved staging/versioning
closeout as another manual decision point. That was too conservative for the
agreed operating model: the primary orchestrator is the judge for this package.

Default rule going forward:

1. If final integration review is `approved_by_judge` and staging/versioning
   closeout is `approved_by_judge`, the orchestrator may execute the approved
   path-explicit staging action.
2. The orchestrator must immediately validate the cached diff and record the
   result before committing, opening a PR or releasing another material worker.
3. A new material worker may be opened only after the staged package validates
   or after the judge records a formal blocker/deferral with explicit risk.

Authorization receipt:
`results/staging-action-authorization-2026-06-13.md`.

## Staging Execution Passed As Of 2026-06-13 12:21

The authorized path-explicit staging action was executed and validated in the
canonical worktree. Receipt:
`results/staging-execution-2026-06-13.md`.

Result: `staged_validation_passed`.

The staging gate is closed for orchestration purposes. The next material Fiscal
Desk work may now be selected only as a fresh owner window with explicit allowed
writes and with runtime update, diagnostic package generation, telemetry,
license/account, release/package configuration, storage/network expansion,
guided delivery customization, renderer template UI and reusable delivery
models still blocked until explicitly scoped.

Monitoring is active through the `fiscal-desk-f0-monitor` heartbeat, scheduled
every 30 minutes for this orchestrator thread.

## Post-Commit Closeout As Of 2026-06-13 12:43

The integrated package is now committed on the single final branch
`feat/fiscal-desk-local-base-prep`.

Current closeout receipt:
`results/post-commit-closeout-2026-06-13.md`.

Current commits:

- `bf2db8f feat: integrate fiscal desk phases`;
- `fdee157 test: record fiscal desk coverage audit`.

No push, PR, deploy or release action was executed.

Only intentionally excluded `skills/**` paths remain untracked in the worktree.
They are not part of the integrated package.

The non-feature testing-infra coverage gate was later selected, executed,
reviewed and integrated. The next material work now requires a fresh
judge-selected owner window.

## Testing-Infra Coverage Gate History As Of 2026-06-13 13:40

The judge selected the non-feature `testing_infra_coverage_gate` owner window
after post-commit closeout and coverage/testability audit. This is not a Fiscal
Desk product feature.

Thread: `019ec1c2-abc1-7ce2-8b68-212c2e152a19`.

Worktree: `/Users/icaroaguiar/.codex/worktrees/3547/consulta-simples-csv`.

Dispatch receipt:
`results/testing-infra-coverage-gate-dispatch-2026-06-13.md`.

Allowed scope is limited to `package.json`, `pnpm-lock.yaml`,
`vitest.config.ts` if needed, `docs/ai/quality-gate/quality-gate.config.json`,
`docs/ai/quality-gate/README.md` if needed, `test/unit/preload.test.ts` and
`results/testing-infra-coverage-gate.md` in the worker result packet.

The worker was not allowed to touch runtime/product code, renderer UI,
providers, IPC handlers, export, ingestion, release/update, diagnostics,
telemetry, license/account behavior, generated coverage artifacts, dist
artifacts, stage, commit, push, PR or deploy.

Current status: `integrated_validated_pass_with_risk`.

Closeout receipts:

- `results/testing-infra-coverage-gate-canonical-integration-2026-06-13.md`
- `results/testing-infra-coverage-gate-canonical-review-2026-06-13.md`

## Monitoring Observation As Of 2026-06-13 14:00

Receipt: `results/orchestration-observation-2026-06-13-1400.md`.

The coverage worker, independent coverage review, canonical coverage review and
final integration review threads were rechecked and are idle/completed. No
active material queue, approved queue or pending integration queue exists.

No new material Fiscal Desk worker was released in this observation. The next
worker still requires a fresh judge-selected owner window with explicit allowed
writes and qualitative behavior validation obligations. Runtime update,
diagnostic package generation, telemetry transport, license/account behavior,
release/package configuration, storage/network expansion, guided delivery
customization, renderer template UI and reusable delivery models remain blocked
until explicitly scoped.

## First Release Rebaseline Dispatch As Of 2026-06-13 14:06

Receipt: `results/first-release-rebaseline-dispatch-2026-06-13.md`.

The judge selected `first_release_rebaseline_after_integrated_fiscal_desk` as
the next owner window and dispatched it as a docs-only thread:
`019ec1f1-82b7-77d0-93ba-a85c07efacd8`, worktree
`/Users/icaroaguiar/.codex/worktrees/8bf3/consulta-simples-csv`.

This window may update first-release/status/product-scope documentation only.
It may not touch source, tests, package/lockfile, release config or orchestration
state. It exists to remove historical drift before any new material feature
worker is selected.

No material worker is released while this docs-only owner window is active. The
next material owner window requires the rebaseline result to be read and judged.

The first worker pass hit the known local-doc bootstrap issue because
`CONTEXT.md`, `docs/fiscal-desk/**` and `docs/adr/**` were not present in the
new worktree. The judge copied those local required docs into the worker
worktree and sent a rework instruction at `2026-06-13 14:08:36 -03`. This is a
worktree-preparation fix, not an acceptance of the worker result.

## First Release Rebaseline Judge Decision As Of 2026-06-13 14:21

Receipt:
`results/first-release-rebaseline-judge-decision-2026-06-13.md`.

The docs-only owner window
`first_release_rebaseline_after_integrated_fiscal_desk` was accepted after one
factual rework requested by the judge. The worker corrected the Wave 13 receipt
path to `results/integration-wave-13-f8b1-renderer-blocked-state.md` and aligned
coverage branches to `75.32%` from the judge's fresh `pnpm test:coverage` run.

The accepted worker result is:
`results/first-release-rebaseline-2026-06-13.md`.

The canonical worktree was updated with the rebaselined local docs under
`docs/fiscal-desk/**`, but that folder remains ignored by `.git/info/exclude`
and was not force-added to Git. The versioned orchestration record is the
worker receipt plus this judge decision.

No material worker was released by this acceptance. The current phase is now
post-rebaseline owner-window selection. The recommended next material owner
window is `f6e2c_renderer_delivery_selection_ui`; it still requires a fresh
`/goal`, explicit allowed writes, smoke Electron obligations, visual smoke,
tests and independent review before it can be considered accepted.

## Phase 6E2C Dispatch As Of 2026-06-13 14:26

Receipt:
`results/phase-6e2c-renderer-delivery-selection-ui-dispatch-2026-06-13.md`.

The judge opened the next material owner window
`f6e2c_renderer_delivery_selection_ui` in thread
`019ec204-2c67-7f92-84d6-c9433bd84a0c`, worktree
`/Users/icaroaguiar/.codex/worktrees/634f/consulta-simples-csv`.

This worker must audit first because the current renderer already exposes a
delivery format select and the Electron smoke already exercises XLSX. If no
gap remains, the correct result is a no-code candidate with evidence. If a real
gap remains, the allowed writes are limited to renderer UI/sync/types, focused
renderer tests and the F6E2C receipt.

No source outside renderer UI/tests may be touched. Acceptance still requires
judge review, qualitative Electron smoke, visual smoke and independent review
if material code changed.

## Phase 6E2C Judge Decision As Of 2026-06-13 14:33

Receipt:
`results/phase-6e2c-renderer-delivery-selection-ui-judge-decision-2026-06-13.md`.

F6E2C was accepted as `approved_by_judge_no_code`. The worker audited the
renderer and found no remaining gap: the app already exposes the `Arquivo final`
CSV/XLSX selector, propagates `deliveryFormat` to processing, synchronizes the
visible state, and the Electron smoke selects `xlsx` and validates a real
`.xlsx` output with history/checkpoint.

The only integrated artifact is the worker receipt:
`results/phase-6e2c-renderer-delivery-selection-ui.md`.

No source or test code changed. The judge revalidated with
`pnpm exec vitest run test/unit/app-view.test.ts` and `pnpm smoke:electron-ui`
on the canonical branch. The queue is back to fresh owner-window selection;
no next material worker is released by this acceptance.

## Orchestration Observation As Of 2026-06-13 14:38

Receipt:
`results/orchestration-observation-2026-06-13-1438.md`.

The current state is post-F6E2C and pre-next-owner-window selection. No material
worker is active, the F6E2C thread is idle, and no pending approved integration
queue remains in the orchestration package.

Do not treat F0 or the coverage gate as the current blocker. F0 remains an
operational sentinel, coverage remains an active quality signal, and future
feature work still needs a fresh judge-selected owner window before any
subagent/thread is released.

## Post-F6E2C Next Owner Window Selection Dispatch As Of 2026-06-13 14:43

Receipt:
`results/post-f6e2c-next-owner-window-selection-dispatch-2026-06-13.md`.

The judge opened a docs-only scope-review window
`post_f6e2c_next_owner_window_selection` in thread
`019ec213-dd46-7202-a1fd-5747d3376844`, title
`Definir próxima owner window`, worktree
`/Users/icaroaguiar/.codex/worktrees/3316/consulta-simples-csv`.

This window exists because the rebaselined first-release docs still recommended
F6E2C, but F6E2C has now closed as `approved_by_judge_no_code`. The scope review
must recommend the next owner window and exact allowed writes before any new
material worker is released.

No material worker is released by this dispatch. Runtime update, diagnostic
package generation, telemetry transport, license/account behavior,
release/package configuration, storage/network expansion, guided delivery
customization, renderer template UI, reusable delivery models and PDF/Word/OCR
remain blocked until a fresh scope is judged.

## Post-F6E2C Next Owner Window Selection Judge Decision As Of 2026-06-13 14:47

Receipt:
`results/post-f6e2c-next-owner-window-selection-judge-decision-2026-06-13.md`.

The docs-only scope review completed in thread
`019ec213-dd46-7202-a1fd-5747d3376844` with result
`approved_scope_candidate`. The judge accepts the result as
`approved_by_judge_docs_only`.

Accepted next owner window:
`post_f6e2c_first_release_status_rebaseline`.

This next window is docs-only and exists to remove stale local product-doc
language that still recommends F6E2C after F6E2C closed as no-code. It does not
release material feature work. Material workers remain blocked until that docs
rebaseline is completed and judged. After that, the recommended gate is split
read-only release/security review for the first release candidate.

## Post-F6E2C First Release Status Rebaseline Dispatch As Of 2026-06-13 14:49

Receipt:
`results/post-f6e2c-first-release-status-rebaseline-dispatch-2026-06-13.md`.

The judge opened the accepted docs-only owner window
`post_f6e2c_first_release_status_rebaseline` in thread
`019ec21a-b297-7402-96f8-cf3eb791aa93`, title
`Atualiza status do primeiro release`, worktree
`/Users/icaroaguiar/.codex/worktrees/2c9e/consulta-simples-csv`.

This window may update local product docs only:
`docs/fiscal-desk/first-release.md`, `docs/fiscal-desk/status.md`,
`docs/fiscal-desk/product-spec.md` if needed, and its own result receipt.

No material worker is released. The next gate after this rebaseline, if judged
accepted, is expected to be read-only first-release release/security review.

## Post-F6E2C First Release Status Rebaseline Judge Decision As Of 2026-06-13 14:55

Receipts:
`results/post-f6e2c-first-release-status-rebaseline-2026-06-13.md` and
`results/post-f6e2c-first-release-status-rebaseline-judge-decision-2026-06-13.md`.

The docs-only rebaseline completed in thread
`019ec21a-b297-7402-96f8-cf3eb791aa93` with result
`ready_for_judge_review`. The judge accepts the result as
`approved_by_judge_docs_only`.

This closes the stale-doc window that still pointed to F6E2C as the next owner
window after F6E2C was accepted no-code. The canonical local product docs now
point to `first_release_candidate_release_security_review` as the next
read-only gate.

No material worker is released by this acceptance. Material work remains
blocked until the release/security review gate is run and judged.

## First Release Candidate Release/Security Review Dispatch As Of 2026-06-13 15:01

Receipt:
`results/first-release-candidate-release-security-review-dispatch-2026-06-13.md`.

The judge opened the accepted read-only gate
`first_release_candidate_release_security_review` as two independent threads:

- release review:
  `019ec224-8c95-7ff3-b482-68fdde82dd74`, worktree
  `/Users/icaroaguiar/.codex/worktrees/55c0/consulta-simples-csv`;
- security review:
  `019ec225-2895-79c3-9858-88822540126d`, worktree
  `/Users/icaroaguiar/.codex/worktrees/e6ee/consulta-simples-csv`.

The split is safe because both threads are read-only and write distinct result
receipts. No material worker is released. Material work remains blocked until
both receipts are complete and judged.

## First Release Candidate Release/Security Review Judge Decision As Of 2026-06-13 15:09

Receipts:

- `results/first-release-candidate-release-review-2026-06-13.md`;
- `results/first-release-candidate-security-review-2026-06-13.md`;
- `results/first-release-candidate-release-security-review-judge-decision-2026-06-13.md`.

Both read-only gates completed and were accepted as valid evidence. The judge
decision is `needs_rework_blocker_formal`.

The release review passed bootstrap/typecheck/lint/test/build but found first
release gaps in package identity, publish safety for `dist:mac`, and CI
coverage/smoke Electron policy.

The security review passed bootstrap plus focused security/privacy tests and
found first release privacy gaps in runtime logs, execution ledger checkpoints,
provider `raw` persistence and local storage policy.

No material worker is released by this decision. The next selected owner
windows are:

- `first_release_local_privacy_hardening`;
- `first_release_package_identity_and_publish_safety`.

They may be dispatched concurrently only while their allowed write scopes remain
disjoint. Integration and acceptance remain serial and judge-gated in the final
branch.

## First Release Rework Owner Windows Dispatch As Of 2026-06-13 15:13

Receipt:
`results/first-release-rework-owner-windows-dispatch-2026-06-13.md`.

The judge opened two rework owner windows selected by the judged
release/security gate:

- `first_release_local_privacy_hardening`, thread
  `019ec230-33f3-7d63-87ee-85e957bce7c4`, worktree
  `/Users/icaroaguiar/.codex/worktrees/15ad/consulta-simples-csv`;
- `first_release_package_identity_and_publish_safety`, thread
  `019ec230-9f62-7cb0-bc46-8d107a055d4b`, worktree
  `/Users/icaroaguiar/.codex/worktrees/98af/consulta-simples-csv`.

These are not new feature windows. They are first-release rework required before
release/security can be treated as ready. They may run concurrently because
their allowed write scopes are disjoint, but final integration remains serial
and judge-gated.

## First Release Rework Candidates Judge Decision As Of 2026-06-13 15:29

Receipt:
`results/first-release-rework-candidates-judge-decision-2026-06-13.md`.

The two rework threads returned candidate receipts, but the judge did not
integrate either candidate.

- `first_release_local_privacy_hardening` stayed inside its allowed write set
  and passed focused tests/typecheck/diff checks, but independent security
  review found remaining blocker findings: legacy checkpoint reuse can preserve
  `raw`, checkpoint `message` can retain provider-derived fiscal data such as
  `razaoSocial`, and ledger warning `error.message` can still include absolute
  paths.
- `first_release_package_identity_and_publish_safety` resolved the direct
  package identity, `dist:* --publish never`, and PR coverage-gate findings,
  but independent release review found a broader publish-safety gap in
  `.github/workflows/windows-exe.yml`, which can still publish GitHub releases
  and uses a legacy artifact name.

Both threads were resumed with `/goal`, GPT-5.5 and medium reasoning. The
privacy thread must correct the three security findings in the same runtime
privacy boundary. The package/release thread is reopened with expanded write
scope for `.github/workflows/windows-exe.yml`.

No material feature work is released, and no candidate code/config is integrated
into the canonical branch by this decision. The current phase remains
first-release blocker rework until both candidates return, are reviewed, and
are serially integrated into the single final branch.

## First Release Rework Integration Judge Decision As Of 2026-06-13 15:43

Receipt:
`results/first-release-rework-integration-judge-decision-2026-06-13.md`.

The two reopened first-release rework windows returned final candidates and
both passed independent re-review:

- `first_release_local_privacy_hardening` re-review
  `019ec243-9bd5-7283-a967-8151f3d29aeb`: `approved_candidate`;
- `first_release_package_identity_and_publish_safety` re-review
  `019ec242-a827-72d0-b499-b13f7dbc3fa8`: `approved_candidate`.

The judge integrated both accepted reworks into the canonical branch
`feat/fiscal-desk-local-base-prep` and validated them in the single worktree.

Canonical validation passed:

- frozen install, typecheck, lint, focused ledger/IPC tests, full test,
  coverage, build;
- `smoke:real-csv` with provider `mock`;
- `smoke:electron-ui` with provider `mock`;
- `smoke:electron-ui` with provider `base-publica-local`;
- release publish scans and log/privacy scans.

The `package.json` change is intentional metadata/scripts/publish-safety work:
the package is now `fiscal-desk`, `private: true`, and all `dist:*` scripts are
no-publish. `pnpm-lock.yaml` is unchanged and `pnpm install --frozen-lockfile`
passed.

No new feature worker is released by this decision. The next step is a fresh
read-only post-rework release/security gate against the canonical branch. Only
after that gate is complete and judged can the orchestrator select the next
material owner window.

## First Release Post-Rework Release/Security Review Dispatch As Of 2026-06-13 15:49

Receipt:
`results/first-release-post-rework-release-security-review-dispatch-2026-06-13.md`.

The judge opened the post-rework read-only gate as two independent threads:

- release review:
  `019ec250-960e-77a0-a7f0-e9334ea21646`, worktree
  `/Users/icaroaguiar/.codex/worktrees/aea7/consulta-simples-csv`;
- security review:
  `019ec250-ce73-78c3-9660-a7e5122b3417`, worktree
  `/Users/icaroaguiar/.codex/worktrees/d0d5/consulta-simples-csv`.

Both threads use GPT-5.5 with medium reasoning and can run concurrently because
they are read-only and write distinct receipts. No material feature work is
released until both receipts are complete and judged.

## Post-Rework Gate Blocker: Local Public Base Logs As Of 2026-06-13 15:55

During the post-rework security review, the reviewer surfaced a real privacy
gap outside the earlier ledger/IPC rework boundary:
`src/core/public-base/local-public-base.store.ts` still logs the local
`indexPath` and raw `error.message` in Base Publica Local warnings.

The judge confirmed this in the canonical branch. Because Base Publica Local is
a supported first-release flow, no material feature work is released. The judge
opened a narrow rework owner window:

- slug: `first_release_local_public_base_log_privacy_hardening`;
- pending worktree: `local:7e3204d0-6f81-4075-974c-30e1443d541a`;
- model: GPT-5.5, reasoning medium;
- allowed write: `src/core/public-base/local-public-base.store.ts`,
  `test/unit/local-public-base.test.ts`, and
  `results/first-release-local-public-base-log-privacy-hardening-2026-06-13.md`.

As of 2026-06-13 16:05 -03, the first pending worktree
`local:44d7a4bb-ee11-450d-ab76-44706463f61c` had not materialized in the
Codex App thread/worktree list. The judge recreated the same narrow owner
window as `local:7e3204d0-6f81-4075-974c-30e1443d541a`. The release reviewer
receipt is now available as
`results/first-release-post-rework-release-review-2026-06-13.md`; the security
reviewer receipt is captured as
`results/first-release-post-rework-security-review-2026-06-13.md`. Both are gate
inputs only. They do not release material feature work.

After that rework is accepted and integrated, the orchestrator must repeat or
complete the security gate before selecting the next material phase.

## Local Public Base Log Privacy Hardening Integration As Of 2026-06-13 16:15

Receipt:
`results/first-release-local-public-base-log-privacy-hardening-judge-decision-2026-06-13.md`.

The worker `019ec25e-b6af-72b2-90be-12401311ced2` returned
`ready_for_judge_review` from worktree
`/Users/icaroaguiar/.codex/worktrees/1333/consulta-simples-csv`. The
independent reviewer `019ec263-eab5-77f3-aca3-c64d39d684e2` returned
`approved_candidate`.

The judge integrated the accepted files into the canonical branch:

- `src/core/public-base/local-public-base.store.ts`;
- `test/unit/local-public-base.test.ts`;
- `results/first-release-local-public-base-log-privacy-hardening-2026-06-13.md`;
- `results/first-release-local-public-base-log-privacy-hardening-review-2026-06-13.md`.

Canonical scan confirms that `indexPath: this.indexPath` and `error.message` no
longer appear in the Base Publica Local warning surface. Only three
`logger.warn` calls remain, each with non-sensitive categorical `reason`
metadata.

The harness warning `magic_string_boundary=2` is documented in the judge
decision. The remaining reason literals are local sanitization categories, not
boundary-defining auth, tenancy, permission, API, storage isolation, provider,
or external contract strings.

Canonical dependency-backed tests were not rerun after integration because the
canonical worktree has no `node_modules` and the volume has only about 275 MB
available. Worker evidence remains strong for this narrow integration:
focused local-base tests, `typecheck`, `lint`, and full `pnpm test` all passed
before integration, and the canonical files are byte-identical to the approved
worker files.

No material feature work is released. The next required step is to repeat or
explicitly close the post-rework security gate against the integrated canonical
branch.

## Post Local Base Rework Security Regate Dispatch As Of 2026-06-13 16:17

Receipt:
`results/first-release-post-local-base-rework-security-regate-dispatch-2026-06-13.md`.

The judge dispatched a read-only security re-gate against canonical commit
`946c578 fix: sanitize local public base warnings`.

- pending worktree: `local:0b9483ed-b82a-4abe-be55-16f772168f93`;
- allowed write:
  `results/first-release-post-local-base-rework-security-regate-2026-06-13.md`;
- reviewer role: validate the integrated Base Publica Local warning-log
  hardening and return `approved_candidate`, `needs_rework`, or `blocked`;
- constraints: no install/full test/build/coverage because disk is critically
  low.

Material feature work remains blocked until this re-gate is complete and judged.

## Post P3 Readiness Validation Docs Rebaseline Judge Decision As Of 2026-06-13 18:42

Receipt:
`results/post-p3-readiness-first-release-validation-docs-rebaseline-judge-decision-2026-06-13.md`.

The docs-only worker `019ec2ec-4d33-7233-9555-d97ec33bb913` returned
`ready_for_judge_review` from worktree
`/Users/icaroaguiar/.codex/worktrees/cf27/consulta-simples-csv`.

The judge accepted and integrated only:

- `docs/qa/first-release-validation.md`;
- `results/post-p3-readiness-first-release-validation-docs-rebaseline-2026-06-13.md`.

This closes the stale validation-doc gap found after the post-P3 readiness
review. The public validation doc now treats `pnpm test:coverage`,
`coverage/coverage-summary.json`, and `coverage/lcov.info` as active coverage
gate evidence, while preserving that coverage is not sufficient functional
proof. CSV, Electron and visual smokes remain qualitative obligations by
touched surface.

No code, tests, package, workflow, release config, distribution, telemetry,
diagnostic, license/account, PDF/Word/OCR, Receita Web live/massiva or
`docs/fiscal-desk/**` change is released by this decision. Material feature work
remains blocked until a fresh read-only owner-window selection is dispatched and
judged against this rebaselined branch.

## Post P3 Validation Docs Rebaseline Next Owner Window Selection Dispatch As Of 2026-06-13 18:44

Receipt:
`results/post-p3-validation-docs-rebaseline-next-owner-window-selection-dispatch-2026-06-13.md`.

The judge prepared a fresh read-only owner-window selection after accepting the
validation-doc rebaseline at commit `aea3596`.

This selection is not material feature work. Its role is to choose exactly one
next owner window against the current canonical branch, with an explicit bias
toward a material executable window if no concrete docs/gate blocker remains.

Material feature work remains blocked until this read-only selection returns a
candidate receipt and the judge accepts it.

As of 2026-06-13 18:47 -03, the selection is active:

- pending worktree: `local:ec8e0abd-9322-4bb2-955e-a57bd81ae1d4`;
- thread: `019ec2f3-4573-7462-9125-2e2103845da3`;
- title: `Selecionar próxima janela de owner`;
- worktree: `/Users/icaroaguiar/.codex/worktrees/c7cb/consulta-simples-csv`;
- target dispatch commit: `38e7657`.

## Post P3 Validation Docs Rebaseline Next Owner Window Selection Judge Decision As Of 2026-06-13 18:50

Receipt:
`results/post-p3-validation-docs-rebaseline-next-owner-window-selection-judge-decision-2026-06-13.md`.

The read-only selection thread `019ec2f3-4573-7462-9125-2e2103845da3` returned
`approved_scope_candidate` and selected:

`post_p3_validation_docs_rebaseline_integrated_first_release_validation`.

The judge accepts this as an executable validation window, not a feature window
and not a release/distribution window. Its purpose is to run fresh local
evidence on the integrated first-release candidate after the public validation
doc was rebaselined.

Persistent writes for the next thread are limited to its result receipt.
Generated outputs such as `coverage/**`, `dist/**`, `dist-electron/**`, `.vite/**`
and `/private/tmp/**` are allowed only as transient validation artifacts in the
isolated worktree; they must not be staged or integrated.

Material feature work, release/public distribution, updater, telemetry,
diagnostic sending, license/account, templates/models, PDF/Word/OCR and Receita
Web live/massiva remain blocked.

## Post P3 Integrated First Release Validation Thread Active As Of 2026-06-13 18:54

The judge dispatched the executable validation window selected above:

- slug: `post_p3_validation_docs_rebaseline_integrated_first_release_validation`;
- pending worktree: `local:88943199-03b4-4571-9578-25c72ac84502`;
- thread: `019ec2fa-65ee-7380-b705-d7ee0000a93b`;
- title: `Validar candidato release local`;
- worktree: `/Users/icaroaguiar/.codex/worktrees/ef92/consulta-simples-csv`;
- prompt target commit: `4d40402`;
- dispatch file:
  `results/post-p3-validation-docs-rebaseline-integrated-first-release-validation-dispatch-2026-06-13.md`.

This thread may generate ignored transient validation artifacts in its isolated
worktree, but the only persistent accepted output is its result receipt.

## Post P3 Integrated First Release Validation Judge Decision As Of 2026-06-13 19:04

Receipt:
`results/post-p3-validation-docs-rebaseline-integrated-first-release-validation-judge-decision-2026-06-13.md`.

The executable validation worker
`019ec2fa-65ee-7380-b705-d7ee0000a93b` returned `needs_rework`. The judge
accepted the functional evidence but did not approve the window.

This means the orchestration is no longer in a documentation phase. The docs
rebaseline is closed. The active blocker is a quality-gate/structural ratchet:
the integrated package increased large files from baseline 2 to current 4.

Accepted executable evidence includes lint, typecheck, full tests,
`test:coverage`, CSV smoke, Electron UI smoke with provider `mock`, Electron UI
smoke with provider `base-publica-local`, visual smoke, build and gitleaks.

The worker failed the default ratchet, and the judge also re-ran
`QUALITY_GATE_DIFF_MODE=worktree node docs/ai/quality-gate/check-ratchet.mjs`.
The scoped mode also failed with `code.large-file-ratchet`, so this is not only
historical `origin/main...HEAD` noise.

Material feature work remains blocked. The next owner window is a narrow
quality-gate rework to reduce or explicitly justify the new large-file count,
followed by independent review before integration.

## Post P3 Large File Ratchet Rework Dispatch As Of 2026-06-13 19:06

Receipt:
`results/post-p3-integrated-validation-large-file-ratchet-rework-dispatch-2026-06-13.md`.

The judge prepared a non-feature material rework window:
`post_p3_integrated_validation_large_file_ratchet_rework`.

This is not a documentation phase and not a feature phase. It is a quality-gate
rework required before the integrated candidate can be considered closed.

The allowed write set is limited to splitting/refactoring the current large
files and writing the worker receipt. Updating
`docs/ai/quality-gate/baseline.json` or
`docs/ai/quality-gate/quality-gate.config.json` is explicitly forbidden in this
window.

Material feature work remains blocked until the rework is returned, reviewed
independently and judged.

As of 2026-06-13 19:07 -03, the rework thread is active:

- pending worktree: `local:52527a7b-2ace-4877-8c13-31dc07e0089c`;
- thread: `019ec305-fa0a-7562-8be4-117cb42ce33d`;
- title: `Rework ratchet large files`;
- worktree: `/Users/icaroaguiar/.codex/worktrees/c980/consulta-simples-csv`;
- target dispatch commit: `63b7d21`.

## Post P3 Large File Ratchet Rework Review Dispatch As Of 2026-06-13 19:13

Receipt:
`results/post-p3-integrated-validation-large-file-ratchet-rework-review-dispatch-2026-06-13.md`.

The worker returned `ready_for_judge_review` and the judge prepared an
independent review before integration. The candidate is not integrated yet.

Worker evidence says focused tests, lint, typecheck, full tests,
`test:coverage`, and scoped quality gate passed. Large files dropped to 1
against baseline 2. The default quality gate still reports only the contextual
`origin/main...HEAD` git diff failure.

Material feature work remains blocked until review and judge integration.

As of 2026-06-13 19:14 -03, the review thread is active:

- pending worktree: `local:9b5ed722-561f-41e9-a703-543a4b7cacd5`;
- thread: `019ec30c-f33a-7700-999c-10e6944757fb`;
- title: `Review rework large files`;
- worktree: `/Users/icaroaguiar/.codex/worktrees/65fa/consulta-simples-csv`;
- target dispatch commit: `9386bb2`.

## Post P3 Large File Ratchet Rework Integration Judge Decision As Of 2026-06-13 19:22

Receipt:
`results/post-p3-integrated-validation-large-file-ratchet-rework-integration-judge-decision-2026-06-13.md`.

The independent review returned `approved_candidate` with no P0/P1/P2/P3
blockers. The judge integrated the rework into the canonical branch
`feat/fiscal-desk-local-base-prep` and validated it in the final worktree.

Canonical evidence:

- focused tests: 5 files, 56 tests passing;
- `pnpm lint`: pass;
- `pnpm typecheck`: pass;
- `pnpm test`: 42 files, 264 tests passing;
- `pnpm test:coverage`: 42 files, 264 tests passing, 69.86% lines/statements,
  87.21% functions and 75.79% branches;
- `QUALITY_GATE_DIFF_MODE=worktree node docs/ai/quality-gate/check-ratchet.mjs`:
  pass, large files 1 against baseline 2;
- default ratchet: contextual fail only on `origin/main...HEAD`, without
  `code.large-file-ratchet`;
- `git diff --check`: pass;
- no diff in quality-gate baseline/config, package or lockfile.

This closes the structural large-file blocker. The project is not in a
documentation phase now, but material feature work remains blocked until the
judge dispatches and accepts a fresh read-only owner-window selection.

## Post P3 Large File Rework Next Owner Window Selection Dispatch As Of 2026-06-13 19:24

Receipt:
`results/post-p3-large-file-ratchet-rework-next-owner-window-selection-dispatch-2026-06-13.md`.

The next action is a read-only owner-window selection:
`post_p3_large_file_ratchet_rework_next_owner_window_selection`.

This selection must decide the next safe recorte after the docs rebaseline,
integrated executable validation and large-file ratchet rework are all closed.
It may write only its receipt. It cannot edit code, tests, configs, package,
lockfile, release/update/diagnostic/telemetry/license surfaces, renderer, IPC,
preload, providers or local ignored `docs/fiscal-desk/**`.

No material worker is released by preparing this dispatch.

As of 2026-06-13 19:26 -03, the selection thread is active:

- pending worktree: `local:dd4c01d5-1bd2-4f41-8fec-6348729d09da`;
- thread: `019ec317-9bd7-7fa3-82b3-7c5f431e5a26`;
- title: `Selecionar owner pos ratchet`;
- worktree: `/Users/icaroaguiar/.codex/worktrees/029c/consulta-simples-csv`;
- canonical dispatch commit: `55145bd`.

## Post P3 Large File Rework Next Owner Window Selection Judge Decision As Of 2026-06-13 19:31

Receipt:
`results/post-p3-large-file-ratchet-rework-next-owner-window-selection-judge-decision-2026-06-13.md`.

The selection thread `019ec317-9bd7-7fa3-82b3-7c5f431e5a26` completed as
`approved_scope_candidate`. The judge accepts it.

Next authorized owner window:
`post_p3_large_file_ratchet_rework_final_readiness_review`.

Classification: `read-only review`.

This does not release material feature work. It authorizes a final readiness
review after the large-file ratchet rework, writing only its receipt, to decide
whether the roadmap can return to material work or whether a concrete blocker
remains.

## Post P3 Large File Rework Final Readiness Review Dispatch As Of 2026-06-13 19:34

Receipt:
`results/post-p3-large-file-ratchet-rework-final-readiness-review-dispatch-2026-06-13.md`.

The judge prepared the selected read-only review:
`post_p3_large_file_ratchet_rework_final_readiness_review`.

Allowed write:
`results/post-p3-large-file-ratchet-rework-final-readiness-review-2026-06-13.md`.

No material worker is released by this dispatch.

As of 2026-06-13 19:39 -03, the review thread is active:

- pending worktree: `local:0265dc7b-5bb1-4d83-8461-6b6e03fc1439`;
- thread: `019ec31c-9f9d-7482-9ba6-79ef5da19dca`;
- title: `Review prontidao pos ratchet`;
- worktree: `/Users/icaroaguiar/.codex/worktrees/dff9/consulta-simples-csv`;
- canonical dispatch commit: `4ff5955`.

## Post P3 Large File Rework Final Readiness Review Judge Decision As Of 2026-06-13 19:47

Receipt:
`results/post-p3-large-file-ratchet-rework-final-readiness-review-judge-decision-2026-06-13.md`.

The final readiness review thread `019ec31c-9f9d-7482-9ba6-79ef5da19dca`
completed as `approved_candidate`, and the judge accepted it.

Current state:

- documentation rebaseline: closed;
- executable validation: accepted;
- large-file ratchet blocker: closed;
- final post-ratchet readiness review: accepted;
- material feature worker: not automatically released;
- next action: select a specific material owner window with explicit allowed
  writes.

Release/public distribution, updater/update real, telemetry, diagnostic
sending, license/account, templates/models, PDF/Word/OCR, Receita Web
live/massiva, storage/network expansion and guided delivery customization remain
blocked until explicit owner windows.

## Post P3 Operational Execution Panel Suggestions Dispatch As Of 2026-06-13

Receipt:
`results/post-p3-operational-execution-panel-suggestions-dispatch-2026-06-13.md`.

The judge selected the next material owner window:
`post_p3_operational_execution_panel_suggestions`.

Classification: material renderer worker.

Reason: the documentation rebaseline, executable validation, large-file ratchet
rework and final post-ratchet readiness review are closed. The packet `010`
surface is the next bounded material slice that can improve user-facing runtime
behavior without reopening F6E2C, update/release, license/account,
diagnostics/telemetry, PDF/Word/OCR, Receita Web massiva, providers or
templates/models.

Allowed writes:

- `src/renderer/ui/app-view.ts`
- `src/renderer/ui/app-sync.ts`
- `src/renderer/ui/app-refs.ts`
- `src/renderer/ui/app-helpers.ts`
- `src/renderer/ui/operational-copy.ts`
- `src/renderer/ui/app-view-lists.ts`
- `src/renderer/styles.css`
- `test/unit/renderer-operational-copy.test.ts`
- `test/unit/app-view.test.ts`
- `test/unit/app-helpers.test.ts`
- `test/unit/app-sync.test.ts`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-operational-execution-panel-suggestions-2026-06-13.md`

This worker may use only existing renderer state and already-integrated
execution/progress signals. If the implementation needs IPC/preload, main, core,
provider, ingestion/export, package/lock, release/update, telemetry,
diagnostics, license/account, storage/network, templates/models, PDF/Word/OCR
or Receita Web live/massiva, it must stop with a blocker instead of expanding
scope.

The result remains candidate-only. It requires judge inspection, canonical
verification where feasible and independent review before any material
integration is accepted.

As of this dispatch, the material worker thread is active:

- pending worktree: `local:69ad988e-c8ab-4e83-8643-1cb1098394d9`;
- thread: `019ec327-63be-7143-97ec-84bf9bd7bfd0`;
- title: `Implementa painel de sugestões`;
- worktree: `/Users/icaroaguiar/.codex/worktrees/abce/consulta-simples-csv`;
- canonical dispatch commit: `eb20ec3`.

The worker reported that `CONTEXT.md`, packet `010` and `.visual-fidelity`
references are absent from its worktree because they are local-only/ignored in
the canonical checkout. The judge sent a follow-up instruction allowing
read-only canonical absolute fallback for those paths without copying, editing
or expanding allowed writes.

## Post P3 Operational Execution Panel Suggestions Review Dispatch As Of 2026-06-13 19:57

Receipt:
`results/post-p3-operational-execution-panel-suggestions-review-dispatch-2026-06-13.md`.

The material worker returned
`results/post-p3-operational-execution-panel-suggestions-2026-06-13.md` with
status `ready_for_judge_review` in worktree
`/Users/icaroaguiar/.codex/worktrees/abce/consulta-simples-csv`.

Current state:

- documentation/planning rebaseline: closed;
- material renderer candidate: produced in isolated worker worktree;
- canonical branch integration: not started;
- independent review: dispatch prepared;
- judge decision: pending review result.

No material code is accepted or integrated by this dispatch. The reviewer may
write only:

- `results/post-p3-operational-execution-panel-suggestions-review-2026-06-13.md`.

The next orchestration step is to create and observe the reviewer thread. If it
returns `approved_candidate`, the judge may inspect and validate integration in
the final branch. If it returns `needs_rework` or `blocked`, the candidate goes
back to the worker/rework queue instead of being integrated.

As of 2026-06-13 19:59 -03, the review thread is active:

- pending worktree: `local:6d5c9bcb-69a1-43c3-a95b-a2fe722cb49f`;
- thread: `019ec335-9377-77f2-a38b-9184ee782901`;
- title: `Revisar painel operacional P3`;
- worktree: `/Users/icaroaguiar/.codex/worktrees/2e5e/consulta-simples-csv`;
- canonical dispatch commit: `c55d438`.

## Post P3 Operational Execution Panel Suggestions Judge Decision As Of 2026-06-13 20:04

Receipt:
`results/post-p3-operational-execution-panel-suggestions-judge-decision-2026-06-13.md`.

The independent review returned `approved_candidate`, but canonical integration
validation found a blocking quality-gate failure after the material patch was
temporarily applied in the final branch. The material patch was reverted before
this decision, so no candidate code is integrated.

Passing evidence before the blocker:

- focused renderer/copy/sync tests: pass, 4 files and 24 tests;
- `pnpm typecheck`: pass;
- `pnpm lint`: pass;
- `pnpm test`: pass, 42 files and 268 tests;
- `pnpm build`: pass;
- `pnpm smoke:visual`: pass;
- `pnpm smoke:electron-ui`: pass with provider `mock`;
- `FISCAL_DESK_SMOKE_PROVIDER=base-publica-local pnpm smoke:electron-ui`:
  pass outside sandbox after an initial `tsx` pipe `EPERM`;
- `pnpm test:coverage`: pass, global line coverage 73.16%.

Blocking evidence:

- `QUALITY_GATE_DIFF_MODE=worktree node docs/ai/quality-gate/check-ratchet.mjs`:
  fail;
- changed-line coverage: 53.33%, below the 70% minimum;
- large file count increased from 2 to 3;
- `src/renderer/ui/app-sync.ts`: 520 lines, above 500;
- `src/renderer/ui/app-view.ts`: 515 lines, above 500.

Decision: `needs_rework`.

The same worker window remains the active material owner, but it must rework the
candidate before any integration can be accepted. Required rework:

- keep the original allowed write set;
- reduce `app-sync.ts` and `app-view.ts` below the large-file threshold or
  otherwise close the ratchet without broadening scope;
- improve changed-line coverage to at least 70%;
- rerun the focused tests and worktree quality gate;
- preserve the passing UI/Electron smoke behavior.

Warn-only harness signals to carry into closeout:

- `magic_string_boundary=17`;
- `visual_surface_change=1`;
- legacy smoke text `uiResumeText: "1 CNPJs retomados"` remains a residual
  risk accepted only if the new panel keeps singular copy correct.

As of 2026-06-13 20:06 -03, the judge sent rework instructions back to worker
thread `019ec327-63be-7143-97ec-84bf9bd7bfd0`.

Rework remains inside the original owner window and allowed write set. No
material code is integrated in the final branch while this rework is active.

## Post P3 Operational Execution Panel Suggestions Integration As Of 2026-06-13 20:19

Receipt:
`results/post-p3-operational-execution-panel-suggestions-integration-judge-decision-2026-06-13.md`.

The worker completed the required rework as
`ready_for_judge_review_after_rework`. The judge applied the reworked material
patch in the final branch `feat/fiscal-desk-local-base-prep`, copied the
updated worker receipt and validated the integrated result in the canonical
worktree.

Canonical validation after rework:

- focused renderer/copy/sync tests: pass, 4 files and 27 tests;
- `pnpm typecheck`: pass;
- `pnpm lint`: pass, 122 files;
- `pnpm test`: pass, 42 files and 271 tests;
- `pnpm test:coverage`: pass, global line coverage 76.06%;
- `QUALITY_GATE_DIFF_MODE=worktree node docs/ai/quality-gate/check-ratchet.mjs`:
  pass, changed-line coverage 98.47% (`193/196`), large files baseline 2 and
  current 1;
- `pnpm build`: pass;
- `pnpm smoke:visual`: pass across desktop, tablet and mobile;
- `pnpm smoke:electron-ui`: pass with provider `mock` and XLSX delivery;
- `FISCAL_DESK_SMOKE_PROVIDER=base-publica-local pnpm smoke:electron-ui`: pass
  outside sandbox after the known `tsx` pipe `EPERM` sandbox failure.

Decision: `integrated_validated_after_rework`.

The previous quality-gate blocker is closed. No new material worker is released
automatically by this integration. The next step is a fresh explicit
owner-window selection or queue closeout before touching any additional
material surface.

Residual risks accepted for this integration:

- `magic_string_boundary=17` is warn-only and comes from renderer-local
  `data-slot`s used for sync/test surfaces;
- `visual_surface_change=1` is expected for the operational panel and is covered
  by visual smoke;
- legacy `uiResumeText: "1 CNPJs retomados"` remains in the smoke-bound legacy
  activity slot; the new panel uses singular copy correctly and a legacy-harness
  copy fix requires its own owner window.

## Post P3 Operational Panel Next Owner Window Selection Dispatch As Of 2026-06-13 20:23

Receipt:
`results/post-p3-operational-panel-next-owner-window-selection-dispatch-2026-06-13.md`.

The judge prepared a read-only owner-window selection after the operational
panel integration. No material worker is released by this dispatch.

Current state:

- F0 remains a historical sentinel, not an active technical blocker;
- the operational panel owner window is integrated and validated;
- the material queue is empty;
- the next action is a read-only scoping thread that must recommend exactly one
  next owner window or keep the queue blocked with concrete evidence.

The selection thread may write only:

- `results/post-p3-operational-panel-next-owner-window-selection-2026-06-13.md`.

Material work remains blocked until the selector result is judged. Release,
update real, diagnostics sending, telemetry, license/account, storage/network,
templates/models, PDF/Word/OCR and Receita Web live/massiva remain blocked
until explicit owner windows.

## F9 Speed Control Core/UI Integration As Of 2026-06-14 13:10

Receipts:

- `phases/phase-9-velocidade-controle-base-assistida.md`
- `results/phase-9a-speed-control-core-ui-2026-06-14.md`
- `results/phase-9a-speed-control-core-ui-judge-decision-2026-06-14.md`

Decision: `approved_for_f9a_f9b_only`.

The judge opened F9 after the product/runtime gap audit showed that documented
velocity, parallelization and user control were not materialized in the app. The
canonical worktree now contains the first F9 material slice:

- typed execution speed profiles;
- renderer selector for `leve`, `equilibrado`, `rapido` and `maximo`;
- IPC/preload forwarding of the selected profile;
- provider-aware concurrency resolution in `main`;
- bounded concurrent lookup queue in `processCsv`;
- CNPJa Open and Receita Web fixed at concurrency `1`;
- coordinated worker shutdown on lookup failure;
- late cancellation reflected during output assembly/finalization.

Validation:

- `pnpm lint`: pass;
- `pnpm typecheck`: pass;
- `pnpm test`: pass, 43 files and 290 tests;
- `pnpm smoke:visual`: pass across desktop, tablet and mobile;
- `pnpm smoke:electron-ui`: pass with provider `mock` and XLSX delivery;
- `git diff --check`: pass;
- independent review found two material findings in the first implementation;
- rework added focused regression coverage for worker failure and late
  cancellation;
- independent re-review confirmed both findings closed and reran the focused
  tests.

F9 remains active. The following slices are not complete and must not be marked
done without separate owner windows:

- F9C: Base Publica assisted discovery/download/streaming index;
- F9D: pause/resume fine control and stronger partial/export workflows;
- F9E: Receita Web parallel experimental mode, only after explicit new decision.

No new material phase is automatically released by this F9A/F9B approval.

## F9C1 Base Publica Official Source Discovery As Of 2026-06-14 13:25

Receipts:

- `results/phase-9c1-official-source-discovery-2026-06-14.md`

Status: `approved_for_f9c1_only`.

The canonical worktree now contains the first Base Publica assisted acquisition
slice. It discovers the Receita Federal public CNPJ monthly index, selects the
latest `Simples.zip`, and exposes file name, size, competence and publication
date in the renderer through IPC/preload.

This is intentionally not the full F9C delivery. It does not download, extract,
index or prepare the official ZIP. The manual CSV upload path remains the only
preparation path until F9C2.

Source strategy:

- do not require the user to download the 60GB `cnpj.tar.gz`;
- use the monthly `Simples.zip` first because it is the data needed for
  Consulta Simples/SIMEI;
- keep `Empresas*.zip` and `Estabelecimentos*.zip` out of F9C1 because they are
  larger adjacent datasets and require a separate indexing contract.

Validation:

- focused local-public-base/preload/view/sync tests: pass, 32 tests after
  timeout rework;
- `pnpm typecheck`: pass;
- `pnpm lint`: pass;
- `pnpm test`: pass, 43 files and 295 tests;
- `pnpm smoke:visual`: pass;
- `pnpm smoke:electron-ui`: pass, including renderer/main build and Electron UI
  smoke with provider `mock`, CSV input and XLSX delivery;
- `git diff --check`: pass.

Local live source validation is not fully green: direct fetch/curl from this
environment returned HTTP 404 from the Receita host even though the source index
was confirmed through web research. The implementation treats that as a
recoverable user-visible error and does not claim download/preparation success.

Independent review initially found one P2: a network request that never settled
could keep the UI in `loading`. Rework added per-request timeout,
`AbortController`, `Promise.race` around injected `fetchText`, and a regression
test for a never-settling request. Independent re-review found no remaining
P0-P3 issue for that P2.

Remaining F9 slices:

- F9C2: assisted/resumable download and streaming index of `Simples.zip`;
- F9D: pause/resume fine control and stronger partial/export workflows;
- F9E: Receita Web parallel experimental mode, only after explicit new decision.

## F9D1 Pause Checkpoint Control As Of 2026-06-14 13:56

Artifacts:

- `results/phase-9d1-pause-checkpoint-control-2026-06-14.md`
- `results/phase-9d1-pause-checkpoint-control-judge-decision-2026-06-14.md`

Decision: `approved_for_f9d1_only`.

The canonical worktree now contains the first F9D control slice: `Pausar` is a
dedicated UI action and IPC channel that requests cooperative stop, preserves
checkpoint when progress exists and tells the user to resume from Historico.

Important boundary: this is not in-memory suspension. It reuses the existing
safe cancellation/ledger semantics and changes user-facing intent/copy so pause
is the checkpoint path while cancel remains interruption.

Evidence accepted:

- focused F9D1 tests: pass, 6 files and 44 tests;
- `pnpm lint`: pass;
- `pnpm typecheck`: pass;
- `pnpm test`: pass, 43 files and 299 tests;
- `pnpm smoke:visual`: pass;
- `pnpm smoke:electron-ui`: pass;
- `git diff --check`: pass;
- independent review found P2/P3/P3, rework was applied, re-review returned
  `No findings` and ran 4 focused files with 32 tests passing.

Remaining F9 slices after F9D1:

- F9C2: assisted/resumable download and streaming index of `Simples.zip`;
- F9D2: strong cancel, explicit partial export and pending redistribution;
- F9E: Receita Web parallel experimental mode, only after explicit new decision.

## F9C2 Base Publica Official Download And Streaming Index As Of 2026-06-14 14:50

Artifacts:

- `results/phase-9c2-official-download-streaming-index-2026-06-14.md`
- `results/phase-9c2-official-download-streaming-index-judge-decision-2026-06-14.md`

Decision: `approved_for_f9c2_only`.

The canonical worktree now contains the second Base Publica assisted acquisition
slice. It downloads and prepares the official monthly `Simples.zip` without
requiring the 60GB `cnpj.tar.gz` bundle.

Delivered behavior:

- assisted/resumable download to local app data;
- cache metadata tied to base date, file name, file URL, last modified and
  public size label;
- cache final and `.part` accepted only after the ZIP entry `Simples.csv` is
  consumed and its uncompressed size and CRC32 match;
- source discovery restricted to same origin, monthly official path and
  `Simples.zip`, rejecting external URLs and `../`;
- main process validates consent, rediscovers the official source and compares
  accepted base date before download/preparation;
- official CSV parser reads the ZIP entry as stream and indexes records by
  CNPJ basico through the existing Base Publica Local index contract;
- renderer exposes "Baixar e preparar oficial" only after source discovery and
  explicit notice acceptance.

Accepted evidence:

- focused F9C2 tests: pass, 4 files and 50 tests;
- `pnpm lint`: pass, 128 files;
- `pnpm typecheck`: pass;
- `git diff --check`: pass;
- `pnpm test`: pass, 43 files and 316 tests;
- `pnpm build`: pass;
- `pnpm smoke:visual`: pass across desktop, tablet and mobile;
- `pnpm smoke:electron-ui`: pass with provider `mock`, CSV input, XLSX output,
  history and checkpoint.

Independent review history:

- first re-review blocked approval with P2 for ZIP payload corruption that could
  pass a stream-open check, plus P3 for source URL trust and P3 for single JSON
  persistence;
- rework added full entry consumption, CRC32/size validation, source URL
  allowlisting and regression tests for corrupt payload/cache/download and
  external/traversal links;
- second re-review returned no P0-P3 blocking findings and accepted the P3
  single JSON persistence as residual risk outside F9C2.

Residual risks accepted:

- Local Base Publica persistence still materializes records in memory and
  persists one JSON document. This is not solved by F9C2 and requires a future
  owner window for incremental/chunked persistence before broad volume claims.
- Download real from Receita remains subject to endpoint availability on the
  user's machine; local validation used fixtures and mocked fetches.
- `dependency_file_change=3` is expected for direct `yauzl` ZIP streaming and
  its types; `magic_string_boundary=13` is limited to IPC/action contracts,
  official file metadata and tests; `visual_surface_change=1` is covered by
  visual and Electron smokes.

Remaining F9 slices after F9C2:

- F9D2: strong cancel, explicit partial export and pending redistribution;
- F9E: Receita Web parallel experimental mode, only after explicit new
  decision.

## F9D2 Strong Cancel Partial Pending Export As Of 2026-06-14 15:06

Artifacts:

- `results/phase-9d2-strong-cancel-partial-pending-export-2026-06-14.md`
- `results/phase-9d2-strong-cancel-partial-pending-export-judge-decision-2026-06-14.md`

Decision: `approved_for_f9d2_only`.

The canonical worktree now contains the second F9D control slice. Interrupted
or failed executions can expose partial output and pending count in History,
and the user can export a CSV with only CNPJs still pending.

Delivered behavior:

- ledger computes checkpointed CNPJs, pending unique lookups and partial-output
  state;
- IPC channel `csv:export-pending-cnpjs` validates `ledgerKey`, blocks active
  processing, rereads the original source file and checks the fingerprint before
  exporting;
- pending CSV uses a single `cnpj` column with valid unique CNPJs not yet
  checkpointed;
- renderer History shows partial/pending state and the explicit
  `Exportar pendencias` action;
- UI actions remain disabled while processing, and rendered history does not
  expose absolute source/output paths.

Accepted evidence:

- focused F9D2 tests: pass, 5 files and 51 tests;
- `pnpm lint`: pass;
- `pnpm typecheck`: pass;
- `git diff --check`: pass;
- `pnpm test`: pass, 43 files and 319 tests;
- `pnpm build`: pass;
- `pnpm smoke:visual`: pass across desktop, tablet and mobile;
- `pnpm smoke:electron-ui`: pass with provider `mock`, CSV input, XLSX output,
  history and checkpoint;
- independent review returned no P0-P3 blocking findings and ran 6 focused
  files with 45 tests passing.

Residual risks accepted:

- pending export is intentionally CNPJ-only;
- provider/profile redistribution remains manual;
- no automatic multi-provider queue or multiple active executions were added;
- Receita Web remains assisted, serial and subject to CAPTCHA/bloqueio.

Harness warnings are documented in the F9D2 receipt. `dependency_file_change=3`
is inherited from F9C2 ZIP streaming; `magic_string_boundary=13` is limited to
IPC/action contracts, official metadata and tests; `visual_surface_change=2` is
covered by visual and Electron smokes.

Remaining F9 slice after F9D2:

- F9E: Receita Web parallel experimental mode, only after explicit fresh
  decision. It is not released by F9D2.

## F9E Receita Web Parallel Experimental Blocker As Of 2026-06-14 15:18

Artifact:

- `results/phase-9e-receita-web-parallel-experimental-blocker-2026-06-14.md`

Decision: `block_pending_explicit_decision`.

F9E is not released for implementation. The current approved product and runtime
contract keeps Receita Web assisted, experimental, serial, visible-browser,
not a batch engine, not a fallback, and not part of deterministic live smoke.

Why it is blocked:

- F9 itself says Receita Web stays serial/assisted unless a later explicit
  experimental decision is made;
- runtime still enforces one active app execution through
  `activeProcessingSession`;
- `resolveMaxConcurrentLookups` returns `1` for assisted/visible-browser/no
  batch providers;
- README and operational copy state that Receita Web has no parallelism in the
  current release;
- F7/F7B approved adapter-core assisted hardening only, not robust batch
  automation;
- multiple headed windows introduce user-computer takeover, CAPTCHA/anti-bot and
  cleanup/cancel risks that require a separate contract.

Independent judge read-only result:

- agent `019ec752-e2d0-7ca0-a75d-82ce4807b7d5`;
- Decision: `block_pending_explicit_decision`;
- P1 findings on missing release decision, conflict with `fixed_one_assisted_no_batch`,
  and unresolved CAPTCHA/anti-bot/takeover risk;
- P2 findings on adapter contract and deterministic tests currently enforcing
  serial Receita Web behavior.

Conditions to unblock are documented in the blocker artifact. The next allowed
step is a new F9E decision/contract owner window, not direct code implementation.

## F9 Integrated Readiness Audit As Of 2026-06-14 15:15

Artifact:

- `results/phase-9-integrated-readiness-audit-2026-06-14.md`

Current decision:

- F9A/F9B/F9C1/F9C2/F9D1/F9D2 are integrated and validated in the single
  canonical worktree/branch `feat/fiscal-desk-local-base-prep`;
- F9E remains formally blocked pending explicit user/product decision.

Fresh integrated gates after F9D2 and the F9E blocker:

- `pnpm typecheck`: pass;
- `pnpm test`: pass, 43 files and 319 tests;
- `pnpm build`: pass;
- `pnpm smoke:visual`: pass across desktop, tablet and mobile without overflow,
  clipped buttons or overlaps;
- `pnpm smoke:electron-ui`: pass with provider `mock`, CSV input, XLSX output,
  history, checkpoint and visible resume text.

Electron smoke run id: `06e50a9b-1194-4ffc-abd5-201e5c2349ba`.

The remaining decision is not a code failure: either keep Receita Web serial for
this release, or open a new F9E experimental contract owner window with explicit
acceptance of multi-window headed-browser risk.

## F9E Experimental Contract Window Opened As Of 2026-06-14 15:30

Artifacts:

- `contracts/phase-9e-receita-web-parallel-experimental-contract.md`
- `phases/phase-9e-receita-web-parallel-experimental-contract.md`
- `results/phase-9e-contract-window-opened-2026-06-14.md`

Decision: `contract_window_opened_docs_only`.

The user chose to open F9E as an experimental contract window. This does not
release code implementation.

Allowed now:

- docs-only contract shaping;
- read-only API/security/architecture review;
- updates to orchestration state/receipts.

Still blocked:

- changes to `src/**` or `test/**`;
- changing Receita Web concurrency;
- opening multiple headed windows;
- live Receita Web smoke or CI network validation;
- CAPTCHA solving, anti-bot bypass, fallback/default/volume promises.

The current contract preserves one active app execution, treats multiple windows
as internal children of that execution only if a future implementation is
approved, requires global stop on CAPTCHA/bloqueio and keeps Receita Web portal
details inside the adapter boundary.

API design review result:

- artifact:
  `results/phase-9e-contract-api-design-review-2026-06-14.md`;
- F9E must be a separate advanced mode, not activated by `executionSpeedProfile`;
- default `receita-web` remains assisted, visible-browser, no batch, no
  fallback and no deterministic smoke;
- future IPC/UI payloads must be generic and sanitized;
- `ASSISTED_PROVIDER_STATE_CHANGED` is acceptable only with aggregate/sanitized
  state and no portal payload.

Security review result:

- artifact:
  `results/phase-9e-contract-security-review-2026-06-14.md`;
- decision: `approve_contract_docs_only`;
- required future gates: separate user-owned final result/checkpoint/export
  from state/log/diagnostic/IPC/UI telemetry; freeze or explicitly approve any
  browser anti-bot-related flags before F9E implementation; prove ephemeral
  isolated browser context per window with deterministic doubles.

Browser-to-API investigation result:

- artifact:
  `results/phase-9e-browser-to-api-investigation-2026-06-14.md`;
- decision: `precisa_captura_manual`;
- pre-capture state at the time: no `.o11y/<run>` trace existed in the
  workspace and the sibling `browser-trace` skill was not installed locally;
- current adapter evidence pointed to HTML/postback parsing rather than an
  obvious JSON/XHR API;
- this pre-capture finding is superseded by the later initial capture receipt
  below, which installed `browser-trace`, executed a supervised no-CNPJ capture
  and still observed no API endpoint.

Browser-trace installation result:

- artifact:
  `results/phase-9e-browser-trace-installed-2026-06-14.md`;
- local skill installed at `/Users/icaroaguiar/.agents/skills/browser-trace`;
- scripts installed: `start-capture.mjs`, `capture-daemon.mjs`,
  `stop-capture.mjs`, `bisect-cdp.mjs`;
- all scripts passed `node --check`;
- no Receita Web capture was run during installation.

## F9E Browser-To-API Initial Capture As Of 2026-06-14 17:21

Artifact:

- `results/phase-9e-browser-to-api-initial-capture-2026-06-14.md`

Decision: `investigation_complete_no_api_endpoint_observed`.

The first live capture was intentionally minimal and supervised:

- temporary Chrome profile under `/private/tmp`;
- CDP local only;
- initial Receita Web page loaded from the adapter URL;
- no CNPJ typed, submitted or captured;
- no CAPTCHA solving or anti-bot bypass;
- `browser-to-api` run offline with origin allowlist
  `www8.receita.fazenda.gov.br` and explicit cookie/set-cookie redaction.

Evidence:

- successful run `receita-web-initial-page-9225-2026-06-14`;
- `browser-trace` observed 17 requests and 17 responses;
- `browser-to-api` kept 2 Receita-origin page renders;
- normalized endpoints: 0;
- emitted API endpoints: 0;
- report summary: `No API endpoints discovered`.

Data hygiene:

- the raw CDP trace triggered a possible cookie signal;
- no cookie/header value was copied into docs;
- raw `.o11y` artifacts were removed after extracting counts and sanitized
  conclusion;
- `test ! -e .o11y` confirmed the raw trace is not retained in the worktree.

Conclusion: the observed initial Receita Web flow does not provide an
API/XHR/fetch endpoint that can safely replace browser automation. F9E material
implementation remains blocked. For this release, Receita Web should stay
serial/assisted, and volume should route to Base Publica Local plus the existing
speed profiles, pause/cancel and pending-export controls.

## F9 Activity Controls Visibility Follow-up As Of 2026-06-14 17:10

Artifact:

- `results/phase-9-activity-controls-visibility-followup-2026-06-14.md`

Decision: `validated_review_approved`.

Context: during a 1000-CNPJ Receita Web assisted run, the Activity tab still
looked too close to the previous implementation. The user could see slow
progress, but the method limit, recommendation to switch to Base local and
operator controls were not visible enough in the same active surface.

Follow-up integrated in the canonical worktree:

- Activity now shows `Metodo`, `Limite`, `Controle` and `Proxima acao` using
  the same `buildOperationalPanelCopy` source as the operational panel;
- `Pausar` and `Cancelar` are rendered inside Activity processing controls;
- the CSS rule that hid `Cancelar` with `opacity: 0` and
  `pointer-events: none` was removed;
- renderer sync updates the new slots via `textContent`;
- tests now assert Receita Web throughput guidance in Activity and direct
  enabled/disabled states for pause/cancel controls.

Validation:

- focused Vitest: pass, 3 files and 27 tests;
- `pnpm typecheck`: pass;
- `pnpm lint`: pass;
- scoped `git diff --check`: pass;
- `pnpm smoke:visual`: pass;
- `pnpm smoke:electron-ui`: pass, run
  `2c7193c8-ad4c-4bae-8c1f-9e674e396664`.

Independent review:

- reviewer agent `019ec7be-903a-76d2-8db0-d159858d8408`;
- result: `approved_candidate`;
- no P0-P3 blocking findings;
- reviewer confirmed no new `runId`/`checkpointPath` exposure and that Receita
  Web remains assisted/lenta/sem paralelismo.

This follow-up does not release F9E parallel Receita Web implementation. F9E
remains limited to contract/capture investigation until a fresh judge decision.

## F9 Final Closeout As Of 2026-06-14 17:27

Artifact:

- `results/phase-9-final-closeout-2026-06-14.md`

Decision: `validated_integrated_closeout`.

F9 is closed in the canonical worktree and branch
`feat/fiscal-desk-local-base-prep`. The material speed, control and assisted
public-base slices are integrated and verified together:

- F9A/F9B execution-speed profile contract and provider-bounded concurrency;
- F9C1/F9C2 official public-base discovery, assisted `Simples.zip` download,
  source/ZIP validation and streaming CNPJ index;
- F9D1/F9D2 cooperative pause, checkpoint/resume, strong cancel, partial
  history and pending export;
- Activity controls visibility follow-up for method/limit/control guidance and
  visible pause/cancel actions.

F9E Receita Web parallel material implementation is not part of this closeout.
The browser-to-api capture observed no API endpoint and the only remaining
parallelization route would be an experimental multi-window headed flow. That
requires a new owner window, deterministic doubles, security review and explicit
judge approval before implementation.

Final integrated validation:

- `pnpm lint`: pass, 128 files;
- `pnpm typecheck`: pass;
- `pnpm test`: pass, 43 files and 320 tests;
- `pnpm build`: pass;
- `git diff --check`: pass;
- `pnpm smoke:visual`: pass for desktop, tablet and mobile;
- `pnpm smoke:electron-ui`: pass, run
  `ab4ad979-d52d-476d-b162-8537cc39d35a`;
- raw `.o11y` trace hygiene: pass, no retained `.o11y` directory.

The docs-only closeout alignment was revalidated with `pnpm lint`,
`pnpm typecheck`, `pnpm test`, `pnpm build` and `git diff --check`.

No material F9 worker or queue item remains releasable from this phase. Future
Receita Web parallel work must start from a fresh F9E owner window rather than
from the default `receita-web` provider path.

## F9E Reopened And Implemented As Of 2026-06-14 19:50

Artifacts:

- `results/phase-9e-receita-web-public-cnpj-captcha-capture-2026-06-14.md`
- `results/phase-9e-receita-web-parallel-experimental-implementation-2026-06-14.md`

Decision: `validated_integrated_closeout`.

The previous F9 closeout is superseded for F9E only. The user explicitly
required parallelization and velocity options to be completed in this round
before calling the core ready.

Browser-to-api update:

- the first capture loaded only the initial page and therefore observed no API
  endpoint;
- the second capture used a public real CNPJ and submitted the form;
- Receita returned CAPTCHA/token protection before a success flow;
- `browser-to-api` discovered one low-confidence operation,
  `POST https://consopt.www8.receita.fazenda.gov.br/consultaoptantes`;
- that operation is an HTML form-post with `__RequestVerificationToken`, not a
  JSON/API success contract;
- raw `.o11y` traces were removed after sanitized counts were extracted.

Implemented runtime/UI contract:

- default `receita-web` remains serial, assisted, visible-browser and without
  batch lookup;
- new explicit provider mode:
  `receita-web-parallel-experimental`;
- the experimental mode requires explicit user acknowledgement before starting
  or resuming;
- effective windows by speed profile:
  - `leve`: 1;
  - `equilibrado`: 2;
  - `rapido`: 3;
  - `maximo`: 3;
- one active app execution remains enforced;
- `CAPTCHA_REQUIRED` or `BLOCKED` requests global stop for the experimental
  execution;
- UI copy names the visible-window limit, CAPTCHA/bloqueio stop condition,
  computer-occupation risk and Base Publica Local recommendation for volume.

Focused validation already completed:

- `pnpm lint`: pass, 128 files;
- `pnpm typecheck`: pass;
- focused Vitest: pass, 7 files and 56 tests.

Post-review rework completed before final gates:

- progress `currentCnpj` is masked before IPC/UI telemetry;
- legacy Receita Web browser launch no longer sets the automation-disabling
  flag or fixed user-agent;
- experimental Receita Web resume requires explicit consent before reading the
  original CSV/XLSX;
- core stop coverage includes both `CAPTCHA_REQUIRED` and `BLOCKED`;
- CNPJa Open catalog no longer advertises effective batch lookup for this
  release.

Post-review focused validation:

- `pnpm typecheck`: pass;
- `pnpm lint`: pass, 128 files;
- focused Vitest: pass, 9 files and 92 tests.

Integrated validation completed:

- `pnpm lint`: pass, 128 files;
- `pnpm typecheck`: pass;
- `pnpm test`: pass, 43 files and 329 tests;
- `pnpm build`: pass;
- `git diff --check`: pass;
- `test ! -e .o11y`: pass;
- `pnpm smoke:visual`: pass, no overflow, clipped buttons or overlaps;
- `pnpm smoke:electron-ui`: pass, run
  `1da0d1f0-be65-413d-b64c-ff417799c30b`.

Independent review completed:

- reviewer `019ec864-5928-7c90-86e0-8ef6a394f7a4`;
- no blocking code findings for F9E after P1/P2/P3 rework;
- state.yaml inconsistency found, reworked and rechecked;
- final rereview: approved with no remaining findings.

Current closeout:

- `results/phase-9-final-closeout-post-f9e-2026-06-14.md`.

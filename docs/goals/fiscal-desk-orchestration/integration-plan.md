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
| `post_p3_first_release_status_rebaseline` | `approved_by_judge_docs_only_scope_candidate` | Pending docs-only dispatch |

F8B1 was dispatched, independently reviewed and selectively integrated in Wave
13. P3 renderer was integrated and validated after CSV input intake hardening.
New material work remains blocked until the post-P3 docs-only rebaseline is
completed and judged.

## Active Queue As Of 2026-06-13

| Phase | Thread | Worktree | Scope |
|---|---|---|---|
| None | - | - | No active worker after post-P3 owner-window selection was judged |

`post_local_base_regate_csv_input_intake_hardening` was integrated and validated
at `2026-06-13 17:20:37 -03`. The read-only scope-selection gate
`post_csv_input_intake_next_owner_window_selection` was dispatched at
`2026-06-13 17:26:55 -03`, observed active at `2026-06-13 17:29:28 -03` and
approved by the judge at `2026-06-13 17:31:33 -03`.

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

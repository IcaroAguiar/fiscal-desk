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
  em 69.24% linhas/statements, 86.82% funcoes e 75.34% branches;
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
| None | - | No approved queue remains after Wave 13 closeout |

F8B1 was dispatched, independently reviewed and selectively integrated in Wave
13. New material work requires a fresh judge-selected scope.

## Active Queue As Of 2026-06-13

| Phase | Thread | Worktree | Scope |
|---|---|---|---|
| None | - | - | Coverage gate integrated and validated; next material work still requires fresh judge-selected owner window |

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

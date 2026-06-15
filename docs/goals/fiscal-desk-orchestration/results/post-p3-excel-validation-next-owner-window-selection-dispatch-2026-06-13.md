# Post P3 Excel Validation Next Owner Window Selection Dispatch

Data: 2026-06-13 23:02 -03
Status: `dispatch_prepared`
Branch canonica alvo: `feat/fiscal-desk-local-base-prep`
Target minimo: `2751122`
Owner window: `post_p3_excel_validation_next_owner_window_selection`
Classificacao: `read_only_owner_window_selection`

## Missao Para Thread Codex App

Use `/goal` com modelo `gpt-5.5` e reasoning `medium`.

Selecionar exatamente uma proxima owner window segura para o Fiscal Desk depois
da validacao integrada pos-Excel, ou manter a fila bloqueada com evidencia
concreta. Esta thread e read-only de scoping. Nao implemente codigo.

## Estado Atual

- F0 e ondas anteriores ficam como historico/sentinela, nao como blocker ativo.
- CSV, entrada Excel/XLSX runtime, saida XLSX atual, RunLedger, checkpoint,
  retomada, Base Publica Local e P3 renderer estao integrados/validados.
- A validacao integrada pos-Excel foi aceita pelo judge em
  `results/post-p3-excel-runtime-docs-rebaseline-integrated-first-release-validation-judge-decision-2026-06-13.md`.
- Nenhum worker material esta ativo.
- Nenhuma feature material deve ser liberada automaticamente por esta selecao.

## Escopo Autorizado

Allowed write persistente:

- `docs/goals/fiscal-desk-orchestration/results/post-p3-excel-validation-next-owner-window-selection-2026-06-13.md`

Forbidden writes:

- `src/**`
- `test/**`
- `scripts/**`
- `package.json`
- `pnpm-lock.yaml`
- `.github/**`
- `electron-builder.yml`
- `docs/fiscal-desk/**`
- `docs/qa/**`
- `docs/adr/**`
- `.visual-fidelity/**`
- qualquer arquivo fora do receipt permitido

Side effects proibidos:

- stage;
- commit;
- push;
- PR;
- deploy;
- publish;
- build de release distribuivel;
- signing;
- notarization;
- updater/update real;
- diagnostico real gerado/enviado;
- telemetria real;
- licenca/account real;
- storage/network/backend remoto;
- qualquer side effect externo.

## Candidatos A Avaliar

Avalie sem assumir aprovacao automatica:

- first-release final readiness/PR closeout read-only;
- entrega guiada/local de XLSX sem templates/modelos reutilizaveis;
- diagnostico local revisavel, sem envio externo;
- update/release apenas como scope review ou estado bloqueado/explicativo, sem
  update real e sem release package config;
- release/package config read-only review, se houver evidencia de que este e o
  proximo bloqueio real;
- manter bloqueado se nenhum owner window seguro existir;
- PDF/Word/OCR, Receita Web live/massiva, telemetria, licenca/account,
  storage/network/backend remoto, templates/modelos reutilizaveis e release
  publico devem continuar bloqueados ate owner windows proprios.

## Documentos Obrigatorios Para Ler

- `AGENTS.md`
- `docs/goals/fiscal-desk-orchestration/goal.md`
- `docs/goals/fiscal-desk-orchestration/state.yaml`
- `docs/goals/fiscal-desk-orchestration/integration-plan.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-excel-runtime-docs-rebaseline-integrated-first-release-validation-judge-decision-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-excel-runtime-docs-rebaseline-integrated-first-release-validation-2026-06-13.md`
- `docs/fiscal-desk/first-release.md`
- `docs/fiscal-desk/status.md`
- `docs/fiscal-desk/product-spec.md`
- `docs/fiscal-desk/roadmap.md`
- `docs/fiscal-desk/implementation-plan.md`
- `docs/fiscal-desk/quality-gates.md`
- `docs/qa/first-release-validation.md`

Se `docs/fiscal-desk/**` estiver ausente na worktree isolada por ser local-only
ou ignored, use somente leitura da copia canonica absoluta em
`/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/fiscal-desk/`.
Nao copie nem edite esses docs.

## Checks Read-Only Esperados

- `git status --short --branch --untracked-files=all`
- `git log -5 --oneline`
- `rg` proporcional nos documentos obrigatorios para `blocked`,
  `needs_rework`, `next owner`, `release`, `security`, `coverage`,
  `test:coverage`, `smoke:electron-ui`, `smoke:visual`, `smoke:real-csv`,
  `Base Publica`, `CSV`, `XLSX`, `Excel`, `Receita Web`, `update`,
  `diagnostico`, `telemetria`, `licenca`, `templates`, `modelos`, `PDF`,
  `Word`, `OCR`, `first release`, `PR`;
- `git diff --check -- docs/goals/fiscal-desk-orchestration/results/post-p3-excel-validation-next-owner-window-selection-2026-06-13.md`
  depois de escrever o receipt.

Nao rode lint, typecheck, testes, coverage, build, smokes, gitleaks, ratchet,
dist, publish, deploy, signing ou notarization nesta selecao read-only.

## Receipt Esperado

Status exatamente um de:

- `approved_scope_candidate`
- `blocked`
- `needs_more_info`

O receipt deve conter:

- HEAD observado;
- evidencias lidas;
- owner window recomendado ou blocker concreto;
- classificacao: `docs_only`, `read_only_review`, `non_feature_material`,
  `material_single_writer`, ou `blocked`;
- allowed write set recomendado para o proximo worker se houver;
- do-not-touch;
- dependencias e colisao de boundaries;
- checks obrigatorios para o proximo worker;
- riscos residuais;
- itens que seguem bloqueados;
- recomendacao curta ao judge.

## Resultado

Nao se autoaprove como integrado. O Codex primario continua sendo
judge/orquestrador.

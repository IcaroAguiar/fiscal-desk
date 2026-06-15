# Post P3 Branch PR Preparation Closeout Dispatch

Data: 2026-06-13 23:20 -03
Status: `dispatch_prepared`
Branch canonica alvo: `feat/fiscal-desk-local-base-prep`
Target minimo: `c7c8758`
Owner window: `post_p3_branch_pr_preparation_closeout`
Classificacao: `read_only_pr_preparation`

## Missao Para Thread Codex App

Use `/goal` com modelo `gpt-5.5` e reasoning `medium`.

Preparar o fechamento de branch/PR depois do closeout de readiness aceito pelo
judge. Esta janela deve produzir um artefato de PR closeout que o orquestrador
possa julgar antes de qualquer PR real.

Esta janela nao cria PR, nao faz stage/commit/push, nao roda release/package,
nao altera produto e nao libera nova feature material.

## Escopo Autorizado

Allowed write persistente:

- `docs/goals/fiscal-desk-orchestration/results/post-p3-branch-pr-preparation-closeout-2026-06-13.md`

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
- `docs/goals/fiscal-desk-orchestration/state.yaml`
- `docs/goals/fiscal-desk-orchestration/integration-plan.md`
- `.visual-fidelity/**`
- qualquer arquivo fora do receipt permitido

Side effects proibidos:

- stage;
- commit;
- push;
- PR create/update;
- deploy;
- publish;
- dist/package distribuivel;
- signing;
- notarization;
- updater/update real;
- diagnostico real gerado/enviado;
- telemetria real;
- licenca/account real;
- storage/network/backend remoto;
- qualquer side effect externo.

## Evidencias Obrigatorias Para Ler

- `AGENTS.md`
- `docs/goals/fiscal-desk-orchestration/goal.md`
- `docs/goals/fiscal-desk-orchestration/state.yaml`
- `docs/goals/fiscal-desk-orchestration/integration-plan.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-first-release-final-readiness-pr-closeout-judge-decision-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-first-release-final-readiness-pr-closeout-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-excel-runtime-docs-rebaseline-integrated-first-release-validation-judge-decision-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-excel-runtime-docs-rebaseline-integrated-first-release-validation-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/staging-versioning-closeout.md`
- `docs/goals/fiscal-desk-orchestration/results/staging-versioning-closeout-judge-decision.md`
- `docs/goals/fiscal-desk-orchestration/results/final-integration-review.md`
- `docs/goals/fiscal-desk-orchestration/results/final-integration-review-judge-decision.md`
- `docs/qa/first-release-validation.md`

Se `docs/fiscal-desk/**` estiver ausente na worktree isolada por ser local-only
ou ignored, use somente leitura da copia canonica absoluta em
`/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/fiscal-desk/`.
Nao copie nem edite esses docs.

## Checks Read-Only Esperados

- `git status --short --branch --untracked-files=all`
- `git log -10 --oneline`
- `git diff --name-only`
- `git diff --cached --name-only`
- `git ls-files --others --exclude-standard`
- `git branch --show-current`
- se existir base local segura: `git merge-base main HEAD` e
  `git diff --stat main...HEAD`; se `main` nao existir, registre o blocker de
  contexto e use `git log -10`/estado atual como evidencia substituta;
- `rg` proporcional nos documentos obrigatorios para `PR`, `release`,
  `blocked`, `approved`, `coverage`, `smoke`, `gitleaks`, `ratchet`,
  `skills`, `docs/fiscal-desk`, `telemetria`, `diagnostico`, `licenca`,
  `templates`, `PDF`, `Word`, `OCR`, `Receita Web`;
- `git diff --check -- docs/goals/fiscal-desk-orchestration/results/post-p3-branch-pr-preparation-closeout-2026-06-13.md`
  depois de escrever o receipt.

Nao rode lint, typecheck, testes, coverage, build, smokes, gitleaks, ratchet,
dist, publish, deploy, signing, notarization ou PR nesta janela.

## Perguntas De Decisao

O receipt deve responder:

- A branch esta pronta para o orquestrador preparar um PR real, ou ainda existe
  blocker concreto?
- Qual titulo de PR sugerido?
- Qual corpo/checklist de PR sugerido, em formato pronto para revisao humana?
- Quais checks aceitos devem ser citados?
- Quais arquivos/diretorios devem continuar explicitamente fora de stage/PR?
- `skills/**` e `docs/fiscal-desk/**` continuam fora do PR ou exigem decisao
  propria?
- Quais superficies continuam fora do primeiro release?
- Qual comando/acao segura o orquestrador deve executar depois, se o judge
  aceitar este closeout?

## Receipt Esperado

Status exatamente um de:

- `approved_pr_preparation_candidate`
- `blocked`
- `needs_rework`

O receipt deve conter:

- HEAD observado;
- evidencias lidas;
- checks read-only executados;
- decisao go/no-go para PR preparation;
- PR title sugerido;
- PR body/checklist sugerido;
- blockers concretos, se houver;
- exclusoes obrigatorias;
- riscos residuais;
- superficies ainda bloqueadas;
- recomendacao curta ao judge;
- confirmacao de que nao houve stage, commit, push, PR, deploy, publish,
  signing, notarization ou side effect externo.

## Resultado

Nao se autoaprove como integrado nem abra PR. O Codex primario continua sendo
judge/orquestrador.

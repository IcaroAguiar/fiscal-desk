# Post P3 Large File Ratchet Rework Next Owner Window Selection

Data: 2026-06-13
Status: approved_scope_candidate
Thread: read-only scoping subagent
Branch canonica observada: `feat/fiscal-desk-local-base-prep`
HEAD observado: `55145bd`

## Decisao Candidata

Owner window recomendado:

`post_p3_large_file_ratchet_rework_final_readiness_review`

Classificacao: read-only review.

Esta janela deve revisar a prontidao final do primeiro release/local-first depois
do rebaseline de docs, da validacao executavel integrada e do rework integrado
do ratchet de arquivos grandes. Ela nao deve implementar feature, nao deve
executar release/distribuicao e nao deve aprovar a si propria; o resultado e
entrada para o judge decidir se o roadmap pode voltar a material work ou se
ainda existe blocker concreto.

## Evidencia Lida

- `AGENTS.md`
- `docs/goals/fiscal-desk-orchestration/goal.md`
- `docs/goals/fiscal-desk-orchestration/state.yaml`
- `docs/goals/fiscal-desk-orchestration/integration-plan.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-large-file-ratchet-rework-next-owner-window-selection-dispatch-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-integrated-validation-large-file-ratchet-rework-integration-judge-decision-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-validation-docs-rebaseline-integrated-first-release-validation-judge-decision-2026-06-13.md`
- `docs/qa/first-release-validation.md`

Tambem consultei trechos proporcionais de `state.yaml`, `integration-plan.md`
e receipts recentes para confirmar que F6E2C ja fechou como no-code, release e
security reviews/reworks anteriores foram consumidos, e que a fila atual voltou
a selecao apos o fechamento do `code.large-file-ratchet`.

Checks read-only executados nesta selecao:

- `git rev-parse --short HEAD`: `55145bd`
- `git status --short`: apenas `?? skills/` herdado/ignorado para este recorte
- `rg` proporcional sobre orquestracao, receipts e `docs/qa/first-release-validation.md`

## Justificativa

O blocker anterior de qualidade era estrutural: o pacote integrado aumentava a
contagem de large files. O judge aceitou o rework como
`approved_by_judge_integrated_validated`, com testes focados, suite completa,
coverage e ratchet scoped passando. A mesma decisao registra que smokes
Electron/visual/CSV nao foram repetidos porque o rework foi mecanico e nao tocou
renderer, preload, provider, parser CSV ou comportamento de app.

Como `docs/qa/first-release-validation.md` exige evidencia qualitativa conforme
a superficie tocada, a proxima janela mais segura nao e uma feature nova; e um
review read-only curto para consolidar se a evidencia final pos-rework e
suficiente para liberar novo material work. Isso evita reabrir release,
updater, diagnosticos, telemetria, licenca/account, templates/modelos,
PDF/Word/OCR ou Receita Web live/massiva sem owner window proprio.

## Allowed Write Set Recomendado Para O Proximo Worker

Somente:

- `docs/goals/fiscal-desk-orchestration/results/post-p3-large-file-ratchet-rework-final-readiness-review-2026-06-13.md`

Gerados transientes permitidos apenas na worktree isolada, sem stage/integracao:

- `coverage/**`
- `dist/**`
- `dist-electron/**`
- `.vite/**`
- artefatos temporarios em `/private/tmp/**`

## Do Not Touch Recomendado

- codigo de produto em `src/**`
- testes em `test/**`
- configs, `package.json`, `pnpm-lock.yaml`, workflows e release config
- `docs/fiscal-desk/**`
- renderer, IPC, preload, providers, execution/runtime, storage, diagnostics,
  telemetry, license/account, updater, signing, notarization e publish
- stage, commit, push, PR, deploy, release build ou qualquer side effect externo

## Dependencias E Colisao De Boundaries

Dependencias:

- rebaseline publico de validacao aceito em
  `post-p3-readiness-first-release-validation-docs-rebaseline-judge-decision-2026-06-13.md`;
- validacao executavel integrada aceita como evidencia em
  `post-p3-validation-docs-rebaseline-integrated-first-release-validation-judge-decision-2026-06-13.md`;
- rework do ratchet aceito em
  `post-p3-integrated-validation-large-file-ratchet-rework-integration-judge-decision-2026-06-13.md`;
- HEAD minimo confirmado nesta worktree: `55145bd`.

Colisao:

- sem colisao de writer se a proxima janela for realmente read-only e escrever
  apenas o receipt;
- nao deve assumir ownership de `src/main/execution/**`, `src/main/ipc/**`,
  `src/renderer/**`, provider, package/release ou docs locais ignorados;
- se o review concluir que falta smoke, rework ou ajuste material, ele deve
  retornar blocker/recomendacao de nova janela, nao corrigir no proprio review.

## Checks Obrigatorios Para O Proximo Worker

Minimo read-only:

- confirmar `git rev-parse --short HEAD` e comparar com o target indicado pelo
  dispatch/judge;
- `git status --short` e registrar sujeira herdada sem tentar limpar;
- ler os receipts de validacao integrada, rework do ratchet e rebaseline de
  `docs/qa`;
- executar `rg` proporcional para `large-file-ratchet`, `coverage`,
  `smoke:electron-ui`, `smoke:visual`, `smoke:real-csv`, `release`, `publish`,
  `update`, `diagnostico`, `telemetria`, `licenca`, `templates`, `PDF`, `Word`,
  `OCR`, `Receita Web` e `blocked`.

Checks executaveis recomendados se o ambiente permitir sem efeito externo:

- `pnpm test:coverage`
- `QUALITY_GATE_DIFF_MODE=worktree node docs/ai/quality-gate/check-ratchet.mjs`
- `git diff --check`
- `pnpm smoke:electron-ui` somente se o reviewer decidir que a mudanca em
  execution/ledger pos-validacao exige nova prova qualitativa;
- `pnpm smoke:real-csv` e `pnpm smoke:visual` somente se a decisao do review
  depender desses fluxos ou se houver evidencia conflitante nos receipts.

Se algum check executavel for bloqueado por ambiente, o receipt deve registrar o
erro concreto, evidencia substituta e risco residual.

## Riscos Residuais

- O dispatch desta selecao registra target minimo `e05a85b`, enquanto a
  delegacao do usuario registra `55145bd`; a worktree esta em `55145bd`, mas o
  drift de commit minimo deve ser eliminado no proximo dispatch.
- O ratchet default ainda pode falhar por contexto `origin/main...HEAD`, mesmo
  sem reincidir em `code.large-file-ratchet`; o modo scoped precisa ser
  interpretado junto do default.
- `src/renderer/styles.css` segue como large file legado com excecao temporal ja
  documentada.
- Coverage continua abaixo do alvo operacional de 80% e deve ser tratada como
  sinal ativo, nao prova funcional suficiente.
- A validacao executavel completa aconteceu antes do rework mecanico do ratchet;
  o judge aceitou nao repetir smokes, mas o review final deve decidir se isso e
  suficiente para liberar a proxima janela material.

## Continua Bloqueado

- release publico, dist/publish distribuivel, signing e notarization;
- updater/update real;
- envio ou transporte real de diagnosticos;
- telemetria real;
- licenca/account real;
- templates/modelos reutilizaveis e renderer template UI;
- PDF/Word/OCR reais;
- Receita Web live/massiva ou promessa de automacao robusta em lote;
- storage/network expansion;
- guided delivery customization;
- qualquer feature material sem nova owner window julgada.

## Blocker

Nao ha blocker concreto para abrir o review read-only recomendado.

Se o judge exigir uma janela material imediatamente em vez de review, esta
selecao deve ser tratada como insuficiente: o material work ainda nao tem
allowed write set seguro derivado dos documentos obrigatorios pos-ratchet.

# Post P3 Excel Runtime Next Owner Window Selection Dispatch

Data: 2026-06-13 22:21:43 -03
Status: dispatch_prepared

## Contexto Canonico

- Repo: `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv`
- Branch final: `feat/fiscal-desk-local-base-prep`
- HEAD observado: `62bb72e feat: expose excel input in fiscal desk runtime`
- Goal mestre: `docs/goals/fiscal-desk-orchestration/goal.md`
- Estado: `docs/goals/fiscal-desk-orchestration/state.yaml`
- Plano: `docs/goals/fiscal-desk-orchestration/integration-plan.md`

O owner window material `post_p3_excel_input_runtime_exposure` foi integrado,
validado e commitado na branch canonica. Nenhum worker material esta ativo ou
liberado automaticamente.

## Missao Do Subagente

Selecionar exatamente uma proxima owner window segura para o Fiscal Desk ou
manter a fila bloqueada com blocker concreto.

Esta e uma thread read-only de scoping. O resultado e candidato para o judge e
nao aprova material work por si so.

## Leitura Obrigatoria

- `AGENTS.md`
- `docs/goals/fiscal-desk-orchestration/goal.md`
- `docs/goals/fiscal-desk-orchestration/state.yaml`
- `docs/goals/fiscal-desk-orchestration/integration-plan.md`
- Este dispatch
- `docs/goals/fiscal-desk-orchestration/results/post-p3-excel-input-runtime-exposure-integration-judge-decision-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-excel-input-runtime-exposure-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-excel-input-runtime-exposure-review-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-excel-input-runtime-exposure-rework-review-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-excel-ingestion-next-owner-window-selection-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-excel-ingestion-next-owner-window-selection-judge-decision-2026-06-13.md`
- `docs/fiscal-desk/first-release.md`
- `docs/fiscal-desk/status.md`
- `docs/fiscal-desk/product-spec.md`
- `docs/fiscal-desk/roadmap.md`
- `docs/fiscal-desk/implementation-plan.md`
- `docs/fiscal-desk/quality-gates.md`
- `docs/qa/first-release-validation.md`

Se `docs/fiscal-desk/**`, `docs/qa/**`, `CONTEXT.md` ou
`.visual-fidelity/**` estiverem ausentes na worktree do subagente por serem
local-only/ignored, use a copia canonica absoluta em
`/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/` apenas para leitura.
Nao copie, nao edite e nao versione esses arquivos.

## Regras

- Nao implementar codigo.
- Nao editar codigo, testes, configs, package/lock, release/update,
  diagnosticos, telemetria, licenca/account, renderer, IPC, preload, core,
  providers, ingestion/export, docs/fiscal-desk, docs/qa ou docs/adr.
- Nao rodar tests/build/smokes/coverage/dist/publish/deploy/signing/notarization
  ou qualquer side effect externo.
- Nao stage, commit, push ou PR.
- Nao autoaprovar. Entregar candidato para o judge.
- Escrever somente o receipt permitido:
  `docs/goals/fiscal-desk-orchestration/results/post-p3-excel-runtime-next-owner-window-selection-2026-06-13.md`

## Pergunta De Decisao

Qual e a proxima owner window mais segura e util depois de integrar entrada
Excel/XLSX no runtime real do app Electron, considerando que a fila material
esta vazia e que material work so pode avancar com owner unico, allowed writes
explicitos, checks proporcionais e review independente?

## Candidatos A Avaliar

Avalie, sem assumir que algum esta automaticamente aprovado:

- rebaseline docs-only de `docs/fiscal-desk/**` e `docs/qa/**` para refletir
  que entrada Excel/XLSX ja saiu de planejada/desabilitada e entrou no runtime
  validado;
- QA/validacao de ingestao Excel, se for read-only ou docs-only e destravar
  um worker posterior sem tocar runtime;
- entrega guiada/modelos de saida, sem templates reutilizaveis amplos;
- diagnostico local revisavel, sem gerar ou enviar pacote externo;
- update/release apenas como scope review ou UI blocked state, sem update real,
  dist, publish, assinatura, notarizacao ou package/lock;
- hardening de primeira release, se os docs indicarem blocker residual apos
  Excel runtime;
- manter bloqueado se os docs ainda nao permitirem owner window seguro.

Itens que continuam bloqueados ate owner window proprio: release/public
distribution, updater/update real, diagnostico enviado ou pacote real,
telemetria, licenca ou account real, storage/network/backend remoto,
templates/modelos reutilizaveis, PDF/Word/OCR reais e Receita Web live/massiva.

## Checks Read-Only Esperados

- `git status --short --branch --untracked-files=all`
- `git log -5 --oneline`
- `rg` proporcional nos docs/receipts acima para `blocked`, `needs_rework`,
  `next owner`, `release`, `security`, `coverage`, `test:coverage`,
  `smoke:electron-ui`, `smoke:visual`, `smoke:real-csv`, `Base Publica`,
  `P3`, `CSV`, `XLSX`, `Excel`, `Receita Web`, `update`, `diagnostico`,
  `telemetria`, `licenca`, `templates`, `PDF`, `Word`, `OCR`,
  `first release`.
- `git diff --check -- docs/goals/fiscal-desk-orchestration/results/post-p3-excel-runtime-next-owner-window-selection-2026-06-13.md`
  depois de escrever o receipt.

## Receipt Esperado

Status exatamente um de:

- `approved_scope_candidate`
- `needs_more_info`
- `blocked`

O receipt deve conter:

- HEAD observado;
- evidencias lidas;
- owner window recomendado;
- classificacao: `docs-only`, `read-only review`, `non-feature material` ou
  `material single-writer`;
- allowed write set recomendado para o proximo worker, se houver;
- do-not-touch explicito;
- dependencias e colisao de boundaries;
- checks obrigatorios para o proximo worker;
- riscos residuais;
- itens que seguem bloqueados;
- recomendacao curta ao judge.

## Stop Conditions

Pare com `blocked` se:

- a selecao exigir mexer em superficie sem allowed write claro;
- houver blocker material contradizendo a integracao validada atual;
- a recomendacao depender de liberar update real, release, diagnostico enviado,
  telemetria, licenca/account, storage/network, templates amplos,
  PDF/Word/OCR reais ou Receita Web live/massiva;
- a worktree nao permitir leitura minima dos docs/receipts e a copia canonica
  absoluta tambem estiver indisponivel.

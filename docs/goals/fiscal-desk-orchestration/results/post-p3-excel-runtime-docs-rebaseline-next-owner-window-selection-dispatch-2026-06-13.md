# Post P3 Excel Runtime Docs Rebaseline Next Owner Window Selection Dispatch

Data: 2026-06-13 22:38:34 -03
Status: dispatch_prepared

## Contexto Canonico

- Repo: `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv`
- Branch final: `feat/fiscal-desk-local-base-prep`
- HEAD observado: `0ffb0ee docs: rebaseline fiscal desk excel runtime docs`
- Goal mestre: `docs/goals/fiscal-desk-orchestration/goal.md`
- Estado: `docs/goals/fiscal-desk-orchestration/state.yaml`
- Plano: `docs/goals/fiscal-desk-orchestration/integration-plan.md`

O owner window docs-only `post_p3_excel_runtime_docs_rebaseline` foi aceito e
integrado localmente. Nenhum worker material esta ativo ou liberado
automaticamente.

## Missao Do Subagente

Selecionar exatamente uma proxima owner window segura para o Fiscal Desk ou
manter a fila bloqueada com blocker concreto, agora que os docs locais refletem
entrada Excel/XLSX runtime validada.

Esta e uma thread read-only de scoping. O resultado e candidato para o judge e
nao aprova material work por si so.

## Leitura Obrigatoria

- `AGENTS.md`
- `docs/goals/fiscal-desk-orchestration/goal.md`
- `docs/goals/fiscal-desk-orchestration/state.yaml`
- `docs/goals/fiscal-desk-orchestration/integration-plan.md`
- Este dispatch
- `docs/goals/fiscal-desk-orchestration/results/post-p3-excel-runtime-docs-rebaseline-judge-decision-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-excel-runtime-docs-rebaseline-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-excel-input-runtime-exposure-integration-judge-decision-2026-06-13.md`
- `docs/fiscal-desk/first-release.md`
- `docs/fiscal-desk/status.md`
- `docs/fiscal-desk/product-spec.md`
- `docs/fiscal-desk/roadmap.md`
- `docs/fiscal-desk/implementation-plan.md`
- `docs/fiscal-desk/quality-gates.md`
- `docs/qa/first-release-validation.md`

Se `docs/fiscal-desk/**` estiver ausente na worktree por ser local-only/ignored,
use a copia canonica absoluta em
`/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/fiscal-desk/`
somente para leitura. Nao copie nem edite esses docs nesta selecao.

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
  `docs/goals/fiscal-desk-orchestration/results/post-p3-excel-runtime-docs-rebaseline-next-owner-window-selection-2026-06-13.md`

## Pergunta De Decisao

Qual e a proxima owner window mais segura e util depois de Excel runtime e
rebaseline documental, considerando que material work so pode avancar com owner
unico, allowed writes explicitos, checks proporcionais e review independente?

## Candidatos A Avaliar

Avalie, sem assumir que algum esta automaticamente aprovado:

- QA/validacao final da primeira release, se for read-only ou non-feature
  validation e nao reabrir runtime sem necessidade;
- entrega guiada/saida personalizada, mantendo fora templates/modelos
  reutilizaveis amplos;
- diagnostico local revisavel, sem gerar pacote real nem envio externo;
- update/release apenas como scope review ou UI blocked state, sem update real,
  dist, publish, assinatura, notarizacao, package/lock ou metadata real;
- hardening de primeira release com base nos docs atualizados;
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
  `smoke:electron-ui`, `smoke:visual`, `Base Publica`, `CSV`, `XLSX`, `Excel`,
  `Receita Web`, `update`, `diagnostico`, `telemetria`, `licenca`,
  `templates`, `PDF`, `Word`, `OCR`, `first release`.
- `git diff --check -- docs/goals/fiscal-desk-orchestration/results/post-p3-excel-runtime-docs-rebaseline-next-owner-window-selection-2026-06-13.md`
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

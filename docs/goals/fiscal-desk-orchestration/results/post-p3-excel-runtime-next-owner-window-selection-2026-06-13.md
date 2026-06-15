# Post P3 Excel Runtime Next Owner Window Selection

Data: 2026-06-13 22:25:35 -03
Status: approved_scope_candidate

## HEAD Observado

- `11561036530450375ec247ff23f70caec93fecf4`
- `1156103 docs: dispatch post excel runtime owner selection`
- Worktree: `/Users/icaroaguiar/.codex/worktrees/4f76/consulta-simples-csv`
- Status observado antes deste receipt: `## HEAD (no branch)`, sem alteracoes.

## Evidencias Lidas

- `AGENTS.md`
- `docs/goals/fiscal-desk-orchestration/goal.md`
- `docs/goals/fiscal-desk-orchestration/state.yaml`
- `docs/goals/fiscal-desk-orchestration/integration-plan.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-excel-runtime-next-owner-window-selection-dispatch-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-excel-input-runtime-exposure-integration-judge-decision-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-excel-input-runtime-exposure-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-excel-input-runtime-exposure-review-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-excel-input-runtime-exposure-rework-review-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-excel-ingestion-next-owner-window-selection-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-excel-ingestion-next-owner-window-selection-judge-decision-2026-06-13.md`
- `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/fiscal-desk/first-release.md`
- `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/fiscal-desk/status.md`
- `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/fiscal-desk/product-spec.md`
- `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/fiscal-desk/roadmap.md`
- `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/fiscal-desk/implementation-plan.md`
- `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/fiscal-desk/quality-gates.md`
- `docs/qa/first-release-validation.md`

`docs/fiscal-desk/**` nao existe nesta worktree destacada, conforme esperado
para docs local-only/ignored. Usei a copia canonica absoluta somente para
leitura, conforme autorizado pelo dispatch.

## Comandos Read-Only Rodados

| Comando | Resultado |
|---|---|
| `git status --short --branch --untracked-files=all` | pass; `## HEAD (no branch)` sem alteracoes antes deste receipt |
| `git log -5 --oneline` | pass; HEAD `1156103`, commit anterior `62bb72e` integra Excel runtime |
| `git rev-parse HEAD` | pass; `11561036530450375ec247ff23f70caec93fecf4` |
| `find docs/fiscal-desk docs/qa -maxdepth 2 -type f` | confirmou ausencia de `docs/fiscal-desk/**` nesta worktree e presenca de `docs/qa/first-release-validation.md` |
| `rg -n ... docs/goals/fiscal-desk-orchestration docs/qa /Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/fiscal-desk` | pass; usado para confrontar blockers, Excel/XLSX, release, update, diagnostico, telemetria, templates, PDF/Word/OCR e smokes |

Nao rodei testes, build, coverage, smokes, dist, publish, stage, commit, push ou
PR, conforme o dispatch read-only.

## Owner Window Recomendado

`post_p3_excel_runtime_docs_rebaseline`

Classificacao: `docs-only`.

Escopo recomendado: rebaseline documental apos a integracao validada de entrada
Excel/XLSX no runtime Electron. A janela deve atualizar a verdade de produto e
validacao para refletir que Entrada Excel saiu de planejada/desabilitada e ja
tem caminho real validado no app com smoke Electron, mantendo explicitamente
bloqueados templates/modelos, diagnostico real, telemetria, licenca/account,
release/update real, PDF/Word/OCR e Receita Web live/massiva.

## Justificativa

- A decisao de judge
  `post-p3-excel-input-runtime-exposure-integration-judge-decision-2026-06-13.md`
  registra `approved_by_judge_integrated_validated` para entrada XLSX no runtime
  Electron, com picker IPC, preload, core app, ledger/fingerprint por
  `inputFormat`, renderer, smokes Electron XLSX para `mock` e
  `base-publica-local`, smoke visual, full test, coverage, typecheck, lint,
  build e ratchet.
- O proprio proximo gate desse judge decision diz que nao ha material worker
  ativo e que a proxima onda deve comecar por nova selecao read-only.
- `first-release.md` ainda fala que o corte foi rebaselined ate P3 renderer e
  mantem "Entrada Excel" em "Visivel planejado/desabilitado".
- `product-spec.md` ainda marca "Entrada Excel" como `nao`, planejada e
  bloqueada por owner window de ingestao/validacao real.
- `status.md` ainda lista hardening CSV/P3 renderer como ultimo estado vivo e
  nao reflete a integracao de Excel runtime.
- `roadmap.md` ainda diz que Entrada Excel/PDF/Word podem aparecer apenas como
  planejados ou desabilitados enquanto nao estiverem implementados; Excel agora
  precisa sair dessa categoria, sem liberar PDF/Word/OCR.
- `quality-gates.md` e `docs/qa/first-release-validation.md` preservam a matriz
  correta de qualidade, mas podem precisar atualizar a evidencia exemplar para
  os checks pos-Excel runtime: 43 arquivos/283 testes, coverage global 76.39%,
  PR coverage 75.59% e smokes XLSX.
- Avancar diretamente para entrega guiada, diagnostico, update/release ou
  templates antes desse rebaseline criaria risco de orientar o proximo worker a
  partir de docs locais stale.

## Allowed Write Set Recomendado Para O Proximo Worker

Como `docs/fiscal-desk/**` e local-only/ignored e pode nao existir em worktrees
novas, o judge deve fornecer uma copia editavel desses docs ao worker ou aplicar
a janela docs-only na worktree canonica com controle de diff.

Allowed write set recomendado:

- `docs/fiscal-desk/first-release.md`
- `docs/fiscal-desk/status.md`
- `docs/fiscal-desk/product-spec.md`
- `docs/fiscal-desk/roadmap.md`
- `docs/fiscal-desk/implementation-plan.md`
- `docs/fiscal-desk/quality-gates.md`
- `docs/qa/first-release-validation.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-excel-runtime-docs-rebaseline-2026-06-13.md`

Se a worktree do worker nao tiver `docs/fiscal-desk/**`, ele deve parar com
`blocked_missing_local_docs` ou usar a copia disponibilizada pelo judge. Nao deve
inventar docs do zero.

## Do-Not-Touch

- `src/**`
- `test/**`
- `scripts/**`
- `package.json`
- `pnpm-lock.yaml`
- `electron-builder.yml`
- `.github/**`
- `dist/**`
- `dist-electron/**`
- `.visual-fidelity/**`
- `docs/adr/**`
- `docs/goals/fiscal-desk-orchestration/state.yaml`
- `docs/goals/fiscal-desk-orchestration/integration-plan.md`
- qualquer comportamento runtime, provider, IPC, preload, renderer, core,
  release/update, diagnostico, telemetria, licenca/account, storage/network,
  templates, PDF/Word/OCR ou Receita Web live/massiva.

## Dependencias E Colisoes De Boundaries

- A janela depende da integracao validada
  `post_p3_excel_input_runtime_exposure`.
- Nao ha colisao com code owners se o worker for estritamente docs-only.
- Ha colisao operacional com docs local-only/ignored: o judge precisa decidir
  como entregar uma copia editavel ao worker antes de exigir execucao.
- Esta janela nao deve liberar feature material automaticamente. Depois do
  rebaseline, a fila deve voltar para selecao read-only fresca ou para um
  dispatch material explicitamente julgado.

## Checks Obrigatorios Para O Proximo Worker

Por ser docs-only:

- `git status --short --branch --untracked-files=all`
- `git diff -- docs/fiscal-desk/first-release.md docs/fiscal-desk/status.md docs/fiscal-desk/product-spec.md docs/fiscal-desk/roadmap.md docs/fiscal-desk/implementation-plan.md docs/fiscal-desk/quality-gates.md docs/qa/first-release-validation.md`
- `git diff --check -- docs/fiscal-desk/first-release.md docs/fiscal-desk/status.md docs/fiscal-desk/product-spec.md docs/fiscal-desk/roadmap.md docs/fiscal-desk/implementation-plan.md docs/fiscal-desk/quality-gates.md docs/qa/first-release-validation.md docs/goals/fiscal-desk-orchestration/results/post-p3-excel-runtime-docs-rebaseline-2026-06-13.md`

Nao rodar testes, build, coverage, smokes, dist, publish, stage, commit, push ou
PR para esta janela docs-only. O worker deve referenciar a evidencia ja
registrada no judge decision de Excel runtime em vez de reexecutar checks.

## Riscos Residuais

- Se `docs/fiscal-desk/**` continuar local-only/ignored, a branch versionada pode
  nao carregar sozinha toda a verdade de produto; o judge precisa decidir se
  esse e um artefato local aceito ou se deve haver versao versionada futura.
- Atualizar docs para "Entrada Excel disponivel" nao pode virar promessa de
  templates, Excel modelavel, PDF/Word/OCR, Receita Web massiva ou release
  publico.
- A heuristica XLSX aceita continua simples: primeira worksheet nao vazia e
  primeira linha nao vazia como header; CNPJs numericos sem zeros a esquerda
  continuam risco de fonte.
- Coverage percentual continua sinal auxiliar; a prova funcional de Excel
  runtime permanece nos smokes Electron ja registrados, nao nos docs.

## Itens Que Seguem Bloqueados

- Release publico, dist, publish, signing, notarization e updater/update real.
- Diagnostico gerado, pacote real de diagnostico ou envio externo.
- Telemetria real.
- Licenca/account real.
- Storage/network/backend remoto.
- Templates/modelos reutilizaveis.
- Entrega guiada ampla.
- PDF/Word/OCR reais.
- Receita Web live/massiva.
- Dependencia nova ou mudanca em `package.json`/`pnpm-lock.yaml`.

## Recomendacao Ao Judge

Aceitar este candidato como selecao docs-only e preparar dispatch para
`post_p3_excel_runtime_docs_rebaseline`. Nao liberar worker material ate esse
rebaseline ser julgado ou ate o judge registrar explicitamente que os docs
stale nao bloqueiam a proxima owner window.

# Post P3 Excel Runtime Docs Rebaseline

Data: 2026-06-13 22:34:40 -03
Status: ready_for_judge_review

## Escopo

Rebaseline docs-only para alinhar os docs de produto/QA ao estado validado da
branch: entrada Excel/XLSX ja foi integrada e validada no runtime Electron pelo
owner window `post_p3_excel_input_runtime_exposure`.

Nao implementei codigo, testes, runtime, IPC/preload, renderer, provider,
release/update, diagnostico, telemetria, licenca/account, PDF/Word/OCR ou
Receita Web.

## Local Docs Handling

`docs/fiscal-desk/**` estava ausente nesta worktree, conforme previsto para docs
local-only/ignored. Li a copia canonica absoluta em
`/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/fiscal-desk/` e copiei
somente os seis arquivos permitidos para esta worktree antes de editar.

## Arquivos Lidos

- `AGENTS.md`
- `docs/goals/fiscal-desk-orchestration/goal.md`
- `docs/goals/fiscal-desk-orchestration/state.yaml`
- `docs/goals/fiscal-desk-orchestration/integration-plan.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-excel-runtime-docs-rebaseline-dispatch-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-excel-runtime-next-owner-window-selection-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-excel-runtime-next-owner-window-selection-judge-decision-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-excel-input-runtime-exposure-integration-judge-decision-2026-06-13.md`
- `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/fiscal-desk/first-release.md`
- `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/fiscal-desk/status.md`
- `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/fiscal-desk/product-spec.md`
- `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/fiscal-desk/roadmap.md`
- `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/fiscal-desk/implementation-plan.md`
- `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/fiscal-desk/quality-gates.md`
- `docs/qa/first-release-validation.md`

## Arquivos Alterados

- `docs/fiscal-desk/first-release.md`
- `docs/fiscal-desk/status.md`
- `docs/fiscal-desk/product-spec.md`
- `docs/fiscal-desk/roadmap.md`
- `docs/fiscal-desk/implementation-plan.md`
- `docs/fiscal-desk/quality-gates.md`
- `docs/qa/first-release-validation.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-excel-runtime-docs-rebaseline-2026-06-13.md`

## Resumo Por Documento

- `first-release.md`: moveu Entrada Excel/XLSX para o corte disponivel agora,
  registrou a integracao runtime e removeu a linha que tratava Entrada Excel
  como planejada/desabilitada.
- `status.md`: adicionou Excel runtime como historico integrado/validado,
  incluindo smokes Electron XLSX, coverage 76.39%, PR coverage 75.59%, lint,
  typecheck, build, ratchet e smoke visual.
- `product-spec.md`: alterou a matriz de disponibilidade para marcar Entrada
  Excel/XLSX atual como disponivel e manteve PDF/Word, Excel formatado/modelavel
  e demais superficies futuras como planejadas/bloqueadas.
- `roadmap.md`: atualizou cortes macro para separar entrada/saida XLSX atual de
  Excel formatado/modelavel, templates e PDF/Word/OCR futuros.
- `implementation-plan.md`: removeu a instrucao stale de tratar Excel como
  formato ainda desabilitado na fase visual.
- `quality-gates.md`: registrou a evidencia pos-Excel runtime e reforcou que os
  numeros de coverage continuam auxiliares.
- `docs/qa/first-release-validation.md`: incluiu entrada Excel/XLSX no objetivo
  de preservacao e explicitou prova de `inputFormat: "xlsx"` ou evidencia
  equivalente para smoke Electron quando a fase toca XLSX.

## Comandos Rodados

| Comando | Resultado |
|---|---|
| `git status --short --branch --untracked-files=all` | pass; worktree limpa no inicio |
| `git log -5 --oneline` | pass; HEAD `43c5668` |
| `find docs/fiscal-desk -maxdepth 2 -type f` | confirmou ausencia inicial de `docs/fiscal-desk/**` na worktree |
| `cp ... docs/fiscal-desk/` | pass; copiou somente os seis docs locais permitidos da copia canonica absoluta |
| `rg -n "Entrada Excel|Excel|XLSX|planejad|desabilitad|runtime|smoke:electron-ui|76\\.39|283" ...` | pass; usado para localizar leituras stale |
| `git diff -- docs/fiscal-desk/... docs/qa/first-release-validation.md` | pass; mostra apenas `docs/qa/first-release-validation.md` porque `docs/fiscal-desk/**` e local-only/ignored |
| `git diff --check -- docs/fiscal-desk/... docs/qa/first-release-validation.md docs/goals/.../post-p3-excel-runtime-docs-rebaseline-2026-06-13.md` | pass |
| `git diff --no-index --stat <canonico> <worktree>` para os seis docs fiscais | pass com exit 1 esperado por haver diferenca; usado para resumir diffs dos docs ignored |

Nao rodei testes, build, coverage, smokes, dist, publish, stage, commit, push ou
PR, conforme o dispatch docs-only.

## Riscos Residuais

- `docs/fiscal-desk/**` permanece local-only/ignored; o judge precisara copiar
  ou promover esses diffs de volta para a worktree canonica manualmente.
- Atualizar docs para Entrada Excel/XLSX disponivel nao libera Excel
  formatado/modelavel, templates/modelos, PDF/Word/OCR, diagnostico real,
  telemetria, licenca/account, release/update real ou Receita Web live/massiva.
- A heuristica XLSX continua simples: primeira worksheet nao vazia e primeira
  linha nao vazia como header.
- CNPJs numericos que ja perderam zeros a esquerda no Excel continuam risco da
  fonte original.
- O campo operacional `csvParserVersion` segue com nome legado por
  compatibilidade, embora carregue a versao efetiva do parser conforme
  `inputFormat`.

## Recomendacao Ao Judge

Aceitar o rebaseline docs-only se os diffs locais forem promovidos para a
worktree canonica e `docs/qa/first-release-validation.md` for versionado. Depois
disso, nao liberar feature material automaticamente; retornar para selecao
read-only fresca de owner window.

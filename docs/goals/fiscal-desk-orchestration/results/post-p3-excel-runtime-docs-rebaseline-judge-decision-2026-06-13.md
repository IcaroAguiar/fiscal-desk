# Post P3 Excel Runtime Docs Rebaseline Judge Decision

Data: 2026-06-13 22:36:47 -03
Status: approved_docs_only_integrated_local_docs

## Decisao

Aceito o rebaseline docs-only `post_p3_excel_runtime_docs_rebaseline`.

O worker alinhou os docs de produto/QA ao estado real da branch: entrada
Excel/XLSX ja foi integrada e validada no runtime Electron, enquanto CSV segue
preservado e templates/modelos, diagnostico real, telemetria, licenca/account,
release/update real, PDF/Word/OCR e Receita Web live/massiva seguem bloqueados.

Esta decisao nao libera worker material automaticamente. A fila volta para nova
selecao read-only de owner window antes de qualquer proxima feature.

## Promocao Canonica

Promovido para a worktree canonica:

- `docs/fiscal-desk/first-release.md` local-only/ignored;
- `docs/fiscal-desk/status.md` local-only/ignored;
- `docs/fiscal-desk/product-spec.md` local-only/ignored;
- `docs/fiscal-desk/roadmap.md` local-only/ignored;
- `docs/fiscal-desk/implementation-plan.md` local-only/ignored;
- `docs/fiscal-desk/quality-gates.md` local-only/ignored;
- `docs/qa/first-release-validation.md` versionado;
- `docs/goals/fiscal-desk-orchestration/results/post-p3-excel-runtime-docs-rebaseline-2026-06-13.md`.

Os seis arquivos em `docs/fiscal-desk/**` permanecem ignorados/local-only; por
isso nao entram no commit, mas foram atualizados na worktree canonica local.

## Evidencia

- Worker thread: `019ec3c0-8180-7813-adb0-e9abe797b3f4`.
- Worker worktree:
  `/Users/icaroaguiar/.codex/worktrees/ae44/consulta-simples-csv`.
- Worker status: `ready_for_judge_review`.
- O worker copiou os seis docs fiscais da copia canonica absoluta para sua
  worktree antes de editar, conforme dispatch.
- `git diff --check -- docs/fiscal-desk/first-release.md docs/fiscal-desk/status.md docs/fiscal-desk/product-spec.md docs/fiscal-desk/roadmap.md docs/fiscal-desk/implementation-plan.md docs/fiscal-desk/quality-gates.md docs/qa/first-release-validation.md docs/goals/fiscal-desk-orchestration/results/post-p3-excel-runtime-docs-rebaseline-2026-06-13.md`
  passou na canonical apos promocao.
- Busca por leituras stale de Entrada Excel como nao disponivel/planejada nos
  arquivos permitidos nao encontrou blocker; a unica ocorrencia retornada pelo
  scan canonico diz que Excel runtime integrado nao libera features futuras.
- Testes/build/smokes nao foram rodados por decisao de dispatch docs-only; a
  evidencia executavel permanece no judge decision de Excel runtime.

## Riscos Residuais

- `docs/fiscal-desk/**` segue local-only/ignored; se esse pacote precisar ser
  compartilhado fora desta maquina, sera necessario decidir versionamento ou
  outro mecanismo de sincronizacao.
- Entrada Excel/XLSX disponivel nao significa Excel formatado/modelavel,
  templates/modelos, PDF/Word/OCR, diagnostico real, telemetria, licenca/account
  ou release/update real.
- A heuristica XLSX continua simples e CNPJs numericos que perderam zeros a
  esquerda no arquivo continuam risco da fonte.

## Proximo Gate

Nenhum material worker esta ativo. A proxima acao segura e uma nova selecao
read-only de owner window.

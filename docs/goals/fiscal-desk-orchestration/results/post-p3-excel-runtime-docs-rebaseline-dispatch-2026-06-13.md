# Post P3 Excel Runtime Docs Rebaseline Dispatch

Data: 2026-06-13 22:28:55 -03
Status: dispatch_prepared

## Contexto Canonico

- Repo canonico: `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv`
- Branch final: `feat/fiscal-desk-local-base-prep`
- HEAD observado: `2e2d4ef docs: accept post excel runtime docs rebaseline`
- Goal mestre: `docs/goals/fiscal-desk-orchestration/goal.md`
- Selecao aceita:
  `docs/goals/fiscal-desk-orchestration/results/post-p3-excel-runtime-next-owner-window-selection-judge-decision-2026-06-13.md`

O judge aceitou `post_p3_excel_runtime_docs_rebaseline` como proxima owner
window `docs-only`. Nenhum worker material esta liberado.

## Missao Do Worker

Executar rebaseline documental apos a integracao validada de entrada Excel/XLSX
no runtime real do app Electron.

Atualizar os docs permitidos para refletir a verdade atual:

- Entrada Excel/XLSX ja tem caminho runtime validado no Electron;
- CSV continua preservado;
- saida XLSX atual continua separada de Excel formatado/modelavel;
- templates/modelos, diagnostico real, telemetria, licenca/account,
  release/update real, PDF/Word/OCR e Receita Web live/massiva continuam
  bloqueados ate owner windows proprios;
- coverage quantitativa continua apenas sinal auxiliar; a prova funcional de
  Excel runtime vem dos smokes Electron ja registrados.

## Leitura Obrigatoria

- `AGENTS.md`
- `docs/goals/fiscal-desk-orchestration/goal.md`
- `docs/goals/fiscal-desk-orchestration/state.yaml`
- `docs/goals/fiscal-desk-orchestration/integration-plan.md`
- Este dispatch
- `docs/goals/fiscal-desk-orchestration/results/post-p3-excel-runtime-next-owner-window-selection-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-excel-runtime-next-owner-window-selection-judge-decision-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-excel-input-runtime-exposure-integration-judge-decision-2026-06-13.md`
- `docs/fiscal-desk/first-release.md`
- `docs/fiscal-desk/status.md`
- `docs/fiscal-desk/product-spec.md`
- `docs/fiscal-desk/roadmap.md`
- `docs/fiscal-desk/implementation-plan.md`
- `docs/fiscal-desk/quality-gates.md`
- `docs/qa/first-release-validation.md`

## Local Docs Handling

`docs/fiscal-desk/**` e local-only/ignored e pode nao existir em worktrees novas.
Se estiver ausente na worktree do worker:

1. Leia a copia canonica absoluta em
   `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/fiscal-desk/`.
2. Crie os mesmos arquivos permitidos na sua worktree copiando o conteudo
   canonico antes de editar.
3. Registre no receipt que a worktree recebeu copia local dos docs ignorados.
4. Nao invente docs do zero. Se a copia canonica absoluta tambem estiver
   indisponivel, pare como `blocked_missing_local_docs`.

`docs/qa/first-release-validation.md` e versionado e deve ser editado somente se
o rebaseline exigir ajuste de validacao/evidencia.

## Allowed Write Set

- `docs/fiscal-desk/first-release.md`
- `docs/fiscal-desk/status.md`
- `docs/fiscal-desk/product-spec.md`
- `docs/fiscal-desk/roadmap.md`
- `docs/fiscal-desk/implementation-plan.md`
- `docs/fiscal-desk/quality-gates.md`
- `docs/qa/first-release-validation.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-excel-runtime-docs-rebaseline-2026-06-13.md`

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

## Requisitos De Conteudo

- Remover a leitura de que Entrada Excel ainda esta apenas
  planejada/desabilitada quando se falar do estado atual.
- Distinguir "Entrada Excel/XLSX atual" de "saida Excel formatada/modelavel",
  "templates/modelos" e "entrega guiada ampla".
- Atualizar `status.md` para incluir a integracao
  `post_p3_excel_input_runtime_exposure` como historico integrado/validado.
- Atualizar `first-release.md` e `product-spec.md` para colocar Entrada Excel no
  conjunto disponivel agora, com riscos residuais corretos.
- Atualizar `roadmap.md` e `implementation-plan.md` apenas o suficiente para
  remover instrucoes stale que digam que Excel deve aparecer desabilitado por
  falta de implementacao.
- Atualizar `quality-gates.md` e/ou `docs/qa/first-release-validation.md`
  somente se necessario para refletir os checks pos-Excel runtime:
  43 arquivos/283 testes, cobertura global 76.39%, PR coverage 75.59%, smokes
  Electron XLSX com `mock` e `base-publica-local`, smoke visual, lint,
  typecheck, build e ratchet.
- Manter explicitos os riscos residuais: heuristica XLSX simples, CNPJ numerico
  que perdeu zeros a esquerda, `csvParserVersion` como nome de campo legado,
  e Receita Web assistida/experimental.

## Checks Obrigatorios

- `git status --short --branch --untracked-files=all`
- `git diff -- docs/fiscal-desk/first-release.md docs/fiscal-desk/status.md docs/fiscal-desk/product-spec.md docs/fiscal-desk/roadmap.md docs/fiscal-desk/implementation-plan.md docs/fiscal-desk/quality-gates.md docs/qa/first-release-validation.md`
- `git diff --check -- docs/fiscal-desk/first-release.md docs/fiscal-desk/status.md docs/fiscal-desk/product-spec.md docs/fiscal-desk/roadmap.md docs/fiscal-desk/implementation-plan.md docs/fiscal-desk/quality-gates.md docs/qa/first-release-validation.md docs/goals/fiscal-desk-orchestration/results/post-p3-excel-runtime-docs-rebaseline-2026-06-13.md`

Nao rodar testes, build, coverage, smokes, dist, publish, stage, commit, push ou
PR para esta janela docs-only.

## Receipt

Escrever somente:

`docs/goals/fiscal-desk-orchestration/results/post-p3-excel-runtime-docs-rebaseline-2026-06-13.md`

Status exatamente um de:

- `ready_for_judge_review`
- `blocked_missing_local_docs`
- `blocked_scope_expansion_required`

O receipt deve conter arquivos lidos, arquivos alterados, comandos rodados,
resumo por documento, checks, riscos residuais e recomendacao ao judge.

## Stop Conditions

Pare com `blocked_scope_expansion_required` se o rebaseline exigir qualquer
arquivo fora do allowed write set ou alterar produto/runtime. Pare com
`blocked_missing_local_docs` se a worktree e a copia canonica absoluta nao
permitirem reconstruir os docs locais.

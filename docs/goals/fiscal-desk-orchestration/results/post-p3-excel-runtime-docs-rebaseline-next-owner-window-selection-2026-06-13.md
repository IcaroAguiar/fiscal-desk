# Post P3 Excel Runtime Docs Rebaseline Next Owner Window Selection

Data: 2026-06-13
Status: approved_scope_candidate
Thread: Codex App independente, read-only scoping
Branch canonica alvo: `feat/fiscal-desk-local-base-prep`
HEAD observado: `59b586b docs: dispatch post excel docs owner selection`

## Owner Window Recomendado

`post_p3_excel_runtime_docs_rebaseline_integrated_first_release_validation`

Classificacao: `non-feature material`.

Esta janela deve executar validacao integrada fresca do candidato local-first
apos entrada Excel/XLSX runtime e rebaseline documental. Ela nao e feature,
release publico, distribuicao, update real, diagnostico real, telemetria,
licenca/account ou trabalho de templates/modelos. O unico output persistente
esperado deve ser um receipt de validacao para o judge.

## Justificativa

Excel/XLSX runtime foi integrado e validado no app Electron, com CSV preservado,
checkpoint/fingerprint por formato, retomada e smokes Electron XLSX com `mock` e
`base-publica-local`. O rebaseline documental pos-Excel tambem foi aceito e
promovido para a worktree canonica local.

Depois desse rebaseline, nao ha material worker ativo. Os docs fiscais atuais
dizem que qualquer nova feature material ainda exige owner window fresca,
allowed writes explicitos, checks proporcionais e reviewer independente. Como a
superficie XLSX foi adicionada depois de validacoes finais anteriores, a janela
mais segura e util agora e revalidar o pacote integrado completo contra o
criterio publico atualizado, antes de liberar entrega guiada, diagnostico,
update/release ou outra feature material.

## Allowed Write Set Recomendado Para O Proximo Worker

Persistente:

- `docs/goals/fiscal-desk-orchestration/results/post-p3-excel-runtime-docs-rebaseline-integrated-first-release-validation-2026-06-13.md`

Transitorio, somente se gerado pelos checks na worktree isolada e sem stage:

- `coverage/**`
- `dist/**`
- `dist-electron/**`
- `.vite/**`
- `/private/tmp/**`

Se qualquer check exigir patch em codigo, teste, config, docs fiscais, QA,
package/lockfile, release metadata ou workflow, a janela deve parar com
`needs_rework` ou `blocked`; nao deve corrigir dentro do proprio escopo.

## Do Not Touch

- `src/**`
- `test/**`
- `package.json`
- `pnpm-lock.yaml`
- `.github/**`
- `electron-builder.yml`
- `docs/fiscal-desk/**`
- `docs/qa/**`
- `docs/adr/**`
- release/update real, dist/publish distribuivel, signing, notarization, deploy
- diagnostico gerado/enviado, telemetria real, licenca/account real
- storage/network/backend remoto
- templates/modelos reutilizaveis
- PDF/Word/OCR reais
- Receita Web live/massiva
- stage, commit, push, PR ou integracao

## Dependencias E Colisoes

Dependencias fechadas:

- `post_p3_excel_input_runtime_exposure` aceito como
  `approved_by_judge_integrated_validated`;
- `post_p3_excel_runtime_docs_rebaseline` aceito como
  `approved_docs_only_integrated_local_docs`;
- `docs/qa/first-release-validation.md` atualizado para exigir prova de XLSX
  quando a fase tocar entrada Excel/XLSX;
- `docs/fiscal-desk/**` canonico local rebaselined, embora ausente nesta
  worktree por ser local-only/ignored.

Colisao:

- sem colisao de writer se o proximo worker escrever apenas o receipt;
- a validacao pode gerar artefatos locais, mas nao deve assumir ownership de
  renderer, IPC, preload, core, providers, release, package ou docs fiscais;
- se a validacao encontrar regressao real, o resultado deve voltar ao judge como
  blocker/rework, nao virar implementacao silenciosa.

## Checks Obrigatorios Para O Proximo Worker

- `git status --short --branch --untracked-files=all`
- `git log -5 --oneline`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm test:coverage`
- `pnpm smoke:real-csv`
- `TMPDIR=/private/tmp FISCAL_DESK_SMOKE_INPUT_FORMAT=xlsx pnpm smoke:electron-ui`
- `TMPDIR=/private/tmp FISCAL_DESK_SMOKE_PROVIDER=base-publica-local FISCAL_DESK_SMOKE_INPUT_FORMAT=xlsx pnpm smoke:electron-ui`
- `TMPDIR=/private/tmp pnpm smoke:visual`
- `pnpm build`
- `gitleaks detect --source . --redact --no-banner`
- `QUALITY_GATE_DIFF_MODE=worktree node docs/ai/quality-gate/check-ratchet.mjs`
- `git diff --check -- docs/goals/fiscal-desk-orchestration/results/post-p3-excel-runtime-docs-rebaseline-integrated-first-release-validation-2026-06-13.md`

Coverage quantitativa continua sendo sinal auxiliar. O receipt do proximo worker
deve explicar a cobertura qualitativa: Electron real, bridge/preload/IPC quando
exercidos, RunLedger/checkpoint/retomada, autosave XLSX, CSV preservado, Base
Publica Local com consentimento quando aplicavel e ausencia de overflow/overlap
no smoke visual.

## Evidencias Lidas

- `AGENTS.md`
- `docs/goals/fiscal-desk-orchestration/goal.md`
- `docs/goals/fiscal-desk-orchestration/state.yaml`
- `docs/goals/fiscal-desk-orchestration/integration-plan.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-excel-runtime-docs-rebaseline-next-owner-window-selection-dispatch-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-excel-runtime-docs-rebaseline-judge-decision-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-excel-runtime-docs-rebaseline-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-excel-input-runtime-exposure-integration-judge-decision-2026-06-13.md`
- `docs/qa/first-release-validation.md`
- `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/fiscal-desk/first-release.md`
- `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/fiscal-desk/status.md`
- `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/fiscal-desk/product-spec.md`
- `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/fiscal-desk/roadmap.md`
- `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/fiscal-desk/implementation-plan.md`
- `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/fiscal-desk/quality-gates.md`
- receipts anteriores de selecao/validacao final usados como formato e
  precedente de janela executavel non-feature

`docs/fiscal-desk/**` estava ausente nesta worktree. Usei somente leitura da
copia canonica absoluta permitida em
`/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/fiscal-desk/`.

## Checks Executados Nesta Selecao

- `git status --short --branch --untracked-files=all`: `## HEAD (no branch)`.
- `git log -5 --oneline`: HEAD `59b586b docs: dispatch post excel docs owner selection`.
- `find docs/fiscal-desk -maxdepth 1 -type f -print`: confirmou ausencia local
  de `docs/fiscal-desk/**`.
- Leitura da copia canonica absoluta de `docs/fiscal-desk/**`.
- `rg` proporcional sobre docs/receipts para `blocked`, `needs_rework`,
  `next owner`, `release`, `security`, `coverage`, `test:coverage`,
  `smoke:electron-ui`, `smoke:visual`, `Base Publica`, `CSV`, `XLSX`, `Excel`,
  `Receita Web`, `update`, `diagnostico`, `telemetria`, `licenca`,
  `templates`, `PDF`, `Word`, `OCR` e `first release`.

Nao rodei testes, build, smokes, coverage, dist, publish, signing,
notarization, deploy, stage, commit, push ou PR, conforme este dispatch
read-only.

## Riscos Residuais

- A validacao executavel fresca ainda nao rodou nesta thread.
- `docs/fiscal-desk/**` continua local-only/ignored; threads futuras precisam
  receber fallback canonico ou copia controlada quando o dispatch exigir esses
  docs.
- Coverage global pos-Excel ficou abaixo de 80%; deve seguir como baseline/sinal
  e nao prova funcional isolada.
- XLSX continua com heuristica simples: primeira worksheet nao vazia e primeira
  linha nao vazia como header.
- CNPJs numericos que ja perderam zeros a esquerda no Excel continuam risco da
  fonte original.
- Smokes Electron podem exigir rerun fora do sandbox se houver bloqueio de
  ambiente; isso deve ser registrado como blocker concreto, nao mascarado.

## Itens Que Seguem Bloqueados

- release/public distribution, dist/publish distribuivel, signing e notarization;
- updater/update real;
- diagnostico gerado/enviado ou pacote real;
- telemetria real;
- licenca/account real;
- storage/network/backend remoto;
- entrega guiada com templates/modelos reutilizaveis;
- PDF/Word/OCR reais;
- Receita Web live/massiva ou promessa de automacao robusta em lote;
- qualquer feature material sem nova owner window julgada.

## Itens Bloqueados Nesta Selecao

Nenhum blocker concreto impede a janela recomendada. A selecao nao aprova a
execucao; ela apenas recomenda o dispatch ao judge.

## Recomendacao Curta Ao Judge

Aceitar como `approved_scope_candidate` e despachar
`post_p3_excel_runtime_docs_rebaseline_integrated_first_release_validation` como
validacao executavel non-feature. So depois do resultado dessa validacao o judge
deve decidir se libera uma feature material ou mantem a fila bloqueada por
evidencia concreta.

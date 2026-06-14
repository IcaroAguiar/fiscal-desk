# Post P3 Excel Runtime Docs Rebaseline Integrated First Release Validation Dispatch

Data: 2026-06-13 22:48 -03
Status: `dispatch_prepared`
Branch canonica alvo: `feat/fiscal-desk-local-base-prep`
Target minimo: `105ec0a`
Owner window: `post_p3_excel_runtime_docs_rebaseline_integrated_first_release_validation`
Classificacao: `non-feature material validation`

## Missao Para Thread Codex App

Use `/goal` com modelo `gpt-5.5` e reasoning `medium`.

Valide o pacote integrado local-first depois da entrada Excel/XLSX runtime e do
rebaseline documental pos-Excel. Esta janela e executavel, mas nao e uma janela
de feature. O objetivo e produzir evidencia fresca do app integrado e devolver
um receipt para o judge.

## Escopo Autorizado

Allowed write persistente:

- `docs/goals/fiscal-desk-orchestration/results/post-p3-excel-runtime-docs-rebaseline-integrated-first-release-validation-2026-06-13.md`

Artefatos transitorios permitidos, sem stage e sem integracao:

- `coverage/**`
- `dist/**`
- `dist-electron/**`
- `.vite/**`
- `/private/tmp/**`

Forbidden persistent writes:

- `src/**`
- `test/**`
- `package.json`
- `pnpm-lock.yaml`
- `.github/**`
- `electron-builder.yml`
- `docs/fiscal-desk/**`
- `docs/qa/**`
- `docs/adr/**`
- qualquer arquivo fora do receipt permitido

Side effects proibidos:

- stage;
- commit;
- push;
- PR;
- deploy;
- publish;
- dist packaging distribuivel;
- signing;
- notarization;
- updater/update real;
- telemetria real;
- envio de diagnostico;
- licenca/account real;
- qualquer side effect externo.

## Checks Obrigatorios

Execute e registre comando, resultado e evidencia curta:

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

Se algum smoke Electron falhar por bloqueio de sandbox/ambiente, registre o erro
exato e reexecute somente com permissao apropriada do runtime. Nao mascare a
falha como sucesso.

## Cobertura Qualitativa Obrigatoria

O receipt deve explicar se a evidencia confirma comportamento real para:

- CSV preservado;
- XLSX/Excel runtime;
- bridge/preload/IPC exercidos pelos smokes Electron quando aplicavel;
- RunLedger/checkpoint/retomada;
- autosave XLSX;
- Base Publica Local com consentimento quando aplicavel;
- ausencia de overflow/overlap nos smokes visuais;
- cobertura quantitativa como sinal auxiliar, nao prova funcional isolada.

## Regras De Parada

Se qualquer check falhar, pare com `needs_rework` ou `blocked` e registre:

- comando;
- erro observado;
- causa provavel;
- impacto;
- recomendacao de proxima owner window.

Nao corrija codigo, testes, config, docs fiscais/QA, package/lockfile, release
metadata ou workflows dentro desta janela.

## Contexto Para Ler

- `AGENTS.md`
- `docs/goals/fiscal-desk-orchestration/goal.md`
- `docs/goals/fiscal-desk-orchestration/state.yaml`
- `docs/goals/fiscal-desk-orchestration/integration-plan.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-excel-runtime-docs-rebaseline-next-owner-window-selection-judge-decision-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-excel-runtime-docs-rebaseline-next-owner-window-selection-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-excel-runtime-docs-rebaseline-judge-decision-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-excel-input-runtime-exposure-integration-judge-decision-2026-06-13.md`
- `docs/qa/first-release-validation.md`

Se `docs/fiscal-desk/**` estiver ausente na worktree isolada por ser local-only
ou ignored, use somente leitura da copia canonica absoluta em
`/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/fiscal-desk/`.
Nao copie nem edite esses docs nesta janela.

## Resultado Esperado

Um receipt unico em:

`docs/goals/fiscal-desk-orchestration/results/post-p3-excel-runtime-docs-rebaseline-integrated-first-release-validation-2026-06-13.md`

Status aceitos:

- `ready_for_judge_review`, se todos os checks obrigatorios passarem;
- `needs_rework`, se a branch integrada falhar em check corrigivel por owner
  window futura;
- `blocked`, se houver impedimento concreto de ambiente ou dependencia externa
  que o worker nao pode resolver no escopo.

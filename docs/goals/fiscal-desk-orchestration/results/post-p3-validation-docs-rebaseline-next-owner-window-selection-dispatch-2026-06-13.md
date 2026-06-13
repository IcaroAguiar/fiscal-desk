# Post P3 Validation Docs Rebaseline Next Owner Window Selection Dispatch

Data: 2026-06-13 18:44 -03
Status: `prepared_for_dispatch`

## Objetivo

Executar uma selecao read-only fresca da proxima owner window do Fiscal Desk
apos o fechamento da janela docs-only
`post_p3_readiness_first_release_validation_docs_rebaseline`.

Esta selecao existe para impedir execucao material fora de ordem e para evitar
novo loop documental sem blocker real.

## Contexto Canonico

- Branch canonica: `feat/fiscal-desk-local-base-prep`
- Commit base minimo aceito: `aea3596 docs: accept validation docs rebaseline`
- Judge/orquestrador: `019ebe5c-3853-79c2-87ad-8ddace386c93`
- Resultado esperado:
  `docs/goals/fiscal-desk-orchestration/results/post-p3-validation-docs-rebaseline-next-owner-window-selection-2026-06-13.md`

## Escopo

Classificacao: `read_only_owner_window_selection`

Allowed write unico:

- `docs/goals/fiscal-desk-orchestration/results/post-p3-validation-docs-rebaseline-next-owner-window-selection-2026-06-13.md`

Forbidden writes:

- `src/**`
- `test/**`
- `docs/fiscal-desk/**`
- `docs/qa/**`
- `docs/adr/**`
- `package.json`
- `pnpm-lock.yaml`
- `.github/**`
- `electron-builder.yml`
- `docs/goals/fiscal-desk-orchestration/state.yaml`
- `docs/goals/fiscal-desk-orchestration/integration-plan.md`
- `dist/**`
- `dist-electron/**`
- `release/**`
- qualquer arquivo fora do allowed write
- stage, commit, push, PR, deploy, publish, dist, signing, notarization,
  updater, telemetry, diagnostic sending, release, packaging distribution ou
  qualquer side effect externo.

## Pergunta De Selecao

Escolha exatamente uma proxima owner window.

A selecao deve priorizar uma janela material executavel se os docs/gates atuais
ja estiverem coerentes. Uma nova janela docs-only so e aceitavel se houver
blocker documental concreto que impeça definir ou executar a proxima janela
material com seguranca.

Opcoes possiveis devem ser avaliadas contra o estado real do branch:

- proxima janela material de Fiscal Desk que ainda esteja pendente e tenha
  allowed write isolavel;
- release/security/readiness gate read-only se o branch exigir novo gate antes
  de material work;
- docs-only apenas se houver incoerencia factual bloqueante, com arquivo exato
  e motivo.

Nao selecione release publico, dist/publish, update real, diagnostico enviado,
telemetria real, licenca/account, templates/modelos, PDF/Word/OCR ou Receita Web
live/massiva como disponiveis sem owner window proprio.

## Leituras Obrigatorias

- `AGENTS.md`
- `docs/goals/fiscal-desk-orchestration/goal.md`
- `docs/goals/fiscal-desk-orchestration/state.yaml`
- `docs/goals/fiscal-desk-orchestration/integration-plan.md`
- `docs/qa/first-release-validation.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-readiness-first-release-validation-docs-rebaseline-judge-decision-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-readiness-first-release-validation-docs-rebaseline-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-rebaseline-readiness-next-owner-window-selection-judge-decision-2026-06-13.md`
- receipts recentes de P3 renderer, hardening de intake CSV, Base Publica
  Local, F8B1, F6E2C, coverage gate, release/security reviews e rebaseline
  docs/status.

Se `docs/fiscal-desk/**` estiver ausente na worktree, use a copia canonica
absoluta `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/fiscal-desk/**`
somente para leitura. Registre a limitacao; nao bloqueie automaticamente se a
copia canonica estiver disponivel.

## Checks Esperados

- `git status --short --branch --untracked-files=all`
- `git log -3 --oneline`
- `rg` proporcional nos docs/receipts para:
  `blocked`, `needs_rework`, `release`, `security`, `coverage`, `test:coverage`,
  `smoke:electron-ui`, `smoke:visual`, `smoke:real-csv`, `Base Publica`,
  `F8B1`, `F6E2C`, `P3`, `CSV`, `Receita Web`, `update`, `diagnostico`,
  `telemetria`, `licenca`, `templates`, `PDF`, `Word`, `OCR`.
- `git diff --check -- docs/goals/fiscal-desk-orchestration/results/post-p3-validation-docs-rebaseline-next-owner-window-selection-2026-06-13.md`
  apos criar o receipt.

## Output Obrigatorio

Criar o receipt permitido com:

- status exatamente um de `approved_scope_candidate`, `needs_more_info` ou
  `blocked`;
- proxima owner window selecionada;
- classificacao da janela;
- allowed write recomendado;
- dependencias e limites;
- justificativa por que nao ha colisao com janelas integradas;
- se selecionar docs-only, blocker factual com arquivo/linha e por que isso
  impede uma janela material;
- checks executados e gaps;
- riscos residuais;
- recomendacao ao judge.

Nao se autoaprove; o judge decide.

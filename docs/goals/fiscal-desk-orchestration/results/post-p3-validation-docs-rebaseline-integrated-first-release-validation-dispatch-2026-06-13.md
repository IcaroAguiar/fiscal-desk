# Post P3 Validation Docs Rebaseline Integrated First Release Validation Dispatch

Data: 2026-06-13 18:50 -03
Status: `prepared_for_dispatch`

## Objetivo

Executar a janela
`post_p3_validation_docs_rebaseline_integrated_first_release_validation`.

Esta janela deve produzir evidencia executavel fresca do candidato integrado
local-first do primeiro release, apos o rebaseline de validacao publica. Ela nao
implementa feature, nao altera codigo e nao faz release/distribuicao.

## Contexto Canonico

- Branch canonica: `feat/fiscal-desk-local-base-prep`
- Commit minimo: `d42e533 docs: approve integrated release validation window`
- Judge/orquestrador: `019ebe5c-3853-79c2-87ad-8ddace386c93`
- Decisao de selecao:
  `results/post-p3-validation-docs-rebaseline-next-owner-window-selection-judge-decision-2026-06-13.md`
- Receipt esperado:
  `docs/goals/fiscal-desk-orchestration/results/post-p3-validation-docs-rebaseline-integrated-first-release-validation-2026-06-13.md`

## Escopo

Classificacao: `executable_validation_non_feature_material`

Allowed write persistente:

- `docs/goals/fiscal-desk-orchestration/results/post-p3-validation-docs-rebaseline-integrated-first-release-validation-2026-06-13.md`

Artefatos transitorios permitidos na worktree, sem stage/commit/copia para o
branch canonico:

- `node_modules/**`
- `coverage/**`
- `dist/**`
- `dist-electron/**`
- `.vite/**`
- `/private/tmp/**`

Forbidden persistent writes:

- `src/**`
- `test/**`
- `docs/fiscal-desk/**`
- `docs/qa/**`
- `docs/adr/**`
- `package.json`
- `pnpm-lock.yaml`
- `.github/**`
- `electron-builder.yml`
- `release/**`
- qualquer arquivo fora do receipt permitido

Side effects proibidos:

- stage, commit, push, PR, deploy, publish, dist packaging, signing,
  notarization, updater, telemetry, diagnostic sending, release, packaging
  distribution ou side effect externo.

## Leituras Obrigatorias

- `AGENTS.md`
- `docs/goals/fiscal-desk-orchestration/goal.md`
- `docs/goals/fiscal-desk-orchestration/state.yaml`
- `docs/goals/fiscal-desk-orchestration/integration-plan.md`
- `docs/qa/first-release-validation.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-validation-docs-rebaseline-next-owner-window-selection-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-validation-docs-rebaseline-next-owner-window-selection-judge-decision-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-readiness-first-release-validation-docs-rebaseline-judge-decision-2026-06-13.md`
- receipts recentes de P3 renderer, CSV input intake hardening, Base Publica
  Local, F8B1, F6E2C, coverage gate e release/security/readiness reviews.

Se `docs/fiscal-desk/**` estiver ausente na worktree, use a copia canonica
absoluta `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/fiscal-desk/**`
somente para leitura. Registre a limitacao; nao bloqueie automaticamente se a
copia canonica estiver disponivel.

## Checks Obrigatorios

Rodar, nesta ordem quando viavel:

- `git status --short --branch --untracked-files=all`
- `git log -3 --oneline`
- `pnpm install --frozen-lockfile`, somente se `node_modules` ou binarios locais
  estiverem ausentes; nao pode alterar `package.json` nem `pnpm-lock.yaml`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm test:coverage`
- `pnpm smoke:real-csv`
- `pnpm smoke:electron-ui`
- `FISCAL_DESK_SMOKE_PROVIDER=base-publica-local pnpm smoke:electron-ui`
- `pnpm smoke:visual`
- `pnpm build`
- `gitleaks detect --source . --redact --no-banner`
- `node docs/ai/quality-gate/check-ratchet.mjs`
- `git diff --check -- docs/goals/fiscal-desk-orchestration/results/post-p3-validation-docs-rebaseline-integrated-first-release-validation-2026-06-13.md`

Nao rode `pnpm dist:*`, `electron-builder`, deploy, publish, signing,
notarization, updater, diagnostico enviado ou qualquer side effect externo.

Se `gitleaks` nao estiver instalado, registre o blocker/fallback exato e use
scan redigido proporcional como evidencia substituta, sem afirmar que o gate
passou.

## Output Obrigatorio

Criar o receipt permitido em portugues-BR com:

- status exatamente um de `ready_for_judge_review`, `needs_rework` ou
  `blocked`;
- commit/head validado;
- checks executados e resultado;
- checks nao executados e motivo;
- caminhos dos artefatos relevantes, especialmente coverage e screenshots ou
  relatorios de smoke quando existirem;
- confirmacao de que nao houve alteracao persistente fora do receipt;
- riscos residuais;
- recomendacao ao judge.

Retorne `needs_rework` se qualquer check funcional falhar com evidencia
atribuivel ao app. Retorne `blocked` se o ambiente impedir validacao suficiente
e nao houver evidencia substituta forte.

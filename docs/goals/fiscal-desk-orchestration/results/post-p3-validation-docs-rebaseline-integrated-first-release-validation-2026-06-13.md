# Post P3 Validation Docs Rebaseline Integrated First Release Validation

Data: 2026-06-13
Thread/worktree: `/Users/icaroaguiar/.codex/worktrees/ef92/consulta-simples-csv`
Judge/orquestrador: `019ebe5c-3853-79c2-87ad-8ddace386c93`
Branch canonica alvo: `feat/fiscal-desk-local-base-prep`
Status final: `needs_rework`

## Commit Validado

- HEAD validado: `4d40402 docs: allow validation worktree bootstrap artifacts`
- Commits recentes:
  - `4d40402 docs: allow validation worktree bootstrap artifacts`
  - `aadd9b8 docs: align release validation dispatch commit`
  - `d42e533 docs: approve integrated release validation window`
- Target minimo da delegacao: `4d40402 docs: allow validation worktree bootstrap artifacts`

## Leituras E Limitacoes

Li os documentos obrigatorios:

- `AGENTS.md`
- `docs/goals/fiscal-desk-orchestration/goal.md`
- `docs/goals/fiscal-desk-orchestration/state.yaml`
- `docs/goals/fiscal-desk-orchestration/integration-plan.md`
- `docs/qa/first-release-validation.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-validation-docs-rebaseline-next-owner-window-selection-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-validation-docs-rebaseline-next-owner-window-selection-judge-decision-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-readiness-first-release-validation-docs-rebaseline-judge-decision-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-validation-docs-rebaseline-integrated-first-release-validation-dispatch-2026-06-13.md`

Tambem li receipts recentes de P3 renderer, hardening de intake CSV, F8B1,
F6E2C, coverage gate e release/readiness reviews em nivel proporcional ao
dispatch.

`docs/fiscal-desk/**` esta ausente nesta worktree. A copia canonica absoluta
permitida existe e foi inspecionada somente para leitura:
`/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/fiscal-desk/**`.
Isso nao bloqueou a validacao.

## Checks Executados

| Comando | Resultado | Evidencia |
|---|---:|---|
| `git status --short --branch --untracked-files=all` | pass | `## HEAD (no branch)` antes dos artefatos e antes do receipt. |
| `git log -3 --oneline` | pass | HEAD em `4d40402`, acima do minimo do dispatch e igual ao minimo da delegacao. |
| `pnpm install --frozen-lockfile` | pass | Executado porque binarios locais estavam ausentes; usou cache local, lockfile up to date, `package.json` e `pnpm-lock.yaml` sem diff. |
| `pnpm lint` | pass | Biome checou 119 arquivos, sem fixes. |
| `pnpm typecheck` | pass | `tsc --noEmit` sem erros. |
| `pnpm test` | pass | 40 arquivos, 264 testes passando. |
| `pnpm test:coverage` | pass | 40 arquivos, 264 testes passando; coverage gerada. |
| `pnpm smoke:real-csv` | pass | Provider `mock`, fixture publica real, saida temporaria gerada. |
| `pnpm smoke:electron-ui` | pass | Provider `mock`, Electron real, XLSX, checkpoint, historico e retomada validados. |
| `FISCAL_DESK_SMOKE_PROVIDER=base-publica-local pnpm smoke:electron-ui` | pass after sandbox rerun | Primeira tentativa falhou antes da logica do app por `listen EPERM` no pipe do `tsx`; rerun fora do sandbox passou com provider `base-publica-local`, XLSX, checkpoint, historico e retomada. |
| `pnpm smoke:visual` | pass | Desktop/tablet/mobile sem overflow, botoes cortados ou overlaps. |
| `pnpm build` | pass | `vite build` e `tsup` passaram. |
| `gitleaks detect --source . --redact --no-banner` | pass | 169 commits e ~16.38 MB escaneados; no leaks found. |
| `node docs/ai/quality-gate/check-ratchet.mjs` | fail | Ratchet default falhou; detalhes abaixo. |

## Falha Do Ratchet

O gate `node docs/ai/quality-gate/check-ratchet.mjs` retornou `status: "fail"`
em `diffMode: "default"` com estes blockers:

- `quality-gate.git-command-failed`: `git diff --unified=0 origin/main...HEAD failed.`
- `code.large-file-ratchet`: contagem de arquivos grandes aumentou de 2 para 4.
- `file.size`: `src/main/execution/file-process-execution-ledger.ts` tem 531 linhas, limite 500.
- `file.size`: `test/unit/process-csv.ipc.test.ts` tem 592 linhas, limite 500.
- `file.size`: `test/unit/receita-browser.client.test.ts` tem 569 linhas, limite 500.
- `touched-bad-area.must-improve`: `test/unit/receita-browser.client.test.ts` cresceu de 567 para 569 linhas.

Como este era um check obrigatorio da janela, nao recomendo `ready_for_judge_review`.
Nao alterei codigo para tentar corrigir porque o dispatch proibe escrita
persistente fora do receipt.

## Artefatos Gerados

Coverage:

- `coverage/coverage-summary.json`
- `coverage/lcov.info`
- `coverage/index.html`
- `coverage/lcov-report/index.html`

Resumo de coverage:

- linhas/statements: `69.85%`
- funcoes: `87.21%`
- branches: `75.67%`

Smoke CSV:

- entrada: `test/fixtures/smoke/cnpjs-publicos-reais.csv`
- saida: `/var/folders/xg/w4k6x0l97bsdxm9rb2j66l9h0000gn/T/fiscal-desk-smoke-8Pd4cR/resultado-mock.csv`

Smoke Electron provider `mock`:

- entrada: `/var/folders/xg/w4k6x0l97bsdxm9rb2j66l9h0000gn/T/fiscal-desk-electron-smoke-Plzeg8/entrada.csv`
- saida XLSX: `/var/folders/xg/w4k6x0l97bsdxm9rb2j66l9h0000gn/T/fiscal-desk-electron-smoke-Plzeg8/entrada-processado.xlsx`
- checkpoint: `/var/folders/xg/w4k6x0l97bsdxm9rb2j66l9h0000gn/T/fiscal-desk-electron-smoke-Plzeg8/user-data/execution-ledgers/mock-62f69ce4c6c06c02df7e5b76.json`

Smoke Electron provider `base-publica-local`:

- entrada: `/var/folders/xg/w4k6x0l97bsdxm9rb2j66l9h0000gn/T/fiscal-desk-electron-smoke-a003ge/entrada.csv`
- saida XLSX: `/var/folders/xg/w4k6x0l97bsdxm9rb2j66l9h0000gn/T/fiscal-desk-electron-smoke-a003ge/entrada-processado.xlsx`
- checkpoint: `/var/folders/xg/w4k6x0l97bsdxm9rb2j66l9h0000gn/T/fiscal-desk-electron-smoke-a003ge/user-data/execution-ledgers/base-publica-local-a2ace441f648f2b43e775eee.json`

Smoke visual:

- pasta: `/var/folders/xg/w4k6x0l97bsdxm9rb2j66l9h0000gn/T/fiscal-desk-visual-smoke/`
- exemplos: `desktop-wide-idle.png`, `desktop-wide-success.png`,
  `mobile-reference-success.png`, `mobile-narrow-success.png`.

Artefatos transitorios locais gerados e nao versionados:

- `node_modules/**`
- `coverage/**`
- `dist/**`
- `dist-electron/**`
- `/var/folders/xg/w4k6x0l97bsdxm9rb2j66l9h0000gn/T/fiscal-desk-*`

## Checks Nao Executados

Nenhum check obrigatorio foi omitido. Nao executei `pnpm dist:*`,
`electron-builder`, publish, deploy, push, PR, signing, notarization, updater,
telemetria, envio de diagnostico ou release, conforme proibido pelo dispatch.

## Integridade Da Worktree

Antes de criar este receipt, `git status --short --branch --untracked-files=all`
mostrava apenas `## HEAD (no branch)`. `git diff -- package.json pnpm-lock.yaml`
nao teve output apos `pnpm install`.

Nao houve alteracao persistente em `src/**`, `test/**`, `docs/fiscal-desk/**`,
`docs/qa/**`, `docs/adr/**`, `package.json`, `pnpm-lock.yaml`, `.github/**`,
`electron-builder.yml`, `release/**` ou outros arquivos persistentes fora deste
receipt.

## Riscos Residuais

- O candidato passou lint, typecheck, testes, coverage, smokes CSV/Electron/visual,
  build e gitleaks, mas falhou o ratchet obrigatorio default.
- Coverage global segue abaixo de um alvo operacional de 80%; continua sendo
  sinal quantitativo, nao prova funcional suficiente.
- A validacao com Base Publica Local precisou de rerun fora do sandbox por
  blocker ambiental `listen EPERM` no pipe do `tsx`; o rerun validou a logica do
  app.
- Receita Web live/massiva, release Windows, updater real, diagnostico enviado,
  telemetria real, licenca/account, templates/modelos, PDF/Word/OCR e publish
  continuam fora de escopo.

## Recomendacao Ao Judge

Recomendo `needs_rework` para esta janela, limitado ao gate de qualidade:
decidir se o ratchet default deve ser corrigido/justificado no branch canonico
ou se a validacao integrada deve ser reexecutada com contexto PR/CI adequado.
Nao ha evidencia de falha funcional do app nos checks executados.

Status final: `needs_rework`

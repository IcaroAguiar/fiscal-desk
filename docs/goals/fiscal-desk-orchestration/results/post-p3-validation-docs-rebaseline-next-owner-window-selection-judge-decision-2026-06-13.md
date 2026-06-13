# Post P3 Validation Docs Rebaseline Next Owner Window Selection Judge Decision

Data: 2026-06-13 18:50 -03
Status: `approved_by_judge_scope_candidate`

## Entrada Julgada

- Worker thread: `019ec2f3-4573-7462-9125-2e2103845da3`
- Worker worktree: `/Users/icaroaguiar/.codex/worktrees/c7cb/consulta-simples-csv`
- Worker receipt: `results/post-p3-validation-docs-rebaseline-next-owner-window-selection-2026-06-13.md`
- Worker status: `approved_scope_candidate`
- Target minimo: `38e7657`

## Decisao

Aceito a selecao da proxima owner window:

`post_p3_validation_docs_rebaseline_integrated_first_release_validation`

Classificacao aceita pelo judge:
`executable_validation_non_feature_material`.

Esta janela e executavel porque rodara evidencias reais do branch integrado,
mas nao e uma janela de feature, release publico, distribuicao, update,
telemetria, diagnostico, licenca/account ou templates/modelos.

## Racional

O blocker documental anterior foi fechado e integrado. O documento publico de
validacao agora reconhece `pnpm test:coverage`, `coverage/coverage-summary.json`
e `coverage/lcov.info`, preservando que coverage e sinal quantitativo, nao
prova funcional suficiente.

Nao ha blocker factual novo que justifique outra janela docs-only neste ponto.
A proxima acao correta e validar o candidato integrado local-first com checks,
coverage e smokes reais, sem publicar nem empacotar distribuivel.

## Escopo Da Proxima Janela

Allowed write persistente:

- `docs/goals/fiscal-desk-orchestration/results/post-p3-validation-docs-rebaseline-integrated-first-release-validation-2026-06-13.md`

Artefatos transitorios permitidos na worktree da proxima thread, sem stage e
sem integracao:

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

## Checks Esperados Na Proxima Janela

- `git status --short --branch --untracked-files=all`
- `git log -3 --oneline`
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

Se qualquer check falhar, a thread deve registrar falha real com comando,
evidencia, causa provavel e recomendacao de rework. Nao deve mascarar falha de
runtime como ajuste documental.

## Evidencia Do Judge

- Thread `019ec2f3-4573-7462-9125-2e2103845da3`: finalizou com
  `approved_scope_candidate`.
- Worktree do worker: somente o receipt permitido ficou untracked.
- `git -C /Users/icaroaguiar/.codex/worktrees/c7cb/consulta-simples-csv diff --check -- docs/goals/fiscal-desk-orchestration/results/post-p3-validation-docs-rebaseline-next-owner-window-selection-2026-06-13.md` passou sem output.
- `docs/qa/first-release-validation.md` ja contem o pacote de checks e a
  distincao quantitativa/qualitativa exigida.
- `.gitignore` confirma que `coverage`, `dist`, `dist-electron` e `.vite` sao
  artefatos ignorados, adequados como outputs transitorios de validacao.

## Resultado

Material feature work continua bloqueado. A unica liberacao desta decisao e a
janela de validacao executavel local-first descrita acima.

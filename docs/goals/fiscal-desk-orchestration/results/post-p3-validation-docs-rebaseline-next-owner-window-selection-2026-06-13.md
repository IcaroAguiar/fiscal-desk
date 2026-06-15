# Post P3 Validation Docs Rebaseline Next Owner Window Selection

Data: 2026-06-13
Thread: Codex App independente
Judge/orquestrador: `019ebe5c-3853-79c2-87ad-8ddace386c93`
Branch canonica alvo: `feat/fiscal-desk-local-base-prep`
Target minimo da delegacao: `38e7657 docs: dispatch next owner selection after validation rebaseline`
Commit local revisado: `38e7657 docs: dispatch next owner selection after validation rebaseline`
Status final: `approved_scope_candidate`

## Janela Selecionada

Seleciono exatamente uma proxima owner window:

`post_p3_validation_docs_rebaseline_integrated_first_release_validation`

Classificacao: `executable_validation_non_feature_material`.

Esta e uma janela executavel de validacao integrada, nao uma janela de feature,
release publico ou distribuicao. O objetivo e rodar evidencia fresca no branch
canonico rebaselined para o candidato local-first do primeiro release, usando o
criterio publico atualizado em `docs/qa/first-release-validation.md`.

## Allowed Write Recomendado

Allowed write principal:

- `docs/goals/fiscal-desk-orchestration/results/post-p3-validation-docs-rebaseline-integrated-first-release-validation-2026-06-13.md`

Allowed write transitorio, apenas se os comandos gerarem artefatos locais:

- `coverage/**`
- `/private/tmp/**`

Nao permitir alteracoes persistentes em `src/**`, `test/**`, `docs/fiscal-desk/**`,
`docs/qa/**`, `docs/adr/**`, `package.json`, `pnpm-lock.yaml`, `.github/**`,
`electron-builder.yml`, `dist/**`, `dist-electron/**`, `release/**` ou qualquer
arquivo fora do receipt permitido. Se qualquer check exigir patch de codigo,
config, workflow, docs de produto ou release metadata, a janela deve parar com
status de blocker/rework e devolver ao judge uma nova selecao.

## Justificativa

Nao selecionei uma nova janela docs-only porque o blocker documental que existia
foi fechado. O judge aceitou a rebaseline em
`post-p3-readiness-first-release-validation-docs-rebaseline-judge-decision-2026-06-13.md`:
o documento publico agora inclui `pnpm test:coverage`,
`coverage/coverage-summary.json` e `coverage/lcov.info`, preservando que coverage
nao basta sem evidencia qualitativa.

Tambem nao encontrei uma feature material pendente que deva ser aberta antes de
validar o candidato integrado. Os docs locais canonicos dizem que F6E2C, F8B1,
release/security review, reworks, re-gate da Base Publica Local, hardening de
intake CSV e P3 renderer sao historicos consumidos, nao proximas owner windows.
A fila material esta vazia/bloqueada ate selecao fresca do judge.

A menor janela util agora e executar a validacao integrada fresca do corte
pos-P3, sem marcar distribuicao/release como disponivel. Isso respeita o bias do
dispatch para uma janela material executavel quando nao ha blocker documental
concreto.

## Dependencias E Limites

Dependencias:

- branch canonica no minimo em `38e7657`;
- dependencias locais instaladas ou bootstrap permitido pelo judge da proxima
  janela;
- espaco em disco suficiente para `coverage/**`, build local e smokes;
- ambiente capaz de rodar Electron local e smokes sem rede obrigatoria.

Checks recomendados para a proxima janela:

- `git status --short --branch --untracked-files=all`;
- `git log -3 --oneline`;
- `pnpm lint`;
- `pnpm typecheck`;
- `pnpm test`;
- `pnpm test:coverage`;
- `pnpm smoke:real-csv`;
- `pnpm smoke:electron-ui`;
- `FISCAL_DESK_SMOKE_PROVIDER=base-publica-local pnpm smoke:electron-ui`;
- `pnpm smoke:visual`;
- `pnpm build`;
- `gitleaks detect --source . --redact --no-banner`;
- `node docs/ai/quality-gate/check-ratchet.mjs`;
- `git diff --check -- <receipt>`.

Limites explicitos:

- nao executar dist/publish, signing, notarization, deploy, PR, push ou release;
- nao habilitar update real, diagnostico enviado, telemetria real,
  licenca/account, templates/modelos, PDF/Word/OCR ou Receita Web live/massiva;
- nao tratar coverage percentual como prova funcional;
- se smoke Electron/visual/CSV falhar, registrar falha real e nao mascarar como
  docs-only.

## Analise De Colisao

Nao ha colisao com janelas integradas porque a janela recomendada nao altera
codigo nem contratos. Ela valida o pacote ja integrado na branch unica.

Evidencia de fechamento/consumo das janelas recentes:

- `post_local_base_regate_csv_input_intake_hardening` foi integrado e validado,
  com focused tests, full test, `smoke:real-csv` e `smoke:electron-ui` passando.
- `p3_renderer_missing_column_normalizer_can_hide_new_core_guidance` foi
  integrado e validado, preservando a orientacao completa do core para coluna
  CNPJ ausente.
- F6E2C foi aceito no-code e nao deve ser reaberto como janela atual.
- F8B1 foi integrado seletivamente como estados locais bloqueados, sem update,
  rede, telemetry, diagnostic, license/account ou release config.
- release/security review e follow-ups foram consumidos como gates historicos;
  o readiness review pos-P3 foi aceito como `approved_candidate`.

## Evidencia Lida

Leituras obrigatorias realizadas:

- `AGENTS.md`
- `docs/goals/fiscal-desk-orchestration/goal.md`
- `docs/goals/fiscal-desk-orchestration/state.yaml`
- `docs/goals/fiscal-desk-orchestration/integration-plan.md`
- `docs/qa/first-release-validation.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-validation-docs-rebaseline-next-owner-window-selection-dispatch-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-readiness-first-release-validation-docs-rebaseline-judge-decision-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-readiness-first-release-validation-docs-rebaseline-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-rebaseline-readiness-next-owner-window-selection-judge-decision-2026-06-13.md`

Tambem li/scaneei receipts recentes de P3 renderer, hardening de intake CSV,
Base Publica Local, F8B1, F6E2C, coverage gate, release/security reviews e
docs/status rebaselines.

`docs/fiscal-desk/**` esta ausente nesta worktree. Usei a copia canonica
absoluta permitida, somente leitura:

`/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/fiscal-desk/**`

Isso nao bloqueou esta selecao porque a copia canonica estava disponivel.

## Checks Executados Nesta Selecao

- `git status --short --branch --untracked-files=all`: `## HEAD (no branch)`.
- `git log -3 --oneline`:
  - `38e7657 docs: dispatch next owner selection after validation rebaseline`
  - `aea3596 docs: accept validation docs rebaseline`
  - `23fcfca docs: record validation docs rebaseline thread`
- `find docs/fiscal-desk -maxdepth 3 -type f | sort`: falhou com `No such file or directory`; fallback canonico usado.
- `find /Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/fiscal-desk -maxdepth 3 -type f | sort`: confirmou a copia canonica disponivel.
- `rg` proporcional nos docs/receipts requeridos para `blocked`,
  `needs_rework`, `release`, `security`, `coverage`, `test:coverage`,
  `smoke:electron-ui`, `smoke:visual`, `smoke:real-csv`, `Base Publica`,
  `F8B1`, `F6E2C`, `P3`, `CSV`, `Receita Web`, `update`, `diagnostico`,
  `telemetria`, `licenca`, `templates`, `PDF`, `Word` e `OCR`.

Nao rodei testes, build, smokes, coverage, dist, publish, signing, notarization,
deploy ou side effects externos, conforme restricao deste dispatch read-only.

## Gaps E Riscos Residuais

- Esta selecao e read-only; a validacao executavel fresca ainda precisa rodar na
  proxima owner window.
- Coverage segue abaixo de 80% e deve ser tratada como baseline/sinal, nao como
  aceite funcional isolado.
- `docs/fiscal-desk/**` segue ausente nesta worktree e ignorado/local no modelo
  atual; usei fallback canonico permitido.
- A janela recomendada pode falhar por bootstrap, espaco em disco ou ambiente
  Electron local. Esses seriam blockers de validacao, nao autorizacao para
  transformar a janela em docs-only silencioso.
- Release publico, package/distribution, update real, diagnostico enviado,
  telemetria real, licenca/account, templates/modelos, PDF/Word/OCR e Receita
  Web live/massiva continuam bloqueados ate owner windows proprios.

## Recomendacao Ao Judge

Recomendo aceitar este receipt como `approved_scope_candidate` e despachar a
janela `post_p3_validation_docs_rebaseline_integrated_first_release_validation`.

Essa janela deve ser tratada como validacao executavel do candidato integrado,
nao como release publico e nao como autorizacao para alterar codigo. Se ela
passar, o judge tera evidencia fresca para decidir entre parar como candidato
validado local-first, abrir uma decisao explicita de release/packaging
operacional ou selecionar uma feature futura com owner proprio.

## Opiniao Final

`approved_scope_candidate`

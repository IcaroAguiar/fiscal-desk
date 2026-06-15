# Post P3 Excel Runtime Docs Rebaseline Integrated First Release Validation

Data: 2026-06-13
Status: ready_for_judge_review
Thread: Codex App independente, executable validation non-feature
Branch canonica alvo: `feat/fiscal-desk-local-base-prep`
HEAD observado: `524ed79 docs: dispatch post excel integrated validation`

## Resultado

A validacao executavel integrada passou apos bootstrap controlado da worktree
isolada.

O primeiro bloqueio desta thread era ausencia de `node_modules`, que fazia
`pnpm lint` falhar com `biome: command not found`. A retomada foi autorizada
pelo judge com permissao explicita para `pnpm install --frozen-lockfile` e para
`node_modules/**` como artefato transitorio ignorado.

Depois do bootstrap, todos os checks obrigatorios passaram. Nenhum arquivo
versionado fora deste receipt foi alterado, e `package.json`/`pnpm-lock.yaml`
permaneceram sem diff.

## Bootstrap

| Comando | Resultado | Evidencia |
|---|---|---|
| `test -x node_modules/.bin/biome` | fail antes do bootstrap | Binario local ausente. |
| `pnpm install --frozen-lockfile` | pass | Lockfile up to date; 514 pacotes adicionados em `node_modules`; postinstall Playwright concluido. |
| `test -x node_modules/.bin/biome` | pass apos bootstrap | Binario local disponivel. |
| `git diff -- package.json pnpm-lock.yaml` | pass | Sem output; lockfile/package nao mudaram. |

## Checks Executados

| Comando | Resultado | Evidencia |
|---|---|---|
| `git status --short --branch --untracked-files=all` | pass | `## HEAD (no branch)`; untracked apenas este receipt e `skills/**` herdado fora do escopo. |
| `git log -5 --oneline` | pass | HEAD `524ed79 docs: dispatch post excel integrated validation`; depois `105ec0a`, `82ee9b3`, `59b586b`, `0ffb0ee`. |
| `pnpm lint` | pass | Biome checou 124 arquivos; no fixes applied. |
| `pnpm typecheck` | pass | `tsc --noEmit`. |
| `pnpm test` | pass | 43 arquivos e 283 testes passando. |
| `pnpm test:coverage` | pass | 43 arquivos e 283 testes; cobertura global 76.38% lines/statements, 88.52% funcoes, 76.56% branches. |
| `pnpm smoke:real-csv` | pass | Provider `mock`; fixture publica CSV; 5 linhas, 5 CNPJs encontrados, 4 validos, 3 unicos consultados, 2 optantes, 3 erros esperados. |
| `TMPDIR=/private/tmp FISCAL_DESK_SMOKE_INPUT_FORMAT=xlsx pnpm smoke:electron-ui` | pass apos rerun fora do sandbox | Primeira execucao falhou com `listen EPERM` no pipe do `tsx`; rerun fora do sandbox passou com Electron real, provider `mock`, `inputFormat: "xlsx"`, `deliveryFormat: "xlsx"`, autosave XLSX, checkpoint, historico e retomada. |
| `TMPDIR=/private/tmp FISCAL_DESK_SMOKE_PROVIDER=base-publica-local FISCAL_DESK_SMOKE_INPUT_FORMAT=xlsx pnpm smoke:electron-ui` | pass apos rerun fora do sandbox | Primeira execucao falhou com `listen EPERM`; rerun fora do sandbox passou com Electron real, provider `base-publica-local`, `inputFormat: "xlsx"`, `deliveryFormat: "xlsx"`, autosave XLSX, checkpoint, historico e retomada. |
| `TMPDIR=/private/tmp pnpm smoke:visual` | pass apos rerun fora do sandbox | Primeira execucao falhou com `listen EPERM`; rerun fora do sandbox passou em desktop-wide, desktop-compact, tablet, mobile-wide, mobile-reference e mobile-narrow, sem overflow, botoes cortados ou overlaps. |
| `pnpm build` | pass | Vite renderer e tsup main/preload passaram; `dist/**` e `dist-electron/**` gerados como artefatos transitorios. |
| `gitleaks detect --source . --redact --no-banner` | pass | 251 commits e ~17.18 MB escaneados; no leaks found. |
| `QUALITY_GATE_DIFF_MODE=worktree node docs/ai/quality-gate/check-ratchet.mjs` | pass | Coverage 76.38%; large files baseline 2, current 1; warning nao bloqueante `agentic-review.not-enforced`. |
| `git diff --check -- docs/goals/fiscal-desk-orchestration/results/post-p3-excel-runtime-docs-rebaseline-integrated-first-release-validation-2026-06-13.md` | pass | Sem output. |

## Evidencia Qualitativa

CSV preservado:

- `pnpm smoke:real-csv` processou a fixture publica
  `test/fixtures/smoke/cnpjs-publicos-reais.csv` com provider `mock`.
- O smoke validou leitura real de arquivo CSV, deteccao de coluna `cnpj`,
  normalizacao/deduplicacao, linhas invalidas esperadas e geracao de CSV de
  saida em `/private/tmp`.

XLSX/Excel runtime:

- Os dois smokes Electron rodaram com `FISCAL_DESK_SMOKE_INPUT_FORMAT=xlsx`.
- Ambos retornaram `inputFormat: "xlsx"` e `deliveryFormat: "xlsx"`.
- O arquivo de entrada real foi `entrada.xlsx` e a saida salva foi
  `entrada-processado.xlsx`.

Electron real, bridge/preload/IPC:

- `pnpm smoke:electron-ui` construiu renderer/main e executou o app Electron
  real.
- O fluxo usou `window.appBridge.processCsv` via harness Electron, exercitando
  bridge/preload/IPC para processar a entrada XLSX.

RunLedger, checkpoint e retomada:

- Provider `mock` gerou checkpoint em
  `execution-ledgers/mock-49bad57292996b2eb9f835a9.json`.
- Provider `base-publica-local` gerou checkpoint em
  `execution-ledgers/base-publica-local-5efc2f30b6cb52d584f88fba.json`.
- Ambos os smokes registraram `historyCount: 1`,
  `totalCnpjsRetomados: 1` e `uiResumeText: "1 CNPJ retomado"`.

Autosave XLSX:

- Provider `mock` salvou
  `/private/tmp/fiscal-desk-electron-smoke-sonzQ8/entrada-processado.xlsx`.
- Provider `base-publica-local` salvou
  `/private/tmp/fiscal-desk-electron-smoke-bdS4dq/entrada-processado.xlsx`.

Base Publica Local com consentimento:

- O smoke `base-publica-local` passou com provider local, o que cobre o fluxo
  preparado pelo harness com aceite/consentimento exigido para Base Publica
  Local.
- O resumo retornou 5 linhas, 5 CNPJs encontrados, 4 validos, 3 unicos
  consultados, 1 retomado, 2 optantes, 2 nao optantes e 1 erro esperado.

Smoke visual:

- `pnpm smoke:visual` passou em oito cenarios/viewport combinations.
- Todos retornaram `overflow: false`, `clippedButtons: []` e `overlaps: []`.
- Screenshots foram geradas apenas em `/private/tmp/fiscal-desk-visual-smoke`.

Cobertura quantitativa:

- `pnpm test:coverage` registrou cobertura global de 76.38% para
  lines/statements, 88.52% para funcoes e 76.56% para branches.
- Isto e sinal auxiliar de regressao, nao prova funcional isolada. A prova
  funcional veio dos testes e smokes reais acima.

## Observacoes De Ambiente

- Smokes baseados em `tsx` falharam no sandbox com `listen EPERM` em pipes sob
  `/private/tmp/tsx-501/*.pipe`.
- As reexecucoes fora do sandbox passaram e nao produziram side effects
  externos; os outputs ficaram em `dist/**`, `dist-electron/**` e
  `/private/tmp/**`, todos permitidos pela janela.
- `coverage/**` foi gerado por `pnpm test:coverage`, tambem permitido.
- `node_modules/**` foi criado apenas como bootstrap transitorio autorizado.

## Riscos Residuais

- A worktree permanece em detached HEAD `524ed79`; o prompt informou que o
  dispatch canonico foi corrigido em `fe1b055`, mas a autorizacao adicional veio
  diretamente na retomada desta thread. Nao fiz checkout, merge, stage ou commit.
- `skills/**` aparece como untracked herdado antes e depois da execucao; nao foi
  tocado por esta janela.
- Coverage global segue abaixo de um alvo operacional de 80%, mas o ratchet
  aceitou o estado como baseline/sinal e sem regressao.
- `agentic-review.not-enforced` segue warning nao bloqueante do ratchet; esta
  janela e de validacao non-feature e nao altera codigo material.
- Release/public distribution, updater real, diagnostico real, telemetria,
  licenca/account, templates/modelos, PDF/Word/OCR e Receita Web live/massiva
  continuam bloqueados.

## Recomendacao Ao Judge

Aceitar este receipt como `ready_for_judge_review` da janela de validacao
executavel integrada, sujeito a inspecao do Codex primario.

Nao ha implementacao nova para integrar. O judge deve promover apenas este
receipt, decidir se a validacao fresca fecha o gate pos-Excel, e somente depois
selecionar uma nova owner window para qualquer proxima feature material.

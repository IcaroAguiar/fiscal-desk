# Phase 8A Local Update Diagnostic Contract Scope Review

Status: `approved_candidate`

## Resultado

F8A deve ser separado do pacote UI-first. O menor proximo worker seguro e um `api-designer` de contrato local versionado, core-only, sem rede, sem IPC/preload, sem renderer e sem pacote de diagnostico real. Esse worker deve cristalizar estados e allowlists para update, consentimento, telemetria e diagnostico antes de qualquer UI.

O packet `docs/fiscal-desk/executor-packets/007-auto-update-ui-first.md` continua valido como direcao futura, mas deve ficar bloqueado ate existir contrato local testado. UI-first agora seria maior que o necessario porque tocaria renderer, possivelmente `src/main/types.ts`/`src/main/preload.ts`, exigiria visual smoke e entraria nos shared boundaries ainda sensiveis.

## Arquivos lidos

- `AGENTS.md`
- `docs/goals/fiscal-desk-orchestration/goal.md`
- `docs/goals/fiscal-desk-orchestration/state.yaml`
- `docs/goals/fiscal-desk-orchestration/subagent-registry.md`
- `docs/goals/fiscal-desk-orchestration/integration-plan.md`
- `docs/goals/fiscal-desk-orchestration/phases/phase-8-distribuicao-update-comercial.md`
- `docs/goals/fiscal-desk-orchestration/contracts/phase-8-distribuicao-update-comercial-contract.md`
- `docs/goals/fiscal-desk-orchestration/results/phase-8-distribuicao-update-comercial.md`
- `docs/goals/fiscal-desk-orchestration/results/phase-8-judge-decision.md`
- `docs/goals/fiscal-desk-orchestration/results/integration-wave-8-f6e1-f7b.md`
- `docs/fiscal-desk/executor-packets/007-auto-update-ui-first.md`
- `docs/fiscal-desk/product-spec.md`
- `docs/fiscal-desk/quality-gates.md`
- `docs/adr/0028-community-first-com-limites-comerciais-futuros.md`
- `docs/adr/0029-atualizacao-pelo-app.md`
- `docs/adr/0030-core-open-source-com-marca-e-distribuicao-oficial-controladas.md`
- `docs/adr/0031-telemetria-opcional-desligada-por-padrao.md`
- `docs/adr/0032-pacote-de-diagnostico-local-e-revisavel.md`
- `docs/adr/0033-licenca-pro-local-sem-conta-online-obrigatoria.md`
- `src/main/types.ts`
- `src/main/preload.ts`
- `src/renderer/ui/operational-copy.ts`
- `src/renderer/ui/app-view.ts`
- `src/core/export/export-contract.ts`
- `src/core/public-base/local-public-base.types.ts`

## Arquivos alterados

- `docs/goals/fiscal-desk-orchestration/results/phase-8a-local-update-diagnostic-contract-scope-review.md`

## Decisao de escopo

### O proximo worker deve ser contrato local em core/main types, UI-first bloqueada, ou ambos devem ser separados?

Devem ser separados.

1. F8A: contrato local versionado em `src/core/**`, com testes focados, sem main/preload/renderer.
2. F8B: bridge main/preload somente se o contrato F8A for aceito pelo judge e houver owner window de IPC/preload/types.
3. F8C: UI bloqueada/transparente somente depois de F8A e, se necessario, F8B; o packet `007-auto-update-ui-first.md` entra aqui.

Motivos:

- F8 original foi aceito apenas como docs-only e nao aprova worker executavel amplo.
- `src/main/types.ts` e `src/main/preload.ts` sao shared boundaries; mexer neles cria colisao de owner com runtime/IPC.
- `src/renderer/ui/app-view.ts` e `src/renderer/ui/operational-copy.ts` sao renderer shell/copy; mexer neles exige visual gate.
- O contrato F8 ja recomenda `api-designer` antes de `frontend-builder`.
- O risco central de F8 e vazamento/side effect, nao layout.

## Owner window recomendado

Recomendado: `api-designer` como owner unico de F8A core contract, com `security-reviewer` read-only antes do judge aceitar qualquer worker material subsequente.

Janela:

- owner: `api-designer`
- reviewer obrigatorio para aceite material: `security-reviewer`
- release reviewer: obrigatorio antes de qualquer F8B/F8C que mencione update real, canal, assinatura, metadata, package ou release config; nao e necessario para o contrato core-only se ele mantiver update real bloqueado e sem configuracao de release.

## Allowed writes minimo para F8A

Allowed write set recomendado para o proximo worker:

- `src/core/app/fiscal-desk-local-contract.ts`
- `test/unit/fiscal-desk-local-contract.test.ts`
- `docs/goals/fiscal-desk-orchestration/results/phase-8a-local-update-diagnostic-contract.md`

Allowed write alternativo, somente se o judge exigir export publico pelo main type surface:

- `src/main/types.ts` apenas para reexport type/constant do contrato core, sem IPC channel, sem preload method e sem string channel nova.

O alternativo aumenta risco por tocar shared boundary; a recomendacao principal e nao tocar `src/main/types.ts` em F8A.

## Do-not-touch para F8A

- `src/main/preload.ts`
- `src/main/main.ts`
- `src/main/ipc/**`
- `src/renderer/**`
- `src/core/simples/**`
- `src/core/infra/http-client.ts`
- `src/core/simples/adapters/receita-web/**`
- `docs/fiscal-desk/**`
- `docs/adr/**`
- `docs/goals/fiscal-desk-orchestration/state.yaml`
- `package.json`
- `pnpm-lock.yaml`
- `electron-builder.yml`
- release config, assinatura, notarizacao, metadata remota, deploy
- updater real, `electron-updater`, download, install, network fetch
- telemetria real, transporte, beacon ou endpoint
- pacote de diagnostico gerado/enviado de verdade
- licenca Pro real, validacao externa ou conta online
- provider adapters, backend remoto, banco, PDF/OCR
- stage, commit, push ou PR

## Enums, payloads e allowlists antes de UI

F8A deve criar nomes canonicos, centralizados e testados para:

- `FiscalDeskDistributionChannelState`: `local_only`, `official_channel_pending`, `official_unsigned`, `official_signed`, `third_party_build`.
- `FiscalDeskUpdateCapabilityState`: `blocked_no_channel`, `blocked_unsigned`, `blocked_missing_metadata`, `blocked_user_disabled`, `check_available_manual`, `eligible_future_automatic`.
- `FiscalDeskConsentKey`: `telemetry_basic_opt_in`, `diagnostic_package_manual_share`, `update_manual_check`.
- `FiscalDeskConsentSource`: `user_action`, `migration_default_off`.
- `FiscalDeskConsentState`: key, granted, grantedAt, revokedAt, source.
- `FiscalDeskTelemetryEventClass`: `app_lifecycle`, `feature_usage`, `performance_summary`, `error_summary`.
- `FiscalDeskTelemetryFieldAllowlist`: campos permitidos por classe de evento, sem dados fiscais, paths locais, HTML bruto ou identificador persistente de maquina.
- `FiscalDeskTelemetryForbiddenDataClass`: CNPJ, documento/lista de documentos, nome empresarial, resultado fiscal por linha, CSV/XLSX, path local, credenciais, cookies, tokens, headers, HTML bruto, screenshot, provider response.
- `FiscalDeskDiagnosticPackagePolicy`: local, on-demand, reviewable, manual_share_only.
- `FiscalDeskDiagnosticAllowedField`: appVersion, platform, providerCategory, roundedTimestamp, aggregateCounters, canonicalErrorCodes, updateState, consentState, sanitizedLogs.
- `FiscalDeskDiagnosticForbiddenDataClass`: mesmas proibicoes de telemetria, explicitando input/output CSV/XLSX e dumps de browser.
- `FiscalDeskCommercialBoundary`: futuro Pro nao bloqueia dados, historico, exportacoes, uso local basico, `mock` offline ou telemetria default-off.

Se o worker criar helper functions, elas devem ser puras e locais: validacao de allowlist, classificacao de consentimento default-off e checagem de forbidden keys. Nao devem ler arquivo, consultar rede, abrir dialog, persistir estado ou invocar Electron.

## Checks para provar ausencia de rede/update real

Checks recomendados para F8A:

- `pnpm exec vitest run test/unit/fiscal-desk-local-contract.test.ts`
- `pnpm typecheck`
- `pnpm lint`
- `git diff --check`
- `rg -n "electron-updater|autoUpdater|checkForUpdates|setFeedURL|downloadUpdate|quitAndInstall" src package.json pnpm-lock.yaml electron-builder.yml`
  - esperado: nenhuma nova ocorrencia atribuivel ao diff F8A; `electron-builder`/assinatura herdada no lockfile nao conta como updater real.
- `rg -n "fetch\\(|axios|XMLHttpRequest|sendBeacon|net\\.request|https?://" src/core/app src/main src/renderer package.json electron-builder.yml`
  - esperado: nenhuma ocorrencia nova no contrato F8A.
- `git diff -- src/core/app/fiscal-desk-local-contract.ts test/unit/fiscal-desk-local-contract.test.ts src/main/types.ts`
  - revisar que o diff nao adiciona imports de Electron, `ipcRenderer`, `ipcMain`, `fetch`, `http`, `https`, `axios`, `electron-updater`, filesystem ou package/release config.
- Se `src/main/types.ts` for tocado, rodar tambem `pnpm smoke:electron-ui`; se nao for tocado, smoke Electron pode ser pulado com justificativa `core contract only`.

## Checks para provar ausencia de dados fiscais em telemetria/diagnostico

Checks recomendados para F8A:

- Testes unitarios devem afirmar que a allowlist rejeita/nao contem chaves como `cnpj`, `document`, `documento`, `razaoSocial`, `nomeEmpresarial`, `simplesNacional`, `simei`, `csv`, `xlsx`, `html`, `screenshot`, `cookie`, `token`, `authorization`, `path`, `filePath`, `sourceFilePath`, `response`, `payload`.
- Testes unitarios devem validar que consentimento nasce default-off via `migration_default_off`.
- Testes unitarios devem validar que consentimento de diagnostico e por pacote/share action, nao permissao permanente.
- Testes unitarios devem validar que diagnostic package policy e `manual_share_only` e `reviewable`.
- `rg -n "currentCnpj|cnpj|razaoSocial|nomeEmpresarial|simplesNacional|simei|sourceFilePath|filePath|html|screenshot|cookie|token|authorization" src/core/app/fiscal-desk-local-contract.ts test/unit/fiscal-desk-local-contract.test.ts`
  - esperado: ocorrencias apenas em arrays/fixtures de proibicao ou asserts de rejeicao, nunca em allowlists.
- `gitleaks detect --source . --no-git --redact` ou gate equivalente se o PR material tocar diagnostico, logs, telemetria, release ou credenciais.

## Reviews obrigatorios antes de worker material

- `security-reviewer` obrigatorio antes do judge aceitar qualquer contrato ou implementacao que toque telemetria, diagnostico, logs, consentimento, dados fiscais, Receita Web diagnostic content ou provider responses.
- `release-reviewer` obrigatorio antes de qualquer worker que toque canal, assinatura, metadata, `electron-builder.yml`, `package.json`, updater real, release pipeline, notarizacao, Windows packaging ou install/update UX com acao real.
- `agentic-code-review` independente obrigatorio para PR material, conforme `docs/fiscal-desk/quality-gates.md`.
- Visual review/screenshot obrigatorio somente quando F8C tocar renderer/UI.

## Colisao com F6E2 renderer/runtime ou provider boundaries

Sem colisao se F8A seguir core-only em `src/core/app/fiscal-desk-local-contract.ts` e teste unitario proprio.

Ha colisao ou aumento material de risco se F8A tocar:

- `src/main/types.ts`, `src/main/preload.ts` ou `src/main/ipc/**`: shared boundary de IPC/preload/types.
- `src/renderer/ui/app-view.ts`, `src/renderer/ui/operational-copy.ts`, `src/renderer/ui/app.types.ts` ou `src/renderer/styles.css`: renderer shell/copy/visual surface.
- `src/core/simples/**`: provider boundary, incluindo Receita Web; F8A nao precisa conhecer provider internals.
- `src/core/export/**` ou `src/core/ingestion/**`: F6E/F6 delivery/ingestion boundaries; diagnostico F8A nao deve reaproveitar output/export artifacts.

Observacao: a worktree atual ja esta suja com mudancas em renderer, main, providers, tests e scripts. O proximo worker deve ignorar essa sujeira, nao reverter nada e limitar seu diff aos paths permitidos.

## Checks executados nesta revisao

- Verificacao de existencia de todos os documentos obrigatorios originais.
- Leitura dos documentos obrigatorios e superficies `src` listadas no prompt.
- `git status --short docs/goals/fiscal-desk-orchestration/results/phase-8a-local-update-diagnostic-contract-scope-review.md docs/fiscal-desk docs/adr docs/goals/fiscal-desk-orchestration`
- `rg -n "electron-updater|autoUpdater|checkForUpdates|update-electron|update\\.electron|release metadata|notar|sign|assin|auto-update|telemetr|diagn[oó]stic|diagnostic|consent|fetch\\(|axios|http[s]?://|XMLHttpRequest|navigator\\.sendBeacon" src package.json pnpm-lock.yaml electron-builder.yml docs/goals/fiscal-desk-orchestration docs/fiscal-desk docs/adr`
- `rg --files src/core src/main src/renderer/ui test/unit | sort`
- `git status --short`

## Checks nao executados

- `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`, smoke Electron/visual/CSV e gitleaks.

Motivo: esta thread e docs-only scope review e o unico arquivo alterado e este receipt. Esses checks ficam obrigatorios para o worker material conforme a superficie tocada.

## Riscos

- Tocar `src/main/types.ts` cedo demais transforma um contrato local em shared boundary e pode colidir com runtime/IPC.
- UI-first antes da allowlist pode cristalizar copy/acoes sem contrato de privacidade e sem provas de ausencia de rede.
- Diagnostico pode virar canal indireto de vazamento se allowlist nao for positiva e testada.
- Telemetria pode vazar dados fiscais se os testes verificarem apenas nomes obvios e nao classes de dados proibidos.
- `pnpm-lock.yaml` ja contem dependencias de assinatura/notarizacao e `axios` por dependencias existentes; checks precisam distinguir ocorrencias herdadas de novos usos F8A.
- O aviso de harness `magic_string_boundary=29` e `visual_surface_change=1` permanece worktree-level. F8A recomendado mitiga isso centralizando novos literais em um unico contrato e evitando visual surface.

## Stop conditions

- Qualquer necessidade de `electron-updater`, download, install, metadata fetch ou chamada de rede.
- Qualquer proposta de telemetria default-on.
- Qualquer payload permitido contendo CNPJ, documento, resultado fiscal, nome empresarial, path local, CSV/XLSX, HTML bruto, screenshot, cookie, token, header ou provider response.
- Qualquer diagnostico com envio automatico ou consentimento permanente.
- Qualquer toque em `src/renderer/**`, `src/main/preload.ts`, `src/main/ipc/**`, package/lockfile ou release config sem novo owner window.
- Necessidade de validar licenca Pro real, conta online ou ativacao externa.
- Dois failures iguais em checks de allowlist/redaction sem reavaliar o contrato.

## Prompt recomendado para o proximo subagente

```
/goal
Execute F8A local update/diagnostic/consent contract worker para Fiscal Desk.

Contexto:
- F8 foi aprovado apenas como docs-only.
- Nao implemente UI, rede, updater real, telemetria real, diagnostico gerado/enviado, licenca real, release, assinatura, deploy ou package changes.
- O objetivo e criar contrato local versionado core-only para estados de update, consentimento, telemetria allowlist e politica de pacote de diagnostico.

Leia obrigatoriamente:
- AGENTS.md
- docs/goals/fiscal-desk-orchestration/goal.md
- docs/goals/fiscal-desk-orchestration/state.yaml
- docs/goals/fiscal-desk-orchestration/subagent-registry.md
- docs/goals/fiscal-desk-orchestration/integration-plan.md
- docs/goals/fiscal-desk-orchestration/phases/phase-8-distribuicao-update-comercial.md
- docs/goals/fiscal-desk-orchestration/contracts/phase-8-distribuicao-update-comercial-contract.md
- docs/goals/fiscal-desk-orchestration/results/phase-8-distribuicao-update-comercial.md
- docs/goals/fiscal-desk-orchestration/results/phase-8-judge-decision.md
- docs/goals/fiscal-desk-orchestration/results/phase-8a-local-update-diagnostic-contract-scope-review.md
- docs/fiscal-desk/product-spec.md
- docs/fiscal-desk/quality-gates.md
- docs/adr/0028-community-first-com-limites-comerciais-futuros.md
- docs/adr/0029-atualizacao-pelo-app.md
- docs/adr/0030-core-open-source-com-marca-e-distribuicao-oficial-controladas.md
- docs/adr/0031-telemetria-opcional-desligada-por-padrao.md
- docs/adr/0032-pacote-de-diagnostico-local-e-revisavel.md
- docs/adr/0033-licenca-pro-local-sem-conta-online-obrigatoria.md
- src/main/types.ts
- src/main/preload.ts

Allowed writes:
- src/core/app/fiscal-desk-local-contract.ts
- test/unit/fiscal-desk-local-contract.test.ts
- docs/goals/fiscal-desk-orchestration/results/phase-8a-local-update-diagnostic-contract.md

Do not touch:
- src/main/preload.ts
- src/main/main.ts
- src/main/ipc/**
- src/main/types.ts, salvo se o judge explicitamente aceitar o risco de reexport type-only
- src/renderer/**
- src/core/simples/**
- src/core/export/**
- src/core/ingestion/**
- docs/fiscal-desk/**
- docs/adr/**
- docs/goals/fiscal-desk-orchestration/state.yaml
- package.json
- pnpm-lock.yaml
- electron-builder.yml
- release config

Implementar:
- constantes e tipos canonicos para distribution channel state, update capability state, consent key/source/state, telemetry event classes, telemetry field allowlist, forbidden data classes, diagnostic package policy, diagnostic allowed fields e commercial boundary;
- helpers puros apenas se necessarios para validar allowlist/default-off/manual-share policy;
- testes focados provando default-off, manual-share-only, ausencia de fields fiscais em allowlists e ausencia de rede/update real no contrato.

Checks obrigatorios:
- pnpm exec vitest run test/unit/fiscal-desk-local-contract.test.ts
- pnpm typecheck
- pnpm lint
- git diff --check
- rg de ausencia para electron-updater/autoUpdater/checkForUpdates/downloadUpdate/quitAndInstall no diff F8A
- rg de ausencia para fetch/axios/XMLHttpRequest/sendBeacon/net.request/URLs no contrato F8A
- rg/testes provando que CNPJ, documentos, resultado fiscal, nomes, paths, CSV/XLSX, HTML bruto, screenshots, cookies, tokens, headers e provider responses nao entram em telemetry/diagnostic allowlists

Stop se precisar de rede, update real, UI, IPC/preload, package changes, diagnostico enviado automaticamente, telemetria default-on ou licenca real.

Nao fazer stage, commit, push ou PR.
```

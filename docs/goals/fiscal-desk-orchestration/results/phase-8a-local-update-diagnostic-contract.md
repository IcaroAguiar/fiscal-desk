# Phase 8A Local Update Diagnostic Contract

Date: 2026-06-13

## Status

`implementation_candidate_pending_security_review`

F8A criou um contrato local versionado, core-only, para estados de update,
consentimento, telemetria allowlist, politica de diagnostico e limites
comerciais. O candidato nao implementa UI, IPC/preload, rede, updater real,
telemetria real, transporte, geracao/envio de diagnostico, licenca real,
release, assinatura, deploy, package changes, stage, commit, push ou PR.

Aceite ainda exige `security-reviewer` antes do judge aprovar a fase material.

## Arquivos lidos

- `AGENTS.md`
- `/Users/icaroaguiar/Documents/Obsidian Vault/Brain/AGENTS.md`
- `docs/goals/fiscal-desk-orchestration/goal.md`
- `docs/goals/fiscal-desk-orchestration/state.yaml`
- `docs/goals/fiscal-desk-orchestration/subagent-registry.md`
- `docs/goals/fiscal-desk-orchestration/integration-plan.md`
- `docs/goals/fiscal-desk-orchestration/phases/phase-8-distribuicao-update-comercial.md`
- `docs/goals/fiscal-desk-orchestration/contracts/phase-8-distribuicao-update-comercial-contract.md`
- `docs/goals/fiscal-desk-orchestration/results/phase-8-distribuicao-update-comercial.md`
- `docs/goals/fiscal-desk-orchestration/results/phase-8-judge-decision.md`
- `docs/goals/fiscal-desk-orchestration/results/phase-8a-local-update-diagnostic-contract-scope-review.md`
- `docs/goals/fiscal-desk-orchestration/results/phase-8a-local-update-diagnostic-contract-scope-review-judge-decision.md`
- `docs/goals/fiscal-desk-orchestration/results/integration-wave-9-scope-reviews.md`
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
- `src/core/app/process-csv.types.ts`
- `test/unit/process-csv-contracts.test.ts`
- `test/unit/fiscal-desk-phase-6-contracts.test.ts`
- `package.json`

## Arquivos alterados

- `src/core/app/fiscal-desk-local-contract.ts`
- `test/unit/fiscal-desk-local-contract.test.ts`
- `docs/goals/fiscal-desk-orchestration/results/phase-8a-local-update-diagnostic-contract.md`

## Diff summary

- Adicionado contrato canonico local para:
  - `FiscalDeskDistributionChannelState`
  - `FiscalDeskUpdateCapabilityState`
  - `FiscalDeskConsentKey`
  - `FiscalDeskConsentSource`
  - `FiscalDeskConsentState`
  - `FiscalDeskTelemetryEventClass`
  - `FiscalDeskTelemetryAllowedField`
  - `FiscalDeskForbiddenDataClass`
  - `FiscalDeskDiagnosticPackagePolicy`
  - `FiscalDeskDiagnosticAllowedField`
  - `FiscalDeskCommercialBoundary`
- Adicionada allowlist positiva de campos de telemetria por classe de evento.
- Adicionada allowlist positiva de campos de diagnostico.
- Adicionadas classes proibidas compartilhadas por telemetria e diagnostico.
- Adicionados helpers puros para consentimento default-off, checagem de
  allowlist e politica de diagnostico manual/revisavel.
- Adicionados testes focados para centralizacao dos literais, default-off,
  manual-share-only, reviewable, allowlists positivas e ausencia de campos
  fiscais/sensiveis nas allowlists.

## Checks executados

- `test -f` para todos os documentos obrigatorios: pass apos os docs locais
  ignorados serem copiados para esta worktree.
- `pnpm exec vitest run test/unit/fiscal-desk-local-contract.test.ts`: primeiro
  falhou antes de executar porque `node_modules` estava ausente e `vitest` nao
  foi encontrado.
- `pnpm install`: pass; restaurou dependencias locais a partir do lockfile
  existente, sem package change intencional.
- `pnpm exec vitest run test/unit/fiscal-desk-local-contract.test.ts`: pass,
  7 testes.
- `pnpm typecheck`: pass.
- `pnpm lint`: pass.
- `rg -n "electron-updater|autoUpdater|checkForUpdates|setFeedURL|downloadUpdate|quitAndInstall" src package.json pnpm-lock.yaml electron-builder.yml`:
  pass, nenhuma ocorrencia.
- `rg -n "fetch\\(|axios|XMLHttpRequest|sendBeacon|net\\.request|https?://" src/core/app src/main src/renderer package.json electron-builder.yml`:
  encontrou apenas ocorrencias preexistentes fora do contrato F8A:
  `src/renderer/styles.css` data URL SVG e `src/main/main.ts`
  `http://localhost:5173`. Nenhuma ocorrencia nova em
  `src/core/app/fiscal-desk-local-contract.ts`.
- `rg -n "currentCnpj|cnpj|razaoSocial|nomeEmpresarial|simplesNacional|simei|sourceFilePath|filePath|html|screenshot|cookie|token|authorization|header|providerResponse|response|payload|csv|xlsx" src/core/app/fiscal-desk-local-contract.ts test/unit/fiscal-desk-local-contract.test.ts`:
  ocorrencias apenas em classes proibidas do contrato e fixtures/asserts de
  rejeicao nos testes; nenhuma ocorrencia nas allowlists permitidas.
- `git diff --check -- src/core/app/fiscal-desk-local-contract.ts test/unit/fiscal-desk-local-contract.test.ts docs/goals/fiscal-desk-orchestration/results/phase-8a-local-update-diagnostic-contract.md`:
  pass.
- `rg -n "[ \\t]+$" src/core/app/fiscal-desk-local-contract.ts test/unit/fiscal-desk-local-contract.test.ts docs/goals/fiscal-desk-orchestration/results/phase-8a-local-update-diagnostic-contract.md`:
  pass, nenhuma ocorrencia.
- `git status --short --untracked-files=all src/core/app/fiscal-desk-local-contract.ts test/unit/fiscal-desk-local-contract.test.ts docs/goals/fiscal-desk-orchestration/results/phase-8a-local-update-diagnostic-contract.md package.json pnpm-lock.yaml`:
  mostra apenas os tres arquivos F8A como untracked; `package.json` e
  `pnpm-lock.yaml` nao aparecem como alterados.

## Riscos

- A worktree ja estava suja antes de F8A, inclusive em `src/main/**`,
  `src/renderer/**`, providers e testes de outras fases. Este candidato nao
  reverteu nem tocou essas mudancas e limita seu proprio diff aos tres arquivos
  permitidos.
- O harness continua emitindo avisos worktree-level `magic_string_boundary=29`
  e `visual_surface_change=1`. Para F8A, novos literais boundary-defining foram
  centralizados em `src/core/app/fiscal-desk-local-contract.ts`; nenhum arquivo
  visual foi alterado por este worker.
- O contrato define nomes e allowlists, mas ainda nao foi revisado por
  `security-reviewer`. Nao tratar como aceito ate essa revisao.
- O contrato nao implementa persistencia, UI de consentimento ou diagnostic
  package real; futuras fases precisam de owner window e novo judge release.

## Stop conditions encontradas

- Documento obrigatorio `docs/fiscal-desk/product-spec.md` pareceu ausente em
  uma primeira tentativa de leitura, mas a existencia foi revalidada depois da
  copia dos docs locais ignorados e o documento foi lido. O blocker
  `blocked_missing_local_docs` foi descartado como obsoleto.
- Nenhuma necessidade de rede, updater real, UI, IPC/preload, package change,
  diagnostico enviado automaticamente, telemetria default-on, licenca real,
  backend remoto, banco, PDF/OCR, stage, commit, push ou PR foi encontrada.

## Nota de aceite

Este resultado e somente um `implementation_candidate_pending_security_review`.
`security-reviewer` e obrigatorio antes do aceite pelo judge. `release-reviewer`
continua obrigatorio antes de qualquer fase futura que toque canal, assinatura,
metadata, package, updater real, release config ou UX de update com acao real.

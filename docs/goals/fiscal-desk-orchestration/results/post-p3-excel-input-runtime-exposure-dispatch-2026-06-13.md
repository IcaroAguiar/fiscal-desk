# Post P3 Excel Input Runtime Exposure Dispatch

Data: 2026-06-13 21:33:24 -03
Status: dispatch_prepared

## Contexto Canonico

- Repo: `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv`
- Branch final: `feat/fiscal-desk-local-base-prep`
- HEAD observado: `d1b17ee docs: record post excel selection active`
- Goal mestre: `docs/goals/fiscal-desk-orchestration/goal.md`
- Estado: `docs/goals/fiscal-desk-orchestration/state.yaml`
- Plano: `docs/goals/fiscal-desk-orchestration/integration-plan.md`

A selecao read-only `post_p3_excel_ingestion_next_owner_window_selection`
retornou `approved_scope_candidate` e foi aceita pelo judge com ajuste de
allowlist. Esta thread material e a unica autorizada a tocar o boundary de
entrada XLSX no runtime.

## Missao Do Worker

Implementar `post_p3_excel_input_runtime_exposure`: expor a entrada Excel/XLSX
ja existente no core para o fluxo real do app Electron, preservando CSV atual,
retomada/ledger, auto-save de saida e provider `mock` offline default.

O worker deve terminar com receipt candidato para o judge. Nao autoaprovar, nao
integrar na branch canonica, nao stagear e nao commitar.

## Leitura Obrigatoria

- `AGENTS.md`
- `docs/goals/fiscal-desk-orchestration/goal.md`
- `docs/goals/fiscal-desk-orchestration/state.yaml`
- `docs/goals/fiscal-desk-orchestration/integration-plan.md`
- Este dispatch
- `docs/goals/fiscal-desk-orchestration/results/post-p3-excel-ingestion-next-owner-window-selection-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-excel-ingestion-next-owner-window-selection-judge-decision-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-excel-input-core-ingestion-contract-integration-judge-decision-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-excel-input-core-ingestion-contract-review-2026-06-13.md`

## Allowed Write Set

Codigo runtime/app:

- `src/core/app/process-csv.types.ts`
- `src/core/app/process-csv.use-case.ts`
- `src/main/ipc/process-csv.ipc.ts`
- `src/main/preload.ts`
- `src/main/types.ts`
- `src/main/execution/file-process-execution-ledger.ts`
- `src/renderer/ui/app.types.ts`
- `src/renderer/ui/app.ts`
- `src/renderer/ui/app-view.ts`
- `src/renderer/ui/operational-copy.ts`
- `src/renderer/ui/app-helpers.ts`

Testes e smokes:

- `test/integration/process-csv.use-case.test.ts`
- `test/integration/process-csv-ledger-resume.test.ts`
- `test/unit/main/file-process-execution-ledger.test.ts`
- `test/unit/process-csv-contracts.test.ts`
- `test/unit/process-csv.ipc.test.ts`
- `test/unit/process-csv.ipc.delivery.test.ts`
- `test/unit/process-csv.ipc-resume-delivery.test.ts`
- `test/unit/preload.test.ts`
- `test/unit/app-view.test.ts`
- `test/unit/app-helpers.test.ts`
- `test/unit/renderer-operational-copy.test.ts`
- `scripts/smoke-electron-ui.ts`

Receipt:

- `docs/goals/fiscal-desk-orchestration/results/post-p3-excel-input-runtime-exposure-2026-06-13.md`

O worker pode deixar arquivos do allowlist intocados. Se precisar alterar
qualquer arquivo fora desta lista, deve parar com
`blocked_scope_expansion_required` antes de editar.

## Do-Not-Touch

- `src/core/ingestion/**`
- `src/core/export/**`
- `src/core/simples/**`
- `src/core/public-base/**`
- `src/main/main.ts`
- `src/main/ipc/local-public-base.ipc.ts`
- `scripts/smoke-real-csv.ts`
- `scripts/smoke-visual-ui.ts`
- `scripts/perf-local-csv.ts`
- `package.json`
- `pnpm-lock.yaml`
- `electron-builder.yml`
- `.github/**`
- `docs/fiscal-desk/**`
- `docs/qa/**`
- `docs/adr/**`
- `.visual-fidelity/**`
- `dist/**`
- `dist-electron/**`
- release/update/dist/publish/signing/notarization
- diagnostico enviado, telemetria, licenca/account, storage/network/backend
  remoto, templates/modelos, PDF/Word/OCR e Receita Web live/massiva

## Behavioral Requirements

- CSV continua funcional como antes.
- XLSX pode ser escolhido pelo usuario como arquivo de entrada.
- O picker deve aceitar CSV e XLSX com copy honesta.
- O runtime deve processar XLSX usando o core de ingestion ja integrado, sem
  reimplementar parser no main ou renderer.
- O contrato deve preservar fonte, nome/caminho do arquivo, formato de entrada,
  coluna CNPJ opcional, delivery format e provider.
- Retomada/ledger/fingerprint deve distinguir entrada CSV de XLSX para evitar
  reaproveitamento incorreto de checkpoint.
- Auto-save de saida deve continuar funcionando para CSV e XLSX de entrega.
- Provider `mock` deve seguir offline default.
- Base Publica Local nao deve ser alterada, exceto pelo comportamento comum do
  fluxo de entrada se os testes/smokes existentes passarem por ela.
- Receita Web continua assistida/experimental e nao deve ser usada como smoke
  deterministico.

## Required Checks

Antes de entregar `ready_for_judge_review`:

- `git status --short --branch --untracked-files=all`
- `pnpm exec vitest run test/integration/process-csv.use-case.test.ts test/integration/process-csv-ledger-resume.test.ts test/unit/main/file-process-execution-ledger.test.ts test/unit/process-csv-contracts.test.ts test/unit/process-csv.ipc.test.ts test/unit/process-csv.ipc.delivery.test.ts test/unit/process-csv.ipc-resume-delivery.test.ts test/unit/preload.test.ts test/unit/app-view.test.ts test/unit/app-helpers.test.ts test/unit/renderer-operational-copy.test.ts`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm test:coverage`
- `QUALITY_GATE_DIFF_MODE=worktree node docs/ai/quality-gate/check-ratchet.mjs`
- `pnpm build`
- `FISCAL_DESK_SMOKE_INPUT_FORMAT=xlsx pnpm smoke:electron-ui`
- `FISCAL_DESK_SMOKE_PROVIDER=base-publica-local FISCAL_DESK_SMOKE_INPUT_FORMAT=xlsx pnpm smoke:electron-ui`
- `pnpm smoke:visual` se houver copy/layout/estado visivel alterado.
- `git diff --check`

Se o ambiente bloquear smoke Electron por sandbox/cache/processo, registre o
erro exato no receipt. Nao declare validacao completa sem prova real ou blocker
formal.

## Receipt Esperado

Criar somente:

`docs/goals/fiscal-desk-orchestration/results/post-p3-excel-input-runtime-exposure-2026-06-13.md`

Status exatamente um de:

- `ready_for_judge_review`
- `blocked_scope_expansion_required`
- `blocked_dependency_required`
- `blocked_validation_environment`

O receipt deve conter:

- arquivos lidos;
- arquivos alterados;
- resumo do comportamento implementado;
- evidencias de CSV preservado e XLSX novo;
- comandos rodados e resultados;
- smoke Electron com caminho de entrada XLSX;
- limites e riscos residuais;
- itens que seguem bloqueados;
- recomendacao ao judge.

## Stop Conditions

Pare antes de editar se:

- XLSX exigir dependencia nova ou mudanca em `package.json`/`pnpm-lock.yaml`;
- o caminho real exigir provider, export contract, Base Publica Local, Receita
  Web, release/update, diagnostico, telemetria, licenca/account ou docs fiscais;
- o worker precisar reabrir `src/core/ingestion/**`;
- o worker precisar dividir UI/IPC/runtime em workers paralelos;
- os docs/receipts obrigatorios estiverem indisponiveis.

Pare depois de editar como blocker se:

- smoke Electron XLSX nao puder rodar e nao houver prova substituta suficiente;
- o ledger/fingerprint nao puder distinguir CSV/XLSX sem extrapolar allowlist;
- CSV regredir em teste focado, full test ou smoke.

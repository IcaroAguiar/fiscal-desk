# Phase 5: Base Publica Local

Updated: 2026-06-13

## Status

`approved_candidate`

## Scope

F5 foi executada em modo core-only/offline para preparo, indexacao e lookup local da Base Publica Local, sem rede, sem download real e sem alteracao de IPC/preload/renderer/factory, fallback policy ou Receita Web.

## Files Read

- `docs/goals/fiscal-desk-orchestration/phases/phase-5-base-publica-local.md`
- `docs/goals/fiscal-desk-orchestration/results/integration-wave-1-f1-f2-f4.md`
- `docs/goals/fiscal-desk-orchestration/goal.md`
- `docs/goals/fiscal-desk-orchestration/subagent-registry.md`
- `docs/goals/fiscal-desk-orchestration/integration-plan.md`
- `docs/goals/fiscal-desk-orchestration/state.yaml`
- `docs/goals/fiscal-desk-orchestration/results/phase-4-judge-decision.md`
- `src/core/public-base/local-public-base.types.ts`
- `src/core/public-base/local-public-base.index.ts`
- `src/core/public-base/local-public-base.store.ts`
- `src/core/public-base/local-public-base.fixture.ts`
- `src/core/simples/adapters/local-public-base-simples-lookup.adapter.ts`
- `src/core/simples/simples-lookup.types.ts`
- `src/core/simples/simples-lookup.port.ts`
- `test/unit/local-public-base.test.ts`
- `test/integration/process-csv.use-case.test.ts`
- `test/fixtures/smoke/base-publica-local.csv`

## Files Changed

- `src/core/public-base/local-public-base.types.ts`
- `src/core/public-base/local-public-base.index.ts`
- `src/core/simples/adapters/local-public-base-simples-lookup.adapter.ts`
- `test/unit/local-public-base.test.ts`
- `test/integration/process-csv.use-case.test.ts`
- `docs/goals/fiscal-desk-orchestration/results/phase-5-base-publica-local.md`

## Local Offline Contract

- `LocalPublicBasePreparationConsent` explicita aceite, data/hora do aceite, data da base reconhecida e aviso de defasagem reconhecido.
- `prepareLocalPublicBaseFromCsv` valida consentimento antes de ler, preparar ou indexar CSV.
- Ausencia de consentimento, aceite falso, `acceptedAt` vazio, `baseDateAcknowledged` vazio/null ou aviso de defasagem vazio falham com erro local antes de persistir indice.
- O preparo continua offline e recebe conteudo CSV ja local; nao ha rede, download real ou dependencia de Receita Web.
- O status preparado preserva `baseDate`, `preparedAt`, linhas aceitas/rejeitadas, uso estimado em disco e `freshnessWarning`.
- O warning de defasagem continua aviso, nao bloqueio automatico de lookup.

## Fixture

- Fixture pequena validada: `test/fixtures/smoke/base-publica-local.csv`.
- Conteudo cobre tres CNPJs publicos, `data_base=2026-05-20`, `simples_nacional`, `simei` e `atualizado_em`.
- Teste focado valida preparo offline, indexacao, lookup `SUCCESS`, `NOT_FOUND`, `INVALID_CNPJ`, data da base e warning de defasagem.

## Checks

- `pnpm install`: pass, usou lockfile/cache local; nenhum download de base publica.
- `pnpm exec vitest run test/unit/local-public-base.test.ts`: pass, 10 tests.
- `pnpm typecheck`: pass.
- `pnpm lint`: pass.
- `pnpm test`: pass, 33 files and 203 tests.
- `git diff --check`: pass.

## Independent Review

- Reviewer agent: `019ebf43-2be9-78e3-86f8-3bae134bf6b5`.
- First pass found a blocking consent bypass because consent was optional at runtime.
- Rework closed the bypass by making runtime validation reject missing/malformed consent before persistence.
- Final reviewer verdict: `approved_candidate`, no blocking findings in F5 scope.

## Risks And Constraints

- `consent` remains optional in `LocalPublicBasePrepareInput` for compile compatibility with existing IPC boundary because F5 was forbidden from touching IPC/preload/renderer. Runtime core validation still rejects missing consent. Final integration should decide whether to make the type compile-time strict when the IPC owner is free.
- Existing worktree has unrelated dirty state from other phases; F5 changed only the files listed above.
- Harness warnings `magic_string_boundary=29` and `visual_surface_change=1` remain non-blocking and mostly originate outside this F5 scope. F5 added/kept CSV parsing literals and PT-BR local contract strings in core tests; these should be centralized only if the public CSV contract becomes shared across boundaries.
- No Electron/UI smoke was run because F5 did not change executable UI surfaces and was explicitly blocked from IPC/preload/renderer changes.

## Stop Conditions

- No network/download was needed.
- No backend remoto, banco pesado, PDF, release/package or Receita Web changes were needed.
- IPC/preload/renderer/factory were not touched. The UI wiring for consent remains integration work for an owner allowed to touch those files.
- `docs/goals/fiscal-desk-orchestration/state.yaml` was not changed.

## Recommendation

Integrate as an F5 approved candidate after judge review, limited to the changed F5 files above. During final integration, keep the runtime consent gate and schedule a follow-up owner window for IPC/preload/renderer to pass explicit consent into `prepareFromCsv` instead of relying on the runtime rejection path.

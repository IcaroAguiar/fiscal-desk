# First Release Rework Integration Judge Decision

Data: 2026-06-13

Branch canonica: `feat/fiscal-desk-local-base-prep`

## Decisao

`approved_by_judge_integrated_validated`

O judge aceita os dois reworks de primeira release depois de rework e revisao
independente, integra os arquivos aceitos na branch canonica unica e mantem
novas features bloqueadas ate novo gate read-only de release/security.

Esta decisao substitui o estado anterior
`first_release_rework_candidates_need_rework_reopened`. Os candidatos iniciais
nao foram integrados; somente os reworks aprovados foram copiados para a branch
canonica.

## Entradas julgadas

- `first_release_local_privacy_hardening`
  - Thread: `019ec230-33f3-7d63-87ee-85e957bce7c4`
  - Worktree: `/Users/icaroaguiar/.codex/worktrees/15ad/consulta-simples-csv`
  - Receipt: `results/first-release-local-privacy-hardening-2026-06-13.md`
  - Review inicial: `019ec238-e1f7-7eb1-ba09-c631dba472ce`, `needs_rework`
  - Review apos rework: `019ec243-9bd5-7283-a967-8151f3d29aeb`, `approved_candidate`
- `first_release_package_identity_and_publish_safety`
  - Thread: `019ec230-9f62-7cb0-bc46-8d107a055d4b`
  - Worktree: `/Users/icaroaguiar/.codex/worktrees/98af/consulta-simples-csv`
  - Receipt: `results/first-release-package-identity-and-publish-safety-2026-06-13.md`
  - Review inicial: `019ec238-edbb-7112-8e05-1bf8fc9b65cb`, `approved_candidate_with_scope_expansion_required`
  - Review apos rework: `019ec242-a827-72d0-b499-b13f7dbc3fa8`, `approved_candidate`

## Arquivos integrados

- `.github/workflows/pr-quality-gate.yml`
- `.github/workflows/windows-exe.yml`
- `electron-builder.yml`
- `package.json`
- `src/main/execution/file-process-execution-ledger.ts`
- `src/main/ipc/process-csv.ipc.ts`
- `test/unit/main/file-process-execution-ledger.test.ts`
- `test/unit/process-csv.ipc.test.ts`
- `docs/goals/fiscal-desk-orchestration/results/first-release-local-privacy-hardening-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/first-release-package-identity-and-publish-safety-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/first-release-rework-integration-judge-decision-2026-06-13.md`

## Verificacao canonica executada

- `pnpm install --frozen-lockfile`: pass.
- `pnpm typecheck`: pass.
- `pnpm lint`: pass.
- `pnpm exec vitest run test/unit/main/file-process-execution-ledger.test.ts test/unit/process-csv.ipc.test.ts test/unit/process-csv.ipc.delivery.test.ts`: pass, 3 arquivos / 36 testes.
- `pnpm test`: pass, 40 arquivos / 259 testes.
- `pnpm test:coverage`: pass, 40 arquivos / 259 testes.
  - Statements/lines: 69.64%.
  - Branches: 75.34%.
  - Functions: 87.12%.
- `pnpm build`: pass.
- `pnpm smoke:real-csv`: pass com provider `mock`.
- `pnpm smoke:electron-ui`: pass com provider `mock`.
- `FISCAL_DESK_SMOKE_PROVIDER=base-publica-local pnpm smoke:electron-ui`: pass com provider `base-publica-local`.
- `git diff --check`: pass.
- `git diff -- pnpm-lock.yaml`: sem diff.
- Scan de release publish em workflows/package/electron-builder: pass sem matches para release publish removido.
- Scan direto de logs sensiveis em `src/main` e `src/core`: pass sem matches para `console.*sourceFilePath`, `console.*currentCnpj`, `console.*savedPath` ou `console.*checkpointPath`.
- Scan de privacidade nos arquivos tocados: inspecionado. Matches restantes sao campos funcionais locais ou fixtures/asserts de teste; `raw`, `providerResponse` e `razaoSocial` aparecem apenas nos testes que provam remocao do payload bruto.

## Decisoes do judge

- Logs runtime do fluxo IPC deixam de emitir path de entrada, checkpoint,
  CNPJ corrente e path de autosave. Logs retidos ficam em contadores agregados,
  provider, formato de entrega, status e booleanos operacionais.
- Checkpoints do ledger passam a persistir somente a projecao tecnica minima do
  lookup. Checkpoints legados sao sanitizados antes de reuse ou descartados se
  nao forem reutilizaveis.
- `message` de provider nao e mais persistida em checkpoint, porque pode conter
  dado fiscal derivado.
- Warnings de leitura de ledger usam `ledgerKey` e reason categorico, sem
  `error.message` bruto.
- A identidade de release passa a ser `Fiscal Desk` /
  `com.icaroaguiar.fiscal-desk`.
- Todos os scripts `dist:*` ficam com `--publish never`.
- `package.json.private` passa a `true` para bloquear publish NPM acidental.
- `.github/workflows/windows-exe.yml` nao publica GitHub Release, nao usa
  `softprops/action-gh-release`, reduz `contents` para `read` e usa artifact
  `fiscal-desk-windows`.
- `.github/workflows/pr-quality-gate.yml` passa a executar
  `pnpm test:coverage`.

## Riscos residuais aceitos

- CNPJ, `sourceFilePath`, `checkpointPath` e `outputPath` continuam em storage
  local quando necessarios para retomada, historico e exportacao. O rework
  removeu exposicao em logs operacionais e payload bruto de provider, mas nao
  adicionou criptografia nem mudanca de modelo de storage local.
- Linhas retomadas somente de checkpoint podem nao carregar mensagem textual de
  provider, porque `message` foi removida do checkpoint por privacidade.
- A mudanca de `appId` pode fazer builds locais antigos com o appId legado
  parecerem outro app para o sistema operacional. Aceito porque ainda estamos
  antes de um primeiro release empacotado aprovado.
- O workflow Windows ainda responde a tags `v*`, mas agora apenas constroi e
  sobe artifact interno com permissao `contents: read`, sem publish/release.
- Smoke Electron continua como evidencia local/manual; nao foi adicionado ao CI
  por risco de runner GUI flakey em `ubuntu-latest`.
- O aviso de harness `dependency_file_change=1` e esperado: `package.json` foi
  alterado por metadata/scripts/`private: true`; `pnpm-lock.yaml` nao mudou e
  `pnpm install --frozen-lockfile` passou.

## Proxima acao

Abrir um novo gate read-only de release/security pos-rework antes de liberar
qualquer material feature work. A branch canonica deve ser reavaliada como um
todo porque os blockers foram corrigidos e integrados em conjunto.

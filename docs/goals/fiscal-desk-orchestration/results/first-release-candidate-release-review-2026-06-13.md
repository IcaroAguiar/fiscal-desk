# First Release Candidate Release Review

Date: 2026-06-13
Reviewer worktree: `/Users/icaroaguiar/.codex/worktrees/55c0/consulta-simples-csv`
Canonical worktree: `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv`
Source thread: `019ebe5c-3853-79c2-87ad-8ddace386c93`
Status: `needs_rework`

## Resumo executivo

O corte integrado do Fiscal Desk esta coerente como app local-first ja validado
por receipts anteriores: CSV, XLSX atual, RunLedger/retomada, Base Publica
Local consentida, catalogo/fallback, Receita Web assistida/experimental e
estados locais bloqueados permanecem alinhados com o primeiro release.

O gate de release nao deve liberar um release real ainda. Foram encontrados
gaps de release/package que exigem owner window especifico antes de qualquer
release empacotado ou nova feature material:

1. A identidade do produto nos docs locais e Fiscal Desk, mas `package.json` e
   `electron-builder.yml` ainda empacotam como `consulta-simples-csv` /
   `Consulta Simples CSV`.
2. `dist:mac` nao explicita `--publish never`, ao contrario de `dist:win` e
   `dist:win:arm64`. Mesmo sem `publish` configurado em `electron-builder.yml`,
   o primeiro release deve remover ambiguidade de publish antes de qualquer
   empacotamento real.
3. O CI de PR cobre lint/typecheck/test/smoke CSV/smoke visual/build/gitleaks/
   ratchet, mas nao executa `pnpm test:coverage` nem `pnpm smoke:electron-ui`.
   Isso nao invalida os smokes locais ja registrados, mas deixa o gate de PR
   abaixo da matriz qualitativa atual para mudancas que toquem runtime Electron.

Nao ha evidencia de update real, diagnostic package real/enviado, telemetria
real, licenca/account real, storage/network novo, templates/modelos
reutilizaveis, PDF/Word/OCR real ou Receita Web live/massiva liberados por este
corte. Esses limites continuam bloqueados.

## Arquivos e docs lidos

- `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/AGENTS.md`
- `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/goals/fiscal-desk-orchestration/goal.md`
- `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/goals/fiscal-desk-orchestration/state.yaml`
- `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/goals/fiscal-desk-orchestration/integration-plan.md`
- `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/goals/fiscal-desk-orchestration/results/final-integration-review-judge-decision.md`
- `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/goals/fiscal-desk-orchestration/results/staging-versioning-closeout-judge-decision.md`
- `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/goals/fiscal-desk-orchestration/results/testing-infra-coverage-gate-canonical-integration-2026-06-13.md`
- `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/goals/fiscal-desk-orchestration/results/post-f6e2c-first-release-status-rebaseline-judge-decision-2026-06-13.md`
- `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/goals/fiscal-desk-orchestration/results/integration-wave-13-f8b1-renderer-blocked-state.md`
- `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/fiscal-desk/first-release.md`
- `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/fiscal-desk/status.md`
- `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/fiscal-desk/quality-gates.md`
- `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/package.json`
- `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/electron-builder.yml`
- `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/.github/workflows/pr-quality-gate.yml`
- `src/core/app/fiscal-desk-local-contract.ts`
- `src/renderer/ui/app-local-trust-view.ts`
- `src/core/export/export-contract.ts`

## Status de worktree

### Worktree de review

Comando:
`git status --short --branch --untracked-files=all`

Resultado depois do bootstrap/checks:

- `## HEAD (no branch)`
- Somente `skills/**` nao rastreado:
  - `skills/csv-throughput-smoke/**`
  - `skills/electron-ui-evidence-capture/**`

`package.json` e `pnpm-lock.yaml` nao foram alterados pelo
`pnpm install --frozen-lockfile`; `git diff -- package.json pnpm-lock.yaml`
nao retornou diff.

### Canonical

Comando:
`git status --short --branch --untracked-files=all`

Resultado apos a atualizacao do judge sobre o commit canonico
`2239cf2 docs: dispatch fiscal desk release security review`:

- `## feat/fiscal-desk-local-base-prep`
- Somente `skills/**` nao rastreado:
  - `skills/csv-throughput-smoke/**`
  - `skills/electron-ui-evidence-capture/**`

## Checks executados e resultado

### Bootstrap autorizado pelo judge

- `pnpm install --frozen-lockfile`: pass.
  - Lockfile ja estava atualizado.
  - Reusou cache local, `downloaded 0`.
  - Gerou `node_modules/**` ignorado/local.
  - `postinstall` executou `npx playwright install chromium` e concluiu.
  - Nao alterou `package.json` nem `pnpm-lock.yaml`.

### Checks de app permitidos

- `pnpm typecheck`: pass.
- `pnpm lint`: pass, 119 arquivos checados, sem fixes.
- `pnpm test`: pass, 40 arquivos / 256 testes.
- `pnpm build`: pass.
  - Gerou `dist/**` e `dist-electron/**` ignorados/local.
  - Nao executei `dist:mac`, `dist:win`, `dist:win:arm64`, `dist:dir`,
    publish, assinatura, notarization ou release real.

### Auditoria read-only de package/release

- `package.json`: scripts de dev/build/test/smokes presentes; scripts de
  distribuicao existem, mas nao foram executados.
- `dist:win` e `dist:win:arm64`: usam `--publish never`.
- `dist:mac`: nao usa `--publish never`.
- `electron-builder.yml`: define `appId`, `productName`, `release` como output,
  `asar`, `asarUnpack` para Playwright, targets `dmg` e `nsis`; nao define
  canal de publish, signing, notarization, updater ou metadata de update.
- `.github/workflows/pr-quality-gate.yml`: executa install, lint, typecheck,
  test, smoke real CSV, smoke visual, build, gitleaks e ratchet. Nao executa
  coverage nem smoke Electron.

### Buscas read-only relevantes

- Busca por `electron-updater`, `autoUpdater`, `checkForUpdates`, publish,
  signing/notarization e update encontrou scripts/config de distribuicao, mas
  nao encontrou implementacao de updater real no app.
- Busca por telemetry/diagnostic/license/account/storage/network confirmou que
  o contrato local mantém side effects, storage, network, diagnostic generation,
  telemetry transport e updater como `none`.
- `app-local-trust-view.ts` renderiza distribuicao local/interna, update
  bloqueado sem canal, consentimentos desligados por padrao, diagnostico local
  e manual, e Pro futuro sem bloquear uso/export/historico.

### Diff check

- `git diff --check`: pass antes de criar este receipt.
- `git diff --check -- docs/goals/fiscal-desk-orchestration/results/first-release-candidate-release-review-2026-06-13.md`: pass apos escrita deste receipt.

## Checks nao executados e motivo

- `pnpm test:coverage`: nao era um dos quatro comandos proporcionais
  obrigatorios deste gate; coverage canonica ja foi registrada no coverage gate
  como 40 arquivos / 256 testes, 69.24% linhas/statements, 86.82% funcoes e
  75.32% branches. Coverage segue sinal auxiliar, nao prova funcional.
- `pnpm smoke:electron-ui`, `FISCAL_DESK_SMOKE_PROVIDER=base-publica-local pnpm smoke:electron-ui`,
  `pnpm smoke:visual` e `pnpm smoke:real-csv`: nao foram reexecutados neste
  gate de release porque o prompt exigiu typecheck/lint/test/build como checks
  proporcionais e proibiu release real. Usei os smokes canonicos recentes dos
  receipts aceitos como evidencia de comportamento.
- `dist:mac`, `dist:win`, `dist:win:arm64`, `dist:dir`,
  `electron-builder --publish`, assinatura, notarization, update real, deploy,
  publish e distribuicao: explicitamente proibidos pelo prompt.
- Gitleaks/secret scan: nao exigido no prompt deste gate. O workflow de PR
  inclui gitleaks e o staging closeout aceito recomenda scan redacted antes de
  PR real.

## Avaliacao de release/package/update/distribuicao

### Coerente para operacao local

- O app continua local-first e Electron desktop com UI minima.
- O corte integrado ja tem evidencias canonicas de runtime real:
  - `pnpm smoke:electron-ui` com provider `mock`, entrega XLSX, checkpoint,
    historico e retomada.
  - `FISCAL_DESK_SMOKE_PROVIDER=base-publica-local pnpm smoke:electron-ui` no
    coverage gate canonico.
  - `pnpm smoke:visual` desktop/tablet/mobile.
  - `pnpm smoke:real-csv` com Base Publica Local e consentimento.
- `mock` permanece provider offline padrao pelos docs/receipts revisados.
- Receita Web permanece assistida/experimental e nao foi tratada como smoke
  deterministico.

### Nao coerente ainda para release empacotado real

- Identidade de release esta desalinhada:
  - docs/status/first-release usam Fiscal Desk;
  - `package.json` usa `name: consulta-simples-csv` e descricao antiga;
  - `electron-builder.yml` usa `productName: Consulta Simples CSV` e
    `appId: com.icaroaguiar.consulta-simples-csv`.
- `dist:mac` nao explicita `--publish never`. Mesmo sem `publish` configurado,
  o padrao operacional deste gate deve evitar ambiguidades de release real.
- Nao ha configuracao de canal oficial, assinatura, notarization, metadata de
  update ou publish. Isso e correto enquanto release real esta bloqueado, mas
  impede chamar o corte de pronto para distribuicao publica.
- O workflow de PR nao reexecuta smoke Electron nem coverage, entao a prova de
  runtime/coverage depende dos receipts locais atuais, nao de CI automatizado.

## Confirmacao dos limites bloqueados

Confirmado como bloqueado/nao liberado neste corte:

- update real e auto-update real;
- diagnostico real gerado/enviado;
- telemetria real e transporte de telemetria;
- licenca/account real e qualquer conta obrigatoria;
- storage/network novo, backend remoto e cloud sync;
- templates UI/modelos reutilizaveis;
- PDF/Word/OCR reais;
- Receita Web live/massiva ou fallback automatico massivo;
- release/package config material, assinatura, notarization, publish,
  distribuicao e updater metadata.

Esses limites aparecem de forma consistente em `first-release.md`, `status.md`,
`quality-gates.md`, `state.yaml`, final integration review, post-F6E2C
rebaseline e Wave 13.

## Gaps por severidade

### P1 - Corrigir antes de release empacotado ou nova feature material

- **Identidade de release/package desalinhada.** O produto e Fiscal Desk nos
  docs de primeiro release, mas o pacote ainda e `Consulta Simples CSV`. Isso
  afeta nome instalado, artefatos, appId e comunicacao operacional.
- **Scripts de distribuicao nao estao igualmente no-publish.** Windows tem
  `--publish never`; macOS nao. Antes de qualquer build release, o owner window
  deve decidir e explicitar politica de publish para todos os alvos.

### P2 - Corrigir antes de PR/release publico

- **CI nao cobre toda a matriz atual.** O PR quality gate nao roda
  `pnpm test:coverage` nem `pnpm smoke:electron-ui`. Os receipts locais cobrem
  o corte atual, mas CI ainda nao garante a mesma evidencia.
- **Sem assinatura/notarization/canal oficial.** Isso e esperado e bloqueado,
  mas precisa continuar sendo comunicado como limite de distribuicao.

### P3 - Residual aceito para este gate

- `node_modules/**`, `dist/**` e `dist-electron/**` foram gerados localmente e
  sao ignorados/nao versionaveis.
- `skills/**` permanece ruido local nao rastreado e fora do pacote.
- Coverage global segue abaixo de 80% operacional e e sinal auxiliar, nao prova
  funcional.
- Receita Web segue assistida/experimental.

## Recomendacao ao judge

Recomendacao: **corrigir antes**.

Selecionar um owner window especifico antes de release real ou nova feature
material:

`first_release_package_identity_and_publish_safety`

Escopo sugerido:

- alinhar `package.json` e `electron-builder.yml` com a decisao de identidade
  do Fiscal Desk ou registrar decisao explicita de manter o nome legado no
  pacote;
- tornar politica de publish explicitamente segura para todos os scripts de
  distribuicao, especialmente `dist:mac`;
- decidir se o PR quality gate deve incorporar `pnpm test:coverage` e/ou
  `pnpm smoke:electron-ui`, ou registrar porque esses checks permanecem
  manuais para release;
- manter bloqueados update real, diagnostico real/enviado, telemetria real,
  licenca/account, storage/network, templates, PDF/Word/OCR e Receita Web
  live/massiva;
- exigir typecheck, lint, test, build, diff check e review independente se
  qualquer package/config/CI mudar.

Este gate nao e `blocked`: os docs canonicos foram lidos, os checks locais
passaram apos bootstrap autorizado e nao ha evidencia de comportamento runtime
perigoso liberado. O status e `needs_rework` porque a identidade/politica de
release package ainda nao esta pronta para o primeiro release empacotado.

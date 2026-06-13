# First Release Package Identity And Publish Safety

Date: 2026-06-13
Worker worktree: `/Users/icaroaguiar/.codex/worktrees/98af/consulta-simples-csv`
Source thread: `019ebe5c-3853-79c2-87ad-8ddace386c93`
Owner window: `first_release_package_identity_and_publish_safety`
Status: `ready_for_judge_review`

## Resumo executivo

O rework de release/package foi aplicado dentro do allowed write scope.

O pacote agora declara a identidade visivel do primeiro release candidate como
Fiscal Desk (`package.json`, `electron-builder.yml`) e todos os scripts
`dist:*` ficam explicitamente no-publish via `--publish never`.

O PR quality gate agora executa `pnpm test:coverage`, que ja existe no pacote e
rodou localmente com sucesso. `pnpm smoke:electron-ui` nao foi adicionado ao CI
porque o workflow atual roda em `ubuntu-latest` sem configuracao explicita de
display/ambiente Electron confiavel; para este owner window, smoke Electron
continua evidencia manual/local de release.

Nenhum script `dist:*`, release real, publish, assinatura, notarization,
updater metadata, auto-update, telemetria ou diagnostico enviado foi executado
ou configurado.

## Arquivos lidos

- `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/AGENTS.md`
- `docs/goals/fiscal-desk-orchestration/goal.md`
- `docs/goals/fiscal-desk-orchestration/state.yaml`
- `docs/goals/fiscal-desk-orchestration/integration-plan.md`
- `docs/goals/fiscal-desk-orchestration/results/first-release-candidate-release-review-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/first-release-candidate-release-security-review-judge-decision-2026-06-13.md`
- `package.json`
- `electron-builder.yml`
- `.github/workflows/pr-quality-gate.yml`

## Arquivos alterados

- `package.json`
- `electron-builder.yml`
- `.github/workflows/pr-quality-gate.yml`
- `docs/goals/fiscal-desk-orchestration/results/first-release-package-identity-and-publish-safety-2026-06-13.md`

## Decisao de identidade de pacote

Decisao: alinhar metadados visiveis com Fiscal Desk antes do primeiro release
candidate empacotado.

Mudancas:

- `package.json`:
  - `name`: `fiscal-desk`;
  - `description`: `Fiscal Desk local-first para validar enquadramento no Simples Nacional a partir de CSV.`
- `electron-builder.yml`:
  - `productName`: `Fiscal Desk`;
  - `appId`: `com.icaroaguiar.fiscal-desk`.

Justificativa:

- Os docs e receipts de primeiro release tratam o produto como Fiscal Desk.
- O release review aceito pelo judge marcou o nome legado
  `consulta-simples-csv` / `Consulta Simples CSV` como gap de release.
- A troca acontece antes de release empacotado real aprovado; portanto nao
  adiciona fluxo de migracao de appId, updater ou compatibilidade de
  auto-update.

Risco residual: se existir alguma instalacao local/manual anterior usando o
appId legado, ela sera tratada como outro app pelo sistema operacional. O judge
deve confirmar se isso e aceitavel para o primeiro release candidate; nao foi
adicionado nenhum mecanismo de migracao.

## Decisao de publish safety

Decisao: todos os scripts de distribuicao devem declarar `--publish never`.

Mudancas:

- `dist:mac`: agora executa `electron-builder --mac dmg --publish never`.
- `dist:win`: ja usava `--publish never`; preservado.
- `dist:win:arm64`: ja usava `--publish never`; preservado.
- `dist:dir`: agora executa `electron-builder --dir --publish never`.

`electron-builder.yml` continua sem configuracao de canal `publish`, signing,
notarization, updater metadata ou release provider. A politica operacional e:
qualquer build de distribuicao local deve ser no-publish por default; release
real continua bloqueado ate novo owner window explicito.

## Decisao sobre coverage e smoke Electron em CI

Coverage:

- Adicionado passo `Coverage` com `pnpm test:coverage` em
  `.github/workflows/pr-quality-gate.yml`.
- A dependencia de coverage ja existia no pacote; nao houve nova dependencia e
  `pnpm-lock.yaml` nao mudou.
- O comando foi executado localmente e passou.

Smoke Electron:

- Nao adicionado ao CI neste owner window.
- Motivo: `pnpm smoke:electron-ui` exercita app Electron real e o workflow atual
  roda em `ubuntu-latest` sem configuracao explicita de display/ambiente GUI.
  Adicionar esse passo sem preparar o ambiente pode tornar o PR gate flakey ou
  bloquear por infraestrutura, nao por regressao do app.
- Decisao: manter `pnpm smoke:electron-ui` como evidencia manual/local de
  release ate um owner window especifico preparar o runner ou um smoke
  headless confiavel.

## Tests e checks executados

- `pnpm install --frozen-lockfile`: pass.
  - Executado porque `node_modules` estava ausente.
  - Lockfile atualizado: nao.
  - Downloads: `0`; pacotes reutilizados do store local.
  - `postinstall` instalou/verificou Chromium via Playwright.
- `pnpm typecheck`: pass.
- `pnpm lint`: pass, 119 arquivos checados, sem fixes.
- `pnpm test`: pass, 40 arquivos / 256 testes.
- `pnpm test:coverage`: pass, 40 arquivos / 256 testes.
  - Coverage global: 69.24% statements/lines, 75.34% branches, 86.82%
    functions.
- `pnpm build`: pass.
  - Gerou `dist/**` e `dist-electron/**` locais/ignorados.
- `git diff --check`: pass.
- `git diff -- pnpm-lock.yaml`: sem diff.

## Checks nao executados e motivo

- `dist:mac`, `dist:win`, `dist:win:arm64`, `dist:dir`: proibidos pelo prompt;
  este owner window nao executa empacotamento/distribuicao.
- Publish, release real, deploy, assinatura, notarization, updater metadata e
  auto-update: proibidos pelo prompt e permanecem fora de escopo.
- `pnpm smoke:electron-ui`: nao exigido como verificacao local deste owner
  window e nao adicionado ao CI por risco de runner Ubuntu sem display/GUI
  confiavel.
- Review independente por subagente: nao executado nesta thread. O resultado
  fica explicitamente como candidato para judge, sem autoaprovacao.

## Riscos residuais

- A mudanca de `appId` e correta para alinhar o primeiro release candidate ao
  produto Fiscal Desk, mas pode criar identidade separada se alguem ja tiver
  instalado um build local com `com.icaroaguiar.consulta-simples-csv`.
- O CI passa a rodar coverage, mas coverage continua sinal auxiliar; nao prova
  comportamento Electron/runtime.
- Smoke Electron continua manual/local ate haver configuracao robusta de runner
  GUI ou estrategia headless validada.
- O build local gerou artefatos ignorados em `dist/**`, `dist-electron/**` e
  `coverage/**`; nenhum deles deve ser versionado.
- O aviso de harness sobre `dependency_file_change=1` corresponde ao
  `package.json` alterado intencionalmente para metadata/scripts; nao houve
  mudanca em `pnpm-lock.yaml` nem adicao de dependencia.

## Recomendacao ao judge

Recomendacao: aceitar como candidato de rework de release/package, sujeito a
judge review.

O judge deve confirmar explicitamente:

- que `Fiscal Desk` / `com.icaroaguiar.fiscal-desk` e a identidade correta para
  o primeiro release candidate;
- que nao ha instalacao legada a preservar antes de mudar `appId`;
- que `--publish never` em todos os `dist:*` satisfaz a politica no-publish;
- que `pnpm test:coverage` em CI e suficiente para este gate, mantendo
  `pnpm smoke:electron-ui` como evidencia local/manual por enquanto.

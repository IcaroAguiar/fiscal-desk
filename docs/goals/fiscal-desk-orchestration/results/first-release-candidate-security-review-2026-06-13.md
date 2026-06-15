# First Release Candidate Security Review

Data: 2026-06-13

Thread: `019ec225-2895-79c3-9858-88822540126d`
Worktree: `/Users/icaroaguiar/.codex/worktrees/e6ee/consulta-simples-csv`

## Status

`needs_rework`

## Resumo executivo

O corte integrado preserva corretamente os limites de release/security mais
importantes: sem auto-update real, sem `electron-updater`, sem telemetria real,
sem diagnóstico gerado/enviado, sem licença/account real, sem release publish,
sem backend remoto, e Receita Web permanece assistida/experimental, com
navegador visível e sem promessa de smoke live determinístico.

Mesmo assim, não recomendo `security_go` para o primeiro release candidato
antes de um hardening local de privacidade. A auditoria encontrou dados fiscais
e caminhos locais aparecendo em logs operacionais e em artefatos locais de
retomada/índice:

- `src/main/ipc/process-csv.ipc.ts:336` registra início com `sourceFilePath` e
  `checkpointPath`.
- `src/main/ipc/process-csv.ipc.ts:358` registra progresso com `currentCnpj`.
- `src/main/ipc/process-csv.ipc.ts:380` registra fim com `savedPath`.
- `src/main/execution/file-process-execution-ledger.ts:57` define ledger local
  com `sourceFilePath`, `outputPath`, `summary` e `checkpoints`.
- `src/main/execution/file-process-execution-ledger.ts:219` persiste o
  `SimplesLookupResult` em checkpoints por CNPJ.
- `src/core/simples/adapters/cnpja-open-simples-lookup.adapter.ts:67` retorna
  `raw` do provider em sucesso, que pode ser carregado dentro do
  `SimplesLookupResult`.
- `src/core/public-base/local-public-base.store.ts:21` define o documento local
  da Base Pública Local com `sourceFilePath` e `records`; `:98` grava o
  documento com registros normalizados.

Isso é armazenamento/log local, não vazamento por rede. Mas para o gate
pré-release de dados fiscais sensíveis, o risco ainda é material: um pacote de
diagnóstico futuro, stdout anexado por suporte, crash report, ou inspeção do
perfil local pode carregar CNPJ, caminhos de arquivo, resultado fiscal e
provider response. O contrato F8A já proíbe essas classes em diagnóstico e
telemetria; o runtime atual ainda não aplica esse padrão aos logs e artefatos
locais existentes.

Recomendação ao judge: não liberar nova feature material ainda. Abrir um owner
window específico `first_release_local_privacy_hardening`, sem mexer em
release/update real, para sanear logs/checkpoints/provider raw e documentar a
política de armazenamento local antes de repetir este gate.

## Arquivos e documentos lidos

Obrigatórios:

- `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/AGENTS.md`
- `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/goals/fiscal-desk-orchestration/goal.md`
- `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/goals/fiscal-desk-orchestration/state.yaml`
- `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/goals/fiscal-desk-orchestration/integration-plan.md`
- `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/goals/fiscal-desk-orchestration/results/final-integration-review-judge-decision.md`
- `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/goals/fiscal-desk-orchestration/results/phase-7b-receita-web-security-scope-review-judge-decision.md`
- `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/goals/fiscal-desk-orchestration/results/phase-8a-local-update-diagnostic-contract-security-review.md`
- `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/goals/fiscal-desk-orchestration/results/testing-infra-coverage-gate-canonical-review-2026-06-13.md`
- `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/goals/fiscal-desk-orchestration/results/post-f6e2c-first-release-status-rebaseline-judge-decision-2026-06-13.md`
- `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/fiscal-desk/first-release.md`
- `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/fiscal-desk/status.md`
- `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/fiscal-desk/quality-gates.md`
- `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/package.json`
- `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/electron-builder.yml`

Código e testes relevantes:

- `src/main/main.ts`
- `src/main/preload.ts`
- `src/main/types.ts`
- `src/main/ipc/process-csv.ipc.ts`
- `src/main/ipc/local-public-base.ipc.ts`
- `src/main/ipc/process-csv-output-files.ts`
- `src/main/execution/file-process-execution-ledger.ts`
- `src/core/app/fiscal-desk-local-contract.ts`
- `src/core/app/process-csv.use-case.ts`
- `src/core/app/process-csv.types.ts`
- `src/core/public-base/local-public-base.index.ts`
- `src/core/public-base/local-public-base.store.ts`
- `src/core/public-base/local-public-base.types.ts`
- `src/core/simples/simples-provider.catalog.ts`
- `src/core/simples/simples-provider.config.ts`
- `src/core/simples/simples-provider.factory.ts`
- `src/core/simples/simples-provider.fallback.ts`
- `src/core/simples/simples-lookup.types.ts`
- `src/core/simples/adapters/cnpja-open-simples-lookup.adapter.ts`
- `src/core/simples/adapters/local-public-base-simples-lookup.adapter.ts`
- `src/core/simples/adapters/mock-simples-lookup.adapter.ts`
- `src/core/simples/adapters/receita-web/**`
- `src/renderer/ui/app-local-trust-view.ts`
- `src/renderer/ui/app-provider.ts`
- `src/renderer/ui/app-view.ts`
- `src/renderer/ui/app-sync.ts`
- `scripts/smoke-real-csv.ts`
- `scripts/smoke-electron-ui.ts`
- `scripts/smoke-visual-ui.ts`
- testes focados listados em "Checks executados".

## Estado Git auditado

Worktree deste gate:

- Comando: `git status --short --branch --untracked-files=all`
- Resultado: `## HEAD (no branch)` e somente `skills/**` não rastreado antes
  do receipt. Após o bootstrap, `node_modules` permaneceu ignorado e
  `package.json`/`pnpm-lock.yaml` não tiveram diff.

Canonical:

- Comando inicial: `git status --short --branch --untracked-files=all`
- Resultado inicial observado: branch `feat/fiscal-desk-local-base-prep` com
  docs de orquestração staged/modificados e `skills/**` não rastreado.
- Atualização do judge recebida: dispatch canônico commitado como `2239cf2 docs:
  dispatch fiscal desk release security review`.
- Revalidação: `git log -1 --oneline` retornou `2239cf2 docs: dispatch fiscal
  desk release security review`.
- Revalidação: `git status --short --branch --untracked-files=all` na canonical
  retornou somente `skills/**` não rastreado.

## Bootstrap de ambiente

Os binários locais `vitest`, `tsc` e `biome` estavam ausentes nesta worktree
nova. Conforme autorização do judge:

- Comando: `pnpm install --frozen-lockfile`
- Resultado: pass.
- Lockfile: resolução pulada como up-to-date.
- `git diff -- package.json pnpm-lock.yaml`: sem saída.

Artefatos gerados: `node_modules/` e caches de ferramenta são bootstrap local
ignorado/não versionável.

## Scans e checks executados

### Secrets/auth/cookies/headers

Comando:

`rg -n -i "secret|token|password|senha|api[_-]?key|apikey|authorization|bearer|cookie|set-cookie|credential|headers?|auth" src/main src/core/simples src/core/public-base src/core/app src/renderer/ui scripts test package.json electron-builder.yml`

Resultado:

- Sem segredo material ou credencial hardcoded identificada.
- Matches relevantes foram classes proibidas/fixtures de teste, termos
  estruturais como `headers`, e `status-token` CSS.
- Não houve exposição de valor secreto no receipt.

### Dados fiscais, caminhos, CSV/XLSX, payload/html/screenshot/log

Comando:

`rg -n -i "cnpj|razao|razão|nome empresarial|filePath|path|csv|xlsx|payload|providerResponse|provider response|html|screenshot|print|log|console\\.|diagnostic|diagnostico|diagnóstico" src/main src/core/simples src/core/public-base src/core/app src/renderer/ui scripts test package.json electron-builder.yml`

Resultado:

- Confirmou superfície extensa de dados fiscais por design: CSV de entrada,
  saída CSV/XLSX, Base Pública Local, ledger/checkpoint, provider results,
  Receita Web parser e smokes.
- Achados materiais estão nos findings: logs de runtime e armazenamento local
  de checkpoints/provider raw/índice.
- Fixtures de smoke contêm CNPJs públicos reais e nomes públicos em
  `test/fixtures/smoke/**`; por serem fixtures públicas/localizadas em teste,
  não foram tratados como segredo.

### Rede, telemetria e update

Comando:

`rg -n -i "fetch\\(|axios|XMLHttpRequest|sendBeacon|net\\.request|https?://|electron-updater|autoUpdater|checkForUpdates|setFeedURL|downloadUpdate|quitAndInstall|telemetry|analytics|license|licen[cç]a" src/main src/core/simples src/core/public-base src/core/app src/renderer/ui scripts test package.json electron-builder.yml`

Resultado:

- Rede real encontrada somente em:
  - `src/core/simples/adapters/cnpja-open-simples-lookup.adapter.ts:51` para
    consulta pública CNPJá Open;
  - `src/core/simples/adapters/receita-web/receita.selectors.ts:3` para a URL
    da Receita Web assistida;
  - URLs localhost/127.0.0.1 em smokes/dev.
- Sem `axios`, `XMLHttpRequest`, `sendBeacon`, `net.request`,
  `electron-updater`, `autoUpdater`, `checkForUpdates`, `downloadUpdate` ou
  `quitAndInstall`.
- Telemetria/licença/update aparecem como contrato/default-off e copy de estado
  bloqueado, não como transporte real.

### Provider/defaults/consentimento

Comando:

`rg -n -i "provider.*mock|mock.*provider|default.*mock|receita-web|base-publica-local|consent|consentimento|prepareLocalPublicBase|diagnosticGeneration|telemetryTransport|local_only|manual_share_only|default_off|migration_default_off" ...`

Resultado:

- O primeiro comando relativo incluiu `docs/fiscal-desk` ausente nesta worktree
  e retornou erro de caminho. Isso não bloqueou o gate porque os docs
  obrigatórios foram lidos pelos caminhos absolutos canônicos.
- Repetição com caminhos absolutos canônicos em `docs/fiscal-desk/**` e
  `docs/goals/.../results/**`: pass, com muitos matches esperados de docs e
  receipts.
- Código confirma:
  - `src/core/simples/simples-provider.config.ts:11`: provider default `mock`.
  - `src/core/simples/simples-provider.catalog.ts:36`: `mock` offline,
    determinístico e sem rede.
  - `src/core/simples/simples-provider.catalog.ts:87`: `receita-web`
    assistido, sem batch, sem fallback automático e sem smoke determinístico.
  - `src/core/public-base/local-public-base.index.ts:43`: preparo da Base
    Pública Local chama validação de consentimento antes de parse/index.
  - `src/core/public-base/local-public-base.index.ts:154`: consentimento
    explícito é obrigatório.
  - `src/core/app/fiscal-desk-local-contract.ts:154`: contrato local declara
    `network`, `storage`, `diagnosticGeneration`, `telemetryTransport` e
    `updater` como `none` para o contrato F8A.

### Logs e storage local

Comandos:

- `rg -n "console\\.(info|warn|error|log)|logger\\.warn" src/main src/core src/renderer/ui scripts`
- `rg -n "writeFile|readFile|rename|mkdir|app\\.getPath|userData|sourceFilePath|outputPath|checkpointPath|checkpoints|records" src/main src/core/public-base src/core/app`

Resultado:

- Confirmou logs runtime em `process-csv.ipc.ts` com caminhos locais e CNPJ
  corrente.
- Confirmou ledger local em `app.getPath("userData")/execution-ledgers`.
- Confirmou Base Pública Local em `app.getPath("userData")/public-base`.
- Confirmou gravação de checkpoints e índice local em JSON.

### Testes focados

Comando:

`pnpm exec vitest run test/unit/fiscal-desk-local-contract.test.ts test/unit/receita-browser.client.test.ts test/unit/receita-consulta-optantes.adapter.test.ts test/unit/receita-result.parser.test.ts test/unit/simples-provider.catalog.test.ts test/unit/simples-provider.factory.test.ts test/unit/simples-provider.fallback.test.ts test/unit/local-public-base.test.ts test/unit/main/file-process-execution-ledger.test.ts test/unit/process-csv.ipc.test.ts test/unit/process-csv.ipc.delivery.test.ts test/unit/app-view.test.ts`

Resultado: pass, 12 arquivos, 141 testes.

Observação: stdout dos testes IPC confirma os próprios logs runtime com campos
de caminho local, reforçando o finding de privacidade de logs.

## Checks não executados

- `pnpm test` completo: não executado. Rodei teste focado de segurança/privacidade
  cobrindo contrato local, Receita Web, provider catalog/fallback, Base Pública
  Local, ledger, IPC e copy/estados bloqueados. Para este gate read-only, os
  smokes completos já estão cobertos por receipts/judges anteriores e o risco
  novo identificado não depende de reexecutar toda a suíte.
- `pnpm smoke:electron-ui`, `pnpm smoke:visual`, `pnpm smoke:real-csv`: não
  executados. Este gate não altera código e Receita Web live não deve virar
  smoke determinístico. Receipts anteriores já registram smokes qualitativos
  para o pacote integrado.
- Gitleaks: não executado neste gate. O prompt exigiu scans read-only com `rg`;
  F0/staging anteriores registraram secret scan. O risco encontrado aqui é
  privacidade de dados fiscais locais, não segredo hardcoded.

## Findings

### High

1. `src/main/ipc/process-csv.ipc.ts:336`, `:358`, `:380` - Logs de runtime
   incluem identificadores fiscais e caminhos locais.

   Impacto: CNPJ corrente, caminho do CSV/checkpoint e caminho de saída podem
   aparecer em stdout/logs locais, anexos de suporte, diagnósticos futuros ou
   coleta acidental. Isso conflita com a política F8A de não carregar CNPJ,
   local path, CSV/XLSX ou resultado fiscal em logs/diagnóstico.

   Recomendação: substituir por logs estruturados sanitizados: provider,
   contadores agregados, buckets de duração/tamanho, status, runId efêmero ou
   hash truncado não reversível quando realmente necessário. Não registrar CNPJ,
   `sourceFilePath`, `savedPath` ou `checkpointPath` em `console.info`.

2. `src/main/execution/file-process-execution-ledger.ts:57`, `:219`,
   `src/core/simples/adapters/cnpja-open-simples-lookup.adapter.ts:67`,
   `src/core/simples/adapters/local-public-base-simples-lookup.adapter.ts:53`
   - Checkpoints locais podem persistir `SimplesLookupResult` com `raw` de
   provider e dados fiscais identificáveis.

   Impacto: o ledger local é necessário para retomada, mas hoje pode guardar
   por CNPJ resultados enriquecidos e `raw` de provider. Isso aumenta o
   conteúdo fiscal sensível no perfil local além do necessário para retomar e
   para histórico operacional.

   Recomendação: definir uma projeção de checkpoint segura antes de `saveLookup`
   que retenha apenas campos mínimos necessários para retomada/exportação e
   descarte `raw`/provider response. Se CNPJ por checkpoint for indispensável,
   documentar a política de retenção local, considerar hash/chave derivada e
   evitar incluir payload bruto.

### Medium

1. `src/core/public-base/local-public-base.store.ts:21`, `:98` - Índice da Base
   Pública Local grava registros completos em JSON local com CNPJ e razão
   social.

   Impacto: armazenamento local é esperado para o provider offline, e o preparo
   exige consentimento. Ainda assim, o primeiro release precisa deixar claro que
   o perfil local conterá uma cópia consultável da base preparada, sem
   criptografia/redação no corte atual.

   Recomendação: para o hardening pré-release, registrar política de retenção e
   limpeza, reduzir metadados de caminho quando possível, e considerar aviso
   explícito na UI/documentação sobre armazenamento local do índice.

2. `src/core/app/process-csv.use-case.ts:203` - Saída CSV/XLSX preserva dados de
   entrada e adiciona status fiscal por linha.

   Impacto: isso é a função principal do app, não um bug por si só. O risco é
   classificado como médio porque esses arquivos são gerados ao lado do arquivo
   original e contêm dados fiscais sensíveis. O app não faz upload nem envia por
   rede.

   Recomendação: manter local-only, evitar logs com path/conteúdo, e comunicar
   no primeiro release que os arquivos de saída são sensíveis e ficam no
   computador do usuário.

### Low

1. `electron-builder.yml:1` e `package.json` - metadados de app ainda usam nome
   técnico/legado de pacote.

   Impacto: não é vulnerabilidade, mas pode gerar confusão no release/security
   review porque o produto/documentos dizem Fiscal Desk e o appId/productName
   ainda refletem o nome antigo. Não há auto-update real configurado.

   Recomendação: deixar para o release review decidir se isso entra em owner
   window de branding/release metadata, sem misturar com privacidade local.

## Avaliação por superfície

### Dados fiscais sensíveis

`needs_rework`. O app manipula CNPJ, razão social, status fiscal e CSV/XLSX por
design. O processamento e exportação são locais, mas logs e ledger armazenam
mais identificadores do que o necessário para um corte pré-release seguro.

### Logs e diagnósticos

`needs_rework`. Não há pacote diagnóstico real nem upload, e o contrato F8A
exige diagnóstico local/manual/revisável. Porém logs runtime atuais ainda
incluem CNPJ/caminhos. Antes de qualquer diagnóstico futuro ou suporte de
release, esses logs devem ser sanitizados.

### Telemetria

`pass`. Não encontrei transporte real (`sendBeacon`, `fetch` de analytics,
`axios`, `net.request` ou endpoint de telemetria). O contrato F8A mantém
telemetria default-off e allowlist positiva.

### Update/release

`pass_with_blocked_scope`. Não há `electron-updater`, `autoUpdater`,
`checkForUpdates`, `downloadUpdate`, `quitAndInstall` ou publish configurado.
`electron-builder.yml` empacota localmente e os scripts Windows usam
`--publish never`.

### Receita Web assistida

`pass`. O catálogo marca `receita-web` como assistido, sem batch, sem fallback
automático e sem smoke determinístico. O adapter usa navegador visível
(`headless: false`) e diagnósticos codificados com `containsRawHtml: false` e
`containsCnpj: false`. Não encontrei promessa de robustez em lote no código
revisado.

### Provider credentials

`pass`. Não encontrei credenciais de provider, API keys ou tokens. CNPJá Open
usa endpoint público sem segredo. Receita Web depende de navegador local, não
credencial.

### Armazenamento local

`needs_rework`. O armazenamento local é coerente com local-first, mas precisa
hardening/política antes de release: ledger de retomada, índice Base Pública
Local, paths e provider raw devem ser minimizados/sanitizados/documentados.

### Limites bloqueados/default-off

Confirmados:

- update real bloqueado;
- diagnóstico real gerado/enviado bloqueado;
- telemetria real bloqueada/default-off;
- licença/account real bloqueado;
- release/package config material bloqueado;
- storage/network expansion bloqueado;
- templates/modelos reutilizáveis bloqueados;
- Receita Web live/massiva bloqueada;
- `mock` preservado como provider offline padrão;
- Base Pública Local exige consentimento antes do preparo.

## Recomendação ao judge

Recomendo `needs_rework` com owner window específico:

`first_release_local_privacy_hardening`

Escopo sugerido:

- sanitizar `console.info`/`logger.warn` de runtime para remover CNPJ,
  `sourceFilePath`, `savedPath`, `checkpointPath`, CSV/XLSX content e provider
  response;
- introduzir projeção segura para `FileProcessExecutionLedger.saveLookup`, sem
  `raw`/provider response;
- revisar se `sourceFilePath` e `outputPath` precisam ser persistidos no ledger
  completo ou se podem virar basename/estado local mínimo;
- documentar a política local de retenção/limpeza da Base Pública Local e do
  ledger;
- manter sem auto-update, sem telemetria, sem diagnóstico real, sem release
  config, sem rede nova e sem Receita Web live/massiva;
- verificação mínima: testes de ledger, IPC, provider local/CNPJá/Receita
  sanitizada, scans `rg` para logs sensíveis, `pnpm typecheck`, teste focado e
  `git diff --check`.

Após esse hardening, repetir este security review. Se o judge aceitar
explicitamente o risco de armazenamento local sem mudança de código, a decisão
deveria declarar essa exceção de forma estreita; eu não recomendo liberar como
`security_go` sem essa decisão.

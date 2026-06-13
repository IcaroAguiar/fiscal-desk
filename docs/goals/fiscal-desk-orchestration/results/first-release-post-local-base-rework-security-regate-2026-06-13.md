# First Release Post Local Base Rework Security Regate

Data: 2026-06-13
Thread fonte: `019ebe5c-3853-79c2-87ad-8ddace386c93`
Commit revisado: `946c578 fix: sanitize local public base warnings`
Status: `approved_candidate`

## Escopo

Gate read-only de seguranca/privacidade apos o hardening local dos warnings da
Base Publica Local. Este parecer nao e autoaprovacao do judge e nao libera
feature work. A recomendacao abaixo e entrada para o orquestrador/judge.

## Arquivos lidos

- `AGENTS.md`
- `docs/goals/fiscal-desk-orchestration/goal.md`
- `docs/goals/fiscal-desk-orchestration/state.yaml`
- `docs/goals/fiscal-desk-orchestration/integration-plan.md`
- `docs/goals/fiscal-desk-orchestration/results/first-release-post-rework-security-review-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/first-release-local-public-base-log-privacy-hardening-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/first-release-local-public-base-log-privacy-hardening-review-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/first-release-local-public-base-log-privacy-hardening-judge-decision-2026-06-13.md`
- `src/core/public-base/local-public-base.store.ts`
- `test/unit/local-public-base.test.ts`

## Estado Git

- `git status --short --branch --untracked-files=all`: `## HEAD (no branch)`.
  Worktree limpa para arquivos rastreados e untracked no inicio do gate; HEAD
  detached, mas apontando para o commit alvo.
- `git log -1 --oneline`: `946c578 fix: sanitize local public base warnings`.
- `git show --name-status --format=short HEAD`: commit contem o rework esperado
  em `src/core/public-base/local-public-base.store.ts` e
  `test/unit/local-public-base.test.ts`, alem dos receipts/docs de integracao
  do judge. Nao ha alteracao de `package.json`, `pnpm-lock.yaml`,
  `electron-builder.yml`, `.github/**`, release/deploy/publish ou telemetria.

## Findings

### Criticos

- Nenhum.

### Altos

- Nenhum.

### Medios

- Nenhum.

### Baixos / Informativos

- `src/core/public-base/local-public-base.store.ts:145`: o warning de falha de
  leitura foi preservado, mas o metadata contem somente
  `{ reason: "read_failed" }`. Nao ha path absoluto, `this.indexPath`,
  `error.message`, stack, conteudo do indice, CNPJ, razao social ou payload
  fiscal.
- `src/core/public-base/local-public-base.store.ts:156`: o warning de JSON
  invalido usa somente `{ reason: "invalid_json" }`. A mensagem bruta do parser e
  o conteudo bruto do indice nao sao logados.
- `src/core/public-base/local-public-base.store.ts:163`: o warning de documento
  incompativel usa somente `{ reason: "incompatible_index_document" }`. Campos do
  documento persistido, incluindo `sourceFilePath`, CNPJ e `razaoSocial`, nao sao
  emitidos no metadata.
- `test/unit/local-public-base.test.ts:279`, `test/unit/local-public-base.test.ts:335`
  e `test/unit/local-public-base.test.ts:370`: os testes cobrem documento
  incompativel, JSON invalido e falha de leitura, incluindo assercoes negativas
  para diretorio local, nome do indice, raw payload, CNPJ, Razao Social e erro do
  filesystem.

## Revisao dos pontos alterados

- `LocalPublicBaseStore.readDocument()` agora separa falha de leitura,
  parsing JSON e validacao estrutural. O fallback funcional foi preservado:
  `ENOENT` continua retornando `null`, demais falhas retornam `null` apos warning,
  JSON invalido retorna `null`, e documento incompativel retorna `null`.
- Os tres `logger.warn` remanescentes em `readDocument()` usam mensagens fixas e
  metadata allowlisted por `reason`; nenhum deles passa `this.indexPath`, raw
  `error.message`, stack ou o conteudo lido/parsing.
- A funcao `classifyIndexReadFailure()` retorna sempre a categoria local
  `read_failed`. O branch que inspeciona `error.code` nao propaga o valor de
  `code`; portanto nao vaza `EISDIR`, path ou mensagem do runtime.
- Os testes novos usam dados sensiveis e paths locais como fixtures negativas
  para provar ausencia nos warnings. Esses dados aparecem no arquivo de teste e
  em persistencia normal, mas nao aparecem nos metadados esperados de
  `logger.warn`.

## Checks executados

- `git status --short --branch --untracked-files=all`: passou; estado inicial
  limpo e detached em HEAD.
- `git log -1 --oneline`: passou; HEAD e o commit alvo `946c578`.
- `git show --stat --oneline --decorate --name-only HEAD`: passou; confirma
  `HEAD, feat/fiscal-desk-local-base-prep` no commit alvo e arquivos esperados.
- `git show --unified=80 -- src/core/public-base/local-public-base.store.ts test/unit/local-public-base.test.ts`:
  revisado manualmente.
- `rg -n "indexPath: this\\.indexPath|error\\.message|stack|logger\\.warn|raw payload|Razao Social|razaoSocial|cnpj|sourceFilePath|payload" src/core/public-base/local-public-base.store.ts test/unit/local-public-base.test.ts`:
  passou com interpretacao manual. Nao ha match para `indexPath: this.indexPath`,
  `error.message` ou `stack`. Os unicos `logger.warn` estao em
  `src/core/public-base/local-public-base.store.ts:145`, `:156` e `:163`, todos
  com metadata limitada a `reason`. Matches de `cnpj`, `razaoSocial`,
  `sourceFilePath`, `raw payload` e `Razao Social` ficam em fixtures/testes,
  tipos, validacao estrutural ou persistencia local normal, nao nos warnings.
- `git diff --check`: passou sem output.
- `git diff --stat`: passou sem output antes da criacao deste receipt, indicando
  que nao havia diff local pendente no inicio do gate.
- `df -h .`: confirmou disco criticamente baixo, com aproximadamente 265 MiB
  disponiveis.
- `test -d node_modules`: confirmou `node_modules absent`.

## Checks nao executados

- `pnpm install --frozen-lockfile`: nao executado por instrucao explicita e por
  disco local baixo.
- `pnpm exec vitest run test/unit/local-public-base.test.ts`, `pnpm typecheck`,
  `pnpm lint`, `pnpm test`, `pnpm build`, coverage e smokes: nao executados nesta
  worktree porque `node_modules` esta ausente e o volume tem apenas cerca de
  265 MiB livres.

Evidencia herdada usada com limite declarado: o worker reportou teste focado,
typecheck, lint e full `pnpm test` passando; o review independente retornou
`approved_candidate`; o judge confirmou arquivos canonicos byte-identicos aos do
worker, scan canonico e `git diff --check` passando. Esta re-gate nao reexecutou
essa suite.

## Avaliacao do warning `magic_string_boundary=2`

O warning documentado pelo judge e aceitavel neste owner window. Os literais
remanescentes sao categorias locais de sanitizacao:

- `read_failed`
- `invalid_json`
- `incompatible_index_document`

Eles nao definem contrato publico, auth, tenancy, permissao, storage
cross-boundary, provider externo, API, evento, fila ou cache. Neste contexto,
mantelos explicitos nos testes aumenta a prova de privacidade dos warnings e nao
abre vazamento sensivel.

## Riscos residuais

- `LocalPublicBaseStore` ainda persiste `sourceFilePath` e registros da base
  preparada por desenho preexistente da feature offline/local. Este gate avaliou
  somente vazamento em warnings de `readDocument()`.
- A validacao dependency-backed nao foi reexecutada nesta worktree por falta de
  `node_modules` e disco criticamente baixo.
- O HEAD esta detached, embora decorado com `feat/fiscal-desk-local-base-prep` e
  no commit alvo. O judge deve continuar tratando esta thread como gate input,
  nao como owner da branch.
- Material feature work continua bloqueado ate julgamento explicito do
  orquestrador sobre este re-gate.

## Recomendacao ao judge

Recomendo fechar o gate de seguranca como `approved_candidate`: o blocker formal
de Base Publica Local foi enderecado no commit alvo, nao identifiquei vazamento
residual nos metadados dos warnings de `LocalPublicBaseStore.readDocument()`, e
nao encontrei side effect fora do escopo de hardening local/teste/docs.

Nao recomendo liberar material feature work automaticamente. O proximo passo deve
ser o judge/orquestrador fechar explicitamente este re-gate e so entao selecionar
qualquer novo owner window.

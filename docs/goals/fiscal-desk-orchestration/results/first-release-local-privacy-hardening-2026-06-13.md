# First Release Local Privacy Hardening

Data: 2026-06-13

Thread: `019ec230-33f3-7d63-87ee-85e957bce7c4`
Worktree: `/Users/icaroaguiar/.codex/worktrees/15ad/consulta-simples-csv`

## Status

`ready_for_judge_review`

## Resumo executivo

O owner window `first_release_local_privacy_hardening` foi executado dentro do
allowed write set. O candidato reduz exposicao local acidental de dados fiscais
no runtime sem alterar provider, release, pacote, updater, diagnostico,
telemetria, renderer ou adapters.

Mudancas principais:

- logs `console.info` do fluxo `processCsvWithLedger` deixam de emitir
  `sourceFilePath`, `checkpointPath`, `currentCnpj` e `savedPath`;
- os logs preservam sinal operacional por provider, formato/opcao de entrega,
  status, contadores agregados, `runId`, duracao e booleanos nao sensiveis;
- `FileProcessExecutionLedger.saveLookup` passa a persistir uma projecao segura
  do `SimplesLookupResult`, sem `raw` e sem propriedades extras do payload do
  provider;
- warnings de ledger local invalido deixam de registrar path absoluto e passam
  a registrar apenas `ledgerKey`;
- testes focados provam que logs e checkpoints sao sanitizados e que
  retomada/exportacao continuam preservadas.

## Arquivos lidos

Obrigatorios:

- `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/AGENTS.md`
- `docs/goals/fiscal-desk-orchestration/goal.md`
- `docs/goals/fiscal-desk-orchestration/state.yaml`
- `docs/goals/fiscal-desk-orchestration/integration-plan.md`
- `docs/goals/fiscal-desk-orchestration/results/first-release-candidate-security-review-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/first-release-candidate-release-security-review-judge-decision-2026-06-13.md`

Codigo/testes no allowed write lidos antes de editar:

- `src/main/ipc/process-csv.ipc.ts`
- `src/main/execution/file-process-execution-ledger.ts`
- `test/unit/main/file-process-execution-ledger.test.ts`
- `test/unit/process-csv.ipc.test.ts`
- `test/unit/process-csv.ipc.delivery.test.ts`

Arquivos auxiliares lidos para contrato de comportamento:

- `src/core/simples/simples-lookup.types.ts`
- `src/core/app/process-execution-ledger.port.ts`
- `src/core/app/process-csv.use-case.ts`

## Arquivos alterados

- `src/main/ipc/process-csv.ipc.ts`
- `src/main/execution/file-process-execution-ledger.ts`
- `test/unit/main/file-process-execution-ledger.test.ts`
- `test/unit/process-csv.ipc.test.ts`
- `docs/goals/fiscal-desk-orchestration/results/first-release-local-privacy-hardening-2026-06-13.md`

`test/unit/process-csv.ipc.delivery.test.ts` foi lido e reexecutado, mas nao
precisou de alteracao.

## Decisao de sanitizacao

### Logs runtime

Removido dos logs:

- `sourceFilePath`;
- `checkpointPath`;
- `currentCnpj`;
- `savedPath`;
- conteudo CSV/XLSX;
- resposta/payload de provider.

Retido nos logs:

- `provider`;
- `deliveryFormat` ou `deliveryOptionId`;
- `hasSourceFile`;
- `hasAutoSavedOutput`;
- `runId`;
- `runStatus`;
- `summary` com contadores agregados;
- `completedUniqueLookups`, `totalUniqueLookups`, `elapsedMs` e
  `estimatedRemainingMs`.

### Checkpoints e ledger

Removido dos checkpoints:

- `raw`;
- `providerResponse`;
- qualquer propriedade extra que venha junto do resultado do provider fora da
  forma canonica `SimplesLookupResult` minima.

Retido nos checkpoints por necessidade de retomada/exportacao local:

- CNPJ normalizado como chave local do checkpoint;
- `result.cnpj`, porque o resultado restaurado precisa reconstruir a linha de
  exportacao sem nova consulta;
- `simplesNacional`, `simei`, `source`, `status` e `message`, porque esses
  campos sao usados para manter saida CSV/XLSX e comportamento de retomada.

Retido no ledger/historico por comportamento existente:

- `sourceFilePath`, necessario para retomar lendo o CSV original;
- `outputPath`, necessario para historico local do arquivo gerado;
- `checkpointPath`, retornado ao historico/execucao local para retomada.

Esses paths continuam locais e persistidos apenas para funcionalidade local; o
candidato evita adiciona-los a logs operacionais. Nao foi adicionada
criptografia, storage remoto, telemetria, diagnostico enviado, gate de conta ou
qualquer alteracao de release.

## Tests/checks executados

- `pnpm install --frozen-lockfile`: pass. Binarios locais estavam ausentes;
  lockfile estava atualizado e `git diff -- package.json pnpm-lock.yaml` nao
  teve saida.
- `pnpm exec vitest run test/unit/main/file-process-execution-ledger.test.ts test/unit/process-csv.ipc.test.ts test/unit/process-csv.ipc.delivery.test.ts`:
  pass, 3 arquivos / 35 testes.
- `pnpm typecheck`: pass.
- `pnpm test`: pass, 40 arquivos / 258 testes.
- `pnpm lint`: pass, `biome check .`.
- `rg -n "console\.(info|warn|error|log).*sourceFilePath|console\.(info|warn|error|log).*currentCnpj|console\.(info|warn|error|log).*savedPath|console\.(info|warn|error|log).*checkpointPath" src/main src/core`:
  pass sem matches.
- `rg -n "console\.(info|warn|error|log)|logger\.warn" src/main src/core`:
  inspecionado manualmente. Logs IPC estao sanitizados; warnings do ledger
  usam `ledgerKey`; warnings da Base Publica Local ficam fora do allowed write
  deste worker e nao foram alterados.
- `rg -n "raw|providerResponse|checkpointPath|sourceFilePath|savedPath|currentCnpj" src/main/execution/file-process-execution-ledger.ts src/main/ipc/process-csv.ipc.ts test/unit/main/file-process-execution-ledger.test.ts test/unit/process-csv.ipc.test.ts`:
  inspecionado manualmente. Matches remanescentes em codigo sao leitura/retorno
  local necessarios para retomada/autosave/dialogo ou asserts de teste de
  sanitizacao; `raw`/`providerResponse` aparecem apenas no teste que prova
  remocao do payload bruto.
- `git diff --check`: pass.

Falhas intermediarias corrigidas:

- primeira execucao dos testes focados falhou por mock de evento IPC no teste
  novo; corrigido para passar `{ sender }`;
- primeira execucao de `pnpm typecheck` falhou por tipagem do union
  `deliverySelection` e `options` opcional no mock; corrigido;
- primeira execucao de `pnpm lint` falhou por formatacao no teste novo;
  corrigido com `pnpm exec biome format --write test/unit/process-csv.ipc.test.ts`.

## Checks nao executados

- `pnpm build`: nao executado. A mudanca foi limitada a main/runtime ledger,
  IPC e testes; `pnpm typecheck`, `pnpm lint`, testes focados e `pnpm test`
  completo passaram.
- Smokes Electron/visual/CSV real: nao executados. O owner window nao alterou
  renderer, provider adapter, release ou fluxo de browser; comportamento de
  retomada/exportacao foi coberto por testes focados e suite completa.
- Review independente por subagente: nao executado nesta thread. A ferramenta
  de subagentes disponivel neste runtime restringe spawn a pedidos explicitos
  de delegacao/subagente. Este resultado deve permanecer candidato para judge,
  sem autoaprovacao.

## Riscos residuais

- CNPJ normalizado permanece como chave local de checkpoint e dentro do resultado
  restaurado. Isso e intencional para retomada/exportacao local sem nova
  consulta, mas continua sendo identificador fiscal sensivel no perfil local.
- `sourceFilePath`, `outputPath` e `checkpointPath` continuam no ledger/historico
  local por necessidade funcional; a mudanca reduz exposicao em logs, nao muda a
  politica de armazenamento local nem adiciona criptografia.
- A Base Publica Local ainda mantem indice local consentido em outro boundary
  fora do allowed write deste owner window.
- Dialogo local de conclusao ainda mostra o caminho do arquivo salvo para o
  usuario. Isso nao e log/runtime persistence nova e ficou preservado.
- O candidato ainda precisa de judge review/integracao serial na branch
  canonica antes de ser considerado aceito.

## Recomendacao ao judge

Recomendo aceitar como `approved_candidate_after_judge_review` para o blocker
`first_release_local_privacy_hardening`, condicionado a:

- judge confirmar que a retencao local de CNPJ/path no ledger e aceitavel para
  retomada/exportacao no primeiro release;
- judge integrar serialmente na branch canonica e repetir pelo menos os testes
  focados, `pnpm typecheck`, `pnpm test` e o scan de logs;
- judge manter o blocker separado
  `first_release_package_identity_and_publish_safety` aberto ate resolucao
  propria.

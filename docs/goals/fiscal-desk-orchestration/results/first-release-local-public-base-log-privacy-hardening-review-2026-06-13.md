# First Release Local Public Base Log Privacy Hardening Review

Data: 2026-06-13

Status: `approved_candidate`

## Escopo

Review independente read-only do candidato
`first_release_local_public_base_log_privacy_hardening`, produzido na worktree:

`/Users/icaroaguiar/.codex/worktrees/1333/consulta-simples-csv`

Worker revisado: `019ec25e-b6af-72b2-90be-12401311ced2`

## Arquivos obrigatorios lidos

- `AGENTS.md` na canonical local.
- `docs/goals/fiscal-desk-orchestration/goal.md`
- `docs/goals/fiscal-desk-orchestration/state.yaml`
- `docs/goals/fiscal-desk-orchestration/integration-plan.md`
- `/Users/icaroaguiar/.codex/worktrees/1333/consulta-simples-csv/docs/goals/fiscal-desk-orchestration/results/first-release-local-public-base-log-privacy-hardening-2026-06-13.md`
- `/Users/icaroaguiar/.codex/worktrees/1333/consulta-simples-csv/src/core/public-base/local-public-base.store.ts`
- `/Users/icaroaguiar/.codex/worktrees/1333/consulta-simples-csv/test/unit/local-public-base.test.ts`

## Findings

Nenhum finding material.

### Informativos

- `src/core/public-base/local-public-base.store.ts:145`: warning de falha de
  leitura preservado, mas metadata limitada a `{ reason: "read_failed" }`.
  Nao expoe path absoluto, `this.indexPath`, `error.message`, stack, conteudo de
  indice, CNPJ, razao social ou payload fiscal.
- `src/core/public-base/local-public-base.store.ts:156`: warning de JSON
  invalido preservado, mas metadata limitada a `{ reason: "invalid_json" }`.
  Nao expoe conteudo bruto do indice nem mensagem bruta do parser.
- `src/core/public-base/local-public-base.store.ts:163`: warning de documento
  incompativel preservado, mas metadata limitada a
  `{ reason: "incompatible_index_document" }`. Nao expoe campos do documento
  persistido.

## Checks executados

- `git -C /Users/icaroaguiar/.codex/worktrees/1333/consulta-simples-csv status --short --branch --untracked-files=all`
  - Resultado: worktree detached com exatamente dois arquivos modificados
    rastreados e um receipt novo untracked:
    - `M src/core/public-base/local-public-base.store.ts`
    - `M test/unit/local-public-base.test.ts`
    - `?? docs/goals/fiscal-desk-orchestration/results/first-release-local-public-base-log-privacy-hardening-2026-06-13.md`
- `git -C /Users/icaroaguiar/.codex/worktrees/1333/consulta-simples-csv diff --name-only`
  - Resultado limitado aos dois arquivos esperados:
    - `src/core/public-base/local-public-base.store.ts`
    - `test/unit/local-public-base.test.ts`
  - O receipt novo aparece apenas como untracked, como esperado para a entrega
    do worker.
- Revisao manual do diff do worker.
  - `readDocument()` continua retornando `null` para indice ausente, falha de
    leitura, JSON invalido e documento incompativel, preservando o fallback
    funcional.
  - O diff removeu `indexPath: this.indexPath` dos warnings e substituiu
    mensagens brutas por reasons categoricos allowlisted.
  - Os testes adicionados cobrem documento incompativel, JSON invalido e erro de
    leitura, verificando ausencia de diretorio, nome do indice, CNPJ, razao
    social, payload bruto e mensagens de erro do filesystem.
- `rg -n "indexPath: this\.indexPath|error\.message|logger\.warn" /Users/icaroaguiar/.codex/worktrees/1333/consulta-simples-csv/src/core/public-base/local-public-base.store.ts /Users/icaroaguiar/.codex/worktrees/1333/consulta-simples-csv/test/unit/local-public-base.test.ts`
  - Resultado: tres matches, todos `logger.warn` em
    `src/core/public-base/local-public-base.store.ts:145`, `:156` e `:163`.
  - Interpretacao: nao houve match para `indexPath: this.indexPath` nem
    `error.message`. Os `logger.warn` restantes usam apenas metadata categorica
    nao sensivel.
- `git -C /Users/icaroaguiar/.codex/worktrees/1333/consulta-simples-csv diff --check`
  - Resultado: passou sem output.
- Scan complementar:
  - `rg -n "indexPath|error\.message|stack|cnpj|razao|razaoSocial|records|raw payload|sourceFilePath|sourceFileName|content|payload|fiscal" ...`
  - Interpretacao: os matches de dados sensiveis existem em tipos, persistencia
    normal e fixtures/testes, mas nao aparecem nos metadados dos warnings
    revisados.

## Checks nao executados

- `pnpm exec vitest run test/unit/local-public-base.test.ts` nao concluiu nesta
  thread.
  - Motivo: o Vitest tentou escrever cache em
    `/Users/icaroaguiar/.codex/worktrees/1333/consulta-simples-csv/node_modules/.vite-temp/vitest.config.ts.timestamp-...mjs`
    e recebeu `EPERM`.
  - Nao solicitei escalonamento porque o escopo desta revisao proibe alterar a
    worktree do worker. A evidencia do worker reporta o teste focado passando
    com 12 testes.

## Riscos residuais

- O documento persistido ainda contem `sourceFilePath` e registros da base local
  por desenho preexistente; este review avaliou somente vazamento em warnings de
  `LocalPublicBaseStore.readDocument()`.
- A execucao local do teste focado nao foi reproduzida por restricao de escrita
  da sandbox na worktree do worker; o diff, o `diff --check`, o scan obrigatorio
  e a evidencia declarada do worker sustentam a aprovacao candidata.
- A aprovacao aqui nao substitui a integracao/julgamento na branch canonica.

## Recomendacao ao judge

Recomendo aceitar como `approved_candidate` para integracao julgada. Nao
identifiquei vazamento residual de path absoluto, `this.indexPath`,
`error.message`, stack, conteudo de indice, CNPJ, razao social ou payload fiscal
nos metadados dos warnings revisados, nem regressao funcional evidente no
fallback de leitura da Base Publica Local.

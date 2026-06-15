# First Release Local Public Base Log Privacy Hardening

Data: 2026-06-13

Status: `ready_for_judge_review`

## Resumo executivo

Sanitizei os warnings runtime da Base Publica Local em
`LocalPublicBaseStore.readDocument()` para remover caminhos absolutos,
`this.indexPath` e mensagens brutas de erro. O fallback funcional foi
preservado: indices ausentes, invalidos, JSON invalido ou falha de leitura
continuam retornando estado seguro sem impedir o app.

## Arquivos lidos

- `AGENTS.md`
- `docs/goals/fiscal-desk-orchestration/goal.md`
- `docs/goals/fiscal-desk-orchestration/state.yaml`
- `docs/goals/fiscal-desk-orchestration/integration-plan.md`
- `docs/goals/fiscal-desk-orchestration/results/first-release-post-rework-release-security-review-dispatch-2026-06-13.md`
- `src/core/public-base/local-public-base.store.ts`
- `test/unit/local-public-base.test.ts`

## Arquivos alterados

- `src/core/public-base/local-public-base.store.ts`
- `test/unit/local-public-base.test.ts`
- `docs/goals/fiscal-desk-orchestration/results/first-release-local-public-base-log-privacy-hardening-2026-06-13.md`

## Decisao de sanitizacao

- Removi `indexPath: this.indexPath` dos dois warnings da Base Publica Local.
- Substitui `error instanceof Error ? error.message : ...` por razoes
  categoricas allowlisted:
  - `read_failed`
  - `invalid_json`
  - `incompatible_index_document`
- Mantive o sinal operacional por categoria nao sensivel, sem path absoluto,
  stack, mensagem bruta, conteudo do indice, CNPJ, razao social ou payload
  fiscal.
- Nao adicionei criptografia, rede, telemetria, diagnostico, updater, release
  ou alteracao de contrato publico.

## Testes e checks executados

- `pnpm install --frozen-lockfile`: passou; lockfile ja estava atualizado e nao
  houve alteracao de `package.json` ou `pnpm-lock.yaml`.
- `pnpm exec vitest run test/unit/local-public-base.test.ts`: passou, 1 arquivo,
  12 testes.
- `pnpm typecheck`: passou.
- `pnpm lint`: passou depois de corrigir formatacao Biome em duas quebras de
  linha do teste.
- `pnpm test`: passou, 40 arquivos, 261 testes.
- `git diff --check`: passou.

## Checks nao executados

- Review independente nao foi executado nesta thread. Esta entrega e candidata
  para o judge/orquestrador externo e nao foi autoaprovada.

## Scans e interpretacao

Comando:

```bash
rg -n "indexPath: this\.indexPath|error\.message|logger\.warn" src/core/public-base/local-public-base.store.ts test/unit/local-public-base.test.ts
```

Resultado interpretado:

- Nao ha match para `indexPath: this.indexPath`.
- Nao ha match para `error.message`.
- Restam apenas tres matches de `logger.warn` em
  `src/core/public-base/local-public-base.store.ts`, todos com metadata limitada
  a `reason` categorico nao sensivel.

O harness tambem emitiu warning warn-only `magic_string_boundary=2`. A duplicacao
do nome do arquivo de indice no teste foi centralizada em constante local. Os
literais de reason permanecem nos testes para provar explicitamente o contrato
interno de sanitizacao; eles nao contem dados sensiveis nem definem boundary
externo de auth, tenancy, permissao, storage compartilhado ou API publica.

## Riscos residuais

- O store ainda persiste `sourceFilePath` dentro do documento local preparado,
  comportamento preexistente fora deste owner window. A correcao aqui limita o
  vazamento via warnings runtime.
- Os warnings continuam indo para o logger configurado, mas agora com metadata
  categorica e sem payload sensivel.
- O judge ainda precisa revisar o diff e decidir integracao na branch canonica.

## Recomendacao ao judge

Recomendo `approved_candidate_for_integration`: o blocker formal de privacidade
de logs foi tratado dentro do allowed write, com teste focado, suite completa,
typecheck, lint, scan obrigatorio e `git diff --check` passando. Nao ha pedido
de stage, commit, push, PR, deploy ou release nesta entrega.

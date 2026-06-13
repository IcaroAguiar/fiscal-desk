# Goal: Fiscal Desk F5 - Base Publica Local

## Outcome

Consolidar Base Publica Local como caminho local de volume, com preparo/consentimento explicitos, data da base, staleness e lookup local independente de Receita Web.

## Oracle

- Com fixture local pequena e sem rede, o app consegue preparar/indexar e consultar localmente.
- Usuario ve data da base e aviso de desatualizacao sem bloqueio automatico.
- Nao ha download oculto.
- Lookup local nao se confunde com cache web.

## Non-Goals

- Nao baixar base real sem autorizacao.
- Nao introduzir banco pesado sem design.
- Nao bloquear o app durante preparo.
- Nao misturar com Receita Web.
- Nao criar UI antes do contrato.

## Subagents

- `architect`: decide armazenamento se necessario.
- `backend-builder`: implementa store/index local.
- `frontend-builder`: somente depois do contrato.
- `test-engineer`: fixture local e performance basica.
- `reviewer`: diff material.

## Allowed Writes

- `src/core/public-base/**`
- Provider local especifico, se aprovado.
- IPC/preload/types somente com owner unico.
- Testes e fixtures pequenas.

## Do Not Touch

- Receita Web adapter.
- Provider fallback policy sem coordenar F4.
- Download real de base.
- Release/package.

## Gates

- F4 provider contract suficiente.
- Consentimento antes de preparo.
- Fixture offline validada.
- Aviso de base desatualizada como warning, nao bloqueio.
- Smoke Electron se caminho real mudar.

## Stop Conditions

- Necessidade de rede/download para passar teste.
- Storage choice muda arquitetura sem ADR/contrato.
- Colisao com F4 provider semantics.

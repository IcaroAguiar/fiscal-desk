# Goal: Fiscal Desk F4 - Provider Catalog, Health And Fallback

## Outcome

Separar catalogo, capacidades, saude, retry e fallback de providers sem violar a arquitetura porta/adapters e sem transformar Receita Web em fallback automatico massivo.

## Oracle

- Providers explicam requisitos, limites e capacidades.
- Health state, retry budget, cooldown e falhas ficam centralizados.
- Divergencias nao escolhem vencedor automatico oculto.
- `mock` continua provider offline funcional.
- Receita Web permanece assistida/experimental.

## Non-Goals

- Nao criar novo provider sem contrato.
- Nao alterar internals de Receita Web salvo compatibilidade/teste.
- Nao implementar batch fallback automatico.
- Nao criar UI antes do contrato.
- Nao vazar raw HTML ou diagnostico sensivel.

## Subagents

- `api-designer`: contrato de catalogo/health/fallback.
- `backend-builder`: implementa depois do contrato.
- `security-reviewer`: se houver credenciais, diagnostico ou dados sensiveis.
- `test-engineer`: provider tests e fallback policy tests.
- `reviewer`: diff material.

## Allowed Writes

- `src/core/simples/**`, com owner unico.
- `src/core/infra/rate-limiter.ts`
- `src/core/infra/http-client.ts`
- `src/core/app/process-csv.types.ts`, somente se o contrato exigir e sem colisao F1/F3/F6.
- Testes de provider.

## Do Not Touch

- `src/core/simples/adapters/receita-web/**`, salvo leitura/teste aprovado.
- Renderer de selecao de provider antes do contrato.
- Smoke deterministico para depender de provider online.

## Gates

- Contrato aprovado.
- Retry/fallback com budget/cooldown.
- Sem vencedor automatico oculto.
- Security review se diagnostico/sensivel.
- `mock` validado offline.

## Stop Conditions

- Fallback exige Receita Web massiva.
- Provider semantics colidem com F5/F7.
- Diagnostico requer dado sensivel fora do boundary.

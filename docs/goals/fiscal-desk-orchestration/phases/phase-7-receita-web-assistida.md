# Goal: Fiscal Desk F7 - Receita Web Assistida

## Outcome

Definir e implementar Receita Web como confirmacao assistida, opcional e faseada, com contrato sanitizado de diagnostico, sem transforma-la em provider massivo padrao, fallback automatico ou smoke deterministico.

## Oracle

- `receita-web` aparece somente como modo assistido/experimental.
- Usuario recebe comunicacao clara sobre navegador visivel, lentidao, CAPTCHA, bloqueio e retomada parcial.
- Nenhum HTML bruto, screenshot sensivel, CNPJ bruto em diagnostico, credencial ou dado fiscal identificavel sai do adapter ou entra em logs/resultado publico.
- CAPTCHA, bloqueio estrutural ou HTML imprevisivel podem encerrar a fase como blocker aceito.
- `mock` continua provider offline padrao e funcional.
- `receita-web` nao entra no smoke deterministico.

## Non-Goals

- Nao criar automacao robusta em lote.
- Nao usar Receita Web como fallback automatico.
- Nao prometer consulta massiva confiavel.
- Nao salvar ou expor raw HTML fora de evidencia local revisavel e sanitizada.
- Nao adicionar backend remoto, banco, PDF, deploy ou release.
- Nao substituir `mock` ou `cnpja-open` como caminho principal.

## Subagents

- `api-designer`: fecha contrato de status/erro e diagnostico sanitizado.
- `security-reviewer`: gate bloqueante para HTML, screenshots, logs, fixtures, CNPJs e evidencia.
- `backend-builder`: implementa somente depois do contrato aprovado.
- `test-engineer`: cobre parser/status/factory e garante que `receita-web` nao contamina smoke deterministico.
- `docs-writer`: documenta limitacoes, modo assistido e stop conditions.

## Allowed Writes

- `src/core/simples/adapters/receita-web/**`
- `src/core/simples/simples-lookup.types.ts`, somente com dono unico do contrato.
- `src/core/simples/simples-provider.factory.ts`, somente se o contrato decidir expor selecao assistida.
- `test/unit/**` e fixtures sanitizadas.
- Documentos da fase e relatorio de evidencia sanitizada.
- `.ai/**` apenas como contexto local nao versionado, se usado.

## Do Not Touch

- `src/renderer/**`, salvo fase separada de UI assistida.
- Smoke deterministico para aceitar `receita-web`.
- Release/update.
- Automacao de rede em CI.
- Raw HTML versionado.

## Gates

- Contrato central para status e payloads.
- Security review sem raw HTML/CNPJ bruto/dado fiscal identificavel em resultado/log/fixture versionada.
- Produto comunica modo assistido, limites e retomada parcial quando aplicavel.
- `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` quando houver codigo material.
- `pnpm smoke:real-csv` permanece offline com `mock`.

## Stop Conditions

- CAPTCHA obrigatorio sem caminho assistido aceitavel.
- Bloqueio de IP ou anti-bot estrutural.
- Necessidade de vazar raw HTML para fora do adapter.
- Pressao para tornar Receita Web fallback automatico ou smoke deterministico.
- Falta de contrato aprovado antes de implementacao.

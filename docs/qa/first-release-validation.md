# First Release Validation

Este documento define o criterio publico de validacao para a primeira sequencia de PRs do Fiscal Desk.

## Objetivo

Entregar PRs pequenos e reversiveis para transformar o app em Fiscal Desk sem quebrar o fluxo atual de CSV, providers existentes e saida processada.

## Cobertura de testes esperada

Todo PR material deve executar, no minimo:

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm smoke:real-csv`
- `pnpm smoke:visual`
- `pnpm build`
- `gitleaks detect --source . --redact --no-banner`
- `node docs/ai/quality-gate/check-ratchet.mjs`

O gate de coverage ainda e warning-only porque o projeto nao gera `coverage/lcov.info`. Quando adicionarmos coverage real, o ratchet deve virar bloqueante para linhas alteradas.

## Smoke real com arquivo e CNPJs publicos

Fixture publica:

- `test/fixtures/smoke/cnpjs-publicos-reais.csv`

Ela contem CNPJs publicos reais de empresas brasileiras, duplicidade proposital e uma linha invalida proposital.

Smoke offline deterministico:

```bash
pnpm smoke:real-csv
```

Esse smoke usa o provider `mock`, nao depende de rede e valida:

- leitura de arquivo CSV real;
- deteccao da coluna `cnpj`;
- normalizacao de CNPJs reais;
- deduplicacao;
- linha invalida;
- geracao de CSV de saida em pasta temporaria.

Smoke com provider real, manual e opt-in:

```bash
SMOKE_PROVIDER=cnpja-open pnpm smoke:real-csv
```

Esse caminho depende de internet e disponibilidade do provider externo. Nao deve bloquear CI ate termos politica de retry, rate limit e fallback mais madura.

`receita-web` nao e aceito pelo smoke deterministico. Ele continua sendo modo assistido/experimental, com navegador visivel, sujeito a bloqueio e validacao manual separada.

## Smoke visual

Para PRs de UI, executar:

```bash
pnpm smoke:visual
```

O smoke captura desktop e mobile contra o Vite local:

- desktop: 1440 x 1000;
- mobile: 390 x 900;
- checar `overflow=false`;
- checar que botoes principais nao ficam cortados.

Screenshots podem ficar em `/private/tmp` durante a validacao local e nao devem ser commitados. No CI, o workflow publica os artefatos em `docs/qa/visual-smoke-artifacts/` dentro do pacote `pr-quality-gate`.

## Regra de PR

Cada PR deve informar:

- packet ou fatia executada;
- arquivos principais alterados;
- checks executados;
- smoke real executado;
- screenshot quando houver UI;
- riscos residuais.

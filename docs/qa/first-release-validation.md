# First Release Validation

Este documento define o criterio publico de validacao para a primeira sequencia de PRs do Fiscal Desk.

## Objetivo

Entregar PRs pequenos e reversiveis para transformar o app em Fiscal Desk sem
quebrar o fluxo atual de CSV, entrada Excel/XLSX atual, providers existentes e
saida processada.

## Cobertura de testes esperada

Todo PR material deve executar, no minimo:

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm test:coverage`
- `pnpm smoke:real-csv`
- `pnpm smoke:electron-ui`
- `pnpm smoke:visual`
- `pnpm build`
- `gitleaks detect --source . --redact --no-banner`
- `node docs/ai/quality-gate/check-ratchet.mjs`

Coverage quantitativa agora e um sinal ativo de regressao do pacote integrado.
O gate atual gera `coverage/coverage-summary.json` e `coverage/lcov.info` via
`pnpm test:coverage`, com universo limitado a `src/**/*.{ts,tsx}` para medir o
codigo do app Electron.

Coverage nao e prova funcional suficiente. Nenhuma fase material pode fechar
apenas por percentual, ratchet ou numero de testes. A validacao precisa
combinar coverage, teste focado do contrato alterado e smokes qualitativos
conforme a superficie tocada:

| Superficie tocada | Evidencia qualitativa minima |
|---|---|
| Core, parser, normalizador, export, provider ou ingestao | Testes focados do contrato alterado e `pnpm smoke:real-csv` quando o fluxo CSV/core/provider for afetado. |
| Renderer, copy, layout ou estado visivel | Teste focado de renderer quando houver e `pnpm smoke:visual`. |
| Main, preload, IPC, execucao, entrega ou fluxo Electron | `pnpm smoke:electron-ui`. |
| Base Publica Local, preparo ou consentimento local | Smoke Electron com Base Publica Local quando aplicavel: `FISCAL_DESK_SMOKE_PROVIDER=base-publica-local pnpm smoke:electron-ui`. |

O primeiro release nao marca como disponiveis: release publico, `dist`/publish
distribuivel, update real, envio de diagnostico, telemetria real,
licenca/account real, templates/modelos reutilizaveis, PDF/Word/OCR reais ou
Receita Web live/massiva. Esses itens continuam bloqueados ate owner windows
proprios, com gates e smokes especificos.

Evidencia pos-Excel runtime: `post_p3_excel_input_runtime_exposure` validou
entrada XLSX no Electron com `mock` e `base-publica-local`, preservando CSV,
checkpoint, retomada e autosave XLSX. A validacao canonica registrou 43 arquivos
/ 283 testes, cobertura global 76.39%, PR coverage 75.59%, lint, typecheck,
build, ratchet e smoke visual.

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

## Smoke real do app Electron

Para PRs que tocam IPC, preload, fluxo de processamento, persistencia local ou estado operacional, executar:

```bash
pnpm smoke:electron-ui
```

Esse smoke lanca o app Electron real com `userData` temporario, carrega a UI pelo
renderer local, seleciona o provider `mock`, processa a fixture publica pelo
`window.appBridge.processCsv`, valida auto-save e valida que o ledger/checkpoint
foi criado. Para fluxos que tocam entrada Excel/XLSX, o smoke deve provar
`inputFormat: "xlsx"` ou evidencia equivalente de arquivo XLSX processado no
runtime. Ele existe para impedir fechamento baseado apenas em teste unitario ou
mock de DOM.

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

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
- `pnpm test:e2e`
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

## E2E deterministico local-first

O comando agregado de e2e e:

```bash
pnpm test:e2e
```

Ele executa em sequencia:

- `pnpm test:coverage`;
- `SMOKE_PROVIDER=mock pnpm smoke:real-csv`;
- `SMOKE_PROVIDER=base-publica-local pnpm smoke:real-csv`;
- `pnpm build`;
- smoke Electron real com entrada CSV, provider `mock` e entrega XLSX;
- smoke Electron real com entrada CSV, provider `base-publica-local` e entrega
  XLSX;
- smoke Electron real com entrada XLSX, provider `mock` e entrega XLSX;
- smoke Electron real com entrada XLSX, provider `base-publica-local` e entrega
  XLSX;
- `pnpm smoke:visual`.

O e2e gera `e2e-all-report.json` e `e2e-all-report.md` no diretorio definido
por `FISCAL_DESK_E2E_OUTPUT_DIR`; sem essa variavel, usa uma pasta temporaria
local. O CI publica esse diretorio como artifact.

Exclusoes intencionais:

- Receita Web live/massiva permanece assistida/experimental, com validacao
  manual separada;
- `cnpja-open` live permanece opt-in por depender de rede, disponibilidade e
  rate limit;
- publish, assinatura, notarizacao, updater real, envio de diagnostico,
  telemetria e licenca/account continuam fora do e2e deterministico.

O primeiro release nao marca como disponiveis: release publico, `dist`/publish
distribuivel, update real, envio de diagnostico, telemetria real,
licenca/account real, templates/modelos reutilizaveis, PDF/Word/OCR reais ou
Receita Web live/massiva. Esses itens continuam bloqueados ate owner windows
proprios, com gates e smokes especificos.

Historico operacional detalhado, goals de agentes e reports gerados foram
retirados do current tree publico. Esta matriz resume o corte publicado; para
nova release, reexecute os gates abaixo e anexe a evidencia no GitHub Release ou
em arquivo local nao versionado.

## Smoke real com arquivo e CNPJs sinteticos

Fixture versionada:

- `test/fixtures/smoke/cnpjs-sinteticos-smoke.csv`

Ela contem CNPJs sinteticos de smoke, duplicidade proposital e uma linha invalida proposital.

Smoke offline deterministico:

```bash
pnpm smoke:real-csv
```

Esse smoke usa o provider `mock`, nao depende de rede e valida:

- leitura de arquivo CSV real;
- deteccao da coluna `cnpj`;
- normalizacao de CNPJs sintéticos;
- deduplicacao;
- linha invalida;
- geracao de CSV de saida em pasta temporaria.

`smoke:real-csv` nao aceita provider externo com fixture sintetica. Para
validacao real de `cnpja-open`, use um CSV proprio e o fluxo manual de
comparacao, sem versionar CNPJs reais.

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

O e2e agregado executa esse smoke nas quatro combinacoes deterministicas:

- CSV + `mock`;
- CSV + `base-publica-local`;
- XLSX + `mock`;
- XLSX + `base-publica-local`.

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

Screenshots podem ficar em `/private/tmp` durante a validacao local e nao devem
ser commitados. No CI, o e2e agregado publica os artefatos visuais em
`docs/qa/e2e-artifacts/visual-smoke/` dentro do pacote `pr-quality-gate`.

## Regra de PR

Cada PR deve informar:

- packet ou fatia executada;
- arquivos principais alterados;
- checks executados;
- smoke real executado;
- screenshot quando houver UI;
- riscos residuais.

## GitHub Actions

O workflow `PR Quality Gate` executa `pnpm test:e2e` em Ubuntu com `xvfb-run`,
mantendo lint, typecheck, build, gitleaks e ratchet. Isso coloca coverage,
smoke CSV, smoke Electron e smoke visual sob um unico receipt automatizado de
CI.

O workflow `Desktop unsigned builds` executa por `workflow_dispatch` e tags
`v*`, com matriz Windows/macOS:

- Windows x64: `pnpm dist:win`, artifact `fiscal-desk-windows-x64`;
- macOS: `pnpm dist:mac`, artifact `fiscal-desk-macos`.

Esse workflow nao publica GitHub Release, nao assina, nao notariza, nao habilita
updater real e mantem `permissions.contents: read`.

Para publicar uma GitHub Release manual com artifacts unsigned, use o contrato
de [`release-publication.md`](release-publication.md). O workflow
`Release artifact verification` baixa os artifacts de uma run informada, valida
presenca dos assets esperados e gera `release-manifest.json` e `SHA256SUMS.txt`
sem criar tag, sem editar Release e sem permissao `contents: write`.

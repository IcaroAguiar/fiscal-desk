# Fiscal Desk F9E - Browser-To-API Initial Capture

Status: `investigation_complete_no_api_endpoint_observed`

Data: 2026-06-14 17:21 -03

## Escopo

Executar uma captura minima e supervisionada da pagina inicial da Receita Web,
sem preencher formulario e sem enviar CNPJ real, para avaliar se existe API
observavel que justifique um caminho paralelo mais rapido fora do browser
headed.

Esta investigacao nao implementa F9E paralela e nao libera mudancas em
`src/**` ou `test/**`.

## Procedimento

- Chrome temporario aberto com `--remote-debugging-port` e `--user-data-dir`
  em `/private/tmp`.
- `browser-trace` iniciado fora do sandbox para acessar CDP local.
- Navegacao feita por CDP para a URL atual do adapter:
  `https://www8.receita.fazenda.gov.br/SimplesNacional/Aplicacoes/ATBHE/ConsultaOptantes.app/ConsultarOpcao.html`.
- Nenhum CNPJ foi digitado, submetido ou capturado.
- `browser-to-api` rodou offline com allowlist de origem
  `www8.receita.fazenda.gov.br` e redaction explicita de `cookie` e
  `set-cookie`.

## Evidencia

Captura bem-sucedida:

- run local: `receita-web-initial-page-9225-2026-06-14`;
- `browser-trace` summary: 17 requests e 17 responses;
- `browser-to-api load`: 17 requests, 17 responses, 0 response bodies attached;
- `browser-to-api filter`: 2 itens mantidos na origem Receita, 6 descartados por
  origem;
- `browser-to-api normalize`: 0 endpoints, 2 page renders;
- `browser-to-api infer/emit`: 0 endpoints API, 0 servers, sem client gerado;
- report sanitizado: `No API endpoints discovered`.

Tentativas anteriores em `9222` e `9223` ficaram vazias porque o daemon ou a
navegacao foram iniciados antes do anexo CDP correto. Elas nao produziram
requests/responses uteis.

## Resultado Tecnico

A evidencia observada nao revelou endpoint JSON/XHR/fetch reutilizavel para
substituir a automacao headed. O fluxo inicial da Receita Web se comportou como
renderizacao HTML/postback, coerente com o adapter atual e com a conclusao do
explorador anterior.

Conclusao: F9E nao deve tentar paralelizacao por API neste momento. Qualquer
ganho via Receita Web continuaria exigindo multiplas janelas headed e, portanto,
continua bloqueado pelo contrato experimental, riscos de CAPTCHA/bloqueio e
necessidade de judge/security antes de qualquer diff material.

## Higiene De Dados

O scanner local sinalizou possivel cookie nos eventos brutos CDP. Por isso:

- nenhum valor de cookie/header foi exibido ou copiado para docs;
- o diretorio `.o11y` inteiro foi removido da worktree apos extrair apenas
  contagens e conclusao sanitizada;
- `test ! -e .o11y` confirmou que o trace bruto nao ficou no repositorio.

## Decisao

Marcar a investigacao F9E via `browser-trace`/`browser-to-api` como concluida
para a pagina inicial.

F9E material permanece bloqueada. O caminho recomendado para a release atual e
manter Receita Web serial/assistida e direcionar volume para Base Publica Local
com perfis de velocidade e controles de pausa/cancelamento/exportacao de
pendencias ja integrados.

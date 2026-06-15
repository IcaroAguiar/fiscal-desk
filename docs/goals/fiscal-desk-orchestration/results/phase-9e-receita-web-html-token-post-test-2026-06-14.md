# F9E Receita Web HTML Token POST Test

Status: `html_token_post_still_captcha_required`

Data: 2026-06-14

## Objetivo

Testar se o formulario publico da Consulta Optantes pode ser usado via HTML
local, com GET da pagina, cookie de sessao e `__RequestVerificationToken`,
sem abrir Chrome headed e sem resolver CAPTCHA.

## Metodo

- GET publico em `https://consopt.www8.receita.fazenda.gov.br/consultaoptantes`;
- parse local do form HTML;
- captura apenas em memoria de cookie de sessao e token antifalsificacao;
- POST `application/x-www-form-urlencoded` para o action do proprio form;
- CNPJ publico de empresa conhecida usado apenas para exercitar o fluxo;
- sem imprimir CNPJ, cookie ou token;
- sem hCaptcha response;
- sem proxy, stealth, rotacao, extensoes ou bypass.

## Resultado Sanitizado

GET:

- status: `200`;
- host final: `consopt.www8.receita.fazenda.gov.br`;
- form: `POST /consultaoptantes`;
- campos observados: `Cnpj`, `__RequestVerificationToken`;
- cookie de sessao observado: sim, 1 header;
- script hCaptcha presente: sim.

POST:

- status: `200`;
- content-type: `text/html; charset=utf-8`;
- host final: `consopt.www8.receita.fazenda.gov.br`;
- classificacao: `captcha_required`;
- resposta retornou pagina HTML com aviso de protecao Captcha e erro de
  validacao do token.

## Decisao

O token publico do form nao basta para transformar Receita Web em API local
paralela. O servidor exige o desafio/protecao CAPTCHA no fluxo de POST. Portanto:

- nao promover POST HTML como provider de lote;
- manter Receita Web como assistida/experimental;
- usar Base Publica Local oficial (`Simples.zip`) como caminho de volume;
- se mantivermos exploracao futura, ela deve continuar em modo pesquisa,
  sanitizada, sem tentativa de resolver ou contornar CAPTCHA.

## UX Aplicada

Quando a execucao em Receita Web indicar cancelamento/falha com erro por item,
ou a mensagem mencionar CAPTCHA/bloqueio/portal, a UI agora mostra:

- bloqueio: Receita Web interrompida por CAPTCHA, bloqueio ou protecao do
  portal;
- proxima acao: exportar/retomar pendencias, trocar para Base local e usar
  `Buscar fonte oficial` + `Baixar e preparar oficial`.

## Verificacao

- `pnpm exec vitest run test/unit/renderer-operational-copy.test.ts test/unit/app-view.test.ts`
  - 2 arquivos
  - 28 testes
  - status: passou
- `pnpm exec vitest run test/unit/renderer-operational-copy.test.ts test/unit/app-view.test.ts test/unit/receita-browser.client-result-detection.test.ts test/unit/receita-browser.client.test.ts test/unit/receita-consulta-optantes.adapter.test.ts`
  - 5 arquivos
  - 89 testes
  - status: passou
- `pnpm typecheck`
  - status: passou
- `pnpm lint`
  - status: passou
- `git diff --check`
  - status: passou

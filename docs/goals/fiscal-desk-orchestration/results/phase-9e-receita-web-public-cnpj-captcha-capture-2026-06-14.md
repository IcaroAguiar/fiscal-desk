# F9E Receita Web Public CNPJ Capture

Status: `captcha_blocked_no_success_flow`

Data: 2026-06-14 19:35 -03

## Escopo

Captura supervisionada com `browser-trace` + `browser-to-api` para responder
por que a captura anterior nao observou endpoint de consulta e tentar exercitar
o fluxo com um CNPJ real/publico conhecido.

## Metodo

- Chrome efemero com CDP local na porta 9226;
- perfil temporario em `/private/tmp`;
- pagina inicial do adapter Receita Web;
- preenchimento de CNPJ publico conhecido;
- submissao do formulario;
- sem resolver CAPTCHA;
- sem proxy, stealth, rotacao, extensoes ou bypass anti-bot.

## Resultado

O fluxo nao chegou a sucesso. A pagina retornou estado de bloqueio por
protecao CAPTCHA com mensagem de token invalido.

`browser-trace` observou:

- 26 requests;
- 25 responses.

`browser-to-api` observou:

- 1 operacao: `POST https://consopt.www8.receita.fazenda.gov.br/consultaoptantes`;
- status HTTP observado: 200;
- mime type: `text/html`;
- confianca: baixa;
- 1 amostra;
- sem schema de response body.

Resumo seguro do POST observado:

- metodo: `POST`;
- path: `/consultaoptantes`;
- payload: formulario HTML;
- chaves observadas: campo CNPJ e `__RequestVerificationToken`;
- resposta: HTML de pagina, nao JSON/API contratual.

## Decisao Tecnica

A captura inicial nao encontrou endpoint porque ela carregou apenas a pagina
inicial e `browser-to-api` descarta page renders HTML. A captura com submissao
real encontrou o form-post, mas nao um endpoint API de sucesso.

Este resultado nao desbloqueia cliente API paralelo. Qualquer ganho de
velocidade em Receita Web ainda dependeria de automacao headed experimental,
sujeita a CAPTCHA/bloqueio, e precisa permanecer com parada imediata quando
CAPTCHA/bot-defense aparecer.

## Higiene

O trace bruto `.o11y` continha sinal de cookie em eventos CDP. Nenhum cookie,
header ou token foi copiado para este receipt. O diretorio `.o11y` deve ser
removido apos extrair esta conclusao sanitizada.

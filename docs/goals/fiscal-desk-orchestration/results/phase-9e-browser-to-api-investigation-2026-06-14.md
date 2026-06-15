# Fiscal Desk F9E - Browser To API Investigation

Status: `precisa_captura_manual`

Data: 2026-06-14

## Decisao

A skill `browser-to-api` pode ser util para investigar a hipotese de endpoint
observavel da Receita Web, mas nao consegue produzir resultado agora porque ela
so processa offline um `browser-trace` existente.

No estado atual:

- nao ha `.o11y/<run>` no workspace;
- a skill irma `browser-trace` nao foi encontrada instalada localmente;
- nao existe captura de rede para alimentar `browser-to-api`;
- o adapter atual sugere fluxo HTML/postback, nao API JSON evidente.

## Evidencia

O subagente read-only `019ec7af-7555-7190-97f3-63acde10e0cb` revisou a skill,
o contrato F9E e o adapter Receita Web.

Achados principais:

- `browser-to-api` nao captura trafego; ela consome `.o11y/<run>/cdp/network`.
- O adapter atual abre `ConsultarOpcao.html`, preenche input, clica submit e
  classifica resultado por `page.content()`/texto do `body`.
- O parser atual detecta CAPTCHA/bloqueio por HTML/texto.
- Sinal positivo futuro seria XHR/fetch com `application/json` ou endpoint POST
  estavel e reaproveitavel.
- Sinal negativo seria fluxo apenas `text/html`, postback full-page, hidden
  fields/tokens efemeros, CAPTCHA, bot defense ou session plumbing.

## Plano Seguro De Captura

Somente se o usuario autorizar uma etapa separada:

1. Fazer captura manual supervisionada, sem automacao Playwright do submit.
2. Usar navegador limpo e efemero, sem `storageState`, cookies persistidos ou
   perfil reaproveitado.
3. Capturar primeiro apenas carregamento da pagina inicial.
4. Se necessario, fazer um unico submit manual com campo vazio ou placeholder
   obviamente invalido, nunca CNPJ real.
5. Parar imediatamente em CAPTCHA, bloqueio, token anti-bot nao trivial ou
   navegacao suspeita.
6. Salvar trace e rodar `browser-to-api` offline com allowlist de origem
   `www8.receita.fazenda.gov.br`.

## Stop Conditions

- Captura exige CNPJ real;
- aparece CAPTCHA ou bloqueio;
- aparecem endpoints de defesa/bot, `sensor_data` ou token efemero obrigatorio;
- investigacao exige manter ou ampliar flags de automacao;
- superficie e apenas HTML/postback sem endpoint observavel reaproveitavel.

## Impacto No Contrato F9E

Nenhum codigo foi liberado. A hipotese de endpoint observavel continua aberta
apenas como investigacao manual/offline futura.

O contrato F9E deve continuar exigindo stop em CAPTCHA/bloqueio, sem stealth,
sem sessao persistente, sem smoke live deterministico e sem promessa de volume.

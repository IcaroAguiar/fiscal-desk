# Fiscal Desk F9E - Browser Trace Installed

Status: `installed_local_skill`

Data: 2026-06-14 16:58 -03

## Resultado

A skill local `browser-trace` foi instalada em:

- `/Users/icaroaguiar/.agents/skills/browser-trace`

Ela fornece os scripts:

- `scripts/start-capture.mjs`
- `scripts/capture-daemon.mjs`
- `scripts/stop-capture.mjs`
- `scripts/bisect-cdp.mjs`

## Compatibilidade

A skill captura eventos de rede CDP em:

- `.o11y/<run>/cdp/network/requests.jsonl`
- `.o11y/<run>/cdp/network/responses.jsonl`

Esse formato e compativel com a skill `browser-to-api`, que consome um run
`.o11y/<run>` para gerar OpenAPI/report.

## Verificacao

Comandos executados:

- `find /Users/icaroaguiar/.agents/skills/browser-trace -maxdepth 3 -type f | sort`
- `node --check /Users/icaroaguiar/.agents/skills/browser-trace/scripts/start-capture.mjs`
- `node --check /Users/icaroaguiar/.agents/skills/browser-trace/scripts/capture-daemon.mjs`
- `node --check /Users/icaroaguiar/.agents/skills/browser-trace/scripts/stop-capture.mjs`
- `node --check /Users/icaroaguiar/.agents/skills/browser-trace/scripts/bisect-cdp.mjs`

Todos passaram sem erro de sintaxe.

## Limites

Nao foi feita captura real da Receita Web nesta etapa.

Proximo passo seguro, se autorizado, e uma captura manual supervisionada:

1. abrir navegador com remote debugging em perfil limpo/efemero;
2. iniciar `browser-trace`;
3. carregar a pagina inicial da Receita Web;
4. opcionalmente fazer um unico submit manual com placeholder invalido, nunca
   CNPJ real;
5. parar imediatamente em CAPTCHA/bloqueio/token anti-bot;
6. rodar `browser-to-api` offline com allowlist de origem
   `www8.receita.fazenda.gov.br`.

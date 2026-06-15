# F9E Receita Web CAPTCHA Response

Status: `site_captcha_requires_provider_strategy_change`

Data: 2026-06-14

## Contexto

Durante teste manual com CSV grande, a Receita Web restringiu o fluxo por
CAPTCHA. O app estava usando `receita-web-parallel-experimental` com perfil
`balanced` e `maxConcurrentLookups: 2`, mas o fluxo real cancelou apos a
primeira consulta efetiva e emitiu `UnhandledPromiseRejectionWarning` por
timeout do Playwright.

## Decisao

Receita Web nao deve ser tratada como motor principal de lote nem como
provider de alta velocidade. O site oficial de Consulta Optantes e um servico
publico de formulario HTML e agora pode exigir CAPTCHA; portanto, qualquer uso
deve continuar assistido, visivel, experimental e com parada clara quando a
defesa anti-bot aparecer.

Nao usar nesta rodada:

- bypass de CAPTCHA;
- proxy, stealth, rotacao de IP ou simulacao agressiva de navegador;
- promessa de paralelizacao efetiva em Receita Web quando o site bloquear.

## Alternativa oficial para volume

Para lote, o caminho oficial mais defensavel e Base Publica Local do Simples:
baixar e indexar `Simples.zip` do diretorio mensal da Receita Federal. Isso
evita exigir o pacote agregado `cnpj.tar.gz` de aproximadamente 60GB quando o
produto precisa apenas de situacao Simples/SIMEI.

Fontes oficiais verificadas:

- `https://arquivos.receitafederal.gov.br/dados/cnpj/dados_abertos_cnpj/`
  lista o agregado `cnpj.tar.gz` com 60GB e diretorios mensais.
- `https://arquivos.receitafederal.gov.br/dados/cnpj/dados_abertos_cnpj/2026-01/`
  lista `Simples.zip` com 268MB.
- `https://www8.receita.fazenda.gov.br/SimplesNacional/aplicacoes.aspx?id=21`
  lista `Consulta Optantes` como servico publico de pagina/formulario.

## Correcao aplicada

`raceWithAbort` em `receita-browser.client.ts` removia listener com
`promise.finally(...)`. Quando o Playwright rejeitava por timeout, esse
`finally` criava uma segunda promise rejeitada sem handler, causando warning no
processo Electron mesmo quando o fluxo local capturava a falha.

Troca aplicada: limpar listener via `promise.then(onFulfilled, onRejected)`,
sem gerar promise rejeitada secundaria.

## Verificacao

- `pnpm exec vitest run test/unit/receita-browser.client-result-detection.test.ts test/unit/receita-browser.client.test.ts test/unit/receita-consulta-optantes.adapter.test.ts`
  - 3 arquivos
  - 61 testes
  - status: passou
- `pnpm typecheck`
  - status: passou
- `pnpm lint`
  - status: passou

## Proximo encaminhamento

1. Manter Receita Web como consulta assistida/manual e one-off.
2. Priorizar lote rapido pela Base Publica Local, com download automatico e
   indexacao apenas do arquivo `Simples.zip` mensal.
3. Avaliar provider oficial pago/credenciado apenas se ele expuser contrato
   para Simples/SIMEI e uso em lote; nao assumir que o POST HTML observado e
   uma API suportada.
4. No UI, quando provider Receita Web encontrar CAPTCHA/timeout repetido,
   interromper cedo e orientar troca para Base Publica Local em vez de exibir
   ETA de horas.

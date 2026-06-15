# F9E Receita Web Human CAPTCHA Unlock

Status: `human_in_the_loop_unlock_implemented`

Data: 2026-06-14

## Objetivo

Facilitar o desbloqueio humano quando a Receita Web exigir CAPTCHA, sem
implementar bypass, solver terceirizado, proxy, stealth ou rotacao.

## Comportamento

Quando o adapter Receita Web detecta CAPTCHA sem resultado:

1. mantem a janela visivel aberta;
2. aguarda o usuario resolver manualmente o desafio na propria janela;
3. reavalia periodicamente se o CAPTCHA saiu e se o resultado apareceu;
4. se o resultado aparecer, segue para o parser normal e pode retornar
   `SUCCESS`;
5. se o usuario nao destravar dentro do tempo, o fluxo continua retornando
   `CAPTCHA_REQUIRED`/bloqueio como antes.

Timeout padrao: 120 segundos.

## Limites

- nao resolve CAPTCHA automaticamente;
- nao envia hCaptcha response sintetico;
- nao persiste token, cookie ou HTML bruto;
- nao promete volume ou paralelizacao quando CAPTCHA aparece;
- Base Publica Local continua sendo o caminho recomendado para lote.

## Arquivos

- `src/core/simples/adapters/receita-web/receita-browser.client.ts`
  - adiciona `waitForManualCaptchaResolution`.
- `src/core/simples/adapters/receita-web/receita-consulta-optantes.adapter.ts`
  - chama o aguardo manual quando CAPTCHA aparece antes de resultado.
- `src/renderer/ui/operational-copy.ts`
  - troca copy de interrupcao imediata por desbloqueio manual.
- `src/renderer/ui/app-view.ts`
  - aviso do modo experimental explica que o usuario deve resolver CAPTCHA
    manualmente na janela visivel.

## Verificacao

- `pnpm exec vitest run test/unit/receita-consulta-optantes.adapter.test.ts test/unit/receita-browser.client-result-detection.test.ts test/unit/renderer-operational-copy.test.ts test/unit/app-view.test.ts`
  - 4 arquivos
  - 72 testes
  - status: passou
- `pnpm typecheck`
  - status: passou
- `pnpm lint`
  - status: passou

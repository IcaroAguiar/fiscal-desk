# Goal: Fiscal Desk F2 - Renderer Surface And V5

## Outcome

Estabilizar a superficie do renderer e dividir ownership visual para futuras fases, preservando o contrato V5-A sem prometer funcionalidades ainda inexistentes.

## Oracle

- V5 closeout existe ou blocker formal esta registrado.
- Renderer shell e subareas tem owners exclusivos.
- Mudancas visuais materiais tem screenshot desktop/mobile e evidencia DOM/ARIA quando aplicavel.
- UI nao promete Excel/PDF/update/Receita Web/fallback como prontos sem implementacao.
- Crescimento de arquivos grandes tem justificativa ou refactor.

## Non-Goals

- Nao mexer em provider adapters.
- Nao implementar update real.
- Nao criar painel dependente de RunLedger antes de F1/F3.
- Nao usar Spark para interpretar imagem/spec.
- Nao transformar o app em landing page.

## Subagents

- `frontend-builder`: uma subarea por vez.
- `designer` ou `vision`: somente para analise visual, nao aprovacao final.
- `test-engineer`: smoke visual/renderer.
- `reviewer`: material UI review.

## Allowed Writes

- `src/renderer/ui/**`, uma subarea por pacote.
- `src/renderer/styles.css`, somente com owner unico e impacto no ratchet declarado.
- Testes de renderer focados.
- Evidencias V5.

## Do Not Touch

- `src/core/simples/**`
- `src/main/ipc/**`
- `src/main/preload.ts`
- Release/update real.

## Gates

- V5 closeout ou blocker.
- Screenshot desktop/mobile se UI mudar.
- `pnpm smoke:visual` quando aplicavel.
- `pnpm smoke:electron-ui` quando fluxo Electron mudar.
- Ratchet considerado antes de concluir.

## Stop Conditions

- Necessidade de consumir contrato F1/F3 ainda instavel.
- Colisao com outro worker em renderer shell ou `styles.css`.
- UI cria promessa operacional falsa.

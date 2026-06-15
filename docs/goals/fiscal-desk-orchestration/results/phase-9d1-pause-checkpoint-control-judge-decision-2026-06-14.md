# Judge Decision - F9D1 Pause Checkpoint Control

Decision: `approved_for_f9d1_only`

Data: 2026-06-14

## Decisao

F9D1 esta aprovado como slice limitado de controle fino: o usuario agora tem um
controle `Pausar` visivel durante a execucao, a pausa solicita parada
cooperativa via IPC dedicado, preserva checkpoint quando houver progresso e a
UI orienta retomada pelo Historico.

## Evidencia Aceita

- Focused F9D1 tests: pass, 6 arquivos, 44 testes.
- `pnpm lint`: pass.
- `pnpm typecheck`: pass.
- `pnpm test`: pass, 43 arquivos, 299 testes.
- `pnpm smoke:visual`: pass.
- `pnpm smoke:electron-ui`: pass.
- `git diff --check`: pass.
- Review independente inicial: P2/P3/P3 encontrados.
- Rework: aplicado.
- Re-review independente: `No findings`; 4 arquivos, 32 testes focados passando.

## Limites Da Aprovacao

Esta decisao nao aprova:

- F9C2 download assistido/retomavel e indexacao streaming do `Simples.zip`.
- F9D2 cancelamento forte, exportacao parcial explicita e redistribuicao de
  pendencias.
- F9E paralelismo Receita Web experimental.
- Qualquer promessa de throughput robusto via Receita Web.

## Proxima Fila Liberavel

Proximo slice seguro: F9D2 ou F9C2, dependendo da decisao de dependencia:

- F9D2 se quisermos aprofundar controles sem nova dependencia de ZIP.
- F9C2 se aceitarmos decidir biblioteca/estrategia de download e extracao
  streaming do `Simples.zip`.

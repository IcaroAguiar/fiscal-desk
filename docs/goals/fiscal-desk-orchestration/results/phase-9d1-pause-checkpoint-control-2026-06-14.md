# Fiscal Desk F9D1 - Pause Checkpoint Control

Status: `validated_reworked_review_approved_for_f9d1`

Data: 2026-06-14

## Escopo

Implementar o primeiro slice de controle fino: `Pausar` como parada cooperativa
que usa o mesmo mecanismo seguro de abort/cancelamento, preserva checkpoint
quando houver progresso e orienta retomada pelo Historico.

Este slice nao implementa suspensao em memoria, cancelamento forte separado,
exportacao parcial manual, redistribuicao de pendencias, download/index da Base
Publica ou paralelismo da Receita Web.

## Mudancas

- Novo canal IPC `csv:pause-processing`.
- Bridge preload `pauseProcessing()`.
- Estado renderer `processingStopIntent` para diferenciar pausa de cancelamento
  na mensagem final de uma execucao `CANCELLED`.
- Botao `Pausar` visivel na tela ativa `Atividade` durante processamento.
- Copy operacional revisada para ensinar `Pausar` como caminho de checkpoint e
  `Cancelar` como interrupcao.
- Testes cobrindo contrato IPC, preload, renderer, mensagem de pausa com warning
  de auto-save e copy operacional.

## Evidencia

- `pnpm exec vitest run test/unit/process-csv-contracts.test.ts test/unit/process-csv.ipc.test.ts test/unit/preload.test.ts test/unit/app-view.test.ts test/unit/app-sync.test.ts test/unit/app-helpers.test.ts`: pass, 6 arquivos, 44 testes.
- `pnpm lint`: pass.
- `pnpm typecheck`: pass.
- `pnpm test`: pass, 43 arquivos, 299 testes.
- `pnpm smoke:visual`: pass, desktop/tablet/mobile sem overflow, botoes cortados ou sobreposicoes.
- `pnpm smoke:electron-ui`: pass, build renderer/main, app Electron real, provider `mock`, CSV, XLSX, historico e checkpoint.
- `git diff --check`: pass.
- Re-review focado: pass, 4 arquivos, 32 testes no reviewer.

## Review

Review independente inicial encontrou:

- P2: pausa com warning de auto-save podia exibir "Processamento concluido" e
  esconder orientacao de pausa/Historico.
- P3: botao `Pausar` ficava somente em `Resultado`, enquanto a execucao ativa
  abre em `Atividade`.
- P3: copy operacional ensinava `Cancelar` como caminho de checkpoint.

Rework aplicado e re-review independente retornou `No findings`.

## Riscos Residuais

- F9D1 usa parada cooperativa por abort; nao e suspensao em memoria.
- Cancelamento forte, exportacao parcial explicita e redistribuicao de
  pendencias permanecem para F9D2.
- Receita Web segue assistida, serial e sujeita a CAPTCHA/bloqueio.
- A worktree contem mudancas acumuladas de F9A/F9B/F9C1 e de gates anteriores;
  este receipt aprova apenas o slice F9D1.

## Integracao

Integrado na branch/worktree unica `feat/fiscal-desk-local-base-prep`.
Recomendacao: marcar F9D1 como aprovado e manter F9C2, F9D2 e F9E pendentes.

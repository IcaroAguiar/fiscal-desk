# Post Local Base Regate CSV Input Intake Hardening Dispatch

Data: 2026-06-13 16:52:27 -03
Orquestrador: Codex primary / judge
Status: `dispatched_pending_worktree`

## Thread

- Pending worktree: `local:54c32872-df4a-4cd9-8e26-5f592283c7a1`
- Thread alvo: Codex App worktree independente
- Modelo solicitado: GPT-5.5
- Reasoning solicitado: medium
- Branch base: `feat/fiscal-desk-local-base-prep`
- Commit minimo esperado: `6810b70 docs: select csv input hardening window`

## Owner Window

`post_local_base_regate_csv_input_intake_hardening`

## Objetivo

Fortalecer a entrada CSV/CNPJ existente e a comunicacao de erros de entrada,
preservando o fluxo CSV atual e preparando o contrato de ingestao para formatos
futuros sem implementar Excel, PDF, Word ou OCR.

## Guardrails

- Janela material single-writer.
- Resultado sera candidato ate receipt, verificacao, review independente e novo
  julgamento.
- Worker deve auditar codigo atual antes de editar.
- Se o comportamento ja estiver satisfeito, deve retornar
  `no_code_ready_for_judge_review` sem editar codigo.
- Nao pode stagear, commitar, pushar, criar PR, publicar, distribuir, fazer
  deploy, release, update, telemetria ou diagnostico real/enviado.

## Receipt Esperado

- `docs/goals/fiscal-desk-orchestration/results/post-local-base-regate-csv-input-intake-hardening-2026-06-13.md`

## Review

Qualquer diff material de codigo/teste/UI exige reviewer independente antes de
integracao.

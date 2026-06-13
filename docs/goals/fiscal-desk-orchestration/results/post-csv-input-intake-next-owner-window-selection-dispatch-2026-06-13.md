# Post CSV Input Intake Next Owner Window Selection Dispatch

Data: 2026-06-13 17:26:55 -03
Status: `dispatched_read_only_scope_selection`
Judge thread: `019ebe5c-3853-79c2-87ad-8ddace386c93`
Target branch: `feat/fiscal-desk-local-base-prep`
Target min commit: `cd544e7`

## Objective

Selecionar a proxima owner window segura apos a integracao validada de
`post_local_base_regate_csv_input_intake_hardening`, sem liberar trabalho
material automaticamente.

## Context

O owner window `post_local_base_regate_csv_input_intake_hardening` foi aprovado,
revisado, integrado seletivamente e validado na branch canonica. A fila material
ficou vazia em seguida.

O risco residual aceito pelo judge e o candidato inicial para avaliacao e:

- `p3_renderer_missing_column_normalizer_can_hide_new_core_guidance`;
- superficie provavel: `src/renderer/ui/app-helpers.ts` e testes renderer
  correlatos;
- nao ha aprovacao previa para tocar IPC, preload, provider, export, release,
  update, diagnostics, telemetry, license/account ou packaging.

## Thread Contract

Criar uma thread independente do Codex App com `/goal`, modelo `gpt-5.5` e
reasoning `medium`.

Classificacao: `read_only_scope_selection`.

Allowed write:

- `docs/goals/fiscal-desk-orchestration/results/post-csv-input-intake-next-owner-window-selection-2026-06-13.md`

Forbidden writes:

- `src/**`;
- `test/**`;
- `package.json`;
- `pnpm-lock.yaml`;
- `.github/**`;
- `docs/fiscal-desk/**`;
- qualquer arquivo fora do receipt permitido acima.

## Required Output

O receipt deve conter:

- status final: `approved_scope_candidate`, `needs_more_info` ou `blocked`;
- owner window recomendada, se houver;
- problema exato;
- allowed write set proposto;
- explicit do-not-touch set;
- shared boundaries afetadas;
- dependencias e colisoes;
- plano de verificacao qualitativo e quantitativo;
- necessidade de review independente;
- prompt pronto para o worker material, se o status for
  `approved_scope_candidate`;
- riscos residuais e stop conditions.

## Non-goals

- Nao implementar codigo.
- Nao alterar testes.
- Nao preparar release.
- Nao alterar configuracao de build, package, CI, updater, diagnostics,
  telemetry, license/account ou provider.
- Nao marcar nenhuma fase como completa.

## Judge Follow-up

O Codex primario deve ler o receipt, julgar se a janela esta suficientemente
delimitada e so entao liberar um worker material, se aplicavel.

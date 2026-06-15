# Post P3 Large File Ratchet Rework Final Readiness Review Dispatch

Data: 2026-06-13
Orquestrador/Judge: `019ebe5c-3853-79c2-87ad-8ddace386c93`
Branch canonica: `feat/fiscal-desk-local-base-prep`
Target commit minimo: `27d5484 docs: accept post-ratchet owner selection`
Status: `prepared_for_codex_app_thread`

## Objetivo

Executar um review final read-only de prontidao depois do rework integrado do
large-file ratchet.

Este review deve responder uma pergunta objetiva: existe algum blocker concreto
restante antes de liberar uma proxima janela material do Fiscal Desk?

## Contexto Obrigatorio

Leia antes de decidir:

- `AGENTS.md`
- `docs/goals/fiscal-desk-orchestration/goal.md`
- `docs/goals/fiscal-desk-orchestration/state.yaml`
- `docs/goals/fiscal-desk-orchestration/integration-plan.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-large-file-ratchet-rework-next-owner-window-selection-judge-decision-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-large-file-ratchet-rework-next-owner-window-selection-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-integrated-validation-large-file-ratchet-rework-integration-judge-decision-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-validation-docs-rebaseline-integrated-first-release-validation-judge-decision-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-validation-docs-rebaseline-integrated-first-release-validation-2026-06-13.md`
- `docs/qa/first-release-validation.md`

## Regras

- Usar `/goal`.
- Modelo requerido: `gpt-5.5`.
- Reasoning requerido: `medium`.
- Nao implementar codigo.
- Nao editar codigo, testes, configs, package/lock, release, updater,
  diagnosticos, telemetria, licenca/account, renderer, IPC, preload, providers
  ou `docs/fiscal-desk/**`.
- Nao executar stage, commit, push, PR, deploy, publish, build de release,
  signing, notarization, updater, telemetria, diagnostico externo ou qualquer
  side effect externo.
- Nao aprovar a propria conclusao. O resultado e candidato e sera julgado pelo
  orquestrador.

## Allowed Write Set

Somente:

- `docs/goals/fiscal-desk-orchestration/results/post-p3-large-file-ratchet-rework-final-readiness-review-2026-06-13.md`

## Checks Esperados

Read-only obrigatorios:

- `git status --short --branch --untracked-files=all`
- `git rev-parse --short HEAD`
- leitura dos receipts obrigatorios acima;
- `rg` proporcional para `blocked`, `needs_rework`, `large-file-ratchet`,
  `coverage`, `test:coverage`, `smoke:electron-ui`, `smoke:visual`,
  `smoke:real-csv`, `release`, `publish`, `update`, `diagnostico`,
  `telemetria`, `licenca`, `templates`, `PDF`, `Word`, `OCR`, `Receita Web`.

Executaveis recomendados se o ambiente permitir sem efeito externo:

- `pnpm test:coverage`
- `QUALITY_GATE_DIFF_MODE=worktree node docs/ai/quality-gate/check-ratchet.mjs`
- `git diff --check`

Smokes Electron/visual/CSV nao sao obrigatorios por padrao neste review porque o
rework aceito foi mecanico. Se o reviewer concluir que a ausencia de smoke
pos-rework e blocker, deve registrar o blocker e a evidencia; nao deve corrigir
ou expandir escopo.

## Formato Do Receipt

O receipt deve conter:

- `Status: approved_candidate` ou `Status: blocked`;
- commit/HEAD observado;
- evidencia lida;
- checks executados e resultado;
- checks nao executados e justificativa;
- decisao sobre suficiencia da evidencia pos-ratchet;
- blockers concretos, se houver;
- riscos residuais;
- recomendacao ao judge: liberar nova selecao material ou manter bloqueio;
- lista explicita do que continua bloqueado.

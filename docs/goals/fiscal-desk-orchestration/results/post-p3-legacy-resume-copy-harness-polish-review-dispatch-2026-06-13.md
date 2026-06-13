# Post P3 Legacy Resume Copy Harness Polish Review Dispatch

Data: 2026-06-13 20:40:14 -03
Status: prepared_for_codex_app_review_thread

## Goal

Executar `/goal` em thread separada do Codex App para review independente do candidato:

`post_p3_legacy_resume_copy_harness_polish`

Modelo exigido: `gpt-5.5`
Reasoning exigido: `medium`

## Context

- Repo canonico: `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv`
- Branch final de integracao: `feat/fiscal-desk-local-base-prep`
- Worker thread: `019ec355-e935-7263-b4b3-2c808b58469d`
- Worker worktree: `/Users/icaroaguiar/.codex/worktrees/08af/consulta-simples-csv`
- Worker receipt: `/Users/icaroaguiar/.codex/worktrees/08af/consulta-simples-csv/docs/goals/fiscal-desk-orchestration/results/post-p3-legacy-resume-copy-harness-polish-2026-06-13.md`
- Worker status: `ready_for_judge_review`
- Worker HEAD observado: `60e4195 docs: dispatch legacy resume polish`
- Source dispatch: `docs/goals/fiscal-desk-orchestration/results/post-p3-legacy-resume-copy-harness-polish-dispatch-2026-06-13.md`
- Source judge decision: `docs/goals/fiscal-desk-orchestration/results/post-p3-operational-panel-next-owner-window-selection-judge-decision-2026-06-13.md`

## Review Mission

Revisar de forma independente se o candidato corrige o copy legado
`1 CNPJs retomados` para `1 CNPJ retomado`, preserva o painel operacional novo,
mantem o diff dentro do allowed write set e nao enfraquece testes/smokes.

O reviewer nao integra nada e nao aprova merge. Ele entrega um candidato para o
judge/orquestrador.

## Allowed Write

O reviewer pode escrever somente:

`docs/goals/fiscal-desk-orchestration/results/post-p3-legacy-resume-copy-harness-polish-review-2026-06-13.md`

## Do Not Touch

Nao editar:

- worker worktree;
- `src/**`;
- `test/**`;
- `scripts/**`;
- `package.json`;
- `pnpm-lock.yaml`;
- `docs/fiscal-desk/**`;
- `docs/qa/**`;
- `docs/adr/**`;
- `.visual-fidelity/**`;
- `docs/goals/fiscal-desk-orchestration/state.yaml`;
- `docs/goals/fiscal-desk-orchestration/integration-plan.md`.

Nao executar stage, commit, push, PR, deploy, publish, dist, signing,
notarization, updater, telemetria ou diagnostico externo.

## Required Review Questions

1. O diff do worker esta estritamente dentro do allowed write set?
2. A mudanca corrige o singular sem quebrar plural, estado sem execucao e retomada nao utilizada?
3. `app-view-lists.ts` agora consome helper canonico sem alterar DOM/layout/classe fora do texto?
4. O harness Electron ficou mais fraco ou continua validando runtime real do slot `execution-resume`?
5. Os testes focados cobrem helper e HTML real do shell?
6. Os smokes `mock` e `base-publica-local` reportados sao qualitativamente suficientes para Electron/UI afetado?
7. A ausencia de `pnpm smoke:visual` e aceitavel por ser copy/harness sem DOM/layout/classe?
8. Ha qualquer mudanca proibida em core/main/IPC/preload/provider/package/lock/docs fiscais/QA/visual artifacts?
9. Algum P0/P1/P2/P3 exige rework antes do judge integrar?

## Expected Read-Only Checks

Executar quando viavel:

- `git status --short --branch --untracked-files=all`
- `git -C /Users/icaroaguiar/.codex/worktrees/08af/consulta-simples-csv status --short --branch --untracked-files=all`
- `git -C /Users/icaroaguiar/.codex/worktrees/08af/consulta-simples-csv diff --name-only`
- `git -C /Users/icaroaguiar/.codex/worktrees/08af/consulta-simples-csv diff --check`
- `git -C /Users/icaroaguiar/.codex/worktrees/08af/consulta-simples-csv diff -- src/renderer/ui/operational-copy.ts src/renderer/ui/app-view-lists.ts test/unit/renderer-operational-copy.test.ts test/unit/app-view.test.ts scripts/smoke-electron-ui.ts`
- ler o worker receipt.

Rerodar pelo menos os testes focados se `node_modules` estiver pronto:

`pnpm exec vitest run test/unit/renderer-operational-copy.test.ts test/unit/app-view.test.ts test/unit/app-sync.test.ts`

Nao precisa rerodar full suite, coverage, build ou smokes Electron se o diff e o
receipt forem consistentes, mas se encontrar contradicao concreta, registre o
problema e rode o minimo necessario para confirmar.

## Receipt Format

Criar o receipt permitido com:

- Status exatamente um de `approved_candidate`, `needs_rework` ou `blocked`;
- evidencia revisada;
- checks executados e resultado;
- checks nao executados e justificativa;
- findings por severidade com arquivo/linha quando houver;
- avaliacao qualitativa dos testes/smokes;
- riscos residuais;
- decisao final e recomendacao ao judge.

Finalizar a thread apenas com status e caminho do receipt.

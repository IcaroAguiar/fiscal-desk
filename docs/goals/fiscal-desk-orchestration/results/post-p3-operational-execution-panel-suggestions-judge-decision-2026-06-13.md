# Post P3 Operational Execution Panel Suggestions Judge Decision

Data: 2026-06-13 20:04:59 -03
Status: needs_rework

## Contexto

O worker `post_p3_operational_execution_panel_suggestions` entregou candidato
`ready_for_judge_review` e o review independente retornou
`approved_candidate`.

Como judge, apliquei o patch material temporariamente na branch final
`feat/fiscal-desk-local-base-prep` para validar a integracao canônica antes de
aceitar. A integracao material nao foi mantida porque o quality gate falhou.
O patch material foi revertido antes desta decisao; a branch canonica permanece
sem o codigo do candidato integrado.

Receipts preservados:

- `results/post-p3-operational-execution-panel-suggestions-2026-06-13.md`
- `results/post-p3-operational-execution-panel-suggestions-review-2026-06-13.md`

## Evidencia Que Passou

- `git diff --check`: pass.
- Testes focados:
  `pnpm exec vitest run test/unit/renderer-operational-copy.test.ts test/unit/app-view.test.ts test/unit/app-helpers.test.ts test/unit/app-sync.test.ts`
  passou com 4 arquivos e 24 testes.
- `pnpm typecheck`: pass.
- `pnpm lint`: pass, 122 arquivos.
- `pnpm test`: pass, 42 arquivos e 268 testes.
- `pnpm build`: pass.
- `pnpm smoke:visual`: pass, sem overflow, botoes cortados ou sobreposicoes.
- `pnpm smoke:electron-ui`: pass com provider `mock` e entrega `xlsx`.
- `FISCAL_DESK_SMOKE_PROVIDER=base-publica-local pnpm smoke:electron-ui`:
  falhou inicialmente no sandbox por `tsx` pipe `EPERM`, depois passou fora do
  sandbox com provider `base-publica-local` e entrega `xlsx`.
- `pnpm test:coverage`: pass, 42 arquivos e 268 testes; cobertura global em
  73.16% linhas/statements, 87.73% funcoes e 75.30% branches.

## Blocker De Aceite

`QUALITY_GATE_DIFF_MODE=worktree node docs/ai/quality-gate/check-ratchet.mjs`
falhou com:

- `coverage.pr-minimum`: changed-line coverage 53.33%, abaixo do minimo 70%.
- `code.large-file-ratchet`: large file count subiu de 2 para 3.
- `file.size`: `src/renderer/ui/app-sync.ts` ficou com 520 linhas, acima do
  limite de 500.
- `file.size`: `src/renderer/ui/app-view.ts` ficou com 515 linhas, acima do
  limite de 500.

Avisos warn-only tambem precisam ficar documentados no closeout final:

- `magic_string_boundary=17`;
- `visual_surface_change=1`;
- `agentic-review.not-enforced`;
- comentarios de contexto baixos em arquivos grandes.

## Decisao

`needs_rework`.

O candidato e funcionalmente promissor e passou review independente, mas nao
pode ser integrado enquanto falhar o gate quantitativo/ratchet canônico. A fase
volta para o worker com rework estrito:

- manter o allowed write set original;
- reduzir `app-sync.ts` e `app-view.ts` para nao aumentarem o numero de large
  files;
- elevar changed-line coverage para pelo menos 70%;
- rerodar quality gate em modo worktree;
- preservar os smokes e testes ja aprovados.

## Riscos Residuais Conhecidos

- O texto legado `uiResumeText: "1 CNPJs retomados"` apareceu nos smokes
  Electron de `mock` e `base-publica-local`. O review considerou aceitavel para
  esta janela porque o novo painel usa singular correto, mas isso deve ser
  mantido como risco residual ou tratado em owner window proprio.
- A mudanca visual e esperada para esta janela, mas deve continuar coberta por
  `pnpm smoke:visual` apos rework.

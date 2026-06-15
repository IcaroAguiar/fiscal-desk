# Post P3 Excel Input Runtime Exposure Review Dispatch

Data: 2026-06-13 21:59:12 -03
Status: dispatch_prepared

## Contexto Canonico

- Repo canonico: `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv`
- Branch final: `feat/fiscal-desk-local-base-prep`
- HEAD canonico observado: `7c128512bc812789e0e174c189c1f23a2450b661`
- Worker thread: `019ec38f-785c-7c43-a14b-61392cd1119e`
- Worker worktree: `/Users/icaroaguiar/.codex/worktrees/16e4/consulta-simples-csv`
- Worker receipt: `/Users/icaroaguiar/.codex/worktrees/16e4/consulta-simples-csv/docs/goals/fiscal-desk-orchestration/results/post-p3-excel-input-runtime-exposure-2026-06-13.md`
- Worker status observado: `ready_for_judge_review`

## Missao Do Reviewer

Revisar independentemente o candidato material `post_p3_excel_input_runtime_exposure`,
sem editar codigo do candidato, sem integrar e sem aprovar como branch final.

O review deve avaliar se o candidato cumpre o dispatch original:

- expor entrada Excel/XLSX no fluxo real do app Electron;
- preservar CSV atual como comportamento default;
- preservar retomada, ledger, fingerprint e auto-save;
- manter `mock` como provider offline default;
- nao alterar Base Publica Local core/provider, Receita Web, export core,
  ingestion core, package/lock, release/update ou docs fiscais/QA/ADR;
- manter diff restrito ao allowed write set do dispatch original.

## Leitura Obrigatoria

- `AGENTS.md`
- `docs/goals/fiscal-desk-orchestration/goal.md`
- `docs/goals/fiscal-desk-orchestration/state.yaml`
- `docs/goals/fiscal-desk-orchestration/integration-plan.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-excel-input-runtime-exposure-dispatch-2026-06-13.md`
- Worker receipt no caminho absoluto acima
- Diff da worker worktree:
  - `git status --short --branch --untracked-files=all`
  - `git diff --name-only`
  - `git diff --stat`
  - `git diff`

## Foco Do Review

Revise com atencao especial:

- se `processCsv` aceita CSV e XLSX sem mover parsing para main/renderer;
- se bytes XLSX trafegam com seguranca pelo IPC/preload;
- se `inputFormat` e conteudo normalizado sao suficientes para impedir
  checkpoint cruzado CSV/XLSX;
- se a versao de parser usada no fingerprint/metadado esta coerente para XLSX
  ou se ha risco de invalidacao futura;
- se resume le o arquivo original conforme o formato salvo no ledger;
- se auto-save XLSX e CSV continuam usando o contrato de delivery correto;
- se os testes realmente cobrem comportamento real e nao apenas formato de
  objeto;
- se o smoke Electron XLSX prova fluxo completo de app, checkpoint, retomada e
  autosave;
- se a remocao de espacamento em `src/main/ipc/process-csv.ipc.ts` para manter
  o arquivo abaixo do limite do ratchet nao ocultou perda de clareza ou risco de
  manutencao.

## Evidencia De Judge Ja Rodada

O judge primario conferiu o candidato antes deste dispatch:

- `git diff --check`: pass;
- Vitest focado do dispatch: 11 arquivos, 98 testes pass;
- `pnpm typecheck`: pass;
- `pnpm lint`: pass;
- `pnpm test`: 43 arquivos, 282 testes pass;
- `pnpm test:coverage`: 43 arquivos, 282 testes pass; coverage global 76.37%;
- `QUALITY_GATE_DIFF_MODE=worktree node docs/ai/quality-gate/check-ratchet.mjs`:
  pass, PR coverage 75.53%, warning apenas `agentic-review.not-enforced`;
- `TMPDIR=/private/tmp FISCAL_DESK_SMOKE_INPUT_FORMAT=xlsx pnpm smoke:electron-ui`:
  pass com provider `mock`, entrada XLSX, autosave XLSX, checkpoint e retomada;
- `TMPDIR=/private/tmp FISCAL_DESK_SMOKE_PROVIDER=base-publica-local FISCAL_DESK_SMOKE_INPUT_FORMAT=xlsx pnpm smoke:electron-ui`:
  pass com Base Publica Local, entrada XLSX, autosave XLSX, checkpoint e
  retomada;
- `TMPDIR=/private/tmp pnpm smoke:visual`: pass sem overflow, botoes cortados ou
  overlaps.

## Allowed Write Set Do Reviewer

O reviewer pode escrever somente:

- `docs/goals/fiscal-desk-orchestration/results/post-p3-excel-input-runtime-exposure-review-2026-06-13.md`

Nao editar codigo, package/lock, scripts, UI, IPC, runtime, docs fiscais/QA/ADR,
`.visual-fidelity`, nem a worktree do worker.

## Status Final Do Review

O receipt final deve ter Status exatamente um de:

- `approved_candidate`
- `needs_rework`
- `blocked_reviewer_environment`

O reviewer nao deve stagear, commitar, pushar, abrir PR, integrar na branch final
ou marcar a fase como entregue ao usuario. O Codex primario continuara sendo
judge/integrador.

# Phase 7A Judge Decision: Receita Web Assisted Contract

Updated: 2026-06-13

## Decision

`approved_by_judge_pending_integration`

F7A is accepted as a Receita Web assisted-mode contract and sanitized diagnostics candidate. It can enter the wave 3 integration queue, but it is not considered integrated until the approved files are copied into the canonical worktree and the integrated gates pass there.

## Evidence Reviewed

- Execution thread: `019ebf51-5055-7ae3-bce4-0062d8bab4dc`
- Execution worktree: `/Users/icaroaguiar/.codex/worktrees/a3a8/consulta-simples-csv`
- Candidate receipt: `docs/goals/fiscal-desk-orchestration/results/phase-7a-receita-web-assisted-contract.md`
- Candidate status: `approved_candidate`
- Independent security review: `019ebf55-9712-7ae3-a7c1-4d77a9b49b81`, no blocking findings, low risk.

## Approved Files

- `src/core/simples/adapters/receita-web/receita-diagnostics.ts`
- `src/core/simples/adapters/receita-web/index.ts`
- `src/core/simples/adapters/receita-web/receita-consulta-optantes.adapter.ts`
- `src/core/simples/adapters/receita-web/receita-result.parser.ts`
- `test/unit/receita-consulta-optantes.adapter.test.ts`
- `test/unit/receita-result.parser.test.ts`
- `docs/goals/fiscal-desk-orchestration/results/phase-7a-receita-web-assisted-contract.md`

## Judge Checks

- `git status --short` and `git diff --name-only` in the F7A worktree: confirmed broader inherited dirty state, with accepted F7A changes limited to the files above.
- Focused sensitive-content scan across the accepted Receita Web files, tests and receipt: no raw HTML fixture, numeric/formatted CNPJ, screenshot, cookie, token, credential or `rawHtml` match in accepted code/tests. The only matches were receipt lines documenting that the scan found no matches.
- `git diff --check`: passed.
- `pnpm exec vitest run test/unit/receita-result.parser.test.ts test/unit/receita-consulta-optantes.adapter.test.ts test/unit/simples-provider.catalog.test.ts test/unit/simples-provider.health.test.ts`: passed with 4 files / 34 tests.
- `pnpm typecheck`: passed.
- `pnpm lint`: passed.

The test/typecheck/lint commands were run with approved escalation because the Codex worktree is outside the main writable sandbox and Vitest/Vite can write temporary cache under `node_modules`.

## Boundaries

- No renderer, IPC/preload, RunLedger, F6 ingestion/export, release/update, backend remote, database, PDF or deterministic smoke surface is accepted as part of F7A.
- `mock` remains the default offline provider.
- `receita-web` remains assisted, experimental, visible-browser-only, not automatic fallback, not batch lookup and not deterministic smoke.
- Real Receita Web validation remains manual/assisted and must stop on CAPTCHA or anti-bot blocking.

## Residual Risk

- Parser classification still depends on public portal text that can change without notice.
- `htmlLength` is accepted as low-sensitivity diagnostic metadata; it must not evolve into content snippets or raw HTML.
- The result is a sanitized adapter contract plus minimal implementation, not approval for robust browser automation or UI promises.
- New Receita Web literals are centralized in `receita-diagnostics.ts`; broader harness warnings from the shared worktree remain integration concerns, not F7A-specific blockers.

## Next Step

Integrate only the approved F7A files into the canonical branch, then run focused Receita Web/provider tests, `pnpm typecheck`, `pnpm lint`, full `pnpm test`, and the integrated smoke/ratchet gates before releasing any F7B implementation thread.

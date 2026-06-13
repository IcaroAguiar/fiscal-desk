# F0 Stage Set Recommendation

Updated: 2026-06-13

This is a staging recommendation for the judge/orchestrator. It is not applied by this F0 thread.

## Recommended Stage Set

Stage the current tracked branch work:

```bash
git add scripts/smoke-electron-ui.ts
git add scripts/smoke-visual-ui.ts
git add src/renderer/styles.css
git add src/renderer/ui/app-sync.ts
git add src/renderer/ui/app-view.ts
git add src/renderer/ui/app.ts
git add src/renderer/ui/app.types.ts
git add src/renderer/ui/operational-copy.ts
git add test/unit/app-view.test.ts
git add test/unit/renderer-operational-copy.test.ts
```

Stage the F0 ratchet refactor modules:

```bash
git add scripts/visual-smoke-checks.ts
git add scripts/visual-smoke-fixture.ts
git add src/renderer/ui/app-history-view.ts
git add src/renderer/ui/app-local-public-base-copy.ts
git add src/renderer/ui/app-refs.ts
git add src/renderer/ui/app-sync-reference.ts
git add src/renderer/ui/app-view-lists.ts
git add src/renderer/vite-env.d.ts
```

Stage the orchestration package and durable receipts:

```bash
git add docs/goals/fiscal-desk-orchestration
git add docs/goals/fiscal-desk-v5-fidelity
```

## Optional Force-Add Evidence

`.visual-fidelity/` is ignored by `.gitignore`. Keep it ignored by default.

If the judge requires PR-visible machine evidence instead of doc-only hashes, force-add only:

```bash
git add -f .visual-fidelity/runs/reference-v5-a/fraud-proof-closeout.json
git add -f .visual-fidelity/runs/reference-v5-a/visual-smoke-report.json
```

Do not force-add screenshots by default; they are large local evidence artifacts.

## Do Not Stage In F0

Do not stage local skill-generation artifacts:

```bash
git restore --staged skills/csv-throughput-smoke/.inputs.json 2>/dev/null || true
git restore --staged skills/electron-ui-evidence-capture/.inputs.json 2>/dev/null || true
```

Do not stage any `skills/**` file in the F0 PR unless the judge explicitly decides to promote project-local skills in the same PR. Preferred decision: exclude all `skills/**` from F0 and handle them in a separate skills PR.

Do not stage ignored local status docs unless the judge decides to remove the local exclude:

```bash
git check-ignore -v docs/fiscal-desk/status.md
```

Current evidence shows it is ignored by `.git/info/exclude`.

## Verification Before PR

After staging the chosen set:

```bash
git diff --cached --check
node docs/ai/quality-gate/check-ratchet.mjs
pnpm lint
pnpm typecheck
pnpm test
pnpm smoke:real-csv
pnpm smoke:electron-ui
gitleaks detect --source . --redact --no-banner
```

Run `VISUAL_SMOKE_OUTPUT_DIR=.visual-fidelity/runs/reference-v5-a pnpm smoke:visual` if the staged set includes smoke visual changes or selected `.visual-fidelity` evidence.

## PR Strategy

Open a single F0 closeout PR from `feat/fiscal-desk-local-base-prep` after the judge accepts the candidate receipt.

PR body should include:

- F0 result receipt path: `docs/goals/fiscal-desk-orchestration/results/phase-0-current-branch-closeout.md`
- Stage set path: `docs/goals/fiscal-desk-orchestration/results/phase-0-stage-set.md`
- V5 closeout path: `.visual-fidelity/runs/reference-v5-a/fraud-proof-closeout.json`
- Note whether V5 closeout artifacts are local-only or force-added.
- Ratchet status: pass, large files `2 -> 2`.
- Independent reviewer verdict: `approve_candidate`.

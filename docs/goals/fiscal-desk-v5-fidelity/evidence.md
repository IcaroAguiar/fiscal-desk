# Evidence: Fiscal Desk V5-A Visual Fidelity

Updated: 2026-05-22

## Current Execution State

- Visual contract compiled under `.visual-fidelity/` (local ignored harness artifacts).
- Closed Spark packet `executor-task-001-harness` was executed by a Codex Spark executor.
- Product implementation pass completed locally for the V5-A reference scenario and mobile structural corrections.
- First independent 5.5 reviewer found a blocker: the V5-A fixture was activatable by query string in the packaged renderer path.
- Blocker fix applied: no query activation remains; V5-A fake data lives in `scripts/smoke-visual-ui.ts` and is injected only in the Vite dev visual smoke through `window.__FISCAL_DESK_VISUAL_FIXTURE__`.
- Production build evidence: `rg 'clientes-maio|base local carregada|reference-v5-a-run|__FISCAL_DESK_VISUAL_FIXTURE__' dist dist-electron` returned no matches.
- Re-review passed: no blocker remained after the fixture isolation fix.

## Golden References

- Desktop: `docs/ai/reports/fiscal-desk-ui-references/operations-v5/v5-a.png`.
- Mobile: `docs/ai/reports/fiscal-desk-ui-references/operations-v5/v5-a-mobile.png`.

## Latest Visual Smoke Artifacts

- Desktop reference screenshot: `/var/folders/xg/w4k6x0l97bsdxm9rb2j66l9h0000gn/T/fiscal-desk-visual-smoke/desktop-wide-reference-v5-a.png`.
- Mobile reference screenshot: `/var/folders/xg/w4k6x0l97bsdxm9rb2j66l9h0000gn/T/fiscal-desk-visual-smoke/mobile-reference-reference-v5-a.png`.
- Visual report: `/var/folders/xg/w4k6x0l97bsdxm9rb2j66l9h0000gn/T/fiscal-desk-visual-smoke/visual-smoke-report.json`.
- Copied local run artifacts: `.visual-fidelity/runs/reference-v5-a/`.

## Gates Run

- `pnpm lint`: pass.
- `pnpm typecheck`: pass.
- `pnpm test`: pass, 29 files and 186 tests.
- `pnpm smoke:visual`: pass, including reference desktop/mobile screenshots, DOM landmarks, ARIA snapshots, overflow, clipped buttons, and sibling overlap checks.
- `pnpm build`: pass after blocker fix.
- `pnpm smoke:electron-ui`: pass after blocker fix, real Electron script interaction with mock provider and XLSX output.
- Independent 5.5 review: first pass found blocker, re-review passed after fix.
- F0 closeout candidate added `.visual-fidelity/runs/reference-v5-a/fraud-proof-closeout.json` with `canSayDone=true` after rerunning `VISUAL_SMOKE_OUTPUT_DIR=.visual-fidelity/runs/reference-v5-a pnpm smoke:visual`.

## F0 Closeout Artifact

- Closeout: `.visual-fidelity/runs/reference-v5-a/fraud-proof-closeout.json`.
- Status: `canSayDone=true`.
- Visual smoke report hash: `87abda111afc9dc07ec7131d155327be5ccfab24f55b4dbc414d71a2fe15286f`.
- Desktop painel screenshot hash: `2a1339fade42fb1a21e25c61556abf7790cf0f3a61610b37cc159dbd2beffcab`.
- Mobile painel screenshot hash: `cbba7146aa1410bb5579bd4b3d9b938258ba71cb479673cd7b6a1541e80442ba`.
- Reviewer caveat: `.visual-fidelity/` remains ignored by git; the PR-visible durable evidence is this document and the F0 result receipt unless the judge chooses to force-add selected closeout artifacts.

## Visual Judgment

The current V5-A reference screenshots are substantially closer to the approved direction than the previous attempt:

- Mobile no longer renders the desktop sidebar before the cockpit.
- Mobile uses the 390px reference viewport.
- Mobile header keeps statuses above the CTA.
- Mobile KPI section is 2x2.
- Configuration rows are open key/value lines instead of stacked fields.
- Queue, history, log, and output use the deterministic V5-A data.

Residual visual differences remain for final polish:

- Desktop sidebar width is about 232px, while the reference reads closer to 223px.
- Desktop middle and bottom bands sit slightly lower than the golden reference.
- Some app-native select chevrons remain visible in configuration rows.
- History mobile status appears mostly as colored text; the reference status dot rhythm can still be refined.

## Residual Risk

- The V5-A fixture strings are intentionally centralized as visual smoke data in `scripts/smoke-visual-ui.ts`. They are not product data and are no longer activated through query string.
- The production bundle still contains a generic `visualFixture` shape, but `getDevVisualFixture()` is rewritten by Vite production build to return `null`; no V5-A fake records or fixture global are present in `dist`/`dist-electron`.
- The generic fallback strings `Arquivo de CNPJs`, `aguardando arquivo`, `csv`, and `Arquivo processado disponível após a execução.` remain in the renderer because they are normal empty/reference-shell copy, not fake records or fixture data.
- `.visual-fidelity/` is ignored by repo policy, so durable committed evidence lives in this goal document and the report paths above.
- Visual fidelity is substantially improved but not pixel-perfect; remaining polish is mostly geometry/tuning, not a functional blocker.

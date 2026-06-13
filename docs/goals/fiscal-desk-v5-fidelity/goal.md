# Goal: Fiscal Desk V5-A Visual Fidelity

## Objective

Deliver the Fiscal Desk V5-A cockpit with close fidelity to the approved desktop and mobile references, using the `visual-fidelity` harness before implementation and bounded Spark executors only after the visual contract is compiled.

## Current Branch

`feat/fiscal-desk-local-base-prep`

## Lane

Product UI fidelity, Electron renderer, low backend risk, high subjective visual risk.

## Non-Negotiables

- Do not use Computer Use for QA.
- Do not let Spark interpret images or create specs.
- Do not replace golden references with runtime screenshots.
- Do not add card-heavy UI, filled badges, extra copy, decorative wrappers, or website/landing-page structure.
- Preserve Electron app behavior and provider boundaries.

## Phases

1. Compile `.visual-fidelity` contract from approved V5-A references.
2. Generate closed Spark packets from the compiled contract.
3. Implement deterministic visual fixture.
4. Implement borderless shell.
5. Implement runtime state mapping.
6. Capture screenshots, DOM landmarks, ARIA, rubric, and closeout gate.
7. Run local gates and real Electron smoke.

## Verification

- `pnpm smoke:visual`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`
- `pnpm smoke:electron-ui`

## Closeout

Close only when `.visual-fidelity/runs/<run-id>/fraud-proof-closeout.json` exists and `canSayDone=true`, or report the exact blockers and residual risk.

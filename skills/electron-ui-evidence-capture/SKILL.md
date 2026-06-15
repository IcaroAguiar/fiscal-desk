---
name: electron-ui-evidence-capture
description: Capture screenshots, appshots, DOM landmarks, and ARIA snapshots from the running Electron app for review evidence.
when_to_use:
  - The user asks to prove a UI state with visible evidence from the desktop app.
  - The user wants screenshots, appshots, DOM landmarks, or ARIA snapshots attached to a review.
  - The user needs to validate a change against the running Electron app rather than a static mock.
  - The user asks to confirm that the app rendered correctly in Electron or that a UI interaction completed.
when_not_to_use:
  - The user only wants a code-level smoke test, benchmark, or data-processing check with no UI proof.
  - The user wants visual polish work or layout redesign without evidence capture as the main task.
  - The user wants generic Playwright web testing against a browser app, not the Electron shell itself.
  - The user wants logs, CLI output, or backend state only; no visible desktop evidence is needed.
---

## Procedure
1. Use the repo's Electron smoke flow to open the app against a local dev server.
2. Drive the UI into the requested visible state using the app bridge and DOM actions.
3. Capture proof artifacts from the live UI:
   - screenshots for the main state and any important transitions
   - DOM landmark JSON for core regions
   - ARIA snapshot YAML for the accessible tree
4. If the task mentions a specific execution/provider state, steer the smoke via the supported env vars before launching.
5. Verify the output and/or execution history when the evidence request involves a completed run.
6. Return the generated file paths and the visible state that each artifact proves.

## When NOT to use
- "Can you speed up the CSV processing?" — this is a performance/core-logic task, not a UI proof task. See session `019e344e-28e5-7300-8efc-56ac9e601d37`.
- "Fix this failing unit test" — test debugging should use a test-focused workflow instead of evidence capture.
- "Refactor the renderer layout" with no request for proof — implementation work only; the evidence capture skill would be overkill.
- "Add a screenshot to the release notes" for a static design image — use docs/design tooling, not a live Electron capture.
- "Does the app support xlsx export?" — if no visible proof is requested, a normal smoke or unit check is the better fit.

## Inputs
- `OUTPUT_DIR` for screenshots and snapshot files.
- `SMOKE_PROVIDER` to steer the repo's Electron smoke path when a provider choice matters.
- The repo root, because the runner delegates to `scripts/smoke-electron-ui.ts`.
- Optional repo runtime env vars used by the app under test.

## Outputs
- PNG screenshots under the chosen output directory.
- `*-dom-landmarks.json` files for structural inspection.
- `*-aria-snapshot.yml` files for accessible-tree inspection.
- Console JSON from the smoke script with saved paths and execution metadata.

## Examples
- Session `019e5344-8f99-7243-805f-7a07ecba594c`: the workflow emphasized showing images directly in chat as proof, matching this skill's purpose.
- Session `019e5343-307b-79d2-964f-6e83eabbc494`: the work was routed through review/evidence-first iteration, which is the same validation shape this skill supports.

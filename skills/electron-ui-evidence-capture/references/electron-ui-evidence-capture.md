# Electron UI evidence capture notes

## Evidence targets
- Screenshot PNGs for the visible app state.
- DOM landmark JSON for key containers.
- ARIA snapshot YAML for accessibility-tree inspection.

## Practical quirks from repo smoke scripts
- The Electron smoke uses `playwright._electron.launch({ args: ['.'], env: ... })` and a temporary Vite dev server.
- The app waits for visible text like `Fiscal Desk` before interacting.
- Output/history assertions are made via `window.appBridge.listExecutions()` and file-path checks.
- For local-public-base mode, the smoke prepares the base through `window.appBridge.prepareLocalPublicBase(...)` before resuming execution.
- The visual smoke script already writes per-scenario PNGs, plus `*-dom-landmarks.json` and `*-aria-snapshot.yml` artifacts.

## Suggested use
- Prefer the Electron smoke script when the user wants proof from the actual desktop shell.
- Use the visual smoke script when you need multi-viewport layout evidence or responsive checks.

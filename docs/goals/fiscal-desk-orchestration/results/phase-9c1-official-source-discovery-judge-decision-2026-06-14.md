# F9C1 Judge Decision - Official Source Discovery - 2026-06-14

Decision: `approved_for_f9c1_only`

## Scope Approved

F9C1 is approved as an official-source discovery/preflight slice only:

- discover the Receita Federal public CNPJ open-data index;
- select the latest monthly `Simples.zip` archive;
- expose archive metadata through main/preload/renderer;
- keep manual CSV preparation as the only actual Base Publica Local
  preparation path.

This decision does not approve download, ZIP extraction, streaming index
creation, background update, remote backend, or Receita Web parallelism.

## Evidence

- focused F9C1 tests: pass, 32 tests;
- `pnpm typecheck`: pass;
- `pnpm lint`: pass;
- `pnpm test`: pass, 43 files and 295 tests;
- `pnpm smoke:visual`: pass across desktop/tablet/mobile;
- `pnpm smoke:electron-ui`: pass with provider `mock`, CSV input and XLSX
  delivery;
- `git diff --check`: pass;
- independent review initially found one P2 timeout/loading finding;
- timeout/abort rework added explicit `AbortController`, `Promise.race` and a
  never-settling `fetchText` regression test;
- independent re-review found no remaining P0-P3 finding for the P2.

## Residual Risk

- Direct local fetch/curl to the Receita endpoint returned HTTP 404 from this
  environment during validation, while web research could browse the index.
  The app treats that as a recoverable user-visible error.
- The Receita index is HTML, not a typed API. Parser coverage exists for common
  index variants, but F9C2 must keep parser regressions covered.
- `Simples.zip` is still hundreds of MB, so F9C2 needs explicit consent,
  disk-space checks, resumability and streaming extraction before any automatic
  preparation claim.

## Next Release

F9 remains active. The next material slices are:

- F9C2: assisted/resumable download and streaming index for `Simples.zip`;
- F9D: pause/resume fine control and stronger partial/export workflows;
- F9E: Receita Web parallel experimental mode, only after a fresh explicit
  judge decision.

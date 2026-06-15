# F9C1 Official Source Discovery Receipt - 2026-06-14

Status: `validated_reworked_review_approved_for_f9c1`

## Scope

F9C1 implements the first Base Publica assisted acquisition slice:

- discover the Receita Federal public CNPJ open-data monthly index;
- select the latest monthly `Simples.zip` archive instead of the 60GB full
  `cnpj.tar.gz` bundle;
- expose file name, size, competence and publication date through IPC/preload;
- show an explicit "Buscar fonte oficial" control in the Base Publica Local
  panel;
- keep manual CSV upload/preparation as the only actual preparation path.

This slice does not download, extract or index the official ZIP. Those actions
remain F9C2.

## Files Changed

- `src/core/public-base/local-public-base.official-source.ts`
- `src/core/public-base/local-public-base.types.ts`
- `src/main/ipc/local-public-base.ipc.ts`
- `src/main/preload.ts`
- `src/main/types.ts`
- `src/renderer/ui/app-local-public-base.ts`
- `src/renderer/ui/app-local-public-base-copy.ts`
- `src/renderer/ui/app-refs.ts`
- `src/renderer/ui/app-sync-rules.ts`
- `src/renderer/ui/app-sync.ts`
- `src/renderer/ui/app-view.ts`
- `src/renderer/ui/app.ts`
- `src/renderer/ui/app.types.ts`
- `test/unit/local-public-base.test.ts`
- `test/unit/preload.test.ts`
- `test/unit/app-view.test.ts`
- `test/unit/app-sync.test.ts`
- `README.md`
- `docs/goals/fiscal-desk-orchestration/**`

## Evidence

Official source audit:

- root index:
  `https://arquivos.receitafederal.gov.br/dados/cnpj/dados_abertos_cnpj/`;
- root index exposed `cnpj.tar.gz` with size `60G`;
- latest monthly directory observed: `2026-01/`;
- monthly directory:
  `https://arquivos.receitafederal.gov.br/dados/cnpj/dados_abertos_cnpj/2026-01/`;
- monthly directory exposed `Simples.zip` with size `268M`, last modified
  `2026-01-11 14:58`;
- monthly directory also exposes larger non-F9C1 datasets such as
  `Estabelecimentos*.zip` and `Empresas*.zip`, which remain out of this slice.

Local validation already run:

- `pnpm exec vitest run test/unit/local-public-base.test.ts test/unit/preload.test.ts test/unit/app-view.test.ts test/unit/app-sync.test.ts`: pass, 32 tests after timeout rework;
- `pnpm typecheck`: pass;
- `pnpm lint`: pass;
- `pnpm smoke:visual`: pass across desktop, tablet and mobile;
- `pnpm smoke:electron-ui`: pass, including build renderer/main and Electron UI smoke with provider `mock`, CSV input and XLSX delivery;
- `pnpm test`: pass, 43 files and 295 tests;
- `git diff --check`: pass.

Local live endpoint validation:

- direct local fetch/curl from this environment returned HTTP 404 for the
  official HTTPS endpoint even though the web index was browsable from the
  research tool;
- the app handles this as a user-visible discovery failure and keeps the manual
  CSV path available;
- no code claims download/preparation succeeded from the official source.

## Boundaries

Still pending:

- F9C2: download consent, resumable download, checksum/size preflight, streaming
  ZIP extraction and local index preparation for `Simples.zip`;
- F9D: pause/resume/fine cancellation controls for executions and preparation;
- F9E: Receita Web parallel experimental mode, only after explicit fresh judge
  decision.

## Risks

- The Receita Federal directory is an HTML index, not a stable typed API. The
  parser accepts common Apache index variations but should remain covered by
  tests before F9C2 expands it.
- The current source discovery uses network access from Electron main. Offline,
  blocked or changed endpoint responses must remain a recoverable UI state.
- `Simples.zip` is much smaller than the full tarball but is still hundreds of
  megabytes; F9C2 must implement consent, disk-space awareness and resumability.

## Review

Independent review initially returned one P2 finding:

- official source discovery had no timeout/abort and could leave the UI in
  `loading` indefinitely if a network request never settled.

Rework:

- added per-request timeout with `AbortController`;
- passed the abort signal to the real `fetch`;
- wrapped injected `fetchText` with `Promise.race`, so test doubles or custom
  fetchers that never settle still time out;
- added a unit regression where `fetchText` returns
  `new Promise<string>(() => {})`.

Independent re-review result: `approved_no_remaining_p0_p3_for_p2`.

# Phase 9F Documented Pending Audit

Status: documented_intent_audited_after_comparison_core
Date: 2026-06-14

## Scope

Auditar a documentacao existente contra o codigo atual depois da entrega do
comparativo core. O objetivo foi identificar qualquer item documentado que ainda
nao esteja implementado, incluindo nice-to-have.

## Evidence Read

- `README.md`
- `docs/fiscal-desk/roadmap.md`
- `docs/fiscal-desk/first-release.md`
- `docs/fiscal-desk/product-spec.md`
- `docs/fiscal-desk/implementation-plan.md`
- `docs/fiscal-desk/spec-audit.md`
- `docs/plans/2026-03-26-v2-receita-web-adapter-design.md`
- `docs/plans/2026-03-26-v2-receita-web-backlog.md`
- `docs/adr/0013-divergencias-sem-vencedor-automatico-oculto.md`
- `src/core/comparison/provider-comparison.ts`
- `scripts/compare-providers.ts`
- `src/core/export/xlsx-writer.ts`
- targeted `rg` scans for `nice`, `comparativo`, `diverg`, `planejad`,
  `pendente`, `bloquead`, `PDF`, `Word`, `OCR`, `telemetria`, `diagnostico`,
  `licen`, `template`, `modelo`, `multicomputador`, `BYOK`, `auto-update`.

## Implemented In This Pass

- Core comparison engine in `src/core/comparison/provider-comparison.ts`.
- Assisted Receita Web comparison CLI in `scripts/compare-providers.ts`.
- `package.json` script `compare:receita-web`.
- README documentation for assisted comparison, limits, modes and no hidden
  winner policy.

The implemented mode reads a processed CSV, deduplicates valid CNPJs, rechecks
selected rows through an injected provider, and writes a side-by-side CSV with
`concordante`, `divergente` or `inconclusivo`.

## Documented Items Still Not Implemented Or Only Partial

These are not silently closed:

1. Electron UI for comparative audit.
   - Docs mention Receita Web as assisted confirmation by sample/divergence.
   - Current implementation is CLI/core only, not a visible Electron workflow.

2. XLSX `Divergencias` as real calculated output.
   - ADR 0013 says reports should highlight divergences.
   - Current `src/core/export/xlsx-writer.ts` still writes a placeholder row:
     "Sem divergencias calculadas neste corte."
   - The new comparison CSV respects the policy, but the main XLSX export does
     not consume those rows yet.

3. Original old backlog version of dual-provider comparison.
   - `docs/plans/2026-03-26-v2-receita-web-backlog.md` described comparing
     `cnpja-open` and `receita-web` from the same input.
   - Current implementation compares an already processed CSV against Receita
     Web. It is the useful core path for audit, but not the exact old dual-run
     script.

4. Persisted comparison history/checkpoint/resume.
   - Runtime execution already has ledger/checkpoint for normal processing.
   - The comparison CLI is not integrated into RunLedger/history and does not
     resume its own comparison session.

5. PDF, Word and OCR.
   - Repeatedly documented as planned/future/outside first release.
   - No runtime implementation should be claimed.

6. Excel formatted/modelable output, guided output customization and reusable
   templates/models.
   - Contracts expose some planned/not implemented states.
   - Reusable models/templates are still blocked until their own owner window.

7. Paid/BYOK providers.
   - Product spec and ADRs mention future paid providers.
   - No credentialed/BYOK provider implementation exists in this pass.

8. Multi-computer/cloud sync.
   - ADR 0006 keeps local workers first and multicomputer later.
   - No distributed worker/sync implementation exists.

9. Auto-update real, telemetry real, diagnostic package send/generation,
   license/account/commercial gating and release signing/notarization.
   - First release docs keep these blocked/future.
   - Current build workflow may create unsigned artifacts, but does not make
     these real product capabilities available.

10. Raw HTML diagnostic contract from old Receita Web backlog.
    - The old backlog mentioned `{ raw: html }` for `UNPARSABLE_RESULT`.
    - Current security/spec audit says that conflicts with not leaking HTML
      outside the adapter. The implemented direction should remain sanitized
      diagnostics, not raw HTML propagation.

11. Spike evidence under `.ai/spike-evidence`.
    - Old backlog asked for local `.ai` evidence files.
    - Repo policy says `.ai/` is local operational context and must not be
      versioned. Current durable evidence lives in sanitized receipts instead.

## Current Audit Judgment

This audit read code and receipts for core processing, speed/control, official
Base Publica Local download/prep, Receita Web assisted flow, human CAPTCHA
unlock and the new comparison core. Those areas have implementation evidence in
the repo/receipts, but this audit did not re-run every runtime path.

The core is not "all documented ambitions implemented". The remaining items
above are either intentionally future/blocked or partial surfaces requiring new
owner windows, especially Electron UI for comparison and calculated XLSX
divergences.

## Required Next Owner Window If We Want To Close More

Recommended next material window:

- `phase-10-comparison-ui-xlsx-divergences`
- Allowed writes:
  - `src/core/comparison/**`
  - `src/core/export/**`
  - `src/main/**` only if IPC is needed
  - `src/renderer/ui/**`
  - `test/**`
  - `README.md`
  - `docs/goals/fiscal-desk-orchestration/**`
- Goal:
  - expose comparative audit inside Electron,
  - persist or at least surface comparison results,
  - feed calculated divergences into XLSX export,
  - preserve no-hidden-winner policy.

## Verification Run

- `pnpm exec vitest run test/unit/provider-comparison.test.ts test/unit/receita-consulta-optantes.adapter.test.ts test/unit/receita-browser.client-result-detection.test.ts test/unit/renderer-operational-copy.test.ts test/unit/app-view.test.ts`
- `pnpm typecheck`
- `pnpm lint`
- `git diff --check`
- `pnpm exec tsx scripts/compare-providers.ts` failed inside sandbox with
  `listen EPERM` on the `tsx` pipe, then passed outside the sandbox by printing
  usage and exiting with status 1 when no input path was provided.

## Independent Review Follow-up

Reviewer `019ec8c5-2f48-7fd3-8003-0c440f41aa5b` found no blocking/high issues.
Two medium findings were addressed:

- `--errors` no longer truncates to 10 rows unless `--limit` is explicit.
- This audit judgment was narrowed to avoid claiming fresh runtime validation
  for surfaces not re-executed in this pass.

# Phase 6E: Output Templates Scope Review

Updated: 2026-06-13

## Status

`approved_candidate`

F6 templates/output customization pode virar uma proxima implementacao segura
somente se o recorte for reduzido para contrato core de export/entrega. Nao ha
liberacao para uma feature completa de templates, UI guiada, IPC/preload,
runtime delivery selection, modelos salvos, monetizacao, PDF/OCR ou release.

Esta revisao e docs-only, nao implementa produto e nao declara F6 pronta.

## Source Thread

- Delegated source thread: `019ebe5c-3853-79c2-87ad-8ddace386c93`
- Review worktree:
  `/Users/icaroaguiar/.codex/worktrees/c18b/consulta-simples-csv`
- Scope: scope review docs-only para F6E/F6 templates-output customization.

## Files Read

- `AGENTS.md`
- `docs/goals/fiscal-desk-orchestration/goal.md`
- `docs/goals/fiscal-desk-orchestration/state.yaml`
- `docs/goals/fiscal-desk-orchestration/subagent-registry.md`
- `docs/goals/fiscal-desk-orchestration/integration-plan.md`
- `docs/goals/fiscal-desk-orchestration/phases/phase-6-ingestao-entrega.md`
- `docs/fiscal-desk/executor-packets/012-output-customization-templates.md`
- `docs/fiscal-desk/phase-orchestration.md`
- `docs/fiscal-desk/product-spec.md`
- `docs/adr/0018-formato-de-entrega-escolhido-pelo-usuario.md`
- `docs/adr/0019-saida-personalizada-guiada.md`
- `docs/adr/0020-modelos-reutilizaveis-de-entrega.md`
- `docs/adr/0021-modelos-de-execucao-separados-de-modelos-de-entrega.md`
- `docs/goals/fiscal-desk-orchestration/results/phase-6a-ingestao-entrega-contract.md`
- `docs/goals/fiscal-desk-orchestration/results/phase-6b-ingestion-implementation.md`
- `docs/goals/fiscal-desk-orchestration/results/phase-6c-export-delivery-implementation.md`
- `docs/goals/fiscal-desk-orchestration/results/phase-6d-runtime-wiring.md`
- `docs/goals/fiscal-desk-orchestration/results/phase-6d-runtime-owner-scope-review.md`
- `docs/goals/fiscal-desk-orchestration/results/phase-6d-scope-review-judge-decision.md`
- `docs/goals/fiscal-desk-orchestration/results/phase-6d-runtime-wiring-judge-decision.md`
- `docs/goals/fiscal-desk-orchestration/results/integration-wave-6-f6d-runtime-wiring.md`
- `src/core/export/csv-writer.ts`
- `src/core/app/process-csv.types.ts`

Attempted but absent:

- `CONTEXT.md`

`CONTEXT.md` is listed by packet 012 but is absent in this worktree. This is a
minor documentation gap, not a blocker for the narrow contract-only candidate,
because the packet, product spec, phase orchestration and ADRs define the
operative F6E boundaries.

## Files Changed

- `docs/goals/fiscal-desk-orchestration/results/phase-6e-output-templates-scope-review.md`

No changes were made to `src/**`, `test/**`, `scripts/**`,
`docs/fiscal-desk/**`, `docs/adr/**`,
`docs/goals/fiscal-desk-orchestration/state.yaml`, provider adapters, Receita
Web, release/update, backend remote, database, PDF/OCR, staging, commits,
pushes or PRs.

## Decision

Approve a next implementation candidate only for:

`F6E1 output customization export contract`

This first slice should define executable core/export metadata for delivery
options and template availability without making user-visible customization
ready. It may establish a typed option matrix for current and planned delivery
shapes, but it must keep unsupported options disabled/planned and must preserve
plain CSV.

Do not release a broad `F6 templates/output customization` implementation. The
packet allows core/export, process-csv types, IPC/preload and renderer, but the
orchestration rules require shared-boundary ownership. Combining all those
surfaces in one first worker would be too broad and would collide with the
current separation between export contract, runtime delivery, IPC/preload and
renderer.

## Rationale

The restored docs change the earlier absence-based blocker:

- Packet 012 explicitly defines the output customization packet and acceptance
  criteria.
- Product spec states that CSV is current, formatted Excel/PDF/JSON/custom
  output are evolutions, and monetization must not block existing
  data/history/exports.
- ADR 0018 defines user-selected delivery organization, with preserving
  original columns as the recommended default.
- ADR 0019 defines guided custom output with presets before granular choices
  and reproducibility for future runs.
- ADR 0020 allows reusable delivery models later, local-first, versionable or
  migratable, but says they are not required in the first cut.
- ADR 0021 separates execution models from delivery models and keeps provider,
  speed, confirmation and failure behavior out of delivery templates.

The accepted F6A/F6B/F6C/F6D trail still narrows implementation:

- F6A reserved export/template concepts but marked XLSX template availability
  as `not_implemented`.
- F6B implemented provider-free CSV ingestion only.
- F6C implemented export artifact metadata/descriptors only, keeping templates
  `not_implemented` and `templateId: null`.
- F6D wired only core `processCsv` ingestion/export metadata and explicitly did
  not add template customization, IPC/preload, renderer, provider or Receita
  Web changes.
- Wave 6 integration validated runtime-core wiring and restated that template
  customization must not be dispatched without a non-colliding scope decision.

Together, these docs support a contract-first export slice, not full product
customization.

## Boundary Separation

### Export Contract

Recommended next owner can define canonical delivery option metadata in
`src/core/export/**`, such as current CSV, current XLSX, planned formatted
workbook, planned detailed/audit/summary shapes and disabled future PDF/JSON
slots. It must not claim template implementation unless tests prove a real
template exists.

The default should remain preserve original columns and append app fields, as
ADR 0018 states.

### Runtime Delivery

Runtime delivery remains outside F6E1. Do not change how `processCsv` selects or
generates output in the first F6E worker unless the judge grants a later
runtime owner window.

If a later window touches runtime delivery, it must own `src/core/app/**` and
prove CSV/XLSX regression, progress, cancel and resume behavior remain stable.

### IPC / Preload

IPC/preload remains out of the next candidate. No bridge API should expose
template selection, template preview, saved templates or validation errors
until the export contract is accepted.

### Renderer UI

Renderer UI remains out of the next candidate. Packet 012 expects guided output
instead of a raw technical screen, but the first safe step is a core contract.
Any later renderer worker must own `src/renderer/ui/**` and, if needed,
`styles.css` under a separate visual owner window with screenshot/smoke
evidence.

### Reusable Models

Reusable delivery models are deferred. ADR 0020 says they come after delivery
formats stabilize. F6E1 may reserve fields such as local/model availability,
versioning or migration state in metadata, but must not implement persistence,
edit/delete, import/export, sharing or cloud/account behavior.

### Future Monetization

Monetization remains future-only. F6E1 must not add paywall, entitlement,
license checks, remote backend or commercial gating. Exportações existentes
cannot become dependent on a future license.

## Contract Gaps

Remaining gaps that F6E1 should close or explicitly defer:

- exact delivery option IDs and labels;
- current versus planned versus disabled availability model;
- supported output format for each option;
- default preset semantics for "preservar colunas originais + campos do app";
- whether audit, summary and detailed outputs are separate options, tabs or
  field groups;
- template availability terminology that does not imply ready state;
- validation rules for unknown option IDs and unavailable options;
- compatibility rule with existing `ProcessCsvDeliveryFormat` values;
- migration/versioning placeholders for future reusable delivery models.

Gaps to defer after F6E1:

- runtime selection through `processCsv`;
- IPC/preload payloads;
- guided renderer workflow;
- saved local delivery templates;
- import/export of models;
- monetization/entitlement;
- PDF/OCR/Word input or executive PDF generation.

## Recommended Owner Window

Release one owner window:

- owner: `F6E1 output-customization-export-contract-owner`
- role: backend-builder/API designer with focused test coverage
- risk class: structural but narrow, because it extends export contracts while
  avoiding runtime/UI shared surfaces

Owned boundaries:

- `export_types`
- `src/core/export/**`
- focused export contract tests

Optional shared boundary only if strictly required:

- `src/core/app/process-csv.types.ts`, to keep delivery format compatibility
  explicit. Avoid this file if the export contract can remain independent.

## Allowed Writes For Next Thread

- `src/core/export/export-contract.ts`
- `src/core/export/export-artifacts.ts`
- new or existing focused tests under `test/unit/**` for export delivery
  options and template availability
- `test/unit/fiscal-export-artifacts.test.ts`
- `test/unit/fiscal-desk-phase-6-contracts.test.ts`
- `src/core/app/process-csv.types.ts`, only for a narrow proven compatibility
  type gap and with explicit single-owner justification
- `docs/goals/fiscal-desk-orchestration/results/phase-6e-output-templates-implementation.md`

## Do Not Touch

- `docs/fiscal-desk/**`
- `docs/adr/**`
- `docs/goals/fiscal-desk-orchestration/state.yaml`
- `src/core/ingestion/**`
- `src/core/app/process-csv.use-case.ts`
- `src/core/app/process-csv-delivery.ts`
- `src/main/**`
- `src/renderer/**`
- `src/core/simples/**`
- provider adapters
- Receita Web
- `scripts/**`
- release/update
- backend remoto
- banco
- PDF/OCR
- raw template files or template persistence
- package manager files
- stage, commit, push or PR

## Stop Conditions

Return `needs_rework` or `blocked` immediately if:

- implementation requires IPC/preload, renderer or runtime delivery changes to
  be useful;
- implementation requires changing provider adapters, Receita Web, ingestion,
  fallback, deterministic Receita Web smoke or provider selection;
- implementation requires PDF/OCR, Word input, Excel input readiness beyond
  current delivery metadata, license enforcement, paywall, remote backend,
  database, release or auto-update;
- the worker cannot preserve current CSV and XLSX availability semantics;
- copy, labels or metadata imply formatted Excel, PDF, JSON or reusable
  templates are ready before implementation and checks exist;
- delivery models become coupled to execution models, providers, speed,
  confirmation or failure policy;
- `process-csv.types.ts` changes broaden into IPC/preload or renderer payloads.

## Verification Commands

Commands run for this docs-only review:

- `git status --short`
- `rg --files -g 'AGENTS.md' -g 'docs/goals/fiscal-desk-orchestration/**' -g 'docs/fiscal-desk/**' -g 'docs/adr/0018-formato-de-entrega-escolhido-pelo-usuario.md' -g 'docs/adr/0019-saida-personalizada-guiada.md' -g 'docs/adr/0020-modelos-reutilizaveis-de-entrega.md' -g 'docs/adr/0021-modelos-de-execucao-separados-de-modelos-de-entrega.md'`
- `rg --files docs | rg '012|output|template|customization|fiscal-desk'`
- `find docs -path '*fiscal-desk*' -maxdepth 5 -type f | sort`
- `find docs/adr -maxdepth 1 -type f | sort`
- `sed -n '1,320p' docs/fiscal-desk/executor-packets/012-output-customization-templates.md`
- `sed -n '1,360p' docs/fiscal-desk/phase-orchestration.md`
- `sed -n '1,380p' docs/fiscal-desk/product-spec.md`
- `sed -n '1,260p' docs/adr/0018-formato-de-entrega-escolhido-pelo-usuario.md`
- `sed -n '1,280p' docs/adr/0019-saida-personalizada-guiada.md`
- `sed -n '1,280p' docs/adr/0020-modelos-reutilizaveis-de-entrega.md`
- `sed -n '1,280p' docs/adr/0021-modelos-de-execucao-separados-de-modelos-de-entrega.md`
- `sed -n '1,260p' src/core/export/csv-writer.ts`
- `sed -n '1,320p' src/core/app/process-csv.types.ts`

Required checks after this receipt:

- `git diff --check -- docs/goals/fiscal-desk-orchestration/results/phase-6e-output-templates-scope-review.md`

Required checks for next implementation:

- `pnpm exec vitest run test/unit/fiscal-export-artifacts.test.ts test/unit/fiscal-desk-phase-6-contracts.test.ts`
- `pnpm typecheck`
- `pnpm lint`
- `git diff --check -- <changed files>`
- independent review for the material export-contract diff

Recommended broader checks if `process-csv.types.ts` is touched:

- `pnpm exec vitest run test/unit/process-csv-contracts.test.ts`
- `pnpm test` if delivery/public contracts change broadly

No screenshot or smoke is required for F6E1 if it remains core/export only. If a
later worker touches UI, packet 012 requires screenshot or delivery-selection
smoke.

## Risks

- `CONTEXT.md` is absent even after the docs restore. Treat that as a minor
  docs gap for the next worker to note, not as a blocker for the narrow
  export-contract slice.
- The packet's allowed files are broader than the safe first window. Judge
  should resist allowing IPC/preload/renderer in F6E1.
- Reusable delivery models are tempting but explicitly later than stable
  delivery formats.
- Future monetization cannot block existing CSV/XLSX exports or user data.
- The worktree is broadly dirty from prior integrated or parallel phase work.
  This review attributes only the docs-only receipt listed above and does not
  attempt cleanup.
- Harness warnings `magic_string_boundary=29` and `visual_surface_change=1`
  remain broader worktree warnings. This docs-only receipt does not add runtime
  boundary literals or visual surfaces. The next worker must centralize any new
  export option IDs/states in `src/core/export/**` and run focused tests.

## Prompt For Next Subagent

```text
/goal
Execute F6E1 output customization export-contract implementation for Fiscal
Desk.

Contexto:
- F6A/F6B/F6C/F6D ja foram julgadas, integradas e validadas.
- F6D integrou apenas runtime core `processCsv` e manteve templates
  indisponiveis.
- Packet 012, product spec e ADRs 0018-0021 foram restaurados como contexto de
  leitura e suportam uma primeira fatia de contrato/export core.
- Esta thread nao implementa UI guiada, IPC/preload, runtime selection, modelos
  salvos, monetizacao, PDF/OCR, release ou provider changes.
- Nao declare F6 pronta.

Leia obrigatoriamente:
- `AGENTS.md`
- `docs/goals/fiscal-desk-orchestration/goal.md`
- `docs/goals/fiscal-desk-orchestration/state.yaml`
- `docs/goals/fiscal-desk-orchestration/subagent-registry.md`
- `docs/goals/fiscal-desk-orchestration/integration-plan.md`
- `docs/goals/fiscal-desk-orchestration/phases/phase-6-ingestao-entrega.md`
- `docs/goals/fiscal-desk-orchestration/results/phase-6e-output-templates-scope-review.md`
- `docs/fiscal-desk/executor-packets/012-output-customization-templates.md`
- `docs/fiscal-desk/product-spec.md`
- `docs/adr/0018-formato-de-entrega-escolhido-pelo-usuario.md`
- `docs/adr/0019-saida-personalizada-guiada.md`
- `docs/adr/0020-modelos-reutilizaveis-de-entrega.md`
- `docs/adr/0021-modelos-de-execucao-separados-de-modelos-de-entrega.md`
- `docs/goals/fiscal-desk-orchestration/results/phase-6a-ingestao-entrega-contract.md`
- `docs/goals/fiscal-desk-orchestration/results/phase-6c-export-delivery-implementation.md`
- `docs/goals/fiscal-desk-orchestration/results/phase-6d-runtime-wiring.md`
- `src/core/export/csv-writer.ts`
- `src/core/export/export-contract.ts`
- `src/core/export/export-artifacts.ts`
- `src/core/app/process-csv.types.ts`

Escopo:
- Criar/ajustar contrato core de opcoes de entrega/customizacao em
  `src/core/export/**`.
- Preservar CSV atual e XLSX atual.
- Representar opcoes atuais, planejadas e desabilitadas sem prometer formatos
  indisponiveis.
- Manter modelos reutilizaveis como reservado/deferido, sem persistencia.
- Manter modelo de entrega separado de provider, execucao, velocidade,
  confirmacao e politica de falhas.

Allowed writes:
- `src/core/export/export-contract.ts`
- `src/core/export/export-artifacts.ts`
- `test/unit/fiscal-export-artifacts.test.ts`
- `test/unit/fiscal-desk-phase-6-contracts.test.ts`
- novos testes unitarios focados em `test/unit/**`, se necessarios
- `src/core/app/process-csv.types.ts`, somente se houver lacuna estreita e
  comprovada de compatibilidade de tipo
- `docs/goals/fiscal-desk-orchestration/results/phase-6e-output-templates-implementation.md`

Do not touch:
- `docs/fiscal-desk/**`
- `docs/adr/**`
- `docs/goals/fiscal-desk-orchestration/state.yaml`
- `src/core/ingestion/**`
- `src/core/app/process-csv.use-case.ts`
- `src/core/app/process-csv-delivery.ts`
- `src/main/**`
- `src/renderer/**`
- `src/core/simples/**`
- provider adapters
- Receita Web
- `scripts/**`
- release/update
- backend remoto, banco, PDF/OCR
- package manager files
- stage, commit, push ou PR

Stop conditions:
- precisa de IPC/preload, renderer ou runtime delivery para ficar coerente;
- precisa alterar provider, Receita Web, ingestion ou fallback;
- precisa de PDF/OCR/licenca/paywall/backend remoto/release;
- metadados/copy fazem parecer que templates, PDF, JSON ou Excel formatado
  estao prontos sem implementacao;
- modelos de entrega se acoplam a modelos de execucao.

Verification:
- `pnpm exec vitest run test/unit/fiscal-export-artifacts.test.ts test/unit/fiscal-desk-phase-6-contracts.test.ts`
- `pnpm typecheck`
- `pnpm lint`
- `git diff --check -- <changed files>`
- review independente.

Output receipt:
- status `approved_candidate | needs_rework | blocked`;
- arquivos lidos/alterados;
- comandos;
- checks;
- matriz de opcoes de entrega;
- lacunas deferidas;
- riscos;
- afirmacao explicita de que F6 nao esta pronta.
```

## Required Completion Statement

F6 is not complete. F6E is approved only as a narrow export-contract candidate.
Full templates/output customization remains deferred until core/export contract
is accepted and separate owner windows are granted for runtime, IPC/preload,
renderer UI and reusable delivery models.

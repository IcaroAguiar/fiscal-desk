# P3 Renderer Missing Column Normalizer Review Dispatch

Data: 2026-06-13 17:40:18 -03
Status: `dispatched_independent_review_pending_thread`
Judge thread: `019ebe5c-3853-79c2-87ad-8ddace386c93`
Worker thread: `019ec2b1-befe-70b3-95ad-61fbda8a089e`
Worker worktree: `/Users/icaroaguiar/.codex/worktrees/75bc/consulta-simples-csv`

## Objective

Executar review independente read-only do candidato material
`p3_renderer_missing_column_normalizer_can_hide_new_core_guidance`.

## Candidate Diff

Esperado no worker:

- `src/renderer/ui/app-helpers.ts`
- `test/unit/app-helpers.test.ts`
- `docs/goals/fiscal-desk-orchestration/results/p3-renderer-missing-column-normalizer-can-hide-new-core-guidance-2026-06-13.md`

## Review Questions

- O diff fica estritamente dentro do allowed write set?
- A mensagem nova do core para coluna CNPJ ausente e preservada no renderer?
- O teste prova o comportamento real de `Error invoking remote method`?
- As normalizacoes antigas relevantes continuam cobertas?
- Houve toque indevido em core, main, preload, provider, export, styles,
  package, lockfile, CI, release ou docs locais?
- Os checks reportados sao suficientes para a superficie alterada?
- Existe finding P0/P1/P2/P3 que exija rework antes de integracao?

## Allowed Write

- `docs/goals/fiscal-desk-orchestration/results/p3-renderer-missing-column-normalizer-can-hide-new-core-guidance-review-2026-06-13.md`

## Do Not Touch

- qualquer `src/**` ou `test/**`;
- worker worktree files;
- `package.json`, `pnpm-lock.yaml`, `electron-builder.yml`, `.github/**`;
- `docs/fiscal-desk/**`, `docs/adr/**`;
- `docs/goals/fiscal-desk-orchestration/state.yaml`;
- `docs/goals/fiscal-desk-orchestration/integration-plan.md`;
- stage, commit, push, PR, deploy, release, publish.

## Required Output

O reviewer deve criar o receipt permitido com status
`approved_candidate` ou `needs_rework`, evidencias, checks ou leituras feitas,
findings com severidade e recomendacao ao judge.

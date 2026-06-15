# Post P3 First Release Status Rebaseline Dispatch

Data: 2026-06-13 18:01:49 -03
Status: `prepared_for_codex_app_thread`
Judge thread: `019ebe5c-3853-79c2-87ad-8ddace386c93`
Branch canonica: `feat/fiscal-desk-local-base-prep`
Target commit minimo: `b941a9e`

## Objetivo

Executar uma janela docs-only serial:

`post_p3_first_release_status_rebaseline`

A thread deve rebaselinar a documentacao local de primeiro release/status para
refletir que P3 renderer foi integrado e validado depois do hardening de intake
CSV. Nenhuma feature material esta liberada por este dispatch.

## Contexto Obrigatorio

Ler primeiro:

- `AGENTS.md`
- `docs/goals/fiscal-desk-orchestration/goal.md`
- `docs/goals/fiscal-desk-orchestration/state.yaml`
- `docs/goals/fiscal-desk-orchestration/integration-plan.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-renderer-next-owner-window-selection-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-renderer-next-owner-window-selection-judge-decision-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/p3-renderer-missing-column-normalizer-can-hide-new-core-guidance-integration-judge-decision-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-local-base-regate-csv-input-intake-hardening-integration-judge-decision-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/phase-6e2c-renderer-delivery-selection-ui-judge-decision-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/phase-8b-local-update-diagnostic-ui-implementation-judge-decision.md`
- receipts recentes de release/security, rework e Base Publica Local re-gate
  necessarios para manter o status factual.

## Regra De Docs Locais

`docs/fiscal-desk/**` e local e ignorado por `.git/info/exclude` na worktree
principal. O orquestrador deve copiar esse diretorio para a worktree da thread
apos a criacao.

O worker deve confirmar que `docs/fiscal-desk/**` existe localmente antes de
editar. Se ainda estiver ausente depois da copia/coordenação do judge, parar
como `blocked_missing_local_docs_fiscal_desk_for_docs_only_rebaseline`.

## Allowed Write

- `docs/fiscal-desk/first-release.md`
- `docs/fiscal-desk/status.md`
- `docs/fiscal-desk/product-spec.md`
- `docs/fiscal-desk/roadmap.md`, somente se houver referencia stale direta
- `docs/fiscal-desk/quality-gates.md`, somente se houver referencia stale direta
- `docs/fiscal-desk/executor-packets/013-first-release-cut.md`, somente se houver referencia stale direta
- `docs/goals/fiscal-desk-orchestration/results/post-p3-first-release-status-rebaseline-2026-06-13.md`

## Forbidden Write

- `src/**`
- `test/**`
- `package.json`
- `pnpm-lock.yaml`
- `.github/**`
- `electron-builder.yml`
- `docs/adr/**`
- `docs/goals/fiscal-desk-orchestration/state.yaml`
- `docs/goals/fiscal-desk-orchestration/integration-plan.md`
- qualquer arquivo fora do allowed write set
- stage, commit, push, PR, deploy, publish, dist, assinatura, notarizacao,
  updater real ou qualquer efeito externo.

## Tarefas

1. Confirmar presenca editavel de `docs/fiscal-desk/**` na worktree.
2. Atualizar docs de primeiro release/status para refletir que P3 renderer foi
   integrado e validado.
3. Manter F6E2C, F8B1, release/security, reworks e Base Publica Local re-gate
   como historicos consumidos, nao como proxima janela atual.
4. Manter bloqueios explicitos para update real, diagnostico gerado/enviado,
   telemetria real, licenca/account real, release/package config,
   storage/network, templates/modelos reutilizaveis, PDF/Word/OCR e Receita Web
   live/massiva.
5. Nao selecionar ou implementar nova feature material.
6. Produzir receipt em
   `docs/goals/fiscal-desk-orchestration/results/post-p3-first-release-status-rebaseline-2026-06-13.md`.

## Checks Esperados

- `git status --short --branch --untracked-files=all` antes e depois.
- Scans proporcionais com `rg` nos docs permitidos e receipts recentes para
  `P3`, `coluna`, `CPF/CNPJ`, `F6E2C`, `F8B1`, `release/security`,
  `Base Publica`, `update`, `diagnostico`, `telemetria`, `licenca`,
  `templates`, `PDF`, `Word`, `OCR`, `Receita Web`.
- `git diff --check -- <changed allowed files>`.

Nao rodar testes/build/smokes como gate default porque a janela e docs-only. Se
qualquer codigo, teste, package, workflow ou release config precisar mudar,
parar como `blocked_scope_expansion_required`.

## Review

Review independente nao e obrigatorio se a thread permanecer docs-only. Qualquer
mudanca material exige novo escopo e reviewer independente antes de integracao.

## Status Esperado Do Receipt

O receipt final deve terminar com exatamente um destes status:

- `ready_for_judge_review`
- `blocked`
- `needs_rework`

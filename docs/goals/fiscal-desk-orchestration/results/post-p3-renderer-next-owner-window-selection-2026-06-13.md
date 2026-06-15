# Post P3 Renderer Next Owner Window Selection

Data: 2026-06-13
Thread: Codex App independente
Judge/orquestrador: `019ebe5c-3853-79c2-87ad-8ddace386c93`
Branch canonica alvo: `feat/fiscal-desk-local-base-prep`
Commit local revisado: `ee1e448 docs: dispatch post-p3 owner selection`
Status final: `approved_scope_candidate`

## Resumo

Recomendo exatamente uma proxima owner window:

`post_p3_first_release_status_rebaseline`

Classificacao: `docs-only`.

Racional: P3 renderer foi integrado e validado, a fila material ficou vazia, e
os docs canonicos locais em `docs/fiscal-desk/**` ainda descrevem o corte antes
do fechamento P3. Antes de abrir outro worker material, a proxima janela segura
e rebaselinar a documentacao local de primeiro release/status para registrar
P3 como fechado, manter F6E2C/F8B1/release-security/re-gates como historicos
consumidos e preservar os bloqueios de update, diagnostico, telemetria,
licenca, release/package, storage/network, templates/modelos reutilizaveis,
PDF/Word/OCR e Receita Web live/massiva.

Esta recomendacao nao libera feature material automaticamente. O resultado deve
voltar ao judge como candidato.

## Arquivos e docs lidos

- `AGENTS.md`
- `docs/goals/fiscal-desk-orchestration/goal.md`
- `docs/goals/fiscal-desk-orchestration/state.yaml`
- `docs/goals/fiscal-desk-orchestration/integration-plan.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-renderer-next-owner-window-selection-dispatch-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/p3-renderer-missing-column-normalizer-can-hide-new-core-guidance-integration-judge-decision-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-local-base-regate-csv-input-intake-hardening-integration-judge-decision-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-csv-input-intake-next-owner-window-selection-judge-decision-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/phase-6e2c-renderer-delivery-selection-ui-judge-decision-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/phase-8b-local-update-diagnostic-ui-implementation-judge-decision.md`
- `docs/goals/fiscal-desk-orchestration/results/first-release-rebaseline-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/first-release-candidate-release-security-review-judge-decision-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/first-release-rework-candidates-judge-decision-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/first-release-rework-integration-judge-decision-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/first-release-post-rework-release-review-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/first-release-post-rework-security-review-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/first-release-post-local-base-rework-security-regate-judge-decision-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/testing-infra-coverage-gate-canonical-integration-2026-06-13.md`
- Copia canonica absoluta, somente leitura, porque `docs/fiscal-desk/**` esta
  ausente nesta worktree:
  - `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/fiscal-desk/first-release.md`
  - `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/fiscal-desk/status.md`
  - `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/fiscal-desk/roadmap.md`
  - `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/fiscal-desk/product-spec.md`
  - `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/fiscal-desk/quality-gates.md`
  - `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/fiscal-desk/executor-packets/013-first-release-cut.md`

## Checks e scans executados

- `git status --short --branch --untracked-files=all`: pass; `## HEAD (no branch)` antes da escrita do receipt.
- `git log -1 --oneline`: pass; `ee1e448 docs: dispatch post-p3 owner selection`.
- `test -d docs/fiscal-desk && find docs/fiscal-desk -maxdepth 2 -type f -print || true`: pass; sem output, confirmando ausencia local.
- `test -d /Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/fiscal-desk && find /Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/fiscal-desk -maxdepth 2 -type f -print || true`: pass; copia canonica absoluta existe.
- `find docs/goals/fiscal-desk-orchestration/results -maxdepth 1 -type f | sort | tail -80`: pass; usado para localizar receipts recentes.
- `find docs/goals/fiscal-desk-orchestration/results -maxdepth 1 -type f | rg 'release|security|first-release' | sort`: pass; usado para localizar gates de release/security.
- `rg -n "next owner|blocked|diagnostico|telemetria|licenca|update|release|templates|PDF|Word|OCR|Receita Web|Base Publica|F6E|F8B|P3" ...`: pass nos docs/goals proporcionais e receipts recentes.
- `rg -n "next owner|blocked|diagnostico|telemetria|licenca|update|release|templates|PDF|Word|OCR|Receita Web|Base Publica|F6E|F8B|P3" ...`: pass na copia canonica absoluta de `docs/fiscal-desk/**` proporcional.

## Estado da fila

- P3 renderer `p3_renderer_missing_column_normalizer_can_hide_new_core_guidance`
  esta `approved_by_judge_integrated_validated`.
- Nao ha worker material ativo apos P3.
- A fila ativa e apenas esta selecao read-only pos-P3.
- A fila aprovada anterior esta consumida: F6E2C foi aceito como no-code,
  F8B1 foi integrado seletivamente, release/security inicial gerou reworks,
  os reworks foram integrados, e o blocker especifico da Base Publica Local foi
  fechado por re-gate.
- `docs/fiscal-desk/**` esta ausente nesta worktree; a copia canonica absoluta
  foi usada apenas como evidencia de leitura. Isso limita a edicao nesta thread,
  mas nao impede a recomendacao.

## Recomendacao objetiva

Selecionar `post_p3_first_release_status_rebaseline` como proxima janela
docs-only.

Objetivo: atualizar a documentacao local de primeiro release/status para o
estado apos P3, sem tocar codigo, testes, pacote, workflows, release config,
state.yaml ou integration-plan.

O rebaseline deve:

- registrar que P3 renderer foi integrado e validado;
- remover qualquer leitura de que o risco P3 ainda esta pendente;
- manter F6E2C como historico no-code fechado;
- manter release/security review, reworks e re-gate local-base como historicos
  consumidos, nao como proxima janela atual;
- manter bloqueios explicitos para update real, diagnostico gerado/enviado,
  telemetria real, licenca/account real, release/package config,
  storage/network, templates/modelos reutilizaveis, PDF/Word/OCR e Receita Web
  live/massiva;
- apontar que qualquer nova feature material exige nova selecao fresca de
  owner window, allowed writes e reviewer independente quando material.

## Allowed write set recomendado

- `docs/fiscal-desk/first-release.md`
- `docs/fiscal-desk/status.md`
- `docs/fiscal-desk/product-spec.md`
- `docs/fiscal-desk/roadmap.md`, somente se houver referencia stale direta ao proximo passo
- `docs/fiscal-desk/quality-gates.md`, somente se houver referencia stale direta aos gates pos-P3
- `docs/fiscal-desk/executor-packets/013-first-release-cut.md`, somente se houver referencia stale direta ao proximo passo
- `docs/goals/fiscal-desk-orchestration/results/post-p3-first-release-status-rebaseline-2026-06-13.md`

Se `docs/fiscal-desk/**` nao existir na worktree do proximo worker e o judge nao
tiver fornecido copia local editavel, o worker deve parar como
`blocked_missing_local_docs_fiscal_desk_for_docs_only_rebaseline`, sem copiar
arquivos por conta propria.

## Do-not-touch set recomendado

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
  updater real ou qualquer efeito externo

## Shared boundaries afetadas

Nenhuma boundary runtime deve ser escrita. A janela e documental.

Boundaries que devem permanecer bloqueadas:

- `ipc_contracts`
- `preload_bridge`
- `process_csv_contracts`
- `provider_types`
- `export_types`
- `renderer_shell`
- `styles_css`
- `receita_web_adapter_contract`
- release/update/package/workflow surfaces
- diagnostico, telemetria, licenca/account, storage/network

## Dependencias e analise de colisao

- Depende da decisao P3 integrada e validada em
  `p3-renderer-missing-column-normalizer-can-hide-new-core-guidance-integration-judge-decision-2026-06-13.md`.
- Depende dos rebaselines e gates anteriores apenas como historico consumido.
- Nao deve rodar em paralelo com outro worker que edite `docs/fiscal-desk/**`,
  porque a propria finalidade e reconciliar o status documental pos-P3.
- Pode rodar em paralelo com scouts read-only sem writes, desde que nenhum
  scout altere docs locais.
- Nao colide com `src/**`, testes, package/release, IPC/preload, renderer ou
  providers porque essas superficies ficam em do-not-touch.

## Checks obrigatorios para o proximo worker

- `git status --short --branch --untracked-files=all` antes e depois.
- Confirmar presenca editavel de `docs/fiscal-desk/**` na worktree.
- Ler `AGENTS.md`, `goal.md`, `state.yaml`, `integration-plan.md`, o receipt P3
  integrado, os receipts de release/security/rework/re-gate e os docs
  `docs/fiscal-desk/**` listados no allowed write set.
- `rg -n "P3|coluna|CPF/CNPJ|F6E2C|F8B1|release/security|Base Publica|update|diagnostico|telemetria|licenca|templates|PDF|Word|OCR|Receita Web" docs/fiscal-desk docs/goals/fiscal-desk-orchestration/results/post-p3-first-release-status-rebaseline-2026-06-13.md`
- `git diff --check -- <allowed-write-files-changed>`
- Nao rodar testes, build ou smokes como requisito default, porque a janela e
  docs-only. Se qualquer codigo/teste/config precisar mudar, parar como
  `blocked_scope_expansion_required`.

## Review independente

Review independente nao e obrigatorio para a janela docs-only, desde que ela
permaneça estritamente documental e sem mudanca de contrato, codigo, teste,
package, workflow ou release config.

Se o worker propuser qualquer mudanca material, a janela deve parar e voltar ao
judge para novo escopo. Mudanca material futura exigira reviewer independente.

## Riscos residuais

- A worktree atual nao contem `docs/fiscal-desk/**`; a recomendacao depende da
  copia canonica absoluta apenas para leitura.
- `docs/fiscal-desk/**` parecem continuar locais/ignorados; o judge precisa
  decidir quando e como versionar esses docs, se eles entrarem na branch final.
- Um docs-only rebaseline nao prova runtime nem libera release. Ele apenas
  remove drift documental apos P3.
- As proximas features materiais continuam bloqueadas ate novo owner window
  fresco e julgamento do orquestrador.
- Coverage quantitativa segue auxiliar e nao substitui smokes/testes
  qualitativos quando uma futura janela tocar comportamento.

## Stop conditions para o proximo worker

- `docs/fiscal-desk/**` ausente ou nao editavel na worktree, sem copia fornecida
  pelo judge.
- Necessidade de editar `src/**`, `test/**`, package/lockfile, workflow,
  release config, ADR, `state.yaml` ou `integration-plan.md`.
- Necessidade de prometer ou implementar update real, diagnostico real,
  telemetria real, licenca/account real, storage/network, templates/modelos,
  PDF/Word/OCR ou Receita Web live/massiva.
- Conflito entre receipts canonicos e docs locais que nao possa ser resolvido
  por leitura objetiva.
- `git diff --check` falha no allowed write set.

## Prompt pronto para a proxima thread

```text
/goal Execute docs-only owner window `post_p3_first_release_status_rebaseline` for Fiscal Desk.

You are running as an independent Codex App thread/worktree. The current thread is the judge/orchestrator and will decide whether to accept your receipt. Do not self-approve. Do not implement code.

Use model `gpt-5.5` and reasoning `medium`. Use Portuguese-BR in the receipt.

Canonical branch: `feat/fiscal-desk-local-base-prep`.
Judge/orchestrator thread: `019ebe5c-3853-79c2-87ad-8ddace386c93`.

Read first:
- `AGENTS.md`
- `docs/goals/fiscal-desk-orchestration/goal.md`
- `docs/goals/fiscal-desk-orchestration/state.yaml`
- `docs/goals/fiscal-desk-orchestration/integration-plan.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-renderer-next-owner-window-selection-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/p3-renderer-missing-column-normalizer-can-hide-new-core-guidance-integration-judge-decision-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-local-base-regate-csv-input-intake-hardening-integration-judge-decision-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/phase-6e2c-renderer-delivery-selection-ui-judge-decision-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/phase-8b-local-update-diagnostic-ui-implementation-judge-decision.md`
- recent release/security, rework and Base Publica Local re-gate receipts needed to keep the status accurate.

Task:
1. Confirm editable local `docs/fiscal-desk/**` exists in this worktree. If it is absent and the judge did not provide a local editable copy, stop as `blocked_missing_local_docs_fiscal_desk_for_docs_only_rebaseline`.
2. Update first-release/status documentation to reflect that P3 renderer was integrated and validated after the CSV input intake hardening.
3. Keep F6E2C, F8B1, release/security review, reworks and Base Publica Local re-gate as consumed historical gates, not current next owner windows.
4. Keep explicit blockers for update real, diagnostico gerado/enviado, telemetria real, licenca/account real, release/package config, storage/network, templates/modelos reutilizaveis, PDF/Word/OCR and Receita Web live/massiva.
5. Do not select or implement a new material feature. State that material work still requires fresh judge-selected owner window.
6. Produce a receipt at `docs/goals/fiscal-desk-orchestration/results/post-p3-first-release-status-rebaseline-2026-06-13.md`.

Allowed write:
- `docs/fiscal-desk/first-release.md`
- `docs/fiscal-desk/status.md`
- `docs/fiscal-desk/product-spec.md`
- `docs/fiscal-desk/roadmap.md`, only if needed for stale direct references
- `docs/fiscal-desk/quality-gates.md`, only if needed for stale direct references
- `docs/fiscal-desk/executor-packets/013-first-release-cut.md`, only if needed for stale direct references
- `docs/goals/fiscal-desk-orchestration/results/post-p3-first-release-status-rebaseline-2026-06-13.md`

Forbidden writes:
- `src/**`
- `test/**`
- `package.json`
- `pnpm-lock.yaml`
- `.github/**`
- `electron-builder.yml`
- `docs/adr/**`
- `docs/goals/fiscal-desk-orchestration/state.yaml`
- `docs/goals/fiscal-desk-orchestration/integration-plan.md`
- any file outside the allowed write set

Checks expected:
- `git status --short --branch --untracked-files=all` before and after.
- Proportional `rg` scans over allowed docs and recent receipts for `P3`, `coluna`, `CPF/CNPJ`, `F6E2C`, `F8B1`, `release/security`, `Base Publica`, `update`, `diagnostico`, `telemetria`, `licenca`, `templates`, `PDF`, `Word`, `OCR`, `Receita Web`.
- `git diff --check -- <changed allowed files>`.

Receipt final status must be exactly one of: `ready_for_judge_review`, `blocked`, `needs_rework`.

End final message with `ready_for_judge_review` and the receipt path if completed.
```

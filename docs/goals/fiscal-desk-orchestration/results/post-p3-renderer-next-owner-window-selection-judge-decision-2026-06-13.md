# Post P3 Renderer Next Owner Window Selection Judge Decision

Data: 2026-06-13 17:59:46 -03
Status: `approved_by_judge_docs_only_scope_candidate`
Judge thread: `019ebe5c-3853-79c2-87ad-8ddace386c93`
Scope-selection thread: `019ec2c1-e7d7-7da3-8c18-874987ff83fc`

## Decisao

Aceito o receipt `approved_scope_candidate` da thread de selecao pos-P3.

A proxima owner window liberavel e unica:

`post_p3_first_release_status_rebaseline`

Classificacao: docs-only, serial, sem worker material.

## Racional

P3 renderer foi integrado e validado, e nao ha worker material ativo depois
dele. A thread de selecao confirmou que os docs locais `docs/fiscal-desk/**`
ainda podem induzir leitura pre-P3 do corte de primeiro release/status.

Antes de liberar qualquer nova feature material, a documentacao local precisa
ser rebaselinada para registrar P3 como fechado, manter F6E2C, F8B1,
release/security, reworks e re-gates como historicos consumidos, e preservar os
bloqueios de update real, diagnostico gerado/enviado, telemetria real,
licenca/account real, release/package config, storage/network, templates,
PDF/Word/OCR e Receita Web live/massiva.

## Efeito

- Nenhuma feature material e liberada por esta decisao.
- A proxima thread autorizada e docs-only.
- Material work continua bloqueado ate o rebaseline docs-only ser completado e
  julgado.
- Como `docs/fiscal-desk/**` e local/ignorado por `.git/info/exclude`, o
  orquestrador deve fornecer copia editavel desses docs para a worktree da
  thread docs-only antes de cobrar execucao. Se a copia nao estiver presente, o
  worker deve parar como
  `blocked_missing_local_docs_fiscal_desk_for_docs_only_rebaseline`.

## Allowed Write Para Proxima Thread

- `docs/fiscal-desk/first-release.md`
- `docs/fiscal-desk/status.md`
- `docs/fiscal-desk/product-spec.md`
- `docs/fiscal-desk/roadmap.md`, somente se houver referencia stale direta
- `docs/fiscal-desk/quality-gates.md`, somente se houver referencia stale direta
- `docs/fiscal-desk/executor-packets/013-first-release-cut.md`, somente se houver referencia stale direta
- `docs/goals/fiscal-desk-orchestration/results/post-p3-first-release-status-rebaseline-2026-06-13.md`

## Do Not Touch Para Proxima Thread

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

## Validacao Do Judge

- Thread Codex App finalizada como `idle`.
- Receipt criado no unico caminho permitido na worktree delegada.
- Worktree delegada mostrou apenas o receipt novo como untracked.
- Receipt recomenda exatamente uma proxima janela e contem allowed writes,
  do-not-touch, checks, review need, riscos e stop conditions.
- `docs/fiscal-desk/**` existe na worktree principal, mas esta ignorado por
  `.git/info/exclude`; isso e risco operacional conhecido e deve ser tratado no
  dispatch do worker docs-only.

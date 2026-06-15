# First Release Rebaseline 2026-06-13

Status: `ready_for_judge_review`

## Escopo

Owner window docs-only:
`first_release_rebaseline_after_integrated_fiscal_desk`.

Este receipt substitui o receipt inicial `blocked`. O blocker inicial foi
ambiente/worktree: `CONTEXT.md`, `docs/fiscal-desk/**` e `docs/adr/**` estavam
ausentes nesta worktree. O judge/orquestrador copiou os docs obrigatorios da
worktree canonica para
`/Users/icaroaguiar/.codex/worktrees/8bf3/consulta-simples-csv`, e a presenca
foi revalidada antes das edicoes.

Nenhum codigo, teste, package/lockfile, release config, ADR, `state.yaml`,
`integration-plan.md`, stage, commit, push, PR, deploy ou release foi alterado.

## Arquivos lidos

- `AGENTS.md`
- `CONTEXT.md`
- `docs/goals/fiscal-desk-orchestration/goal.md`
- `docs/goals/fiscal-desk-orchestration/state.yaml`
- `docs/goals/fiscal-desk-orchestration/integration-plan.md`
- `docs/goals/fiscal-desk-orchestration/results/final-integration-review-judge-decision.md`
- `docs/goals/fiscal-desk-orchestration/results/testing-infra-coverage-gate-post-commit-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/orchestration-observation-2026-06-13-1400.md`
- todos os receipts `docs/goals/fiscal-desk-orchestration/results/integration-wave-*.md`
- `docs/fiscal-desk/executor-packets/013-first-release-cut.md`
- `docs/fiscal-desk/first-release.md`
- `docs/fiscal-desk/status.md`
- `docs/fiscal-desk/roadmap.md`
- `docs/fiscal-desk/product-spec.md`
- `docs/fiscal-desk/implementation-plan.md`
- `docs/fiscal-desk/quality-gates.md`
- `docs/fiscal-desk/spec-audit.md`
- `docs/fiscal-desk/decision-register.md`
- `docs/fiscal-desk/visual-references.md`
- `docs/adr/0027-fiscal-desk-como-marca-open-source-capitalizavel.md`
- `docs/adr/0028-community-first-com-limites-comerciais-futuros.md`
- `docs/adr/0034-spark-executor-com-reviewer-capaz.md`

## Arquivos alterados

- `docs/fiscal-desk/first-release.md`
- `docs/fiscal-desk/status.md`
- `docs/fiscal-desk/roadmap.md`
- `docs/fiscal-desk/product-spec.md`
- `docs/fiscal-desk/implementation-plan.md`
- `docs/fiscal-desk/quality-gates.md`
- `docs/fiscal-desk/executor-packets/013-first-release-cut.md`
- `docs/goals/fiscal-desk-orchestration/results/first-release-rebaseline-2026-06-13.md`

## Resumo do diff

- `first-release.md` foi rebaselined para refletir o estado integrado atual,
  nao a sequencia historica pre-Wave 13.
- `status.md` deixou de tratar Wave 10 como estado final e passou a apontar
  Wave 13/F8B1, `testing_infra_coverage_gate` e fila material vazia ate novo
  owner window.
- `roadmap.md` foi marcado como macro/historico, com estado integrado por corte
  e bloqueios futuros.
- `product-spec.md` teve a matriz de disponibilidade alinhada: CSV, XLSX atual,
  RunLedger/retomada, Base Publica Local, catalogo/fallback, Receita Web
  assistida e estados locais bloqueados F8 aparecem como integrados; formatos e
  comportamentos futuros permanecem bloqueados/planejados.
- `implementation-plan.md` foi marcado como historico e apontou as fontes
  canonicas atuais.
- `quality-gates.md` separou coverage quantitativa de validacao qualitativa,
  preservando smoke Electron/visual/CSV como obrigacao por superficie e
  proibindo fechamento material apenas por percentual de coverage.
- Packet 013 passou a permitir `first-release.md` e teve o contexto minimo
  corrigido para o estado integrado atual.

## Rework pontual do judge

Aplicado apos revisao do judge/orquestrador:

- `status.md` corrigiu o receipt da Wave 13 para o caminho existente
  `docs/goals/fiscal-desk-orchestration/results/integration-wave-13-f8b1-renderer-blocked-state.md`.
- `status.md` e `quality-gates.md` alinharam coverage de branches para
  `75.32%`, conforme execucao fresca de `pnpm test:coverage` reportada pelo
  judge.
- Status do candidato permanece `ready_for_judge_review`.

## Matriz de release resultante

### Entra agora

| Area | Estado |
|---|---|
| Marca Fiscal Desk | Integrada como direcao de produto. |
| Community-first | Integrado como estrategia inicial. |
| Entrada CSV | Disponivel. |
| Saida CSV | Preservada. |
| Saida XLSX atual | Disponivel no pacote integrado atual. |
| RunLedger/checkpoint/retomada | Integrado e validado pelos receipts/smokes. |
| Base Publica Local | Integrada com preparo consentido. |
| Catalogo/fallback de provedores | Integrado. |
| Receita Web assistida | Integrada/hardened como experimental, nao massiva. |
| Estados locais bloqueados F8 | Integrados como comunicacao/UX sem comportamento real. |
| Coverage gate | Integrado como sinal quantitativo auxiliar. |

### Visivel planejado/desabilitado

| Area | Limite |
|---|---|
| Entrada Excel | Planejada/desabilitada ate owner window de ingestao real. |
| PDF/Word/OCR | Planejados; OCR opcional e revisavel no futuro. |
| PDF executivo | Planejado, nao base operacional. |
| Auto-update | Somente estado/limite/check visual sem update real. |
| Diagnostico | Somente conceito/estado local; sem gerar/enviar pacote real. |
| Telemetria | Opt-in futuro; sem transporte real. |
| Licenca Pro local | Futuro; sem conta/licenca real. |
| Saida personalizada guiada | Planejada; sem modelos/templates reutilizaveis. |

### Fora do primeiro release

| Area | Motivo |
|---|---|
| Receita Web massiva | Risco de CAPTCHA/bloqueio/instabilidade. |
| Templates UI/modelos reutilizaveis | Owner window proprio requerido. |
| PDF/Word/OCR reais | Contratos de extracao/revisao ainda ausentes. |
| Auto-update real | Canal, assinatura e metadata nao definidos. |
| Telemetria real | Contrato opt-in/transporte/privacidade nao definido. |
| Diagnostico gerado/enviado | Sanitizacao/revisao local/gate de seguranca pendentes. |
| Licenca/account real | Decisao comercial e contrato local pendentes. |
| Release/package config | Fora deste rebaseline docs-only. |
| Storage/network/backend remoto | Fora da promessa local-first do primeiro release. |

## Proxima owner window recomendada

Recomendada para decisao do judge:
`f6e2c_renderer_delivery_selection_ui`.

Objetivo sugerido:
expor no renderer a selecao/estado de entrega atual ja integrada nos
contratos/IPC, validando que o usuario entende CSV/XLSX atual sem prometer
templates, modelos reutilizaveis ou formatos futuros.

Allowed writes sugeridos:

- `src/renderer/ui/app-view.ts`
- `src/renderer/ui/app.ts`
- `src/renderer/ui/app.types.ts`, somente se necessario para tipagem local
- testes unitarios de renderer relacionados ao fluxo de entrega
- receipt em `docs/goals/fiscal-desk-orchestration/results/`

Do-not-touch sugerido:

- `src/main/**`
- `src/core/**`
- contratos IPC/preload ja integrados
- providers
- ingestao/export core
- update/release
- telemetria
- diagnostico
- licenca/account
- storage/network
- package/lockfile
- `.github/**`

Checks obrigatorios sugeridos:

- testes focados de renderer
- matriz de obrigacoes por superficie tocada: unit, integration, contract,
  Electron smoke e visual
- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`
- `pnpm build`
- `pnpm smoke:visual`
- `pnpm smoke:electron-ui`
- `FISCAL_DESK_SMOKE_PROVIDER=base-publica-local pnpm smoke:electron-ui`,
  quando a mudanca tocar Base Publica Local/preparo/consentimento
- `git diff --check`
- reviewer independente capaz antes de fechamento material

Review gate:

- resultado do worker deve ser candidato;
- judge deve conferir diff, checks e smokes;
- PR/material closeout exige reviewer independente capaz;
- coverage quantitativa (`pnpm test:coverage`, percentuais e ratchet) e apenas
  sinal de execucao, nao prova funcional completa;
- nenhuma fase material futura pode fechar apenas por cobertura percentual;
- `pnpm smoke:electron-ui` valida runtime real quando a fase toca funcao de app:
  app buildado, UI acionada, bridge/preload/IPC, RunLedger/retomada, historico
  local, XLSX autosave/check de arquivo, checkpoint e Base Publica Local/
  consentimento quando provider local;
- `pnpm smoke:visual` valida layout/responsividade/overlap, mas nao substitui
  smoke Electron;
- `pnpm smoke:real-csv` valida fluxo CSV/core/provider com fixture real, mas
  nao substitui Electron quando a fase toca funcao de app.

## Riscos residuais

- Esta janela nao leu codigo por desenho do packet docs-only; a recomendacao de
  owner window material se apoia nos receipts e docs canonicos.
- `docs/fiscal-desk/**` e ADRs foram copiados para esta worktree como contexto
  local/ignorado; o judge deve decidir versionamento se quiser que esses docs
  entrem na branch final.
- A matriz de release ainda depende de judge review e nao equivale a release,
  PR, deploy ou autoaprovacao.
- Receita Web continua assistida/experimental e sem smoke live deterministico.
- Coverage quantitativa e util, mas nao cobre sozinha comportamento Electron,
  visual ou CSV real.
- Receita Web live, Windows packaging, auto-update real, telemetria real,
  diagnostico gerado/enviado, licenca/account e release/package config seguem
  fora do primeiro release/fora do gate fechado sem owner window e smoke
  especificos.

## Stop conditions para proximo worker

- Qualquer necessidade de alterar IPC/preload, provider, export core,
  package/lockfile, release/update, telemetria, diagnostico, licenca/account,
  storage/network ou backend remoto.
- Qualquer promessa de templates/modelos reutilizaveis, PDF/Word/OCR, update
  real, telemetria real, diagnostico real, licenca real ou release sem owner
  window especifico.
- Smoke Electron/visual/CSV aplicavel nao executado nem justificado com blocker
  concreto.
- Tentativa de fechar fase material apenas com `pnpm test:coverage`,
  percentuais, ratchet ou testes unitarios, sem matriz qualitativa adequada a
  superficie alterada.

## Checks executados

- `git diff --check -- docs/fiscal-desk/first-release.md docs/fiscal-desk/status.md docs/fiscal-desk/roadmap.md docs/fiscal-desk/product-spec.md docs/fiscal-desk/implementation-plan.md docs/fiscal-desk/quality-gates.md docs/fiscal-desk/executor-packets/013-first-release-cut.md docs/goals/fiscal-desk-orchestration/results/first-release-rebaseline-2026-06-13.md`: pass, sem output.
- `rg -n "Wave 10|testing_infra|coverage|Base Pública Local|XLSX|RunLedger|F8B1|auto-update real|telemetria|diagnostico|licenca|templates|modelos" docs/fiscal-desk docs/goals/fiscal-desk-orchestration/results/first-release-rebaseline-2026-06-13.md`: pass, retornou ocorrencias esperadas para auditoria dos termos de rebaseline/bloqueio.
- `git status --short --branch --untracked-files=all`: pass; `## HEAD (no branch)` e apenas `?? docs/goals/fiscal-desk-orchestration/results/first-release-rebaseline-2026-06-13.md` visivel. Os docs copiados em `docs/fiscal-desk/**` permanecem contexto local/ignorado nesta worktree.

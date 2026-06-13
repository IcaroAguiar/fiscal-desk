# Post P3 Operational Panel Next Owner Window Selection

Data: 2026-06-13
Status: approved_scope_candidate

## Contexto

- Worktree: `/Users/icaroaguiar/.codex/worktrees/292b/consulta-simples-csv`
- HEAD observado: `7dd8599 docs: dispatch post panel owner selection`
- Branch/status observado: `## HEAD (no branch)`
- Commit minimo esperado: `7dd8599 docs: dispatch post panel owner selection`
- Resultado candidato apenas; precisa de decisao do judge/orquestrador antes de qualquer worker material.
- Sem implementacao de codigo, stage, commit, push, PR, deploy, tests/build/smokes/coverage ou side effects externos nesta selecao.

## Evidencias Lidas

- `AGENTS.md`
- `docs/goals/fiscal-desk-orchestration/goal.md`
- `docs/goals/fiscal-desk-orchestration/state.yaml`
- `docs/goals/fiscal-desk-orchestration/integration-plan.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-operational-panel-next-owner-window-selection-dispatch-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-operational-execution-panel-suggestions-integration-judge-decision-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-operational-execution-panel-suggestions-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-operational-execution-panel-suggestions-review-2026-06-13.md`
- `docs/qa/first-release-validation.md`
- `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/fiscal-desk/first-release.md` read-only, porque `docs/fiscal-desk/**` nao existe nesta worktree
- `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/fiscal-desk/status.md` read-only
- `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/fiscal-desk/product-spec.md` read-only
- `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/fiscal-desk/roadmap.md` read-only
- `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/fiscal-desk/implementation-plan.md` read-only
- `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/fiscal-desk/quality-gates.md` read-only
- Ocorrencias read-only de `uiResumeText`, `execution-resume`, `formatExecutionResume` e `"1 CNPJs retomados"` em `src/renderer/**`, `scripts/smoke-electron-ui.ts` e testes focados.

## Checks Read-Only Executados

| Check | Resultado |
|---|---|
| `git status --short --branch --untracked-files=all` | observado: `## HEAD (no branch)`, sem arquivos modificados/listados antes deste receipt |
| `git log -3 --oneline` | `7dd8599 docs: dispatch post panel owner selection`; `5bff1ce feat: integrate operational execution panel`; `756bd04 docs: record operational panel rework request` |
| `ls docs/goals/fiscal-desk-orchestration docs/goals/fiscal-desk-orchestration/results docs/fiscal-desk docs/qa` | `docs/fiscal-desk` ausente nesta worktree; demais docs/receipts pedidos presentes |
| `rg` proporcional para blocked/needs_rework/next owner/release/security/coverage/smokes/Base Publica/P3/CSV/Receita Web/update/diagnostico/telemetria/licenca/templates/PDF/Word/OCR/Excel/uiResumeText | confirmou fila material vazia, gates consumidos, bloqueios continuados e risco residual do slot legado |
| `rg -n "uiResumeText|execution-resume|CNPJs retomados|formatExecutionResume"` | confirmou que o plural legado fica em `formatExecutionResume`, `app-view-lists` e no harness `scripts/smoke-electron-ui.ts` |

## Owner Window Recomendado

Recomendo abrir exatamente um owner window material pequeno:

`post_p3_legacy_resume_copy_harness_polish`

Objetivo: corrigir somente o copy legado de retomada do slot `data-slot="execution-resume"` e alinhar o harness Electron que hoje espera `uiResumeText: "1 CNPJs retomados"`, preservando o painel operacional novo, sem alterar contratos, execucao, provider, entrega, ingestao ou release.

Classificacao: `material single-writer`.

Justificativa:

- O risco foi explicitamente deixado como residual aceito pelo worker, reviewer e judge do painel operacional.
- O novo painel ja usa singular correto; o gap restante esta no slot legado/smoke-bound e no harness.
- O recorte e menor e mais seguro do que Excel, entrega guiada/modelos, diagnostico, update/release ou qualquer fluxo com PDF/Word/OCR/Receita Web.
- O allowed write set pode ser fechado em poucos arquivos, sem tocar IPC, preload, main, core, providers, export/ingestion, package/lock ou docs fiscais local-only.

## Allowed Write Set Recomendado Para O Proximo Worker

Permitir somente:

- `src/renderer/ui/operational-copy.ts`
- `src/renderer/ui/app-view-lists.ts`
- `test/unit/renderer-operational-copy.test.ts`
- `test/unit/app-view.test.ts`
- `test/unit/app-sync.test.ts`
- `scripts/smoke-electron-ui.ts`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-legacy-resume-copy-harness-polish-2026-06-13.md`

Observacao de escopo: `src/renderer/ui/app-view.ts` e `src/renderer/ui/app-sync.ts` devem ser preferencialmente apenas consumidores do helper ja existente. Se o worker provar que nao precisa altera-los, melhor. Se encontrar necessidade concreta de altera-los, deve parar para judge ampliar allowed writes antes de editar.

## Do-Not-Touch

- `src/core/**`
- `src/main/**`
- `src/preload*`
- `src/renderer/styles.css`
- `src/renderer/ui/app.ts`
- `src/renderer/ui/app-provider.ts`
- `src/renderer/ui/app-history-view.ts`
- `src/core/simples/**`
- `src/core/public-base/**`
- `test/integration/**`
- `test/unit/process-csv*`
- `test/unit/preload.test.ts`
- `test/unit/main/**`
- `package.json`
- `pnpm-lock.yaml`
- `electron-builder.yml`
- `.github/**`
- `docs/fiscal-desk/**`
- `docs/qa/**`
- `docs/adr/**`
- `.visual-fidelity/**`
- release/public distribution, updater/update real, diagnostico gerado/enviado, telemetria, licenca/account, storage/network/backend remoto, templates/modelos reutilizaveis, PDF/Word/OCR reais e Receita Web live/massiva.

## Dependencias E Colisao De Boundaries

- Dependencia de produto: nenhuma nova; a correcao so normaliza copy ja exposta no renderer legado.
- Boundary renderer: permitido apenas no helper/copy local e lista legada; nao abrir nova superficie visual ampla.
- Boundary harness: `scripts/smoke-electron-ui.ts` precisa alinhar a assercao textual e o `uiResumeText` reportado.
- Sem colisao esperada com fila material, porque `state.yaml` e `integration-plan.md` apontam nenhum worker ativo apos a integracao do painel operacional.
- Nao ha dependencia de `docs/fiscal-desk/**` editavel; esses docs foram usados apenas como read-only para escopo.
- Se a correcao exigir alterar contrato de `UiState`, IPC/preload/main/core, RunLedger, provider, entrega ou ingestao, o worker deve parar como `blocked_scope_expansion_required`.

## Checks Obrigatorios Para O Proximo Worker

Minimos focados:

- `git status --short --branch --untracked-files=all`
- `pnpm exec vitest run test/unit/renderer-operational-copy.test.ts test/unit/app-view.test.ts test/unit/app-sync.test.ts`
- `pnpm smoke:electron-ui`
- `FISCAL_DESK_SMOKE_PROVIDER=base-publica-local pnpm smoke:electron-ui`, se o ambiente permitir; se sandbox bloquear pipe/tsx, rerodar fora do sandbox ou registrar blocker concreto
- `git diff --check -- src/renderer/ui/operational-copy.ts src/renderer/ui/app-view-lists.ts test/unit/renderer-operational-copy.test.ts test/unit/app-view.test.ts test/unit/app-sync.test.ts scripts/smoke-electron-ui.ts docs/goals/fiscal-desk-orchestration/results/post-p3-legacy-resume-copy-harness-polish-2026-06-13.md`

Gate material recomendado pelo pacote atual:

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm test:coverage`
- `pnpm build`
- `pnpm smoke:visual`
- `pnpm smoke:real-csv`
- `gitleaks detect --source . --redact --no-banner`
- `QUALITY_GATE_DIFF_MODE=worktree node docs/ai/quality-gate/check-ratchet.mjs`
- review independente antes de qualquer integracao pelo judge.

## Candidatos Avaliados E Decisao

| Candidato | Decisao |
|---|---|
| Polish/copy legado `uiResumeText: "1 CNPJs retomados"` e harness correspondente | recomendado como proximo owner window |
| Entrada Excel | adiar; produto marca como planejado/desabilitado e exige owner window de ingestao/validacao real |
| Entrega guiada/modelos sem templates amplos | adiar; risco de colidir com modelos/templates reutilizaveis bloqueados |
| Diagnostico local revisavel sem envio externo | adiar; requer gate de seguranca e contrato proprio, mesmo sem envio |
| Update/release apenas como scope review | adiar; release/security review historico ja foi consumido e update real/package seguem bloqueados |
| Manter bloqueado | nao recomendado, porque ha um recorte pequeno, seguro e util ja isolado por evidencias recentes |

## Riscos Residuais

- Mesmo pequeno, o recorte e material porque muda texto visivel e harness Electron; exige smoke Electron e review independente.
- Pode haver duplicidade de formatacao entre `formatExecutionResume` e `formatResumeLabel`; o worker deve reduzir divergencia apenas se isso ficar dentro do allowed write set, sem refatoracao ampla.
- `scripts/smoke-electron-ui.ts` e sensivel porque valida runtime real; qualquer mudanca deve ser textual/assertiva, sem enfraquecer a prova de retomada.
- `docs/fiscal-desk/**` ausente nesta worktree continua sendo local-only/ignored; nao copiar nem versionar no proximo worker salvo autorizacao explicita.

## Itens Que Seguem Bloqueados

- Release/public distribution, `dist`, publish, signing, notarization.
- Updater/update real, canal de release, assinatura e metadata.
- Diagnostico gerado/enviado ou transporte externo.
- Telemetria real.
- Licenca/account real.
- Storage/network/backend remoto.
- Templates UI, modelos reutilizaveis e modelos de entrega/execucao.
- PDF/Word/OCR reais.
- Receita Web live/massiva.
- Entrada Excel e entrega guiada/modelavel ate owner windows proprios.

## Recomendacao Ao Judge

Aceitar este receipt como `approved_scope_candidate` e, se quiser liberar trabalho material agora, despachar somente `post_p3_legacy_resume_copy_harness_polish` com o allowed write set acima. Nao liberar Excel, diagnostico, update/release, templates/modelos, PDF/Word/OCR ou Receita Web por esta selecao.

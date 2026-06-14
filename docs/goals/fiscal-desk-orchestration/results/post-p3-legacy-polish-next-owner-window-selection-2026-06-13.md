# Post P3 Legacy Polish Next Owner Window Selection

Data: 2026-06-13
Status: approved_scope_candidate

## Contexto

- Thread: scoping read-only, sem aprovacao de execucao material por si so.
- Repo canonico: `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv`
- Worktree desta selecao: `/Users/icaroaguiar/.codex/worktrees/2519/consulta-simples-csv`
- Branch/status observado: `## HEAD (no branch)`
- HEAD observado: `a2d43e9 docs: record post legacy owner dispatch commit`
- Branch final de integracao esperada: `feat/fiscal-desk-local-base-prep`
- Dispatch: `docs/goals/fiscal-desk-orchestration/results/post-p3-legacy-polish-next-owner-window-selection-dispatch-2026-06-13.md`

## Evidencias Lidas

- `AGENTS.md`
- `docs/goals/fiscal-desk-orchestration/goal.md`
- `docs/goals/fiscal-desk-orchestration/state.yaml`
- `docs/goals/fiscal-desk-orchestration/integration-plan.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-legacy-polish-next-owner-window-selection-dispatch-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-legacy-resume-copy-harness-polish-integration-judge-decision-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-legacy-resume-copy-harness-polish-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-legacy-resume-copy-harness-polish-review-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-operational-panel-next-owner-window-selection-judge-decision-2026-06-13.md`
- `docs/qa/first-release-validation.md`
- Copia canonica read-only de `docs/fiscal-desk/first-release.md`
- Copia canonica read-only de `docs/fiscal-desk/status.md`
- Copia canonica read-only de `docs/fiscal-desk/product-spec.md`
- Copia canonica read-only de `docs/fiscal-desk/roadmap.md`
- Copia canonica read-only de `docs/fiscal-desk/implementation-plan.md`
- Copia canonica read-only de `docs/fiscal-desk/quality-gates.md`
- Estrutura read-only de `src/core/ingestion/**`, `test/unit/fiscal-ingestion.test.ts` e buscas proporcionais por Excel/CSV/XLSX.

`docs/fiscal-desk/**` nao existe nesta worktree isolada; a copia canonica absoluta em `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/fiscal-desk/` foi usada somente para leitura, como autorizado pelo dispatch.

## Checks Read-Only Executados

| Check | Resultado |
|---|---|
| `git status --short --branch --untracked-files=all` | pass; `## HEAD (no branch)`, sem arquivos listados antes deste receipt |
| `git log -5 --oneline` | pass; HEAD `a2d43e9`, seguido por `c931a11`, `9946551`, `ff2299c`, `852b895` |
| `rg` proporcional nos docs/receipts obrigatorios para blockers, owner windows e superficies sensiveis | pass; confirmou polish legado integrado, fila material vazia e bloqueios persistentes para release/update real, diagnostico enviado, telemetria, licenca/account, templates amplos, PDF/Word/OCR e Receita Web live/massiva |
| `ls -la docs/fiscal-desk` | esperado ausente nesta worktree; fallback canonico read-only usado |
| Leituras read-only de `src/core/ingestion/**` e testes de ingestao | pass; `ingestion-contract.ts` hoje declara somente `CSV`, `fiscal-ingestion.ts` rejeita `xlsx` como formato indisponivel, e `exceljs` ja existe no projeto para escrita XLSX |

## Owner Window Recomendado

`post_p3_excel_input_core_ingestion_contract`

Classificacao: `material single-writer`.

Objetivo estreito: adicionar suporte inicial de ingestao Excel no core de ingestion, limitado a converter a primeira planilha/aba relevante para o mesmo lote fiscal ja produzido por `ingestFiscalCsv`, preservando deduplicacao, invalidos, erro de coluna CNPJ ausente e metadados de origem. Este recorte nao deve expor Excel como fluxo de UI/IPC/preload nem prometer disponibilidade final ao usuario.

Motivo: os docs fiscais dizem que Entrada Excel esta planejada, mas bloqueada ate owner window de ingestao e validacao real. O corte atual ja tem CSV e XLSX de saida integrados, release/security/P3 consumidos e nenhum worker material ativo. Uma fatia core-only de Excel e a menor unidade util para destravar a direcao de entrada sem colidir com renderer, IPC, delivery templates ou release.

## Allowed Write Set Recomendado Para O Proximo Worker

- `src/core/ingestion/ingestion-contract.ts`
- `src/core/ingestion/fiscal-ingestion.ts`
- `src/core/ingestion/xlsx-reader.ts`
- `test/unit/fiscal-ingestion.test.ts`
- `test/unit/xlsx-reader.test.ts`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-excel-input-core-ingestion-contract-2026-06-13.md`

Se o worker provar que `xlsx-reader.ts` nao e necessario, pode omitir esse arquivo. Se precisar alterar qualquer outro arquivo, deve parar e pedir ampliacao de escopo ao judge antes de editar.

## Do-Not-Touch

- `src/renderer/**`
- `src/main/**`
- `src/main/ipc/**`
- `src/main/preload.ts`
- `src/core/app/**`
- `src/core/export/**`
- `src/core/simples/**`
- `src/core/public-base/**`
- `test/integration/**`
- `scripts/**`
- `package.json`
- `pnpm-lock.yaml`
- `electron-builder.yml`
- `.github/**`
- `docs/fiscal-desk/**`
- `docs/qa/**`
- `docs/adr/**`
- `.visual-fidelity/**`
- release/update, diagnostico, telemetria, licenca/account, storage/network/backend remoto, templates/modelos reutilizaveis, PDF/Word/OCR e Receita Web live/massiva.

## Dependencias E Colisao De Boundaries

- Owner unico: `src/core/ingestion/**`.
- Sem colisao com renderer/IPC/preload porque a janela nao deve expor selecao Excel no app.
- Sem colisao com export/delivery porque XLSX de saida ja existe e nao deve ser alterado.
- Sem package/lock porque `exceljs` ja esta presente no projeto para escrita XLSX; se o worker descobrir que a leitura exige dependencia nova, deve parar.
- Sem Receita Web/Base Publica Local/provider porque o recorte termina antes de lookup.
- Sem release/security/update porque nao toca distribuicao nem metadados de build.

## Checks Obrigatorios Para O Proximo Worker

Minimos antes de `ready_for_judge_review`:

- `git status --short --branch --untracked-files=all`
- `pnpm exec vitest run test/unit/fiscal-ingestion.test.ts test/unit/xlsx-reader.test.ts test/unit/fiscal-desk-phase-6-contracts.test.ts`
- `pnpm test`
- `pnpm test:coverage`
- `pnpm lint`
- `pnpm typecheck`
- `QUALITY_GATE_DIFF_MODE=worktree node docs/ai/quality-gate/check-ratchet.mjs`
- `git diff --check`

Nao exigir `pnpm smoke:electron-ui`, `pnpm smoke:visual`, `pnpm smoke:real-csv` ou `pnpm build` para esta fatia core-only se o diff ficar estritamente em ingestion/testes unitarios e sem runtime Electron. Se o worker tocar qualquer runtime, IPC, renderer, CSV end-to-end ou scripts, deve parar por escopo invalido em vez de ampliar os checks por conta propria.

Review independente e obrigatorio antes de qualquer integracao porque e mudanca material de core/ingestion.

## Riscos Residuais

- O recorte nao torna Excel disponivel no app; ele apenas prepara o contrato/core para uma janela posterior de UI/IPC/runtime.
- Leitura de planilhas pode ter variacoes reais de aba, celulas vazias, cabecalhos mesclados ou formatos nao textuais; o worker deve manter regra simples e documentar limites no receipt.
- Se `exceljs` nao suportar a leitura necessaria sem nova dependencia ou sem mexer em package/lock, a janela deve virar `blocked` no worker.
- Coverage continua sinal auxiliar; o aceite deve depender dos testes focados do contrato de ingestao.

## Itens Que Seguem Bloqueados

- Expor Excel no renderer, file picker, IPC, preload ou fluxo Electron.
- Entrega guiada/modelos/templates reutilizaveis.
- Diagnostico gerado ou enviado.
- Telemetria.
- Licenca/account.
- Update/release/dist/publish/signing/notarization.
- Storage/network/backend remoto.
- PDF/Word/OCR reais.
- Receita Web live/massiva.
- Qualquer mudanca em provider, Base Publica Local, export/delivery, processCsv runtime, scripts de smoke ou docs fiscais/QA.

## Recomendacao Ao Judge

Aceitar este receipt como candidato de escopo e, se concordar, despachar uma thread material isolada para `post_p3_excel_input_core_ingestion_contract` com modelo `gpt-5.5`, reasoning `medium`, allowed write set acima, checks focados de ingestion e review independente. Esta selecao nao autoaprova execucao.

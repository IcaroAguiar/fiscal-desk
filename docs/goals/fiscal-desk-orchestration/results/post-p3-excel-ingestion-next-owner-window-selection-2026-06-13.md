# Post P3 Excel Ingestion Next Owner Window Selection

Data: 2026-06-13
Status: approved_scope_candidate

## HEAD Observado

- `81389d1d297b71c5c05d612b613b21309ea60344`
- `81389d1 docs: dispatch post excel owner selection`
- Worktree: `/Users/icaroaguiar/.codex/worktrees/0ed9/consulta-simples-csv`
- Status observado: `## HEAD (no branch)`, sem alteracoes antes deste receipt.

## Evidencias Lidas

- `AGENTS.md`
- `docs/goals/fiscal-desk-orchestration/goal.md`
- `docs/goals/fiscal-desk-orchestration/state.yaml`
- `docs/goals/fiscal-desk-orchestration/integration-plan.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-excel-ingestion-next-owner-window-selection-dispatch-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-excel-input-core-ingestion-contract-integration-judge-decision-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-excel-input-core-ingestion-contract-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-excel-input-core-ingestion-contract-review-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-legacy-polish-next-owner-window-selection-judge-decision-2026-06-13.md`
- `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/fiscal-desk/first-release.md`
- `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/fiscal-desk/status.md`
- `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/fiscal-desk/product-spec.md`
- `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/fiscal-desk/roadmap.md`
- `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/fiscal-desk/implementation-plan.md`
- `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/fiscal-desk/quality-gates.md`
- `docs/qa/first-release-validation.md`
- Leitura read-only adicional para confrontar boundaries reais:
  - `src/core/app/process-csv.use-case.ts`
  - `src/core/app/process-csv.types.ts`
  - `src/main/ipc/process-csv.ipc.ts`
  - `src/main/preload.ts`
  - `src/main/types.ts`
  - `src/renderer/ui/app.types.ts`
  - `src/renderer/ui/app.ts`
  - `test/unit/process-csv.ipc.delivery.test.ts`

`docs/fiscal-desk/**` nao estava presente nesta worktree local. Usei a copia
canonica absoluta somente para leitura, conforme autorizado pelo dispatch.

## Owner Window Recomendado

`post_p3_excel_input_runtime_exposure`

Classificacao: `material single-writer`.

Escopo recomendado: expor a entrada Excel/XLSX ja integrada no core para o
fluxo real do app Electron, em uma unica janela que possua o boundary de input
runtime de ponta a ponta: contrato de formato de entrada, `processCsv`, picker
de arquivo, IPC/preload, leitura de arquivo, ledger/fingerprint de execucao e
consumo minimo do renderer.

Esta janela deve transformar Excel de "core-only" para "entrada disponivel no
app" somente se conseguir provar o caminho real com smoke Electron. Ela nao deve
abrir entrega guiada, templates, diagnostico, update, release, licenca, PDF,
Word, OCR, Receita Web live ou qualquer provider novo.

## Justificativa

- A integracao Excel anterior fechou somente o core: `ingestFiscalXlsx`,
  `readXlsx` e testes unitarios proporcionais estao integrados e validados.
- O judge registrou explicitamente que XLSX ainda precisa decidir UI, IPC,
  preload, runtime Electron, file picker e prova real antes de expor ao usuario.
- O runtime atual ainda seleciona apenas CSV no dialog e le arquivo como UTF-8;
  `processCsv` ainda recebe `inputCsv: string` e usa `readCsv`/`ingestFiscalCsv`.
- Os docs de primeira release e produto tratavam Entrada Excel como planejada ou
  desabilitada ate haver ingestao e validacao real. Depois do core, o proximo
  passo util e validar a superficie real sem saltar para formatos maiores.
- F6E2C ja foi aceito no-code para selecao CSV/XLSX de entrega; isso nao cobre
  entrada XLSX. Reabrir F6E2C, release/security review, P3 renderer ou hardening
  CSV seria repetir gate historico consumido.

## Allowed Write Set Recomendado Para O Proximo Worker

O allowed write set deve ser fechado e exclusivo:

- `src/core/app/process-csv.types.ts`
- `src/core/app/process-csv.use-case.ts`
- `src/main/ipc/process-csv.ipc.ts`
- `src/main/preload.ts`
- `src/main/types.ts`
- `src/renderer/ui/app.types.ts`
- `src/renderer/ui/app.ts`
- `src/renderer/ui/app-view.ts`
- `src/renderer/ui/operational-copy.ts`
- `src/renderer/ui/app-helpers.ts`
- `test/integration/process-csv.use-case.test.ts`
- `test/unit/process-csv-contracts.test.ts`
- `test/unit/process-csv.ipc.delivery.test.ts`
- `test/unit/app-view.test.ts`
- `test/unit/app-helpers.test.ts`
- `test/unit/renderer-operational-copy.test.ts`
- `test/fixtures/smoke/cnpjs-publicos-reais.xlsx`
- `docs/goals/fiscal-desk-orchestration/results/post-p3-excel-input-runtime-exposure-2026-06-13.md`

Se o worker provar, antes de editar, que algum arquivo acima nao e necessario,
ele pode deixa-lo intocado. Se precisar de qualquer arquivo fora desta lista,
deve parar como `blocked_scope_expansion_required` e pedir novo julgamento.

## Do-Not-Touch

- `src/core/ingestion/**`, exceto se o judge decidir explicitamente reabrir o
  contrato core ja integrado.
- `src/core/export/**`
- `src/core/simples/**`
- `src/core/public-base/**`
- `src/main/execution/**`, exceto se o judge incluir ledger/fingerprint no
  allowed write set final.
- `src/main/main.ts`
- `src/main/ipc/local-public-base.ipc.ts`
- `test/unit/fiscal-ingestion.test.ts`
- `test/unit/xlsx-reader.test.ts`
- `test/unit/local-public-base.test.ts`
- `test/integration/**`, exceto o teste de `process-csv.use-case` listado no
  allowlist.
- `scripts/**`
- `package.json`
- `pnpm-lock.yaml`
- `electron-builder.yml`
- `.github/**`
- `docs/fiscal-desk/**`
- `docs/qa/**`
- `docs/adr/**`
- `.visual-fidelity/**`
- `dist/**`
- `dist-electron/**`

## Dependencias E Colisoes De Boundaries

- Boundary compartilhado principal: input runtime entre core app, main IPC,
  preload e renderer. Deve haver um unico worker; nao paralelizar UI, IPC e
  runtime em threads diferentes para esta exposicao.
- A janela depende do core Excel ja integrado em
  `post_p3_excel_input_core_ingestion_contract`.
- A janela nao depende de update/release, diagnostico, telemetria,
  licenca/account, storage/network, templates, PDF/Word/OCR ou Receita Web.
- Se a retomada por ledger exigir registrar formato de entrada no fingerprint
  para evitar resumir XLSX como CSV, o judge deve decidir se inclui
  `src/main/execution/file-process-execution-ledger.ts` e seus testes no
  allowlist. Sem isso, o worker deve bloquear em vez de fazer um patch parcial.
- Auto-save de saida XLSX ja existe para delivery; nao usar essa janela para
  alterar formatos de entrega ou modelos reutilizaveis.

## Checks Obrigatorios Para O Proximo Worker

Antes de entregar ao judge:

- `git status --short --branch --untracked-files=all`
- teste focado de core/app/IPC/renderer tocado, incluindo ao menos:
  - `pnpm exec vitest run test/integration/process-csv.use-case.test.ts test/unit/process-csv-contracts.test.ts test/unit/process-csv.ipc.delivery.test.ts test/unit/app-view.test.ts test/unit/app-helpers.test.ts test/unit/renderer-operational-copy.test.ts`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm test:coverage`
- `QUALITY_GATE_DIFF_MODE=worktree node docs/ai/quality-gate/check-ratchet.mjs`
- `pnpm build`
- `pnpm smoke:electron-ui` com prova de selecionar/processar entrada XLSX no
  app real, provider `mock`, ledger/checkpoint e output salvo.
- `FISCAL_DESK_SMOKE_PROVIDER=base-publica-local pnpm smoke:electron-ui` se o
  fluxo alterado tambem passar pelo provider local ou pelo aviso de Data da Base.
- `pnpm smoke:visual` se houver qualquer copy/layout/estado visivel alterado.
- `git diff --check`
- Review independente obrigatorio antes de integracao.

## Riscos Residuais

- A heuristica XLSX permanece simples: primeira worksheet nao vazia e primeira
  linha nao vazia como header. Planilhas reais com preambulo, header mesclado
  ou multiplas tabelas podem precisar de refinamento posterior.
- CNPJs numericos sem zeros a esquerda podem permanecer ambigueis quando o
  arquivo Excel ja perdeu a informacao original.
- A janela pode descobrir que resume/fingerprint precisa de formato de entrada.
  Se isso tocar `src/main/execution/**`, o allowlist deve ser revisado pelo
  judge antes de qualquer patch.
- Coverage continua sendo sinal auxiliar; a aceitacao depende de smoke Electron
  real e review independente.

## Itens Que Seguem Bloqueados

- Release publico, dist, publish, signing, notarization e updater/update real.
- Diagnostico gerado ou enviado.
- Telemetria real.
- Licenca/account real.
- Storage/network/backend remoto.
- Templates/modelos reutilizaveis.
- Entrega guiada ampla ou Excel formatado/modelavel novo.
- PDF/Word/OCR reais.
- Receita Web live/massiva.
- Qualquer dependencia nova ou mudanca em `package.json`/`pnpm-lock.yaml`.

## Recomendacao Ao Judge

Aceitar este candidato somente como selecao de escopo e preparar um dispatch
material single-writer para `post_p3_excel_input_runtime_exposure`. O dispatch
deve decidir explicitamente se ledger/fingerprint entra no allowlist; se entrar,
inclua os testes correspondentes. Nao liberar workers paralelos em UI, IPC ou
runtime para entrada Excel.

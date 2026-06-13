# Post Local Base Regate Material Owner Window Selection

Data: 2026-06-13
Thread fonte/orquestrador: `019ebe5c-3853-79c2-87ad-8ddace386c93`
Worktree: `/Users/icaroaguiar/.codex/worktrees/daed/consulta-simples-csv`
Status: `approved_scope_candidate`

## Classificacao

Gate read-only/docs-only para selecionar a proxima owner window material segura.
Nao implementa codigo, nao altera testes/config/release, nao roda testes,
build, install, release, deploy, publish, update, telemetria, dist ou smokes,
nao faz stage/commit/push/PR e nao se autoaprova como judge.

## Estado Git

- `git status --short --branch --untracked-files=all`: `## HEAD (no branch)`.
  Estado classificado como detached limpo, sem arquivos rastreados modificados
  ou untracked reportados antes deste receipt.
- `git log -1 --oneline`: `9c246b8 docs: close post-regate status rebaseline`.
  HEAD corresponde ao commit minimo esperado.

## Arquivos lidos

- `AGENTS.md`
- `docs/goals/fiscal-desk-orchestration/goal.md`
- `docs/goals/fiscal-desk-orchestration/state.yaml`
- `docs/goals/fiscal-desk-orchestration/integration-plan.md`
- `docs/goals/fiscal-desk-orchestration/results/post-local-base-regate-first-release-status-rebaseline-judge-decision-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-local-base-regate-first-release-status-rebaseline-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/first-release-post-local-base-rework-security-regate-judge-decision-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/first-release-post-rework-release-review-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/first-release-post-rework-security-review-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/integration-wave-13-f8b1-renderer-blocked-state.md`
- `docs/goals/fiscal-desk-orchestration/results/testing-infra-coverage-gate-post-commit-2026-06-13.md`
- `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/fiscal-desk/first-release.md`
- `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/fiscal-desk/status.md`
- `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/fiscal-desk/quality-gates.md`
- `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/fiscal-desk/product-spec.md`
- `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/fiscal-desk/implementation-plan.md`
- `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/fiscal-desk/roadmap.md`
- `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/fiscal-desk/executor-packets/008-input-intake-cnpj-extraction.md`

`docs/fiscal-desk/**` nao existe nesta worktree; conforme a instrucao do gate,
li a copia canonica absoluta em
`/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/fiscal-desk/...`.
Nada foi copiado ou editado desses docs locais.

## Scans executados

- `rg -n "TODO|blocked|owner window|next|update|diagnostico|telemetria|licenca|templates|PDF|Word|OCR|Receita Web|Base Publica|F8B|F6E|release" /Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/fiscal-desk docs/goals/fiscal-desk-orchestration/results docs/goals/fiscal-desk-orchestration/state.yaml docs/goals/fiscal-desk-orchestration/integration-plan.md`
- `rg -n "Entrada Excel|Excel|XLSX|CSV|planejada|desabilitada|proximo|owner window|material|bloquead|futuro|Saida personalizada|modelo|template|PDF|Word|OCR" ...`
- `rg -n "Excel|XLSX|entrada|input|CSV|PDF|Word|OCR|template|modelo|diagnostico|telemetria|update|licenca|Receita Web|Base Publica" /Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/fiscal-desk/executor-packets`
- `rg -n "recommended_next|next_candidate|next_material|selected_next|blocked_until_fresh|owner window|F6E2C|F8B|F6E|Excel|XLSX|template|modelo|PDF|Word|OCR" docs/goals/fiscal-desk-orchestration/state.yaml docs/goals/fiscal-desk-orchestration/integration-plan.md ...`

Leitura do scan: release/security review, reworks pos-review,
`testing_infra_coverage_gate`, Wave 13/F8B1, F6E2C e re-gate Base Publica Local
estao consumidos/fechados. A fila material esta vazia. Continuam bloqueados ate
owner windows proprios: update real, diagnostico gerado/enviado, telemetria,
licenca/account, release/package config, storage/network, templates/modelos
reutilizaveis, PDF/Word/OCR e Receita Web live/massiva.

## Recomendacao de owner window material

Recomendo exatamente uma proxima owner window material:

`post_local_base_regate_csv_input_intake_hardening`

Objetivo: fortalecer a entrada CSV/CNPJ existente e a comunicacao de erros de
entrada, preservando o fluxo CSV atual e preparando o contrato de ingestao para
formatos futuros sem implementar Excel, PDF, Word ou OCR. O foco material e
qualidade do caminho ja suportado: deteccao de coluna, normalizacao/validacao
de CNPJ, duplicados, mensagens acionaveis e estados de UI para entrada
invalida.

Racional:

- O primeiro release ja tem CSV funcional, XLSX de saida atual, RunLedger,
  Base Publica Local e estados bloqueados F8B1 integrados/validados.
- F6E2C foi fechado no-code; nao ha gap atual de selecao CSV/XLSX de entrega.
- Product docs ainda indicam `Entrada Excel` apenas como planejada/desabilitada
  e exigem owner window de ingestao/validacao real antes de qualquer promessa.
- `executor-packets/008-input-intake-cnpj-extraction.md` e o candidato mais
  isolavel sem entrar nos bloqueios de PDF/Word/OCR, templates, update,
  diagnostico, telemetria, licenca, release/package, storage/network ou Receita
  Web live/massiva.
- A janela pode entregar valor material no caminho existente sem adicionar
  dependencia de Excel/PDF/OCR e sem tocar providers/adapters.

## Allowed writes propostos

- `src/core/ingestion/**`
- `src/core/cnpj/**`
- `src/core/app/process-csv.types.ts`
- `src/core/app/process-csv.use-case.ts`
- `src/main/ipc/process-csv.ipc.ts`
- `src/main/preload.ts`
- `src/main/types.ts`
- `src/renderer/ui/**`
- `test/unit/*csv*.test.ts`
- `test/unit/*cnpj*.test.ts`
- `test/unit/detect-cnpj-column.test.ts`
- `test/unit/validate-cnpj.test.ts`
- `test/unit/normalize-cnpj.test.ts`
- `test/integration/process-csv*.test.ts`
- `docs/goals/fiscal-desk-orchestration/results/post-local-base-regate-csv-input-intake-hardening-2026-06-13.md`

Se a auditoria inicial do worker provar que parte do allowed write nao e
necessaria, o worker deve reduzir o diff e registrar o motivo. Se a mudanca
exigir dependencia nova, `package.json` ou `pnpm-lock.yaml`, parar como
`blocked` e devolver ao judge; esta selecao nao autoriza dependency/package
work.

## Do-not-touch proposto

- `src/core/simples/adapters/**`
- `src/core/export/**`, salvo ajuste minimo de tipo ja coberto por
  `src/core/app/process-csv.types.ts` e explicitamente justificado no receipt
- `package.json`
- `pnpm-lock.yaml`
- `electron-builder.yml`
- `.github/**`
- `docs/adr/**`
- `docs/fiscal-desk/**`
- `docs/goals/fiscal-desk-orchestration/state.yaml`
- `docs/goals/fiscal-desk-orchestration/integration-plan.md`
- release/package config, updater, telemetry, diagnostics, license/account,
  storage/network, templates, reusable models, PDF/Word/OCR, Receita Web
  live/massive automation

## Checks obrigatorios propostos

- `git status --short --branch --untracked-files=all` inicial e final.
- Leitura obrigatoria de `AGENTS.md`, `CONTEXT.md`, docs locais canonicos
  relevantes, ADRs 0014/0015/0016 e packet 008.
- Auditoria inicial no codigo para confirmar se ha gap real. Se o caminho atual
  ja satisfizer o objetivo, retornar `no_code_ready_for_judge_review` com
  evidencia, sem editar codigo.
- `pnpm test -- test/unit/detect-cnpj-column.test.ts`
- `pnpm test -- test/unit/validate-cnpj.test.ts`
- `pnpm test -- test/unit/normalize-cnpj.test.ts`
- `pnpm test -- test/integration/process-csv.use-case.test.ts`
- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`
- `pnpm build`, se a janela tocar preload/main/renderer ou tipos publicos
  usados pelo Electron.
- `pnpm smoke:real-csv` com provider `mock`, cobrindo CSV valido, CSV sem
  coluna detectavel e CSV com duplicados quando o harness permitir.
- `pnpm smoke:electron-ui`, obrigatorio porque o owner window pode tocar funcao
  de app Electron, renderer/preload/IPC ou fluxo de execucao.
- `pnpm smoke:visual`, se tocar renderer/copy/estados visiveis.
- `git diff --check`.
- Review independente requerido para qualquer diff material de codigo/teste/UI.

`FISCAL_DESK_SMOKE_PROVIDER=base-publica-local pnpm smoke:electron-ui` nao e
obrigatorio por default para esta janela porque o escopo proposto nao toca
Base Publica Local, preparo ou consentimento. Se o worker tocar qualquer
superficie de Base Publica Local por necessidade real, deve parar e pedir novo
scope ou incluir esse smoke como obrigatorio, conforme decisao do judge.

## Stop conditions

- Necessidade de implementar entrada Excel real, PDF, Word ou OCR.
- Necessidade de adicionar dependencia, alterar `package.json` ou lockfile.
- Necessidade de tocar provider adapters, provider factory, fallback, Receita
  Web, Base Publica Local, exportadores, release/update, diagnostico,
  telemetria, licenca/account, storage/network, templates ou modelos
  reutilizaveis.
- Qualquer tentativa de tratar coverage percentual, ratchet ou numero de testes
  como prova funcional suficiente sem smoke Electron/CSV aplicavel.
- Worktree suja fora do allowed write set que impeça atribuir o diff com
  seguranca.

## Boundary collision

Esta janela toca potencialmente `process_csv_contracts`, `ipc_contracts`,
`preload_bridge` e `renderer_shell`. Por isso deve ser single-writer: nao rodar
em paralelo com qualquer janela de renderer, IPC/preload, entrega/export,
provider, Base Publica Local, F8/update/diagnostico, release/package ou
templates/modelos. Nao toca `provider_types`, `export_types`,
`receita_web_adapter_contract` nem `styles_css` salvo se o judge reabrir scope.

## Riscos residuais

- O packet 008 e antigo; o worker precisa auditar o codigo atual antes de
  alterar para evitar duplicar comportamento ja integrado.
- A superficie pode cruzar core, IPC/preload e renderer; por isso o allowed
  write e amplo dentro do caminho de entrada, mas a execucao deve reduzir o diff
  ao minimo necessario.
- Sem dependencia nova, esta janela nao deve entregar entrada Excel real; deve
  manter Excel/PDF/Word/OCR como planejados/desabilitados.
- Coverage quantitativa permanece sinal auxiliar, nao prova funcional.

## Recomendacao ao judge

Aceitar este receipt como `approved_scope_candidate` e, se concordar com a
selecao, abrir uma nova thread material independente para
`post_local_base_regate_csv_input_intake_hardening` com os allowed writes,
do-not-touch, stop conditions, smokes e reviewer independente acima.

Nao liberar implementacao direta nesta thread.

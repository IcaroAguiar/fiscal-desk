# Post CSV Input Intake Next Owner Window Selection

Data: 2026-06-13
Thread fonte/orquestrador: `019ebe5c-3853-79c2-87ad-8ddace386c93`
Worktree: `/Users/icaroaguiar/.codex/worktrees/fc09/consulta-simples-csv`
Status: `approved_scope_candidate`

## Classificacao

Selecao read-only/docs-only da proxima owner window apos a integracao validada
de `post_local_base_regate_csv_input_intake_hardening`.

Esta thread nao implementou codigo, nao alterou testes, nao editou package,
lockfile, config, release, CI, `docs/fiscal-desk/**`, `state.yaml` ou
`integration-plan.md`. O unico arquivo escrito foi este receipt.

## Evidencia lida

- `docs/goals/fiscal-desk-orchestration/state.yaml`
- `docs/goals/fiscal-desk-orchestration/integration-plan.md`
- `docs/goals/fiscal-desk-orchestration/results/post-local-base-regate-csv-input-intake-hardening-integration-judge-decision-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-local-base-regate-csv-input-intake-hardening-review-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-local-base-regate-csv-input-intake-hardening-review-after-rework-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-local-base-regate-csv-input-intake-hardening-judge-decision-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-local-base-regate-material-owner-window-selection-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-local-base-regate-material-owner-window-selection-judge-decision-2026-06-13.md`
- `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/goals/fiscal-desk-orchestration/results/post-csv-input-intake-next-owner-window-selection-dispatch-2026-06-13.md`
- `src/renderer/ui/app-helpers.ts`
- `test/unit/app-helpers.test.ts`
- `git status --short --branch --untracked-files=all`: `## HEAD (no branch)`
- `git log -1 --oneline`: `cd544e7 feat: harden csv cnpj intake messages`

Limitacao registrada: o dispatch abaixo nao existe nesta worktree porque foi
versionado na branch canonica apos o spawn desta worktree, no commit
`8f2c9d0 docs: dispatch next owner window selection`. Li a copia canonica
absoluta indicada pela coordenacao do judge e mantive o allowed write unico
deste resultado local.

- `docs/goals/fiscal-desk-orchestration/results/post-csv-input-intake-next-owner-window-selection-dispatch-2026-06-13.md`

`docs/fiscal-desk/**` tambem nao existe nesta worktree. Isso nao bloqueia esta
selecao porque o pedido autorizou usar o pacote versionado `docs/goals/**` como
canonico quando esses docs locais estiverem ausentes. A ausencia limita apenas
checagem de produto local mais ampla, nao a confianca sobre o P3 residual
registrado no pacote de orquestracao.

## Estado da fila

- Branch canonica de integracao conforme docs: `feat/fiscal-desk-local-base-prep`.
- HEAD desta worktree: `cd544e7`, igual ao commit minimo canonico informado.
- `post_local_base_regate_csv_input_intake_hardening`: integrado e validado em
  `2026-06-13 17:20:37 -03`.
- Fila aprovada: nenhuma pendente apos Wave 13 e apos o hardening de intake CSV.
- Fila ativa material: nenhuma.
- Proxima acao registrada em `state.yaml`: selecionar nova owner window apos o
  hardening de intake CSV e manter update runtime, pacote diagnostico,
  telemetria, licenca/account, release/package, storage/network, entrega guiada,
  renderer template UI e reusable delivery models bloqueados ate escopo fresco.
- Risco residual explicito carregado pelo judge: `p3_renderer_missing_column_normalizer_can_hide_new_core_guidance`.

## Recomendacao

Recomendo exatamente uma proxima owner window:

`p3_renderer_missing_column_normalizer_can_hide_new_core_guidance`

Status recomendado para o judge: `approved_scope_candidate`.

Essa e a janela segura porque:

- e o unico risco residual material explicitamente aceito na integracao do
  hardening de intake CSV;
- e menor que reabrir core, ingestao, IPC, preload ou provider;
- corrige o desalinhamento entre a mensagem nova do core para coluna ausente e
  a normalizacao antiga do renderer;
- nao depende de `docs/fiscal-desk/**`, package, lockfile, release, CI,
  Receita Web, Base Publica Local, export ou formatos futuros.

## Problema

O core passou a emitir orientacao mais completa quando nao encontra coluna de
CNPJ, incluindo cabecalhos como `CPF/CNPJ` e a opcao de informar a coluna
manualmente. O renderer ainda intercepta mensagens que contem
`Nenhuma coluna de CNPJ suportada foi encontrada` em
`src/renderer/ui/app-helpers.ts` e substitui por uma copy antiga:

`Não foi encontrada uma coluna de CNPJ compatível. Use uma coluna como cnpj, CNPJ, documento, cpf_cnpj ou cnpj_empresa.`

Com isso, a UI Electron pode esconder parte da orientacao nova do core. O
risco foi classificado como P3, nao piora o estado anterior e nao bloqueou a
integracao anterior, mas agora e o proximo recorte mais estreito e comprovado.

## Allowed write set

Para o worker material, autorizar somente:

- `src/renderer/ui/app-helpers.ts`
- `test/unit/app-helpers.test.ts`
- `docs/goals/fiscal-desk-orchestration/results/p3-renderer-missing-column-normalizer-can-hide-new-core-guidance-2026-06-13.md`

Se a auditoria inicial provar que outro teste renderer ja cobre melhor esta
funcao, o worker deve parar como `blocked_allowed_write_scope_insufficient` e
pedir ampliacao ao judge, em vez de editar arquivo fora desta lista.

## Do-not-touch

- `src/core/**`
- `src/main/**`
- `src/preload/**`, se existir
- `src/core/simples/**`
- `src/core/export/**`
- `src/core/public-base/**`
- `src/renderer/ui/app-view.ts`
- `src/renderer/ui/app-sync.ts`
- `src/renderer/ui/app.types.ts`
- `src/renderer/ui/operational-copy.ts`
- `src/renderer/styles.css`
- `test/integration/**`
- qualquer `test/unit/**` exceto `test/unit/app-helpers.test.ts`
- `package.json`
- `pnpm-lock.yaml`
- `electron-builder.yml`
- `.github/**`
- `docs/fiscal-desk/**`
- `docs/adr/**`
- `docs/goals/fiscal-desk-orchestration/state.yaml`
- `docs/goals/fiscal-desk-orchestration/integration-plan.md`
- release/package config, updater/update real, diagnostico gerado/enviado,
  telemetria, licenca/account, storage/network, templates/modelos
  reutilizaveis, PDF/Word/OCR, Receita Web live/massiva, Base Publica Local,
  preparo ou consentimento.

## Boundaries compartilhadas

Boundary tocada:

- `renderer_shell`, de forma estreita, apenas pela normalizacao de mensagem de
  erro em `app-helpers.ts`.

Boundaries que nao devem ser tocadas:

- `process_csv_contracts`
- `ipc_contracts`
- `preload_bridge`
- `provider_types`
- `export_types`
- `styles_css`
- `receita_web_adapter_contract`

Enquanto esta janela estiver ativa, nao rodar em paralelo com outro worker que
toque renderer/copy/layout, fluxo Electron de processamento ou mensagens de
entrada CSV.

## Dependencias e colisao

Dependencias:

- Base canonica `feat/fiscal-desk-local-base-prep` em `cd544e7` ou commit mais
  novo que mantenha a integracao validada do hardening de intake CSV.
- O worker deve ler o receipt de integracao e os dois receipts de review do
  hardening antes de editar.

Colisoes evitadas:

- Nao reabrir o owner window anterior de ingestao/core.
- Nao alterar a mensagem emitida pelo core.
- Nao tocar IPC/preload para transportar novo contrato.
- Nao mexer em copy operacional geral ou layout.
- Nao usar esta janela para fazer entrada Excel, PDF, Word, OCR, templates,
  diagnostico, telemetria, update, licenca ou release.

## Plano de verificacao

Checks minimos do worker:

- `git status --short --branch --untracked-files=all` inicial e final.
- Auditoria inicial de `src/renderer/ui/app-helpers.ts` e
  `test/unit/app-helpers.test.ts`.
- Teste novo ou ajustado que prove que `extractMessage` preserva a orientacao
  nova/completa de coluna CNPJ ausente vinda do core, inclusive quando a
  mensagem estiver embrulhada por `Error invoking remote method`.
- Testes de regressao existentes de XLSX enviado como CSV, CSV malformado,
  delimitador ambiguo, mensagens portuguesas amigaveis e fallback desconhecido
  devem continuar passando.
- `pnpm exec vitest run test/unit/app-helpers.test.ts`
- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`
- `git diff --check`
- `pnpm smoke:visual`, porque a janela altera mensagem exibida no renderer.

`pnpm smoke:electron-ui` nao e obrigatorio por default se a mudanca ficar
limitada a normalizacao pura de mensagem e teste unitario. Se o worker tocar
fluxo de app, seletores, sincronizacao, IPC/preload ou estado visivel alem da
mensagem normalizada, deve parar e pedir ampliacao ou incluir smoke Electron UI
por decisao do judge.

## Review independente

Review independente e obrigatorio para qualquer diff material, mesmo sendo P3,
porque altera copy exibida na UI Electron. O reviewer deve confirmar:

- diff dentro do allowed write set;
- a mensagem nova do core nao e truncada pela normalizacao antiga;
- as mensagens antigas de CSV/XLSX continuam amigaveis;
- nenhuma superficie proibida foi tocada;
- `pnpm smoke:visual` foi executado ou o bloqueio foi explicitado com risco
  residual para o judge.

## Riscos residuais

- A verificacao visual pode nao reproduzir facilmente a tela de erro de coluna
  ausente se o smoke atual nao tiver fixture para esse caminho; nesse caso, o
  teste unitario de `extractMessage` vira prova primaria e o smoke visual prova
  ausencia de regressao geral.
- A janela nao corrige nem altera mensagens emitidas pelo core; se a copy do
  core estiver incorreta em commit futuro, esta janela deve parar.
- Se a correcao exigir helper/copy compartilhado em outro arquivo renderer, o
  allowed write set atual e propositalmente insuficiente; o worker deve voltar
  ao judge.

## Stop conditions

- Necessidade de tocar qualquer arquivo fora do allowed write set.
- Necessidade de alterar core, IPC, preload, provider, export, Base Publica
  Local, Receita Web, release, package, lockfile, CI ou docs locais.
- Necessidade de mudar contrato publico de erro em vez de apenas alinhar a
  normalizacao do renderer.
- Worktree suja fora do allowed write set que impeça atribuir o diff com
  seguranca.
- Falha repetida duas vezes com a mesma assinatura em teste, typecheck, lint ou
  smoke visual sem diagnostico novo.

## Prompt pronto para worker material

```text
/goal Execute the material owner window `p3_renderer_missing_column_normalizer_can_hide_new_core_guidance` for Fiscal Desk using model `gpt-5.5` and reasoning `medium`.

You are running as an independent Codex App thread/worktree. The current thread is the judge/orchestrator and will decide whether to integrate anything after reading your receipt.

Read and follow repository instructions, especially AGENTS.md. Use Portuguese-BR for the receipt. Treat branch `feat/fiscal-desk-local-base-prep` and commit `cd544e7` or newer as the canonical integration state.

Authoritative docs to read first:
- `docs/goals/fiscal-desk-orchestration/state.yaml`
- `docs/goals/fiscal-desk-orchestration/integration-plan.md`
- `docs/goals/fiscal-desk-orchestration/results/post-local-base-regate-csv-input-intake-hardening-integration-judge-decision-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-local-base-regate-csv-input-intake-hardening-review-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-local-base-regate-csv-input-intake-hardening-review-after-rework-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-csv-input-intake-next-owner-window-selection-2026-06-13.md`

Task:
1. Audit the current renderer message normalization for missing CNPJ column errors.
2. Align the renderer so it does not hide the newer core guidance for missing CNPJ column errors, including `CPF/CNPJ` and manual column guidance.
3. Keep the change as small as possible and only in the allowed write set.
4. Add or adjust focused unit coverage in `test/unit/app-helpers.test.ts`.
5. Do not implement code outside this P3 renderer/copy alignment.

Allowed write set:
- `src/renderer/ui/app-helpers.ts`
- `test/unit/app-helpers.test.ts`
- `docs/goals/fiscal-desk-orchestration/results/p3-renderer-missing-column-normalizer-can-hide-new-core-guidance-2026-06-13.md`

Forbidden writes:
- `src/core/**`
- `src/main/**`
- `src/preload/**`
- `src/core/simples/**`
- `src/core/export/**`
- `src/core/public-base/**`
- `src/renderer/ui/app-view.ts`
- `src/renderer/ui/app-sync.ts`
- `src/renderer/ui/app.types.ts`
- `src/renderer/ui/operational-copy.ts`
- `src/renderer/styles.css`
- `test/integration/**`
- any `test/unit/**` except `test/unit/app-helpers.test.ts`
- `package.json`
- `pnpm-lock.yaml`
- `electron-builder.yml`
- `.github/**`
- `docs/fiscal-desk/**`
- `docs/adr/**`
- `docs/goals/fiscal-desk-orchestration/state.yaml`
- `docs/goals/fiscal-desk-orchestration/integration-plan.md`
- release/package config, updater/update real, diagnostics, telemetry, license/account, storage/network, templates/reusable models, PDF/Word/OCR, Receita Web live/massiva, Base Publica Local/preparo/consentimento

Verification required:
- `git status --short --branch --untracked-files=all` before and after.
- `pnpm exec vitest run test/unit/app-helpers.test.ts`
- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`
- `git diff --check`
- `pnpm smoke:visual`

Independent review is required before integration. If any required file is absent, if docs under `docs/fiscal-desk/**` are absent, or if the fix requires touching files outside the allowed write set, stop and report `blocked` with exact paths and residual risk rather than expanding scope.

Receipt requirements:
- Write `docs/goals/fiscal-desk-orchestration/results/p3-renderer-missing-column-normalizer-can-hide-new-core-guidance-2026-06-13.md`.
- Include status, files read/changed, diff summary, checks, skipped checks, review need, risks, and integration recommendation.
- End by reporting `ready_for_judge_review` with the receipt path.
```

## Decisao final

Status: `approved_scope_candidate`

O judge pode liberar uma unica thread material para
`p3_renderer_missing_column_normalizer_can_hide_new_core_guidance`. Nenhuma
outra janela material deve ser liberada em paralelo sobre renderer/copy/layout
ate esse resultado ser julgado.

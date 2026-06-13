# Post Local Base Regate Material Owner Window Selection Judge Decision

Data: 2026-06-13 16:49:58 -03
Judge: Codex primary / orchestrator
Thread: `019ec283-ce9c-70d2-a7d3-cc13b338501d`
Worktree: `/Users/icaroaguiar/.codex/worktrees/daed/consulta-simples-csv`
Status: `approved_by_judge_scope_candidate`

## Decisao

Aceito o resultado `approved_scope_candidate`.

Proxima owner window material selecionada:

`post_local_base_regate_csv_input_intake_hardening`

Esta decisao libera apenas o dispatch de um worker material single-writer para
essa janela. Ela nao aprova nenhuma alteracao material antes de receipt,
verificacao, review independente e novo julgamento.

## Racional

O gate leu os receipts de release/security, reworks pos-review, re-gate da Base
Publica Local e rebaseline dos docs locais. A fila material esta vazia e o
proximo corte seguro precisa evitar as superficies ainda bloqueadas.

O recorte escolhido e o menor material util: endurecer a entrada CSV/CNPJ ja
existente e a comunicacao de erros de entrada. Ele preserva o fluxo CSV atual,
nao promete Excel/PDF/Word/OCR como disponiveis, nao toca providers/adapters e
nao exige dependencia nova.

## Escopo aprovado pelo judge

O worker deve fazer auditoria inicial do codigo atual. Se o comportamento ja
estiver satisfeito, deve retornar `no_code_ready_for_judge_review` com evidencia
e sem editar codigo.

Allowed writes aprovados:

- `src/core/ingestion/**`
- `src/core/cnpj/**`
- `src/core/app/process-csv.types.ts`
- `src/core/app/process-csv.use-case.ts`
- `src/main/ipc/process-csv.ipc.ts`
- `src/main/preload.ts`
- `src/main/types.ts`
- `src/renderer/ui/app.types.ts`
- `src/renderer/ui/app-view.ts`
- `src/renderer/ui/app-sync.ts`
- `src/renderer/ui/operational-copy.ts`
- `test/unit/csv-reader.test.ts`
- `test/unit/fiscal-ingestion.test.ts`
- `test/unit/detect-cnpj-column.test.ts`
- `test/unit/validate-cnpj.test.ts`
- `test/unit/normalize-cnpj.test.ts`
- `test/unit/process-csv.ipc.test.ts`
- `test/unit/preload.test.ts`
- `test/unit/app-view.test.ts`
- `test/integration/process-csv*.test.ts`
- `docs/goals/fiscal-desk-orchestration/results/post-local-base-regate-csv-input-intake-hardening-2026-06-13.md`

O worker deve reduzir o diff ao minimo necessario e justificar qualquer arquivo
fora do nucleo `src/core/ingestion/**` e `src/core/cnpj/**`.

## Do Not Touch

- `src/core/simples/adapters/**`
- `src/core/simples/simples-provider.factory.ts`
- `src/core/export/**`, salvo se parar como `blocked_allowed_write_scope_insufficient`
- `package.json`
- `pnpm-lock.yaml`
- `electron-builder.yml`
- `.github/**`
- `docs/adr/**`
- `docs/fiscal-desk/**`
- `docs/goals/fiscal-desk-orchestration/state.yaml`
- `docs/goals/fiscal-desk-orchestration/integration-plan.md`
- release/package config
- updater/update real
- telemetria
- diagnostico gerado/enviado
- licenca/account
- storage/network
- templates/modelos reutilizaveis
- PDF/Word/OCR
- Receita Web live/massiva
- Base Publica Local/preparo/consentimento, salvo se retornar para judge antes
  de ampliar escopo

## Checks obrigatorios para o worker

- `git status --short --branch --untracked-files=all` inicial e final.
- Leitura de `AGENTS.md`, `CONTEXT.md`, packet 008, ADRs 0014/0015/0016 e docs
  locais canonicos relevantes.
- Auditoria inicial do codigo atual antes de editar.
- `pnpm test -- test/unit/csv-reader.test.ts`
- `pnpm test -- test/unit/fiscal-ingestion.test.ts`
- `pnpm test -- test/unit/detect-cnpj-column.test.ts`
- `pnpm test -- test/unit/validate-cnpj.test.ts`
- `pnpm test -- test/unit/normalize-cnpj.test.ts`
- `pnpm test -- test/integration/process-csv.use-case.test.ts`
- Se tocar IPC/preload: `pnpm test -- test/unit/process-csv.ipc.test.ts test/unit/preload.test.ts`
- Se tocar renderer: `pnpm test -- test/unit/app-view.test.ts`
- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`
- `pnpm build` se tocar main/preload/renderer ou tipos publicos do Electron.
- `pnpm smoke:real-csv` com provider `mock`.
- `pnpm smoke:electron-ui` se tocar funcao de app Electron, renderer,
  preload/IPC ou fluxo de execucao.
- `pnpm smoke:visual` se tocar renderer/copy/estados visiveis.
- `git diff --check`.

`FISCAL_DESK_SMOKE_PROVIDER=base-publica-local pnpm smoke:electron-ui` nao e
obrigatorio por default. Se o worker tocar Base Publica Local, preparo ou
consentimento, deve parar e pedir novo scope ou incluir esse smoke como
obrigatorio por decisao do judge.

## Review

Qualquer diff material de codigo/teste/UI desta janela exige reviewer
independente antes de integracao. Spark ou executor barato nao conta como
reviewer de qualidade.

## Efeito de fila

- A selecao material esta fechada como aceita.
- Uma unica thread material pode ser despachada para
  `post_local_base_regate_csv_input_intake_hardening`.
- Nenhuma outra janela material deve rodar em paralelo enquanto essa tocar
  `process_csv_contracts`, `ipc_contracts`, `preload_bridge` ou
  `renderer_shell`.
- O resultado do worker sera candidato ate novo julgamento.

## Riscos residuais

- O packet 008 e antigo; a auditoria inicial e obrigatoria para evitar duplicar
  comportamento ja integrado.
- O allowed write ainda cruza core, main/preload e renderer; a execucao deve
  preferir o menor diff funcional.
- Esta janela nao entrega Excel/PDF/Word/OCR real.
- Coverage quantitativa permanece sinal auxiliar, nao prova funcional.

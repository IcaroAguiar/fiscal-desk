# Post Local Base Regate CSV Input Intake Hardening Review

Data: 2026-06-13
Thread fonte/orquestrador: `019ebe5c-3853-79c2-87ad-8ddace386c93`
Reviewer worktree: `/Users/icaroaguiar/.codex/worktrees/8fda/consulta-simples-csv`
Worker worktree revisada: `/Users/icaroaguiar/.codex/worktrees/a185/consulta-simples-csv`
Status: `needs_rework`

## Resumo executivo

O candidato esta quase todo dentro do owner window e melhora a deteccao de
cabecalhos comuns (`CPF/CNPJ`, `CNPJ da Empresa`) sem tocar provider, adapter,
export, release, update, telemetria, diagnostico, licenca, storage ou network.
Os testes focados passaram na minha execucao independente: 3 arquivos e 25
testes.

Mesmo assim, recomendo `needs_rework` antes de integracao. O diff promete que
linhas duplicadas passam a receber uma mensagem acionavel no CSV final, mas a
implementacao so faz isso quando o resultado reaproveitado nao possui
`message`. Em caminhos reais com mensagem do provider/cache, como Base Publica
Local, `NOT_FOUND`, `BLOCKED` ou outros resultados com mensagem, a duplicidade
continua invisivel na coluna `mensagem` da linha duplicada.

Tambem ha um risco residual de UI: a mensagem nova para coluna ausente no core
mantem o prefixo antigo, e o renderer continua interceptando esse prefixo para
substituir o texto por uma mensagem preexistente. Isso nao e o blocker principal,
mas significa que a UI Electron pode nao exibir exatamente a nova orientacao do
core para esse erro.

## Arquivos e docs lidos

- `AGENTS.md`
- `docs/goals/fiscal-desk-orchestration/goal.md`
- `docs/goals/fiscal-desk-orchestration/state.yaml`
- `docs/goals/fiscal-desk-orchestration/integration-plan.md`
- `docs/goals/fiscal-desk-orchestration/results/post-local-base-regate-material-owner-window-selection-judge-decision-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-local-base-regate-material-owner-window-selection-2026-06-13.md`
- `/Users/icaroaguiar/.codex/worktrees/a185/consulta-simples-csv/docs/goals/fiscal-desk-orchestration/results/post-local-base-regate-csv-input-intake-hardening-2026-06-13.md`
- `/Users/icaroaguiar/.codex/worktrees/a185/consulta-simples-csv/src/core/app/process-csv.use-case.ts`
- `/Users/icaroaguiar/.codex/worktrees/a185/consulta-simples-csv/src/core/ingestion/detect-cnpj-column.ts`
- `/Users/icaroaguiar/.codex/worktrees/a185/consulta-simples-csv/src/core/ingestion/fiscal-ingestion.ts`
- `/Users/icaroaguiar/.codex/worktrees/a185/consulta-simples-csv/test/integration/process-csv.use-case.test.ts`
- `/Users/icaroaguiar/.codex/worktrees/a185/consulta-simples-csv/test/unit/detect-cnpj-column.test.ts`
- `/Users/icaroaguiar/.codex/worktrees/a185/consulta-simples-csv/test/unit/fiscal-ingestion.test.ts`
- `/Users/icaroaguiar/.codex/worktrees/a185/consulta-simples-csv/src/renderer/ui/app-helpers.ts`
- `~/.agents/skills/agentic-code-review/SKILL.md`
- Memoria operacional relevante em `/Users/icaroaguiar/.codex/memories/MEMORY.md`

`docs/fiscal-desk/**` nao foi necessario para resolver o bug material do diff;
o pacote de owner window e receipt do worker ja continham o contexto de escopo.

## Checks e scans executados

- `git status --short --branch --untracked-files=all` na reviewer worktree:
  `## HEAD (no branch)`, sem dirty state antes deste receipt.
- `git -C /Users/icaroaguiar/.codex/worktrees/a185/consulta-simples-csv status --short --branch --untracked-files=all`:
  somente os 6 arquivos de codigo/teste esperados modificados e o receipt do
  worker untracked.
- `git -C /Users/icaroaguiar/.codex/worktrees/a185/consulta-simples-csv diff --check`:
  pass.
- `git -C /Users/icaroaguiar/.codex/worktrees/a185/consulta-simples-csv diff --name-only`:
  `src/core/app/process-csv.use-case.ts`,
  `src/core/ingestion/detect-cnpj-column.ts`,
  `src/core/ingestion/fiscal-ingestion.ts`,
  `test/integration/process-csv.use-case.test.ts`,
  `test/unit/detect-cnpj-column.test.ts`,
  `test/unit/fiscal-ingestion.test.ts`.
- `git -C /Users/icaroaguiar/.codex/worktrees/a185/consulta-simples-csv diff -- ...`:
  diff lido nos arquivos esperados.
- `TMPDIR=/private/tmp pnpm exec vitest run test/unit/detect-cnpj-column.test.ts test/unit/fiscal-ingestion.test.ts test/integration/process-csv.use-case.test.ts`:
  primeira tentativa bloqueada pelo sandbox em
  `node_modules/.vite-temp`; repetida com permissao escalada; pass, 3 arquivos
  / 25 testes.
- `rg` para mensagens antigas/novas:
  encontrou literais historicos em testes contratuais/fixtures e o mapeamento
  de UI em `src/renderer/ui/app-helpers.ts`.
- `rg` para superficies fora de escopo:
  no diff material, apenas imports/fixtures preexistentes mencionam provider,
  export, Base Publica Local, Receita Web e PDF; nenhum arquivo dessas
  superficies foi alterado.

## Checks nao executados

- `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm smoke:real-csv` e
  `pnpm smoke:electron-ui` nao foram repetidos por este reviewer. Usei a
  evidencia reportada pelo judge/worker como substituta para esses gates
  amplos, porque o rework material ja e exigido pelo bug de duplicados.
- `pnpm smoke:visual` nao foi executado; o worker nao tocou renderer/copy/CSS.
- `FISCAL_DESK_SMOKE_PROVIDER=base-publica-local pnpm smoke:electron-ui` nao
  foi executado; o worker nao tocou Base Publica Local, mas o bug de duplicados
  afeta a visibilidade de mensagens reaproveitadas desse provider e deve ser
  coberto no rework com teste focado se possivel.

## Findings

### P2 - Mensagem de duplicado e perdida quando o resultado reaproveitado tem `message`

Arquivo: `/Users/icaroaguiar/.codex/worktrees/a185/consulta-simples-csv/src/core/app/process-csv.use-case.ts:164`

`processCsv` reaproveita o `lookupResult` de `lookupCache` para CNPJs
duplicados. Na montagem da linha de saida, a coluna `mensagem` usa
`lookupResult.message || ingestionIssue?.message || ""` em
`process-csv.use-case.ts:223`. Isso significa que a mensagem de duplicidade so
aparece quando o resultado reaproveitado nao possui mensagem propria.

O receipt promete que "CNPJ duplicado continua sem nova consulta e agora a
linha duplicada no resultado recebe: `CNPJ repetido...`". Esse comportamento
nao e garantido para caminhos reais com mensagem do provider/cache, por exemplo
Base Publica Local com mensagem descritiva, `NOT_FOUND`, `BLOCKED`,
`CAPTCHA_REQUIRED` ou qualquer resposta reaproveitada que venha com `message`.
O teste adicionado cobre apenas sucesso sem mensagem, entao nao protege o caso
material.

Rework esperado: ajustar a regra de montagem da mensagem para que a duplicidade
seja visivel tambem quando o resultado reaproveitado tem mensagem, sem perder a
informacao do provider quando ela for relevante; adicionar teste focado para
duplicado com `lookupResult.message` preenchida.

### P3 - UI Electron pode esconder a nova mensagem de coluna ausente

Arquivo: `/Users/icaroaguiar/.codex/worktrees/a185/consulta-simples-csv/src/renderer/ui/app-helpers.ts:166`

O core passou a lancar uma mensagem mais detalhada para coluna ausente em
`process-csv.use-case.ts:77`, mantendo o prefixo antigo. O renderer ainda
intercepta esse prefixo e retorna uma mensagem preexistente em
`app-helpers.ts:166-168`, antes de exibir o texto novo do core. Isso preserva
uma mensagem amigavel, mas pode esconder a orientacao nova do worker, inclusive
`CPF/CNPJ` e "informe a coluna manualmente".

Nao classifico este ponto como blocker isolado porque a UI nao fica pior que o
estado anterior e o prefixo antigo foi preservado. Como ja ha rework por P2, o
judge pode decidir se quer alinhar este texto no mesmo retorno ou aceitar como
risco residual.

## Avaliacao das perguntas obrigatorias

1. O diff fica estritamente dentro do allowed write do owner window?
   Sim. Os arquivos alterados estao dentro do allowed write aprovado e nao ha
   alteracao em `src/core/simples/adapters/**`, factory, export, package,
   lockfile, release config, `.github/**`, `docs/fiscal-desk/**`, `docs/adr/**`,
   `state.yaml` ou `integration-plan.md`.

2. O comportamento prometido pelo receipt e realmente implementado pelo diff?
   Parcialmente. Deteccao de cabecalhos e mensagens de invalidos foram
   implementadas, mas a promessa de mensagem de duplicado no CSV final falha
   quando o resultado reaproveitado possui `message`.

3. A deteccao de coluna com normalizacao de acentos/pontuacao tem regressao obvia?
   Nao identifiquei regressao obvia. `normalizeHeader` remove BOM, trim,
   acentos, pontuacao e case, preservando os nomes conhecidos anteriores e
   cobrindo `CPF/CNPJ` e `CNPJ da Empresa`.

4. Invalidos e duplicados continuam previsiveis no core e no CSV final?
   Invalidos sim. Duplicados continuam previsiveis para evitar nova consulta,
   mas a mensagem final nao e previsivel quando ha mensagem do provider/cache;
   por isso o candidato precisa de rework.

5. Ha risco de a UI Electron esconder ou piorar as novas mensagens?
   Sim, para coluna ausente. O renderer mapeia o prefixo antigo para uma
   mensagem preexistente em `app-helpers.ts:166-168`, escondendo parte da nova
   orientacao do core. Nao vi piora funcional imediata, mas ha desalinhamento
   entre core e UI.

6. O diff toca provider/adapters/export/release/update/telemetria/diagnostico/licenca/storage/network ou formatos futuros reais?
   Nao. Ha imports e testes preexistentes mencionando provider/export/Base
   Publica Local/Receita Web/PDF, mas nenhum arquivo dessas superficies foi
   alterado e nenhum formato futuro real foi implementado.

7. Os testes focados cobrem o comportamento material? Existe gap qualitativo que exige rework antes de integracao?
   Cobrem parte do comportamento, mas ha gap qualitativo material: falta teste
   para duplicado cujo resultado reaproveitado tenha `message`. Esse gap exige
   rework antes de integracao.

8. Ha achados de severidade P0/P1/P2/P3?
   Sim. Um P2 em `process-csv.use-case.ts:164`/`:223` e um P3 em
   `app-helpers.ts:166-168`. Nao encontrei P0/P1.

## Riscos residuais

- A duplicidade precisa ser visivel no CSV sem apagar indevidamente mensagens
  relevantes do provider. O rework deve explicitar a precedencia ou composicao
  dessas mensagens.
- A UI de coluna ausente ainda pode exibir a mensagem normalizada antiga, nao a
  mensagem nova do core.
- Nao repeti os gates amplos do worker depois de identificar o blocker; eles
  devem rodar novamente no worker/rework e no judge antes de integracao.

## Recomendacao ao judge

Retornar o candidato como `needs_rework`.

O rework deve ser pequeno: corrigir a regra de mensagem para linhas duplicadas
com resultado reaproveitado que ja possui `message`, adicionar teste focado para
esse caso e repetir os checks focados mais `typecheck`, `lint`, `diff --check`
e os smokes aplicaveis conforme o judge exigir. Depois disso, o candidato pode
voltar para review independente.

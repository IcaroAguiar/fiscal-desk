# Post Local Base Regate CSV Input Intake Hardening

Data: 2026-06-13
Thread fonte/orquestrador: `019ebe5c-3853-79c2-87ad-8ddace386c93`
Worktree: `/Users/icaroaguiar/.codex/worktrees/a185/consulta-simples-csv`
Status: `ready_for_judge_review_after_rework`

## Resumo executivo

Entreguei um candidato material pequeno para endurecer a entrada CSV/CNPJ atual
sem ampliar escopo para Excel, PDF, Word, OCR, providers, adapters, export,
release, update, telemetria, diagnostico, licenca, storage ou network.

O diff melhora a deteccao de coluna de CNPJ em CSVs reais, torna mensagens de
ingestao mais acionaveis para usuario nao tecnico e propaga aviso de CNPJ
duplicado para a linha de resultado sem fazer nova consulta. O fluxo CSV atual
foi preservado e validado com testes focados, suite completa, typecheck, lint,
diff check, smoke CSV real com provider `mock` e smoke Electron UI com build.

Este resultado e candidato. A revisao independente material deve ficar com o
judge/orquestrador antes de qualquer integracao. Nao houve stage, commit, push,
PR, deploy, release, publish, update, telemetria, diagnostico real/enviado ou
alteracao externa.

## Auditoria inicial e gap real encontrado

Estado inicial:

- `git status --short --branch --untracked-files=all`: `## HEAD (no branch)`.

Auditoria do codigo atual:

- `src/core/ingestion/csv-reader.ts` ja suportava CSV com delimitador `,`, `;`
  e tab, BOM, celulas multilinha, preambulo textual, arquivo de coluna unica e
  bloqueio amigavel para payload `.xlsx`.
- `src/core/cnpj/normalize-cnpj.ts` e `src/core/cnpj/validate-cnpj.ts` ja
  normalizavam para digitos e validavam tamanho/checksum/repeticao.
- `src/core/ingestion/fiscal-ingestion.ts` ja produzia `FiscalIngestionBatch`
  com origem, entradas unicas, invalidos, duplicados e formato futuro
  `unsupported_input_format`.
- `src/core/app/process-csv.use-case.ts` ja usava o batch de ingestao para
  evitar consultas duplicadas, mas a linha duplicada continuava saindo sem
  mensagem de acao.

Gap real:

- A deteccao de coluna nao aceitava variacoes comuns como `CPF/CNPJ` e `CNPJ da
  Empresa`, apesar de serem cabecalhos plausiveis de planilha exportada como
  CSV.
- Mensagens de ingestao eram tecnicas/genericas e sem orientacao clara.
- Duplicados eram tratados corretamente para evitar nova consulta, mas a linha
  duplicada no CSV de resultado nao comunicava que a consulta foi reaproveitada.

## Arquivos lidos

- `AGENTS.md`
- `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/CONTEXT.md`
- `docs/goals/fiscal-desk-orchestration/goal.md`
- `docs/goals/fiscal-desk-orchestration/state.yaml`
- `docs/goals/fiscal-desk-orchestration/integration-plan.md`
- `docs/goals/fiscal-desk-orchestration/results/post-local-base-regate-material-owner-window-selection-judge-decision-2026-06-13.md`
- `docs/goals/fiscal-desk-orchestration/results/post-local-base-regate-material-owner-window-selection-2026-06-13.md`
- `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/fiscal-desk/executor-packets/008-input-intake-cnpj-extraction.md`
- `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/fiscal-desk/product-spec.md`
- `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/fiscal-desk/quality-gates.md`
- `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/adr/0014-ingestao-e-entrega-multiformato-com-nucleo-limpo.md`
- `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/adr/0015-extracao-confiavel-com-revisao-para-entradas-nao-estruturadas.md`
- `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/docs/adr/0016-ocr-opcional-para-documentos-escaneados.md`
- `src/core/ingestion/csv-reader.ts`
- `src/core/ingestion/detect-cnpj-column.ts`
- `src/core/ingestion/ingestion-contract.ts`
- `src/core/ingestion/fiscal-ingestion.ts`
- `src/core/cnpj/normalize-cnpj.ts`
- `src/core/cnpj/validate-cnpj.ts`
- `src/core/app/process-csv.use-case.ts`
- `src/core/app/process-csv.types.ts`
- `src/renderer/ui/operational-copy.ts`
- `src/renderer/ui/app-view.ts`
- `test/unit/csv-reader.test.ts`
- `test/unit/fiscal-ingestion.test.ts`
- `test/unit/detect-cnpj-column.test.ts`
- `test/unit/validate-cnpj.test.ts`
- `test/unit/normalize-cnpj.test.ts`
- `test/integration/process-csv.use-case.test.ts`
- `test/integration/process-csv-empty-header.test.ts`
- `test/integration/process-csv-no-progress-invalid.test.ts`
- `test/unit/fiscal-desk-phase-6-contracts.test.ts`

`CONTEXT.md`, `docs/fiscal-desk/**` e `docs/adr/**` nao existem nesta worktree
como arquivos locais versionados. Conforme instrucao, li a copia canonica
absoluta em `/Users/icaroaguiar/dev/pessoal/consulta-simples-csv/...` e nao
copiei nem editei esses docs.

## Arquivos alterados

- `src/core/ingestion/detect-cnpj-column.ts`
- `src/core/ingestion/fiscal-ingestion.ts`
- `src/core/app/process-csv.use-case.ts`
- `test/unit/fiscal-ingestion.test.ts`
- `test/unit/detect-cnpj-column.test.ts`
- `test/integration/process-csv.use-case.test.ts`
- `docs/goals/fiscal-desk-orchestration/results/post-local-base-regate-csv-input-intake-hardening-2026-06-13.md`

Justificativa para tocar `src/core/app/process-csv.use-case.ts`: era o ponto
que ja preservava todas as linhas de saida e fazia cache por CNPJ unico; o
aviso de duplicado precisava aparecer no CSV de resultado sem alterar provider
ou exportador.

## Comportamento entregue

- `detectCnpjColumn` agora normaliza acentos, pontuacao, barras, espacos e
  caixa antes de comparar cabecalhos.
- Cabecalhos comuns como `CPF/CNPJ`, `CNPJ da Empresa` e `CNPJ Fornecedor`
  passam a ser detectaveis sem override manual.
- Mensagem de coluna ausente orienta o usuario a usar cabecalho `CNPJ`,
  `CPF/CNPJ`, `documento` ou informar a coluna manualmente.
- Mensagem de CNPJ invalido orienta revisar os 14 digitos antes da consulta.
- Mensagem de formato futuro deixa claro que, por enquanto, o caminho disponivel
  e CSV UTF-8.
- CNPJ duplicado continua sem nova consulta e agora a linha duplicada no
  resultado recebe: `CNPJ repetido. A consulta sera reaproveitada da primeira
  ocorrencia valida.`
- Nenhum parser real de Excel/PDF/Word/OCR foi adicionado.
- Nenhum provider, adapter, exportador, release/update, telemetria,
  diagnostico, licenca, storage/network, template ou modelo reutilizavel foi
  tocado.

## Testes e checks executados

- `pnpm install --frozen-lockfile`: pass; usou cache local e nao alterou
  `package.json`/`pnpm-lock.yaml`.
- `pnpm test -- test/unit/csv-reader.test.ts`: tentativa inicial antes da
  correcao final disparou a suite toda pelo wrapper e falhou por `ENOSPC` em
  `/var/folders/.../T` durante execucao concorrente.
- `pnpm test -- test/unit/fiscal-ingestion.test.ts`: tentativa inicial antes da
  correcao final disparou a suite toda; expôs uma expectativa antiga de
  duplicado e tambem falhas ambientais `ENOSPC`.
- `pnpm test -- test/unit/detect-cnpj-column.test.ts`: tentativa inicial antes
  da correcao final disparou a suite toda e falhou por `ENOSPC`.
- `pnpm test -- test/unit/validate-cnpj.test.ts`: tentativa inicial antes da
  correcao final disparou a suite toda e falhou pela expectativa antiga de
  duplicado.
- `pnpm test -- test/unit/normalize-cnpj.test.ts`: tentativa inicial antes da
  correcao final disparou a suite toda e falhou pela expectativa antiga de
  duplicado e `ENOSPC`.
- `pnpm test -- test/integration/process-csv.use-case.test.ts`: tentativa
  inicial antes da correcao final disparou a suite toda e falhou pela
  expectativa antiga de duplicado.
- `pnpm exec vitest run test/unit/csv-reader.test.ts`: pass, 1 arquivo / 10
  testes.
- `pnpm exec vitest run test/unit/fiscal-ingestion.test.ts`: pass, 1 arquivo /
  4 testes.
- `pnpm exec vitest run test/unit/detect-cnpj-column.test.ts`: pass, 1 arquivo /
  6 testes.
- `pnpm exec vitest run test/unit/validate-cnpj.test.ts`: pass, 1 arquivo / 3
  testes.
- `pnpm exec vitest run test/unit/normalize-cnpj.test.ts`: pass, 1 arquivo / 2
  testes.
- `pnpm exec vitest run test/integration/process-csv.use-case.test.ts`: pass, 1
  arquivo / 15 testes.
- `pnpm typecheck`: pass.
- `pnpm lint`: pass, 119 arquivos checados.
- `pnpm test`: pass, 40 arquivos / 262 testes.
- `pnpm smoke:real-csv`: pass com provider `mock`; fixture
  `test/fixtures/smoke/cnpjs-publicos-reais.csv`; resumo `totalLinhas: 5`,
  `totalCnpjsEncontrados: 5`, `totalCnpjsValidos: 4`,
  `totalCnpjsUnicosConsultados: 3`, `totalErros: 3`.
- `pnpm smoke:electron-ui`: pass; executou `pnpm build`, app Electron real,
  provider `mock`, entrega `xlsx`, arquivo salvo, checkpoint, historico e
  retomada; resumo `totalLinhas: 5`, `totalCnpjsEncontrados: 5`,
  `totalCnpjsValidos: 4`, `totalCnpjsUnicosConsultados: 3`,
  `totalCnpjsRetomados: 1`, `totalErros: 3`.
- `git diff --check`: pass.

## Checks nao executados e motivo

- `pnpm test -- test/unit/process-csv.ipc.test.ts test/unit/preload.test.ts`:
  nao executado porque nao toquei IPC/preload.
- `pnpm test -- test/unit/app-view.test.ts`: nao executado isoladamente porque
  nao toquei renderer; foi coberto pela suite completa `pnpm test`.
- `pnpm smoke:visual`: nao executado porque nao toquei renderer, copy ou estados
  visiveis.
- `FISCAL_DESK_SMOKE_PROVIDER=base-publica-local pnpm smoke:electron-ui`: nao
  executado porque nao toquei Base Publica Local, preparo ou consentimento.
- `pnpm build` separado: nao executado como comando isolado porque a mudanca nao
  tocou main/preload/renderer/tipos publicos do Electron; ainda assim, `pnpm
  smoke:electron-ui` executou `pnpm build` com sucesso.

## Scans e revisoes manuais relevantes

- `git diff --stat`: 6 arquivos de codigo/teste alterados antes do receipt, 47
  insercoes e 17 remocoes.
- `git status --short --branch --untracked-files=all` antes do receipt:
  somente arquivos dentro do allowed write estavam modificados.
- `df -h /private/tmp /var/folders/xg/w4k6x0l97bsdxm9rb2j66l9h0000gn/T`:
  volume em 100% com apenas 234 MiB livres no momento da investigacao das falhas
  `ENOSPC`; depois da correcao final, a suite completa conseguiu passar.
- Revisao manual confirmou que o diff nao toca `src/core/simples/adapters/**`,
  `src/core/simples/simples-provider.factory.ts`, `src/core/export/**`,
  `package.json`, `pnpm-lock.yaml`, `electron-builder.yml`, `.github/**`,
  `docs/adr/**`, `docs/fiscal-desk/**`, `state.yaml` ou
  `integration-plan.md`.
- Revisao independente material nao deve ser considerada fechada por esta
  thread. Ela fica para o judge/orquestrador antes de integracao, conforme
  instrucao recebida do orquestrador.

## Riscos residuais

- `processCsv` ainda faz uma leitura CSV antes de chamar `ingestFiscalCsv`,
  preservando o desenho atual. Isso evita refactor maior, mas mantem alguma
  duplicacao de parsing para uma janela futura.
- Existem literais antigos de mensagem em testes contratuais historicos que nao
  validam texto exato. Nao alterei para evitar tocar arquivo fora do recorte
  necessario.
- As mensagens agora aparecem no CSV de resultado para invalidos e duplicados,
  mas a UI de erro de coluna ausente continua dependendo do mapeamento existente
  do renderer. O texto lancado preserva o prefixo antigo para compatibilidade.
- O disco local estava quase cheio durante a execucao; apesar disso, os gates
  finais aplicaveis passaram depois da correcao.
- A revisao independente material e a decisao de integracao permanecem
  responsabilidades do judge/orquestrador.

## Recomendacao ao judge

Recomendo avaliar este candidato como `ready_for_judge_review`: o diff e pequeno,
fica dentro do allowed write, preserva o CSV atual, melhora detecao de coluna e
mensagens, trata duplicados de forma mais visivel e passou os checks/smokes
aplicaveis. Antes de integracao, o judge/orquestrador deve executar ou registrar
a revisao independente material no modelo de gate da fase.

## Rework 2026-06-13

Status: `ready_for_judge_review_after_rework`

### Resumo do rework

O judge retornou o candidato como `needs_rework` por um P2 funcional: a coluna
`mensagem` de uma linha duplicada so exibia a mensagem de duplicidade quando o
resultado reaproveitado nao tinha `message`. Em resultados reais com mensagem de
provider/cache, a duplicidade podia ficar invisivel.

Corrigi a montagem da mensagem no `processCsv` para preservar as duas
informacoes: em duplicados, a mensagem de duplicidade aparece primeiro; quando
o resultado reaproveitado tambem tem mensagem, ela e anexada como
`Resultado reaproveitado: ...`.

Nao toquei no P3 de UI em `src/renderer/ui/app-helpers.ts`; ele permanece como
risco residual conforme instrucao do orquestrador/judge.

### Diff summary

Diff total apos o rework:

- `src/core/app/process-csv.use-case.ts`: agora usa `formatOutputMessage` para
  compor a coluna `mensagem`, dando precedencia visivel a duplicidade e
  anexando a mensagem reaproveitada quando existir.
- `test/integration/process-csv.use-case.test.ts`: adiciona teste focado para
  duplicado cujo resultado reaproveitado tem `message` preenchida.
- Os demais arquivos modificados continuam sendo os do candidato original:
  `src/core/ingestion/detect-cnpj-column.ts`,
  `src/core/ingestion/fiscal-ingestion.ts`,
  `test/unit/detect-cnpj-column.test.ts` e
  `test/unit/fiscal-ingestion.test.ts`.

`git diff --stat` apos o rework:

- 6 arquivos modificados;
- 100 insercoes;
- 17 remocoes.

### Arquivos alterados

- `src/core/app/process-csv.use-case.ts`
- `test/integration/process-csv.use-case.test.ts`
- `docs/goals/fiscal-desk-orchestration/results/post-local-base-regate-csv-input-intake-hardening-2026-06-13.md`

Tambem permanecem no diff do candidato original:

- `src/core/ingestion/detect-cnpj-column.ts`
- `src/core/ingestion/fiscal-ingestion.ts`
- `test/unit/detect-cnpj-column.test.ts`
- `test/unit/fiscal-ingestion.test.ts`

Nao toquei renderer, provider/adapters, export, release/update, telemetria,
diagnostico, licenca, storage/network, `package.json`, `pnpm-lock.yaml`,
`.github/**`, `docs/fiscal-desk/**`, `docs/adr/**`, `state.yaml` ou
`integration-plan.md`.

### Checks executados e resultados

- `git status --short --branch --untracked-files=all`: `## HEAD (no branch)`
  com os 6 arquivos de codigo/teste esperados modificados e este receipt
  untracked/modificado.
- `git diff --check`: pass.
- `TMPDIR=/private/tmp pnpm exec vitest run test/unit/detect-cnpj-column.test.ts test/unit/fiscal-ingestion.test.ts test/integration/process-csv.use-case.test.ts`:
  pass, 3 arquivos / 26 testes.
- `pnpm typecheck`: pass.
- `pnpm lint`: pass, 119 arquivos checados.
- `pnpm test`: pass, 40 arquivos / 263 testes.
- `pnpm smoke:real-csv`: pass com provider `mock`; resumo
  `totalLinhas: 5`, `totalCnpjsEncontrados: 5`, `totalCnpjsValidos: 4`,
  `totalCnpjsUnicosConsultados: 3`, `totalErros: 3`.
- `pnpm smoke:electron-ui`: pass; executou `pnpm build`, app Electron real,
  provider `mock`, entrega `xlsx`, arquivo salvo, checkpoint, historico e
  retomada; resumo `totalLinhas: 5`, `totalCnpjsEncontrados: 5`,
  `totalCnpjsValidos: 4`, `totalCnpjsUnicosConsultados: 3`,
  `totalCnpjsRetomados: 1`, `totalErros: 3`.

### Checks nao executados e motivo

- `pnpm smoke:visual`: nao executado porque o rework nao tocou renderer, copy,
  layout ou estados visiveis.
- `FISCAL_DESK_SMOKE_PROVIDER=base-publica-local pnpm smoke:electron-ui`: nao
  executado porque o rework nao tocou Base Publica Local, preparo ou
  consentimento.
- Review independente material: nao executada nesta thread de rework; deve
  ficar para o judge/orquestrador antes de integracao.

### Como o P2 foi resolvido

Antes do rework, a linha de saida usava:

`lookupResult.message || ingestionIssue?.message || ""`

Isso fazia a mensagem do provider/cache ocultar a mensagem de duplicidade.

Depois do rework, `processCsv` usa `formatOutputMessage`. Para
`duplicate_cnpj`:

- se o resultado reaproveitado nao tem mensagem, retorna apenas a mensagem de
  duplicidade;
- se o resultado reaproveitado tem mensagem, retorna:
  `CNPJ repetido. A consulta sera reaproveitada da primeira ocorrencia valida. Resultado reaproveitado: <mensagem do provider/cache>`.

O teste novo em `test/integration/process-csv.use-case.test.ts` cobre CNPJ
duplicado com `lookupResult.message` preenchida (`NOT_FOUND`) e valida que a
linha duplicada mostra tanto a duplicidade quanto a mensagem reaproveitada.

### Riscos residuais

- O P3 de UI apontado pelo review continua fora de escopo: a UI Electron ainda
  pode mapear o prefixo antigo de erro de coluna ausente em
  `src/renderer/ui/app-helpers.ts` e esconder parte da mensagem nova do core.
  O judge registrou esse ponto como risco residual, nao como rework desta
  janela.
- `processCsv` ainda faz leitura CSV antes de chamar `ingestFiscalCsv`,
  preservando o desenho atual e evitando refactor maior nesta janela.
- A revisao independente material e a decisao de integracao permanecem
  responsabilidades do judge/orquestrador.

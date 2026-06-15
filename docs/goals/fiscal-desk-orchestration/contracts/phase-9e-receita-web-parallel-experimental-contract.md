# Fiscal Desk F9E - Receita Web Parallel Experimental Contract

Status: `implemented_by_explicit_user_decision`

Data: 2026-06-14

## Outcome

Definir e registrar o contrato experimental para execucao Receita Web com
multiplas janelas headed em provider separado, autorizado somente apos decisao
explicita do usuario em 2026-06-14.

O objetivo do contrato e limitar a implementacao material: ganho de velocidade
somente dentro das restricoes do portal, supervisao humana, aceite explicito,
cancelamento forte, parada em CAPTCHA/bloqueio e nenhuma promessa de volume
robusto.

## Authority

Este contrato foi aberto por decisao explicita do usuario apos o blocker F9E.
Em 2026-06-14, o usuario decidiu explicitamente que a paralelizacao e as
velocidades deveriam entrar nesta rodada antes de declarar o core pronto.
Com isso, a implementacao material foi autorizada dentro dos limites abaixo.

O contrato original autorizava apenas trabalho documental/read-only. A decisao
posterior autorizou implementacao material do provider separado
`receita-web-parallel-experimental`, mas continua nao autorizando:

- alterar o provider padrao `receita-web`, que permanece serial/assistido;
- ativar multiplas janelas apenas por `executionSpeedProfile` no provider
  padrao;
- remover aceite explicito antes de iniciar ou retomar F9E;
- permitir multiplas execucoes ativas no app;
- adicionar smoke live;
- burlar CAPTCHA, sessao, anti-bot ou limites do portal.

## User-Facing Contract

Se uma futura implementacao for aprovada, a UI deve tratar F9E como modo
avancado experimental, nao como motor padrao de volume.

O modo deve ser separado do provider padrao `receita-web`. Nome contratual
sugerido para desenho futuro: `receita-web-parallel-experimental`. Esse modo
nao pode ser ativado automaticamente por escolher perfil `rapido` ou `maximo`.

O usuario deve ver antes de iniciar:

- numero maximo de janelas;
- aviso de que o computador pode ficar ocupado por navegadores visiveis;
- parada automatica em CAPTCHA/bloqueio;
- ausencia de promessa de sucesso em lote;
- recomendacao de Base Publica Local para volume;
- possibilidade de pausar/cancelar e exportar pendencias.

## Runtime Contract

Invariantes obrigatorios para qualquer futura implementacao:

- `receita-web` default permanece `assisted`, `experimental`,
  `visibleBrowser: true`, `batchLookup: false`, `automaticFallback: false` e
  `deterministicSmoke: false`;
- uma unica execucao ativa no app continua sendo regra global;
- multiplas janelas, se existirem, pertencem a uma unica execucao ativa;
- cada janela tem lifecycle rastreavel: criada, ativa, drenando, fechada,
  falhou ou bloqueada;
- `AbortSignal` deve ser propagado para cada janela e cada lookup em andamento;
- cancelamento fecha ou drena todas as janelas;
- `CAPTCHA_REQUIRED` ou `BLOCKED` deve acionar stop global, nao retry agressivo;
- nenhum resultado parcial pode ser perdido se houver checkpoint possivel;
- nenhum raw HTML, screenshot, cookie, token, header, path local ou CNPJ bruto
  deve sair do adapter/log/diagnostico sanitizado.
- plano de dados deve ser separado formalmente:
  `final user-owned result/checkpoint/export` pode conter CNPJ bruto quando
  necessario para a funcionalidade do usuario; `state/log/diagnostic/IPC/UI
  telemetry` nao pode conter CNPJ bruto e deve usar mascara ou agregados.
- F9E nao pode adicionar stealth, CAPTCHA solving, proxy, sessao persistente,
  storage state persistente, retry agressivo ou qualquer nova tecnica de
  evasao anti-bot. Qualquer flag/user-agent ja existente no client deve ser
  congelado, removido ou explicitamente aprovado por security/architecture antes
  de implementar paralelismo.

## Provider Boundary

Regras especificas de Receita Web devem ficar dentro de
`src/core/simples/adapters/receita-web/**` ou em contrato explicito desse
adapter.

IPC, preload e renderer nao devem conhecer seletores, CAPTCHA internals, HTML,
browser pages, cookies, endpoints internos ou heuristicas do portal. Essas
camadas podem receber apenas estados canonicos e sanitizados, como:

- `idle`;
- `starting`;
- `running`;
- `draining`;
- `blocked`;
- `captcha_required`;
- `cancelled`;
- `completed`;
- `failed`.

## Suggested Types For Future Implementation

Os nomes abaixo nasceram como sugestao futura e agora funcionam como contrato
de leitura para a implementacao material F9E:

- `AssistedParallelExecutionPolicy`
  - `enabled: true`
  - `provider: "receita-web"`
  - `maxWindows: 2 | 3`
  - `cooldownMs: number`
  - `stopOnStatuses: ["CAPTCHA_REQUIRED", "BLOCKED"]`
  - `requireVisibleBrowser: true`
  - `requireExplicitConsent: true`
- `ReceitaWebExperimentalParallelConfig`
  - `enabled: boolean`
  - `maxWindows: 1 | 2 | 3`
  - `cooldownMs: number`
  - `stopOnCaptcha: true`
  - `stopOnBlocked: true`
  - `requireUserConfirmation: true`
- `ReceitaWebWindowState`
  - `windowId`
  - `status`
  - `currentCnpjMasked`
  - `processedCount`
  - `lastSanitizedDiagnosticCode`
- `ReceitaWebParallelRunState`
  - `status`
  - `activeWindows`
  - `queuedLookups`
  - `completedLookups`
  - `blockedReason`
  - `pendingExportAvailable`
- `AssistedProviderStateChanged`
  - evento abstrato sugerido: `ASSISTED_PROVIDER_STATE_CHANGED`
  - payload permitido: contagens por estado, `AssistedGlobalStopReason`
    sanitizado, numero de janelas ativas e tamanho de fila;
  - payload proibido: HTML, screenshot, cookies, profile path, CNPJ, texto
    fiscal, erro bruto do Playwright, path local ou provider response.
- `AssistedGlobalStopReason`
  - `captcha_required`
  - `portal_blocked`
  - `user_cancelled`
  - `browser_unavailable`
  - `window_failure_budget_exceeded`

Qualquer CNPJ exibido em estado de janela deve ser mascarado ou truncado de
forma nao identificavel quando aparecer em diagnostico/log.

## Suggested Future Allowed Writes

Historicamente esta secao descrevia writes futuros. Depois da decisao explicita
do usuario, os writes materiais F9E foram limitados ao provider separado,
core/IPC/preload/renderer e testes correspondentes, preservando as restricoes
abaixo para qualquer expansao futura:

- `src/core/simples/adapters/receita-web/**`
- `src/core/simples/simples-lookup.types.ts`, somente para status canonico
  sanitizado;
- `src/core/simples/simples-provider.catalog.ts`, somente se o contrato mudar
  explicitamente capabilities experimentais;
- `src/main/ipc/process-csv.ipc.ts`, somente para isolamento de uma execucao
  ativa e propagacao de estado generico;
- `src/main/preload.ts`, `src/main/types.ts` e `src/renderer/ui/**`, somente
  depois do contrato adapter/runtime ser aceito;
- testes unitarios/integracao com doubles, sem rede real.

## Do Not Touch Without New Decision

- live Receita Web smoke em CI;
- bypass ou automacao de CAPTCHA;
- stealth, proxy, rotacao de IP, cookies compartilhados ou sessao persistida;
- fallback automatico para Receita Web;
- transformacao da Receita Web em default ou motor de volume;
- backend remoto, fila remota, banco remoto ou servico intermediario;
- release/update/package/publish.

## Deterministic Gates For Future Implementation

Uma futura implementacao deve provar com doubles, sem rede real:

- `maxWindows` limita concorrencia efetiva;
- `maxWindows=1` preserva comportamento atual;
- segunda execucao ativa continua bloqueada;
- cancelamento propaga abort para todas as janelas;
- cada janela usa contexto efemero/isolado, sem `storageState`, sem
  `userDataDir` persistente e com cleanup em cancelamento/falha;
- CAPTCHA em qualquer janela para a execucao global;
- bloqueio estrutural em qualquer janela para a execucao global;
- janela que falha fecha/limpa recursos;
- checkpoint e exportacao de pendencias permanecem consistentes;
- renderer nao exibe caminho absoluto, HTML bruto, screenshot ou payload do
  portal;
- F9E nao e ativado por `executionSpeedProfile`;
- catalogo default `receita-web` continua sem `batchLookup`, fallback automatico
  ou smoke deterministico;
- provider `mock`, Base Publica Local e CNPJa Open nao mudam comportamento;
- Receita Web continua fora do smoke deterministico live.

## Review Gates

Antes de declarar F9E/core pronto apos a implementacao material:

- `reviewer` independente obrigatorio apos qualquer diff material;
- visual/Electron smoke obrigatorios se renderer, IPC ou preload mudarem.

## Stop Conditions

- Necessidade de rede real para provar contrato;
- necessidade de CAPTCHA solving;
- proposta de retry agressivo contra bloqueio do portal;
- vazamento de raw HTML, screenshot, cookie, token, header, CNPJ bruto ou path
  local;
- ambiguidade entre dados finais do usuario e telemetria/diagnostico/estado
  assistido;
- necessidade de compartilhar cookies, profile, storage state ou sessao entre
  janelas;
- mudanca que permita multiplas execucoes ativas no app;
- mudanca que transforme Receita Web em fallback/default/volume engine.

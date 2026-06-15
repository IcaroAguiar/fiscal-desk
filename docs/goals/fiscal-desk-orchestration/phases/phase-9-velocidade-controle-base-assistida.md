# Goal: Fiscal Desk F9 - Velocidade, Controle E Base Publica Assistida

## Outcome

Recuperar a lacuna entre a documentacao de produto e a implementacao atual,
transformando velocidade e controle operacional em comportamento real, sem
prometer throughput que provedores gratuitos, assistidos ou limitados nao
conseguem entregar.

## Contexto

A auditoria de 2026-06-14 confirmou que:

- `processCsv` executava lookups unicos de forma serial;
- a UI mostrava estrategia de velocidade, mas nao oferecia controle efetivo;
- Base Publica Local existia como preparo manual, sem descoberta/download
  assistido;
- Receita Web permanecia assistida, experimental e inadequada para volume;
- pausa real, redistribuicao de pendencias e paralelismo por provider ainda nao
  tinham owner window material proprio.

## Oracle

- O usuario consegue escolher um perfil de velocidade antes de executar.
- Base local e simulacao podem usar concorrencia local limitada e verificavel.
- CNPJa Open respeita rate limit publico e nao abre paralelismo oculto.
- Receita Web continua serial/assistida; qualquer paralelismo headed exige fase
  experimental separada e stop em CAPTCHA/bloqueio.
- Cancelamento, checkpoint, retomada e ordem de saida continuam corretos.
- O app informa o limite real do metodo selecionado.

## Slices

### F9A - Re-gate E Contrato De Velocidade

- Criar contrato tipado de perfis de velocidade.
- Atualizar UI para selecionar perfil em linguagem de usuario.
- Resolver concorrencia efetiva no `main` por provider e perfil.
- Registrar recibo e evidencias.

### F9B - Fila Concorrente Segura No Core

- Processar CNPJs unicos com concorrencia limitada.
- Preservar ordem de saida do arquivo original.
- Preservar checkpoint e resumo.
- Manter persistencia de ledger sem corrida de escrita.

### F9C - Base Publica Assistida

- Descobrir versao publica disponivel.
- Mostrar tamanho/data antes do preparo.
- Baixar apenas arquivos necessarios para Consulta Simples/SIMEI quando viavel.
- Indexar em streaming e permitir retomada de preparo/download.

Sub-slices:

- F9C1: descoberta/preflight da fonte oficial, sem download automatico ainda.
- F9C2: download assistido/retomavel do `Simples.zip`, indexacao streaming e
  consulta por CNPJ basico. Nao inclui `Empresas*.zip`,
  `Estabelecimentos*.zip` ou a base publica completa. Usa o contrato atual de
  indice local persistido em JSON; persistencia incremental/chunked para bases
  maiores fica como follow-up proprio.

### F9D - Controle Fino

- Pausar sem perder progresso.
- Cancelar forte com parcial e checkpoint.
- Retomar com perfil de velocidade atual.
- Exportar parcial e redistribuir pendencias quando houver bloqueio.

Sub-slices:

- F9D1: pausar como parada cooperativa com checkpoint e retomada pelo
  Historico, sem prometer suspensao em memoria.
- F9D2: historico mostra saida parcial e pendencias apos cancelamento/falha,
  com acao explicita para exportar um CSV de CNPJs pendentes. Esta fatia nao
  redistribui automaticamente para outro provider/perfil; ela entrega o arquivo
  de pendencias para o usuario reprocessar ou dividir de forma controlada.

### F9E - Receita Web Experimental

- Somente com decisao explicita posterior.
- Maximo como modo avancado, com limite de janelas, supervisao humana,
  cancelamento, cooldown e parada em CAPTCHA/bloqueio.
- Nao pode virar motor padrao de volume.

## Allowed Writes

- `src/core/app/process-csv*`
- `src/core/public-base/**`
- `src/main/ipc/process-csv*`
- `src/main/ipc/local-public-base.ipc.ts`
- `src/main/preload.ts`
- `src/main/types.ts`
- `src/renderer/ui/**`
- `test/integration/process-csv-*`
- `test/unit/local-public-base.test.ts`
- `test/unit/process-csv*`
- `test/unit/preload.test.ts`
- `test/unit/app-*.test.ts`
- `test/unit/renderer-operational-copy.test.ts`
- `README.md`
- `docs/goals/fiscal-desk-orchestration/**`

## Do Not Touch

- Nao implementar backend remoto, banco, cloud sync ou servico intermediario sem
  pedido explicito.
- Nao baixar a base publica completa como requisito obrigatorio do usuario.
- Nao paralelizar Receita Web como default.
- Nao burlar CAPTCHA, anti-bot, sessao ou limites de provedor.
- Nao quebrar arquitetura `porta + adapters`.
- Nao alterar release, assinatura, update, telemetria ou licenca nesta fase.

## Gates

- Teste de core provando concorrencia limitada e ordem de saida.
- Teste de IPC provando concorrencia efetiva por provider.
- Teste de preload/renderer provando passagem do perfil.
- Teste de IPC/renderer provando pausa por canal dedicado, mensagem correta e
  controle visivel na tela ativa de execucao.
- Teste de IPC/ledger provando exportacao de pendencias apenas para execucoes
  interrompidas/falhas com arquivo original ainda integro, `ledgerKey` seguro,
  fingerprint conferido e processamento ativo bloqueado.
- Teste de renderer provando acao `Exportar pendencias` no Historico, sem
  expor caminho absoluto e sem permitir acao durante processamento.
- Teste de Base Publica provando descoberta do `Simples.zip`, download local,
  parse streaming do CSV oficial, indexacao por CNPJ basico e preparo somente
  apos consentimento explicito.
- Teste de Base Publica provando que cache/download oficial so e aceito quando
  a entry `Simples.csv` do ZIP tem tamanho e CRC validos, e que links externos
  ou com `../` nao sao tratados como fonte oficial.
- `pnpm typecheck`.
- `pnpm lint`.
- Smokes Electron/visual quando UI ou IPC mudarem.
- Review independente para diff material.

## Stop Conditions

- Necessidade de credencial externa ou provedor pago.
- Necessidade de rede real para validar Receita Web ou Base Publica.
- Corrida de checkpoint/ledger.
- Mudanca que permita mais de uma execucao ativa sem contrato de isolamento.
- Qualquer promessa de volume robusto via Receita Web.

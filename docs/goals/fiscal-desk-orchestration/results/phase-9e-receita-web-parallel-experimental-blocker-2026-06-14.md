# Fiscal Desk F9E - Receita Web Parallel Experimental Blocker

Status: `blocked_pending_explicit_decision`

Data: 2026-06-14

## Decisao

F9E nao esta liberada para implementacao material agora.

O modo proposto, Receita Web paralela com multiplas janelas headed, conflita com
o contrato atual aprovado para Receita Web: assistida, experimental, serial,
sem batch robusto, sem fallback automatico e sem smoke deterministico live.

## Evidencia

- A spec F9 diz que Receita Web continua serial/assistida e que qualquer
  paralelismo headed exige fase experimental separada e stop em
  CAPTCHA/bloqueio.
- A propria F9E esta descrita como "somente com decisao explicita posterior".
- O estado canonico marca F9E como pendente e registra o blocker
  `requires_fresh_explicit_decision_before_receita_web_parallel_experimental_work`.
- O runtime atual mantem uma unica `activeProcessingSession` por app.
- `resolveMaxConcurrentLookups` retorna `1` para providers assistidos,
  providers com navegador visivel ou providers sem batch lookup; CNPJa Open
  tambem fica em `1`.
- README e copy operacional informam que Receita Web segue sem paralelismo na
  release atual.
- F7/F7B aprovaram apenas contrato/adapter-core assistido e experimental, sem
  automacao robusta em lote, live smoke deterministico ou paralelismo.

## Review

Judge read-only independente (`019ec752-e2d0-7ca0-a75d-82ce4807b7d5`) retornou:

- Decision: `block_pending_explicit_decision`;
- P1: F9E ainda nao esta liberada no estado canonico;
- P1: politica atual `fixed_one_assisted_no_batch` conflita com multiplas
  janelas headed;
- P1: risco de CAPTCHA/anti-bot e takeover do computador nao esta resolvido por
  contrato novo;
- P2: arquitetura `porta + adapters` exigiria contrato proprio, nao apenas
  mudar `maxConcurrentLookups`;
- P2: testes deterministos atuais fixam o comportamento oposto ao F9E.

## Condicoes Para Desbloquear

Antes de qualquer codigo F9E:

1. Registrar decisao explicita nova, separada de F9A-D, aceitando o risco de
   multiplas janelas headed, CAPTCHA/anti-bot e impacto no uso do computador.
2. Definir contrato F9E antes de codigo: limite maximo de janelas, cooldown,
   cancelamento forte, stop global em `CAPTCHA_REQUIRED`/`BLOCKED`, sem bypass
   de CAPTCHA, sem fallback automatico e sem promessa de volume.
3. Manter uma unica execucao ativa no app, com isolamento interno das janelas
   daquela execucao, lifecycle/cleanup por janela e `AbortSignal` propagado.
4. Preservar `porta + adapters`: regras especificas de Receita Web ficam no
   boundary do adapter/contrato Receita Web; IPC/UI so recebem contrato
   generico/assistido.
5. Atualizar copy/README para "modo avancado experimental", sem transformar
   Receita Web em motor padrao de volume.
6. Criar testes deterministicos com doubles, nao rede real: concorrencia
   limitada, stop em CAPTCHA/bloqueio, cleanup/cancelamento, uma execucao ativa
   e ausencia de fallback/smoke deterministico live.
7. Exigir review independente de seguranca/arquitetura antes de integracao.

## Resultado

F9E permanece bloqueada por decisao, nao por falha de build.

F9 material concluida nesta worktree cobre:

- F9A/F9B: perfis de velocidade e concorrencia limitada para providers
  permitidos;
- F9C1/F9C2: descoberta, download assistido e preparo do `Simples.zip` oficial;
- F9D1/F9D2: pausa/checkpoint, historico de parcial/pendencias e exportacao de
  CNPJs pendentes.

Qualquer proximo passo em F9E deve ser um novo goal/owner window de decisao ou
contrato, nao uma implementacao direta.

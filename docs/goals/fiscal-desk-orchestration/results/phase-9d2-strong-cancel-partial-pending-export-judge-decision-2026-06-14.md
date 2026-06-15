# Fiscal Desk F9D2 - Judge Decision

Decision: `approved_for_f9d2_only`

Date: 2026-06-14

## Scope Judged

O judge avaliou apenas F9D2: historico com parcial/pendencias, exportacao
explicita de CNPJs pendentes, validacao de ledger/fingerprint, IPC/preload,
renderer e testes correspondentes.

F9D2 nao aprova:

- redistribuicao automatica entre providers;
- multiplas execucoes simultaneas;
- paralelismo da Receita Web;
- persistencia incremental/chunked da Base Publica;
- release, update, assinatura, telemetria, licenca ou servico remoto.

## Evidence Accepted

- focused F9D2 tests: pass, 5 arquivos, 51 testes;
- `pnpm lint`: pass;
- `pnpm typecheck`: pass;
- `git diff --check`: pass;
- `pnpm test`: pass, 43 arquivos, 319 testes;
- `pnpm build`: pass;
- `pnpm smoke:visual`: pass;
- `pnpm smoke:electron-ui`: pass;
- review independente: sem findings P0-P3 bloqueantes;
- focused verification do reviewer: pass, 6 arquivos, 45 testes.

## Review Outcome

O reviewer independente confirmou:

- `ledgerKey` e resolvido por caminho seguro e nao permite traversal;
- exportacao e bloqueada quando existe processamento ativo;
- o arquivo original e lido novamente e seu fingerprint e conferido antes da
  exportacao;
- a lista exportada usa apenas CNPJs validos e unicos ainda nao checkpointados;
- a UI do Historico exibe nomes de arquivo, nao caminhos absolutos;
- controles ficam desabilitados durante processamento;
- regressao de pause/resume/mock segue coberta por testes focados.

Nao houve findings P0-P3 bloqueantes no recorte F9D2.

## Residual Risk Accepted

O CSV de pendencias e intencionalmente minimo, com uma coluna `cnpj`. Isso e
aceito porque a finalidade desta fatia e permitir retomada/reprocessamento
controlado sem acoplar o Historico a formatos originais arbitrarios.

Redistribuicao automatica, multiplas execucoes ativas e paralelismo headed da
Receita Web seguem fora do escopo e exigem fase/decisao propria.

## Decision

F9D2 esta aprovada no recorte definido e integrada na branch final
`feat/fiscal-desk-local-base-prep`.

F9 continua ativa somente por F9E:

- F9E: Receita Web paralela experimental somente apos nova decisao explicita,
  com limites de janelas, supervisao humana, cancelamento, cooldown e parada em
  CAPTCHA/bloqueio.

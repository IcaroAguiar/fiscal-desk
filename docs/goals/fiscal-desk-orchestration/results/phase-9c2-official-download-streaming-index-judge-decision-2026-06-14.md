# Fiscal Desk F9C2 - Judge Decision

Decision: `approved_for_f9c2_only`

Date: 2026-06-14

## Scope Judged

O judge avaliou apenas F9C2: download assistido/retomavel do `Simples.zip`,
validacao de ZIP/cache/source trust, parse streaming do CSV oficial, lookup por
CNPJ basico, IPC/preload/renderer e documentacao correspondente.

F9C2 nao aprova:

- persistencia incremental/chunked;
- `Empresas*.zip`, `Estabelecimentos*.zip` ou base publica completa;
- cancelamento forte/exportacao parcial/redistribuicao de pendencias;
- paralelismo experimental da Receita Web;
- release, update, assinatura, telemetria, licenca ou servico remoto.

## Evidence Accepted

- focused F9C2 tests: pass, 4 arquivos, 50 testes;
- `pnpm lint`: pass;
- `pnpm typecheck`: pass;
- `git diff --check`: pass;
- `pnpm test`: pass, 43 arquivos, 316 testes;
- `pnpm build`: pass;
- `pnpm smoke:visual`: pass;
- `pnpm smoke:electron-ui`: pass;
- re-review independente pos-rework: sem findings P0-P3 bloqueantes.

## Review Outcome

O primeiro re-review bloqueou o aceite por P2 de ZIP corrompido com metadata
valida. O rework passou a consumir a entry `Simples.csv`, validar tamanho e
CRC32, rejeitar partial/cache corrompido e impedir links oficiais fora da raiz
esperada.

O segundo re-review confirmou:

- cache final corrompido com metadata valida nao e aceito;
- `.part` corrompido nao e promovido;
- source discovery rejeita origem externa e traversal;
- consentimento permanece validado no main;
- provider `mock` segue funcional;
- nao ha findings P0-P3 bloqueantes no recorte F9C2.

## Residual Risk Accepted

O indice local ainda e persistido como JSON unico e reidratado em memoria. Isso
e aceito apenas como risco residual da F9C2 porque o escopo desta fatia era
download/preparo assistido seguro do `Simples.zip` dentro do contrato existente
da Base Publica Local. Persistencia incremental/chunked deve ter owner window
proprio antes de prometer volume amplo.

## Decision

F9C2 esta aprovada no recorte definido e integrada na branch final
`feat/fiscal-desk-local-base-prep`.

F9 continua ativa. Proximas pendencias:

- F9D2: cancelamento forte, exportacao parcial explicita e redistribuicao de
  pendencias/bloqueios;
- F9E: Receita Web paralela experimental somente apos nova decisao explicita.

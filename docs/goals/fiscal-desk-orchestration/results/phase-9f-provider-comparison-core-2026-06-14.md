# F9F Provider Comparison Core

Status: `comparison_core_and_receita_web_script_implemented`

Data: 2026-06-14

## Objetivo

Fechar a pendencia documental do modo comparativo: pegar um CSV ja processado,
reconsultar CNPJs selecionados com um provider de auditoria e gerar relatorio
comparativo sem sobrescrever o resultado original.

## Implementacao

- `src/core/comparison/provider-comparison.ts`
  - le CSV processado;
  - deduplica por `cnpj_normalizado`/`cnpj`;
  - seleciona `sample`, `errors` ou `all`;
  - consulta um `SimplesLookupPort` recebido por injecao;
  - gera CSV lado a lado com resultado original e reconsulta;
  - classifica `concordante`, `divergente` ou `inconclusivo`.
- `scripts/compare-providers.ts`
  - comando operacional com Receita Web assistida;
  - padrao conservador: `sample` com `limit 10`;
  - mascara CNPJ em progresso;
  - grava `*-comparativo-<mode>.csv`.
- `package.json`
  - adiciona `compare:receita-web`.

## Limites

- Nao e UI Electron ainda.
- Nao preenche a aba `Divergencias` do XLSX principal.
- Receita Web continua assistida, sujeita a CAPTCHA e desbloqueio manual.
- O comparativo nao escolhe vencedor automatico; apenas marca divergencia.

## Verificacao

- `pnpm exec vitest run test/unit/provider-comparison.test.ts`
  - 1 arquivo
  - 3 testes
  - status: passou
- `pnpm typecheck`
  - status: passou
- `pnpm lint`
  - status: passou
- `TMPDIR=/private/tmp pnpm exec tsx scripts/compare-providers.ts`
  - status: passou como validacao de bootstrap/usage; exit `1` esperado sem
    arquivo de entrada.

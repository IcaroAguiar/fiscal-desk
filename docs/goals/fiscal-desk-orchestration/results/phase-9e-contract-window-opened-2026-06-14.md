# Fiscal Desk F9E - Contract Window Opened

Status: `contract_window_opened_docs_only`

Data: 2026-06-14

## Decisao

O usuario escolheu abrir F9E como contrato experimental, sem implementacao de
codigo neste momento.

O blocker anterior continua valido para implementacao direta. A diferenca agora
e que existe uma janela documental permitida para desenhar o contrato que uma
futura implementacao teria que seguir.

## Artefatos Criados

- `contracts/phase-9e-receita-web-parallel-experimental-contract.md`
- `phases/phase-9e-receita-web-parallel-experimental-contract.md`

## Escopo Aberto

- estados/payloads sanitizados;
- limites de janelas;
- cooldown e stop global;
- uma unica execucao ativa;
- lifecycle/cleanup por janela;
- testes deterministicos futuros com doubles;
- reviews obrigatorios antes de codigo.

## Escopo Ainda Bloqueado

- qualquer alteracao em `src/**`;
- qualquer alteracao em `test/**`;
- qualquer mudanca em `resolveMaxConcurrentLookups`;
- qualquer abertura real de multiplas janelas;
- qualquer live smoke Receita Web;
- qualquer automacao de CAPTCHA ou tentativa de contornar anti-bot;
- qualquer promessa de volume robusto via Receita Web.

## Evidencia

Este e um fechamento docs-only. Os gates executados para a worktree integrada
antes da abertura do contrato foram:

- `pnpm typecheck`: pass;
- `pnpm test`: pass, 43 arquivos e 319 testes;
- `pnpm build`: pass;
- `pnpm smoke:visual`: pass;
- `pnpm smoke:electron-ui`: pass.

Depois dos docs do contrato, devem rodar `pnpm lint` e `git diff --check`.

## Proximo Gate

Esperar o retorno do `api-designer` read-only aberto para revisar o contrato.
Se houver findings, ajustar apenas os docs. Se o contrato for aceito, a proxima
decisao deve ser abrir ou nao um worker material F9E, com security/architecture
review obrigatorio antes de qualquer integracao.

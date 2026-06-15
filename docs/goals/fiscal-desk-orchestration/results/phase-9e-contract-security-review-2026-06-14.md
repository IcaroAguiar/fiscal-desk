# Fiscal Desk F9E - Contract Security Review

Status: `approve_contract_docs_only_with_required_future_gates`

Data: 2026-06-14

## Reviewer

Security reviewer read-only: `019ec7ab-c906-7f53-9d56-d254061598dc`.

## Decision

`approve_contract_docs_only`

O contrato F9E esta suficientemente protetivo como janela documental. Este
review nao libera implementacao material.

## Findings Incorporated

- P2: separar formalmente dados finais do usuario de estado/log/diagnostico.
  `final user-owned result/checkpoint/export` pode conter CNPJ bruto quando
  necessario; `state/log/diagnostic/IPC/UI telemetry` nao pode conter CNPJ
  bruto.
- P2: antes de implementar F9E, security/architecture deve decidir se flags ou
  user-agent atuais do browser client ficam, sao removidos ou ficam congelados.
  F9E nao pode adicionar stealth, CAPTCHA solving, proxy, sessao persistente ou
  retries agressivos.
- P3: gates futuros devem provar `BrowserContext` efemero/isolado por janela,
  sem `storageState`, sem `userDataDir` persistente e com cleanup em
  cancelamento/falha.

## Protections Confirmed

- sem implementacao autorizada;
- sem ativacao por `executionSpeedProfile`;
- sem fallback/default;
- sem smoke live;
- sem promessa de volume;
- uma execucao ativa global;
- stop global em `CAPTCHA_REQUIRED`/`BLOCKED`;
- payload assistido sanitizado.

## Conditions Before Implementation

- Judge deve aceitar o contrato;
- security/architecture deve aprovar os tres pontos acima;
- allowlist futura deve ser estreita;
- doubles sem rede real devem provar ausencia de fallback/smoke/default,
  uma execucao ativa, stop global em CAPTCHA/bloqueio, cleanup/cancelamento por
  janela e isolamento efemero;
- visual/Electron smoke obrigatorios se IPC/preload/renderer mudarem.

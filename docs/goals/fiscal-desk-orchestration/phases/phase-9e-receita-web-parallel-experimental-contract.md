# Goal: Fiscal Desk F9E - Receita Web Parallel Experimental Contract

Status: `superseded_by_explicit_implementation_window`

Nota: este goal file abriu apenas a janela documental original. Em 2026-06-14,
o usuario decidiu explicitamente que paralelizacao/velocidades deveriam entrar
na rodada atual antes de declarar o core pronto. A autoridade atual para F9E
esta em:

- `docs/goals/fiscal-desk-orchestration/contracts/phase-9e-receita-web-parallel-experimental-contract.md`
- `docs/goals/fiscal-desk-orchestration/results/phase-9e-receita-web-parallel-experimental-implementation-2026-06-14.md`

## Outcome

Abrir uma janela documental de contrato para avaliar Receita Web paralela/headed
como modo avancado experimental, sem implementar codigo nesta fase.

## Contract Artifact

- `docs/goals/fiscal-desk-orchestration/contracts/phase-9e-receita-web-parallel-experimental-contract.md`

## Oracle

- O contrato deixa explicito que F9E nao esta liberada para implementacao.
- O contrato preserva Receita Web como assistida/experimental, sem default,
  fallback automatico ou promessa de volume.
- O contrato define limites de janelas, cooldown, stop em CAPTCHA/bloqueio,
  cancelamento forte e uma unica execucao ativa.
- O contrato protege a arquitetura `porta + adapters`, mantendo detalhes do
  portal dentro do adapter.
- Os gates futuros sao deterministicos com doubles e nao exigem rede real.

## Non-Goals

- Nao implementar multiplas janelas.
- Nao mudar `resolveMaxConcurrentLookups`.
- Nao alterar provider catalog/factory/runtime.
- Nao tocar renderer, IPC, preload ou styles.
- Nao adicionar smoke live, CI de Receita Web ou rede real.
- Nao burlar CAPTCHA, anti-bot, sessao ou limites do provedor.

## Allowed Writes

- `docs/goals/fiscal-desk-orchestration/contracts/phase-9e-receita-web-parallel-experimental-contract.md`
- `docs/goals/fiscal-desk-orchestration/phases/phase-9e-receita-web-parallel-experimental-contract.md`
- `docs/goals/fiscal-desk-orchestration/results/phase-9e-*-2026-06-14.md`
- `docs/goals/fiscal-desk-orchestration/state.yaml`
- `docs/goals/fiscal-desk-orchestration/integration-plan.md`

## Do Not Touch

- `src/**`
- `test/**`
- `package.json`
- `pnpm-lock.yaml`
- `.github/**`
- release/update/build config

## Gates

- Read-only API/contract review.
- Read-only security/architecture review before any future implementation
  worker.
- `pnpm lint` and `git diff --check` after docs-only changes.

## Stop Conditions

- Qualquer necessidade de codigo para validar o contrato.
- Qualquer proposta que exija live Receita Web, CAPTCHA solving ou contornar
  anti-bot.
- Qualquer proposta de tornar Receita Web default, fallback automatico ou motor
  de volume.

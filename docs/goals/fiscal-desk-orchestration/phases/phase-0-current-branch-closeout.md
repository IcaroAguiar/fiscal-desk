# Goal: Fiscal Desk F0 - Current Branch Closeout

## Outcome

Reconciliar e fechar a branch atual antes de qualquer nova feature do Fiscal Desk, preservando mudancas existentes, resolvendo ou documentando ratchet/V5/checks/PR/CI.

## Oracle

- Worktree classificada por origem, risco e decisao de versionamento.
- Ratchet passa ou tem excecao estreita, explicita e expirada.
- V5 tem `.visual-fidelity/runs/<run-id>/fraud-proof-closeout.json` com `canSayDone=true` ou blocker formal.
- Checks aplicaveis foram rodados ou blockers concretos foram registrados.
- Estrategia de PR/CI/documentos ignorados foi decidida.

## Non-Goals

- Nao iniciar feature nova.
- Nao alterar provider, backend remoto, banco, PDF, update real ou produto novo.
- Nao reverter mudancas alheias.
- Nao criar bypass permanente do ratchet.

## Subagents

- `goal-scout`: read-only para worktree, ratchet, V5 e PR docs.
- `goal-judge`: read-only para validar se F0 pode fechar.
- `goal-worker`: somente se o judge liberar correcao estreita.
- `reviewer`: obrigatorio se houver codigo material.

## Allowed Writes

- Documentacao de status/closeout.
- Evidencias V5 e closeout docs.
- Refactors pequenos para ratchet apenas com plano aprovado.
- Arquivos ja modificados na branch somente quando a origem/risco estiver classificada.

## Do Not Touch

- Novos fluxos de produto.
- Provider adapters.
- Release/update real.
- Arquivos de usuario nao relacionados.

## Gates

- `git status --short` revisado.
- Ratchet rodado.
- V5 closeout localizado ou blocker registrado.
- Checks focados definidos.
- Review independente se diff material.

## Stop Conditions

- Risco de sobrescrever mudanca alheia.
- Necessidade de iniciar feature para "fechar" F0.
- Ratchet falha duas vezes com mesma assinatura sem novo diagnostico.
- V5 sem evidencia suficiente para fechamento.

# Goal: Fiscal Desk F8 - Distribuicao, Update E Comercial

## Outcome

Preparar adocao fora do GitHub preservando confianca local-first: marca/distribuicao oficial controladas, update transparente, telemetria opt-in desligada por padrao, diagnostico local revisavel e monetizacao futura sem bloquear dados do usuario.

## Contract Artifact

- Contrato canonico desta onda contract-only: `docs/goals/fiscal-desk-orchestration/contracts/phase-8-distribuicao-update-comercial-contract.md`
- Esta onda nao autoriza implementacao de UI, rede, updater, telemetria, release, pacote, assinatura, deploy ou licenca real.

## Oracle

- UI de update pode existir como estado transparente/bloqueado enquanto canal, assinatura e metadata nao estiverem definidos.
- Nenhum download, instalacao, publish, auto-update real, assinatura ou deploy e acionado sem decisao explicita posterior.
- Telemetria e opt-in, desligada por padrao e nao envia CNPJs, documentos, resultados, nomes, credenciais ou dados fiscais.
- Pacote de diagnostico e local, sanitizado, revisavel e enviado manualmente pelo usuario.
- Monetizacao futura nao bloqueia dados, historico ou exportacoes existentes.
- Core open source e distribuicao oficial/marca ficam conceitualmente separados.

## Non-Goals

- Nao implementar release real.
- Nao publicar binarios.
- Nao configurar assinatura, electron-updater, metadata de release ou canal real sem fase propria.
- Nao adicionar telemetria automatica.
- Nao criar conta online obrigatoria para uso local.
- Nao introduzir paywall agressivo ou bloqueio de consulta basica.

## Subagents

- `release-reviewer`: gate para canal, assinatura, metadata e empacotamento antes de qualquer update real.
- `security-reviewer`: revisa telemetria, diagnostico, logs, redaction e update surface.
- `frontend-builder`: implementa UI-first somente bloqueada/transparente.
- `api-designer`: contratos locais para update state, diagnostico e consentimento.
- `test-engineer`: valida estados bloqueados, ausencia de rede/update real e smoke visual quando houver UI.
- `docs-writer`: documenta limites comerciais, marca/distribuicao oficial, telemetria e diagnostico.

## Allowed Writes

- `src/renderer/ui/**` para UI-first.
- `src/main/main.ts`, `src/main/preload.ts`, `src/main/types.ts`, `src/main/ipc/**` apenas para stub/bridge local.
- `test/unit/**` para estado/copy/contrato local.
- Docs de goal, release constraints, diagnostico e telemetria.

## Do Not Touch

- `src/core/simples/**`
- Implementacao real de rede/update.
- Publicacao, deploy, assinatura, notarizacao ou metadata remota.
- Fluxo de licenca Pro real com validacao externa.
- Coleta automatica de telemetria.
- `package.json`, `pnpm-lock.yaml` ou `electron-builder.yml` sem reclassificar para release real.

## Gates

- Release gate: update real bloqueado ate haver canal, assinatura e metadata.
- Security gate: nenhum dado fiscal identificavel em telemetria/diagnostico/logs; gitleaks obrigatorio para PR material.
- Consent gate: telemetria desligada por padrao e reversivel.
- Diagnostic gate: pacote local, revisavel e envio manual.
- Commercial gate: recursos pagos futuros nao bloqueiam dados/historico/exportacoes existentes.
- Visual gate: se UI mudar, screenshot desktop/mobile e `pnpm smoke:visual`.
- Technical gate: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm smoke:real-csv`, `pnpm smoke:electron-ui` quando IPC/preload/main mudar, `pnpm build`, ratchet.

## Stop Conditions

- Qualquer necessidade de chamada real de update/rede.
- Falta de decisao sobre canal/assinatura/metadata para update real.
- Telemetria proposta como default-on ou sem consentimento claro.
- Diagnostico exige envio automatico ou contem dados identificaveis.
- Comercializacao bloqueia acesso a dados, historico ou exportacoes ja criados.

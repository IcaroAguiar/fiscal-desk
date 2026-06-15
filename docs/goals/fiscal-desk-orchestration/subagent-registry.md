# Subagent Registry

## Purpose

Definir quais subagentes podem atuar em cada fase do Fiscal Desk, quais limites eles recebem e quem aprova resultados. Este registro evita colisao de arquivos, conclusoes sem evidencia e uso de agentes baratos como aprovadores de qualidade.

## Runtime Baseline

Para a etapa de planejamento inicial, quatro subagentes foram usados com `/goal` em `gpt-5.5` e reasoning `medium`. O Codex primario julgou os resultados e consolidou os contratos abaixo.

## Roles

| Role | Use | Writes? | Approves? | Notes |
|---|---|---:|---:|---|
| `codex_primary_judge` | Orquestracao, decisao de fase, conflito, fechamento | Sim, em docs/patches proprios | Sim | Dono final da coerencia e do aceite |
| `goal-judge` | Revisao read-only de gates, riscos e claims | Nao | Recomenda | Pode bloquear, mas Codex primario registra decisao |
| `goal-scout` | Mapeamento read-only de uma tarefa ativa | Nao | Nao | Entrega evidencia, nao plano aberto |
| `goal-worker` | Pacote de escrita fechado e reversivel | Sim, somente `allowed_files` | Nao | Nunca altera fora do pacote |
| `api-designer` | Contratos, schemas, IPC, estados, payloads | Normalmente docs/types | Nao | Obrigatorio antes de workers em contratos compartilhados |
| `architect` | Boundaries, tradeoffs, fase estrutural | Preferencialmente read-only | Nao | Usa-se quando contrato cruza modulos |
| `backend-builder` | Core, provider, export, ingestion, IPC local | Sim, escopo fechado | Nao | Precisa de contrato aprovado antes |
| `frontend-builder` | Renderer/UI de uma subarea | Sim, uma subarea | Nao | `styles.css` exige owner unico |
| `test-engineer` | Testes focados e evidencia de regressao | Sim, testes | Nao | Nao vira aprovador final |
| `security-reviewer` | Dados fiscais, HTML, logs, telemetria, update | Nao | Gate input | Obrigatorio em F7 e F8, recomendado F4 |
| `release-reviewer` | Update, assinatura, canal, empacotamento | Nao | Gate input | Obrigatorio antes de qualquer release real |
| `reviewer` | Agentic code review independente | Nao | Gate input | Obrigatorio em PR material |

## Dispatch Rules

- Todo prompt de subagente deve citar o phase goal file.
- Todo prompt deve declarar owned files, allowed writes, do-not-touch e stop conditions.
- Scout nao pode propor nova tarefa ativa sem devolver evidencia.
- Worker nao pode rodar se F0 estiver aberto, salvo pacote de F0 aprovado.
- Dois workers nao podem tocar o mesmo shared boundary em paralelo.
- Qualquer mudanca em `src/renderer/styles.css` tem owner unico e precisa declarar impacto no ratchet.
- Qualquer mudanca em IPC/preload/types tem owner unico e bloqueia workers que consumiriam o contrato.
- F7 e F8 sempre passam por security/release review antes de qualquer worker material.
- Threads de fase podem produzir diffs isolados, mas o aceite final exige merge julgado em uma unica branch/worktree de integracao.

## Phase Assignment

| Phase | Primary roles | Reviewer gates | Parallel notes |
|---|---|---|---|
| F0 | Codex primary, goal-scout, goal-judge, narrow goal-worker | reviewer if code changes | Blocks all feature workers |
| F1 | api-designer, architect, test-engineer | reviewer | One owner for execution state contracts |
| F2 | frontend-builder, designer, test-engineer | reviewer, visual judge | One renderer subarea at a time |
| F3 | backend-builder, test-engineer, observability evaluator | reviewer | Cannot collide with F6 on process-csv/IPC |
| F4 | api-designer, backend-builder, security-reviewer, test-engineer | security-reviewer, reviewer | Provider semantics owner unico |
| F5 | architect, backend-builder, test-engineer, frontend-builder later | reviewer | Depends on F4 provider contract |
| F6 | api-designer, backend-builder, test-engineer, frontend-builder later | reviewer | Split 6A-6D; avoid F3 shared files |
| F7 | api-designer, security-reviewer, backend-builder, test-engineer, docs writer | security-reviewer | Assisted only; no deterministic smoke |
| F8 | release-reviewer, security-reviewer, api-designer, frontend-builder, test-engineer, docs writer | release + security | UI-first only; no real update/release |

## Output Receipt Required

Every subagent result must include:

- files read;
- files changed;
- commands run;
- checks pass/fail;
- assumptions;
- risks;
- stop conditions hit;
- recommended next step;
- explicit statement that no completion is claimed without judge gate.

## Integration Receipt Required

Before a phase is considered accepted in the final product, the orchestrator must record:

- source thread id;
- integration branch;
- merged files;
- conflicts and resolutions;
- checks run after integration;
- residual risks;
- whether dependent phases are now unblocked.

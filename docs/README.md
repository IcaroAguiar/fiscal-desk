# Documentação

Mapa da documentação versionada do projeto.

## Produto público

- [`project-context.md`](project-context.md): contexto público durável, escopo, arquitetura, provedores, privacidade e release.
- [`../README.md`](../README.md): visão geral para usuários e desenvolvedores, comandos e funcionamento atual.

## Validação e release

- [`qa/first-release-validation.md`](qa/first-release-validation.md): matriz de validação para PRs materiais, smokes, e2e e builds unsigned.
- [`ai/quality-gate/README.md`](ai/quality-gate/README.md): funcionamento do quality gate versionado.

## Planos técnicos versionados

- [`plans/2026-03-26-v2-receita-web-adapter-design.md`](plans/2026-03-26-v2-receita-web-adapter-design.md)
- [`plans/2026-03-26-v2-receita-web-backlog.md`](plans/2026-03-26-v2-receita-web-backlog.md)

## Local-only

Estas pastas podem existir no ambiente local, mas são ignoradas por padrão e não fazem parte da documentação pública sem curadoria explícita:

- `docs/adr/`
- `docs/fiscal-desk/`
- `docs/goals/`
- `docs/qa/visual-smoke-artifacts/`
- `docs/qa/e2e-artifacts/`
- `docs/ai/reports/`

Para publicar qualquer conteúdo dessas áreas, crie uma versão curada, sem dados sensíveis, receipts operacionais, histórico de agente ou bloat de artefatos.

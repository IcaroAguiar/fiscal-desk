# Goal: Fiscal Desk F6 - Ingestao E Entrega

## Outcome

Evoluir entrada e saida preservando o CSV atual, separando ingestion, consulta, export e templates.

## Oracle

- Fluxo CSV atual continua funcionando.
- Ingestion registra origem, invalidos e duplicados.
- Entrega suporta CSV e caminho para XLSX/templates sem depender de provider.
- Modelos de execucao e entrega ficam separados.

## Non-Goals

- Nao declarar Excel/PDF/Word input pronto antes de implementacao real.
- Nao implementar OCR/PDF.
- Nao alterar providers.
- Nao misturar execution state com output templates.
- Nao rodar em paralelo com F3 se houver shared contracts.

## Subagents

- `api-designer`: contrato F6A.
- `backend-builder`: ingestion F6B e export F6C/F6D em pacotes separados.
- `frontend-builder`: somente depois dos contratos.
- `test-engineer`: compatibilidade CSV/XLSX.
- `reviewer`: diff material.

## Allowed Writes

- `src/core/ingestion/**`
- `src/core/export/**`
- `src/core/app/process-csv.types.ts`, com owner unico.
- Testes focados.

## Do Not Touch

- Provider adapters.
- Renderer antes de contrato.
- RunLedger em paralelo.
- Release/update.

## Gates

- F1 fechado.
- F6A contrato aprovado antes de F6B-F6D.
- CSV regressao coberta.
- XLSX/templates nao aparecem como prontos antes de checks.
- Review independente.

## Stop Conditions

- Colisao com F3 em `process-csv`/IPC/preload.
- Feature depende de provider ou RunLedger ainda instavel.
- Copy ou UI promete formato nao implementado.

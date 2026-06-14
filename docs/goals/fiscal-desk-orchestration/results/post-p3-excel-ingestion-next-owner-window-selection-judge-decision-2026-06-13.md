# Post P3 Excel Ingestion Next Owner Window Selection Judge Decision

Data: 2026-06-13 21:33:24 -03
Status: approved_by_judge_scope_candidate_with_adjusted_allowlist

## Decisao

Aceito o candidato de escopo `post_p3_excel_input_runtime_exposure` como a
proxima janela material.

Esta decisao nao implementa Excel no app por si so. Ela autoriza preparar um
worker material single-writer para expor a entrada XLSX no fluxo real do Electron
com owner unico sobre core app, IPC/preload, runtime main, consumo renderer,
ledger/fingerprint e smoke Electron.

## Evidencia Confrontada Pelo Judge

- Receipt do subagente:
  `results/post-p3-excel-ingestion-next-owner-window-selection-2026-06-13.md`.
- Worktree do subagente:
  `/Users/icaroaguiar/.codex/worktrees/0ed9/consulta-simples-csv`.
- `git diff --check -- docs/goals/fiscal-desk-orchestration/results/post-p3-excel-ingestion-next-owner-window-selection-2026-06-13.md`:
  pass.
- `src/main/ipc/process-csv.ipc.ts`: o picker ainda filtra somente CSV e le
  arquivo como UTF-8.
- `src/core/app/process-csv.use-case.ts`: `processCsv` ainda recebe
  `inputCsv: string` e usa `readCsv`/`ingestFiscalCsv`.
- `src/main/execution/file-process-execution-ledger.ts`: fingerprint e metadata
  ainda usam `inputCsv` e `csvParserVersion`, portanto input XLSX precisa de
  decisao explicita para evitar retomada/fingerprint ambigua.
- `scripts/smoke-electron-ui.ts`: o smoke real cria sempre `entrada.csv`, logo
  a proxima janela precisa poder ajustar o harness para provar entrada XLSX.

## Ajuste Do Judge

O receipt do subagente recomendou a direcao correta, mas o allowed write set
precisa ser ajustado antes do worker material:

- incluir `src/main/execution/file-process-execution-ledger.ts` e seus testes,
  porque o proprio receipt identificou risco de fingerprint/resume;
- incluir `scripts/smoke-electron-ui.ts`, porque o smoke obrigatorio de entrada
  XLSX nao e provavel sem alterar o harness atual;
- nao exigir fixture XLSX binaria versionada se o worker puder gerar XLSX
  temporario a partir da fixture CSV existente no proprio smoke.

## Owner Window Aceito

`post_p3_excel_input_runtime_exposure`

Classificacao: `material single-writer`.

Objetivo aceito: transformar XLSX de core-only para entrada disponivel no app,
mantendo CSV funcional, sem tocar provider, release/update, diagnostico,
telemetria, licenca/account, templates, PDF/Word/OCR ou Receita Web live.

## Condicoes Para Despacho Material

O dispatch material deve:

- usar thread/worktree separada do Codex App;
- usar `/goal`, `gpt-5.5` e reasoning `medium`;
- declarar allowed write set fechado;
- exigir smoke Electron real para entrada XLSX;
- exigir review independente antes de integracao;
- fazer o worker parar com `blocked_scope_expansion_required` se precisar tocar
  superficies fora do allowlist.

## Itens Ainda Bloqueados

- Release publico, dist, publish, signing, notarization e updater/update real.
- Diagnostico gerado ou enviado.
- Telemetria real.
- Licenca/account real.
- Storage/network/backend remoto.
- Templates/modelos reutilizaveis.
- Entrega guiada ampla.
- PDF/Word/OCR reais.
- Receita Web live/massiva.
- Dependencia nova ou mudanca em `package.json`/`pnpm-lock.yaml`.

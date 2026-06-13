# Post P3 Validation Docs Rebaseline Integrated First Release Validation Judge Decision

Data: 2026-06-13 19:04 -03
Status: `needs_rework_quality_gate`

## Decisao

O judge aceita o receipt da thread
`019ec2fa-65ee-7380-b705-d7ee0000a93b` como evidencia executavel do candidato
integrado, mas nao aprova o fechamento da janela.

A fase documental anterior esta fechada. A pendencia atual nao e documental:
ela e um blocker de quality gate estrutural no pacote integrado.

## Evidencia Aceita

O worker validou o commit `4d40402 docs: allow validation worktree bootstrap artifacts`
e reportou PASS em:

- `pnpm install --frozen-lockfile`;
- `pnpm lint`;
- `pnpm typecheck`;
- `pnpm test` com 40 arquivos e 264 testes;
- `pnpm test:coverage` com 40 arquivos e 264 testes;
- `pnpm smoke:real-csv`;
- `pnpm smoke:electron-ui` com provider `mock`;
- `FISCAL_DESK_SMOKE_PROVIDER=base-publica-local pnpm smoke:electron-ui`
  apos rerun fora do sandbox por `listen EPERM`;
- `pnpm smoke:visual`;
- `pnpm build`;
- `gitleaks detect --source . --redact --no-banner`.

Cobertura registrada pelo worker:

- linhas/statements: `69.85%`;
- funcoes: `87.21%`;
- branches: `75.67%`.

Essa evidencia confirma comportamento real relevante do app Electron para o
recorte local-first: CSV, Electron real, Base Publica Local, checkpoint,
historico, retomada, XLSX e smoke visual.

## Blocker

O worker retornou `needs_rework` porque
`node docs/ai/quality-gate/check-ratchet.mjs` falhou no modo default.

O judge reexecutou tambem o modo local de worker:

```sh
QUALITY_GATE_DIFF_MODE=worktree node docs/ai/quality-gate/check-ratchet.mjs
```

Esse comando precisou de execucao fora do sandbox porque a worktree isolada fica
em `~/.codex/worktrees` e o script grava relatorios ignorados em
`docs/ai/quality-gate/**`. O resultado tambem foi FAIL, com:

- `code.large-file-ratchet`: contagem de arquivos grandes aumentou de 2 para 4.

Arquivos acima do limite observados no pacote integrado:

- `src/renderer/styles.css`: legado com excecao explicita ate `2026-06-30`;
- `test/unit/process-csv.ipc.test.ts`: 592 linhas no worker;
- `test/unit/receita-browser.client.test.ts`: 569 linhas no worker;
- `src/main/execution/file-process-execution-ledger.ts`: 531 linhas no worker.

Portanto, o blocker nao e apenas ruido historico de `origin/main...HEAD`.
O modo scoped tambem prova que o pacote integrado aumentou a contagem de large
files em relacao ao baseline do quality gate.

## Consequencia

Nao liberar nova feature, release/public distribution, updater, telemetria,
diagnostico, licenca/account, templates/modelos, PDF/Word/OCR ou Receita Web
live/massiva.

A proxima thread deve ser um rework estreito de quality gate/estrutura para
fechar o ratchet de arquivos grandes sem alterar comportamento funcional.

## Requisitos Para Rework

- Preferir split/refactor mecanico dos arquivos grandes em unidades coesas.
- Preservar comportamento atual do app Electron.
- Nao atualizar baseline nem criar excecao nova sem justificativa tecnica
  explicita e revisavel.
- Rodar testes focados nos arquivos alterados.
- Rodar `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm test:coverage` e
  `QUALITY_GATE_DIFF_MODE=worktree node docs/ai/quality-gate/check-ratchet.mjs`.
- Rodar smokes Electron/CSV/visual somente se o rework tocar runtime ou UI de
  forma que possa afetar comportamento executavel.
- Exigir reviewer independente antes de integracao, porque o rework pode tocar
  production runtime e testes grandes.

## Resultado

Status final da janela:
`needs_rework_quality_gate`.

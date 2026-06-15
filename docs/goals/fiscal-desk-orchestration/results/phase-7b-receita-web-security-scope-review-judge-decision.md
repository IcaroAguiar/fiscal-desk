# Phase 7B Receita Web Security Scope Review Judge Decision

Updated: 2026-06-13

## Decision

`approved_by_judge_docs_only`

The F7B security/scope review is accepted as a docs-only gate. It releases only
a narrow next worker candidate: Receita Web adapter-core hardening and sanitized
tests.

## Evidence Reviewed

- Scope review thread: `019ebf86-14b2-7120-82d0-68ee95c559b9`
- Worktree: `/Users/icaroaguiar/.codex/worktrees/1d37/consulta-simples-csv`
- Receipt:
  `docs/goals/fiscal-desk-orchestration/results/phase-7b-receita-web-security-scope-review.md`
- `git diff --check -- docs/goals/fiscal-desk-orchestration/results/phase-7b-receita-web-security-scope-review.md`
  passed in the scope-review worktree.

The first read in the delegated worktree missed local-only ignored docs. The
orchestrator copied `docs/fiscal-desk/**` and `docs/adr/**` into the worktree as
read-only context, and the worker updated the receipt after reading the
restored docs.

## Accepted Release

Release one implementation worker only for Receita Web adapter-core hardening:

- own `src/core/simples/adapters/receita-web/**` and focused unit tests;
- sanitize browser-client tests so they do not carry raw HTML fixtures or
  numeric/formatted CNPJ examples;
- harden diagnostics and stop conditions without adding raw HTML, screenshots,
  CNPJ bruto, fiscal-identifiable content, cookies, tokens or credentials to
  logs, fixtures, receipts or public results.

## Still Blocked

- Renderer/UI copy or controls.
- Provider factory, provider config, provider fallback and provider catalog
  ownership changes.
- Deterministic Receita Web smoke, CI/network validation and real portal smoke
  as acceptance gate.
- Automatic fallback, robust batch promise, CAPTCHA solving, stealth escalation,
  divergence winner selection, execution queue, F6 templates, backend remote,
  database, PDF/OCR, release/update.

## Result

F7 is not complete. The next executable step is only
`F7B Receita Web adapter-core hardening`, subject to worker checks, sensitive
evidence scan and later judge integration.

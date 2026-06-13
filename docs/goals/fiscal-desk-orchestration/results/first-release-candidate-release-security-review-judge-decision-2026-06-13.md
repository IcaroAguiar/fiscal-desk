# First Release Candidate Release/Security Review Judge Decision

Updated: `2026-06-13 15:09:40 -03`

## Verdict

`needs_rework_blocker_formal`

The read-only first release candidate gate is closed and judged. It does not
release material feature work.

Both review receipts are accepted as valid gate evidence:

- release review: `needs_rework`;
- security review: `needs_rework`.

The current branch remains a coherent local-first Fiscal Desk candidate, but it
is not ready for a first packaged release and should not start unrelated new
feature work before the two rework windows below are completed and judged.

## Evidence Checked By Judge

### Release Review

- Thread: `019ec224-8c95-7ff3-b482-68fdde82dd74`
- Thread title: `Executar release review read-only`
- Worktree: `/Users/icaroaguiar/.codex/worktrees/55c0/consulta-simples-csv`
- Worker result:
  `results/first-release-candidate-release-review-2026-06-13.md`
- Worker status: `needs_rework`
- Worker final status output: only the result receipt and existing local
  `skills/**` bundles were untracked.

Checks reported by the release review:

- `pnpm install --frozen-lockfile`: pass, no diff in `package.json` or
  `pnpm-lock.yaml`;
- `pnpm typecheck`: pass;
- `pnpm lint`: pass;
- `pnpm test`: pass, 40 files / 256 tests;
- `pnpm build`: pass;
- `git diff --check`: pass;
- canonical status: only local `skills/**` untracked.

### Security Review

- Thread: `019ec225-2895-79c3-9858-88822540126d`
- Thread title: `Executar security review read-only`
- Worktree: `/Users/icaroaguiar/.codex/worktrees/e6ee/consulta-simples-csv`
- Worker result:
  `results/first-release-candidate-security-review-2026-06-13.md`
- Worker status: `needs_rework`
- Worker final status output: only the result receipt and existing local
  `skills/**` bundles were untracked.

Checks reported by the security review:

- `pnpm install --frozen-lockfile`: pass, no diff in `package.json` or
  `pnpm-lock.yaml`;
- focused security/privacy tests: pass, 12 files / 141 tests;
- required `rg` scans for secrets/auth, fiscal data/logs/storage and
  network/telemetry/update: completed;
- `git diff --check` for the receipt: pass;
- canonical status: only local `skills/**` untracked.

## Judge Assessment

### Accepted Release Findings

The release review correctly identifies release/package readiness gaps:

- product docs now speak as Fiscal Desk, while `package.json` and
  `electron-builder.yml` still package as `consulta-simples-csv` /
  `Consulta Simples CSV`;
- `dist:mac` does not explicitly include `--publish never`, unlike the Windows
  distribution scripts;
- PR quality gate does not yet include `pnpm test:coverage` or
  `pnpm smoke:electron-ui`, so current runtime evidence still depends on local
  receipts for those checks.

These are not runtime regressions, but they block a safe first packaged release
and should be resolved before unrelated feature work expands the surface.

### Accepted Security Findings

The security review correctly identifies local privacy hardening gaps:

- runtime logs in `src/main/ipc/process-csv.ipc.ts` can include local paths and
  current CNPJ;
- the execution ledger can persist per-CNPJ checkpoints and
  `SimplesLookupResult` content, including provider `raw` when present;
- the Base Publica Local index is expected local storage, but the retention and
  local-data policy need to be explicit before first release.

The judge accepts the classification as privacy/local-data rework, not as
network, telemetry, updater, credential or Receita Web automation failure.

### Limits Still Confirmed

Both reviews confirm the expected blocked/default-off limits:

- no auto-update real;
- no `electron-updater` / `autoUpdater`;
- no telemetry transport;
- no diagnostic package generation or upload;
- no license/account requirement;
- no backend/cloud sync;
- no release publish;
- no provider credentials or hardcoded secrets found;
- `mock` remains the offline default provider;
- Receita Web remains assisted/experimental, visible-browser, no massive batch
  promise and no deterministic live smoke requirement.

## Judge Decision

The gate
`first_release_candidate_release_security_review` is closed as
`judged_needs_rework`.

No material feature worker is released by this decision.

Two rework owner windows are selected:

1. `first_release_local_privacy_hardening`
   - priority: first-release blocker;
   - class: material/sensitive runtime privacy hardening;
   - reason: remove or minimize CNPJ/local path/provider raw exposure in logs
     and local checkpoint artifacts before first release candidate is treated
     as security-go.

2. `first_release_package_identity_and_publish_safety`
   - priority: first-release blocker;
   - class: material release/package/CI configuration;
   - reason: align package identity or explicitly document the legacy package
     identity, make publish behavior explicit for all distribution scripts, and
     decide CI coverage/smoke Electron policy.

These windows may run concurrently only if their allowed write scopes remain
disjoint. Final integration and acceptance remain serial and judge-gated in the
canonical branch.

## Dispatch Policy For Next Step

The next wave may be dispatched as two independent Codex App threads:

- `first_release_local_privacy_hardening`;
- `first_release_package_identity_and_publish_safety`.

Both must use `/goal`, GPT-5.5, reasoning medium, explicit allowed writes and
independent review before judge acceptance.

The security/privacy hardening window is sensitive and must include focused
tests proving behavior, not only scans. The release/package window must not run
publish, distribution release, signing, notarization, updater or deploy.

## Residual Risks

- `docs/fiscal-desk/**` remains local/ignored by `.git/info/exclude`; the
  release/security decisions are versioned under `docs/goals/**`.
- The current branch remains usable for local validation, but release readiness
  is intentionally blocked until the selected rework windows are completed and
  judged.
- Coverage remains an auxiliary signal. Behavior still needs tests/smokes that
  exercise the affected Electron/runtime paths.

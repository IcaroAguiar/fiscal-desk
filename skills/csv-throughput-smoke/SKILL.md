---
name: csv-throughput-smoke
description: Benchmark CSV processing throughput with configurable rows, provider, and delivery format; fail fast when rows/sec drops below threshold.
when_to_use:
  - The user asks for a quick local CSV performance regression check or smoke benchmark.
  - The task mentions throughput, rows/sec, perf gate, benchmark, or regression on CSV processing.
  - The user changed parsing, lookup/provider, caching, or CSV/XLSX export logic and wants a fast check before release.
when_not_to_use:
  - The user wants correctness-only tests for output shape, progress callbacks, cancellation, or resumability.
  - The user wants UI/Electron smoke coverage, screenshots, or visual validation.
  - The user needs remote-provider reliability testing, scraping resilience, or browser automation troubleshooting.
---

## Procedure
1. Choose the benchmark shape.
   - Default to `mock` for the cheapest local throughput signal.
   - Use `base-publica-local` only when the change touches the local-base provider path.
2. Generate the input CSV with the exact schema expected by the use case.
   - Header must include a detectable CNPJ column; the repo benchmark uses `empresa;cnpj;observacao`.
   - Synthetic rows may reuse two alternating valid CNPJs to exercise cache/unique-lookup behavior.
3. Run the benchmark script from this skill bundle.
   - Preferred entrypoint: `python3 skills/csv-throughput-smoke/scripts/perf_local_csv.py`.
   - Optional direct entrypoint: `node --import tsx scripts/perf-local-csv.ts` from the repo root.
4. Pass runtime knobs through args or environment:
   - rows
   - minimum rows/second
   - provider
   - delivery format
   - optional local-base CSV path when using `base-publica-local`
5. Read the JSON report from stdout.
   - Required fields: `status`, `totalRows`, `totalUniqueLookups`, `provider`, `deliveryFormat`, `outputBytes`, `elapsedMs`, `rowsPerSecond`, `minimumRowsPerSecond`.
6. Fail the run when `status !== "pass"` or the process exits non-zero.
7. When `base-publica-local` is selected, prepare the local base in a temp directory and reject the run if the index does not reach `ready`.

## When NOT to use
- “Confirm progress only fires for unique valid lookups.”
  - That is correctness/progress behavior, not throughput smoke. See session `019e344e-28e5-7300-8efc-56ac9e601d37`.
- “Verify cancellation stops processing and records resumable state.”
  - That is ledger/cancellation behavior, not a throughput benchmark. See session `019e344e-28e5-7300-8efc-56ac9e601d37`.
- “Check the Electron app can resume a canceled execution and auto-save XLSX.”
  - That is a UI smoke path, not this local CSV throughput gate. See session `019e344e-28e5-7300-8efc-56ac9e601d37`.
- “Assert the CSV output contains expected columns/messages for specific rows.”
  - That is integration-test territory already covered by `process-csv.use-case` tests in the repo.
- “Benchmark scraping against Receita Web or another remote provider.”
  - This skill is for local CSV throughput smoke; remote browser-driven flows need a different skill.

## Inputs
- CLI args on `scripts/perf_local_csv.py`:
  - `--rows`
  - `--min-rows-per-second`
  - `--delivery-format` (`csv` or `xlsx`)
  - `--provider` (`mock` or `base-publica-local`)
- Direct TS args on `scripts/perf-local-csv.ts`:
  - same flags plus `--local-base-csv-path`
- Environment fallbacks:
  - `FISCAL_DESK_PERF_ROWS` default `5000`
  - `FISCAL_DESK_PERF_MIN_ROWS_PER_SECOND` default `1000`
  - `FISCAL_DESK_PERF_DELIVERY_FORMAT` default `csv`
  - `FISCAL_DESK_PERF_PROVIDER` default `mock`
  - `FISCAL_DESK_PERF_LOCAL_BASE_CSV_PATH` defaults to the bundled smoke fixture
- Repo files used by the script:
  - `scripts/perf-local-csv.ts`
  - `src/core/app/process-csv.use-case.ts`
  - `src/core/public-base/local-public-base.store.ts`
  - `src/core/simples/adapters/local-public-base-simples-lookup.adapter.ts`
  - `test/fixtures/smoke/base-publica-local.csv`

## Outputs
- JSON report on stdout.
- Non-zero exit code on throughput failure or setup failure.
- Temporary directory under the OS temp dir when the local public base provider is used.

## Examples
- Session `019e344e-28e5-7300-8efc-56ac9e601d37`: adjacent CSV work focused on progress, cancellation, and resumability; useful for knowing what this skill is not.
- `scripts/perf_local_csv.ts`: the benchmark logic extracted from the repo and generalized for configurable runs.
- The repo's `process-csv.use-case` integration tests: demonstrate the provider and delivery behaviors this smoke benchmark exercises indirectly.

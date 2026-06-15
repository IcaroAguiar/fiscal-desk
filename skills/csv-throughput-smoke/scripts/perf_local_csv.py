#!/usr/bin/env python3
"""CSV throughput smoke benchmark wrapper.

Runs the TypeScript benchmark entrypoint from the repository root, forwarding
CLI flags and environment variables while preserving the repo's real pipeline.
"""

from __future__ import annotations

import argparse
import os
import subprocess
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[3]
TS_SCRIPT = REPO_ROOT / "scripts" / "perf-local-csv.ts"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--rows", type=int, default=None)
    parser.add_argument("--min-rows-per-second", type=float, default=None)
    parser.add_argument("--delivery-format", choices=("csv", "xlsx"), default=None)
    parser.add_argument("--provider", choices=("mock", "base-publica-local"), default=None)
    args = parser.parse_args()

    env = os.environ.copy()
    if args.rows is not None:
        env["FISCAL_DESK_PERF_ROWS"] = str(args.rows)
    if args.min_rows_per_second is not None:
        env["FISCAL_DESK_PERF_MIN_ROWS_PER_SECOND"] = str(args.min_rows_per_second)
    if args.delivery_format is not None:
        env["FISCAL_DESK_PERF_DELIVERY_FORMAT"] = args.delivery_format
    if args.provider is not None:
        env["FISCAL_DESK_PERF_PROVIDER"] = args.provider

    cmd = ["node", "--import", "tsx", str(TS_SCRIPT)]
    completed = subprocess.run(cmd, cwd=REPO_ROOT, env=env, check=False, text=True)
    return completed.returncode


if __name__ == "__main__":
    raise SystemExit(main())

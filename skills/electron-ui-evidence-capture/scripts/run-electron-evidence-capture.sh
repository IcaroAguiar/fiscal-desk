#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
OUTPUT_DIR="${OUTPUT_DIR:-${1:-${ROOT_DIR}/.artifacts/electron-ui-evidence}}"
SMOKE_PROVIDER="${SMOKE_PROVIDER:-${2:-}}"

mkdir -p "${OUTPUT_DIR}"

# Delegate to the repo's real Electron smoke script so we don't duplicate
# launch logic in the skill bundle. The script already captures live UI state,
# verifies history/output artifacts, and emits a JSON summary.
if [[ -n "${SMOKE_PROVIDER}" ]]; then
  export FISCAL_DESK_SMOKE_PROVIDER="${SMOKE_PROVIDER}"
fi

export VISUAL_SMOKE_OUTPUT_DIR="${OUTPUT_DIR}"
export FISCAL_DESK_DISABLE_DEVTOOLS_ENV="1"
export FISCAL_DESK_DISABLE_COMPLETION_DIALOG_ENV="1"

exec npx tsx "${ROOT_DIR}/scripts/smoke-electron-ui.ts"

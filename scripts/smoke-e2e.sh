#!/usr/bin/env bash
# `scripts/smoke-e2e.sh` — full init-to-close smoke against a
# local `file://` registry pointing at this repo's own `registry/`
# tree. Per the chain prompt's Session 3 G4 acceptance.
#
# This script is the bash entry point; the assertions live in the
# sibling TypeScript file `scripts/smoke-e2e.ts` so they can use
# `validateStep` from `registry/tropes/session-end/index.ts`
# directly (per the spec: "invoke validator directly — do not shell
# to literate continue").
#
# Per ADR-029 the runtime is Bun-only.

set -euo pipefail

here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "$here/.." && pwd)"
ts_script="$here/smoke-e2e.ts"

cd "$repo_root"

# Ensure the CLI bundle exists; the .ts script needs it to spawn
# `literate init` / `literate weave`.
bundle="$repo_root/packages/cli/dist/literate.js"
if [[ ! -f "$bundle" ]]; then
  echo "==> bundle not found; building @literate/cli first"
  bun run --filter '@literate/cli' build
fi

echo "==> running scripts/smoke-e2e.ts"
exec bun "$ts_script"

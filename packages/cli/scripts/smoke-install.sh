#!/usr/bin/env bash
# Hermetic local-install smoke test for @literate/cli.
#
# Packs the CLI as a tarball, installs it into a fresh tmp Bun
# project, then runs `literate --help` and `literate init` against
# the bundled registry. Exits non-zero on any failure.
#
# Per ADR-029 the CLI is Bun-only; this harness is pure-Bun — no
# npm. Run from repo root, the CLI package dir, or anywhere: paths
# are resolved from this script's location.

set -euo pipefail

here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cli_root="$(cd "$here/.." && pwd)"

cd "$cli_root"

echo "==> packing @literate/cli"
rm -f literate-cli-*.tgz
bun pm pack >/dev/null
tarball="$(ls literate-cli-*.tgz | head -1)"
echo "    tarball: $tarball"

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
echo "==> installing into fresh project at $tmp"

cd "$tmp"
bun init -y >/dev/null 2>&1
bun add "$cli_root/$tarball" >/dev/null 2>&1

echo "==> literate --help"
./node_modules/.bin/literate --help

echo
echo "==> literate init consumer-repo (offline, bundled registry)"
./node_modules/.bin/literate init consumer-repo
test -f consumer-repo/.literate/LITERATE.md
test -f consumer-repo/.literate/manifest.json
test -d consumer-repo/.literate/tropes/session-start
test -d consumer-repo/.literate/tropes/session-end

echo
echo "==> smoke PASSED"

#!/bin/sh
# `install.sh` — install `@literate/cli` on macOS / Linux.
#
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/athrio-com/literate/main/install.sh | sh
#
#   curl -fsSL https://raw.githubusercontent.com/athrio-com/literate/main/install.sh \
#     | sh -s -- @0.1.0-alpha.1
#
# The optional `@<version>` argument pins the CLI version; default
# is `latest`.
#
# Per ADR-029 the CLI is Bun-only. This script bootstraps Bun via
# Bun's official installer if absent, then installs `@literate/cli`
# globally with `bun add -g`. Per ADR-035 this script + the sibling
# `install.ps1` are the canonical install path; direct
# `bun add -g @literate/cli` works too for users who already have
# Bun.

set -eu

VERSION="${1:-}"
SPEC="@literate/cli${VERSION}"

# ---------------------------------------------------------------------------
# Platform check

OS="$(uname -s 2>/dev/null || echo unknown)"
case "$OS" in
  Darwin|Linux)
    ;;
  *)
    echo "install.sh: unsupported OS '$OS'." >&2
    echo "  On Windows, run the PowerShell installer instead:" >&2
    echo "  irm https://raw.githubusercontent.com/athrio-com/literate/main/install.ps1 | iex" >&2
    exit 1
    ;;
esac

# ---------------------------------------------------------------------------
# Bun bootstrap

if ! command -v bun >/dev/null 2>&1; then
  echo "==> Bun not found; installing via https://bun.sh/install"
  curl -fsSL https://bun.sh/install | bash

  # Bun's installer writes its env-loader to ~/.bun/_bun (or sources
  # it into the shell rc). For this `sh` invocation, manually add
  # ~/.bun/bin to PATH so the subsequent `bun add -g` resolves.
  if [ -d "${HOME}/.bun/bin" ]; then
    PATH="${HOME}/.bun/bin:${PATH}"
    export PATH
  fi

  if ! command -v bun >/dev/null 2>&1; then
    echo "install.sh: Bun installation reported success but 'bun' is not on PATH." >&2
    echo "  Add ~/.bun/bin to your PATH, then re-run this script." >&2
    exit 1
  fi
fi

echo "==> using $(bun --version) at $(command -v bun)"

# ---------------------------------------------------------------------------
# Install @literate/cli

echo "==> installing ${SPEC}"
bun add -g "${SPEC}"

# ---------------------------------------------------------------------------
# Verify

if ! command -v literate >/dev/null 2>&1; then
  echo "install.sh: 'literate' is not on PATH after install." >&2
  echo "  Bun installs global bins to ~/.bun/bin; ensure that's on PATH." >&2
  exit 1
fi

echo "==> installed: $(literate --version 2>/dev/null || echo '(literate --version unavailable)')"
echo "    next: literate init my-project   # scaffold a fresh LF repo"

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
# globally with `bun add -g`. If ~/.bun/bin is not on PATH (common
# when Bun is managed via mise/asdf/volta rather than Bun's own
# installer), the script appends a PATH export to the user's shell
# rc so the binary is accessible in new shell sessions. Per ADR-035
# this script + the sibling `install.ps1` are the canonical install
# path.

set -eu

VERSION="${1:-}"
SPEC="@literate/cli${VERSION}"
BUN_BIN_DIR="${HOME}/.bun/bin"

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
# PATH-setup helper — idempotent, shell-aware.

ensure_bun_bin_on_path() {
  # Already on PATH? No-op.
  case ":${PATH}:" in
    *":${BUN_BIN_DIR}:"*)
      return 0
      ;;
  esac

  # Export for the rest of this script so `literate --version`
  # verification can find the binary.
  PATH="${BUN_BIN_DIR}:${PATH}"
  export PATH

  # Persist to the user's shell rc. `$SHELL` is the login shell,
  # which is what we want — this script itself runs under `sh`.
  shell_name="$(basename "${SHELL:-}")"
  case "$shell_name" in
    zsh)
      rc="${HOME}/.zshrc"
      line='export PATH="$HOME/.bun/bin:$PATH"'
      ;;
    bash)
      # macOS convention: .bash_profile. Linux: .bashrc.
      if [ "$OS" = "Darwin" ] && [ -f "${HOME}/.bash_profile" ]; then
        rc="${HOME}/.bash_profile"
      else
        rc="${HOME}/.bashrc"
      fi
      line='export PATH="$HOME/.bun/bin:$PATH"'
      ;;
    fish)
      rc="${HOME}/.config/fish/config.fish"
      line='fish_add_path "$HOME/.bun/bin"'
      mkdir -p "$(dirname "$rc")"
      ;;
    *)
      echo "install.sh: could not detect shell rc for SHELL='${SHELL:-}'." >&2
      echo "  Add the following to your shell config manually:" >&2
      echo "    export PATH=\"\$HOME/.bun/bin:\$PATH\"" >&2
      return 0
      ;;
  esac

  # Create rc if absent.
  [ -f "$rc" ] || touch "$rc"

  # Idempotence — skip if already referenced.
  if grep -qF ".bun/bin" "$rc" 2>/dev/null; then
    echo "==> ~/.bun/bin already referenced in $rc (not appending)"
    return 0
  fi

  {
    printf '\n%s\n' "# added by @literate/cli installer"
    printf '%s\n' "$line"
  } >> "$rc"

  echo "==> appended to $rc:"
  echo "      $line"
  echo "    run \`source $rc\` or open a new shell to use 'literate'"
}

# ---------------------------------------------------------------------------
# Bun bootstrap

if ! command -v bun >/dev/null 2>&1; then
  echo "==> Bun not found; installing via https://bun.sh/install"
  curl -fsSL https://bun.sh/install | bash

  # Bun's installer writes its own PATH line to the user's rc. For
  # this subshell, manually add ~/.bun/bin so `bun add -g` resolves.
  if [ -d "$BUN_BIN_DIR" ]; then
    PATH="${BUN_BIN_DIR}:${PATH}"
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
# PATH setup + verify

ensure_bun_bin_on_path

if ! command -v literate >/dev/null 2>&1; then
  echo "install.sh: 'literate' is not on PATH after install and PATH fix." >&2
  echo "  The binary should be at ~/.bun/bin/literate. Check with:" >&2
  echo "    ls -la ~/.bun/bin/literate" >&2
  exit 1
fi

echo "==> installed: $(literate --version 2>/dev/null || echo '(literate --version unavailable)')"
echo "    next: literate init my-project   # scaffold a fresh LF repo"

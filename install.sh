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
# globally with `bun add -g`. If ~/.bun/bin is not on PATH, the
# script appends a PATH export to the user's shell rc.
# Per ADR-035 this script + the sibling `install.ps1` are the
# canonical install path.

set -eu

VERSION="${1:-}"
SPEC="@literate/cli${VERSION}"
BUN_BIN_DIR="${HOME}/.bun/bin"

# ---------------------------------------------------------------------------
# Styling — ANSI escape codes, gracefully degrade if not a TTY.

if [ -t 1 ] && [ "${NO_COLOR:-}" = "" ]; then
  C_RESET="$(printf '\033[0m')"
  C_BOLD="$(printf '\033[1m')"
  C_DIM="$(printf '\033[2m')"
  C_GREEN="$(printf '\033[32m')"
  C_YELLOW="$(printf '\033[33m')"
  C_BLUE="$(printf '\033[34m')"
  C_CYAN="$(printf '\033[36m')"
  C_RED="$(printf '\033[31m')"
else
  C_RESET="" C_BOLD="" C_DIM="" C_GREEN="" C_YELLOW="" C_BLUE="" C_CYAN="" C_RED=""
fi

step()    { printf '%s▸%s %s\n'             "$C_BLUE"   "$C_RESET" "$1"; }
ok()      { printf '%s✓%s %s\n'             "$C_GREEN"  "$C_RESET" "$1"; }
warn()    { printf '%s!%s %s\n'             "$C_YELLOW" "$C_RESET" "$1" >&2; }
err()     { printf '%s✗%s %s\n'             "$C_RED"    "$C_RESET" "$1" >&2; }
hint()    { printf '  %s%s%s\n'             "$C_DIM"    "$1"        "$C_RESET"; }
header()  { printf '\n%s%s%s\n\n'           "$C_BOLD"   "$1"        "$C_RESET"; }
code()    { printf '  %s%s%s%s\n'           "$C_CYAN"   "$C_BOLD"   "$1" "$C_RESET"; }

# ---------------------------------------------------------------------------
# Platform check.

OS="$(uname -s 2>/dev/null || echo unknown)"
case "$OS" in
  Darwin|Linux) ;;
  *)
    err "unsupported OS: $OS"
    hint "On Windows, use the PowerShell installer:"
    code "irm https://raw.githubusercontent.com/athrio-com/literate/main/install.ps1 | iex"
    exit 1
    ;;
esac

# ---------------------------------------------------------------------------
# PATH-setup helper — idempotent, shell-aware.

NEED_SHELL_RELOAD=0
RC_FILE_USED=""

ensure_bun_bin_on_path() {
  case ":${PATH}:" in
    *":${BUN_BIN_DIR}:"*) return 0 ;;  # Already on PATH.
  esac

  PATH="${BUN_BIN_DIR}:${PATH}"
  export PATH

  shell_name="$(basename "${SHELL:-}")"
  case "$shell_name" in
    zsh)
      rc="${HOME}/.zshrc"
      line='export PATH="$HOME/.bun/bin:$PATH"'
      ;;
    bash)
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
      warn "unrecognized shell: ${SHELL:-unset}"
      hint "Add this line to your shell config manually:"
      code 'export PATH="$HOME/.bun/bin:$PATH"'
      return 0
      ;;
  esac

  [ -f "$rc" ] || touch "$rc"

  if grep -qF ".bun/bin" "$rc" 2>/dev/null; then
    return 0  # Already configured.
  fi

  {
    printf '\n%s\n' "# added by @literate/cli installer"
    printf '%s\n' "$line"
  } >> "$rc"

  NEED_SHELL_RELOAD=1
  RC_FILE_USED="$rc"
}

# ---------------------------------------------------------------------------
# Bun bootstrap.

if ! command -v bun >/dev/null 2>&1; then
  step "Bun not found — installing from bun.sh"
  curl -fsSL https://bun.sh/install | bash >/dev/null 2>&1 || {
    err "Bun installation failed"
    hint "Try installing Bun manually first:"
    code "curl -fsSL https://bun.sh/install | bash"
    exit 1
  }
  if [ -d "$BUN_BIN_DIR" ]; then
    PATH="${BUN_BIN_DIR}:${PATH}"
    export PATH
  fi
  if ! command -v bun >/dev/null 2>&1; then
    err "Bun installed but not on PATH"
    hint "Add ~/.bun/bin to your PATH and re-run this script."
    exit 1
  fi
  ok "Bun $(bun --version) installed"
else
  step "Bun $(bun --version) detected"
fi

# ---------------------------------------------------------------------------
# Install — suppress bun's PATH warning since we handle that ourselves.

step "Installing ${SPEC}"
INSTALL_LOG="$(mktemp -t literate-install.XXXXXX)"
trap 'rm -f "$INSTALL_LOG"' EXIT

if ! bun add -g "${SPEC}" >"$INSTALL_LOG" 2>&1; then
  err "Install failed:"
  sed 's/^/  /' "$INSTALL_LOG" >&2
  exit 1
fi

# ---------------------------------------------------------------------------
# PATH setup + final verification.

ensure_bun_bin_on_path

if ! command -v literate >/dev/null 2>&1; then
  err "Installed but 'literate' not findable on PATH"
  hint "Expected at: ~/.bun/bin/literate"
  hint "Try: ls -la ~/.bun/bin/literate"
  exit 1
fi

VERSION_INSTALLED="$(literate --version 2>/dev/null || echo unknown)"

# ---------------------------------------------------------------------------
# Success.

header "${C_GREEN}✓${C_RESET} ${C_BOLD}literate ${VERSION_INSTALLED}${C_RESET} ${C_DIM}installed${C_RESET}"

if [ "$NEED_SHELL_RELOAD" = "1" ]; then
  printf '%sYour shell config was updated.%s To use %sliterate%s in this shell:\n\n' \
    "$C_DIM" "$C_RESET" "$C_BOLD" "$C_RESET"
  code "source $RC_FILE_USED"
  printf '\n%sNew shells will pick it up automatically.%s\n\n' "$C_DIM" "$C_RESET"
fi

printf '%sNext:%s\n' "$C_BOLD" "$C_RESET"
code "literate init my-project"
printf '\n%sDocs:%s %shttps://github.com/athrio-com/literate%s\n' \
  "$C_DIM" "$C_RESET" "$C_CYAN" "$C_RESET"

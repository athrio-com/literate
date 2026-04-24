# install.ps1 — install `@literate/cli` on Windows (PowerShell).
#
# Usage:
#   irm https://raw.githubusercontent.com/athrio-com/literate/main/install.ps1 | iex
#
# To pin a version:
#   $env:LITERATE_VERSION='@0.1.0-alpha.1'; irm https://raw.githubusercontent.com/athrio-com/literate/main/install.ps1 | iex
#
# Per ADR-029 the CLI is Bun-only. This script bootstraps Bun via
# Bun's official PowerShell installer if absent, then installs
# `@literate/cli` globally with `bun add -g`. Per ADR-035 this
# script + the sibling `install.sh` are the canonical install
# path. Windows-native Bun support is treated as best-effort at
# 0.1.0-alpha; macOS / Linux is the verified target.

$ErrorActionPreference = 'Stop'

$Version = if ($env:LITERATE_VERSION) { $env:LITERATE_VERSION } else { '' }
$Spec = "@literate/cli$Version"

# ---------------------------------------------------------------------------
# Bun bootstrap

if (-not (Get-Command bun -ErrorAction SilentlyContinue)) {
  Write-Host '==> Bun not found; installing via https://bun.sh/install.ps1'
  Invoke-RestMethod https://bun.sh/install.ps1 | Invoke-Expression

  # Bun's installer writes to ~/.bun/bin and updates the user PATH;
  # this PowerShell session may need the new PATH explicitly.
  $bunBin = Join-Path $HOME '.bun\bin'
  if (Test-Path $bunBin) {
    $env:PATH = "$bunBin;$env:PATH"
  }

  if (-not (Get-Command bun -ErrorAction SilentlyContinue)) {
    Write-Error "install.ps1: Bun installation reported success but 'bun' is not on PATH. Add $bunBin to your PATH, then re-run this script."
    exit 1
  }
}

$bunVersion = & bun --version
$bunPath = (Get-Command bun).Source
Write-Host "==> using bun $bunVersion at $bunPath"

# ---------------------------------------------------------------------------
# Install @literate/cli

Write-Host "==> installing $Spec"
& bun add -g $Spec

# ---------------------------------------------------------------------------
# Verify

if (-not (Get-Command literate -ErrorAction SilentlyContinue)) {
  Write-Error "install.ps1: 'literate' is not on PATH after install. Bun installs global bins to ~/.bun/bin; ensure that's on PATH."
  exit 1
}

$litVersion = & literate --version
Write-Host "==> installed: $litVersion"
Write-Host '    next: literate init my-project   # scaffold a fresh LF repo'

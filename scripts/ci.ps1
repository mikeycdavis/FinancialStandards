#!/usr/bin/env pwsh
# The authoritative local CI command on Windows.
#
# This is a shim and nothing more. All of the logic lives in scripts/ci-docker.mjs, which is Node and
# therefore already runs on every platform this repository supports. Reimplementing the container
# lifecycle in PowerShell — and again in shell for POSIX — is how two wrappers come to disagree about
# what CI does, which is the failure this whole design exists to remove. On Linux or macOS, run
# `node scripts/ci-docker.mjs` directly; it is the same command.
#
#   .\scripts\ci.ps1
#   .\scripts\ci.ps1 --keep-on-failure
#   .\scripts\ci.ps1 --verbose

$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path -Parent $PSScriptRoot

& node (Join-Path $repoRoot 'scripts/ci-docker.mjs') @args
exit $LASTEXITCODE

#!/usr/bin/env pwsh
# Submit a pull request for a commit that has passed local CI, on Windows.
#
# A shim over scripts/submit-pr.mjs, for the same reason scripts/ci.ps1 is a shim: the exact-commit
# rule must have exactly one implementation. A second copy in PowerShell would be a second place for
# it to be subtly wrong, and the one that is wrong is the one that pushes.
#
#   .\scripts\submit-pr.ps1
#   .\scripts\submit-pr.ps1 --draft
#   .\scripts\submit-pr.ps1 --base develop
#   .\scripts\submit-pr.ps1 --title "..." --body "..."
#   .\scripts\submit-pr.ps1 --no-pr

$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path -Parent $PSScriptRoot

& node (Join-Path $repoRoot 'scripts/submit-pr.mjs') @args
exit $LASTEXITCODE

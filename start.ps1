# =====================================================================
#  Train a Tiny AI - Start the booth (Windows, fully offline)
# ---------------------------------------------------------------------
#  Serves the pre-built app on http://localhost:4173 and opens a
#  browser. Run install.ps1 first (once, with internet).
# =====================================================================

$ErrorActionPreference = 'Stop'
Set-Location -Path $PSScriptRoot

# Build if it hasn't been built yet.
if (-not (Test-Path (Join-Path $PSScriptRoot 'dist\index.html'))) {
    Write-Host "No build found - building now..." -ForegroundColor Yellow
    & npm run build
}

$url = 'http://localhost:4173'
Write-Host "Starting the booth at $url (offline)..." -ForegroundColor Cyan
Write-Host "Press Ctrl+C in this window to stop." -ForegroundColor DarkGray

# Open the browser shortly after the server starts.
Start-Job -ScriptBlock {
    Start-Sleep -Seconds 2
    Start-Process $using:url
} | Out-Null

# Serve the built app (no internet needed).
& npm run serve

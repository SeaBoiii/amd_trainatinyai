# =====================================================================
#  Train a Tiny AI - One-time installer (Windows)
# ---------------------------------------------------------------------
#  Run this ONCE on a machine that has internet access. It installs all
#  dependencies, vendors the offline AI runtime, and builds the app.
#  After this finishes, the booth runs FULLY OFFLINE with start.ps1.
# =====================================================================

$ErrorActionPreference = 'Stop'
Set-Location -Path $PSScriptRoot

function Write-Step([string]$msg) { Write-Host "`n=== $msg ===" -ForegroundColor Cyan }
function Write-Ok([string]$msg)   { Write-Host "  [OK] $msg"   -ForegroundColor Green }
function Write-Fail([string]$msg) { Write-Host "  [!!] $msg"   -ForegroundColor Red }

Write-Host "Train a Tiny AI - Installer" -ForegroundColor Yellow
Write-Host "---------------------------------------------"

# --- 1. Check Node.js ------------------------------------------------
Write-Step "Checking for Node.js"
$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) {
    Write-Fail "Node.js was not found."
    Write-Host "  Please install the LTS version (18 or newer) from:" -ForegroundColor Yellow
    Write-Host "    https://nodejs.org/en/download" -ForegroundColor Yellow
    Write-Host "  Then run this installer again." -ForegroundColor Yellow
    exit 1
}
$nodeVersion = (& node --version)
$major = [int]($nodeVersion.TrimStart('v').Split('.')[0])
if ($major -lt 18) {
    Write-Fail "Node.js $nodeVersion is too old. Please install version 18 or newer."
    exit 1
}
Write-Ok "Node.js $nodeVersion found."

# --- 2. Install dependencies (needs internet) ------------------------
Write-Step "Installing dependencies (this needs internet)"
if (Test-Path (Join-Path $PSScriptRoot 'package-lock.json')) {
    & npm ci
} else {
    & npm install
}
Write-Ok "Dependencies installed."

# --- 3. Vendor the offline AI runtime --------------------------------
Write-Step "Preparing the offline AI runtime"
& npm run copy-ort
Write-Ok "ONNX Runtime files copied to public\ort."

# --- 4. Build the production app -------------------------------------
Write-Step "Building the app"
& npm run build
Write-Ok "Build complete (output in 'dist')."

# --- Done ------------------------------------------------------------
Write-Host "`n=============================================" -ForegroundColor Green
Write-Host " Installation finished successfully!" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host "`nTo run the booth (works offline):" -ForegroundColor Yellow
Write-Host "    .\start.ps1" -ForegroundColor White
Write-Host ""

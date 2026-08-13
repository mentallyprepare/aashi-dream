$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

if (-not (Test-Path ".\node_modules")) {
  npm install --no-audit --no-fund
}

$api = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if (-not $api) {
  Start-Process -FilePath "npm.cmd" -ArgumentList @("run", "dev:api") -WorkingDirectory $root -WindowStyle Hidden -RedirectStandardOutput ".\api.log" -RedirectStandardError ".\api.err"
}

$web = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
if (-not $web) {
  Start-Process -FilePath "npm.cmd" -ArgumentList @("run", "dev:web", "--", "--host", "127.0.0.1") -WorkingDirectory $root -WindowStyle Hidden -RedirectStandardOutput ".\web.log" -RedirectStandardError ".\web.err"
}

Start-Sleep -Seconds 6

$apiHealth = Invoke-WebRequest -UseBasicParsing "http://127.0.0.1:3000/api/health" -TimeoutSec 8
$webHealth = Invoke-WebRequest -UseBasicParsing "http://127.0.0.1:5173" -TimeoutSec 8

Write-Host "API: $($apiHealth.StatusCode) http://127.0.0.1:3000"
Write-Host "WEB: $($webHealth.StatusCode) http://127.0.0.1:5173"

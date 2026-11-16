$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot

$devProcesses = @()
$listeners = @(Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue)
foreach ($listener in $listeners) {
  $owner = Get-CimInstance Win32_Process -Filter "ProcessId=$($listener.OwningProcess)" -ErrorAction SilentlyContinue
  if (-not $owner) { continue }
  if (-not $owner.CommandLine -or $owner.CommandLine -notmatch [regex]::Escape($projectRoot)) {
    throw "Port 3000 is owned by another process: PID $($listener.OwningProcess)."
  }
  $devProcesses += $owner
  $parent = Get-CimInstance Win32_Process -Filter "ProcessId=$($owner.ParentProcessId)" -ErrorAction SilentlyContinue
  if ($parent -and $parent.CommandLine -match 'next (dev|start)') { $devProcesses += $parent }
}

foreach ($process in $devProcesses) {
  Stop-Process -Id $process.ProcessId -Force -ErrorAction SilentlyContinue
}

$projectPattern = [regex]::Escape($projectRoot)
$projectProcesses = @(Get-CimInstance Win32_Process | Where-Object {
  $_.CommandLine -and $_.CommandLine -match $projectPattern -and $_.CommandLine -match 'next|npm'
})
foreach ($process in $projectProcesses) {
  Stop-Process -Id $process.ProcessId -Force -ErrorAction SilentlyContinue
}

Start-Sleep -Seconds 2

try {
  Push-Location $projectRoot
  & npm.cmd run build:next
  if ($LASTEXITCODE -ne 0) { throw "next build failed with exit code $LASTEXITCODE" }
} finally {
  Pop-Location
  & powershell.exe -ExecutionPolicy Bypass -File (Join-Path $projectRoot 'scripts/start-local.ps1')
}

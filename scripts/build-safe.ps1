$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot

$devProcesses = @()
$listeners = @(Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue)
foreach ($listener in $listeners) {
  # Windows can briefly expose a duplicate/closing TCP row with owner PID 0.
  # It is not a real process and must not block the verified project listener.
  if ($listener.OwningProcess -eq 0) { continue }
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
  $standaloneRoot = Join-Path $projectRoot '.next\standalone'
  $standaloneStatic = Join-Path $standaloneRoot '.next\static'
  $standalonePublic = Join-Path $standaloneRoot 'public'
  New-Item -ItemType Directory -Force -Path $standaloneStatic, $standalonePublic | Out-Null
  Copy-Item -Path (Join-Path $projectRoot '.next\static\*') -Destination $standaloneStatic -Recurse -Force
  Copy-Item -Path (Join-Path $projectRoot 'public\*') -Destination $standalonePublic -Recurse -Force
} finally {
  Pop-Location
  & powershell.exe -ExecutionPolicy Bypass -File (Join-Path $projectRoot 'scripts/start-local.ps1')
}

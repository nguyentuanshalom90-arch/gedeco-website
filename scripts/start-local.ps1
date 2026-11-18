param(
  [int]$Port = 3000
)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$logPath = Join-Path $projectRoot '.local-preview.log'
$errorLogPath = Join-Path $projectRoot '.local-preview.error.log'
$url = "http://127.0.0.1:$Port/lien-he"
$projectPattern = [regex]::Escape($projectRoot)

function Get-ProjectProcesses {
  @(Get-CimInstance Win32_Process | Where-Object {
    $_.CommandLine -and $_.CommandLine -match $projectPattern -and $_.CommandLine -match 'next|npm'
  })
}

function Test-LocalServer {
  try {
    $response = Invoke-WebRequest -UseBasicParsing $url -MaximumRedirection 0 -TimeoutSec 3
    if ($response.StatusCode -ne 200) { return $false }

    $cssPaths = [regex]::Matches($response.Content, '/_next/static/css/[^" ]+\.css') | ForEach-Object { $_.Value } | Select-Object -Unique
    if (-not $cssPaths) { return $false }

    $validCss = $false
    foreach ($cssPath in $cssPaths) {
      $cssResponse = Invoke-WebRequest -UseBasicParsing ("http://127.0.0.1:$Port" + $cssPath) -MaximumRedirection 0 -TimeoutSec 3
      if ($cssResponse.StatusCode -eq 200 -and $cssResponse.Content.Length -gt 1000) {
        $validCss = $true
      }
      if ($cssResponse.Content -match 'contact-card-grid') {
        return $true
      }
    }

    return $false
  } catch {
    return $false
  }
}

if (Test-LocalServer) {
  Write-Output "Local server is already healthy at http://localhost:$Port"
  exit 0
}

foreach ($process in (Get-ProjectProcesses)) {
  Stop-Process -Id $process.ProcessId -Force -ErrorAction SilentlyContinue
}

Start-Sleep -Seconds 2

$listeners = @(Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue)
foreach ($listener in $listeners) {
  # Windows can briefly keep a closing TCP row owned by PID 0. It is not a
  # real process and must not prevent the verified local preview from starting.
  if ($listener.OwningProcess -eq 0) { continue }
  $process = Get-CimInstance Win32_Process -Filter "ProcessId=$($listener.OwningProcess)" -ErrorAction SilentlyContinue
  if ($process -and $process.CommandLine -and $process.CommandLine.Contains($projectRoot) -and $process.CommandLine.Contains('next')) {
    Stop-Process -Id $listener.OwningProcess -Force -ErrorAction SilentlyContinue
  } elseif ($process) {
    throw "Port $Port is already used by another process: PID $($listener.OwningProcess)."
  }
}

Remove-Item -LiteralPath $logPath -Force -ErrorAction SilentlyContinue
Remove-Item -LiteralPath $errorLogPath -Force -ErrorAction SilentlyContinue

$env:PORT = "$Port"
$env:HOSTNAME = '127.0.0.1'
$localEnvPath = Join-Path $projectRoot '.env.local'
if (Test-Path -LiteralPath $localEnvPath) {
  foreach ($line in Get-Content -LiteralPath $localEnvPath) {
    if ($line -match '^([A-Z_][A-Z0-9_]*)=(.*)$') {
      $key = $matches[1]
      $value = $matches[2].Trim()
      if (($value.StartsWith('"') -and $value.EndsWith('"')) -or ($value.StartsWith("'") -and $value.EndsWith("'"))) {
        $value = $value.Substring(1, $value.Length - 2)
      }
      [Environment]::SetEnvironmentVariable($key, $value, 'Process')
    }
  }
}
if ([string]::IsNullOrWhiteSpace($env:MEDIA_ROOT)) {
  $env:MEDIA_ROOT = Join-Path $projectRoot '.uploads'
}
$env:LOCAL_PREVIEW = '1'
$standaloneServer = Join-Path $projectRoot '.next\standalone\server.js'
Start-Process -FilePath 'node.exe' `
  -ArgumentList @("`"$standaloneServer`"") `
  -WorkingDirectory $projectRoot `
  -WindowStyle Hidden `
  -RedirectStandardOutput $logPath `
  -RedirectStandardError $errorLogPath | Out-Null

for ($attempt = 0; $attempt -lt 30; $attempt++) {
  Start-Sleep -Seconds 1
  if (Test-LocalServer) {
    Write-Output "Local server started at http://localhost:$Port"
    exit 0
  }
}

throw "Local server did not become healthy. Check $logPath and $errorLogPath."

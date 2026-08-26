$ErrorActionPreference = 'Stop'
$repo = (Resolve-Path (Join-Path $PSScriptRoot '..\..\..')).Path
$output = Join-Path $PSScriptRoot 'task-4-browser-smoke-round-1-output.txt'
$port = 8124
$server = $null

if (Test-Path -LiteralPath $output) {
  Remove-Item -LiteralPath $output -Force
}

function Write-CapturedLine([string] $line) {
  $line | Tee-Object -FilePath $output -Append
}

function Invoke-CapturedTool([string] $label, [string[]] $arguments) {
  Write-CapturedLine ("COMMAND[$label]: npx " + ($arguments -join ' '))
  & npx @arguments 2>&1 | Tee-Object -FilePath $output -Append
  $exitCode = $LASTEXITCODE
  Write-CapturedLine ("EXIT[$label]: $exitCode")
  if ($exitCode -ne 0) {
    throw "$label failed with exit code $exitCode."
  }
}

try {
  Set-Location $repo
  Write-CapturedLine "TASK_4_BROWSER_SMOKE_ROUND_1_START"
  Write-CapturedLine "REPOSITORY: $repo"
  Write-CapturedLine "URL: http://127.0.0.1:$port/index.html"
  $server = Start-Process -FilePath 'python' -ArgumentList '-m', 'http.server', $port, '--bind', '127.0.0.1' -WorkingDirectory $repo -PassThru
  $ready = $false
  for ($attempt = 0; $attempt -lt 20; $attempt++) {
    try {
      $response = Invoke-WebRequest -UseBasicParsing "http://127.0.0.1:$port/index.html"
      if ($response.StatusCode -eq 200) { $ready = $true; break }
    } catch {
      Start-Sleep -Milliseconds 250
    }
  }
  if (-not $ready) { throw 'Local HTTP server did not become ready.' }

  $url = "http://127.0.0.1:$port/index.html"
  Invoke-CapturedTool 'open' @('--yes', '@playwright/cli', 'open', $url)
  Invoke-CapturedTool 'normal-assertion' @('--yes', '@playwright/cli', 'run-code', '--filename', (Join-Path $PSScriptRoot 'task-4-browser-normal.mjs'))
  Invoke-CapturedTool 'reduced-motion-assertion' @('--yes', '@playwright/cli', 'run-code', '--filename', (Join-Path $PSScriptRoot 'task-4-browser-reduced.mjs'))
  Invoke-CapturedTool 'console' @('--yes', '@playwright/cli', 'console')
  Invoke-CapturedTool 'requests' @('--yes', '@playwright/cli', 'requests', '--static')
  Invoke-CapturedTool 'close' @('--yes', '@playwright/cli', 'close')
  Write-CapturedLine 'BROWSER_SMOKE_RESULT=PASS'
} finally {
  if ($server -and -not $server.HasExited) {
    Stop-Process -Id $server.Id -Force
  }
}

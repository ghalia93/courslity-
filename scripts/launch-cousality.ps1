$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path -Parent $PSScriptRoot
$XamppRoot = "C:\xampp"
$SiteUrl = "http://localhost:3000"

function Test-PortListening {
  param([int]$Port)

  return [bool](Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue)
}

function Wait-ForPort {
  param(
    [int]$Port,
    [int]$TimeoutSeconds = 30
  )

  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
  while ((Get-Date) -lt $deadline) {
    if (Test-PortListening -Port $Port) {
      return $true
    }
    Start-Sleep -Seconds 1
  }

  return $false
}

function Start-XamppService {
  param(
    [string]$Name,
    [int]$Port,
    [string]$FilePath,
    [string[]]$ArgumentList = @()
  )

  if (Test-PortListening -Port $Port) {
    Write-Host "$Name is already running on port $Port." -ForegroundColor Green
    return
  }

  if (-not (Test-Path -LiteralPath $FilePath)) {
    throw "$Name executable was not found: $FilePath"
  }

  Write-Host "Starting $Name..." -ForegroundColor Cyan
  if ($ArgumentList.Count -gt 0) {
    Start-Process -FilePath $FilePath -ArgumentList $ArgumentList -WorkingDirectory $XamppRoot -WindowStyle Hidden | Out-Null
  } else {
    Start-Process -FilePath $FilePath -WorkingDirectory $XamppRoot -WindowStyle Hidden | Out-Null
  }

  if (Wait-ForPort -Port $Port -TimeoutSeconds 30) {
    Write-Host "$Name is running on port $Port." -ForegroundColor Green
    return
  }

  throw "$Name did not start on port $Port."
}

function Wait-ForSite {
  param(
    [string]$Url,
    [int]$TimeoutSeconds = 90
  )

  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
  while ((Get-Date) -lt $deadline) {
    try {
      $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 5
      if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 500) {
        return $true
      }
    } catch {
      Start-Sleep -Seconds 1
    }
  }

  return $false
}

Write-Host ""
Write-Host "Launching Cousality..." -ForegroundColor Cyan
Write-Host "Project: $ProjectRoot"
Write-Host ""

if (-not (Test-Path -LiteralPath (Join-Path $ProjectRoot "package.json"))) {
  throw "Could not find package.json in $ProjectRoot"
}

$apacheExe = Join-Path $XamppRoot "apache\bin\httpd.exe"
$mysqlExe = Join-Path $XamppRoot "mysql\bin\mysqld.exe"
$mysqlIni = Join-Path $XamppRoot "mysql\bin\my.ini"

Start-XamppService -Name "Apache" -Port 80 -FilePath $apacheExe
Start-XamppService -Name "MySQL" -Port 3306 -FilePath $mysqlExe -ArgumentList @("--defaults-file=$mysqlIni", "--standalone")

if (-not (Get-Command npm.cmd -ErrorAction SilentlyContinue)) {
  throw "npm was not found in PATH. Install Node.js or open this from a Node-enabled terminal."
}

if (-not (Test-Path -LiteralPath (Join-Path $ProjectRoot "node_modules"))) {
  Write-Host "Installing project dependencies..." -ForegroundColor Cyan
  Push-Location $ProjectRoot
  try {
    npm install
  } finally {
    Pop-Location
  }
}

if (Test-PortListening -Port 3000) {
  Write-Host "Next.js is already running on port 3000." -ForegroundColor Green
} else {
  Write-Host "Starting Next.js dev server..." -ForegroundColor Cyan
  $escapedProjectRoot = $ProjectRoot.Replace("'", "''")
  $serverCommand = "Set-Location -LiteralPath '$escapedProjectRoot'; npm run dev"
  Start-Process -FilePath "powershell.exe" -ArgumentList @(
    "-NoExit",
    "-NoProfile",
    "-ExecutionPolicy",
    "Bypass",
    "-Command",
    $serverCommand
  ) -WorkingDirectory $ProjectRoot | Out-Null
}

Write-Host "Waiting for the website..." -ForegroundColor Cyan
if (Wait-ForSite -Url $SiteUrl -TimeoutSeconds 90) {
  Write-Host "Opening $SiteUrl" -ForegroundColor Green
} else {
  Write-Host "The browser will open now, but Next.js may still be compiling." -ForegroundColor Yellow
}

Start-Process $SiteUrl
Write-Host ""
Write-Host "Done. Keep the Next.js server window open while you work." -ForegroundColor Green

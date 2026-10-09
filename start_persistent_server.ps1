# UniSphere AI - Persistent Background Service Launcher
# Launches the FastAPI server and Cloudflare tunnel as detached Windows background processes.
# These will continue running even after this script and terminal are completely terminated.

$ErrorActionPreference = "Stop"
$WorkingDir = "c:\Users\NITHIN\Downloads\kmpg"
Set-Location $WorkingDir

Write-Host "Stopping any existing background instances..."
Get-Process pythonw, cloudflared -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 1

# 1. Clear old tunnel log
$LogFile = "$WorkingDir\cloudflared.log"
if (Test-Path $LogFile) {
    Remove-Item $LogFile -Force
}

# 2. Launch FastAPI backend in background with pythonw (headless)
Write-Host "Starting UniSphere server in detached background process..."
$PythonwPath = "$WorkingDir\venv\Scripts\pythonw.exe"
$ServerProc = Start-Process -FilePath $PythonwPath -ArgumentList "run.py" -WorkingDirectory $WorkingDir -WindowStyle Hidden -PassThru
Write-Host "Server started with PID: $($ServerProc.Id)"

# 3. Wait for localhost:8000 to be ready
$Retries = 15
$Ready = $false
while ($Retries -gt 0) {
    try {
        $resp = Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/health" -UseBasicParsing -TimeoutSec 2
        if ($resp.StatusCode -eq 200) {
            $Ready = $true
            break
        }
    } catch {
        Start-Sleep -Seconds 1
        $Retries--
    }
}

if (-not $Ready) {
    Write-Error "Server failed to start on port 8000."
    exit 1
}
Write-Host "UniSphere local server is verified healthy."

# 4. Launch Cloudflare Tunnel as detached background process
Write-Host "Launching persistent Cloudflare tunnel..."
$CloudflaredPath = "$WorkingDir\cloudflared.exe"
$TunnelProc = Start-Process -FilePath $CloudflaredPath -ArgumentList "tunnel --url http://127.0.0.1:8000 --logfile `"$LogFile`"" -WorkingDirectory $WorkingDir -WindowStyle Hidden -PassThru
Write-Host "Tunnel started with PID: $($TunnelProc.Id)"

# 5. Extract the generated public URL from log
$Url = $null
$WaitSec = 20
while ($WaitSec -gt 0) {
    Start-Sleep -Seconds 1
    if (Test-Path $LogFile) {
        $content = Get-Content $LogFile -Raw -ErrorAction SilentlyContinue
        if ($content -match "https://[a-zA-Z0-9\-]+\.trycloudflare\.com") {
            $Url = $matches[0]
            break
        }
    }
    $WaitSec--
}

if ($Url) {
    Write-Host "`n======================================================="
    Write-Host "  PERSISTENT DEPLOYMENT ONLINE (TERMINAL-INDEPENDENT)  "
    Write-Host "======================================================="
    Write-Host "  Public Live URL: $Url"
    Write-Host "  Localhost URL:   http://localhost:8000"
    Write-Host "  Background PIDs: Server=$($ServerProc.Id), Tunnel=$($TunnelProc.Id)"
    Write-Host "=======================================================`n"
    Set-Content -Path "$WorkingDir\DEPLOYED_URL.txt" -Value $Url
} else {
    Write-Error "Tunnel URL could not be detected. Check $LogFile."
}

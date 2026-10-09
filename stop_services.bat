@echo off
echo Stopping UniSphere background server and cloudflared processes...
taskkill /F /IM python.exe /T 2>nul
taskkill /F /IM pythonw.exe /T 2>nul
taskkill /F /IM cloudflared.exe /T 2>nul
echo All background services stopped.
pause

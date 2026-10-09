@echo off
cd /d "%~dp0"
cscript //nologo run_silent_background.vbs
echo ========================================================
echo UniSphere Background Daemon Launched Successfully!
echo Running completely independent of this terminal window.
echo You can now safely close this terminal at any time.
echo ========================================================
pause

@echo off
title UniSphere AI - Student Success Intelligence Platform
echo =====================================================================
echo    Starting UniSphere AI (Single Unified Project)
echo    KPMG in India Challenge ^| HacXLerate 2026
echo =====================================================================
echo.
echo Launching unified server at http://localhost:8000 ...
echo.

if exist ".\venv\Scripts\python.exe" (
    ".\venv\Scripts\python.exe" run.py
) else (
    python run.py
)

pause

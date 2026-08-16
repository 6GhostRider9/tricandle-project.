@echo off
title TriCandle Backend
color 0B

echo.
echo  =========================================
echo   TRICANDLE - 3-Candle Price Action AI
echo   Backend Server Starting...
echo  =========================================
echo.

cd /d "%~dp0backend"

REM Activate virtual environment
if exist "venv\Scripts\activate.bat" (
    call venv\Scripts\activate.bat
    echo  [OK] Virtual environment activated
) else (
    echo  [!] venv not found - trying global Python
)

echo  [OK] Starting FastAPI on http://localhost:8000
echo  [OK] Press Ctrl+C to stop the server
echo.

python -m uvicorn main:app --reload --port 8000

pause

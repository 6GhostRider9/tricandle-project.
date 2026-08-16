@echo off
title TriCandle Frontend
color 0B

echo.
echo  =========================================
echo   TRICANDLE - 3-Candle Price Action AI
echo   Frontend Dev Server Starting...
echo  =========================================
echo.

cd /d "%~dp0frontend"

echo  [OK] Installing dependencies (first run only)...
call npm install

echo.
echo  [OK] Starting frontend on http://localhost:5173
echo  [OK] Open your browser to http://localhost:5173
echo  [OK] Press Ctrl+C to stop
echo.

call npm run dev

pause

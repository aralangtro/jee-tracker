@echo off
title JEE Tracker Server
color 0B
echo.
echo  =============================================
echo   JEE TRACKER v2.0 — Starting Server...
echo  =============================================
echo.
cd /d "%~dp0"
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo  [ERROR] Node.js not found. Please install Node.js first.
    pause
    exit /b 1
)
if not exist "node_modules" (
    echo  Installing dependencies...
    npm install
    echo.
)
echo  Server starting on http://localhost:5714
echo  Press Ctrl+C to stop.
echo.
start "" http://localhost:5714
node server.js
pause

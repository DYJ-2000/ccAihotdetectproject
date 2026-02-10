@echo off
setlocal enabledelayedexpansion
echo ========================================
echo    AI Hotspot Tool - Start
echo ========================================
echo.

echo [1/4] Checking and clearing port usage...

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do (
    taskkill /F /PID %%a 2>nul
    if !errorlevel! equ 0 (
        echo     Closed process on port 3001 (PID: %%a)
    )
)

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173') do (
    taskkill /F /PID %%a 2>nul
    if !errorlevel! equ 0 (
        echo     Closed process on port 5173 (PID: %%a)
    )
)

echo.

echo [2/4] Starting backend service...
start "AI Hotspot Backend" cmd /k "cd /d %~dp0backend && npm run dev"
echo     Backend service started (http://localhost:3001)
echo.

echo [3/4] Starting frontend service...
start "AI Hotspot Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"
echo     Frontend service started (http://localhost:5173)
echo.

echo [4/4] Startup complete!
echo.
echo ========================================
echo   App URL:  http://localhost:5173
echo   API URL:  http://localhost:3001
echo ========================================
echo.
echo Press any key to close this window (services will keep running)...
pause >nul

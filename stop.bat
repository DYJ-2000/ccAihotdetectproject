@echo off
setlocal enabledelayedexpansion
echo ========================================
echo    AI Hotspot Tool - Stop
echo ========================================
echo.
echo Stopping all services...

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do (
    taskkill /F /PID %%a 2>nul
    if !errorlevel! equ 0 (
        echo     Stopped backend service (PID: %%a, Port: 3001)
    )
)

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173') do (
    taskkill /F /PID %%a 2>nul
    if !errorlevel! equ 0 (
        echo     Stopped frontend service (PID: %%a, Port: 5173)
    )
)

echo.
echo All services stopped!

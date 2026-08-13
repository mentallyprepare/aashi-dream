@echo off
title Anushka OS
cd /d "%~dp0"

echo Starting Anushka OS...
echo.
echo Correct local app URL:
echo   http://127.0.0.1:5173/
echo.
echo Note: http://127.0.0.1:4173/index.html is an old stale preview URL.
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0dev-start.ps1"

echo.
echo Opening Anushka OS...
start "" "http://127.0.0.1:5173/"
echo.
echo Keep this window for status. Close hidden npm windows from Task Manager only if you need to stop servers.
pause

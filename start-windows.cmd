@echo off
setlocal

cd /d "%~dp0"
set "PORT=8788"
set "DATA_FILE=%~dp0data\static-data.json"

where powershell >nul 2>nul
if errorlevel 1 (
  echo Windows PowerShell is required to run this app.
  pause
  exit /b 1
)

echo Starting Knjigovodstveni asistent...
echo.

if not "%~1"=="" (
  set "DATA_FILE=%~1"
)

if exist "%DATA_FILE%" (
  echo Using static JSON data:
  echo %DATA_FILE%
  powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\static-preview.ps1" -Data "%DATA_FILE%" -Port %PORT% -Open
) else (
  echo No JSON file found at:
  echo %DATA_FILE%
  echo.
  echo The app will start with an empty browser session.
  powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\static-preview.ps1" -Port %PORT% -Open
)

echo.
echo Server stopped.
pause

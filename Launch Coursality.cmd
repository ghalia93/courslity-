@echo off
setlocal

set "SCRIPT=%~dp0scripts\launch-coursality.ps1"

if not exist "%SCRIPT%" (
  echo Could not find launcher script:
  echo %SCRIPT%
  echo.
  pause
  exit /b 1
)

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%SCRIPT%"

echo.
pause

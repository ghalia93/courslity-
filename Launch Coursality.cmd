@echo off
setlocal EnableExtensions EnableDelayedExpansion
title Coursality Launcher

set "PROJECT_DIR=%~dp0"
if not exist "%PROJECT_DIR%package.json" (
  set "PROJECT_DIR=C:\Users\ThinkPad\Documents\senior\coursality"
)

if not exist "%PROJECT_DIR%\package.json" (
  echo Could not find the Coursality project folder.
  echo Expected:
  echo %PROJECT_DIR%
  echo.
  pause
  exit /b 1
)

set "XAMPP_DIR=C:\xampp"
if not exist "%XAMPP_DIR%\xampp-control.exe" (
  set "XAMPP_DIR=C:\XAMPP"
)

echo Starting Coursality...
echo Project: %PROJECT_DIR%
echo.

if exist "%XAMPP_DIR%\xampp-control.exe" (
  set "APACHE_RUNNING=0"
  set "MYSQL_RUNNING=0"

  powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "if (Get-NetTCPConnection -LocalPort 80 -State Listen -ErrorAction SilentlyContinue) { exit 0 } else { exit 1 }"
  if not errorlevel 1 set "APACHE_RUNNING=1"

  powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "if (Get-NetTCPConnection -LocalPort 3306 -State Listen -ErrorAction SilentlyContinue) { exit 0 } else { exit 1 }"
  if not errorlevel 1 set "MYSQL_RUNNING=1"

  if "!APACHE_RUNNING!"=="1" if "!MYSQL_RUNNING!"=="1" (
    echo Apache and MySQL are already running. Skipping XAMPP startup.
  ) else (
    echo Opening XAMPP...
    start "" "%XAMPP_DIR%\xampp-control.exe"

    if "!APACHE_RUNNING!"=="0" (
      echo Starting Apache...
      powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "Start-Process -FilePath '%XAMPP_DIR%\apache_start.bat' -WorkingDirectory '%XAMPP_DIR%' -WindowStyle Minimized"
    )

    if "!MYSQL_RUNNING!"=="0" (
      echo Starting MySQL...
      powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "Start-Process -FilePath '%XAMPP_DIR%\mysql_start.bat' -WorkingDirectory '%XAMPP_DIR%' -WindowStyle Minimized"
    )
  )

  echo Waiting for Apache on port 80...
  powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "$deadline = (Get-Date).AddSeconds(30); while ((Get-Date) -lt $deadline) { if (Get-NetTCPConnection -LocalPort 80 -State Listen -ErrorAction SilentlyContinue) { exit 0 }; Start-Sleep -Seconds 1 }; exit 1"
  if errorlevel 1 (
    echo.
    echo Apache did not start. In the XAMPP Control Panel, click Start next to Apache,
    echo then run this launcher again.
    echo.
    pause
    exit /b 1
  )

  echo Waiting for MySQL on port 3306...
  powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "$deadline = (Get-Date).AddSeconds(30); while ((Get-Date) -lt $deadline) { if (Get-NetTCPConnection -LocalPort 3306 -State Listen -ErrorAction SilentlyContinue) { exit 0 }; Start-Sleep -Seconds 1 }; exit 1"
  if errorlevel 1 (
    echo.
    echo MySQL did not start. In the XAMPP Control Panel, click Start next to MySQL,
    echo then run this launcher again.
    echo.
    pause
    exit /b 1
  )
) else (
  echo XAMPP was not found in C:\xampp or C:\XAMPP.
  echo The website can still start, but database pages may not work.
  echo.
)

powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "if (Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue) { exit 0 } else { exit 1 }"
if "%ERRORLEVEL%"=="0" (
  echo Coursality is already running.
  start "" "http://127.0.0.1:3000"
  echo.
  pause
  exit /b 0
)

where npm.cmd >nul 2>nul
if errorlevel 1 (
  echo npm was not found. Please install Node.js, then run this launcher again.
  echo.
  pause
  exit /b 1
)

cd /d "%PROJECT_DIR%"

if not exist "node_modules" (
  echo Installing project packages...
  call npm.cmd install
  if errorlevel 1 (
    echo.
    echo Package installation failed.
    pause
    exit /b 1
  )
)

echo Opening Coursality in your browser...
start "" powershell.exe -NoProfile -WindowStyle Hidden -Command "Start-Sleep -Seconds 6; Start-Process 'http://127.0.0.1:3000'"

echo.
echo Keep this window open while using Coursality.
echo Press Ctrl+C in this window when you want to stop the website.
echo.
call npm.cmd run dev -- --hostname 127.0.0.1 --port 3000

echo.
pause

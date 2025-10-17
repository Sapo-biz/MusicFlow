@echo off
title MusicFlow Launcher
color 0A

echo.
echo  ========================================
echo           MusicFlow Launcher
echo  ========================================
echo.
echo  Starting MusicFlow...
echo.

REM Check if Python is available
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo  Using Python server...
    start http://localhost:8000
    python server.py
) else (
    REM Fallback to opening the HTML file directly
    echo  Opening MusicFlow directly...
    start launch.html
)

echo.
echo  MusicFlow should now be opening in your browser!
echo  If it doesn't open automatically, navigate to:
echo  - http://localhost:8000 (if using Python server)
echo  - Or open launch.html directly
echo.
pause

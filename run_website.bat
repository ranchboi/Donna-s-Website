@echo off
echo Starting local web server for Donna's Website...
echo.
echo The website will open automatically in your default browser.
echo To stop the server, press Ctrl+C in this window.
echo.
echo Server URL: http://localhost:8000
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Python is not installed or not in PATH.
    echo Please install Python from https://python.org
    echo.
    pause
    exit /b 1
)

REM Start Python HTTP server and open browser
start http://localhost:8000
python -m http.server 8000

pause

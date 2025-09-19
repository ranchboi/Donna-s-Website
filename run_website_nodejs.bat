@echo off
echo Starting local web server for Donna's Website using Node.js...
echo.
echo The website will open automatically in your default browser.
echo To stop the server, press Ctrl+C in this window.
echo.
echo Server URL: http://localhost:3000
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js is not installed or not in PATH.
    echo Please install Node.js from https://nodejs.org
    echo.
    echo Alternatively, use run_website.bat if you have Python installed.
    echo.
    pause
    exit /b 1
)

REM Check if http-server is installed globally
npx http-server --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing http-server...
    npm install -g http-server
)

REM Start Node.js HTTP server and open browser
start http://localhost:3000
npx http-server -p 3000 -o

pause

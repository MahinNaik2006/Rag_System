@echo off
echo ================================
echo   AI Tutor Frontend Setup
echo ================================
echo.

echo Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from: https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js found: 
node --version

echo.
echo Installing dependencies...
npm install

if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo ================================
echo   Setup Complete! 
echo ================================
echo.
echo To start the development server, run:
echo   npm run dev
echo.
echo Then open http://localhost:5173 in your browser
echo.
pause
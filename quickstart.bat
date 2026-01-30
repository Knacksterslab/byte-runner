@echo off
REM Byte Runner - Quick Start Script for Windows
REM This script helps you get started quickly

echo.
echo 🎮 Byte Runner Quick Start
echo ==========================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed
    echo Please install Node.js 18+ from https://nodejs.org
    pause
    exit /b 1
)

echo ✅ Node.js installed
node --version
echo.

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ npm is not installed
    pause
    exit /b 1
)

echo ✅ npm installed
npm --version
echo.

REM Install dependencies if needed
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    call npm install
    echo.
)

echo ✅ Dependencies installed
echo.

REM Ask user what they want to do
echo What would you like to do?
echo 1) Start development server
echo 2) Build for production
echo 3) Start production server (must build first)
echo.
set /p choice="Enter choice (1-3): "

if "%choice%"=="1" (
    echo.
    echo 🚀 Starting development server...
    echo Visit http://localhost:3000 when ready
    echo.
    call npm run dev
) else if "%choice%"=="2" (
    echo.
    echo 🔨 Building for production...
    call npm run build
    echo.
    echo ✅ Build complete!
    echo Run this script again and choose option 3 to start production server
    pause
) else if "%choice%"=="3" (
    echo.
    echo 🚀 Starting production server...
    echo Visit http://localhost:3000
    echo.
    call npm start
) else (
    echo.
    echo ❌ Invalid choice
    pause
    exit /b 1
)

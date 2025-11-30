@echo off
REM Start Firebase Emulator Suite for Windows
REM This script starts all Firebase emulators for local development

echo Starting Firebase Emulator Suite...
echo.
echo Emulators will be available at:
echo   - Emulator UI: http://localhost:4000
echo   - Auth: http://localhost:9099
echo   - Firestore: http://localhost:8080
echo   - Storage: http://localhost:9199
echo.

REM Check if Firebase CLI is installed
where firebase >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Firebase CLI is not installed
    echo Install it with: npm install -g firebase-tools
    exit /b 1
)

REM Start emulators
firebase emulators:start --import=./emulator-data --export-on-exit

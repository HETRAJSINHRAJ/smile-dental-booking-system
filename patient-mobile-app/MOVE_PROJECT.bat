@echo off
echo ========================================
echo Moving Project to Shorter Path
echo ========================================
echo.
echo Current path is too long for Windows build tools.
echo This script will help you move the project.
echo.
echo Recommended new location: C:\dental-app
echo.
pause

set /p NEW_PATH="Enter new path (e.g., C:\dental-app): "

echo.
echo Creating directory: %NEW_PATH%
mkdir "%NEW_PATH%" 2>nul

echo.
echo Copying project files...
echo This may take a few minutes...
xcopy /E /I /H /Y "%~dp0" "%NEW_PATH%"

echo.
echo ========================================
echo Project copied to: %NEW_PATH%
echo ========================================
echo.
echo Next steps:
echo 1. Open a new terminal
echo 2. cd %NEW_PATH%
echo 3. npm install
echo 4. npm run android
echo.
pause

@echo off
echo ========================================
echo   StreamVerse X - Starting Frontend
echo ========================================
echo.

cd /d "%~dp0frontend"

echo ========================================
echo   Starting StreamVerse Frontend...
echo ========================================
echo.
echo Frontend will start on: http://localhost:5173
echo Press Ctrl+C to stop
echo.

npm run dev

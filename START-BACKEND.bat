@echo off
echo ========================================
echo   StreamVerse X - Starting Backend
echo ========================================
echo.

cd /d "%~dp0backend"

echo Checking MongoDB...
mongosh --eval "db.runCommand({ ping: 1 })" --quiet >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] MongoDB is not running!
    echo Please start MongoDB first: mongod
    pause
    exit /b 1
)
echo [OK] MongoDB is running

echo.
echo Checking Redis...
redis-cli ping >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Redis is not running!
    echo Please start Redis first: redis-server
    pause
    exit /b 1
)
echo [OK] Redis is running

echo.
echo ========================================
echo   Starting StreamVerse Backend...
echo ========================================
echo.
echo Backend will start on: http://localhost:5000
echo Press Ctrl+C to stop
echo.

npm run dev

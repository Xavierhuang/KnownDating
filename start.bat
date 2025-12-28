@echo off
echo Starting Cuffing Season App...
echo.

:: Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo Node.js is not installed. Please install Node.js 18+ first.
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js found
echo.

:: Check and install server dependencies
if not exist "server\node_modules" (
    echo Installing server dependencies...
    cd server
    call npm install
    cd ..
    echo.
)

:: Check and install client dependencies
if not exist "client\node_modules" (
    echo Installing client dependencies...
    cd client
    call npm install
    cd ..
    echo.
)

:: Initialize database if it doesn't exist
if not exist "server\database.sqlite" (
    echo Initializing database...
    cd server
    call npm run db:init
    cd ..
    echo.
)

echo Starting servers...
echo Backend: http://localhost:3001
echo Frontend: http://localhost:5173
echo.
echo Press Ctrl+C to stop all servers
echo.

:: Start backend in a new window
start "Cuffing Season - Backend" cmd /k "cd server && npm run dev"

:: Wait a bit for backend to start
timeout /t 3 /nobreak >nul

:: Start frontend in a new window
start "Cuffing Season - Frontend" cmd /k "cd client && npm run dev"

echo.
echo Servers started! The app will open in your browser shortly.
echo Close the server windows to stop the app.
pause


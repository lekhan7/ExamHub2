@echo off
echo Starting Exam Hub...
echo.

echo Starting Server...
cd server
start "Exam Hub Server" cmd /k "npm run dev"

echo.
echo Starting Client...
cd ../client
start "Exam Hub Client" cmd /k "npm run dev"

echo.
echo Both servers are starting in separate windows.
echo Server: http://localhost:3001
echo Client: http://localhost:5173
echo.
pause

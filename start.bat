@echo off
echo Starting Eventa Backend...
start "Eventa Backend" cmd /c "cd backend && python -m uvicorn server:app --port 8001 --reload"

echo Starting Eventa Frontend...
start "Eventa Frontend" cmd /c "cd frontend && npm start"

echo Starting Eventa Background Worker...
start "Eventa Background Worker" cmd /c "cd backend && python worker.py"

echo.
echo Both services are starting up in separate windows!
echo Close the newly opened terminal windows to stop the servers.
pause

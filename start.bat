@echo off
echo Starting Meditech AI - Multilingual Clinical Workflow System...

:: Start Backend
echo Starting Backend Server (Flask)...
cd backend
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)
call venv\Scripts\activate
pip install -r requirements.txt
start cmd /k "title Meditech Backend && venv\Scripts\activate && python app.py"

:: Start Frontend
echo Starting Frontend Server (Vite)...
cd ..\frontend
npm install
npm run dev

pause

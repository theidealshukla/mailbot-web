@echo off
echo ========================================
echo   Starting Automation Script Backend
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed or not in PATH
    echo Please install Python 3.7+ and try again
    pause
    exit /b 1
)

echo ✅ Python found
echo.

REM Install requirements if needed
if not exist "venv" (
    echo 📦 Creating virtual environment...
    python -m venv venv
    echo ✅ Virtual environment created
)

echo 🔧 Activating virtual environment...
call venv\Scripts\activate.bat

echo 📥 Installing/updating requirements...
pip install -r requirements_backend.txt

echo.
echo 🚀 Starting Flask backend with automation script integration...
echo 📧 Backend will be available at: http://localhost:5000
echo 🌐 Open your frontend and test the integration!
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

python backend_server.py

pause
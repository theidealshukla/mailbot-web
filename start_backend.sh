#!/bin/bash

echo "========================================"
echo "   Starting Automation Script Backend  "
echo "========================================"
echo

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed or not in PATH"
    echo "Please install Python 3.7+ and try again"
    exit 1
fi

echo "✅ Python found"
echo

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
    echo "✅ Virtual environment created"
fi

echo "🔧 Activating virtual environment..."
source venv/bin/activate

echo "📥 Installing/updating requirements..."
pip install -r requirements_backend.txt

echo
echo "🚀 Starting Flask backend with automation script integration..."
echo "📧 Backend will be available at: http://localhost:5000"
echo "🌐 Open your frontend and test the integration!"
echo
echo "Press Ctrl+C to stop the server"
echo "========================================"
echo

python3 backend_server.py
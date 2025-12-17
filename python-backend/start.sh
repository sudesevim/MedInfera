#!/bin/bash

# Medical Chatbot Python Backend Startup Script

echo "🏥 Starting Medical Chatbot Python Backend..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.11 or higher."
    exit 1
fi

# Check if virtual environment exists, if not create it
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Check if pip is installed
if ! command -v pip &> /dev/null; then
    echo "❌ pip is not installed. Please install pip."
    exit 1
fi

# Install dependencies if requirements.txt is newer than last install
if [ requirements.txt -nt .last_install ] || [ ! -f .last_install ]; then
    echo "📦 Installing Python dependencies..."
    pip install -r requirements.txt
    touch .last_install
fi

# Check if Ollama is running
echo "🤖 Checking Ollama service..."
if curl -s http://localhost:11434/api/tags > /dev/null; then
    echo "✅ Ollama is running"
    
    # Check if llama2 model is available
    if curl -s http://localhost:11434/api/tags | grep -q "llama2"; then
        echo "✅ Llama2 model is available"
    else
        echo "⚠️  Llama2 model not found. Pulling model..."
        ollama pull llama2
    fi
else
    echo "⚠️  Ollama is not running. Starting Ollama..."
    
    # Try to start Ollama
    if command -v ollama &> /dev/null; then
        ollama serve &
        sleep 5
        
        # Pull llama2 model if not available
        echo "📥 Pulling Llama2 model..."
        ollama pull llama2
    else
        echo "❌ Ollama is not installed. Please install Ollama from https://ollama.ai"
        echo "   After installation, run: ollama pull llama2"
        echo "   The backend will use mock responses until Ollama is available."
    fi
fi

# Set environment variables if .env file exists
if [ -f .env ]; then
    echo "🔧 Loading environment variables from .env"
    export $(cat .env | grep -v '^#' | xargs)
fi

# Start the FastAPI server
echo "🚀 Starting FastAPI server on port ${PORT:-8000}..."
echo "📱 React Native app should connect to: http://localhost:${PORT:-8000}"
echo "📖 API documentation available at: http://localhost:${PORT:-8000}/docs"
echo ""
echo "Press Ctrl+C to stop the server"

python main.py
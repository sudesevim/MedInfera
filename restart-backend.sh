#!/bin/bash

echo "🔄 Restarting Python Backend..."

# Kill any existing Python backend processes
echo "Stopping existing backend processes..."
pkill -f "python.*main.py" || true
pkill -f "python.*run.py" || true

# Wait a moment
sleep 2

# Start the backend
echo "Starting backend..."
cd python-backend
python run.py &

# Wait for it to start
sleep 3

# Test if it's running
echo "Testing backend..."
curl -s http://localhost:8000/health > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Backend is running"
else
    echo "❌ Backend failed to start"
fi

echo "🏁 Done!"
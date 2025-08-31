#!/bin/bash

echo "🚀 Starting Bangladesh News Bias Analyzer..."

# Check if .env exists
if [ ! -f "frontend/.env" ]; then
    echo "❌ frontend/.env not found!"
    echo "Please copy frontend/.env.example to frontend/.env and add your Gemini API key"
    exit 1
fi

# Start backend in background
echo "🔧 Starting backend server..."
cd backend && npm start &
BACKEND_PID=$!

# Start frontend
echo "🎨 Starting frontend server..."
cd ../frontend && npm run dev &
FRONTEND_PID=$!

echo "✅ Both servers started!"
echo "📱 Frontend: http://localhost:5173"
echo "🔧 Backend: http://localhost:3001"
echo ""
echo "Press Ctrl+C to stop both servers"

# Function to kill both processes
cleanup() {
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit
}

# Set up trap to catch Ctrl+C
trap cleanup INT

# Wait for processes
wait
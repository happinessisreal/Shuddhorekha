#!/bin/bash

# Shuddhorekha - News Bias Analyzer Startup Script

echo "🚀 Starting Shuddhorekha News Bias Analyzer..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js version 16 or higher."
    exit 1
fi

# Check if both directories exist
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Backend or frontend directory not found. Please ensure you're in the project root."
    exit 1
fi

echo "📦 Installing dependencies..."

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend
if [ ! -d "node_modules" ]; then
    npm install
fi
cd ..

# Install frontend dependencies  
echo "Installing frontend dependencies..."
cd frontend
if [ ! -d "node_modules" ]; then
    npm install
fi
cd ..

echo "🔧 Starting servers..."

# Start backend in background
echo "Starting backend server on port 5000..."
cd backend
npm start &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start frontend
echo "Starting frontend server on port 3000..."
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

echo "✅ Shuddhorekha is starting up!"
echo "📊 Backend API: http://localhost:5000"
echo "🌐 Frontend App: http://localhost:3000"
echo ""
echo "📝 Remember to:"
echo "   1. Add your Gemini API key to frontend/.env"
echo "   2. Copy frontend/.env.example to frontend/.env if needed"
echo ""
echo "Press Ctrl+C to stop both servers..."

# Function to handle cleanup
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ Servers stopped. Goodbye!"
    exit 0
}

# Set up signal handling
trap cleanup SIGINT SIGTERM

# Wait for processes
wait
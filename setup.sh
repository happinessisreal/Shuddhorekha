#!/bin/bash

echo "🚀 Setting up Bangladesh News Bias Analyzer..."

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend && npm install

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd ../frontend && npm install

echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Copy frontend/.env.example to frontend/.env"
echo "2. Add your Gemini API key to frontend/.env"
echo "3. Run './start.sh' to start both servers"
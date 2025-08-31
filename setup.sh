#!/bin/bash

echo "🇧🇩 Setting up Shuddhorekha News Bias Analyzer..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v16 or higher."
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

# Create environment file if it doesn't exist
if [ ! -f backend/.env.local ]; then
    echo "🔑 Creating environment configuration..."
    cp backend/.env backend/.env.local
    echo ""
    echo "⚠️  IMPORTANT: Please edit backend/.env.local and add your Gemini API key:"
    echo "   GEMINI_API_KEY=your_actual_api_key_here"
    echo ""
fi

echo "🎉 Setup complete!"
echo ""
echo "To start the application:"
echo "1. Get a Gemini API key from https://ai.google.dev/"
echo "2. Add it to backend/.env.local"
echo "3. Run 'npm run start:backend' in one terminal"
echo "4. Run 'npm run start:frontend' in another terminal"
echo "5. Open http://localhost:3000 in your browser"
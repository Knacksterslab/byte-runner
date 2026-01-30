#!/bin/bash

# Byte Runner - Quick Start Script
# This script helps you get started quickly

echo "🎮 Byte Runner Quick Start"
echo "=========================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    echo "Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed"
    exit 1
fi

echo "✅ npm version: $(npm --version)"
echo ""

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

echo "✅ Dependencies installed"
echo ""

# Ask user what they want to do
echo "What would you like to do?"
echo "1) Start development server"
echo "2) Build for production"
echo "3) Start production server (must build first)"
echo "4) Run tests"
echo ""
read -p "Enter choice (1-4): " choice

case $choice in
    1)
        echo ""
        echo "🚀 Starting development server..."
        echo "Visit http://localhost:3000 when ready"
        npm run dev
        ;;
    2)
        echo ""
        echo "🔨 Building for production..."
        npm run build
        echo ""
        echo "✅ Build complete!"
        echo "Run './quickstart.sh' and choose option 3 to start production server"
        ;;
    3)
        echo ""
        echo "🚀 Starting production server..."
        echo "Visit http://localhost:3000"
        npm start
        ;;
    4)
        echo ""
        echo "🧪 Running tests..."
        npm test
        ;;
    *)
        echo ""
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

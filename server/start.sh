#!/bin/bash

echo "🚀 Starting SIDETRADE DApp..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found. Copying from .env.example..."
    cp .env.example .env
    echo "✅ Created .env file. Please update with your API keys!"
    exit 1
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo "📦 Installing backend dependencies..."
    npm install
fi

# Check if client node_modules exists
if [ ! -d client/node_modules ]; then
    echo "📦 Installing client dependencies..."
    cd client && npm install && cd ..
fi

# Start the backend
echo ""
echo "🤖 Starting backend server..."
npm start

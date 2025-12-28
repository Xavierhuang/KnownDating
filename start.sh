#!/bin/bash

echo "🔥 Starting Known App..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

echo "✓ Node.js found: $(node -v)"
echo ""

# Function to check if dependencies are installed
check_dependencies() {
    if [ ! -d "$1/node_modules" ]; then
        echo "📦 Installing dependencies in $1..."
        cd "$1" || exit
        npm install
        cd - > /dev/null || exit
        echo ""
    fi
}

# Check and install server dependencies
check_dependencies "server"

# Check and install client dependencies
check_dependencies "client"

# Initialize database if it doesn't exist
if [ ! -f "server/database.sqlite" ]; then
    echo "🗄️  Initializing database..."
    cd server || exit
    npm run db:init
    cd - > /dev/null || exit
    echo ""
fi

echo "🚀 Starting servers..."
echo ""
echo "Backend will run on: http://localhost:3002"
echo "Frontend will run on: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Start both servers
cd server && npm run dev &
SERVER_PID=$!

# Wait a bit for backend to be ready
sleep 2

cd client && npm run dev &
CLIENT_PID=$!

# Wait for Ctrl+C
trap "echo ''; echo '🛑 Stopping servers...'; kill $SERVER_PID $CLIENT_PID; exit" INT

wait


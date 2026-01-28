#!/bin/bash

echo "📱 Known Mobile App Setup"
echo ""

# Check if we're in the right directory
if [ ! -f "client/package.json" ]; then
    echo "❌ Error: Must run from project root directory"
    exit 1
fi

echo "🔍 Checking prerequisites..."
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required. Install from: https://nodejs.org/"
    exit 1
fi
echo "✓ Node.js: $(node -v)"

# Check for iOS prerequisites
if [[ "$OSTYPE" == "darwin"* ]]; then
    if ! command -v xcodebuild &> /dev/null; then
        echo "⚠️  Xcode not found. Install from App Store to build iOS apps"
    else
        echo "✓ Xcode found"
    fi
else
    echo "ℹ️  macOS required for iOS development"
fi

# Check for Android prerequisites
if command -v adb &> /dev/null; then
    echo "✓ Android SDK found"
else
    echo "⚠️  Android Studio not found. Install to build Android apps"
fi

echo ""
echo "📦 Installing Capacitor..."
echo ""

# Navigate to client directory
cd client || exit

# Install Capacitor
if [ ! -d "node_modules/@capacitor" ]; then
    echo "Installing Capacitor dependencies..."
    npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android
else
    echo "✓ Capacitor already installed"
fi

echo ""
echo "⚙️  Initializing Capacitor..."
echo ""

# Initialize Capacitor if not already done
if [ ! -f "../capacitor.config.ts" ]; then
    echo "Creating Capacitor configuration..."
    npx cap init "Known" "com.known.app" --web-dir=dist
else
    echo "✓ Capacitor config exists"
fi

echo ""
echo "🔨 Building React app..."
echo ""

# Build the React app
npm run build

if [ ! -d "dist" ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✓ Build complete"
echo ""

# Add platforms if not already added
if [ ! -d "ios" ] && [ "$OSTYPE" == "darwin"* ]; then
    echo "📱 Adding iOS platform..."
    npx cap add ios
fi

if [ ! -d "android" ]; then
    echo "🤖 Adding Android platform..."
    npx cap add android
fi

echo ""
echo "🔄 Syncing Capacitor..."
echo ""

# Sync Capacitor
npx cap sync

echo ""
echo "✅ Mobile setup complete!"
echo ""
echo "Next steps:"
echo ""
echo "For iOS (macOS only):"
echo "  npx cap open ios"
echo ""
echo "For Android:"
echo "  npx cap open android"
echo ""
echo "See MOBILE_DEPLOYMENT.md for detailed instructions."
echo ""

cd ..


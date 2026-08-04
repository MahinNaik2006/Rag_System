#!/bin/bash

echo "================================"
echo "   AI Tutor Frontend Setup"
echo "================================"
echo

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ ERROR: Node.js is not installed"
    echo "Please install Node.js from: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Check Node.js version
NODE_VERSION=$(node --version | cut -c 2-)
REQUIRED_VERSION="16.0.0"

if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" = "$REQUIRED_VERSION" ]; then
    echo "✅ Node.js version is compatible"
else
    echo "⚠️  WARNING: Node.js version $NODE_VERSION might be too old"
    echo "   Recommended: v16 or higher"
fi

echo
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ ERROR: Failed to install dependencies"
    exit 1
fi

echo
echo "================================"
echo "   Setup Complete! 🎉"
echo "================================"
echo
echo "To start the development server, run:"
echo "  npm run dev"
echo
echo "Then open http://localhost:5173 in your browser"
echo
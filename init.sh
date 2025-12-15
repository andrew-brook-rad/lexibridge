#!/bin/bash

# LexiBridge Lite - Development Environment Setup Script
# This script initializes and runs the development environment

set -e

echo "======================================"
echo "LexiBridge Lite - Environment Setup"
echo "======================================"
echo ""

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed."
    echo "Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "ERROR: Node.js version 18 or higher is required."
    echo "Current version: $(node -v)"
    exit 1
fi

echo "Node.js version: $(node -v)"

# Check for npm
if ! command -v npm &> /dev/null; then
    echo "ERROR: npm is not installed."
    exit 1
fi

echo "npm version: $(npm -v)"
echo ""

# Check for .env file
if [ ! -f .env ] && [ ! -f .env.local ]; then
    echo "WARNING: No .env or .env.local file found!"
    echo ""
    if [ -f .env.example ]; then
        echo "Please create your environment file:"
        echo "  cp .env.example .env.local"
        echo "  nano .env.local  # Add your OpenAI API key"
        echo ""
    fi
    echo "The application requires OPENAI_API_KEY to function."
    echo ""
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Install dependencies
echo "Installing dependencies..."
npm install

echo ""
echo "======================================"
echo "Starting development server..."
echo "======================================"
echo ""

# Start the development server
npm run dev &

# Wait for server to be ready
echo "Waiting for server to start..."
sleep 5

echo ""
echo "======================================"
echo "Development Environment Ready!"
echo "======================================"
echo ""
echo "Application URL:  http://localhost:3000"
echo ""
echo "Quick Links:"
echo "  - Main App:     http://localhost:3000"
echo "  - API Test:     http://localhost:3000/api/translate"
echo ""
echo "To stop the server: Press Ctrl+C or run 'pkill -f next-server'"
echo ""
echo "For production build:"
echo "  npm run build"
echo "  npm start"
echo ""

# Keep script running to show logs
wait

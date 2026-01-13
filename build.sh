#!/usr/bin/env bash
# Build script for Render deployment
# This builds the React frontend and sets up the Python backend

set -o errexit  # Exit on error

echo "🏗️ Starting MedTech AI build process..."

# ============================================
# 1. Build Frontend
# ============================================
echo "📦 Installing frontend dependencies..."
npm install

echo "🔨 Building React frontend..."
npm run build

echo "📁 Moving frontend build to backend static folder..."
mkdir -p backend/static
cp -r dist/* backend/static/

# ============================================
# 2. Setup Backend
# ============================================
echo "🐍 Setting up Python backend..."
cd backend

echo "📦 Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo "✅ Build complete!"

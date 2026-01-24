#!/bin/bash

# Vercel Deployment Script
# Run this script to deploy directly to Vercel

echo "🚀 Starting Vercel deployment..."

# Navigate to react-app directory
cd react-app

# Check if vercel is installed, if not install it
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Deploy to Vercel
echo "📤 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"

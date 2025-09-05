#!/bin/bash

# Deploy script for cuecli
# This handles GitHub push and Vercel deployment

echo "🚀 cueCLI Deployment Script"
echo "=========================="

# Load environment variables
if [ -f .env.local ]; then
    export $(cat .env.local | grep -v '^#' | xargs)
fi

# Check if token exists
if [ -z "$GITHUB_TOKEN" ]; then
    echo "❌ Error: GITHUB_TOKEN not found in .env.local"
    echo "Please add your GitHub Personal Access Token to .env.local"
    echo "Generate one at: https://github.com/settings/tokens"
    exit 1
fi

# Configure git to use token
git config --local credential.helper "store --file=.git-credentials"
echo "https://${GITHUB_TOKEN}@github.com" > .git-credentials

# Push to GitHub
echo "📤 Pushing to GitHub..."
git push origin main

# Clean up credentials
rm .git-credentials
git config --local --unset credential.helper

echo "✅ Push complete!"

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
cd website
npm run build && vercel --prod

echo "✅ Deployment complete!"
echo "Visit: https://cuecli.com"
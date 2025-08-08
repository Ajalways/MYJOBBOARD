#!/bin/bash

# ProofJobs Deployment Setup Script
# Run this script to set up your project for deployment

echo "🚀 Setting up ProofJobs for deployment..."

# Create project root structure
cd "c:\Users\umidn\Desktop\the proof app"

# Copy package.json from template
echo "📦 Setting up package.json..."
cp src/package-template.json package.json

# Move configuration files to root
echo "⚙️ Moving configuration files..."
cp src/vite.config.js .
cp src/tailwind.config.js .
cp src/postcss.config.js .
cp src/index.html .
cp src/.env.example .env
cp src/Dockerfile .
cp src/nginx.conf .
cp src/app.yaml .

# Install dependencies
echo "📥 Installing dependencies..."
npm install

# Create .gitignore
echo "📝 Creating .gitignore..."
cat > .gitignore << EOF
# Dependencies
node_modules/
/.pnp
.pnp.js

# Production build
/dist
/build

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Docker
.dockerignore
EOF

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Test locally: npm run dev"
echo "2. Build for production: npm run build"
echo "3. Push to GitHub repository"
echo "4. Deploy to Digital Ocean using app.yaml"
echo ""
echo "🌟 Your ProofJobs app is ready for deployment!"

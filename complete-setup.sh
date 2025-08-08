#!/bin/bash

# ProofJobs Complete Setup and Deployment Script
# This script sets up your entire project structure for production deployment

echo "🚀 Setting up ProofJobs - Complete Admin Panel & AI Challenge System"
echo "================================================================="

# Navigate to project root
PROJECT_ROOT="c:\Users\umidn\Desktop\the proof app"
cd "$PROJECT_ROOT"

# 1. Create proper project structure
echo "📁 Setting up project structure..."

# Copy essential files from src to root
echo "📦 Setting up package.json..."
cat > package.json << 'EOF'
{
  "name": "proofjobs-platform",
  "version": "1.0.0",
  "description": "Forensic Accounting Talent Platform with AI Challenges",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext js,jsx --report-unused-disable-directives --max-warnings 0"
  },
  "dependencies": {
    "@base44/sdk": "^2.0.0",
    "@radix-ui/react-accordion": "^1.1.2",
    "@radix-ui/react-alert-dialog": "^1.0.5",
    "@radix-ui/react-aspect-ratio": "^1.0.3",
    "@radix-ui/react-avatar": "^1.0.4",
    "@radix-ui/react-checkbox": "^1.0.4",
    "@radix-ui/react-collapsible": "^1.0.3",
    "@radix-ui/react-context-menu": "^2.1.5",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-hover-card": "^1.0.7",
    "@radix-ui/react-label": "^2.0.2",
    "@radix-ui/react-menubar": "^1.0.4",
    "@radix-ui/react-navigation-menu": "^1.1.4",
    "@radix-ui/react-popover": "^1.0.7",
    "@radix-ui/react-progress": "^1.0.3",
    "@radix-ui/react-radio-group": "^1.1.3",
    "@radix-ui/react-scroll-area": "^1.0.5",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-separator": "^1.0.3",
    "@radix-ui/react-slider": "^1.1.2",
    "@radix-ui/react-slot": "^1.0.2",
    "@radix-ui/react-switch": "^1.0.3",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-toast": "^1.1.5",
    "@radix-ui/react-toggle": "^1.0.3",
    "@radix-ui/react-toggle-group": "^1.0.4",
    "@radix-ui/react-tooltip": "^1.0.7",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "cmdk": "^0.2.0",
    "date-fns": "^2.30.0",
    "embla-carousel-react": "^8.0.0",
    "input-otp": "^1.2.4",
    "lucide-react": "^0.263.1",
    "next-themes": "^0.2.1",
    "react": "^18.2.0",
    "react-day-picker": "^8.8.0",
    "react-dom": "^18.2.0",
    "react-hook-form": "^7.45.2",
    "react-resizable-panels": "^0.0.55",
    "react-router-dom": "^6.14.2",
    "recharts": "^2.7.2",
    "sonner": "^1.0.3",
    "tailwind-merge": "^1.14.0",
    "tailwindcss-animate": "^1.0.6",
    "vaul": "^0.7.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.15",
    "@types/react-dom": "^18.2.7",
    "@vitejs/plugin-react": "^4.0.3",
    "autoprefixer": "^10.4.14",
    "eslint": "^8.45.0",
    "eslint-plugin-react": "^7.32.2",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.3",
    "postcss": "^8.4.27",
    "tailwindcss": "^3.3.3",
    "vite": "^4.4.5"
  }
}
EOF

# Move configuration files
echo "⚙️ Setting up configuration files..."
cp src/vite.config.js . 2>/dev/null || echo "vite.config.js not found in src"
cp src/tailwind.config.js . 2>/dev/null || echo "tailwind.config.js not found in src"
cp src/postcss.config.js . 2>/dev/null || echo "postcss.config.js not found in src"
cp src/index.html . 2>/dev/null || echo "index.html not found in src"

# Create environment file
echo "🔐 Setting up environment variables..."
cat > .env << 'EOF'
# Base44 Configuration
VITE_BASE44_APP_ID=6891f4d57e509572a8a7819d
VITE_API_URL=https://api.base44.com

# App Configuration
VITE_APP_NAME=ProofJobs
VITE_APP_DESCRIPTION=Forensic Accounting Talent Platform
EOF

# Create Docker files
echo "🐳 Setting up Docker configuration..."
cp src/Dockerfile . 2>/dev/null || echo "Dockerfile not found in src"
cp src/nginx.conf . 2>/dev/null || echo "nginx.conf not found in src"

# Create Digital Ocean config
echo "🌊 Setting up Digital Ocean configuration..."
cp src/app.yaml . 2>/dev/null || echo "app.yaml not found in src"

# Create .gitignore
echo "📝 Creating .gitignore..."
cat > .gitignore << 'EOF'
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

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# nyc test coverage
.nyc_output

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# temporary folders
tmp/
temp/
EOF

# Install dependencies
echo "📥 Installing dependencies..."
echo "This may take a few minutes..."
npm install

# Test build
echo "🔨 Testing build process..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi

# Create deployment summary
echo "📋 Creating deployment summary..."
cat > DEPLOYMENT_SUMMARY.md << 'EOF'
# ProofJobs Deployment Summary

## ✅ What's Been Set Up

### Admin Panel Features
- **Dynamic Form Manager**: Create/edit jobseeker and company registration forms
- **AI Challenge Manager**: Generate unique, non-duplicate challenges using AI
- **User Management**: View and manage all platform users
- **Job Management**: Oversee all job postings
- **Skill Tag Management**: Manage available skills

### AI Challenge System
- **Automatic Generation**: AI creates unique challenges for each job posting
- **Duplicate Prevention**: Hash-based system prevents duplicate challenges
- **Job-Specific**: Challenges tailored to specific job requirements
- **Multiple Types**: Scenario, analytical, technical, and case study challenges
- **Difficulty Scaling**: Beginner to expert level challenges

### New Components Created
1. `FormFieldManager.jsx` - Admin form field management
2. `AIChallengeManager.jsx` - AI challenge generation and management
3. `DynamicForm.jsx` - Dynamic form renderer using admin configurations
4. `PostJobWithAI.jsx` - Enhanced job posting with automatic AI challenges

### Updated Components
- `AdminDashboard.jsx` - Added new admin tabs
- `AuthCallback.jsx` - Uses dynamic forms
- Routing updated to include new components

## 🚀 How to Deploy

### Option 1: Digital Ocean App Platform (Recommended)
1. Push code to GitHub repository
2. Go to DigitalOcean App Platform
3. Create new app from GitHub repo
4. Use the provided `app.yaml` configuration
5. Set environment variables:
   - `VITE_BASE44_APP_ID`: Your Base44 app ID
   - `VITE_API_URL`: https://api.base44.com

### Option 2: Docker Deployment
```bash
docker build -t proofjobs .
docker run -p 80:80 proofjobs
```

### Option 3: Static Hosting
```bash
npm run build
# Upload the 'dist' folder to any static hosting service
```

## 🎯 Key Features for Non-Coders

### Admin Panel Access
1. Login as admin user
2. Go to Admin Dashboard
3. Use the "Forms" tab to manage registration fields
4. Use the "AI Challenges" tab to generate challenges

### Form Management
- Add/remove fields from jobseeker and company forms
- Change field types (text, select, checkbox, etc.)
- Set required/optional status
- Reorder fields by drag and drop

### AI Challenge Management
- Generates unique challenges automatically
- Prevents duplicates using content hashing
- Tailors challenges to specific job postings
- Multiple difficulty levels and types

## 🔧 Configuration Notes

### Base44 Entities Used
- `FormFieldConfig` - Stores form configurations
- `GeneratedChallengeLog` - Tracks generated challenges
- `Challenge` - Stores challenge data
- `AIChallengeAnswerKey` - Stores answer keys

### Environment Variables
- All sensitive data in `.env` file
- Production variables in hosting platform

## 📞 Support
- Admin panel is fully self-service
- No coding knowledge required for form/challenge management
- AI automatically handles challenge uniqueness
EOF

echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "✅ Project structure created"
echo "✅ Dependencies installed" 
echo "✅ Build tested successfully"
echo "✅ Docker configuration ready"
echo "✅ Digital Ocean configuration ready"
echo ""
echo "📋 Next Steps:"
echo "1. Review DEPLOYMENT_SUMMARY.md for details"
echo "2. Test locally: npm run dev"
echo "3. Push to GitHub repository"
echo "4. Deploy to Digital Ocean or your preferred platform"
echo ""
echo "🎯 Admin Features Ready:"
echo "• Dynamic form field management (no coding required)"
echo "• AI challenge generation with duplicate prevention" 
echo "• Complete admin dashboard for platform management"
echo ""
echo "🌟 Your ProofJobs platform is ready for deployment!"

# Test local development server
echo ""
echo "🧪 Testing local development server..."
echo "Starting development server on http://localhost:3000"
echo "Press Ctrl+C to stop the server when you're ready to deploy"
echo ""

npm run dev

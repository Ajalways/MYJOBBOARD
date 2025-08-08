@echo off
echo 🚀 Setting up ProofJobs - Complete Admin Panel ^& AI Challenge System
echo =================================================================

REM Navigate to project root
cd /d "c:\Users\umidn\Desktop\the proof app"

REM 1. Create package.json
echo 📦 Setting up package.json...
(
echo {
echo   "name": "proofjobs-platform",
echo   "version": "1.0.0",
echo   "description": "Forensic Accounting Talent Platform with AI Challenges",
echo   "type": "module",
echo   "scripts": {
echo     "dev": "vite",
echo     "build": "vite build",
echo     "preview": "vite preview",
echo     "lint": "eslint src --ext js,jsx --report-unused-disable-directives --max-warnings 0"
echo   },
echo   "dependencies": {
echo     "@base44/sdk": "^2.0.0",
echo     "@radix-ui/react-accordion": "^1.1.2",
echo     "@radix-ui/react-alert-dialog": "^1.0.5",
echo     "@radix-ui/react-avatar": "^1.0.4",
echo     "@radix-ui/react-checkbox": "^1.0.4",
echo     "@radix-ui/react-dialog": "^1.0.5",
echo     "@radix-ui/react-dropdown-menu": "^2.0.6",
echo     "@radix-ui/react-label": "^2.0.2",
echo     "@radix-ui/react-popover": "^1.0.7",
echo     "@radix-ui/react-progress": "^1.0.3",
echo     "@radix-ui/react-radio-group": "^1.1.3",
echo     "@radix-ui/react-select": "^2.0.0",
echo     "@radix-ui/react-separator": "^1.0.3",
echo     "@radix-ui/react-slot": "^1.0.2",
echo     "@radix-ui/react-switch": "^1.0.3",
echo     "@radix-ui/react-tabs": "^1.0.4",
echo     "@radix-ui/react-toast": "^1.1.5",
echo     "@radix-ui/react-tooltip": "^1.0.7",
echo     "class-variance-authority": "^0.7.0",
echo     "clsx": "^2.0.0",
echo     "date-fns": "^2.30.0",
echo     "lucide-react": "^0.263.1",
echo     "react": "^18.2.0",
echo     "react-dom": "^18.2.0",
echo     "react-router-dom": "^6.14.2",
echo     "tailwind-merge": "^1.14.0",
echo     "tailwindcss-animate": "^1.0.6"
echo   },
echo   "devDependencies": {
echo     "@vitejs/plugin-react": "^4.0.3",
echo     "autoprefixer": "^10.4.14",
echo     "eslint": "^8.45.0",
echo     "eslint-plugin-react": "^7.32.2",
echo     "eslint-plugin-react-hooks": "^4.6.0",
echo     "eslint-plugin-react-refresh": "^0.4.3",
echo     "postcss": "^8.4.27",
echo     "tailwindcss": "^3.3.3",
echo     "vite": "^4.4.5"
echo   }
echo }
) > package.json

REM 2. Copy configuration files
echo ⚙️ Setting up configuration files...
if exist src\vite.config.js copy src\vite.config.js .
if exist src\tailwind.config.js copy src\tailwind.config.js .
if exist src\postcss.config.js copy src\postcss.config.js .
if exist src\index.html copy src\index.html .

REM 3. Create environment file
echo 🔐 Setting up environment variables...
(
echo # Base44 Configuration
echo VITE_BASE44_APP_ID=6891f4d57e509572a8a7819d
echo VITE_API_URL=https://api.base44.com
echo.
echo # App Configuration
echo VITE_APP_NAME=ProofJobs
echo VITE_APP_DESCRIPTION=Forensic Accounting Talent Platform
) > .env

REM 4. Copy Docker and deployment files
echo 🐳 Setting up deployment files...
if exist src\Dockerfile copy src\Dockerfile .
if exist src\nginx.conf copy src\nginx.conf .
if exist src\app.yaml copy src\app.yaml .

REM 5. Create .gitignore
echo 📝 Creating .gitignore...
(
echo # Dependencies
echo node_modules/
echo /.pnp
echo .pnp.js
echo.
echo # Production build
echo /dist
echo /build
echo.
echo # Environment variables
echo .env
echo .env.local
echo .env.development.local
echo .env.test.local
echo .env.production.local
echo.
echo # IDE
echo .vscode/
echo .idea/
echo *.swp
echo *.swo
echo.
echo # OS
echo .DS_Store
echo Thumbs.db
echo.
echo # Logs
echo npm-debug.log*
echo yarn-debug.log*
echo yarn-error.log*
echo lerna-debug.log*
) > .gitignore

REM 6. Install dependencies
echo 📥 Installing dependencies...
echo This may take a few minutes...
npm install

REM 7. Test build
echo 🔨 Testing build process...
npm run build

if %errorlevel% equ 0 (
    echo ✅ Build successful!
) else (
    echo ❌ Build failed. Please check the errors above.
    pause
    exit /b 1
)

REM 8. Create deployment summary
echo 📋 Creating deployment summary...
(
echo # ProofJobs Deployment Summary
echo.
echo ## ✅ What's Been Set Up
echo.
echo ### Admin Panel Features
echo - **Dynamic Form Manager**: Create/edit jobseeker and company registration forms
echo - **AI Challenge Manager**: Generate unique, non-duplicate challenges using AI
echo - **User Management**: View and manage all platform users
echo - **Job Management**: Oversee all job postings
echo - **Skill Tag Management**: Manage available skills
echo.
echo ### AI Challenge System
echo - **Automatic Generation**: AI creates unique challenges for each job posting
echo - **Duplicate Prevention**: Hash-based system prevents duplicate challenges
echo - **Job-Specific**: Challenges tailored to specific job requirements
echo - **Multiple Types**: Scenario, analytical, technical, and case study challenges
echo - **Difficulty Scaling**: Beginner to expert level challenges
echo.
echo ## 🚀 How to Deploy
echo.
echo ### Option 1: Digital Ocean App Platform ^(Recommended^)
echo 1. Push code to GitHub repository
echo 2. Go to DigitalOcean App Platform
echo 3. Create new app from GitHub repo
echo 4. Use the provided app.yaml configuration
echo 5. Set environment variables in the platform
echo.
echo ### Option 2: Local Testing
echo ```
echo npm run dev
echo ```
echo.
echo ## 🎯 Key Features for Non-Coders
echo.
echo ### Admin Panel Access
echo 1. Login as admin user
echo 2. Go to Admin Dashboard
echo 3. Use the "Forms" tab to manage registration fields
echo 4. Use the "AI Challenges" tab to generate challenges
echo.
echo ### Form Management
echo - Add/remove fields from jobseeker and company forms
echo - Change field types ^(text, select, checkbox, etc.^)
echo - Set required/optional status
echo - Reorder fields
echo.
echo ### AI Challenge Management
echo - Generates unique challenges automatically
echo - Prevents duplicates using content hashing
echo - Tailors challenges to specific job postings
echo - Multiple difficulty levels and types
) > DEPLOYMENT_SUMMARY.md

echo.
echo 🎉 Setup Complete!
echo ==================
echo.
echo ✅ Project structure created
echo ✅ Dependencies installed
echo ✅ Build tested successfully
echo ✅ Deployment files ready
echo.
echo 📋 Next Steps:
echo 1. Review DEPLOYMENT_SUMMARY.md for details
echo 2. Test locally: npm run dev
echo 3. Push to GitHub repository
echo 4. Deploy to Digital Ocean or your preferred platform
echo.
echo 🎯 Admin Features Ready:
echo • Dynamic form field management ^(no coding required^)
echo • AI challenge generation with duplicate prevention
echo • Complete admin dashboard for platform management
echo.
echo 🌟 Your ProofJobs platform is ready for deployment!
echo.
echo Press any key to start the development server for testing...
pause >nul

echo.
echo 🧪 Starting development server...
echo Open http://localhost:3000 in your browser
echo Press Ctrl+C to stop the server when ready to deploy
echo.

npm run dev

@echo off
echo 🚀 Setting up ProofJobs for deployment...

REM Navigate to project root
cd /d "c:\Users\umidn\Desktop\the proof app"

REM Copy package.json from template
echo 📦 Setting up package.json...
copy src\package-template.json package.json

REM Move configuration files to root
echo ⚙️ Moving configuration files...
copy src\vite.config.js .
copy src\tailwind.config.js .
copy src\postcss.config.js .
copy src\index.html .
copy src\.env.example .env
copy src\Dockerfile .
copy src\nginx.conf .
copy src\app.yaml .

REM Create .gitignore
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

REM Install dependencies
echo 📥 Installing dependencies...
npm install

echo ✅ Setup complete!
echo.
echo Next steps:
echo 1. Test locally: npm run dev
echo 2. Build for production: npm run build
echo 3. Push to GitHub repository
echo 4. Deploy to Digital Ocean using app.yaml
echo.
echo 🌟 Your ProofJobs app is ready for deployment!
pause

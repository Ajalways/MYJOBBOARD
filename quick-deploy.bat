@echo off
echo 🚀 Starting auto-deploy process...

REM Build the project
echo 📦 Building project...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed! Aborting deployment.
    pause
    exit /b 1
)

echo ✅ Build successful!

REM Add all changes
echo 📁 Adding changes...
git add .

REM Commit with timestamp
echo 💾 Committing changes...
for /f "tokens=* USEBACKQ" %%f in (`powershell -command "Get-Date -Format 'yyyy-MM-dd HH:mm:ss'"`) do (
    set datetime=%%f
)
git commit -m "Auto-commit: %datetime%"

REM Push to GitHub
echo ⬆️ Pushing to GitHub...
git push

if %errorlevel% equ 0 (
    echo 🎉 Successfully deployed to GitHub!
    echo 🌐 Your app will be automatically deployed to your hosting platform.
) else (
    echo ❌ Push failed!
    pause
    exit /b 1
)

pause

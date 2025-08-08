#!/usr/bin/env pwsh

# Auto-deploy script for MYJOBBOARD
# This script builds the project and pushes changes to GitHub

param(
    [string]$CommitMessage = "Auto-commit: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
)

Write-Host "🚀 Starting auto-deploy process..." -ForegroundColor Green

# Check if we're in a git repository
if (-not (Test-Path ".git")) {
    Write-Host "❌ Error: Not in a git repository!" -ForegroundColor Red
    exit 1
}

# Build the project
Write-Host "📦 Building project..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed! Aborting deployment." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build successful!" -ForegroundColor Green

# Add all changes
Write-Host "📁 Adding changes..." -ForegroundColor Yellow
git add .

# Check if there are changes to commit
$status = git status --porcelain
if ([string]::IsNullOrEmpty($status)) {
    Write-Host "ℹ️  No changes to commit." -ForegroundColor Blue
    exit 0
}

# Commit changes
Write-Host "💾 Committing changes..." -ForegroundColor Yellow
git commit -m $CommitMessage

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Commit failed!" -ForegroundColor Red
    exit 1
}

# Push to GitHub
Write-Host "⬆️  Pushing to GitHub..." -ForegroundColor Yellow
git push

if ($LASTEXITCODE -eq 0) {
    Write-Host "🎉 Successfully deployed to GitHub!" -ForegroundColor Green
    Write-Host "🌐 Your app will be automatically deployed to your hosting platform." -ForegroundColor Cyan
} else {
    Write-Host "❌ Push failed!" -ForegroundColor Red
    exit 1
}

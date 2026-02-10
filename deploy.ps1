# Deploy to Vercel Helper Script

Write-Host "🚀 Starting Deployment Process..." -ForegroundColor Cyan

# 1. Check for Git
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Error "Git is not installed. Please install Git to continue."
    exit 1
}

# 2. Check for Vercel CLI
if (-not (Get-Command vercel -ErrorAction SilentlyContinue)) {
    Write-Host "Installing Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
}

# 3. Git Setup
if (-not (Test-Path .git)) {
    Write-Host "Initializing Git..." -ForegroundColor Yellow
    git init
    git add .
    git commit -m "Initial commit"
}

$remotes = git remote -v
if (-not $remotes) {
    Write-Host "⚠️  No remote repository configured." -ForegroundColor Yellow
    Write-Host "Please create a new repository on GitHub (https://github.com/new) named 'qr-food-order'."
    $repoUrl = Read-Host "Paste your GitHub Repository URL here (e.g., https://github.com/user/repo.git)"
    
    if ($repoUrl) {
        git remote add origin $repoUrl
        git branch -M master
        git push -u origin master
    } else {
        Write-Warning "Skipping Git push (no URL provided). Deployment might fail if Vercel needs a repo."
    }
} else {
    Write-Host "Pushing latest changes to Git..." -ForegroundColor Cyan
    git push
}

# 4. Deploy
Write-Host "🚀 Triggering Vercel Deployment..." -ForegroundColor Cyan
Write-Host "If asked to log in, please follow the browser prompts." -ForegroundColor Gray

# Run Vercel Deploy
npx vercel deploy

Write-Host "✅ Deployment script finished." -ForegroundColor Green
pause

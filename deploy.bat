@echo off
echo Deploying MediVerse AI to Netlify...
echo.

REM Check if netlify CLI is installed
netlify --version >nul 2>&1
if errorlevel 1 (
    echo Error: Netlify CLI is not installed or not in PATH
    echo Please install it with: npm install -g netlify-cli
    pause
    exit /b 1
)

echo Netlify CLI found, proceeding with deployment...
echo.

REM Deploy to production
echo Deploying to production...
netlify deploy --dir=public --prod

if errorlevel 1 (
    echo.
    echo Deployment failed! Please check the error above.
    pause
    exit /b 1
) else (
    echo.
    echo ✅ Deployment successful!
    echo Your site is now live at: https://mediverseai.netlify.app
    echo.
)

pause

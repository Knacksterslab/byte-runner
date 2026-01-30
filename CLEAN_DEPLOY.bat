@echo off
echo ========================================
echo   BYTE RUNNER - CLEAN DEPLOYMENT
echo ========================================
echo.
echo This will:
echo 1. Remove old git history
echo 2. Create fresh repository
echo 3. Commit all files with mobile support
echo 4. Force push to GitHub (overwrites old code)
echo.
echo WARNING: This deletes all previous commits!
echo.
pause

echo.
echo [1/6] Removing old .git folder...
if exist .git (
    rmdir /s /q .git
    echo    Done! Old history removed.
) else (
    echo    No .git folder found. Skipping...
)

echo.
echo [2/6] Initializing fresh Git repository...
git init
echo    Done! New repo initialized.

echo.
echo [3/6] Staging all files...
git add .
echo    Done! All files staged.

echo.
echo [4/6] Creating commit...
git commit -m "Initial commit: Byte Runner with mobile touch controls

COMPLETE MVP FEATURES:
- 8 protection kits (Password, Link, Patch, Privacy, VPN, MFA, Backup, Social)
- 15 threat types across 8 categories
- 32 quiz questions for post-death learning
- 4 themed zones (Home, Office, Mobile, Cloud)
- Mobile touch controls (drag-to-move)
- Desktop keyboard controls (WASD/Arrows)
- Backup Kit extra life mechanic
- Zone-weighted threat spawning
- Progressive difficulty curve
- Animated player with limbs
- Educational overlays and tips
- Death quiz system

MOBILE OPTIMIZATIONS:
- Touch-and-drag controls
- Prevent page scrolling
- PWA fullscreen support
- Optimized for iOS and Android
- Works on phones and tablets

TECHNICAL STACK:
- Next.js 14 + React + TypeScript
- HTML5 Canvas API for game rendering
- Zustand for state management
- Tailwind CSS for UI
- Vercel deployment ready

Game is fully playable on desktop and mobile! 📱🎮"

if errorlevel 1 (
    echo    ERROR: Commit failed!
    pause
    exit /b 1
)
echo    Done! Commit created.

echo.
echo [5/6] Setting up remote connection...
git remote remove origin 2>nul
git remote add origin https://github.com/Knacksterslab/byte-runner.git
git branch -M main
echo    Done! Remote configured.

echo.
echo [6/6] Force pushing to GitHub...
echo    This will overwrite the remote repository!
echo.
git push -u origin main --force

if errorlevel 1 (
    echo.
    echo    ERROR: Push failed!
    echo    Possible reasons:
    echo    - Not logged into GitHub
    echo    - No internet connection
    echo    - Repository permissions issue
    echo.
    echo    Try running: gh auth login
    echo    Or check your GitHub credentials.
    pause
    exit /b 1
)

echo.
echo ========================================
echo   DEPLOYMENT SUCCESSFUL! 
echo ========================================
echo.
echo Your game is now deployed to:
echo  - GitHub: https://github.com/Knacksterslab/byte-runner
echo  - Live Site: https://byte-runner-seven.vercel.app
echo.
echo Vercel will auto-deploy in 2-3 minutes!
echo.
echo Test on mobile: Open the live site on your phone!
echo.
pause

@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
 echo Node.js is required. Verified environment: Node 24.19.0 / npm 11.9.0.
 echo Do not open dist/index.html directly. Ask for setup help if needed.
 pause
 exit /b 1
)
if not exist node_modules (
 call npm ci
 if errorlevel 1 (
  pause
  exit /b 1
 )
)
echo Open http://127.0.0.1:5173/echomap/ in your own Chrome with MetaMask or OKX.
echo This starts a local preview only. No wallet popup or transaction is automatic.
echo Close this window to stop the preview.
call npm run dev -- --host 127.0.0.1 --port 5173 --strictPort
pause

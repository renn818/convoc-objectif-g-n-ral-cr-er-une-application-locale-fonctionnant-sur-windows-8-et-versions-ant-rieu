@echo off
echo ======================================
echo CONVOC - Lancer l'application
echo ======================================
echo.

REM Verifier Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ERREUR: Node.js non installe
    echo Telechargez Node.js LTS sur https://nodejs.org
    pause
    exit /b 1
)

echo Installation des dependances...
call npm install

if errorlevel 1 (
    echo ERREUR installation
    pause
    exit /b 1
)

echo.
echo Demarrage de CONVOC...
echo Acces: http://localhost:3000
echo.
call npm run dev

pause
# CONVOC - Lancer l'application

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "CONVOC - Lancer l'application"
Write-Host "======================================"
Write-Host ""

# Verifier Node.js
$nodeVersion = & node --version 2>$null
if (-not $nodeVersion) {
    Write-Host "ERREUR: Node.js n'est pas installe" -ForegroundColor Red
    Write-Host "Telechargez Node.js LTS sur https://nodejs.org" -ForegroundColor Yellow
    Read-Host "Appuyez sur Entree pour quitter"
    exit 1
}

Write-Host "Node.js detecte: $nodeVersion" -ForegroundColor Green

Write-Host "Installation des dependances..." -ForegroundColor Yellow
& npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERREUR lors de l'installation" -ForegroundColor Red
    Read-Host "Appuyez sur Entree pour quitter"
    exit 1
}

Write-Host ""
Write-Host "Demarrage de CONVOC..." -ForegroundColor Green
Write-Host "Acces: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Appuyez sur Ctrl+C pour arreter le serveur" -ForegroundColor Yellow
Write-Host ""

& npm run dev

# Script para iniciar la aplicacion Agricola Luz-Sombra
# Uso: .\start_app.ps1

Write-Host "===============================================" -ForegroundColor Green
Write-Host "    AGRICOLA LUZ-SOMBRA - INICIANDO APP" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "api.py")) {
    Write-Host "ERROR: No se encontro api.py. Ejecuta este script desde el directorio raiz del proyecto." -ForegroundColor Red
    Read-Host "Presiona Enter para salir"
    exit 1
}

# Verificar que existe el entorno virtual
if (-not (Test-Path "venv\Scripts\python.exe")) {
    Write-Host "ERROR: No se encontro el entorno virtual. Ejecuta: python -m venv venv" -ForegroundColor Red
    Read-Host "Presiona Enter para salir"
    exit 1
}

# Verificar que existe el frontend
if (-not (Test-Path "agricola-frontend\package.json")) {
    Write-Host "ERROR: No se encontro el frontend. Verifica la carpeta agricola-frontend." -ForegroundColor Red
    Read-Host "Presiona Enter para salir"
    exit 1
}

Write-Host "Verificaciones completadas. Iniciando servicios..." -ForegroundColor Green

# Activar entorno virtual
Write-Host "Activando entorno virtual..." -ForegroundColor Yellow
& "venv\Scripts\Activate.ps1"

# Verificar que el backend no esté ya corriendo
$backendRunning = Get-Process -Name "python" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*api.py*" }
if ($backendRunning) {
    Write-Host "Backend ya está corriendo. Continuando..." -ForegroundColor Yellow
} else {
    # Iniciar backend en background
    Write-Host "Iniciando backend (FastAPI)..." -ForegroundColor Yellow
    Start-Process -FilePath "venv\Scripts\python.exe" -ArgumentList "api.py" -WindowStyle Hidden
}

# Esperar un momento para que el backend se inicie
Write-Host "Esperando que el backend se inicie..." -ForegroundColor Yellow
Start-Sleep -Seconds 8

# Verificar que el backend esté corriendo
$backendCheck = Invoke-WebRequest -Uri "http://localhost:8000/health" -UseBasicParsing -ErrorAction SilentlyContinue
if ($backendCheck.StatusCode -eq 200) {
    Write-Host "Backend iniciado correctamente!" -ForegroundColor Green
} else {
    Write-Host "ADVERTENCIA: Backend puede no estar funcionando correctamente" -ForegroundColor Yellow
}

# Verificar que el frontend no esté ya corriendo
$frontendRunning = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*npm*" }
if ($frontendRunning) {
    Write-Host "Frontend ya está corriendo. Continuando..." -ForegroundColor Yellow
} else {
    # Iniciar frontend
    Write-Host "Iniciando frontend (React)..." -ForegroundColor Yellow
    Set-Location "agricola-frontend"
    Start-Process -FilePath "npm" -ArgumentList "start" -WindowStyle Normal
    Set-Location ".."
}

# Esperar un momento para que el frontend se inicie
Write-Host "Esperando que el frontend se inicie..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host "===============================================" -ForegroundColor Green
Write-Host "    APLICACION INICIADA EXITOSAMENTE!" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green
Write-Host "Backend: http://localhost:8000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "API Docs: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Green

# Abrir la aplicación en el navegador
Write-Host "Abriendo aplicacion en el navegador..." -ForegroundColor Yellow
Start-Process "http://localhost:8000"

Write-Host "Presiona Ctrl+C para detener los servicios" -ForegroundColor Yellow
Write-Host "O cierra esta ventana para continuar en segundo plano" -ForegroundColor Yellow

# Mantener la ventana abierta
Read-Host "Presiona Enter para salir"

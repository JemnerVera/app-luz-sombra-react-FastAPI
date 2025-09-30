@echo off
echo ========================================
echo   AGRICOLA LUZ-SOMBRA - FRONTEND REACT
echo ========================================
echo.
echo [1/2] Verificando directorio React...
if not exist "agricola-frontend" (
    echo ❌ Directorio agricola-frontend no encontrado
    pause
    exit /b 1
)
echo ✅ Proyecto React encontrado
echo.
echo [2/2] Iniciando React frontend...
cd agricola-frontend
echo 🚀 Frontend: http://localhost:3000
echo.
npm start

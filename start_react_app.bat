@echo off
echo ========================================
echo    AGRICOLA LUZ-SOMBRA - REACT FRONTEND
echo    VERSION REACT + FASTAPI SEPARADOS
echo ========================================
echo.

echo Verificando directorio React...
if not exist "agricola-frontend\package.json" (
    echo ❌ Error: Proyecto React no encontrado
    echo.
    echo Por favor asegurate de que existe la carpeta agricola-frontend
    echo.
    pause
    exit /b 1
)

echo ✅ Proyecto React encontrado
echo.

echo [1/2] Navegando al directorio React...
cd agricola-frontend

echo [2/2] Iniciando aplicación React...
echo.
echo 🚀 Iniciando React en modo desarrollo...
echo 📱 Accede a: http://localhost:3000
echo 🔗 Backend API: http://localhost:8000
echo.
echo ⏹️ Presiona Ctrl+C para detener
echo ========================================
echo.

echo Iniciando servidor de desarrollo...
npm start

echo.
echo ========================================
echo    APLICACION REACT INICIADA
echo ========================================
echo.
echo 🌐 Frontend React: http://localhost:3000
echo 🔧 Backend API:    http://localhost:8000
echo.
echo 💡 Asegurate de que el backend FastAPI esté ejecutándose
echo    en otra terminal con: .\start_app.bat
echo.
echo Presiona cualquier tecla para cerrar...
pause >nul

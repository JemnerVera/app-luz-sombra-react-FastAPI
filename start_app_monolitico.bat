@echo off
echo ========================================
echo    AGRICOLA LUZ-SOMBRA SUPERVISADO
echo    VERSION MONOLITICA (FastAPI + HTML)
echo ========================================
echo.

echo Verificando entorno virtual...
if not exist "venv\Scripts\python.exe" (
    echo ❌ Error: Entorno virtual no encontrado
    echo.
    echo Por favor ejecuta primero: setup_completo.bat
    echo.
    pause
    exit /b 1
)

echo ✅ Entorno virtual encontrado
echo.

echo [1/2] Activando entorno virtual...
call venv\Scripts\activate.bat

echo [2/2] Iniciando aplicacion monolítica...
echo.
echo 🚀 Iniciando FastAPI con frontend integrado...
echo 📱 Accede a: http://localhost:8000
echo 🔧 API Docs: http://localhost:8000/docs
echo ❤️ Health: http://localhost:8000/health
echo.
echo ⏹️ Presiona Ctrl+C para detener
echo ========================================
echo.

start "Luz-Sombra App" cmd /k "cd /d %~dp0 && venv\Scripts\python.exe start_simple.py"

timeout /t 3 /nobreak >nul

echo [3/3] Abriendo navegador...
timeout /t 5 /nobreak >nul
start http://localhost:8000

echo.
echo ========================================
echo    APLICACION INICIADA CORRECTAMENTE
echo ========================================
echo.
echo 🌐 Aplicacion Web: http://localhost:8000
echo 📚 API Docs:       http://localhost:8000/docs
echo ❤️ Health Check:   http://localhost:8000/health
echo.
echo 💡 La aplicacion ahora es monolítica:
echo    - Frontend HTML integrado en FastAPI
echo    - Un solo servicio (no necesitas React)
echo    - Deployment mas simple
echo.
echo Presiona cualquier tecla para cerrar...
pause >nul

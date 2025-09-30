@echo off
echo ========================================
echo    PRUEBA LOCAL - LUZ-SOMBRA APP
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

echo [1/3] Probando importaciones...
venv\Scripts\python.exe test_minimal.py
if %errorlevel% neq 0 (
    echo ❌ Error en las pruebas básicas
    pause
    exit /b 1
)

echo.
echo [2/3] Probando creación de aplicación...
venv\Scripts\python.exe test_app.py
if %errorlevel% neq 0 (
    echo ❌ Error en las pruebas de aplicación
    pause
    exit /b 1
)

echo.
echo [3/3] Iniciando servidor de prueba...
echo.
echo 🚀 Iniciando servidor en http://localhost:8000
echo ⏹️ Presiona Ctrl+C para detener
echo.

venv\Scripts\python.exe start_simple.py

echo.
echo ========================================
echo    PRUEBA COMPLETADA
echo ========================================
echo.
pause

@echo off
echo ========================================
echo   AGRICOLA LUZ-SOMBRA - REACT + FASTAPI
echo   VERSION SEPARADA (REACT + FASTAPI)
echo ========================================
echo.
echo [1/3] Verificando entorno virtual...
if not exist "venv" (
    echo ❌ Entorno virtual no encontrado
    echo Ejecuta: python -m venv venv
    pause
    exit /b 1
)
echo ✅ Entorno virtual encontrado
echo.
echo [2/3] Iniciando backend FastAPI...
start "Backend FastAPI" cmd /k "call venv\Scripts\activate.bat && venv\Scripts\python.exe -m uvicorn api:app --host 0.0.0.0 --port 8000 --reload"
echo.
echo [3/3] Iniciando frontend React...
start "Frontend React" cmd /k "cd agricola-frontend && npm start"
echo.
echo ========================================
echo   APLICACION INICIADA CORRECTAMENTE
echo ========================================
echo 🚀 Backend API:  http://localhost:8000
echo 📚 API Docs:     http://localhost:8000/docs
echo 🌐 Frontend:     http://localhost:3000
echo.
echo Presiona cualquier tecla para cerrar...
pause >nul

@echo off
echo ========================================
echo   AGRICOLA LUZ-SOMBRA - BACKEND FASTAPI
echo ========================================
echo.
echo [1/2] Activando entorno virtual...
call venv\Scripts\activate.bat
echo.
echo [2/2] Iniciando FastAPI backend...
echo 🚀 Backend: http://localhost:8000
echo 📚 API Docs: http://localhost:8000/docs
echo.
venv\Scripts\python.exe -m uvicorn api:app --host 0.0.0.0 --port 8000 --reload

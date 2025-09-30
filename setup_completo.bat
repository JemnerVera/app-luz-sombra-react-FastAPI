@echo off
echo ========================================
echo    AGRICOLA LUZ-SOMBRA - SETUP Y EJECUCION
echo ========================================
echo.

echo Verificando requisitos...
echo.

REM Verificar Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python no encontrado.
    echo.
    echo ¿Quieres instalar Python 3.11 automáticamente? (S/N)
    set /p install_python=
    if /i "%install_python%"=="S" (
        echo.
        echo Instalando Python 3.11 con winget...
        winget install Python.Python.3.11
        if %errorlevel% neq 0 (
            echo ❌ Error instalando Python. Instala manualmente desde: https://www.python.org/downloads/
            echo    Asegurate de marcar "Add Python to PATH"
            pause
            exit /b 1
        )
        echo ✅ Python instalado correctamente
        echo ⚠️  Reinicia el script para continuar
        pause
        exit /b 0
    ) else (
        echo ❌ Python requerido. Instala desde: https://www.python.org/downloads/
        echo    Asegurate de marcar "Add Python to PATH"
        pause
        exit /b 1
    )
)
echo ✅ Python encontrado

REM Verificar Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js no encontrado.
    echo.
    echo ¿Quieres instalar Node.js automáticamente? (S/N)
    set /p install_node=
    if /i "%install_node%"=="S" (
        echo.
        echo Instalando Node.js con winget...
        winget install OpenJS.NodeJS
        if %errorlevel% neq 0 (
            echo ❌ Error instalando Node.js. Instala manualmente desde: https://nodejs.org/
            pause
            exit /b 1
        )
        echo ✅ Node.js instalado correctamente
        echo ⚠️  Reinicia el script para continuar
        pause
        exit /b 0
    ) else (
        echo ❌ Node.js requerido. Instala desde: https://nodejs.org/
        pause
        exit /b 1
    )
)
echo ✅ Node.js encontrado

echo.
echo [1/4] Creando entorno virtual Python...
if not exist "venv" (
    python -m venv venv
    if %errorlevel% neq 0 (
        echo ❌ Error creando entorno virtual
        pause
        exit /b 1
    )
    echo ✅ Entorno virtual creado
) else (
    echo ✅ Entorno virtual ya existe
)

echo.
echo [2/4] Instalando dependencias Python...
call venv\Scripts\activate
pip install --upgrade pip >nul 2>&1
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ❌ Error instalando dependencias Python
    pause
    exit /b 1
)
echo ✅ Dependencias Python instaladas

echo.
echo [3/4] Instalando dependencias Node.js...
cd frontend-react
if not exist "node_modules" (
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Error instalando dependencias Node.js
        pause
        exit /b 1
    )
    echo ✅ Dependencias Node.js instaladas
) else (
    echo ✅ Dependencias Node.js ya instaladas
)
cd ..

echo.
echo [4/4] Configurando Google Sheets...
if not exist "google_sheets_config.json" (
    if exist "google_sheets_config.example.json" (
        copy "google_sheets_config.example.json" "google_sheets_config.json" >nul
        echo ✅ Archivo de configuración creado
    ) else (
        echo ⚠️  Archivo google_sheets_config.json no encontrado
    )
) else (
    echo ✅ Archivo de configuración encontrado
)

echo.
echo ========================================
echo    INICIANDO APLICACION...
echo ========================================
echo.

echo [1/3] Iniciando Backend (FastAPI)...
start "Backend API" cmd /k "cd /d %~dp0 && call venv\Scripts\activate && python api.py"
timeout /t 3 /nobreak >nul

echo [2/3] Iniciando Frontend (React)...
start "Frontend React" cmd /k "cd /d %~dp0\frontend-react && npm start"
timeout /t 3 /nobreak >nul

echo [3/3] Abriendo navegador...
timeout /t 5 /nobreak >nul
start http://localhost:3000

echo.
echo ========================================
echo    APLICACION INICIADA CORRECTAMENTE
echo ========================================
echo.
echo Backend API: http://localhost:8000
echo Frontend:    http://localhost:3000
echo.
echo Presiona cualquier tecla para cerrar...
pause >nul

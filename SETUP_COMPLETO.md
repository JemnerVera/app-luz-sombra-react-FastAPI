# 🚀 SETUP COMPLETO - AGRICOLA LUZ-SOMBRA

## 📋 Requisitos Previos
1. **Python 3.11** (descargar desde: https://www.python.org/downloads/)
2. **Node.js 18+** (descargar desde: https://nodejs.org/)
3. **Git** (descargar desde: https://git-scm.com/)

## 🔧 Instalación Paso a Paso

### 1. Clonar el repositorio
```bash
git clone https://github.com/JemnerVera/agricola-luz-sombra-supervisado.git
cd agricola-luz-sombra-supervisado
```

### 2. Configurar Backend (Python)
```bash
# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt
```

### 3. Configurar Frontend (React)
```bash
cd frontend-react
npm install
cd ..
```

### 4. Configurar Google Sheets
1. Copiar `google_sheets_config.example.json` a `google_sheets_config.json`
2. Editar `google_sheets_config.json` con tus credenciales

### 5. Ejecutar la aplicación
```bash
# Opción 1: Usar el script automático
start_app.bat

# Opción 2: Manual
# Terminal 1 (Backend):
python api.py

# Terminal 2 (Frontend):
cd frontend-react
npm start
```

## 🌐 URLs
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Documentación API**: http://localhost:8000/docs

## ❗ Problemas Comunes

### Error: "python no se reconoce"
- Instalar Python 3.11 desde python.org
- Marcar "Add Python to PATH" durante la instalación

### Error: "npm no se reconoce"
- Instalar Node.js desde nodejs.org
- Reiniciar terminal después de instalar

### Error: "No module named 'cv2'"
- Ejecutar: `pip install opencv-python-headless`

### Error: "No module named 'fastapi'"
- Ejecutar: `pip install -r requirements.txt`

## 📁 Estructura del Proyecto
```
agricola-luz-sombra-supervisado/
├── api.py                          # Backend FastAPI
├── requirements.txt                # Dependencias Python
├── start_app.bat                   # Script de inicio
├── frontend-react/                 # Frontend React
│   ├── package.json               # Dependencias Node.js
│   └── src/                       # Código fuente React
├── src/                           # Código Python
│   ├── services/                  # Servicios ML
│   ├── google_sheets/             # Integración Google Sheets
│   └── metadata/                  # Extracción de metadatos
└── modelo_perfeccionado.pkl       # Modelo ML
```

## 🆘 Soporte
Si tienes problemas, verifica:
1. ✅ Python 3.11 instalado
2. ✅ Node.js 18+ instalado
3. ✅ Dependencias instaladas
4. ✅ Google Sheets configurado
5. ✅ Modelo ML presente

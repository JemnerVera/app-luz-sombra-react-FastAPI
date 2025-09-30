# 🌱 AGRICOLA LUZ-SOMBRA SUPERVISADO

Aplicación web para análisis de luz y sombra en imágenes agrícolas usando Machine Learning.

## 🚀 Inicio Rápido

### Para usuarios nuevos:
1. **Descargar el proyecto**
2. **Ejecutar**: `setup_completo.bat`
3. **Seguir las instrucciones** en pantalla

### Para usuarios experimentados:
1. **Instalar dependencias**:
   ```bash
   # Backend
   python -m venv venv
   venv\Scripts\activate
   pip install -r requirements.txt
   
   # Frontend
   cd frontend-react
   npm install
   ```

2. **Ejecutar**: `start_app.bat`

## 📋 Requisitos
- **Python 3.11+**
- **Node.js 18+**
- **Git**

## 🌐 URLs
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Documentación API**: http://localhost:8000/docs

## 📁 Estructura
```
├── api.py                          # Backend FastAPI
├── requirements.txt                # Dependencias Python
├── setup_completo.bat             # Setup automático
├── start_app.bat                  # Script de inicio
├── frontend-react/                # Frontend React
└── src/                          # Código Python
```

## ⚙️ Configuración
1. Copiar `google_sheets_config.example.json` a `google_sheets_config.json`
2. Editar con tus credenciales de Google Sheets

## 🆘 Problemas Comunes
- **Python no encontrado**: Instalar desde python.org
- **Node.js no encontrado**: Instalar desde nodejs.org
- **Dependencias faltantes**: Ejecutar `setup_completo.bat`

## 📖 Documentación Completa
Ver `SETUP_COMPLETO.md` para instrucciones detalladas.
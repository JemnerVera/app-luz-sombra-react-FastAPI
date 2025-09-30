# 🌱 AGRICOLA LUZ-SOMBRA SUPERVISADO

Aplicación web monolítica para análisis de luz y sombra en imágenes agrícolas usando Machine Learning con FastAPI.

## 🚀 Inicio Rápido

### Para usuarios nuevos:
1. **Descargar el proyecto**
2. **Ejecutar**: `setup_completo.bat`
3. **Seguir las instrucciones** en pantalla

### Para usuarios experimentados:
1. **Instalar dependencias**:
   ```bash
   # Crear entorno virtual
   python -m venv venv
   venv\Scripts\activate
   
   # Instalar dependencias
   pip install -r requirements.txt
   ```

2. **Ejecutar aplicación**:
   ```bash
   python start_simple.py
   ```

## 📋 Requisitos
- **Python 3.11+**
- **Git**

## 🌐 URLs
- **Aplicación Web**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## 📁 Estructura
```
├── api.py                          # Aplicación FastAPI principal
├── requirements.txt                # Dependencias Python
├── templates/                      # Templates HTML (Jinja2)
│   ├── base.html                  # Template base
│   └── index.html                 # Página principal
├── static/                        # Archivos estáticos
│   ├── css/style.css              # Estilos CSS
│   ├── js/app.js                  # JavaScript principal
│   └── images/                    # Imágenes
├── src/                          # Código Python (ML, servicios)
├── modelo_perfeccionado.pkl       # Modelo ML entrenado
└── start_simple.py               # Script de inicio
```

## ⚙️ Configuración
1. Crear `google_sheets_config.json` con tus credenciales de Google Sheets
2. Configurar variables de entorno para deployment

## 🚀 Deployment

### Railway (Recomendado)
1. Conectar repositorio a Railway
2. Configurar variables de entorno
3. Deploy automático

### Render
1. Crear Web Service en Render
2. Conectar repositorio
3. Configurar variables de entorno

Ver `DEPLOYMENT_GUIDE.md` para instrucciones detalladas.

## 🧪 Testing
```bash
# Probar aplicación
python test_app.py

# Probar componentes básicos
python test_minimal.py
```

## 🆘 Problemas Comunes
- **Python no encontrado**: Instalar desde python.org
- **Dependencias faltantes**: Ejecutar `pip install -r requirements.txt`
- **Modelo no encontrado**: Verificar que `modelo_perfeccionado.pkl` existe
- **Google Sheets error**: Verificar configuración en `google_sheets_config.json`

## 📖 Documentación Completa
- `SETUP_COMPLETO.md` - Instrucciones detalladas de setup
- `DEPLOYMENT_GUIDE.md` - Guía de deployment
- `api.py` - Código fuente principal

## 🔄 Migración Completada
✅ **Frontend React** → **HTML + JavaScript vanilla**  
✅ **Dos servicios separados** → **Un solo servicio FastAPI**  
✅ **Deployment complejo** → **Deployment simple**  
✅ **Mismo rendimiento ML** → **Mantiene toda la funcionalidad**
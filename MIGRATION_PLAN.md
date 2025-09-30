# 🚀 Plan de Migración: FastAPI Monolítico → React + FastAPI

## 📋 Estructura Objetivo

```
┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │
│   (React SPA)   │◄──►│   (FastAPI)     │
│   Puerto 3000   │    │   Puerto 8000   │
└─────────────────┘    └─────────────────┘
```

## 🎯 Fases de Desarrollo

### **Fase 1: Backend (4 horas)**
- [x] Endpoints API separados (ya existen con /api/)
- [ ] Configurar CORS middleware
- [ ] Ajustar respuestas JSON
- [ ] Documentar API endpoints
- [ ] Configurar variables de entorno

### **Fase 2: Frontend React (1-2 días)**
- [ ] Setup proyecto React
- [ ] Estructura de componentes
- [ ] Servicios API
- [ ] Hooks personalizados
- [ ] Styling con Tailwind CSS

### **Fase 3: Migración Funcionalidades (1 día)**
- [ ] Subida múltiple de imágenes
- [ ] Cascada de selects
- [ ] Extracción GPS del EXIF
- [ ] Procesamiento de imágenes
- [ ] Historial y resultados

## 📁 Estructura React

```
src/
├── components/
│   ├── ImageUpload.jsx          # Múltiples imágenes, EXIF, drag&drop
│   ├── FieldSelects.jsx         # Cascada Empresa→Fundo→Sector→Lote
│   ├── ResultsDisplay.jsx       # Resultados múltiples, promedios
│   ├── HistoryTable.jsx         # Tabla historial, export CSV
│   ├── Layout.jsx               # Header, tabs, sidebar
│   └── Modal.jsx                # Modal confirmación cambios
├── services/
│   └── api.js                   # Endpoints: processImages, getFieldData, getHistory
├── hooks/
│   ├── useFieldData.js          # Carga datos jerárquicos
│   ├── useImageUpload.js        # Manejo imágenes múltiples
│   ├── useResults.js            # Estado resultados
│   └── useExif.js               # Extracción GPS
├── utils/
│   ├── exif.js                  # Funciones EXIF
│   ├── helpers.js               # Utilidades generales
│   └── constants.js             # Configuración
└── styles/
    └── globals.css              # Tailwind CSS
```

## 🔧 Funcionalidades a Migrar

### **1. Subida Múltiple de Imágenes**
- [x] Drag & drop área
- [x] Selección múltiple archivos
- [x] Botón "Agregar Más"
- [x] Preview individual por imagen
- [x] Eliminación individual

### **2. Cascada de Selects**
- [x] Empresa → Fundo → Sector → Lote
- [x] Filtros jerárquicos reales
- [x] Estados deshabilitados
- [x] Placeholders informativos

### **3. Extracción GPS**
- [x] Lectura EXIF automática
- [x] Conversión DMS a DD
- [x] Estados visuales (verde/rojo)
- [x] Coordenadas en formulario

### **4. Procesamiento de Imágenes**
- [x] Envío individual por imagen
- [x] Campos específicos por imagen
- [x] Resultados detallados
- [x] Manejo de errores

### **5. Historial y Resultados**
- [x] Tabla de historial
- [x] Exportación CSV
- [x] Resultados con promedios
- [x] Estados de éxito/error

## 🔄 Backend - Cambios Necesarios

### **CORS Configuration**
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://tu-dominio.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### **Endpoints API (Ya existen)**
- [x] `GET /api/health`
- [x] `POST /api/procesar-imagen-simple`
- [x] `GET /api/google-sheets/field-data`
- [x] `GET /api/historial`
- [x] `GET /api/estadisticas`

## 🚀 Deployment

### **Frontend (Vercel/Netlify)**
```json
{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ]
}
```

### **Backend (Railway/Render)**
```yaml
# railway.toml
[build]
builder = "NIXPACKS"
buildCommand = "pip install -r requirements.txt"

[deploy]
startCommand = "uvicorn api:app --host 0.0.0.0 --port $PORT"
```

## 📊 Variables de Entorno

### **Frontend (.env)**
```
REACT_APP_API_URL=http://localhost:8000
REACT_APP_GOOGLE_SHEETS_CONFIG=xxx
```

### **Backend (.env)**
```
GOOGLE_SHEETS_SPREADSHEET_ID=xxx
GOOGLE_SHEETS_SHEET_NAME=Data-app
GOOGLE_SHEETS_CREDENTIALS_BASE64=xxx
GOOGLE_SHEETS_TOKEN_BASE64=xxx
```

## ⏱️ Cronograma

| Día | Tarea | Tiempo |
|-----|-------|--------|
| 1 | Setup React + componentes básicos | 8 horas |
| 2 | Integración API + funcionalidades | 8 horas |
| 3 | Styling + testing + deployment | 8 horas |

## 🎯 Criterios de Éxito

- [ ] Frontend React funcionando localmente
- [ ] Integración API completa
- [ ] Todas las funcionalidades migradas
- [ ] Deployment exitoso en ambas plataformas
- [ ] Testing de funcionalidades críticas
- [ ] Documentación actualizada

## 📝 Notas Importantes

- **Mantener backend actual** durante desarrollo
- **Migrar componente por componente**
- **Testing continuo** en cada fase
- **Backup de versión monolítica**
- **Configuración CORS** para desarrollo y producción

---

**Estado Actual**: Plan creado ✅  
**Próximo Paso**: Setup proyecto React  
**Responsable**: Equipo de desarrollo  
**Fecha Inicio**: [Por definir]

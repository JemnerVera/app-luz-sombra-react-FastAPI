# 🌱 Agricola Luz-Sombra - Frontend React

Frontend de la aplicación Agricola Luz-Sombra construido con React + TypeScript + Tailwind CSS.

## 🚀 Características

- **React 18** con TypeScript
- **Tailwind CSS** para estilos
- **Lucide React** para iconos
- **Axios** para peticiones HTTP
- **EXIF.js** para extracción de GPS
- **Arquitectura modular** con hooks personalizados

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes React
│   ├── ImageUploadForm.tsx    # Formulario de subida múltiple
│   ├── ModelTestForm.tsx      # Formulario de prueba del modelo
│   ├── HistoryTable.tsx       # Tabla de historial
│   ├── Layout.tsx             # Layout principal
│   └── Notification.tsx       # Componente de notificaciones
├── hooks/               # Hooks personalizados
│   ├── useFieldData.ts        # Hook para datos de campo
│   └── useImageUpload.ts      # Hook para subida de imágenes
├── services/            # Servicios API
│   └── api.ts                 # Cliente API
├── types/               # Tipos TypeScript
│   └── index.ts              # Definiciones de tipos
├── utils/               # Utilidades
│   ├── exif.ts               # Funciones EXIF
│   ├── helpers.ts            # Utilidades generales
│   └── constants.ts          # Constantes de la app
├── config/              # Configuración
│   └── environment.ts        # Variables de entorno
└── App.tsx              # Componente principal
```

## 🛠️ Instalación

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Configurar variables de entorno:**
   ```bash
   # Crear archivo .env
   REACT_APP_API_URL=http://localhost:8000
   ```

3. **Iniciar en desarrollo:**
   ```bash
   npm start
   ```

4. **Construir para producción:**
   ```bash
   npm run build
   ```

## 🔧 Scripts Disponibles

- `npm start` - Inicia el servidor de desarrollo
- `npm run build` - Construye la app para producción
- `npm test` - Ejecuta las pruebas
- `npm run eject` - Expone la configuración (irreversible)

## 🌐 Funcionalidades

### 📤 Subida Múltiple de Imágenes
- Drag & drop de archivos
- Selección múltiple
- Preview individual
- Extracción automática de GPS del EXIF
- Campos específicos por imagen (Hilera, N° Planta)

### 🔄 Selects en Cascada
- Empresa → Fundo → Sector → Lote
- Filtrado jerárquico real
- Estados deshabilitados
- Placeholders informativos

### 📊 Historial y Resultados
- Tabla de historial con filtros
- Exportación a CSV
- Resultados detallados por imagen
- Estados de éxito/error

### 🗺️ Extracción GPS
- Lectura automática del EXIF
- Conversión DMS a DD
- Estados visuales (verde/rojo)
- Coordenadas en formulario

## 🔌 Integración con Backend

El frontend se conecta al backend FastAPI a través de los siguientes endpoints:

- `GET /api/health` - Health check
- `GET /api/google-sheets/field-data` - Datos de campo
- `POST /api/procesar-imagen-simple` - Procesar imagen
- `POST /api/procesar-imagen-visual` - Probar modelo
- `GET /api/historial` - Obtener historial
- `GET /api/estadisticas` - Obtener estadísticas

## 🎨 Styling

- **Tailwind CSS** para estilos utilitarios
- **Tema oscuro** configurado
- **Componentes reutilizables**
- **Responsive design**
- **Iconos de Lucide React**

## 📱 Responsive Design

- **Mobile-first** approach
- **Breakpoints** de Tailwind
- **Grid layouts** adaptativos
- **Componentes flexibles**

## 🚀 Deployment

### Vercel
```bash
npm run build
# Subir carpeta build/ a Vercel
```

### Netlify
```bash
npm run build
# Subir carpeta build/ a Netlify
```

### Variables de Entorno en Producción
```
REACT_APP_API_URL=https://tu-backend.railway.app
```

## 🔧 Desarrollo

### Estructura de Componentes
- **Layout** - Estructura principal con navegación
- **ImageUploadForm** - Formulario de análisis múltiple
- **ModelTestForm** - Formulario de prueba del modelo
- **HistoryTable** - Tabla de historial con filtros
- **Notification** - Sistema de notificaciones

### Hooks Personalizados
- **useFieldData** - Manejo de datos de campo y cascada
- **useImageUpload** - Manejo de subida de imágenes

### Servicios
- **apiService** - Cliente HTTP con interceptores
- **EXIF utilities** - Extracción de GPS
- **Helper functions** - Utilidades generales

## 📋 TODO

- [ ] Agregar tests unitarios
- [ ] Implementar PWA
- [ ] Agregar modo offline
- [ ] Mejorar accesibilidad
- [ ] Optimizar bundle size

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.
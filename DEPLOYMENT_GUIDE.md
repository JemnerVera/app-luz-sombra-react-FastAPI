# 🚀 Guía de Deployment - Luz-Sombra FastAPI

## 📋 Opciones de Deployment

### 1. Railway (Recomendado)
Railway es ideal para aplicaciones Python con ML.

#### Pasos:
1. **Crear cuenta en Railway**: https://railway.app
2. **Conectar repositorio**: Conectar tu repositorio de GitHub
3. **Configurar variables de entorno**:
   ```
   GOOGLE_SHEETS_SPREADSHEET_ID=tu_spreadsheet_id
   GOOGLE_SHEETS_SHEET_NAME=Data-app
   GOOGLE_SHEETS_CREDENTIALS_BASE64=tu_credenciales_base64
   GOOGLE_SHEETS_TOKEN_BASE64=tu_token_base64
   ```
4. **Deploy automático**: Railway detectará `railway.toml` y desplegará automáticamente

#### Ventajas:
- ✅ Soporte nativo para Python
- ✅ Variables de entorno fáciles de configurar
- ✅ Deploy automático desde GitHub
- ✅ Logs en tiempo real
- ✅ HTTPS automático

### 2. Render
Render es una alternativa gratuita con buenas características.

#### Pasos:
1. **Crear cuenta en Render**: https://render.com
2. **Crear nuevo Web Service**
3. **Conectar repositorio**: Conectar tu repositorio de GitHub
4. **Configurar**:
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn api:app --host 0.0.0.0 --port $PORT`
   - **Health Check Path**: `/health`
5. **Configurar variables de entorno** (mismas que Railway)

#### Ventajas:
- ✅ Plan gratuito disponible
- ✅ Deploy automático
- ✅ HTTPS automático
- ✅ Logs disponibles

### 3. Fly.io
Para aplicaciones más complejas con mayor control.

#### Pasos:
1. **Instalar Fly CLI**: https://fly.io/docs/hands-on/install-flyctl/
2. **Login**: `fly auth login`
3. **Crear app**: `fly launch`
4. **Configurar variables**: `fly secrets set KEY=value`
5. **Deploy**: `fly deploy`

## 🔧 Configuración de Variables de Entorno

### Variables Requeridas:
```bash
GOOGLE_SHEETS_SPREADSHEET_ID=1ABC123def456GHI789jkl
GOOGLE_SHEETS_SHEET_NAME=Data-app
GOOGLE_SHEETS_CREDENTIALS_BASE64=eyJ0eXBlIjoic2VydmljZV9hY2NvdW50Ii...
GOOGLE_SHEETS_TOKEN_BASE64=eyJ0b2tlbl90eXBlIjoiQmVhcmVyIi...
```

### Cómo obtener las credenciales Base64:

1. **Credentials JSON**:
   ```bash
   # Convertir archivo JSON a Base64
   base64 -i google_sheets_credentials.json
   ```

2. **Token JSON**:
   ```bash
   # Convertir archivo token.json a Base64
   base64 -i token.json
   ```

## 📁 Archivos de Deployment Incluidos

- `railway.toml` - Configuración para Railway
- `render.yaml` - Configuración para Render
- `runtime.txt` - Versión de Python para Heroku
- `Procfile` - Comando de inicio para Heroku
- `requirements.txt` - Dependencias Python actualizadas

## 🧪 Testing Local

Antes de hacer deploy, prueba localmente:

```bash
# Instalar dependencias
pip install -r requirements.txt

# Ejecutar aplicación
uvicorn api:app --reload

# Verificar en navegador
# http://localhost:8000
```

## 🔍 Verificación Post-Deploy

1. **Health Check**: `https://tu-app.railway.app/health`
2. **Aplicación Web**: `https://tu-app.railway.app/`
3. **API Docs**: `https://tu-app.railway.app/docs`
4. **Google Sheets**: Verificar conexión en la app

## 🆘 Troubleshooting

### Error: "No module named 'cv2'"
- Verificar que `opencv-python-headless` esté en requirements.txt
- Reiniciar el servicio

### Error: "Google Sheets authentication failed"
- Verificar variables de entorno
- Verificar formato Base64 de credenciales

### Error: "Model not found"
- Verificar que `modelo_perfeccionado.pkl` esté en el repositorio
- Verificar permisos de archivo

### Error: "Port binding failed"
- Verificar que el comando use `$PORT` (variable de entorno)
- Verificar configuración de Railway/Render

## 📊 Monitoreo

### Railway:
- Dashboard: https://railway.app/dashboard
- Logs: Disponibles en tiempo real
- Métricas: CPU, memoria, red

### Render:
- Dashboard: https://dashboard.render.com
- Logs: Disponibles en el dashboard
- Métricas: Básicas disponibles

## 🔄 Actualizaciones

Para actualizar la aplicación:
1. Hacer commit de cambios
2. Push a GitHub
3. Deploy automático (Railway/Render)
4. Verificar en logs que no hay errores

## 💡 Tips de Optimización

1. **Imágenes**: Comprimir imágenes antes de subir
2. **Modelo**: El modelo se carga una vez al inicio
3. **Cache**: Considerar cache para Google Sheets
4. **Logs**: Monitorear logs para detectar problemas

## 📞 Soporte

Si tienes problemas:
1. Revisar logs del servicio
2. Verificar variables de entorno
3. Probar localmente primero
4. Consultar documentación de la plataforma

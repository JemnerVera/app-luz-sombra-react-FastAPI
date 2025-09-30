# 🚀 Guía de Deploy en Render - Agricola Luz-Sombra

## 📋 Resumen
Esta guía te llevará paso a paso para hacer deploy de la aplicación **Agricola Luz-Sombra** (FastAPI + React) en **Render**.

## 🏗️ Arquitectura
- **Backend**: FastAPI (Python) - API REST + ML Model
- **Frontend**: React (compilado a archivos estáticos)
- **Base de datos**: SQLite (archivo local)
- **Hosting**: Render (gratis)

---

## ✅ PREPARACIÓN COMPLETADA

### 📁 Archivos creados:
- ✅ `render.yaml` - Configuración de Render
- ✅ `requirements.txt` - Dependencias Python
- ✅ `api.py` - Modificado para servir archivos estáticos
- ✅ `agricola-frontend/build/` - React compilado para producción

---

## 🚀 PASOS PARA DEPLOY

### **PASO 1: Crear cuenta en Render**
1. Ve a [render.com](https://render.com)
2. Haz clic en **"Get Started for Free"**
3. Regístrate con GitHub (recomendado)

### **PASO 2: Conectar GitHub**
1. En Render, ve a **"Dashboard"**
2. Haz clic en **"New +"** → **"Web Service"**
3. Conecta tu repositorio de GitHub
4. Selecciona el repositorio: `app-luz-sombra-node+py`

### **PASO 3: Configurar el servicio**
1. **Name**: `agricola-luz-sombra`
2. **Environment**: `Python 3`
3. **Build Command**: 
   ```bash
   pip install -r requirements.txt
   cd agricola-frontend && npm install && npm run build
   cd ..
   ```
4. **Start Command**: 
   ```bash
   python api.py
   ```

### **PASO 4: Variables de entorno**
En la sección **"Environment Variables"**, agrega:

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `PYTHON_VERSION` | `3.11.0` | Versión de Python |
| `PORT` | `10000` | Puerto (Render lo asigna automáticamente) |
| `HOST` | `0.0.0.0` | Host |
| `ENVIRONMENT` | `production` | Entorno de producción |

### **PASO 5: Configurar Google Sheets (Opcional)**
Si usas Google Sheets, agrega estas variables:

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `GOOGLE_SHEETS_SPREADSHEET_ID` | `tu_spreadsheet_id` | ID de tu Google Sheet |
| `GOOGLE_SHEETS_SHEET_NAME` | `Data-app` | Nombre de la hoja |
| `GOOGLE_SHEETS_CREDENTIALS_BASE64` | `base64_credentials` | Credenciales en Base64 |

### **PASO 6: Deploy**
1. Haz clic en **"Create Web Service"**
2. Render comenzará el build automáticamente
3. El proceso tomará 5-10 minutos
4. ¡Tu app estará disponible en la URL que te proporcione Render!

---

## 🔧 CONFIGURACIÓN AVANZADA

### **Dominio personalizado (Opcional)**
1. En tu servicio, ve a **"Settings"**
2. En **"Custom Domains"**, agrega tu dominio
3. Configura los DNS según las instrucciones

### **SSL automático**
- Render proporciona SSL automático
- Tu app estará disponible en `https://tu-app.onrender.com`

---

## 📊 MONITOREO

### **Logs**
- Ve a **"Logs"** en tu servicio para ver los logs en tiempo real
- Útil para debugging

### **Métricas**
- Render proporciona métricas básicas
- CPU, memoria, requests por minuto

---

## 🚨 TROUBLESHOOTING

### **Error: "Build failed"**
- Verifica que `requirements.txt` tenga todas las dependencias
- Revisa los logs de build

### **Error: "Module not found"**
- Asegúrate de que todas las dependencias estén en `requirements.txt`
- Verifica que los imports en `api.py` sean correctos

### **Error: "Frontend not found"**
- Verifica que `npm run build` se ejecute correctamente
- Revisa que la carpeta `agricola-frontend/build` exista

### **Error: "Port not available"**
- Render asigna el puerto automáticamente
- Usa `os.getenv("PORT", 8000)` en tu código

---

## 💰 COSTOS

### **Plan Gratuito**
- ✅ **Gratis** para proyectos pequeños
- ✅ 750 horas/mes de CPU
- ✅ 512MB RAM
- ✅ Sleep después de 15 min de inactividad
- ✅ SSL automático

### **Plan Pago** (si necesitas más recursos)
- $7/mes por servicio
- Sin sleep
- Más CPU y RAM
- Soporte prioritario

---

## 🎯 PRÓXIMOS PASOS

1. **Hacer commit y push** de todos los archivos
2. **Seguir la guía** paso a paso
3. **Probar la aplicación** en la URL de Render
4. **Configurar dominio personalizado** (opcional)

---

## 📞 SOPORTE

- **Render Docs**: [render.com/docs](https://render.com/docs)
- **FastAPI Docs**: [fastapi.tiangolo.com](https://fastapi.tiangolo.com)
- **React Docs**: [reactjs.org](https://reactjs.org)

---

## ✅ CHECKLIST FINAL

- [ ] Cuenta en Render creada
- [ ] Repositorio conectado
- [ ] Servicio configurado
- [ ] Variables de entorno configuradas
- [ ] Deploy exitoso
- [ ] Aplicación funcionando
- [ ] Dominio personalizado (opcional)

**¡Tu aplicación estará online en minutos!** 🎉

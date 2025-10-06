# 🐳 Deploy con Docker - Agricola Luz-Sombra

## 📋 Prerequisitos

- Docker instalado
- Docker Compose (opcional, para desarrollo local)

## 🚀 Deploy Local

### 1. Construir la imagen
```bash
docker build -t app-luz-sombra .
```

### 2. Ejecutar el contenedor
```bash
docker run -p 10000:10000 app-luz-sombra
```

### 3. O usar Docker Compose
```bash
docker-compose up --build
```

## 🌐 Acceso a la aplicación

- **Frontend**: http://localhost:10000
- **API Docs**: http://localhost:10000/docs

## 🔧 Variables de entorno

Configurar las siguientes variables de entorno:

- `GOOGLE_SHEETS_CREDENTIALS_BASE64`: Credenciales de Google Sheets (base64)
- `GOOGLE_SHEETS_TOKEN_BASE64`: Token de Google Sheets (base64)

## 📦 Estructura del contenedor

```
/app
├── api.py                    # Aplicación principal
├── modelo_perfeccionado.pkl  # Modelo ML
├── src/                      # Código fuente
├── agricola-frontend/build/  # Frontend compilado
└── requirements.txt          # Dependencias Python
```

## 🛠️ Comandos útiles

```bash
# Ver logs del contenedor
docker logs <container_id>

# Ejecutar bash en el contenedor
docker exec -it <container_id> /bin/bash

# Detener contenedor
docker stop <container_id>

# Eliminar contenedor
docker rm <container_id>
```

## 🎯 Deploy en producción

Para deploy en cualquier plataforma que soporte Docker:

1. Subir la imagen a un registry (Docker Hub, etc.)
2. Configurar variables de entorno
3. Ejecutar el contenedor

La aplicación estará disponible en el puerto 10000.


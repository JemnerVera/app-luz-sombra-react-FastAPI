# Multi-stage build para FastAPI + React
# Stage 1: Build React frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

# Copiar archivos de configuración del frontend
COPY agricola-frontend/package*.json ./

# Instalar dependencias
RUN npm install

# Copiar código fuente del frontend
COPY agricola-frontend/ ./

# Construir la aplicación React
RUN npm run build

# Stage 2: Python backend
FROM python:3.11-slim

# Instalar dependencias del sistema para OpenCV
RUN apt-get update && apt-get install -y \
    build-essential \
    libglib2.0-0 \
    libgomp1 \
    libjpeg-dev \
    libpng-dev \
    libtiff-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Establecer directorio de trabajo
WORKDIR /app

# Copiar requirements.txt primero para aprovechar cache de Docker
COPY requirements.txt .

# Instalar dependencias de Python
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el código de la aplicación
COPY . .

# Copiar el frontend compilado desde el stage anterior
COPY --from=frontend-builder /app/frontend/build ./agricola-frontend/build

# Crear directorios necesarios
RUN mkdir -p resultados

# Exponer el puerto
EXPOSE 10000

# Variables de entorno
ENV PYTHONPATH=/app
ENV PORT=10000

# Health check para Cloud Run
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:10000/health || exit 1

# Comando para ejecutar la aplicación
CMD ["python", "api.py"]
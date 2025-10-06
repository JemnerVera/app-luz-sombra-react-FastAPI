# Usar Python 3.11 como base
FROM python:3.11-slim

# Establecer directorio de trabajo
WORKDIR /app

# Instalar dependencias del sistema mínimas
RUN apt-get update && apt-get install -y \
    build-essential \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements.txt primero para aprovechar cache de Docker
COPY requirements.txt .

# Instalar dependencias de Python
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el código de la aplicación
COPY . .

# Crear directorio para archivos estáticos
RUN mkdir -p agricola-frontend/build

# Exponer el puerto
EXPOSE 10000

# Variables de entorno
ENV PYTHONPATH=/app
ENV PORT=10000

# Comando para ejecutar la aplicación
CMD ["python", "api.py"]

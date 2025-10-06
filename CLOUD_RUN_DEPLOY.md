# 🚀 Deploy a Google Cloud Run

## 📋 Prerrequisitos

1. **Cuenta de Google Cloud** (gratis)
2. **Google Cloud CLI** instalado
3. **Docker** instalado (ya lo tienes)

## 🔧 Configuración inicial

### 1. Instalar Google Cloud CLI
```bash
# Windows (PowerShell)
(New-Object Net.WebClient).DownloadFile("https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe", "$env:Temp\GoogleCloudSDKInstaller.exe")
& "$env:Temp\GoogleCloudSDKInstaller.exe"
```

### 2. Inicializar gcloud
```bash
gcloud init
```

### 3. Crear proyecto (si no tienes uno)
```bash
gcloud projects create app-luz-sombra-$(Get-Random)
gcloud config set project app-luz-sombra-$(Get-Random)
```

### 4. Habilitar APIs necesarias
```bash
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

## 🚀 Deploy

### Opción 1: Deploy directo con Docker
```bash
# Construir imagen
docker build -t gcr.io/PROJECT_ID/app-luz-sombra .

# Subir imagen
docker push gcr.io/PROJECT_ID/app-luz-sombra

# Deploy a Cloud Run
gcloud run deploy app-luz-sombra \
  --image gcr.io/PROJECT_ID/app-luz-sombra \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --port 10000 \
  --memory 2Gi \
  --cpu 2 \
  --timeout 900
```

### Opción 2: Deploy con Cloud Build
```bash
gcloud builds submit --config cloudbuild.yaml
```

## 🔑 Variables de entorno

Configurar en Cloud Run Console o con gcloud:

```bash
gcloud run services update app-luz-sombra \
  --region us-central1 \
  --set-env-vars="GOOGLE_SHEETS_SPREADSHEET_ID=1H3oobEJdidbJ2S7Ms3nW0ZbSR-yKiZHQNZp2pubXIU4,GOOGLE_SHEETS_SHEET_NAME=Data-app,GOOGLE_SHEETS_CREDENTIALS_BASE64=TU_VALOR_AQUI,GOOGLE_SHEETS_TOKEN_BASE64=TU_VALOR_AQUI"
```

## 📊 Monitoreo

- **Logs:** `gcloud logs tail --service=app-luz-sombra`
- **Métricas:** Google Cloud Console → Cloud Run
- **URL:** Se proporciona después del deploy

## 💰 Costos

- **Nivel gratuito:** 2M requests/mes
- **Después:** ~$0.40 por 1M requests
- **Memoria:** ~$0.0000024 por GB-segundo

## 🔧 Troubleshooting

### Error de autenticación
```bash
gcloud auth login
gcloud auth configure-docker
```

### Error de permisos
```bash
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="user:TU_EMAIL" \
  --role="roles/run.admin"
```

### Ver logs
```bash
gcloud logs read --service=app-luz-sombra --limit=50
```

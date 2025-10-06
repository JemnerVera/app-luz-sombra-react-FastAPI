# 🔒 Configuración de Seguridad - Agricola Luz-Sombra

## ⚠️ IMPORTANTE: Configuración de Variables de Entorno

**NUNCA** subas archivos con información sensible al repositorio. Usa variables de entorno.

### 🔑 Variables de Entorno Requeridas

#### Para Google Sheets:
```bash
# Credenciales de Google Sheets (en base64)
GOOGLE_SHEETS_CREDENTIALS_BASE64=tu_credencial_base64_aqui

# Token de Google Sheets (en base64)  
GOOGLE_SHEETS_TOKEN_BASE64=tu_token_base64_aqui
```

### 📋 Cómo generar las variables de entorno:

#### 1. Credenciales (credentials.json → base64):
```bash
# En Windows (PowerShell):
[Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes((Get-Content credentials.json -Raw)))

# En Linux/Mac:
base64 -i credentials.json
```

#### 2. Token (token.json → base64):
```bash
# En Windows (PowerShell):
[Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes((Get-Content token.json -Raw)))

# En Linux/Mac:
base64 -i token.json
```

### 🐳 Para Docker:

```bash
docker run -p 10000:10000 \
  -e GOOGLE_SHEETS_CREDENTIALS_BASE64="tu_credencial_base64" \
  -e GOOGLE_SHEETS_TOKEN_BASE64="tu_token_base64" \
  app-luz-sombra
```

### 🚀 Para Deploy en Producción:

Configura estas variables de entorno en tu plataforma de deploy (Render, Heroku, etc.)

### 📁 Archivos que NUNCA deben subirse:
- `token.json`
- `credentials.json`
- `*.key`
- `*.pem`
- `.env`

### ✅ Archivos seguros para subir:
- `google_sheets_config.json` (con placeholder)
- `Dockerfile`
- `requirements.txt`
- Código fuente


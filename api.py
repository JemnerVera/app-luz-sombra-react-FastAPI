from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Depends, Request
from fastapi.responses import JSONResponse, FileResponse, HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from typing import Optional
import json
import base64
import os
from datetime import datetime

from src.google_sheets.sheets_client import GoogleSheetsClient

# Función para cargar configuración desde variables de entorno o archivo
def load_google_sheets_config():
    """Carga la configuración de Google Sheets desde variables de entorno o archivo"""
    config = {}
    
    # Intentar cargar desde variables de entorno primero
    if os.getenv('GOOGLE_SHEETS_SPREADSHEET_ID'):
        config['spreadsheet_id'] = os.getenv('GOOGLE_SHEETS_SPREADSHEET_ID')
        config['sheet_name'] = os.getenv('GOOGLE_SHEETS_SHEET_NAME', 'Data-app')
        
        # Cargar credenciales desde Base64 si están disponibles
        if os.getenv('GOOGLE_SHEETS_CREDENTIALS_BASE64'):
            credentials_b64 = os.getenv('GOOGLE_SHEETS_CREDENTIALS_BASE64')
            credentials_json = base64.b64decode(credentials_b64).decode('utf-8')
            config['credentials'] = json.loads(credentials_json)
        
        # Cargar token desde Base64 si está disponible
        if os.getenv('GOOGLE_SHEETS_TOKEN_BASE64'):
            token_b64 = os.getenv('GOOGLE_SHEETS_TOKEN_BASE64')
            token_json = base64.b64decode(token_b64).decode('utf-8')
            config['token'] = json.loads(token_json)
            
        return config
    
    # Fallback: cargar desde archivo (para desarrollo local)
    try:
        with open('google_sheets_config.json', 'r') as f:
            file_config = json.load(f)
            config.update(file_config)
    except FileNotFoundError:
        print("⚠️ No se encontró google_sheets_config.json y no hay variables de entorno configuradas")
        config = {
            'spreadsheet_id': 'demo',
            'sheet_name': 'Data-app'
        }
    
    return config

# Crear la aplicación FastAPI
app = FastAPI(
    title="API Agrícola Luz-Sombra",
    description="API para procesar imágenes agrícolas y calcular porcentajes de luz y sombra",
    version="1.0.0"
)

# Configurar archivos estáticos para React
static_dir = "agricola-frontend/build"
if os.path.exists(static_dir):
    app.mount("/static", StaticFiles(directory=f"{static_dir}/static"), name="static")

# Ruta principal - servir la aplicación React
@app.get("/", response_class=HTMLResponse)
async def root():
    if os.path.exists(f"{static_dir}/index.html"):
        return FileResponse(f"{static_dir}/index.html")
    else:
        return HTMLResponse("""
        <html>
            <head><title>Agricola Luz-Sombra</title></head>
            <body>
                <h1>Agricola Luz-Sombra</h1>
                <p>Frontend no encontrado. Ejecuta 'npm run build' en la carpeta agricola-frontend</p>
                <p>API funcionando correctamente en <a href="/docs">/docs</a></p>
            </body>
        </html>
        """)

# Ruta de salud para Railway
@app.get("/health")
async def health():
    return {"message": "API Agrícola Luz-Sombra funcionando correctamente", "status": "healthy"}

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, especificar dominios específicos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inicializar cliente de Google Sheets
try:
    # Crear archivos temporales desde variables de entorno si están disponibles
    if os.getenv('GOOGLE_SHEETS_CREDENTIALS_BASE64'):
        credentials_b64 = os.getenv('GOOGLE_SHEETS_CREDENTIALS_BASE64')
        # Agregar padding si es necesario
        missing_padding = len(credentials_b64) % 4
        if missing_padding:
            credentials_b64 += '=' * (4 - missing_padding)
        credentials_json = base64.b64decode(credentials_b64).decode('utf-8')
        with open('credentials.json', 'w') as f:
            f.write(credentials_json)
        print("✅ Credenciales cargadas desde variable de entorno")
    
    if os.getenv('GOOGLE_SHEETS_TOKEN_BASE64'):
        token_b64 = os.getenv('GOOGLE_SHEETS_TOKEN_BASE64')
        # Agregar padding si es necesario
        missing_padding = len(token_b64) % 4
        if missing_padding:
            token_b64 += '=' * (4 - missing_padding)
        token_json = base64.b64decode(token_b64).decode('utf-8')
        with open('token.json', 'w') as f:
            f.write(token_json)
        print("✅ Token cargado desde variable de entorno")
    
    sheets_client = GoogleSheetsClient()
    print("✅ Google Sheets client inicializado")
except Exception as e:
    print(f"⚠️ Error inicializando Google Sheets client: {e}")
    sheets_client = None

# Montar directorio de resultados para servir imágenes procesadas
if os.path.exists("resultados"):
    app.mount("/resultados", StaticFiles(directory="resultados"), name="resultados")

# Endpoints de Google Sheets
@app.get("/api/google-sheets/field-data")
async def get_field_data():
    """Obtiene datos de campo desde Google Sheets"""
    try:
        if not sheets_client:
            raise HTTPException(status_code=500, detail="Google Sheets no configurado")
        
        data = sheets_client.get_field_data()
        return data
    except Exception as e:
        print(f"❌ Error obteniendo datos de campo: {e}")
        raise HTTPException(status_code=500, detail=f"Error obteniendo datos de campo: {str(e)}")

@app.get("/api/historial")
async def get_historial():
    """Obtiene historial de procesamientos desde Google Sheets"""
    try:
        if not sheets_client:
            raise HTTPException(status_code=500, detail="Google Sheets no configurado")
        
        data = sheets_client.get_historial()
        return data
    except Exception as e:
        print(f"❌ Error obteniendo historial: {e}")
        raise HTTPException(status_code=500, detail=f"Error obteniendo historial: {str(e)}")

@app.post("/api/google-sheets/update-headers")
async def update_headers():
    """Actualiza los headers de Google Sheets"""
    try:
        if not sheets_client:
            raise HTTPException(status_code=500, detail="Google Sheets no configurado")
        
        sheets_client.update_headers()
        return {"message": "Headers actualizados correctamente"}
    except Exception as e:
        print(f"❌ Error actualizando headers: {e}")
        raise HTTPException(status_code=500, detail=f"Error actualizando headers: {str(e)}")

# Servir archivos estáticos de React (CSS, JS, imágenes) - DEBE IR AL FINAL
@app.get("/{path:path}")
async def serve_react_app(path: str):
    if os.path.exists(f"{static_dir}/{path}"):
        return FileResponse(f"{static_dir}/{path}")
    elif os.path.exists(f"{static_dir}/index.html"):
        # Para rutas de React Router, servir index.html
        return FileResponse(f"{static_dir}/index.html")
    else:
        raise HTTPException(status_code=404, detail="Archivo no encontrado")

if __name__ == "__main__":
    import uvicorn
    # Obtener puerto de variable de entorno (Railway usa PORT=8080)
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    print(f"🚀 Starting server on {host}:{port}")
    uvicorn.run(app, host=host, port=port)

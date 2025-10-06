from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Depends, Request
from fastapi.responses import JSONResponse, FileResponse, HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
# from sqlalchemy.orm import Session  # Deshabilitado - usando solo Google Sheets
from typing import Optional
import json
import base64
import os
from datetime import datetime

# from src.database.models import ProcesamientoImagen, create_database, get_database_url  # Deshabilitado - usando solo Google Sheets
# from src.database.database import get_db  # Deshabilitado - usando solo Google Sheets
from src.services.procesamiento_service_v2 import ProcesamientoServiceV2
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

# Inicializar base de datos
# create_database()  # Deshabilitado - usando solo Google Sheets

# Inicializar servicio de procesamiento con modelo optimizado
procesamiento_service = ProcesamientoServiceV2()

# Inicializar cliente de Google Sheets
try:
    # Crear archivos temporales desde variables de entorno si están disponibles
    if os.getenv('GOOGLE_SHEETS_CREDENTIALS_BASE64'):
        credentials_b64 = os.getenv('GOOGLE_SHEETS_CREDENTIALS_BASE64')
        credentials_json = base64.b64decode(credentials_b64).decode('utf-8')
        with open('credentials.json', 'w') as f:
            f.write(credentials_json)
        print("✅ Credenciales cargadas desde variable de entorno")
    
    if os.getenv('GOOGLE_SHEETS_TOKEN_BASE64'):
        token_b64 = os.getenv('GOOGLE_SHEETS_TOKEN_BASE64')
        token_json = base64.b64decode(token_b64).decode('utf-8')
        with open('token.json', 'w') as f:
            f.write(token_json)
        print("✅ Token cargado desde variable de entorno")
    
    sheets_client = GoogleSheetsClient()
    print("✅ Google Sheets client inicializado")
except Exception as e:
    print(f"⚠️ Error inicializando Google Sheets client: {e}")
    sheets_client = None

async def get_next_sequential_id() -> str:
    """
    Obtiene el siguiente ID secuencial basado en los registros existentes en Google Sheets
    """
    try:
        # Cargar configuración
        config = load_google_sheets_config()
        spreadsheet_id = config.get('spreadsheet_id')
        sheet_name = config.get('sheet_name', 'Data-app')
        
        if not spreadsheet_id:
            return "1"  # Si no hay configuración, empezar con 1
        
        # Autenticar con Google Sheets
        if not sheets_client or not sheets_client.authenticate():
            return "1"  # Si no se puede autenticar, empezar con 1
        
        # Obtener registros existentes
        records = sheets_client.get_processing_records(spreadsheet_id, limit=1000, sheet_name=sheet_name)
        
        if not records:
            return "1"  # Si no hay registros, empezar con 1
        
        # Encontrar el ID más alto
        max_id = 0
        for record in records:
            try:
                # Extraer número del ID (formato: "IMG_1234567890_123" o solo "123")
                record_id = record.get('id', '')
                if record_id.startswith('IMG_'):
                    # Extraer número del timestamp
                    parts = record_id.split('_')
                    if len(parts) >= 2:
                        timestamp = int(parts[1])
                        max_id = max(max_id, timestamp)
                else:
                    # Si es un número simple
                    numeric_id = int(record_id)
                    max_id = max(max_id, numeric_id)
            except (ValueError, IndexError):
                continue
        
        # Retornar el siguiente ID secuencial
        next_id = str(max_id + 1)
        print(f"🆔 ID secuencial generado: {next_id}")
        return next_id
        
    except Exception as e:
        print(f"❌ Error generando ID secuencial: {e}")
        return "1"  # Fallback a 1


# Montar archivos estáticos
# app.mount("/static", StaticFiles(directory="static"), name="static")  # No necesario en versión React
app.mount("/resultados", StaticFiles(directory="resultados"), name="resultados")


def guardar_en_google_sheets_directo(record_data):
    """
    Guarda un registro directamente en Google Sheets
    
    Args:
        record_data: Diccionario con los datos del procesamiento
        
    Returns:
        bool: True si se guardó correctamente
    """
    try:
        # Cargar configuración
        config = load_google_sheets_config()
        spreadsheet_id = config.get('spreadsheet_id')
        
        if not spreadsheet_id:
            print("⚠️  No se encontró Spreadsheet ID en la configuración")
            return False
        
        # Autenticar con Google Sheets
        if not sheets_client or not sheets_client.authenticate():
            print("❌ Error autenticando con Google Sheets")
            return False
        
        # Obtener nombre de la hoja desde la configuración
        sheet_name = config.get('sheet_name', 'Procesamientos')
        
        # Agregar registro a Google Sheets
        if sheets_client.add_processing_record(spreadsheet_id, record_data, sheet_name):
            print(f"✅ Registro {record_data.get('id', 'N/A')} guardado en Google Sheets")
            return True
        else:
            print(f"❌ Error guardando registro {record_data.get('id', 'N/A')} en Google Sheets")
            return False
            
    except Exception as e:
        print(f"❌ Error en Google Sheets: {e}")
        return False

def guardar_en_google_sheets(registro_db, metadata=None):
    """
    Guarda un registro de procesamiento en Google Sheets
    
    Args:
        registro_db: Objeto ProcesamientoImagen de la base de datos
        metadata: Diccionario con metadatos adicionales (opcional)
    """
    try:
        # Cargar configuración
        config = load_google_sheets_config()
        spreadsheet_id = config.get('spreadsheet_id')
        
        if not spreadsheet_id:
            print("⚠️  No se encontró Spreadsheet ID en la configuración")
            return False
        
        # Autenticar con Google Sheets
        if not sheets_client or not sheets_client.authenticate():
            print("❌ Error autenticando con Google Sheets")
            return False
        
        # Preparar datos del registro
        record_data = {
            'id': str(registro_db.id),
            'fecha': registro_db.fecha_tomada.strftime("%Y-%m-%d") if registro_db.fecha_tomada else datetime.now().strftime("%Y-%m-%d"),
            'hora': registro_db.fecha_tomada.strftime("%H:%M:%S") if registro_db.fecha_tomada else datetime.now().strftime("%H:%M:%S"),
            'imagen': registro_db.nombre_imagen or '',
            'fundo': registro_db.fundo or '',
            'sector': registro_db.sector or '',
            'hilera': registro_db.hilera or '',
            'latitud': str(registro_db.latitud) if registro_db.latitud else '',
            'longitud': str(registro_db.longitud) if registro_db.longitud else '',
            'porcentaje_luz': round(registro_db.porcentaje_luz, 2),
            'porcentaje_sombra': round(registro_db.porcentaje_sombra, 2),
            'dispositivo': metadata.get('dispositivo', '') if metadata else '',
            'software': metadata.get('software', '') if metadata else '',
            'direccion': metadata.get('direccion', '') if metadata else '',
            'timestamp': registro_db.timestamp.isoformat()
        }
        
        # Obtener nombre de la hoja desde la configuración
        sheet_name = config.get('sheet_name', 'Procesamientos')
        
        # Agregar registro a Google Sheets
        if sheets_client.add_processing_record(spreadsheet_id, record_data, sheet_name):
            print(f"✅ Registro {registro_db.id} guardado en Google Sheets")
            return True
        else:
            print(f"❌ Error guardando registro {registro_db.id} en Google Sheets")
            return False
            
    except Exception as e:
        print(f"❌ Error en Google Sheets: {e}")
        return False


@app.get("/api/health")
async def health_check():
    """
    Endpoint de salud de la API
    """
    return {"status": "healthy", "timestamp": datetime.now()}

@app.get("/api/historial")
async def obtener_historial():
    """
    Obtiene el historial de procesamientos guardados en Google Sheets
    """
    try:
        # Cargar configuración de Google Sheets
        config = load_google_sheets_config()
        spreadsheet_id = config.get('spreadsheet_id')
        
        if not spreadsheet_id:
            raise HTTPException(status_code=500, detail="No se encontró Spreadsheet ID")
        
        # Autenticar con Google Sheets
        if not sheets_client.authenticate():
            raise HTTPException(status_code=500, detail="Error autenticando con Google Sheets")
        
        # Obtener nombre de la hoja desde la configuración
        sheet_name = config.get('sheet_name', 'Procesamientos')
        
        # Obtener registros de Google Sheets
        records = sheets_client.get_processing_records(spreadsheet_id, limit=100, sheet_name=sheet_name)
        
        historial = []
        for index, record in enumerate(records):
            # Convertir los datos de Google Sheets al formato esperado por el frontend
            try:
                # Manejar IDs que no son números
                record_id = record.get('id', '')
                if not record_id or not str(record_id).replace('_', '').replace('-', '').isdigit():
                    # Si no es un ID válido, usar el índice + 1
                    record_id = index + 1
                else:
                    # Mantener el ID original como string para evitar duplicados
                    record_id = str(record_id)
                
                historial.append({
                    "id": record_id,
                    "empresa": record.get('empresa', ''),
                    "fundo": record.get('fundo', ''),
                    "sector": record.get('sector', ''),
                    "lote": record.get('lote', ''),
                    "hilera": record.get('hilera', ''),
                    "numero_planta": record.get('numero_planta', ''),
                    "porcentaje_luz": float(record.get('porcentaje_luz', 0)) if record.get('porcentaje_luz') else 0,
                    "porcentaje_sombra": float(record.get('porcentaje_sombra', 0)) if record.get('porcentaje_sombra') else 0,
                    "fecha_tomada": record.get('fecha', ''),
                    "latitud": float(record.get('latitud', 0)) if record.get('latitud') else None,
                    "longitud": float(record.get('longitud', 0)) if record.get('longitud') else None,
                    "timestamp": record.get('timestamp', ''),
                    "imagen": record.get('imagen', ''),
                    "dispositivo": record.get('dispositivo', ''),
                    "direccion": record.get('direccion', '')
                })
            except (ValueError, TypeError) as e:
                print(f"Error procesando registro: {e}")
                continue
        
        return {
            "success": True,
            "total_procesamientos": len(historial),
            "procesamientos": historial
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error obteniendo historial: {str(e)}")

@app.get("/api/estadisticas")
async def obtener_estadisticas():
    """
    Obtiene estadísticas generales de los procesamientos desde Google Sheets
    """
    try:
        # Cargar configuración de Google Sheets
        config = load_google_sheets_config()
        spreadsheet_id = config.get('spreadsheet_id')
        
        if not spreadsheet_id:
            raise HTTPException(status_code=500, detail="No se encontró Spreadsheet ID")
        
        # Autenticar con Google Sheets
        if not sheets_client.authenticate():
            raise HTTPException(status_code=500, detail="Error autenticando con Google Sheets")
        
        # Obtener nombre de la hoja desde la configuración
        sheet_name = config.get('sheet_name', 'Procesamientos')
        
        # Obtener registros de Google Sheets
        records = sheets_client.get_processing_records(spreadsheet_id, limit=1000, sheet_name=sheet_name)
        
        if not records:
            return {
                "success": True,
                "total_procesamientos": 0,
                "promedio_luz": 0,
                "promedio_sombra": 0,
                "mensaje": "No hay procesamientos registrados"
            }
        
        # Calcular estadísticas
        total_procesamientos = len(records)
        porcentajes_luz = []
        porcentajes_sombra = []
        
        for record in records:
            try:
                luz = float(record.get('porcentaje_luz', 0)) if record.get('porcentaje_luz') else 0
                sombra = float(record.get('porcentaje_sombra', 0)) if record.get('porcentaje_sombra') else 0
                porcentajes_luz.append(luz)
                porcentajes_sombra.append(sombra)
            except (ValueError, TypeError):
                continue
        
        promedio_luz = sum(porcentajes_luz) / len(porcentajes_luz) if porcentajes_luz else 0
        promedio_sombra = sum(porcentajes_sombra) / len(porcentajes_sombra) if porcentajes_sombra else 0
        
        return {
            "success": True,
            "total_procesamientos": total_procesamientos,
            "promedio_luz": round(promedio_luz, 2),
            "promedio_sombra": round(promedio_sombra, 2),
            "ultimo_procesamiento": records[-1].get('timestamp', '') if records else None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error obteniendo estadísticas: {str(e)}")

@app.post("/api/procesar-imagen-simple")
async def procesar_imagen_simple(
    imagen: UploadFile = File(..., description="Imagen agrícola (JPG, PNG)"),
    empresa: str = Form(..., description="Empresa"),
    fundo: str = Form(..., description="Fundo al que pertenece la imagen"),
    sector: Optional[str] = Form(None, description="Sector del fundo"),
    lote: Optional[str] = Form(None, description="Lote del fundo"),
    hilera: Optional[str] = Form(None, description="Hilera del fundo"),
    numero_planta: Optional[str] = Form(None, description="Número de planta"),
    latitud: Optional[float] = Form(None, description="Latitud de la ubicación"),
    longitud: Optional[float] = Form(None, description="Longitud de la ubicación")
):
    """
    Procesa una imagen de forma simplificada - Solo análisis y guardado en Google Sheets
    """
    try:
        print(f"📸 Procesando imagen: {imagen.filename}")
        print(f"📍 Ubicación: Empresa={empresa}, Fundo={fundo}, Sector={sector}, Lote={lote}, Hilera={hilera}, N° Planta={numero_planta}")
        print(f"🔍 Datos recibidos - Empresa: '{empresa}', Fundo: '{fundo}', Sector: '{sector}', Lote: '{lote}', Hilera: '{hilera}', N° Planta: '{numero_planta}'")
        
        # Validar archivo
        if not imagen.filename.lower().endswith(('.jpg', '.jpeg', '.png')):
            raise HTTPException(status_code=400, detail="La imagen debe ser JPG o PNG")
        
        # Leer imagen
        imagen_bytes = await imagen.read()
        
        # Análisis simple de la imagen
        import cv2
        import numpy as np
        
        # Decodificar imagen
        nparr = np.frombuffer(imagen_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            raise HTTPException(status_code=400, detail="No se pudo leer la imagen")
        
        print(f"📏 Dimensiones de la imagen: {img.shape}")
        
        # Análisis simple basado en luminancia
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Crear máscara de luz/sombra basada en luminancia
        light_mask = gray > 128  # Píxeles claros
        shadow_mask = gray <= 128  # Píxeles oscuros
        
        # Calcular porcentajes
        total_pixels = img.shape[0] * img.shape[1]
        light_pixels = np.sum(light_mask)
        shadow_pixels = np.sum(shadow_mask)
        
        light_percentage = (light_pixels / total_pixels) * 100
        shadow_percentage = (shadow_pixels / total_pixels) * 100
        
        print(f"✅ Análisis completado - Luz: {light_percentage:.1f}%, Sombra: {shadow_percentage:.1f}%")
        
        # Extraer metadatos
        metadata = None
        fecha_tomada = None
        exif_latitud = None
        exif_longitud = None
        
        try:
            from src.metadata.gps_extractor import GPSMetadataExtractor
            
            extractor = GPSMetadataExtractor()
            metadata = extractor.extract_metadata(imagen_bytes, imagen.filename)
            
            # Limpiar metadatos de caracteres nulos
            if metadata:
                for key, value in metadata.items():
                    if isinstance(value, str):
                        metadata[key] = value.replace('\x00', '').strip()
                    elif isinstance(value, dict):
                        for sub_key, sub_value in value.items():
                            if isinstance(sub_value, str):
                                metadata[key][sub_key] = sub_value.replace('\x00', '').strip()
            
            # Extraer fecha
            fecha_tomada = metadata['fecha_tomada']
            if not fecha_tomada:
                fecha_tomada = datetime.now()
                print(f"📅 Usando fecha actual: {fecha_tomada}")
            else:
                print(f"✅ Fecha EXIF extraída: {fecha_tomada}")
            
            # Extraer coordenadas GPS
            exif_latitud = metadata['gps_latitud']
            exif_longitud = metadata['gps_longitud']
            
            if exif_latitud and exif_longitud:
                print(f"✅ Coordenadas GPS extraídas: {exif_latitud}, {exif_longitud}")
            else:
                print("📍 No se pudieron extraer coordenadas GPS del EXIF")
            
        except Exception as e:
            print(f"Error extrayendo metadatos: {e}")
            fecha_tomada = datetime.now()
            exif_latitud = None
            exif_longitud = None
        
        # Usar coordenadas EXIF si están disponibles, sino usar las del formulario
        latitud_final = exif_latitud if exif_latitud is not None else latitud
        longitud_final = exif_longitud if exif_longitud is not None else longitud
        
        print(f"📍 Coordenadas finales - Latitud: {latitud_final}, Longitud: {longitud_final}")
        
        # Generar ID secuencial para el registro
        registro_id = await get_next_sequential_id()
        
        # Guardar en Google Sheets
        try:
            # Preparar datos del registro
            record_data = {
                'id': registro_id,
                'fecha': fecha_tomada.strftime("%Y-%m-%d") if fecha_tomada else datetime.now().strftime("%Y-%m-%d"),
                'hora': fecha_tomada.strftime("%H:%M:%S") if fecha_tomada else datetime.now().strftime("%H:%M:%S"),
                'imagen': imagen.filename or '',
                'nombre_archivo': imagen.filename or '',  # Nueva columna: Nombre Archivo
                'empresa': empresa or '',
                'fundo': fundo or '',
                'sector': sector or '',
                'lote': lote or '',
                'hilera': hilera if hilera is not None else '',  # Hilera puede ser null
                'numero_planta': numero_planta if numero_planta is not None else '',
                'latitud': str(latitud_final) if latitud_final else '',
                'longitud': str(longitud_final) if longitud_final else '',
                'porcentaje_luz': round(light_percentage, 2),
                'porcentaje_sombra': round(shadow_percentage, 2),
                'dispositivo': str(metadata.get('dispositivo', '')) if metadata else '',
                'software': str(metadata.get('software', '')) if metadata else '',
                'direccion': str(metadata.get('direccion', '')) if metadata else '',
                'timestamp': datetime.now().isoformat()
            }
            
            print(f"📊 Datos a guardar en Google Sheets: {record_data}")
            
            # Guardar en Google Sheets
            if guardar_en_google_sheets_directo(record_data):
                print(f"✅ Registro {registro_id} guardado en Google Sheets")
            else:
                print(f"❌ Error guardando en Google Sheets")
        except Exception as e:
            print(f"Error guardando en Google Sheets: {e}")
        
        return {
            "success": True,
            "porcentaje_luz": light_percentage,
            "porcentaje_sombra": shadow_percentage,
            "fundo": fundo,
            "sector": sector or "",
            "hilera": hilera or "",
            "latitud": latitud_final,
            "longitud": longitud_final,
            "fecha_tomada": fecha_tomada.isoformat() if fecha_tomada else None,
            "mensaje": "Imagen procesada exitosamente"
        }
        
    except Exception as e:
        print(f"❌ Error general: {e}")
        raise HTTPException(status_code=500, detail=f"Error procesando imagen: {str(e)}")

@app.post("/api/test-model")
async def test_model(
    imagen: UploadFile = File(..., description="Imagen agrícola para probar el modelo"),
    empresa: str = Form("TEST", description="Empresa (modo prueba)"),
    fundo: str = Form("TEST", description="Fundo (modo prueba)"),
    sector: str = Form("TEST", description="Sector (modo prueba)"),
    lote: str = Form("TEST", description="Lote (modo prueba)"),
    hilera: str = Form("TEST", description="Hilera (modo prueba)"),
    numero_planta: str = Form("TEST", description="Número de planta (modo prueba)"),
    latitud: Optional[float] = Form(None, description="Latitud"),
    longitud: Optional[float] = Form(None, description="Longitud")
):
    """
    Endpoint para probar el modelo sin guardar en Google Sheets
    """
    try:
        print(f"🧪 Modo prueba - Procesando imagen: {imagen.filename}")
        
        # Validar archivo
        if not imagen or not imagen.filename:
            raise HTTPException(status_code=400, detail="No se proporcionó una imagen válida")
        
        # Leer imagen
        imagen_bytes = await imagen.read()
        
        # Procesar imagen con el modelo
        from src.services.procesamiento_service_v2 import ProcesamientoServiceV2
        import cv2
        import numpy as np
        
        service = ProcesamientoServiceV2()
        
        # Convertir bytes a imagen
        nparr = np.frombuffer(imagen_bytes, np.uint8)
        imagen_array = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if imagen_array is None:
            raise HTTPException(status_code=400, detail="No se pudo decodificar la imagen")
        
        # Analizar imagen
        light_percentage, shadow_percentage, processed_image = service.procesar_imagen_visual(imagen_array)
        
        # Generar nombre de archivo para la imagen procesada
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        original_name = imagen.filename.split('.')[0]
        processed_filename = f"{original_name}_{timestamp}_procesada.jpg"
        
        # Guardar imagen procesada en la carpeta resultados
        import os
        resultados_dir = "resultados"
        if not os.path.exists(resultados_dir):
            os.makedirs(resultados_dir)
        
        processed_path = os.path.join(resultados_dir, processed_filename)
        
        # Guardar imagen procesada
        cv2.imwrite(processed_path, processed_image)
        print(f"💾 Imagen procesada guardada: {processed_path}")
        
        return {
            "success": True,
            "porcentaje_luz": round(light_percentage, 2),
            "porcentaje_sombra": round(shadow_percentage, 2),
            "image_name": processed_filename,
            "fundo": fundo,
            "sector": sector or "",
            "hilera": hilera or "",
            "mensaje": "Imagen procesada exitosamente en modo prueba"
        }
        
    except Exception as e:
        print(f"❌ Error en test-model: {e}")
        raise HTTPException(status_code=500, detail=f"Error procesando imagen: {str(e)}")

@app.post("/api/procesar-imagen")
async def procesar_imagen(
    imagen: UploadFile = File(..., description="Imagen agrícola (JPG, PNG)"),
    anotaciones: UploadFile = File(..., description="Archivo JSON con anotaciones LabelMe"),
    fundo: str = Form(..., description="Fundo al que pertenece la imagen"),
    modelo_path: str = Form(default="modelo_perfeccionado.pkl", description="Ruta del modelo ML a usar"),
    umbral_sombra: float = Form(default=0.4, description="Umbral para activar alerta de sombra"),
):
    """
    Procesa una imagen agrícola con sus anotaciones LabelMe
    
    - **imagen**: Archivo de imagen (JPG, PNG)
    - **anotaciones**: Archivo JSON con anotaciones de LabelMe
    - **fundo**: Fundo al que pertenece la imagen
    - **modelo_path**: Ruta del modelo de ML (opcional)
    - **umbral_sombra**: Umbral para alerta de sombra (opcional)
    """
    try:
        # Validar archivos
        if not imagen.filename.lower().endswith(('.jpg', '.jpeg', '.png')):
            raise HTTPException(status_code=400, detail="La imagen debe ser JPG o PNG")
        
        if not anotaciones.filename.lower().endswith('.json'):
            raise HTTPException(status_code=400, detail="Las anotaciones deben ser un archivo JSON")
        
        # Leer contenido de archivos
        imagen_bytes = await imagen.read()
        anotaciones_content = await anotaciones.read()
        
        # Validar JSON
        try:
            anotaciones_json = anotaciones_content.decode('utf-8')
            json.loads(anotaciones_json)  # Validar que sea JSON válido
        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="El archivo JSON de anotaciones no es válido")
        
        # Procesar imagen
        resultado = procesamiento_service.procesar_imagen_bytes(
            imagen_bytes=imagen_bytes,
            anotaciones_json=anotaciones_json,
            lugar=fundo,  # Usar fundo en lugar de lugar
            nombre_imagen=imagen.filename,
            nombre_json=anotaciones.filename
        )
        
        # Guardar en Google Sheets
        try:
            record_data = {
                'id': f"PROC_{int(time.time())}",
                'fecha': resultado["timestamp"].strftime("%Y-%m-%d"),
                'hora': resultado["timestamp"].strftime("%H:%M:%S"),
                'imagen': resultado["nombre_imagen"],
                'fundo': fundo,
                'sector': '',
                'hilera': '',
                'latitud': '',
                'longitud': '',
                'porcentaje_luz': round(resultado["porcentaje_luz"], 2),
                'porcentaje_sombra': round(resultado["porcentaje_sombra"], 2),
                'dispositivo': '',
                'software': '',
                'direccion': '',
                'timestamp': resultado["timestamp"].isoformat()
            }
            
            if guardar_en_google_sheets_directo(record_data):
                print(f"✅ Registro guardado en Google Sheets")
            else:
                print(f"❌ Error guardando en Google Sheets")
        except Exception as e:
            print(f"Error guardando en Google Sheets: {e}")
        
        # Preparar respuesta
        respuesta = {
            "id": f"PROC_{int(time.time())}",
            "fundo": fundo,
            "timestamp": resultado["timestamp"].isoformat(),
            "porcentaje_luz": resultado["porcentaje_luz"],
            "porcentaje_sombra": resultado["porcentaje_sombra"],
            "alerta_activada": resultado["alerta_activada"],
            "estadisticas_detalladas": resultado["estadisticas_detalladas"],
            "imagen_resultado_url": f"/static/{os.path.basename(resultado['ruta_imagen_resultado'])}",
            "mensaje": "Imagen procesada exitosamente"
        }
        
        return JSONResponse(content=respuesta, status_code=200)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error procesando imagen: {str(e)}")

# Función de historial duplicada - usar la que está arriba

@app.get("/api/imagen-resultado/{procesamiento_id}")
async def obtener_imagen_resultado(procesamiento_id: int):
    """
    Obtiene la imagen resultado de un procesamiento específico
    Nota: Esta funcionalidad requiere implementación con Google Sheets
    """
    raise HTTPException(status_code=501, detail="Funcionalidad no implementada - usar solo Google Sheets")

# Función de estadísticas duplicada - usar la que está arriba



@app.get("/api/google-sheets/status")
async def google_sheets_status():
    """
    Verifica el estado de la conexión con Google Sheets
    """
    try:
        if sheets_client.authenticate():
            return {
                "success": True,
                "status": "connected",
                "message": "Google Sheets conectado correctamente"
            }
        else:
            return {
                "success": False,
                "status": "disconnected",
                "message": "Error conectando con Google Sheets"
            }
    except Exception as e:
        return {
            "success": False,
            "status": "error",
            "message": f"Error: {str(e)}"
        }

@app.get("/api/google-sheets/records")
async def google_sheets_records(limit: int = 10):
    """
    Obtiene registros de Google Sheets
    
    - **limit**: Número máximo de registros a obtener (default: 10)
    """
    try:
        config = load_google_sheets_config()
        spreadsheet_id = config.get('spreadsheet_id')
        
        if not spreadsheet_id:
            raise HTTPException(status_code=400, detail="No se encontró Spreadsheet ID")
        
        if not sheets_client.authenticate():
            raise HTTPException(status_code=500, detail="Error autenticando con Google Sheets")
        
        # Obtener nombre de la hoja desde la configuración
        sheet_name = config.get('sheet_name', 'Procesamientos')
        
        records = sheets_client.get_processing_records(spreadsheet_id, limit, sheet_name)
        
        return {
            "success": True,
            "total_records": len(records),
            "records": records
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error obteniendo registros: {str(e)}")

@app.get("/api/google-sheets/url")
async def google_sheets_url():
    """
    Obtiene la URL de la hoja de cálculo de Google Sheets
    """
    try:
        config = load_google_sheets_config()
        spreadsheet_id = config.get('spreadsheet_id')
        
        if not spreadsheet_id:
            raise HTTPException(status_code=400, detail="No se encontró Spreadsheet ID")
        
        url = sheets_client.get_spreadsheet_url(spreadsheet_id)
        
        return {
            "success": True,
            "url": url,
            "spreadsheet_id": spreadsheet_id
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error obteniendo URL: {str(e)}")

@app.post("/api/check-gps-info")
async def check_gps_info(file: UploadFile = File(...)):
    """
    Verifica si una imagen tiene información GPS en los metadatos EXIF
    """
    try:
        # Leer el contenido del archivo
        image_bytes = await file.read()
        
        # Usar el extractor de GPS para verificar si hay datos GPS
        from src.metadata.gps_extractor import GPSExtractor
        gps_extractor = GPSExtractor()
        
        # Extraer datos GPS
        gps_data = gps_extractor._extract_gps_data(image_bytes)
        
        # Verificar si hay información GPS válida
        has_gps = (
            gps_data.get('latitud') is not None and 
            gps_data.get('longitud') is not None and
            gps_data.get('latitud') != 0 and 
            gps_data.get('longitud') != 0
        )
        
        return {
            "has_gps": has_gps,
            "gps_data": gps_data if has_gps else None,
            "message": "GPS encontrado" if has_gps else "No se encontró información GPS"
        }
        
    except Exception as e:
        print(f"❌ Error verificando GPS: {e}")
        return {
            "has_gps": False,
            "gps_data": None,
            "message": f"Error verificando GPS: {str(e)}"
        }

@app.get("/api/google-sheets/field-data")
async def get_field_data():
    """
    Obtiene los datos de la hoja 'Data-campo' para los dropdowns con relaciones jerárquicas
    """
    try:
        with open('google_sheets_config.json', 'r') as f:
            config = json.load(f)
        
        # Autenticar con Google Sheets
        if not sheets_client.authenticate():
            raise HTTPException(status_code=500, detail="Error autenticando con Google Sheets")
        
        # Obtener datos de la hoja 'Data-campo'
        spreadsheet_id = config.get('spreadsheet_id')
        if not spreadsheet_id:
            raise HTTPException(status_code=500, detail="ID de spreadsheet no configurado")
        
        # Leer todos los datos de la hoja 'Data-campo' (columnas B, D, G, I)
        range_name = 'Data-campo!B:I'  # Empresa, Fundo, Sector, Lote
        all_data = sheets_client.service.spreadsheets().values().get(
            spreadsheetId=spreadsheet_id, range=range_name
        ).execute()
        
        if 'values' not in all_data or len(all_data['values']) <= 1:
            return {
                "empresa": [],
                "fundo": [],
                "sector": [],
                "lote": [],
                "hierarchical": {}
            }
        
        # Procesar datos (eliminar primera fila que contiene títulos)
        rows = all_data['values'][1:]  # Saltar encabezados
        
        # Crear estructuras jerárquicas
        empresas = set()
        empresa_fundos = {}  # {empresa: [fundos]}
        fundo_sectores = {}  # {fundo: [sectores]}
        sector_lotes = {}    # {sector: [lotes]}
        
        for row in rows:
            if len(row) >= 4:  # Asegurar que tenemos al menos 4 columnas
                empresa = row[0].strip() if len(row) > 0 and row[0] else ''
                fundo = row[2].strip() if len(row) > 2 and row[2] else ''  # Columna D (índice 2)
                sector = row[5].strip() if len(row) > 5 and row[5] else ''  # Columna G (índice 5)
                lote = row[7].strip() if len(row) > 7 and row[7] else ''    # Columna I (índice 7)
                
                if empresa:
                    empresas.add(empresa)
                    
                    if empresa not in empresa_fundos:
                        empresa_fundos[empresa] = set()
                    if fundo:
                        empresa_fundos[empresa].add(fundo)
                        
                        if fundo not in fundo_sectores:
                            fundo_sectores[fundo] = set()
                        if sector:
                            fundo_sectores[fundo].add(sector)
                            
                            if sector not in sector_lotes:
                                sector_lotes[sector] = set()
                            if lote:
                                sector_lotes[sector].add(lote)
        
        # Convertir sets a listas ordenadas
        empresas_list = sorted(list(empresas))
        
        # Crear estructura jerárquica completa
        hierarchical = {}
        for empresa in empresas_list:
            hierarchical[empresa] = {}
            for fundo in sorted(list(empresa_fundos.get(empresa, set()))):
                hierarchical[empresa][fundo] = {}
                for sector in sorted(list(fundo_sectores.get(fundo, set()))):
                    hierarchical[empresa][fundo][sector] = sorted(list(sector_lotes.get(sector, set())))
        
        return {
            "empresa": empresas_list,
            "fundo": sorted(list(set().union(*empresa_fundos.values()))),
            "sector": sorted(list(set().union(*fundo_sectores.values()))),
            "lote": sorted(list(set().union(*sector_lotes.values()))),
            "hierarchical": hierarchical
        }
        
    except Exception as e:
        print(f"❌ Error obteniendo datos de campo: {e}")
        raise HTTPException(status_code=500, detail=f"Error obteniendo datos de campo: {str(e)}")

@app.post("/api/google-sheets/update-headers")
async def update_headers():
    """
    Fuerza la actualización de los encabezados de la hoja Data-app
    """
    try:
        config = load_google_sheets_config()
        spreadsheet_id = config.get('spreadsheet_id')
        sheet_name = config.get('sheet_name', 'Data-app')
        
        if not spreadsheet_id:
            raise HTTPException(status_code=400, detail="No se encontró Spreadsheet ID")
        
        # Autenticar con Google Sheets
        if not sheets_client.authenticate():
            raise HTTPException(status_code=500, detail="Error autenticando con Google Sheets")
        
        # Forzar actualización de encabezados
        if sheets_client.force_update_headers(spreadsheet_id, sheet_name):
            return {
                "success": True,
                "message": f"Encabezados actualizados correctamente en la hoja '{sheet_name}'"
            }
        else:
            raise HTTPException(status_code=500, detail="Error actualizando encabezados")
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error actualizando encabezados: {str(e)}")


@app.post("/api/procesar-imagen-visual")
async def procesar_imagen_visual(
    imagen: UploadFile = File(...),
    empresa: str = Form(""),
    fundo: str = Form("Test Modelo"),
    sector: str = Form(""),
    lote: str = Form("")
):
    """
    Procesa una imagen y devuelve la imagen con superposición visual de luz y sombra
    """
    try:
        print(f"📸 Procesando imagen visual: {imagen.filename}")
        print(f"📍 Ubicación: Empresa={empresa}, Fundo={fundo}, Sector={sector}, Lote={lote}")
        print(f"🔍 Tipo de imagen: {imagen.content_type}")
        print(f"🔍 Tamaño de imagen: {imagen.size}")
        
        # Leer la imagen
        image_data = await imagen.read()
        import cv2
        import numpy as np
        from io import BytesIO
        import base64
        
        # Convertir bytes a imagen OpenCV
        nparr = np.frombuffer(image_data, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            raise HTTPException(status_code=400, detail="No se pudo procesar la imagen")
        
        print(f"📏 Dimensiones de la imagen: {img.shape}")
        
        # Procesar con el modelo
        procesamiento_service = ProcesamientoServiceV2()
        light_percentage, shadow_percentage, light_mask = procesamiento_service.procesar_imagen_visual(img)
        
        print(f"✅ Análisis completado - Luz: {light_percentage:.1f}%, Sombra: {shadow_percentage:.1f}%")
        
        # Crear imagen de análisis como las de la carpeta "resultados"
        height, width = img.shape[:2]
        result_img = np.zeros((height, width, 3), dtype=np.uint8)
        
        # Crear máscaras como en el código original
        mask_luz_2d = light_mask == 255
        mask_sombra_2d = light_mask == 128
        
        # Aplicar colores exactamente como en el código original (BGR format)
        result_img[mask_luz_2d] = [0, 255, 255]      # Amarillo para luz (BGR)
        result_img[mask_sombra_2d] = [50, 50, 50]    # Gris para sombra
        
        # Agregar leyenda visual en la esquina superior izquierda
        cv2.rectangle(result_img, (20, 20), (300, 120), (255, 255, 255), -1)
        cv2.rectangle(result_img, (20, 20), (300, 120), (0, 0, 0), 2)
        
        # Texto de la leyenda
        cv2.putText(result_img, "ANALISIS LUZ-SOMBRA", (30, 45), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 0), 2)
        cv2.putText(result_img, f"Luz: {light_percentage:.1f}%", (30, 70), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 0), 2)
        cv2.putText(result_img, f"Sombra: {shadow_percentage:.1f}%", (30, 95), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 0), 2)
        
        # Agregar indicadores de color - CORREGIDOS
        cv2.rectangle(result_img, (200, 50), (220, 70), (0, 255, 255), -1)  # Cuadrado amarillo para luz
        cv2.putText(result_img, "Luz", (225, 65), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 1)
        
        cv2.rectangle(result_img, (200, 75), (220, 95), (50, 50, 50), -1)  # Cuadrado gris para sombra
        cv2.putText(result_img, "Sombra", (225, 90), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 1)
        
        # Convertir a base64 para enviar al frontend
        _, buffer = cv2.imencode('.jpg', result_img)
        img_base64 = base64.b64encode(buffer).decode('utf-8')
        
        return {
            "success": True,
            "porcentaje_luz": light_percentage,
            "porcentaje_sombra": shadow_percentage,
            "imagen_visual": f"data:image/jpeg;base64,{img_base64}",
            "fundo": fundo,
            "sector": sector or "",
            "hilera": hilera or "",
            "mensaje": "Imagen procesada con visualización exitosamente"
        }
        
    except Exception as e:
        print(f"❌ Error procesando imagen visual: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error procesando imagen: {str(e)}")


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
    port = int(os.getenv("PORT", 8080))
    host = os.getenv("HOST", "0.0.0.0")
    print(f"🚀 Starting server on {host}:{port}")
    uvicorn.run(app, host=host, port=port)

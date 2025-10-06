#!/usr/bin/env python3
"""
Google Sheets Client
Integración con Google Sheets para almacenar datos de procesamiento de imágenes
"""

import os
import json
import base64
from datetime import datetime
from typing import List, Dict, Any, Optional
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

# Scopes necesarios para Google Sheets
SCOPES = ['https://www.googleapis.com/auth/spreadsheets']

class GoogleSheetsClient:
    """Cliente para interactuar con Google Sheets"""
    
    def __init__(self, credentials_file: str = 'credentials.json', token_file: str = 'token.json'):
        self.credentials_file = credentials_file
        self.token_file = token_file
        self.service = None
        self.creds = None
        
    def authenticate(self) -> bool:
        """
        Autentica con Google Sheets API
        
        Returns:
            bool: True si la autenticación fue exitosa
        """
        try:
            # Intentar usar variables de entorno primero
            if self._authenticate_from_env():
                return True
            
            # Fallback a archivos locales
            if os.path.exists(self.token_file):
                self.creds = Credentials.from_authorized_user_file(self.token_file, SCOPES)
            
            # Si no hay credenciales válidas, solicitar autorización
            if not self.creds or not self.creds.valid:
                if self.creds and self.creds.expired and self.creds.refresh_token:
                    self.creds.refresh(Request())
                else:
                    if not os.path.exists(self.credentials_file):
                        print(f"❌ No se encontró el archivo de credenciales: {self.credentials_file}")
                        print("📋 Necesitas descargar las credenciales desde Google Cloud Console")
                        return False
                    
                    flow = InstalledAppFlow.from_client_secrets_file(
                        self.credentials_file, SCOPES)
                    self.creds = flow.run_local_server(port=0)
                
                # Guardar credenciales para la próxima vez
                with open(self.token_file, 'w') as token:
                    token.write(self.creds.to_json())
            
            # Construir el servicio
            self.service = build('sheets', 'v4', credentials=self.creds)
            print("✅ Autenticación con Google Sheets exitosa")
            return True
            
        except Exception as e:
            print(f"❌ Error en autenticación: {e}")
            return False
    
    def _authenticate_from_env(self) -> bool:
        """
        Intenta autenticar usando variables de entorno
        
        Returns:
            bool: True si la autenticación fue exitosa
        """
        try:
            credentials_b64 = os.getenv('GOOGLE_SHEETS_CREDENTIALS_BASE64')
            token_b64 = os.getenv('GOOGLE_SHEETS_TOKEN_BASE64')
            
            if not credentials_b64 or not token_b64:
                return False
            
            # Decodificar credenciales
            credentials_json = base64.b64decode(credentials_b64).decode('utf-8')
            credentials = json.loads(credentials_json)
            
            # Decodificar token (agregar padding si es necesario)
            # Base64 requiere que la longitud sea múltiplo de 4
            missing_padding = len(token_b64) % 4
            if missing_padding:
                token_b64 += '=' * (4 - missing_padding)
            
            token_json = base64.b64decode(token_b64).decode('utf-8')
            token = json.loads(token_json)
            
            # Crear credenciales
            self.creds = Credentials.from_authorized_user_info(token, SCOPES)
            
            # Verificar si el token es válido
            if not self.creds.valid:
                if self.creds.expired and self.creds.refresh_token:
                    self.creds.refresh(Request())
                else:
                    print("❌ Token expirado y sin refresh token")
                    return False
            
            # Construir el servicio
            self.service = build('sheets', 'v4', credentials=self.creds)
            print("✅ Autenticación con Google Sheets exitosa (desde variables de entorno)")
            return True
            
        except Exception as e:
            print(f"❌ Error autenticando desde variables de entorno: {e}")
            return False
    
    def create_spreadsheet(self, title: str = "Agricola Luz-Sombra") -> Optional[str]:
        """
        Crea una nueva hoja de cálculo
        
        Args:
            title: Título de la hoja de cálculo
            
        Returns:
            str: ID de la hoja de cálculo creada o None si hay error
        """
        try:
            spreadsheet = {
                'properties': {
                    'title': title
                },
                'sheets': [{
                    'properties': {
                        'title': 'Procesamientos',
                        'gridProperties': {
                            'rowCount': 1000,
                            'columnCount': 15
                        }
                    }
                }]
            }
            
            spreadsheet = self.service.spreadsheets().create(
                body=spreadsheet,
                fields='spreadsheetId'
            ).execute()
            
            spreadsheet_id = spreadsheet.get('spreadsheetId')
            print(f"✅ Hoja de cálculo creada: {spreadsheet_id}")
            
            # Configurar encabezados
            self._setup_headers(spreadsheet_id)
            
            return spreadsheet_id
            
        except HttpError as e:
            print(f"❌ Error creando hoja de cálculo: {e}")
            return None
    
    def _setup_headers(self, spreadsheet_id: str, sheet_name: str = None) -> bool:
        """
        Configura los encabezados de la hoja de cálculo
        
        Args:
            spreadsheet_id: ID de la hoja de cálculo
            sheet_name: Nombre de la hoja (opcional)
            
        Returns:
            bool: True si se configuraron correctamente
        """
        try:
            headers = [
                'ID', 'Fecha', 'Hora', 'Imagen', 'Nombre Archivo', 'Empresa', 'Fundo', 'Sector', 'Lote', 'Hilera', 'N° Planta',
                'Latitud', 'Longitud', 'Porcentaje Luz', 'Porcentaje Sombra',
                'Dispositivo', 'Software', 'Dirección', 'Timestamp'
            ]
            
            body = {
                'values': [headers]
            }
            
            # Usar el nombre de la hoja especificado o el por defecto
            range_name = f"'{sheet_name}'!A1:S1" if sheet_name else 'A1:S1'
            
            self.service.spreadsheets().values().update(
                spreadsheetId=spreadsheet_id,
                range=range_name,
                valueInputOption='RAW',
                body=body
            ).execute()
            
            print("✅ Encabezados configurados correctamente")
            return True
            
        except HttpError as e:
            print(f"❌ Error configurando encabezados: {e}")
            return False
    
    def ensure_headers_updated(self, spreadsheet_id: str, sheet_name: str = None) -> bool:
        """
        Verifica y actualiza los encabezados de una hoja existente si es necesario
        
        Args:
            spreadsheet_id: ID de la hoja de cálculo
            sheet_name: Nombre de la hoja (opcional)
            
        Returns:
            bool: True si los encabezados están correctos
        """
        try:
            # Obtener encabezados actuales
            range_name = f"'{sheet_name}'!A1:S1" if sheet_name else 'A1:S1'
            result = self.service.spreadsheets().values().get(
                spreadsheetId=spreadsheet_id,
                range=range_name
            ).execute()
            
            current_headers = result.get('values', [[]])[0] if result.get('values') else []
            
            # Encabezados esperados
            expected_headers = [
                'ID', 'Fecha', 'Hora', 'Imagen', 'Nombre Archivo', 'Empresa', 'Fundo', 'Sector', 'Lote', 'Hilera', 'N° Planta',
                'Latitud', 'Longitud', 'Porcentaje Luz', 'Porcentaje Sombra',
                'Dispositivo', 'Software', 'Dirección', 'Timestamp'
            ]
            
            # Verificar si los encabezados son exactamente correctos
            print(f"📋 Encabezados actuales ({len(current_headers)}): {current_headers}")
            print(f"📋 Encabezados esperados ({len(expected_headers)}): {expected_headers}")
            
            # Si el número de columnas no coincide, actualizar
            if len(current_headers) != len(expected_headers):
                print(f"🔄 Número de columnas diferente: {len(current_headers)} vs {len(expected_headers)}")
                print("🔄 Actualizando encabezados de la hoja...")
                return self._setup_headers(spreadsheet_id, sheet_name)
            
            # Si el número de columnas coincide, verificar si todos los encabezados coinciden exactamente
            matches = sum(1 for i, header in enumerate(expected_headers) 
                        if i < len(current_headers) and current_headers[i] == header)
            
            if matches == len(expected_headers):  # 100% de coincidencia exacta
                print("✅ Encabezados ya están actualizados")
                return True
            else:
                print(f"🔄 Solo {matches}/{len(expected_headers)} encabezados coinciden")
                print("🔄 Actualizando encabezados de la hoja...")
                return self._setup_headers(spreadsheet_id, sheet_name)
            
        except HttpError as e:
            print(f"❌ Error verificando encabezados: {e}")
            return False
    
    def force_update_headers(self, spreadsheet_id: str, sheet_name: str = None) -> bool:
        """
        Fuerza la actualización de los encabezados de la hoja
        
        Args:
            spreadsheet_id: ID de la hoja de cálculo
            sheet_name: Nombre de la hoja (opcional)
            
        Returns:
            bool: True si se actualizaron correctamente
        """
        print("🔄 Forzando actualización de encabezados...")
        return self._setup_headers(spreadsheet_id, sheet_name)
    
    def add_processing_record(self, spreadsheet_id: str, record: Dict[str, Any], sheet_name: str = None) -> bool:
        """
        Agrega un registro de procesamiento a la hoja de cálculo
        
        Args:
            spreadsheet_id: ID de la hoja de cálculo
            record: Diccionario con los datos del procesamiento
            sheet_name: Nombre de la hoja (opcional, por defecto usa 'Procesamientos')
            
        Returns:
            bool: True si se agregó correctamente
        """
        try:
            # Verificar y actualizar encabezados si es necesario
            self.ensure_headers_updated(spreadsheet_id, sheet_name)
            
            # Preparar datos para la fila
            row_data = [
                record.get('id', ''),
                record.get('fecha', ''),
                record.get('hora', ''),
                record.get('imagen', ''),
                record.get('nombre_archivo', ''),  # Nueva columna: Nombre Archivo
                record.get('empresa', ''),
                record.get('fundo', ''),
                record.get('sector', ''),
                record.get('lote', ''),
                record.get('hilera') if record.get('hilera') is not None else '',  # Hilera puede ser null
                record.get('numero_planta') if record.get('numero_planta') is not None else '',  # N° Planta puede ser null
                record.get('latitud', ''),
                record.get('longitud', ''),
                record.get('porcentaje_luz', ''),
                record.get('porcentaje_sombra', ''),
                record.get('dispositivo', ''),
                record.get('software', ''),
                record.get('direccion', ''),
                record.get('timestamp', '')
            ]
            
            print(f"📋 Datos de fila a insertar: {row_data}")
            print(f"📊 Número de columnas: {len(row_data)}")
            
            body = {
                'values': [row_data]
            }
            
            # Usar el nombre de la hoja especificado o el por defecto
            range_name = f"'{sheet_name}'!A:S" if sheet_name else 'A:S'
            
            self.service.spreadsheets().values().append(
                spreadsheetId=spreadsheet_id,
                range=range_name,
                valueInputOption='RAW',
                insertDataOption='INSERT_ROWS',
                body=body
            ).execute()
            
            print(f"✅ Registro agregado: {record.get('imagen', 'N/A')}")
            return True
            
        except HttpError as e:
            print(f"❌ Error agregando registro: {e}")
            return False
    
    def get_processing_records(self, spreadsheet_id: str, limit: int = 100, sheet_name: str = None) -> List[Dict[str, Any]]:
        """
        Obtiene los registros de procesamiento de la hoja de cálculo
        
        Args:
            spreadsheet_id: ID de la hoja de cálculo
            limit: Número máximo de registros a obtener
            sheet_name: Nombre de la hoja (opcional, por defecto usa 'Procesamientos')
            
        Returns:
            List[Dict]: Lista de registros de procesamiento
        """
        try:
            # Usar el nombre de la hoja especificado o el por defecto
            range_name = f"'{sheet_name}'!A2:S{limit + 1}" if sheet_name else f'A2:S{limit + 1}'
            result = self.service.spreadsheets().values().get(
                spreadsheetId=spreadsheet_id,
                range=range_name
            ).execute()
            
            values = result.get('values', [])
            records = []
            
            for row in values:
                if len(row) >= 19:  # Asegurar que tenemos todas las columnas (ahora 19)
                    record = {
                        'id': row[0] if len(row) > 0 else '',
                        'fecha': row[1] if len(row) > 1 else '',
                        'hora': row[2] if len(row) > 2 else '',
                        'imagen': row[3] if len(row) > 3 else '',
                        'nombre_archivo': row[4] if len(row) > 4 else '',  # Nueva columna
                        'empresa': row[5] if len(row) > 5 else '',
                        'fundo': row[6] if len(row) > 6 else '',
                        'sector': row[7] if len(row) > 7 else '',
                        'lote': row[8] if len(row) > 8 else '',
                        'hilera': row[9] if len(row) > 9 else '',
                        'numero_planta': row[10] if len(row) > 10 else '',
                        'latitud': row[11] if len(row) > 11 else '',
                        'longitud': row[12] if len(row) > 12 else '',
                        'porcentaje_luz': row[13] if len(row) > 13 else '',
                        'porcentaje_sombra': row[14] if len(row) > 14 else '',
                        'dispositivo': row[15] if len(row) > 15 else '',
                        'software': row[16] if len(row) > 16 else '',
                        'direccion': row[17] if len(row) > 17 else '',
                        'timestamp': row[18] if len(row) > 18 else ''
                    }
                    
                    # Debug: imprimir los primeros registros para verificar el mapeo
                    if len(records) < 2:
                        print(f"🔍 Debug registro {len(records) + 1}:")
                        print(f"  Row length: {len(row)}")
                        print(f"  Empresa (row[4]): '{row[4] if len(row) > 4 else 'N/A'}'")
                        print(f"  Lote (row[7]): '{row[7] if len(row) > 7 else 'N/A'}'")
                        print(f"  N° Planta (row[9]): '{row[9] if len(row) > 9 else 'N/A'}'")
                        print(f"  Record empresa: '{record['empresa']}'")
                        print(f"  Record lote: '{record['lote']}'")
                        print(f"  Record numero_planta: '{record['numero_planta']}'")
                    
                    records.append(record)
            
            print(f"✅ Obtenidos {len(records)} registros")
            return records
            
        except HttpError as e:
            print(f"❌ Error obteniendo registros: {e}")
            return []
    
    def get_spreadsheet_url(self, spreadsheet_id: str) -> str:
        """
        Obtiene la URL de la hoja de cálculo
        
        Args:
            spreadsheet_id: ID de la hoja de cálculo
            
        Returns:
            str: URL de la hoja de cálculo
        """
        return f"https://docs.google.com/spreadsheets/d/{spreadsheet_id}"
    
    def get_field_data(self) -> Dict[str, Any]:
        """
        Obtiene datos de campo desde Google Sheets y los procesa en formato jerárquico
        
        Returns:
            Dict: Datos de campo procesados en formato jerárquico
        """
        try:
            # Cargar configuración
            config = self._load_config()
            spreadsheet_id = config.get('spreadsheet_id')
            sheet_name = config.get('sheet_name', 'Data-app')
            
            if not spreadsheet_id or spreadsheet_id == 'demo':
                # Retornar datos de demostración
                return self._get_demo_field_data_processed()
            
            # Autenticar si es necesario
            if not self.service:
                if not self.authenticate():
                    return self._get_demo_field_data_processed()
            
            # Obtener datos de la hoja 'Data-campo' (como en la versión antigua)
            range_name = 'Data-campo!B:I'  # Empresa, Fundo, Sector, Lote (columnas específicas)
            result = self.service.spreadsheets().values().get(
                spreadsheetId=spreadsheet_id,
                range=range_name
            ).execute()
            
            values = result.get('values', [])
            if not values or len(values) <= 1:
                # Si no hay datos, retornar estructura vacía
                return {
                    'empresa': [],
                    'fundo': [],
                    'sector': [],
                    'lote': [],
                    'hierarchical': {}
                }
            
            # Procesar datos (eliminar primera fila que contiene títulos)
            rows = values[1:]  # Saltar encabezados
            raw_data = []
            
            for row in rows:
                if len(row) >= 4:  # Asegurar que tenemos al menos 4 columnas
                    empresa = row[0].strip() if len(row) > 0 and row[0] else ''
                    fundo = row[2].strip() if len(row) > 2 and row[2] else ''  # Columna D (índice 2)
                    sector = row[5].strip() if len(row) > 5 and row[5] else ''  # Columna G (índice 5)
                    lote = row[7].strip() if len(row) > 7 and row[7] else ''    # Columna I (índice 7)
                    
                    if empresa:  # Solo agregar si hay empresa
                        raw_data.append({
                            'empresa': empresa,
                            'fundo': fundo,
                            'sector': sector,
                            'lote': lote,
                            'hilera': '',  # No se usa en esta estructura
                            'numero_planta': ''  # No se usa en esta estructura
                        })
            
            # Procesar datos en formato jerárquico
            return self._process_field_data(raw_data)
            
        except Exception as e:
            print(f"❌ Error obteniendo datos de campo: {e}")
            return self._get_demo_field_data_processed()
    
    def get_historial(self) -> Dict[str, Any]:
        """
        Obtiene historial de procesamientos desde Google Sheets
        
        Returns:
            Dict: Historial de procesamientos con formato correcto
        """
        try:
            # Cargar configuración
            config = self._load_config()
            spreadsheet_id = config.get('spreadsheet_id')
            sheet_name = config.get('sheet_name', 'Data-app')
            
            if not spreadsheet_id or spreadsheet_id == 'demo':
                # Retornar historial de demostración
                return self._get_demo_historial_processed()
            
            # Autenticar si es necesario
            if not self.service:
                if not self.authenticate():
                    return self._get_demo_historial_processed()
            
            # Obtener historial de la hoja
            range_name = f"'{sheet_name}'!A2:S1000"  # Ajustar rango según necesidad
            result = self.service.spreadsheets().values().get(
                spreadsheetId=spreadsheet_id,
                range=range_name
            ).execute()
            
            values = result.get('values', [])
            historial = []
            
            for row in values:
                if len(row) >= 15:  # Mínimo 15 columnas para historial completo
                    # Convertir tipos numéricos
                    try:
                        latitud = float(row[11]) if len(row) > 11 and row[11] and row[11].strip() else None
                    except (ValueError, TypeError):
                        latitud = None
                    
                    try:
                        longitud = float(row[12]) if len(row) > 12 and row[12] and row[12].strip() else None
                    except (ValueError, TypeError):
                        longitud = None
                    
                    try:
                        porcentaje_luz = float(row[13]) if len(row) > 13 and row[13] and row[13].strip() else 0
                    except (ValueError, TypeError):
                        porcentaje_luz = 0
                    
                    try:
                        porcentaje_sombra = float(row[14]) if len(row) > 14 and row[14] and row[14].strip() else 0
                    except (ValueError, TypeError):
                        porcentaje_sombra = 0
                    
                    historial.append({
                        'id': row[0] if len(row) > 0 else '',
                        'fecha': row[1] if len(row) > 1 else '',
                        'hora': row[2] if len(row) > 2 else '',
                        'imagen': row[3] if len(row) > 3 else '',
                        'nombre_archivo': row[4] if len(row) > 4 else '',
                        'empresa': row[5] if len(row) > 5 else '',
                        'fundo': row[6] if len(row) > 6 else '',
                        'sector': row[7] if len(row) > 7 else '',
                        'lote': row[8] if len(row) > 8 else '',
                        'hilera': row[9] if len(row) > 9 else '',
                        'numero_planta': row[10] if len(row) > 10 else '',
                        'latitud': latitud,
                        'longitud': longitud,
                        'porcentaje_luz': porcentaje_luz,
                        'porcentaje_sombra': porcentaje_sombra,
                        'dispositivo': row[15] if len(row) > 15 else '',
                        'software': row[16] if len(row) > 16 else '',
                        'direccion': row[17] if len(row) > 17 else '',
                        'timestamp': row[18] if len(row) > 18 else ''
                    })
            
            return {
                'success': True,
                'procesamientos': historial
            }
            
        except Exception as e:
            print(f"❌ Error obteniendo historial: {e}")
            return self._get_demo_historial_processed()
    
    def get_headers(self) -> List[str]:
        """
        Obtiene los encabezados de la hoja de cálculo
        
        Returns:
            List[str]: Lista de encabezados
        """
        try:
            # Cargar configuración
            config = self._load_config()
            spreadsheet_id = config.get('spreadsheet_id')
            sheet_name = config.get('sheet_name', 'Data-app')
            
            if not spreadsheet_id or spreadsheet_id == 'demo':
                # Retornar encabezados de demostración
                return self._get_demo_headers()
            
            # Autenticar si es necesario
            if not self.service:
                if not self.authenticate():
                    return self._get_demo_headers()
            
            # Obtener encabezados de la hoja
            range_name = f"'{sheet_name}'!A1:S1"
            result = self.service.spreadsheets().values().get(
                spreadsheetId=spreadsheet_id,
                range=range_name
            ).execute()
            
            values = result.get('values', [[]])
            headers = values[0] if values else []
            
            return headers
            
        except Exception as e:
            print(f"❌ Error obteniendo encabezados: {e}")
            return self._get_demo_headers()
    
    def update_headers(self, new_headers: List[str]) -> bool:
        """
        Actualiza los encabezados de la hoja de cálculo
        
        Args:
            new_headers: Lista de nuevos encabezados
            
        Returns:
            bool: True si se actualizaron correctamente
        """
        try:
            # Cargar configuración
            config = self._load_config()
            spreadsheet_id = config.get('spreadsheet_id')
            sheet_name = config.get('sheet_name', 'Data-app')
            
            if not spreadsheet_id or spreadsheet_id == 'demo':
                print("⚠️ Modo demo: No se pueden actualizar encabezados")
                return True
            
            # Autenticar si es necesario
            if not self.service:
                if not self.authenticate():
                    return False
            
            # Actualizar encabezados
            body = {
                'values': [new_headers]
            }
            
            range_name = f"'{sheet_name}'!A1:{chr(65 + len(new_headers) - 1)}1"
            
            self.service.spreadsheets().values().update(
                spreadsheetId=spreadsheet_id,
                range=range_name,
                valueInputOption='RAW',
                body=body
            ).execute()
            
            print("✅ Encabezados actualizados correctamente")
            return True
            
        except Exception as e:
            print(f"❌ Error actualizando encabezados: {e}")
            return False
    
    def _load_config(self) -> Dict[str, Any]:
        """
        Carga la configuración de Google Sheets
        
        Returns:
            Dict: Configuración cargada
        """
        config = {}
        
        # Cargar desde variables de entorno
        if os.getenv('GOOGLE_SHEETS_SPREADSHEET_ID'):
            config['spreadsheet_id'] = os.getenv('GOOGLE_SHEETS_SPREADSHEET_ID')
            config['sheet_name'] = os.getenv('GOOGLE_SHEETS_SHEET_NAME', 'Data-app')
            
            if os.getenv('GOOGLE_SHEETS_CREDENTIALS_BASE64'):
                credentials_b64 = os.getenv('GOOGLE_SHEETS_CREDENTIALS_BASE64')
                # Agregar padding si es necesario
                missing_padding = len(credentials_b64) % 4
                if missing_padding:
                    credentials_b64 += '=' * (4 - missing_padding)
                credentials_json = base64.b64decode(credentials_b64).decode('utf-8')
                config['credentials'] = json.loads(credentials_json)
                
            if os.getenv('GOOGLE_SHEETS_TOKEN_BASE64'):
                token_b64 = os.getenv('GOOGLE_SHEETS_TOKEN_BASE64')
                # Agregar padding si es necesario
                missing_padding = len(token_b64) % 4
                if missing_padding:
                    token_b64 += '=' * (4 - missing_padding)
                token_json = base64.b64decode(token_b64).decode('utf-8')
                config['token'] = json.loads(token_json)
        
        # Cargar desde archivo si no hay variables de entorno
        if not config.get('spreadsheet_id'):
            try:
                with open('google_sheets_config.json', 'r') as f:
                    file_config = json.load(f)
                    config.update(file_config)
            except FileNotFoundError:
                print("⚠️ No se encontró google_sheets_config.json")
                config = {
                    'spreadsheet_id': 'demo',
                    'sheet_name': 'Data-app'
                }
        
        return config
    
    def _process_field_data(self, raw_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Procesa datos de campo en formato jerárquico
        
        Args:
            raw_data: Lista de datos de campo
            
        Returns:
            Dict: Datos procesados en formato jerárquico
        """
        # Extraer listas únicas
        empresas = list(set([item['empresa'] for item in raw_data if item['empresa']]))
        fundos = list(set([item['fundo'] for item in raw_data if item['fundo']]))
        sectores = list(set([item['sector'] for item in raw_data if item['sector']]))
        lotes = list(set([item['lote'] for item in raw_data if item['lote']]))
        
        # Crear estructura jerárquica
        hierarchical = {}
        
        for item in raw_data:
            empresa = item['empresa']
            fundo = item['fundo']
            sector = item['sector']
            lote = item['lote']
            
            if not empresa or not fundo or not sector or not lote:
                continue
                
            if empresa not in hierarchical:
                hierarchical[empresa] = {}
            if fundo not in hierarchical[empresa]:
                hierarchical[empresa][fundo] = {}
            if sector not in hierarchical[empresa][fundo]:
                hierarchical[empresa][fundo][sector] = []
            if lote not in hierarchical[empresa][fundo][sector]:
                hierarchical[empresa][fundo][sector].append(lote)
        
        return {
            'empresa': sorted(empresas),
            'fundo': sorted(fundos),
            'sector': sorted(sectores),
            'lote': sorted(lotes),
            'hierarchical': hierarchical
        }
    
    def _get_demo_field_data_processed(self) -> Dict[str, Any]:
        """
        Retorna datos de campo de demostración procesados
        
        Returns:
            Dict: Datos de campo de demostración procesados
        """
        raw_data = [
            {
                'empresa': 'Empresa Demo',
                'fundo': 'Fundo A',
                'sector': 'Sector 1',
                'lote': 'Lote 1',
                'hilera': 'Hilera 1',
                'numero_planta': 'Planta 1'
            },
            {
                'empresa': 'Empresa Demo',
                'fundo': 'Fundo A',
                'sector': 'Sector 1',
                'lote': 'Lote 2',
                'hilera': 'Hilera 2',
                'numero_planta': 'Planta 2'
            },
            {
                'empresa': 'Empresa Demo',
                'fundo': 'Fundo B',
                'sector': 'Sector 2',
                'lote': 'Lote 3',
                'hilera': 'Hilera 3',
                'numero_planta': 'Planta 3'
            }
        ]
        
        return self._process_field_data(raw_data)
    
    def _get_demo_historial_processed(self) -> Dict[str, Any]:
        """
        Retorna historial de demostración procesado
        
        Returns:
            Dict: Historial de demostración procesado
        """
        historial = [
            {
                'id': '1',
                'fecha': '2025-01-15',
                'hora': '10:30:00',
                'imagen': 'demo1.jpg',
                'nombre_archivo': 'demo1.jpg',
                'empresa': 'Empresa Demo',
                'fundo': 'Fundo A',
                'sector': 'Sector 1',
                'lote': 'Lote 1',
                'hilera': 'Hilera 1',
                'numero_planta': 'Planta 1',
                'latitud': -33.4489,
                'longitud': -70.6693,
                'porcentaje_luz': 65.5,
                'porcentaje_sombra': 34.5,
                'dispositivo': 'Xiaomi',
                'software': 'Open Camera',
                'direccion': 'Santiago, Chile',
                'timestamp': '2025-01-15T10:30:00'
            },
            {
                'id': '2',
                'fecha': '2025-01-15',
                'hora': '11:45:00',
                'imagen': 'demo2.jpg',
                'nombre_archivo': 'demo2.jpg',
                'empresa': 'Empresa Demo',
                'fundo': 'Fundo B',
                'sector': 'Sector 2',
                'lote': 'Lote 2',
                'hilera': 'Hilera 2',
                'numero_planta': 'Planta 2',
                'latitud': -33.4500,
                'longitud': -70.6700,
                'porcentaje_luz': 72.3,
                'porcentaje_sombra': 27.7,
                'dispositivo': 'Samsung',
                'software': 'Camera',
                'direccion': 'Santiago, Chile',
                'timestamp': '2025-01-15T11:45:00'
            }
        ]
        
        return {
            'success': True,
            'procesamientos': historial
        }
    
    def _get_demo_headers(self) -> List[str]:
        """
        Retorna encabezados de demostración
        
        Returns:
            List[str]: Encabezados de demostración
        """
        return [
            'ID', 'Fecha', 'Hora', 'Imagen', 'Nombre Archivo', 'Empresa', 'Fundo', 'Sector', 'Lote', 'Hilera', 'N° Planta',
            'Latitud', 'Longitud', 'Porcentaje Luz', 'Porcentaje Sombra',
            'Dispositivo', 'Software', 'Dirección', 'Timestamp'
        ]


def test_sheets_client():
    """Función de prueba para el cliente de Google Sheets"""
    client = GoogleSheetsClient()
    
    if client.authenticate():
        print("🔍 Probando Google Sheets...")
        
        # Crear hoja de cálculo de prueba
        spreadsheet_id = client.create_spreadsheet("Test Agricola")
        
        if spreadsheet_id:
            print(f"📊 Hoja creada: {client.get_spreadsheet_url(spreadsheet_id)}")
            
            # Agregar registro de prueba
            test_record = {
                'id': '1',
                'fecha': '2025-01-15',
                'hora': '10:30:00',
                'imagen': 'test.jpg',
                'empresa': 'Empresa Test',
                'fundo': 'Fundo A',
                'sector': 'Sector 1',
                'lote': 'Lote 1',
                'hilera': 'Hilera 1',
                'numero_planta': 'Planta 1',
                'latitud': '-33.4489',
                'longitud': '-70.6693',
                'porcentaje_luz': '65.5',
                'porcentaje_sombra': '34.5',
                'dispositivo': 'Xiaomi',
                'software': 'Open Camera',
                'direccion': 'Santiago, Chile',
                'timestamp': datetime.now().isoformat()
            }
            
            if client.add_processing_record(spreadsheet_id, test_record):
                print("✅ Registro de prueba agregado")
                
                # Obtener registros
                records = client.get_processing_records(spreadsheet_id)
                print(f"📋 Registros obtenidos: {len(records)}")
            else:
                print("❌ Error agregando registro de prueba")
        else:
            print("❌ Error creando hoja de cálculo")
    else:
        print("❌ Error en autenticación")


if __name__ == "__main__":
    test_sheets_client()

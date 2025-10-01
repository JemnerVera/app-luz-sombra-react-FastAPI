#!/usr/bin/env python3
"""
Crear un modelo compatible que mantenga la misma funcionalidad
"""

import os
import json
import cv2
import numpy as np
import joblib
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import glob

def extraer_caracteristicas_optimizadas(pixeles):
    """
    Extrae las mismas características que usa el modelo actual
    """
    # Convertir a float32 para compatibilidad
    pixeles = pixeles.astype(np.float32)
    r, g, b = pixeles[:, 0], pixeles[:, 1], pixeles[:, 2]
    
    # Convertir a uint8 para HSV
    pixeles_uint8 = pixeles.astype(np.uint8)
    hsv = cv2.cvtColor(pixeles_uint8.reshape(-1, 1, 3), cv2.COLOR_BGR2HSV).reshape(-1, 3)
    h, s, v = hsv[:, 0], hsv[:, 1], hsv[:, 2]
    
    # Luminancia
    luminance = 0.299 * r + 0.587 * g + 0.114 * b
    
    # Saturación
    saturation = s
    
    # NDVI aproximado
    ndvi = (g - r) / (g + r + 1e-8)
    
    # Textura (varianza local)
    texture = np.var(pixeles, axis=1)
    
    return np.column_stack([r, g, b, h, s, v, luminance, saturation, ndvi, texture])

def load_training_data():
    """Carga los datos de entrenamiento desde el dataset"""
    print("Cargando datos de entrenamiento...")
    
    # Rutas de datos
    images_dir = "dataset/imagenes"
    annotations_dir = "dataset/anotaciones"
    
    X = []  # Características
    y = []  # Etiquetas
    
    # Cargar cada imagen y sus anotaciones
    for img_file in glob.glob(os.path.join(images_dir, "*.jpg")):
        img_name = os.path.basename(img_file)
        json_name = img_name.replace('.jpg', '.json')
        json_path = os.path.join(annotations_dir, json_name)
        
        if not os.path.exists(json_path):
            print(f"WARNING: No se encontro anotacion para {img_name}")
            continue
            
        print(f"Procesando: {img_name}")
        
        # Cargar imagen
        img = cv2.imread(img_file)
        if img is None:
            print(f"ERROR: No se pudo cargar {img_name}")
            continue
            
        # Cargar anotaciones
        with open(json_path, 'r') as f:
            annotations = json.load(f)
        
        # Extraer características de píxeles
        height, width = img.shape[:2]
        pixels = img.reshape(-1, 3)
        
        # Crear máscara de anotaciones
        mask = np.zeros((height, width), dtype=np.uint8)
        
        for shape in annotations.get('shapes', []):
            label = shape['label']
            # Mapear etiquetas específicas a categorías generales
            if label in ['SUELO_LUZ', 'MALLA_LUZ']:
                # Crear polígono de la anotación
                points = np.array(shape['points'], dtype=np.int32)
                cv2.fillPoly(mask, [points], 1)  # LUZ
            elif label in ['SUELO_SOMBRA', 'MALLA_SOMBRA']:
                # Crear polígono de la anotación
                points = np.array(shape['points'], dtype=np.int32)
                cv2.fillPoly(mask, [points], 2)  # SOMBRA
        
        # Flatten mask
        mask_flat = mask.flatten()
        
        # Extraer características para píxeles anotados
        for i, (pixel, label) in enumerate(zip(pixels, mask_flat)):
            if label > 0:  # Solo píxeles anotados
                # Usar las mismas características que el modelo actual
                features = extraer_caracteristicas_optimizadas(pixel.reshape(1, -1))
                
                # Verificar valores finitos
                features = features.flatten()
                features = [f if np.isfinite(f) else 0.0 for f in features]
                
                X.append(features)
                y.append('LUZ' if label == 1 else 'SOMBRA')
    
    return np.array(X, dtype=np.float32), np.array(y)

def train_model(X, y):
    """Entrena el modelo con los datos"""
    print(f"Entrenando modelo con {len(X)} muestras...")
    
    # Dividir datos
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    # Escalar características
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Codificar etiquetas
    encoder = LabelEncoder()
    y_train_encoded = encoder.fit_transform(y_train)
    y_test_encoded = encoder.transform(y_test)
    
    # Entrenar modelo con parámetros conservadores
    model = HistGradientBoostingClassifier(
        random_state=42,
        max_iter=50,  # Menos iteraciones para compatibilidad
        learning_rate=0.1,
        max_depth=10
    )
    
    model.fit(X_train_scaled, y_train_encoded)
    
    # Evaluar modelo
    y_pred = model.predict(X_test_scaled)
    print("\nEvaluacion del modelo:")
    print(classification_report(y_test_encoded, y_pred, target_names=encoder.classes_))
    
    # Guardar modelo con joblib
    model_data = (model, scaler, encoder)
    joblib.dump(model_data, "modelo_perfeccionado.pkl")
    
    print("OK: Modelo compatible creado y guardado como 'modelo_perfeccionado.pkl'")
    return model, scaler, encoder

def main():
    """Función principal"""
    print("Creando modelo compatible que mantiene la misma funcionalidad...")
    
    # Verificar versiones
    print(f"NumPy version: {np.__version__}")
    from sklearn import __version__ as sklearn_version
    print(f"Scikit-learn version: {sklearn_version}")
    
    # Cargar datos
    X, y = load_training_data()
    
    if len(X) == 0:
        print("ERROR: No se encontraron datos de entrenamiento")
        return
    
    print(f"OK: Datos cargados: {len(X)} muestras, {X.shape[1]} características")
    
    # Entrenar modelo
    model, scaler, encoder = train_model(X, y)
    
    print("EXITO: Modelo compatible creado exitosamente!")
    print("Archivo guardado: modelo_perfeccionado.pkl")

if __name__ == "__main__":
    main()

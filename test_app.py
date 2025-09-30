#!/usr/bin/env python3
"""
Script de prueba para verificar que la aplicación funciona correctamente
"""

import sys
import os

# Agregar el directorio actual al path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def test_imports():
    """Probar que todas las importaciones funcionan"""
    print("🧪 Probando importaciones...")
    
    try:
        import fastapi
        print("✅ FastAPI importado correctamente")
    except ImportError as e:
        print(f"❌ Error importando FastAPI: {e}")
        return False
    
    try:
        import jinja2
        print("✅ Jinja2 importado correctamente")
    except ImportError as e:
        print(f"❌ Error importando Jinja2: {e}")
        return False
    
    try:
        import aiofiles
        print("✅ aiofiles importado correctamente")
    except ImportError as e:
        print(f"❌ Error importando aiofiles: {e}")
        return False
    
    try:
        from src.services.procesamiento_service_v2 import ProcesamientoServiceV2
        print("✅ ProcesamientoServiceV2 importado correctamente")
    except ImportError as e:
        print(f"❌ Error importando ProcesamientoServiceV2: {e}")
        return False
    
    return True

def test_templates():
    """Probar que los templates existen"""
    print("\n🧪 Probando templates...")
    
    template_files = [
        "templates/base.html",
        "templates/index.html"
    ]
    
    for template_file in template_files:
        if os.path.exists(template_file):
            print(f"✅ {template_file} existe")
        else:
            print(f"❌ {template_file} no existe")
            return False
    
    return True

def test_static_files():
    """Probar que los archivos estáticos existen"""
    print("\n🧪 Probando archivos estáticos...")
    
    static_files = [
        "static/css/style.css",
        "static/js/app.js"
    ]
    
    for static_file in static_files:
        if os.path.exists(static_file):
            print(f"✅ {static_file} existe")
        else:
            print(f"❌ {static_file} no existe")
            return False
    
    return True

def test_model():
    """Probar que el modelo existe"""
    print("\n🧪 Probando modelo...")
    
    model_file = "modelo_perfeccionado.pkl"
    if os.path.exists(model_file):
        print(f"✅ {model_file} existe")
        return True
    else:
        print(f"❌ {model_file} no existe")
        return False

def test_api_creation():
    """Probar que la API se puede crear"""
    print("\n🧪 Probando creación de API...")
    
    try:
        from api import app
        print("✅ API creada correctamente")
        return True
    except Exception as e:
        print(f"❌ Error creando API: {e}")
        return False

def main():
    """Función principal de prueba"""
    print("🚀 Iniciando pruebas de la aplicación Luz-Sombra\n")
    
    tests = [
        test_imports,
        test_templates,
        test_static_files,
        test_model,
        test_api_creation
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        if test():
            passed += 1
        else:
            print("❌ Test falló")
    
    print(f"\n📊 Resultados: {passed}/{total} tests pasaron")
    
    if passed == total:
        print("🎉 ¡Todos los tests pasaron! La aplicación está lista.")
        return True
    else:
        print("⚠️ Algunos tests fallaron. Revisar errores arriba.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)

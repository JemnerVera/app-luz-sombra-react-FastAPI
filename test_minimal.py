#!/usr/bin/env python3
"""
Script minimal para probar la aplicación
"""

import sys
import os

# Agregar el directorio actual al path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def test_basic_imports():
    """Probar importaciones básicas"""
    print("🧪 Probando importaciones básicas...")
    
    try:
        import fastapi
        print(f"✅ FastAPI version: {fastapi.__version__}")
    except Exception as e:
        print(f"❌ Error importando FastAPI: {e}")
        return False
    
    try:
        import uvicorn
        print(f"✅ Uvicorn version: {uvicorn.__version__}")
    except Exception as e:
        print(f"❌ Error importando Uvicorn: {e}")
        return False
    
    try:
        import jinja2
        print(f"✅ Jinja2 version: {jinja2.__version__}")
    except Exception as e:
        print(f"❌ Error importando Jinja2: {e}")
        return False
    
    return True

def test_app_creation():
    """Probar creación de la aplicación"""
    print("\n🧪 Probando creación de aplicación...")
    
    try:
        from api import app
        print("✅ Aplicación creada correctamente")
        print(f"✅ Tipo: {type(app)}")
        print(f"✅ Título: {app.title}")
        return True
    except Exception as e:
        print(f"❌ Error creando aplicación: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_templates():
    """Probar que los templates se pueden cargar"""
    print("\n🧪 Probando templates...")
    
    try:
        from fastapi.templating import Jinja2Templates
        templates = Jinja2Templates(directory="templates")
        print("✅ Templates configurados correctamente")
        return True
    except Exception as e:
        print(f"❌ Error configurando templates: {e}")
        return False

def test_static_files():
    """Probar que los archivos estáticos existen"""
    print("\n🧪 Probando archivos estáticos...")
    
    static_files = [
        "static/css/style.css",
        "static/js/app.js"
    ]
    
    for file_path in static_files:
        if os.path.exists(file_path):
            size = os.path.getsize(file_path)
            print(f"✅ {file_path} existe ({size} bytes)")
        else:
            print(f"❌ {file_path} no existe")
            return False
    
    return True

def main():
    """Función principal"""
    print("🚀 Pruebas mínimas de la aplicación\n")
    
    tests = [
        test_basic_imports,
        test_app_creation,
        test_templates,
        test_static_files
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
        print("🎉 ¡Todos los tests básicos pasaron!")
        print("💡 La aplicación debería funcionar correctamente")
        return True
    else:
        print("⚠️ Algunos tests fallaron")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)

#!/usr/bin/env python3
"""
Script simple para iniciar la aplicación Luz-Sombra
"""

import uvicorn
from api import app

if __name__ == "__main__":
    print("🚀 Iniciando aplicación Luz-Sombra...")
    print("📱 Accede a: http://localhost:8000")
    print("🔧 API Docs: http://localhost:8000/docs")
    print("❤️ Health: http://localhost:8000/health")
    print("⏹️ Presiona Ctrl+C para detener")
    print("-" * 50)
    
    try:
        uvicorn.run(
            app, 
            host="127.0.0.1", 
            port=8000, 
            log_level="info",
            access_log=True
        )
    except KeyboardInterrupt:
        print("\n👋 Aplicación detenida por el usuario")
    except Exception as e:
        print(f"\n❌ Error iniciando aplicación: {e}")
        import traceback
        traceback.print_exc()

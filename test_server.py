#!/usr/bin/env python3
"""
Script para probar el servidor directamente
"""

import asyncio
import uvicorn
from api import app

async def test_server():
    """Probar que el servidor puede iniciar"""
    print("🧪 Probando servidor...")
    
    try:
        # Crear servidor
        config = uvicorn.Config(
            app=app,
            host="127.0.0.1",
            port=8000,
            log_level="info"
        )
        server = uvicorn.Server(config)
        
        print("✅ Servidor creado correctamente")
        
        # Iniciar servidor en background
        print("🚀 Iniciando servidor...")
        await server.serve()
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_server())

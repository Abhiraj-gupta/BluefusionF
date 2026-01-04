#!/usr/bin/env python3
"""
Startup script for Otolith Analysis Service
"""

import uvicorn
import sys
import os

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from config import settings

if __name__ == "__main__":
    print("🐟 Starting Otolith Analysis Service...")
    print(f"📡 Server will run on http://{settings.HOST}:{settings.PORT}")
    print("📚 API docs available at http://localhost:8000/docs")
    
    uvicorn.run(
        "app:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True,
        log_level="info"
    )
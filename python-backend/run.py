#!/usr/bin/env python3
"""
Simple runner for the medical chatbot backend
"""

import uvicorn
import os

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    print(f"🏥 Starting Medical Chatbot Backend on port {port}...")
    print(f"📖 API docs will be available at: http://localhost:{port}/docs")
    print(f"🔍 Health check: http://localhost:{port}/health")
    print()
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=False,  # Disable reload for testing
        log_level="info"
    )
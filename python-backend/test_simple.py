#!/usr/bin/env python3
"""
Simple test for the medical chatbot backend
"""

import requests
import json

def test_health():
    """Test health endpoint"""
    try:
        response = requests.get("http://localhost:8000/health")
        print(f"Health check: {response.status_code}")
        if response.status_code == 200:
            print(f"Response: {response.json()}")
            return True
    except Exception as e:
        print(f"Health check failed: {e}")
    return False

def test_ollama_status():
    """Test Ollama status"""
    try:
        response = requests.get("http://localhost:8000/api/ollama/status")
        print(f"Ollama status: {response.status_code}")
        if response.status_code == 200:
            print(f"Response: {response.json()}")
            return True
    except Exception as e:
        print(f"Ollama status failed: {e}")
    return False

if __name__ == "__main__":
    print("Testing backend...")
    health_ok = test_health()
    ollama_ok = test_ollama_status()
    
    if health_ok:
        print("✅ Backend is running")
    else:
        print("❌ Backend is not responding")
    
    if ollama_ok:
        print("✅ Ollama endpoint is working")
    else:
        print("⚠️ Ollama endpoint has issues (this is OK if Ollama is not running)")
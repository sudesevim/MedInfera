#!/usr/bin/env python3
"""
Simple test script for the medical chatbot backend
"""

import requests
import json
import sys

def test_health_endpoint():
    """Test the health endpoint"""
    try:
        response = requests.get("http://localhost:8000/health", timeout=5)
        if response.status_code == 200:
            print("✅ Health endpoint working")
            print(f"Response: {response.json()}")
            return True
        else:
            print(f"❌ Health endpoint failed with status {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Cannot connect to backend: {e}")
        return False

def test_ollama_status():
    """Test the Ollama status endpoint"""
    try:
        response = requests.get("http://localhost:8000/api/ollama/status", timeout=5)
        if response.status_code == 200:
            print("✅ Ollama status endpoint working")
            print(f"Response: {response.json()}")
            return True
        else:
            print(f"❌ Ollama status endpoint failed with status {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Cannot connect to Ollama status endpoint: {e}")
        return False

def main():
    print("🏥 Testing Medical Chatbot Python Backend...")
    print()
    
    # Test health endpoint
    health_ok = test_health_endpoint()
    print()
    
    # Test Ollama status
    ollama_ok = test_ollama_status()
    print()
    
    if health_ok and ollama_ok:
        print("🎉 All tests passed! Backend is ready for React Native integration.")
        print()
        print("Next steps:")
        print("1. Make sure Ollama is running: ollama serve")
        print("2. Pull the model: ollama pull llama2")
        print("3. Start your React Native app")
        print("4. The app should connect to: http://localhost:8000")
        return 0
    else:
        print("❌ Some tests failed. Please check the backend logs.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
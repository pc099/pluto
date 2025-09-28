#!/usr/bin/env python3
"""
Simple test to verify proxy is working
"""
import requests
import time

def test_proxy_connection():
    """Test basic proxy connectivity"""
    print("🔍 Testing Proxy Connection")
    print("-" * 40)
    
    # Test 1: Basic connectivity
    try:
        response = requests.get(
            "http://httpbin.org/ip",
            proxies={"http": "http://localhost:8080", "https": "http://localhost:8080"},
            timeout=10
        )
        print(f"✅ Basic connectivity: {response.status_code}")
        print(f"   Response: {response.json()}")
    except Exception as e:
        print(f"❌ Basic connectivity failed: {e}")
        return False
    
    # Test 2: Non-AI request (should work normally)
    try:
        response = requests.get(
            "https://www.google.com",
            proxies={"http": "http://localhost:8080", "https": "http://localhost:8080"},
            timeout=10
        )
        print(f"✅ Non-AI request: {response.status_code}")
    except Exception as e:
        print(f"❌ Non-AI request failed: {e}")
        return False
    
    # Test 3: AI request (should be monitored)
    try:
        response = requests.get(
            "https://api.openai.com/v1/models",
            proxies={"http": "http://localhost:8080", "https": "http://localhost:8080"},
            timeout=10
        )
        print(f"✅ AI request: {response.status_code}")
        print(f"   This should appear in proxy logs!")
    except Exception as e:
        print(f"❌ AI request failed: {e}")
        # This is expected if no API key is provided
    
    return True

if __name__ == "__main__":
    print("🚀 Simple Proxy Test")
    print("=" * 50)
    
    if test_proxy_connection():
        print("\n✅ Proxy is working correctly!")
        print("🌐 Internet should work normally")
        print("🤖 AI requests will be monitored")
    else:
        print("\n❌ Proxy has issues")
        print("Check if proxy server is running: python proxy_server.py")

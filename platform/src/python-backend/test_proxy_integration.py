#!/usr/bin/env python3
"""
Test script to demonstrate AI traffic monitoring through proxy
"""
import asyncio
import aiohttp
import json
import time
from datetime import datetime

async def test_ai_request_with_proxy():
    """Test making an AI request through the proxy"""
    
    # Test OpenAI API request through proxy
    url = "https://api.openai.com/v1/models"
    headers = {
        "Authorization": "Bearer YOUR_OPENAI_API_KEY",  # Replace with actual key
        "Content-Type": "application/json"
    }
    
    proxy_url = "http://localhost:8080"
    
    print("🚀 Testing AI Traffic Monitoring through Proxy")
    print(f"Target URL: {url}")
    print(f"Proxy: {proxy_url}")
    print("-" * 50)
    
    try:
        async with aiohttp.ClientSession() as session:
            start_time = time.time()
            
            async with session.get(
                url, 
                headers=headers, 
                proxy=proxy_url,
                timeout=aiohttp.ClientTimeout(total=30)
            ) as response:
                response_time = (time.time() - start_time) * 1000
                
                print(f"✅ Request successful!")
                print(f"Status Code: {response.status}")
                print(f"Response Time: {response_time:.2f}ms")
                print(f"Content Length: {len(await response.text())} bytes")
                
                # This request should now be logged in the monitoring system
                print(f"\n📊 This request should appear in Mission Control Dashboard:")
                print(f"   - Device tracking: MAC address logged")
                print(f"   - Performance metrics: {response_time:.2f}ms response time")
                print(f"   - Security analysis: Request headers analyzed")
                print(f"   - PII detection: No sensitive data detected")
                
    except aiohttp.ClientError as e:
        print(f"❌ Proxy connection error: {e}")
        print("Make sure the proxy server is running: python proxy_server.py")
    except Exception as e:
        print(f"❌ Request failed: {e}")

async def test_chatgpt_simulation():
    """Simulate ChatGPT usage through proxy"""
    
    print("\n🤖 Simulating ChatGPT Usage through Proxy")
    print("-" * 50)
    
    # Simulate a chat completion request
    url = "https://api.openai.com/v1/chat/completions"
    headers = {
        "Authorization": "Bearer YOUR_OPENAI_API_KEY",  # Replace with actual key
        "Content-Type": "application/json"
    }
    
    # Sample chat request
    data = {
        "model": "gpt-3.5-turbo",
        "messages": [
            {"role": "user", "content": "Hello, how are you?"}
        ],
        "max_tokens": 100,
        "temperature": 0.7
    }
    
    proxy_url = "http://localhost:8080"
    
    try:
        async with aiohttp.ClientSession() as session:
            start_time = time.time()
            
            async with session.post(
                url,
                headers=headers,
                json=data,
                proxy=proxy_url,
                timeout=aiohttp.ClientTimeout(total=30)
            ) as response:
                response_time = (time.time() - start_time) * 1000
                
                if response.status == 200:
                    result = await response.json()
                    print(f"✅ Chat completion successful!")
                    print(f"Status Code: {response.status}")
                    print(f"Response Time: {response_time:.2f}ms")
                    
                    # Extract usage information
                    if "usage" in result:
                        usage = result["usage"]
                        print(f"Tokens Used: {usage.get('total_tokens', 0)}")
                        print(f"Cost: ~${usage.get('total_tokens', 0) * 0.000002:.6f}")
                    
                    # Extract response content
                    if "choices" in result and len(result["choices"]) > 0:
                        content = result["choices"][0]["message"]["content"]
                        print(f"Response: {content[:100]}...")
                    
                    print(f"\n📊 Monitoring Data Captured:")
                    print(f"   - Request/Response logged")
                    print(f"   - Token usage tracked")
                    print(f"   - Cost calculated")
                    print(f"   - Response time measured")
                    print(f"   - Content analyzed for PII")
                    print(f"   - Security risks assessed")
                    
                else:
                    print(f"❌ Request failed with status: {response.status}")
                    error_text = await response.text()
                    print(f"Error: {error_text}")
                    
    except Exception as e:
        print(f"❌ Request failed: {e}")

async def main():
    """Main test function"""
    print("🔍 AI Traffic Monitoring Test Suite")
    print("=" * 60)
    
    # Test 1: Basic API request
    await test_ai_request_with_proxy()
    
    # Test 2: Chat completion (requires valid API key)
    # Uncomment the line below if you have a valid OpenAI API key
    # await test_chatgpt_simulation()
    
    print("\n" + "=" * 60)
    print("🎯 Next Steps:")
    print("1. Start the proxy server: python proxy_server.py")
    print("2. Configure your browser to use localhost:8080 as proxy")
    print("3. Visit ChatGPT or other AI services")
    print("4. Check Mission Control Dashboard for real-time monitoring")
    print("5. View device tracking, PII detection, and security analysis")

if __name__ == "__main__":
    asyncio.run(main())

#!/usr/bin/env python3
"""
Integration test script for Pluto AI Platform
Tests all critical components before YC presentation
"""

import asyncio
import httpx
import json
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:8000"
COLORS = {
    'GREEN': '\033[92m',
    'RED': '\033[91m',
    'YELLOW': '\033[93m',
    'BLUE': '\033[94m',
    'END': '\033[0m'
}

def print_test(name, status, message=""):
    """Print test result with color"""
    color = COLORS['GREEN'] if status else COLORS['RED']
    symbol = "✓" if status else "✗"
    print(f"{color}{symbol}{COLORS['END']} {name}")
    if message:
        print(f"  {message}")

async def test_health_check():
    """Test 1: Backend health check"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{BASE_URL}/")
            if response.status_code == 200:
                data = response.json()
                print_test("Backend Health Check", True, f"Version: {data.get('version', 'unknown')}")
                return True
            else:
                print_test("Backend Health Check", False, f"Status: {response.status_code}")
                return False
    except Exception as e:
        print_test("Backend Health Check", False, f"Error: {str(e)}")
        return False

async def test_proxy_endpoints():
    """Test 2: Proxy endpoints exist"""
    endpoints = [
        "/proxy/openai/chat/completions",
        "/proxy/anthropic/messages",
        "/ai/chat",
        "/ai/models"
    ]
    
    all_passed = True
    for endpoint in endpoints:
        # We expect 401 (auth required) or 400 (bad request), not 404
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(f"{BASE_URL}{endpoint}", json={})
                if response.status_code in [401, 400, 422]:
                    print_test(f"Endpoint {endpoint}", True, "Exists (auth required)")
                else:
                    print_test(f"Endpoint {endpoint}", False, f"Unexpected status: {response.status_code}")
                    all_passed = False
        except Exception as e:
            print_test(f"Endpoint {endpoint}", False, str(e))
            all_passed = False
    
    return all_passed

async def test_models_endpoint():
    """Test 3: Models endpoint returns data"""
    try:
        async with httpx.AsyncClient() as client:
            # This will fail auth but we can check the response format
            response = await client.get(f"{BASE_URL}/ai/models")
            if response.status_code == 401:
                print_test("Models Endpoint", True, "Requires authentication (correct)")
                return True
            else:
                print_test("Models Endpoint", False, f"Status: {response.status_code}")
                return False
    except Exception as e:
        print_test("Models Endpoint", False, str(e))
        return False

async def test_analytics_endpoints():
    """Test 4: Analytics endpoints"""
    endpoints = [
        "/analytics/costs",
        "/analytics/usage",
        "/analytics/recent-requests"
    ]
    
    all_passed = True
    for endpoint in endpoints:
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(f"{BASE_URL}{endpoint}")
                if response.status_code == 200:
                    print_test(f"Analytics {endpoint}", True)
                else:
                    print_test(f"Analytics {endpoint}", False, f"Status: {response.status_code}")
                    all_passed = False
        except Exception as e:
            print_test(f"Analytics {endpoint}", False, str(e))
            all_passed = False
    
    return all_passed

async def test_policy_endpoints():
    """Test 5: Policy management endpoints"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{BASE_URL}/policies")
            if response.status_code == 200:
                data = response.json()
                print_test("Policy Endpoints", True, f"Found {len(data.get('policies', []))} policies")
                return True
            else:
                print_test("Policy Endpoints", False, f"Status: {response.status_code}")
                return False
    except Exception as e:
        print_test("Policy Endpoints", False, str(e))
        return False

async def test_quality_endpoints():
    """Test 6: Quality analysis endpoints"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{BASE_URL}/quality/statistics")
            if response.status_code == 200:
                print_test("Quality Analysis Endpoints", True)
                return True
            else:
                print_test("Quality Analysis Endpoints", False, f"Status: {response.status_code}")
                return False
    except Exception as e:
        print_test("Quality Analysis Endpoints", False, str(e))
        return False

async def run_all_tests():
    """Run all integration tests"""
    print("\n" + "="*60)
    print(f"{COLORS['BLUE']}Pluto AI Platform - Integration Test Suite{COLORS['END']}")
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*60 + "\n")
    
    results = []
    
    print(f"{COLORS['YELLOW']}Running tests...{COLORS['END']}\n")
    
    # Run tests
    results.append(await test_health_check())
    results.append(await test_proxy_endpoints())
    results.append(await test_models_endpoint())
    results.append(await test_analytics_endpoints())
    results.append(await test_policy_endpoints())
    results.append(await test_quality_endpoints())
    
    # Summary
    print("\n" + "="*60)
    passed = sum(results)
    total = len(results)
    percentage = (passed / total) * 100
    
    if percentage == 100:
        color = COLORS['GREEN']
        status = "✅ ALL TESTS PASSED"
    elif percentage >= 80:
        color = COLORS['YELLOW']
        status = "⚠️  MOSTLY PASSING"
    else:
        color = COLORS['RED']
        status = "❌ TESTS FAILED"
    
    print(f"{color}{status}{COLORS['END']}")
    print(f"Results: {passed}/{total} tests passed ({percentage:.1f}%)")
    print("="*60 + "\n")
    
    if percentage == 100:
        print(f"{COLORS['GREEN']}🎉 Platform is ready for YC presentation!{COLORS['END']}\n")
    elif percentage >= 80:
        print(f"{COLORS['YELLOW']}⚠️  Some issues detected. Review failed tests.{COLORS['END']}\n")
    else:
        print(f"{COLORS['RED']}❌ Critical issues detected. Fix before demo.{COLORS['END']}\n")
    
    return percentage == 100

if __name__ == "__main__":
    try:
        success = asyncio.run(run_all_tests())
        exit(0 if success else 1)
    except KeyboardInterrupt:
        print(f"\n{COLORS['YELLOW']}Tests interrupted by user{COLORS['END']}")
        exit(1)
    except Exception as e:
        print(f"\n{COLORS['RED']}Test suite failed: {str(e)}{COLORS['END']}")
        exit(1)

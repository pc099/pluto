#!/usr/bin/env python3
"""
Simple HTTP Proxy for AI Traffic Monitoring
This proxy only monitors AI requests and forwards everything else normally
"""
import asyncio
import aiohttp
from aiohttp import web, ClientSession
import json
import logging
from urllib.parse import urlparse
import time
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SimpleAIProxy:
    def __init__(self):
        self.ai_domains = [
            'api.openai.com',
            'api.anthropic.com',
            'generativelanguage.googleapis.com',
            'api.cohere.ai',
            'api.huggingface.co'
        ]
    
    def is_ai_request(self, url: str) -> bool:
        """Check if request is to an AI provider"""
        parsed = urlparse(url)
        return any(domain in parsed.netloc for domain in self.ai_domains)
    
    async def handle_request(self, request):
        """Handle HTTP requests"""
        method = request.method
        url = str(request.url)
        headers = dict(request.headers)
        
        # Remove proxy headers
        headers.pop('host', None)
        headers.pop('connection', None)
        headers.pop('proxy-connection', None)
        
        # Check if this is an AI request
        if self.is_ai_request(url):
            logger.info(f"🤖 AI Request: {method} {url}")
        else:
            logger.info(f"🌐 Regular Request: {method} {url}")
        
        try:
            async with ClientSession() as session:
                async with session.request(
                    method=method,
                    url=url,
                    headers=headers,
                    data=await request.read(),
                    timeout=aiohttp.ClientTimeout(total=30)
                ) as response:
                    response_body = await response.read()
                    
                    if self.is_ai_request(url):
                        logger.info(f"✅ AI Response: {response.status}")
                        # Here you would log to your monitoring system
                        await self.log_ai_request({
                            'timestamp': datetime.utcnow().isoformat(),
                            'method': method,
                            'url': url,
                            'status': response.status,
                            'size': len(response_body)
                        })
                    
                    return web.Response(
                        body=response_body,
                        status=response.status,
                        headers=dict(response.headers)
                    )
        except Exception as e:
            logger.error(f"❌ Request failed: {e}")
            return web.Response(
                text=json.dumps({"error": "Proxy error"}),
                status=500,
                content_type="application/json"
            )
    
    async def log_ai_request(self, data):
        """Log AI request data"""
        logger.info(f"📊 Logged AI request: {data}")

async def init_app():
    """Initialize the proxy application"""
    app = web.Application()
    proxy = SimpleAIProxy()
    
    # Handle all requests
    app.router.add_route('*', '/{path:.*}', proxy.handle_request)
    
    return app

async def main():
    """Main function"""
    app = await init_app()
    
    logger.info("🚀 Starting Simple AI Proxy on http://localhost:8080")
    logger.info("📋 Configure browser proxy: HTTP Proxy: localhost:8080")
    logger.info("🤖 AI requests will be monitored and logged")
    logger.info("🌐 All other traffic will work normally")
    
    runner = web.AppRunner(app)
    await runner.setup()
    site = web.TCPSite(runner, 'localhost', 8080)
    await site.start()
    
    try:
        await asyncio.Future()  # Run forever
    except KeyboardInterrupt:
        logger.info("🛑 Shutting down proxy...")
    finally:
        await runner.cleanup()

if __name__ == '__main__':
    asyncio.run(main())

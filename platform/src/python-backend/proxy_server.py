#!/usr/bin/env python3
"""
Simple HTTP Proxy Server for AI Traffic Monitoring
This can be used to configure browser proxy settings to route AI traffic through the monitoring system
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

class AITrafficProxy:
    def __init__(self):
        self.target_domains = [
            'api.openai.com',
            'api.anthropic.com',
            'generativelanguage.googleapis.com',  # Google AI
            'api.cohere.ai',
            'api.huggingface.co'
        ]
        
    def is_ai_request(self, url: str) -> bool:
        """Check if the request is to an AI provider"""
        parsed = urlparse(url)
        return any(domain in parsed.netloc for domain in self.target_domains)
    
    async def handle_request(self, request):
        """Handle incoming proxy requests"""
        start_time = time.time()
        
        # Extract request information
        method = request.method
        url = str(request.url)
        headers = dict(request.headers)
        
        # Remove proxy-specific headers
        headers.pop('host', None)
        headers.pop('connection', None)
        headers.pop('proxy-connection', None)
        
        # Check if this is an AI request
        if not self.is_ai_request(url):
            # Forward non-AI requests directly without proxy
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
                        return web.Response(
                            body=response_body,
                            status=response.status,
                            headers=dict(response.headers)
                        )
            except Exception as e:
                logger.error(f"Error forwarding non-AI request: {e}")
                return web.Response(
                    text=json.dumps({"error": "Proxy forwarding error"}),
                    status=500,
                    content_type="application/json"
                )
        
        # Log AI request
        logger.info(f"🤖 AI Request: {method} {url}")
        
        try:
            # Forward to AI provider
            async with ClientSession() as session:
                async with session.request(
                    method=method,
                    url=url,
                    headers=headers,
                    data=await request.read(),
                    timeout=aiohttp.ClientTimeout(total=60)
                ) as response:
                    response_body = await response.read()
                    response_time = (time.time() - start_time) * 1000
                    
                    # Log response
                    logger.info(f"✅ AI Response: {response.status} - {response_time:.2f}ms")
                    
                    # Here you would send the data to your monitoring system
                    await self.log_to_monitoring_system({
                        'timestamp': datetime.utcnow().isoformat(),
                        'method': method,
                        'url': url,
                        'status_code': response.status,
                        'response_time_ms': response_time,
                        'headers': dict(response.headers),
                        'body_size': len(response_body)
                    })
                    
                    return web.Response(
                        body=response_body,
                        status=response.status,
                        headers=dict(response.headers)
                    )
                    
        except Exception as e:
            logger.error(f"❌ Error handling AI request: {e}")
            return web.Response(
                text=json.dumps({"error": "AI proxy error", "details": str(e)}),
                status=500,
                content_type="application/json"
            )
    
    async def log_to_monitoring_system(self, data):
        """Send traffic data to the monitoring system"""
        try:
            # This would send data to your main monitoring API
            # For now, just log it
            logger.info(f"Traffic logged: {data}")
            
            # In production, you would send this to your monitoring API:
            # async with ClientSession() as session:
            #     async with session.post(
            #         'http://localhost:8000/monitoring/log-traffic',
            #         json=data
            #     ) as response:
            #         pass
                    
        except Exception as e:
            logger.error(f"Error logging to monitoring system: {e}")

async def init_app():
    """Initialize the proxy application"""
    app = web.Application()
    proxy = AITrafficProxy()
    
    # Handle CONNECT requests for HTTPS tunneling
    async def handle_connect(request):
        """Handle HTTPS CONNECT requests"""
        target_host = request.headers.get('host', '').split(':')[0]
        target_port = int(request.headers.get('host', '').split(':')[1]) if ':' in request.headers.get('host', '') else 443
        
        logger.info(f"🔗 CONNECT request to {target_host}:{target_port}")
        
        # For now, just return 200 OK to allow the connection
        # In a full implementation, you'd establish the tunnel
        return web.Response(status=200)
    
    # Handle all other requests
    app.router.add_route('*', '/{path:.*}', proxy.handle_request)
    app.router.add_route('CONNECT', '/{path:.*}', handle_connect)
    
    return app

async def main():
    """Main function to run the proxy server"""
    app = await init_app()
    
    logger.info("Starting AI Traffic Proxy Server on http://localhost:8080")
    logger.info("Configure your browser to use this proxy to monitor AI traffic")
    logger.info("Proxy settings: HTTP Proxy: localhost:8080")
    
    runner = web.AppRunner(app)
    await runner.setup()
    site = web.TCPSite(runner, 'localhost', 8080)
    await site.start()
    
    try:
        await asyncio.Future()  # Run forever
    except KeyboardInterrupt:
        logger.info("Shutting down proxy server...")
    finally:
        await runner.cleanup()

if __name__ == '__main__':
    asyncio.run(main())

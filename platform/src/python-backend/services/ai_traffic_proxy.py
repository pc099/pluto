"""
AI Traffic Proxy Service
Intercepts and routes all AI traffic through the platform for monitoring and control
"""
import asyncio
import time
import uuid
import os
from typing import Dict, Any, Optional, List
from datetime import datetime
from fastapi import Request, Response
import httpx
from pydantic import BaseModel
import json
import logging

from .device_tracker import DeviceTracker
from .pii_detector import PIIDetector
from .security_analyzer import SecurityAnalyzer
from .traffic_analyzer import TrafficAnalyzer

logger = logging.getLogger(__name__)

class TrafficRequest(BaseModel):
    """Model for tracking traffic requests"""
    request_id: str
    timestamp: datetime
    source_ip: str
    mac_address: Optional[str]
    user_id: Optional[str]
    endpoint: str
    method: str
    headers: Dict[str, str]
    body: Optional[Dict[str, Any]]
    target_provider: str
    target_model: str

class TrafficResponse(BaseModel):
    """Model for tracking traffic responses"""
    request_id: str
    timestamp: datetime
    status_code: int
    headers: Dict[str, str]
    body: Optional[Dict[str, Any]]
    response_time_ms: float
    tokens_used: int
    cost: float
    quality_score: Optional[float]
    pii_detected: bool
    security_risks: List[str]
    device_info: Optional[Dict[str, Any]]

class AITrafficProxy:
    """Main AI Traffic Proxy Service"""
    
    def __init__(self):
        self.device_tracker = DeviceTracker()
        self.pii_detector = PIIDetector()
        self.security_analyzer = SecurityAnalyzer()
        self.traffic_analyzer = TrafficAnalyzer()
        
        # Provider configurations
        self.providers = {
            "openai": {
                "base_url": "https://api.openai.com/v1",
                "headers": {
                    "Authorization": f"Bearer {os.getenv('OPENAI_API_KEY')}",
                    "Content-Type": "application/json"
                }
            },
            "anthropic": {
                "base_url": "https://api.anthropic.com/v1",
                "headers": {
                    "x-api-key": os.getenv('ANTHROPIC_API_KEY'),
                    "Content-Type": "application/json",
                    "anthropic-version": "2023-06-01"
                }
            }
        }
        
        # Traffic statistics
        self.stats = {
            "total_requests": 0,
            "total_responses": 0,
            "total_tokens": 0,
            "total_cost": 0.0,
            "active_devices": set(),
            "pii_incidents": 0,
            "security_incidents": 0
        }
    
    async def process_request(self, request: Request) -> Response:
        """Main entry point for processing AI requests"""
        start_time = time.time()
        request_id = str(uuid.uuid4())
        
        try:
            # Extract request information
            traffic_request = await self._extract_request_info(request, request_id)
            
            # Track device and user
            device_info = await self.device_tracker.track_request(traffic_request)
            traffic_request.device_info = device_info
            
            # Analyze request for PII and security risks
            pii_analysis = await self.pii_detector.analyze_request(traffic_request)
            security_analysis = await self.security_analyzer.analyze_request(traffic_request)
            
            # Route to appropriate AI provider
            response = await self._route_to_provider(traffic_request)
            
            # Process response
            response_time = (time.time() - start_time) * 1000
            traffic_response = await self._process_response(
                request_id, response, response_time, pii_analysis, security_analysis
            )
            
            # Update statistics
            await self._update_statistics(traffic_request, traffic_response)
            
            # Log traffic
            await self.traffic_analyzer.log_traffic(traffic_request, traffic_response)
            
            return response
            
        except Exception as e:
            logger.error(f"Error processing request {request_id}: {str(e)}")
            return Response(
                content=json.dumps({"error": "Internal proxy error"}),
                status_code=500,
                media_type="application/json"
            )
    
    async def _extract_request_info(self, request: Request, request_id: str) -> TrafficRequest:
        """Extract information from incoming request"""
        # Get client IP
        client_ip = request.client.host if request.client else "unknown"
        
        # Get MAC address from headers (if available)
        mac_address = request.headers.get("x-mac-address")
        
        # Get user ID from authentication
        user_id = request.headers.get("x-user-id")
        
        # Parse request body
        body = None
        if request.method in ["POST", "PUT", "PATCH"]:
            try:
                body = await request.json()
            except:
                body = None
        
        # Determine target provider and model
        target_provider, target_model = self._determine_target(request)
        
        return TrafficRequest(
            request_id=request_id,
            timestamp=datetime.utcnow(),
            source_ip=client_ip,
            mac_address=mac_address,
            user_id=user_id,
            endpoint=str(request.url.path),
            method=request.method,
            headers=dict(request.headers),
            body=body,
            target_provider=target_provider,
            target_model=target_model
        )
    
    def _determine_target(self, request: Request) -> tuple[str, str]:
        """Determine target AI provider and model from request"""
        # This would be enhanced with routing logic
        # For now, default to OpenAI
        return "openai", "gpt-3.5-turbo"
    
    async def _route_to_provider(self, traffic_request: TrafficRequest) -> Response:
        """Route request to appropriate AI provider"""
        provider_config = self.providers.get(traffic_request.target_provider)
        if not provider_config:
            raise ValueError(f"Unknown provider: {traffic_request.target_provider}")
        
        # Build target URL
        target_url = f"{provider_config['base_url']}{traffic_request.endpoint}"
        
        # Prepare headers
        headers = provider_config["headers"].copy()
        
        # Make request to AI provider
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.request(
                method=traffic_request.method,
                url=target_url,
                headers=headers,
                json=traffic_request.body
            )
            
            return Response(
                content=response.content,
                status_code=response.status_code,
                headers=dict(response.headers),
                media_type="application/json"
            )
    
    async def _process_response(
        self, 
        request_id: str, 
        response: Response, 
        response_time: float,
        pii_analysis: Dict[str, Any],
        security_analysis: Dict[str, Any]
    ) -> TrafficResponse:
        """Process AI provider response"""
        
        # Parse response body
        body = None
        if response.body:
            try:
                body = json.loads(response.body.decode())
            except:
                body = None
        
        # Extract usage information
        tokens_used = 0
        cost = 0.0
        if body and "usage" in body:
            usage = body["usage"]
            tokens_used = usage.get("total_tokens", 0)
            # Calculate cost based on provider and model
            cost = self._calculate_cost(tokens_used, body.get("model", ""))
        
        # Analyze response for PII
        response_pii = await self.pii_detector.analyze_response(body)
        
        # Combine security analysis
        all_security_risks = security_analysis.get("risks", []) + response_pii.get("risks", [])
        
        return TrafficResponse(
            request_id=request_id,
            timestamp=datetime.utcnow(),
            status_code=response.status_code,
            headers=dict(response.headers),
            body=body,
            response_time_ms=response_time,
            tokens_used=tokens_used,
            cost=cost,
            quality_score=None,  # Will be calculated by quality service
            pii_detected=pii_analysis.get("pii_detected", False) or response_pii.get("pii_detected", False),
            security_risks=all_security_risks,
            device_info=None  # Will be populated
        )
    
    def _calculate_cost(self, tokens: int, model: str) -> float:
        """Calculate cost based on tokens and model"""
        # Simplified cost calculation
        if "gpt-4" in model:
            return tokens * 0.00003  # $0.03 per 1K tokens
        elif "gpt-3.5" in model:
            return tokens * 0.000002  # $0.002 per 1K tokens
        else:
            return tokens * 0.00001  # Default rate
    
    async def _update_statistics(self, request: TrafficRequest, response: TrafficResponse):
        """Update traffic statistics"""
        self.stats["total_requests"] += 1
        self.stats["total_responses"] += 1
        self.stats["total_tokens"] += response.tokens_used
        self.stats["total_cost"] += response.cost
        
        if request.mac_address:
            self.stats["active_devices"].add(request.mac_address)
        
        if response.pii_detected:
            self.stats["pii_incidents"] += 1
        
        if response.security_risks:
            self.stats["security_incidents"] += 1
    
    def get_statistics(self) -> Dict[str, Any]:
        """Get current traffic statistics"""
        return {
            **self.stats,
            "active_devices": len(self.stats["active_devices"]),
            "timestamp": datetime.utcnow().isoformat()
        }

# Global instance
ai_traffic_proxy = AITrafficProxy()

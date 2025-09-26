# AI service
import os
import time
import httpx
from typing import Dict, Any, Optional
from .models import ChatRequest, ChatResponse, RoutingDecision, AIProvider

class AIService:
    def __init__(self):
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        self.anthropic_api_key = os.getenv("ANTHROPIC_API_KEY")
        
    async def route_request(self, request: ChatRequest, user_preferences: Dict[str, Any] = None) -> RoutingDecision:
        """Simple routing logic - will be enhanced with ML later"""
        
        # For now, default to OpenAI
        # TODO: Implement ML-based routing
        return RoutingDecision(
            provider=AIProvider.OPENAI,
            model=request.model or "gpt-3.5-turbo",
            reason="Default routing to OpenAI",
            estimated_cost=0.001,
            confidence=0.8
        )
    
    async def execute_request(self, request: ChatRequest, routing_decision: RoutingDecision) -> ChatResponse:
        """Execute AI request based on routing decision"""
        
        if routing_decision.provider == AIProvider.OPENAI:
            return await self._call_openai(request, routing_decision)
        elif routing_decision.provider == AIProvider.ANTHROPIC:
            return await self._call_anthropic(request, routing_decision)
        else:
            raise ValueError(f"Unsupported provider: {routing_decision.provider}")
    
    async def _call_openai(self, request: ChatRequest, routing: RoutingDecision) -> ChatResponse:
        """Call OpenAI API"""
        if not self.openai_api_key:
            raise ValueError("OpenAI API key not configured")
        
        start_time = time.time()
        
        # Prepare OpenAI request
        openai_request = {
            "model": routing.model,
            "messages": [{"role": msg.role.value, "content": msg.content} for msg in request.messages],
            "temperature": request.temperature,
            "max_tokens": request.max_tokens
        }
        
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.openai_api_key}",
                        "Content-Type": "application/json"
                    },
                    json=openai_request
                )
                
                duration = time.time() - start_time
                
                if response.status_code == 200:
                    data = response.json()
                    
                    # Calculate cost (simplified)
                    usage = data.get("usage", {})
                    input_tokens = usage.get("prompt_tokens", 0)
                    output_tokens = usage.get("completion_tokens", 0)
                    
                    # Simple cost calculation (GPT-3.5-turbo pricing)
                    cost = (input_tokens * 0.0015 + output_tokens * 0.002) / 1000
                    
                    return ChatResponse(
                        id=data.get("id", "unknown"),
                        created=data.get("created", int(time.time())),
                        model=data.get("model", routing.model),
                        choices=data.get("choices", []),
                        usage=usage,
                        cost=cost,
                        duration=duration,
                        provider="openai"
                    )
                else:
                    raise Exception(f"OpenAI API error: {response.status_code} - {response.text}")
                    
        except Exception as e:
            raise Exception(f"Failed to call OpenAI: {str(e)}")
    
    async def _call_anthropic(self, request: ChatRequest, routing: RoutingDecision) -> ChatResponse:
        """Call Anthropic API"""
        if not self.anthropic_api_key:
            raise ValueError("Anthropic API key not configured")
        
        start_time = time.time()
        
        # Prepare Anthropic request
        messages = [{"role": msg.role.value, "content": msg.content} for msg in request.messages]
        
        anthropic_request = {
            "model": routing.model,
            "max_tokens": request.max_tokens or 1000,
            "temperature": request.temperature,
            "messages": messages
        }
        
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    "https://api.anthropic.com/v1/messages",
                    headers={
                        "x-api-key": self.anthropic_api_key,
                        "Content-Type": "application/json",
                        "anthropic-version": "2023-06-01"
                    },
                    json=anthropic_request
                )
                
                duration = time.time() - start_time
                
                if response.status_code == 200:
                    data = response.json()
                    
                    # Calculate cost (simplified for Claude)
                    usage = data.get("usage", {})
                    input_tokens = usage.get("input_tokens", 0)
                    output_tokens = usage.get("output_tokens", 0)
                    
                    # Simple cost calculation (Claude pricing)
                    cost = (input_tokens * 0.003 + output_tokens * 0.015) / 1000
                    
                    # Convert Anthropic response to OpenAI format
                    choices = [{
                        "index": 0,
                        "message": {
                            "role": "assistant",
                            "content": data.get("content", [{}])[0].get("text", "")
                        },
                        "finish_reason": "stop"
                    }]
                    
                    return ChatResponse(
                        id=data.get("id", "unknown"),
                        created=int(time.time()),
                        model=data.get("model", routing.model),
                        choices=choices,
                        usage=usage,
                        cost=cost,
                        duration=duration,
                        provider="anthropic"
                    )
                else:
                    raise Exception(f"Anthropic API error: {response.status_code} - {response.text}")
                    
        except Exception as e:
            raise Exception(f"Failed to call Anthropic: {str(e)}")

# Create singleton instance
ai_service = AIService()

# AI service
import os
import time
import httpx
from typing import Dict, Any, Optional
from openai import OpenAI
from .models import ChatRequest, ChatResponse, RoutingDecision, AIProvider

class AIService:
    def __init__(self):
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        self.anthropic_api_key = os.getenv("ANTHROPIC_API_KEY")
        
    async def route_request(self, request: ChatRequest, user_preferences: Dict[str, Any] = None) -> RoutingDecision:
        """ML-based routing logic with intelligent provider selection"""
        
        user_preferences = user_preferences or {}
        user_id = user_preferences.get('user_id', 'anonymous')
        
        # Determine routing strategy
        strategy = getattr(request, 'routing_strategy', 'balanced')
        if not strategy:
            strategy = 'balanced'
        
        try:
            # Use ML routing engine
            from services.ml_routing_engine import ml_routing_engine
            
            routing_decision = await ml_routing_engine.route_request(
                request=request.dict(),
                user_id=user_id,
                strategy=strategy,
                context={
                    'budget_remaining': user_preferences.get('budget_remaining', 1.0),
                    'min_quality': getattr(request, 'min_quality', 7.0)
                }
            )
            
            return RoutingDecision(
                provider=AIProvider(routing_decision['provider']),
                model=routing_decision['model'],
                reason=routing_decision['reason'],
                estimated_cost=routing_decision['predicted_cost'],
                confidence=routing_decision['confidence']
            )
        except Exception as e:
            print(f"ML routing failed, using fallback: {e}")
            # Fallback to simple routing
            return RoutingDecision(
                provider=AIProvider.OPENAI,
                model=request.model or "gpt-3.5-turbo",
                reason="Fallback routing (ML unavailable)",
                estimated_cost=0.001,
                confidence=0.5
            )
    
    async def execute_request(self, request: ChatRequest, routing_decision: RoutingDecision, user_id: str = None, team_id: str = None) -> ChatResponse:
        """Execute AI request based on routing decision using proxy"""
        
        if routing_decision.provider == AIProvider.OPENAI:
            return await self._call_openai_proxy(request, routing_decision, user_id, team_id)
        elif routing_decision.provider == AIProvider.ANTHROPIC:
            return await self._call_anthropic_proxy(request, routing_decision, user_id, team_id)
        else:
            raise ValueError(f"Unsupported provider: {routing_decision.provider}")
    
    async def _call_openai(self, request: ChatRequest, routing: RoutingDecision) -> ChatResponse:
        """Call OpenAI API using official client"""
        if not self.openai_api_key:
            raise ValueError("OpenAI API key not configured")
        
        start_time = time.time()
        
        try:
            # Initialize OpenAI client
            client = OpenAI(api_key=self.openai_api_key)
            
            # Prepare messages for OpenAI
            messages = [{"role": msg.role.value, "content": msg.content} for msg in request.messages]
            
            # Make the API call
            response = client.chat.completions.create(
                model=routing.model,
                messages=messages,
                temperature=request.temperature or 0.7,
                max_tokens=request.max_tokens or 1000
            )
            
            duration = time.time() - start_time
            
            # Calculate cost (simplified)
            usage = response.usage
            input_tokens = usage.prompt_tokens if usage else 0
            output_tokens = usage.completion_tokens if usage else 0
            
            # Simple cost calculation (GPT-3.5-turbo pricing)
            cost = (input_tokens * 0.0015 + output_tokens * 0.002) / 1000
            
            # Convert response to our format
            choices = []
            for choice in response.choices:
                choices.append({
                    "index": choice.index,
                    "message": {
                        "role": choice.message.role,
                        "content": choice.message.content
                    },
                    "finish_reason": choice.finish_reason
                })
            
            return ChatResponse(
                id=response.id,
                created=response.created,
                model=response.model,
                choices=choices,
                usage={
                    "prompt_tokens": input_tokens,
                    "completion_tokens": output_tokens,
                    "total_tokens": input_tokens + output_tokens
                },
                cost=cost,
                duration=duration,
                provider="openai"
            )
                    
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
    
    async def _call_openai_proxy(self, request: ChatRequest, routing: RoutingDecision, user_id: str = None, team_id: str = None) -> ChatResponse:
        """Call OpenAI through our proxy for monitoring and analysis"""
        from proxy.ai_providers import PROVIDERS
        
        start_time = time.time()
        
        # Prepare request data
        request_data = {
            "model": routing.model,
            "messages": [{"role": msg.role.value, "content": msg.content} for msg in request.messages],
            "temperature": request.temperature or 0.7,
            "max_tokens": request.max_tokens or 1000
        }
        
        headers = {
            "Authorization": f"Bearer {self.openai_api_key}",
            "Content-Type": "application/json"
        }
        
        try:
            # Use the proxy
            result = await PROVIDERS["openai"].proxy_request(
                endpoint="chat/completions",
                request_data=request_data,
                headers=headers,
                user_id=user_id,
                team_id=team_id
            )
            
            if result["success"]:
                response_data = result["data"]
                duration = time.time() - start_time
                
                # Extract usage and cost info
                usage = response_data.get("usage", {})
                cost_info = result.get("cost_info", {})
                
                return ChatResponse(
                    id=response_data.get("id", "unknown"),
                    created=response_data.get("created", int(time.time())),
                    model=response_data.get("model", routing.model),
                    choices=response_data.get("choices", []),
                    usage={
                        "prompt_tokens": usage.get("prompt_tokens", 0),
                        "completion_tokens": usage.get("completion_tokens", 0),
                        "total_tokens": usage.get("total_tokens", 0)
                    },
                    cost=cost_info.get("total_cost", 0),
                    duration=duration,
                    provider="openai"
                )
            else:
                raise Exception(result.get("error", "Proxy request failed"))
                
        except Exception as e:
            raise Exception(f"Failed to call OpenAI proxy: {str(e)}")
    
    async def _call_anthropic_proxy(self, request: ChatRequest, routing: RoutingDecision, user_id: str = None, team_id: str = None) -> ChatResponse:
        """Call Anthropic through our proxy for monitoring and analysis"""
        from proxy.ai_providers import PROVIDERS
        
        start_time = time.time()
        
        # Prepare request data
        request_data = {
            "model": routing.model,
            "messages": [{"role": msg.role.value, "content": msg.content} for msg in request.messages],
            "max_tokens": request.max_tokens or 1000,
            "temperature": request.temperature or 0.7
        }
        
        headers = {
            "x-api-key": self.anthropic_api_key,
            "anthropic-version": "2023-06-01",
            "Content-Type": "application/json"
        }
        
        try:
            # Use the proxy
            result = await PROVIDERS["anthropic"].proxy_request(
                endpoint="messages",
                request_data=request_data,
                headers=headers,
                user_id=user_id,
                team_id=team_id
            )
            
            if result["success"]:
                response_data = result["data"]
                duration = time.time() - start_time
                
                # Extract usage and cost info
                usage = response_data.get("usage", {})
                cost_info = result.get("cost_info", {})
                
                # Convert Anthropic response to OpenAI format
                choices = [{
                    "index": 0,
                    "message": {
                        "role": "assistant",
                        "content": response_data.get("content", [{}])[0].get("text", "")
                    },
                    "finish_reason": "stop"
                }]
                
                return ChatResponse(
                    id=response_data.get("id", "unknown"),
                    created=int(time.time()),
                    model=response_data.get("model", routing.model),
                    choices=choices,
                    usage={
                        "prompt_tokens": usage.get("input_tokens", 0),
                        "completion_tokens": usage.get("output_tokens", 0),
                        "total_tokens": usage.get("input_tokens", 0) + usage.get("output_tokens", 0)
                    },
                    cost=cost_info.get("total_cost", 0),
                    duration=duration,
                    provider="anthropic"
                )
            else:
                raise Exception(result.get("error", "Proxy request failed"))
                
        except Exception as e:
            raise Exception(f"Failed to call Anthropic proxy: {str(e)}")

# Create singleton instance
ai_service = AIService()

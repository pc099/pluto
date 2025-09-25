# proxy/ai_providers.py
import asyncio
import httpx
import json
import time
from typing import Dict, Any, Optional
from services.ai_quality_service import AIQualityAnalyzer
from services.websocket_manager import websocket_manager

class AIProviderProxy:
    """Base class for AI provider proxies"""
    
    def __init__(self):
        self.client = httpx.AsyncClient(timeout=60.0)
    
    async def proxy_request(self, request_data: Dict[str, Any], headers: Dict[str, str], user_id: str = None, team_id: str = None) -> Dict[str, Any]:
        """Proxy request to AI provider and log everything"""
        raise NotImplementedError

class AIProxyService:
    def __init__(self):
        self.providers = {
            'openai': {
                'base_url': 'https://api.openai.com/v1',
                'pricing': {
                    'gpt-4': {'input': 0.03, 'output': 0.06},
                    'gpt-3.5-turbo': {'input': 0.0015, 'output': 0.002}
                }
            },
            'anthropic': {
                'base_url': 'https://api.anthropic.com/v1',
                'pricing': {
                    'claude-3-sonnet': {'input': 0.003, 'output': 0.015},
                    'claude-3-haiku': {'input': 0.00025, 'output': 0.00125}
                }
            }
        }
        self.quality_analyzer = AIQualityAnalyzer()
    
    async def proxy_request(self, provider: str, endpoint: str, request_data: Dict[str, Any], 
                          headers: Dict[str, str], user_id: str = None, team_id: str = None) -> Dict[str, Any]:
        """Proxy AI request with comprehensive analysis"""
        start_time = time.time()
        request_id = f"req_{int(time.time() * 1000)}"
        
        # Extract model and content for analysis
        model = request_data.get('model', 'unknown')
        messages = request_data.get('messages', [])
        content = self._extract_content_from_messages(messages)
        
        try:
            # Send live update - request started
            await websocket_manager.broadcast_to_subscribers({
                "type": "live_request",
                "request_id": request_id,
                "provider": provider,
                "model": model,
                "user_id": user_id,
                "team_id": team_id,
                "timestamp": time.time(),
                "status": "processing"
            }, user_id, team_id)
            
            # Make the actual API request
            response_data, status_code = await self._make_api_request(provider, endpoint, request_data, headers)
            
            # Extract response content
            response_content = self._extract_response_content(response_data)
            
            # Calculate duration and tokens
            duration = time.time() - start_time
            input_tokens = self._estimate_tokens(content)
            output_tokens = self._estimate_tokens(response_content)
            total_tokens = input_tokens + output_tokens
            
            # Calculate cost
            cost = self._calculate_cost(provider, model, input_tokens, output_tokens)
            
            # Perform quality analysis
            quality_analysis = await self.quality_analyzer.analyze_ai_response(
                request_content=content,
                response_content=response_content,
                model=model,
                provider=provider,
                user_id=user_id,
                team_id=team_id
            )
            
            # Prepare comprehensive log entry
            log_entry = {
                'request_id': request_id,
                'timestamp': start_time,
                'provider': provider,
                'endpoint': endpoint,
                'user_id': user_id,
                'team_id': team_id,
                'model': model,
                'input_tokens': input_tokens,
                'output_tokens': output_tokens,
                'total_tokens': total_tokens,
                'total_cost': cost,
                'duration_seconds': duration,
                'status_code': status_code,
                'success': status_code == 200,
                'quality_analysis': quality_analysis,
                'request_content': content[:1000],  # Truncate for storage
                'response_content': response_content[:1000]
            }
            
            # Store in database
            await self._log_request_with_quality(log_entry)
            
            # Send live update - request completed
            await websocket_manager.broadcast_to_subscribers({
                "type": "live_response",
                "request_id": request_id,
                "provider": provider,
                "model": model,
                "user_id": user_id,
                "team_id": team_id,
                "duration": duration,
                "tokens": total_tokens,
                "cost": cost,
                "quality_score": quality_analysis.get('quality_score', 0),
                "hallucination_risk": quality_analysis.get('hallucination_risk', 'unknown'),
                "security_threats": quality_analysis.get('security_threats', []),
                "timestamp": time.time(),
                "status": "completed"
            }, user_id, team_id)
            
            return response_data
            
        except Exception as e:
            # Log error and send failure update
            error_log = {
                'request_id': request_id,
                'timestamp': start_time,
                'provider': provider,
                'endpoint': endpoint,
                'user_id': user_id,
                'team_id': team_id,
                'model': model,
                'duration_seconds': time.time() - start_time,
                'status_code': 500,
                'success': False,
                'error_message': str(e)
            }
            
            await self._log_request_with_quality(error_log)
            
            await websocket_manager.broadcast_to_subscribers({
                "type": "live_error",
                "request_id": request_id,
                "error": str(e),
                "timestamp": time.time(),
                "status": "failed"
            }, user_id, team_id)
            
            raise
    
    def _extract_content_from_messages(self, messages: list) -> str:
        """Extract text content from message array"""
        content_parts = []
        for msg in messages:
            if isinstance(msg, dict) and 'content' in msg:
                content_parts.append(str(msg['content']))
        return ' '.join(content_parts)
    
    def _extract_response_content(self, response_data: dict) -> str:
        """Extract content from API response"""
        try:
            # OpenAI format
            if 'choices' in response_data:
                choices = response_data['choices']
                if choices and 'message' in choices[0]:
                    return choices[0]['message'].get('content', '')
            
            # Anthropic format
            if 'content' in response_data:
                content = response_data['content']
                if isinstance(content, list) and content:
                    return content[0].get('text', '')
                elif isinstance(content, str):
                    return content
            
            return str(response_data)
            
        except Exception:
            return ''
    
    def _estimate_tokens(self, text: str) -> int:
        """Rough token estimation (4 characters per token)"""
        return max(1, len(text) // 4)
    
    def _calculate_cost(self, provider: str, model: str, input_tokens: int, output_tokens: int) -> float:
        """Calculate cost based on provider pricing"""
        try:
            pricing = self.providers.get(provider, {}).get('pricing', {}).get(model, {})
            input_cost = (input_tokens / 1000) * pricing.get('input', 0)
            output_cost = (output_tokens / 1000) * pricing.get('output', 0)
            return round(input_cost + output_cost, 6)
        except:
            return 0.0
    
    async def _make_api_request(self, provider: str, endpoint: str, data: dict, headers: dict) -> tuple:
        """Make the actual API request"""
        base_url = self.providers[provider]['base_url']
        url = f"{base_url}/{endpoint.lstrip('/')}"
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, json=data, headers=headers)
            return response.json(), response.status_code
    
    async def _log_request_with_quality(self, log_entry: dict):
        """Log request with quality analysis to database"""
        from services.database_service import db_service
        
        try:
            # Store main request log
            await db_service.log_ai_request(log_entry)
            
            # Store quality analysis if present
            if 'quality_analysis' in log_entry and log_entry['quality_analysis']:
                quality_data = {
                    'request_id': log_entry['request_id'],
                    'analysis_id': f"qa_{log_entry['request_id']}",
                    'quality_score': log_entry['quality_analysis'].get('quality_score', 0),
                    'confidence_score': log_entry['quality_analysis'].get('confidence_score', 0),
                    'hallucination_risk': log_entry['quality_analysis'].get('hallucination_risk', 0),  # Convert to numeric
                    'has_hallucination': log_entry['quality_analysis'].get('has_hallucination', False),
                    'security_threats': log_entry['quality_analysis'].get('security_threats', []),
                    'compliance_violations': log_entry['quality_analysis'].get('compliance_violations', []),
                    'created_at': log_entry['timestamp']
                }
                
                await db_service.store_quality_analysis(quality_data)
                
        except Exception as e:
            print(f"Failed to log request: {e}")

class OpenAIProxy(AIProviderProxy):
    """OpenAI API Proxy"""
    
    OPENAI_BASE_URL = "https://api.openai.com/v1"
    
    # OpenAI Pricing (per 1K tokens) - Updated pricing
    PRICING = {
        "gpt-4": {"input": 0.03, "output": 0.06},
        "gpt-4-turbo": {"input": 0.01, "output": 0.03},
        "gpt-4o": {"input": 0.005, "output": 0.015},
        "gpt-3.5-turbo": {"input": 0.0015, "output": 0.002},
        "text-embedding-ada-002": {"input": 0.0001, "output": 0},
    }
    
    async def proxy_request(self, endpoint: str, request_data: Dict[str, Any], headers: Dict[str, str], user_id: str = None, team_id: str = None) -> Dict[str, Any]:
        """Proxy OpenAI request with AI quality analysis"""
        start_time = time.time()
        request_id = f"req_{int(time.time() * 1000)}_{hash(str(request_data))}"
        
        # Extract content for analysis
        request_content = self._extract_content_for_preview(request_data)
        
        # Stream live request start
        from services.websocket_service import live_monitor
        await live_monitor.stream_request_live({
            "request_id": request_id,
            "provider": "openai",
            "endpoint": endpoint,
            "user_id": user_id,
            "team_id": team_id,
            "model": request_data.get("model", "gpt-3.5-turbo"),
            "status": "starting",
            "content": request_content,
            "estimated_cost": self._estimate_cost_quick(request_data)
        })
        
        # Quick cost estimation for policy check
        estimated_cost = self._estimate_cost_quick(request_data)
        
        # CHECK POLICIES FIRST
        from services.policy_engine import policy_engine
        policy_result = policy_engine.evaluate_request(request_data, user_id, team_id, estimated_cost)
        
        # Stream policy check result
        if policy_result.get("violations"):
            for violation in policy_result["violations"]:
                await live_monitor.stream_policy_violation({
                    "request_id": request_id,
                    "user_id": user_id,
                    "team_id": team_id,
                    "violation_type": violation.get("type"),
                    "policy_name": violation.get("policy_id"),
                    "action": violation.get("action"),
                    "message": violation.get("message"),
                    "severity": "critical" if violation.get("action") == "block" else "warning"
                })
        
        # If request is blocked, stream the block and return immediately
        if not policy_result["allowed"]:
            end_time = time.time()
            
            # Stream blocked response
            await live_monitor.stream_response_live({
                "request_id": request_id,
                "status": "blocked",
                "success": False,
                "error": "Request blocked by policy",
                "duration": end_time - start_time,
                "actual_cost": 0,
                "blocked": True
            })
            
            # Log the blocked request
            await self._log_request(
                provider="openai",
                endpoint=endpoint,
                request_data=request_data,
                response_data={"error": "Request blocked by policy", "policy_violations": policy_result["violations"]},
                user_id=user_id,
                team_id=team_id,
                cost_info={"input_cost": 0, "output_cost": 0, "total_cost": 0, "estimated_cost": estimated_cost},
                duration=end_time - start_time,
                status_code=403,
                policy_result=policy_result
            )
            
            return {
                "success": False,
                "error": "Request blocked by policy",
                "policy_violations": policy_result["violations"],
                "status_code": 403,
                "blocked": True
            }
        
        # Stream processing status
        await live_monitor.stream_request_live({
            "request_id": request_id,
            "provider": "openai", 
            "endpoint": endpoint,
            "user_id": user_id,
            "team_id": team_id,
            "model": request_data.get("model", "gpt-3.5-turbo"),
            "status": "processing",
            "policy_violations": policy_result.get("violations", [])
        })
        
        # Prepare request to OpenAI
        url = f"{self.OPENAI_BASE_URL}/{endpoint}"
        
        # Forward headers but ensure we have auth
        proxy_headers = {
            "Content-Type": "application/json",
            "Authorization": headers.get("Authorization", ""),
            "User-Agent": "Enterprise-AI-Proxy/1.0"
        }
        
        try:
            # Make request to OpenAI
            response = await self.client.post(
                url, 
                json=request_data, 
                headers=proxy_headers
            )
            
            response_data = response.json()
            end_time = time.time()
            
            # Extract response content for analysis
            response_content = self._extract_response_content(response_data)
            
            # PERFORM AI QUALITY ANALYSIS
            from services.ai_quality_service import ai_quality_analyzer
            quality_analysis = await ai_quality_analyzer.analyze_response_quality(
                request_content=request_content,
                response_content=response_content,
                model=request_data.get("model", "gpt-3.5-turbo"),
                provider="openai"
            )
            
            # Calculate costs
            cost_info = self._calculate_cost(request_data, response_data)
            
            # Stream successful response with quality analysis
            await live_monitor.stream_response_live({
                "request_id": request_id,
                "status": "completed",
                "success": True,
                "actual_cost": cost_info.get("total_cost", 0),
                "duration": end_time - start_time,
                "input_tokens": cost_info.get("input_tokens", 0),
                "output_tokens": cost_info.get("output_tokens", 0),
                "response_content": response_content,
                "quality_analysis": quality_analysis  # NEW: Include quality analysis
            })
            
            # Stream quality alerts if any critical issues
            if quality_analysis.get("alerts"):
                for alert in quality_analysis["alerts"]:
                    if alert["severity"] in ["CRITICAL", "HIGH"]:
                        await live_monitor.stream_policy_violation({
                            "request_id": request_id,
                            "user_id": user_id,
                            "team_id": team_id,
                            "violation_type": "QUALITY",
                            "policy_name": f"AI Quality Monitor - {alert['type']}",
                            "action": "alert",
                            "message": alert["message"],
                            "severity": alert["severity"].lower()
                        })
            
            # Log the request with quality analysis
            await self._log_request(
                provider="openai",
                endpoint=endpoint,
                request_data=request_data,
                response_data=response_data,
                user_id=user_id,
                team_id=team_id,
                cost_info=cost_info,
                duration=end_time - start_time,
                status_code=response.status_code,
                policy_result=policy_result,
                quality_analysis=quality_analysis  # NEW: Include quality analysis in logs
            )
            
            return {
                "success": True,
                "data": response_data,
                "status_code": response.status_code,
                "cost_info": cost_info,
                "duration": end_time - start_time,
                "policy_warnings": [v for v in policy_result["violations"] if v.get("action") == "warn"],
                "quality_analysis": quality_analysis  # NEW: Return quality analysis
            }
            
        except Exception as e:
            end_time = time.time()
            
            # Stream error response
            await live_monitor.stream_response_live({
                "request_id": request_id,
                "status": "error",
                "success": False,
                "error": str(e),
                "duration": end_time - start_time,
                "actual_cost": 0
            })
            
            # Log failed request
            await self._log_request(
                provider="openai",
                endpoint=endpoint,
                request_data=request_data,
                response_data={"error": str(e)},
                user_id=user_id,
                team_id=team_id,
                cost_info={"input_cost": 0, "output_cost": 0, "total_cost": 0},
                duration=end_time - start_time,
                status_code=500,
                policy_result=policy_result
            )
            
            return {
                "success": False,
                "error": str(e),
                "status_code": 500
            }
    
    def _calculate_cost(self, request_data: Dict[str, Any], response_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate cost for OpenAI request"""
        model = request_data.get("model", "gpt-3.5-turbo")
        
        # Get pricing for model
        pricing = self.PRICING.get(model, self.PRICING["gpt-3.5-turbo"])
        
        input_tokens = 0
        output_tokens = 0
        
        if "usage" in response_data:
            usage = response_data["usage"]
            input_tokens = usage.get("prompt_tokens", 0)
            output_tokens = usage.get("completion_tokens", 0)
        else:
            # Estimate tokens if usage not provided
            input_tokens = self._estimate_tokens(request_data.get("messages", []))
        
        # Calculate costs
        input_cost = (input_tokens / 1000) * pricing["input"]
        output_cost = (output_tokens / 1000) * pricing["output"]
        total_cost = input_cost + output_cost
        
        return {
            "model": model,
            "input_tokens": input_tokens,
            "output_tokens": output_tokens,
            "input_cost": round(input_cost, 6),
            "output_cost": round(output_cost, 6),
            "total_cost": round(total_cost, 6),
            "pricing": pricing
        }
    
    def _estimate_tokens(self, messages) -> int:
        """Rough token estimation for input"""
        total_chars = 0
        if isinstance(messages, list):
            for message in messages:
                if isinstance(message, dict) and "content" in message:
                    total_chars += len(str(message["content"]))
    def _estimate_cost_quick(self, request_data: Dict[str, Any]) -> float:
        """Quick cost estimation for policy checks"""
        model = request_data.get("model", "gpt-3.5-turbo")
        pricing = self.PRICING.get(model, self.PRICING["gpt-3.5-turbo"])
        
        # Estimate input tokens
        estimated_input_tokens = self._estimate_tokens(request_data.get("messages", []))
        max_output_tokens = request_data.get("max_tokens", 100)
        
        # Calculate estimated cost
        input_cost = (estimated_input_tokens / 1000) * pricing["input"]
        output_cost = (max_output_tokens / 1000) * pricing["output"]
        
        return input_cost + output_cost
    
    def _extract_content_for_preview(self, request_data: Dict[str, Any]) -> str:
        """Extract content from request for live preview"""
        content = ""
        
        # OpenAI format
        if "messages" in request_data:
            for message in request_data["messages"][-2:]:  # Last 2 messages
                if isinstance(message, dict) and "content" in message:
                    role = message.get("role", "user")
                    content += f"{role}: {str(message['content'])[:100]}... "
        
        return content.strip()
    
    def _extract_response_content(self, response_data: Dict[str, Any]) -> str:
        """Extract response content for live preview"""
        content = ""
        
        if "choices" in response_data:
            for choice in response_data["choices"][:1]:  # First choice only
                if "message" in choice and "content" in choice["message"]:
                    content = str(choice["message"]["content"])[:200] + "..."
                elif "text" in choice:
                    content = str(choice["text"])[:200] + "..."
        
        return content
    
    async def _log_request(self, **kwargs):
        """Log request to database"""
        from services.database_service import db_service
        from models.request_log import RequestLog
        
        log_entry = RequestLog.create_log_entry(
            provider=kwargs.get('provider'),
            endpoint=kwargs.get('endpoint'),
            user_id=kwargs.get('user_id'),
            team_id=kwargs.get('team_id'),
            model=kwargs['cost_info'].get('model'),
            input_tokens=kwargs['cost_info'].get('input_tokens', 0),
            output_tokens=kwargs['cost_info'].get('output_tokens', 0),
            total_cost=kwargs['cost_info'].get('total_cost', 0),
            duration=kwargs.get('duration', 0),
            status_code=kwargs.get('status_code', 200),
            error_message=kwargs.get('error_message')
        )
        
        # Add policy information
        policy_result = kwargs.get('policy_result', {})
        if policy_result:
            log_entry['policy_violations'] = len(policy_result.get('violations', []))
            log_entry['policy_action'] = policy_result.get('action')
            log_entry['blocked'] = not policy_result.get('allowed', True)
        
        # Log to database
        success = await db_service.log_ai_request(log_entry)
        
        # Also print for development
        cost = kwargs['cost_info']['total_cost']
        duration = kwargs['duration']
        policy_info = f", Policy: {policy_result.get('action', 'N/A')}" if policy_result else ""
        print(f"[LOG] {kwargs['provider'].upper()} Request - Cost: ${cost:.6f}, Duration: {duration:.2f}s{policy_info}, Logged: {success}")

        return max(1, total_chars // 4)  # Rough approximation: 4 chars per token
    
    def _estimate_cost_quick(self, request_data: Dict[str, Any]) -> float:
        """Quick cost estimation for policy checks"""
        model = request_data.get("model", "gpt-3.5-turbo")
        pricing = self.PRICING.get(model, self.PRICING["gpt-3.5-turbo"])
        
        # Estimate input tokens
        estimated_input_tokens = self._estimate_tokens(request_data.get("messages", []))
        max_output_tokens = request_data.get("max_tokens", 100)
        
        # Calculate estimated cost
        input_cost = (estimated_input_tokens / 1000) * pricing["input"]
        output_cost = (max_output_tokens / 1000) * pricing["output"]
        
        return input_cost + output_cost


class AnthropicProxy(AIProviderProxy):
    """Anthropic/Claude API Proxy"""
    
    ANTHROPIC_BASE_URL = "https://api.anthropic.com/v1"
    
    # Anthropic Pricing (per 1K tokens)
    PRICING = {
        "claude-3-5-sonnet-20241022": {"input": 0.003, "output": 0.015},
        "claude-3-opus-20240229": {"input": 0.015, "output": 0.075},
        "claude-3-haiku-20240307": {"input": 0.00025, "output": 0.00125},
    }
    
    async def proxy_request(self, endpoint: str, request_data: Dict[str, Any], headers: Dict[str, str], user_id: str = None, team_id: str = None) -> Dict[str, Any]:
        """Proxy Anthropic request"""
        start_time = time.time()
        
        url = f"{self.ANTHROPIC_BASE_URL}/{endpoint}"
        
        # Anthropic has different header requirements
        proxy_headers = {
            "Content-Type": "application/json",
            "x-api-key": headers.get("x-api-key", ""),
            "anthropic-version": headers.get("anthropic-version", "2023-06-01"),
            "User-Agent": "Enterprise-AI-Proxy/1.0"
        }
        
        try:
            response = await self.client.post(
                url,
                json=request_data,
                headers=proxy_headers
            )
            
            response_data = response.json()
            end_time = time.time()
            
            # Calculate costs
            cost_info = self._calculate_cost(request_data, response_data)
            
            await self._log_request(
                provider="anthropic",
                endpoint=endpoint,
                request_data=request_data,
                response_data=response_data,
                user_id=user_id,
                team_id=team_id,
                cost_info=cost_info,
                duration=end_time - start_time,
                status_code=response.status_code
            )
            
            return {
                "success": True,
                "data": response_data,
                "status_code": response.status_code,
                "cost_info": cost_info,
                "duration": end_time - start_time
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "status_code": 500
            }
    
    def _calculate_cost(self, request_data: Dict[str, Any], response_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate cost for Anthropic request"""
        model = request_data.get("model", "claude-3-haiku-20240307")
        pricing = self.PRICING.get(model, self.PRICING["claude-3-haiku-20240307"])
        
        input_tokens = 0
        output_tokens = 0
        
        if "usage" in response_data:
            usage = response_data["usage"]
            input_tokens = usage.get("input_tokens", 0)
            output_tokens = usage.get("output_tokens", 0)
        else:
            # Estimate tokens
            input_tokens = self._estimate_tokens(request_data.get("messages", []))
        
        input_cost = (input_tokens / 1000) * pricing["input"]
        output_cost = (output_tokens / 1000) * pricing["output"]
        total_cost = input_cost + output_cost
        
        return {
            "model": model,
            "input_tokens": input_tokens,
            "output_tokens": output_tokens,
            "input_cost": round(input_cost, 6),
            "output_cost": round(output_cost, 6),
            "total_cost": round(total_cost, 6),
            "pricing": pricing
        }
    
    def _estimate_tokens(self, messages) -> int:
        """Rough token estimation"""
        total_chars = 0
        if isinstance(messages, list):
            for message in messages:
                if isinstance(message, dict) and "content" in message:
                    total_chars += len(str(message["content"]))
        return max(1, total_chars // 4)
    
    async def _log_request(self, **kwargs):
        """Log request to database"""
        from services.database_service import db_service
        from models.request_log import RequestLog
        
        log_entry = RequestLog.create_log_entry(
            provider=kwargs.get('provider'),
            endpoint=kwargs.get('endpoint'),
            user_id=kwargs.get('user_id'),
            team_id=kwargs.get('team_id'),
            model=kwargs['cost_info'].get('model'),
            input_tokens=kwargs['cost_info'].get('input_tokens', 0),
            output_tokens=kwargs['cost_info'].get('output_tokens', 0),
            total_cost=kwargs['cost_info'].get('total_cost', 0),
            duration=kwargs.get('duration', 0),
            status_code=kwargs.get('status_code', 200),
            error_message=kwargs.get('error_message')
        )
        
        # Log to database
        success = await db_service.log_ai_request(log_entry)
        
        # Also print for development
        cost = kwargs['cost_info']['total_cost']
        duration = kwargs['duration']
        print(f"[LOG] {kwargs['provider'].upper()} Request - Cost: ${cost:.6f}, Duration: {duration:.2f}s, Logged: {success}")


# Provider registry
PROVIDERS = {
    "openai": OpenAIProxy(),
    "anthropic": AnthropicProxy()
}

# Create singleton instance
ai_proxy_service = AIProxyService()
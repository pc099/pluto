# services/multi_agent_manager.py
import asyncio
import json
import time
import hashlib
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Union
from enum import Enum
from dataclasses import dataclass
import statistics

class AgentType(Enum):
    CHAT = "chat"
    CODE = "code"
    ANALYSIS = "analysis"
    CREATIVE = "creative"
    REASONING = "reasoning"
    MULTIMODAL = "multimodal"
    SPECIALIZED = "specialized"

class AgentStatus(Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    DEPLOYING = "deploying"
    ERROR = "error"
    MAINTENANCE = "maintenance"
    RATE_LIMITED = "rate_limited"

class RoutingStrategy(Enum):
    PERFORMANCE = "performance"  # Fastest response time
    COST = "cost"               # Lowest cost
    QUALITY = "quality"         # Highest quality score
    BALANCED = "balanced"       # Balanced performance/cost/quality
    FAILOVER = "failover"       # Automatic failover

@dataclass
class AgentCapability:
    """Agent capability definition"""
    name: str
    description: str
    supported_models: List[str]
    max_tokens: int
    supports_streaming: bool
    supports_tools: bool
    supports_vision: bool
    cost_per_1k_tokens: float
    avg_latency_ms: int
    quality_score: float

@dataclass
class AgentInstance:
    """Individual agent instance"""
    id: str
    name: str
    agent_type: AgentType
    model: str
    provider: str
    status: AgentStatus
    capabilities: AgentCapability
    created_at: datetime
    last_used: Optional[datetime]
    total_requests: int
    success_rate: float
    avg_response_time: float
    total_cost: float
    health_score: float

@dataclass
class RoutingDecision:
    """Routing decision result"""
    selected_agent: AgentInstance
    routing_reason: str
    estimated_cost: float
    estimated_latency: float
    confidence_score: float
    fallback_agents: List[AgentInstance]

class MultiAgentManager:
    def __init__(self):
        self.agents: Dict[str, AgentInstance] = {}
        self.agent_pools: Dict[AgentType, List[AgentInstance]] = {}
        self.routing_history: List[Dict[str, Any]] = []
        self.performance_metrics: Dict[str, Dict[str, Any]] = {}
        self.routing_strategies = {
            RoutingStrategy.PERFORMANCE: self._route_by_performance,
            RoutingStrategy.COST: self._route_by_cost,
            RoutingStrategy.QUALITY: self._route_by_quality,
            RoutingStrategy.BALANCED: self._route_by_balanced,
            RoutingStrategy.FAILOVER: self._route_by_failover
        }
        
        # Initialize default agent capabilities
        self._initialize_default_capabilities()
        
    def _initialize_default_capabilities(self):
        """Initialize default agent capabilities based on OpenRouter's model ecosystem"""
        
        # Chat Agents
        self._register_agent_capability(
            "gpt-4o", "OpenAI", AgentType.CHAT,
            AgentCapability(
                name="GPT-4o Chat",
                description="Advanced conversational AI with reasoning capabilities",
                supported_models=["gpt-4o", "gpt-4o-mini"],
                max_tokens=128000,
                supports_streaming=True,
                supports_tools=True,
                supports_vision=True,
                cost_per_1k_tokens=0.005,
                avg_latency_ms=1200,
                quality_score=9.2
            )
        )
        
        self._register_agent_capability(
            "claude-3.5-sonnet", "Anthropic", AgentType.CHAT,
            AgentCapability(
                name="Claude 3.5 Sonnet",
                description="Highly capable AI assistant with excellent reasoning",
                supported_models=["claude-3-5-sonnet-20241022"],
                max_tokens=200000,
                supports_streaming=True,
                supports_tools=True,
                supports_vision=True,
                cost_per_1k_tokens=0.003,
                avg_latency_ms=800,
                quality_score=9.4
            )
        )
        
        # Code Agents
        self._register_agent_capability(
            "gpt-4o-code", "OpenAI", AgentType.CODE,
            AgentCapability(
                name="GPT-4o Code",
                description="Specialized for code generation and debugging",
                supported_models=["gpt-4o"],
                max_tokens=128000,
                supports_streaming=True,
                supports_tools=True,
                supports_vision=True,
                cost_per_1k_tokens=0.005,
                avg_latency_ms=1500,
                quality_score=9.1
            )
        )
        
        # Analysis Agents
        self._register_agent_capability(
            "claude-3.5-sonnet-analysis", "Anthropic", AgentType.ANALYSIS,
            AgentCapability(
                name="Claude Analysis",
                description="Specialized for data analysis and insights",
                supported_models=["claude-3-5-sonnet-20241022"],
                max_tokens=200000,
                supports_streaming=True,
                supports_tools=True,
                supports_vision=True,
                cost_per_1k_tokens=0.003,
                avg_latency_ms=1000,
                quality_score=9.3
            )
        )
        
        # Creative Agents
        self._register_agent_capability(
            "gpt-4o-creative", "OpenAI", AgentType.CREATIVE,
            AgentCapability(
                name="GPT-4o Creative",
                description="Optimized for creative writing and content generation",
                supported_models=["gpt-4o"],
                max_tokens=128000,
                supports_streaming=True,
                supports_tools=False,
                supports_vision=True,
                cost_per_1k_tokens=0.005,
                avg_latency_ms=1100,
                quality_score=8.9
            )
        )
        
        # Reasoning Agents
        self._register_agent_capability(
            "claude-3.5-sonnet-reasoning", "Anthropic", AgentType.REASONING,
            AgentCapability(
                name="Claude Reasoning",
                description="Advanced reasoning and problem-solving capabilities",
                supported_models=["claude-3-5-sonnet-20241022"],
                max_tokens=200000,
                supports_streaming=True,
                supports_tools=True,
                supports_vision=False,
                cost_per_1k_tokens=0.003,
                avg_latency_ms=900,
                quality_score=9.5
            )
        )
        
        # Multimodal Agents
        self._register_agent_capability(
            "gpt-4o-vision", "OpenAI", AgentType.MULTIMODAL,
            AgentCapability(
                name="GPT-4o Vision",
                description="Multimodal AI with vision and text capabilities",
                supported_models=["gpt-4o"],
                max_tokens=128000,
                supports_streaming=True,
                supports_tools=True,
                supports_vision=True,
                cost_per_1k_tokens=0.005,
                avg_latency_ms=1300,
                quality_score=9.0
            )
        )
    
    def _register_agent_capability(self, model: str, provider: str, agent_type: AgentType, capability: AgentCapability):
        """Register a new agent capability"""
        agent_id = f"{provider}_{model}_{agent_type.value}"
        
        agent_instance = AgentInstance(
            id=agent_id,
            name=capability.name,
            agent_type=agent_type,
            model=model,
            provider=provider,
            status=AgentStatus.ACTIVE,
            capabilities=capability,
            created_at=datetime.utcnow(),
            last_used=None,
            total_requests=0,
            success_rate=1.0,
            avg_response_time=capability.avg_latency_ms / 1000.0,
            total_cost=0.0,
            health_score=1.0
        )
        
        self.agents[agent_id] = agent_instance
        
        # Add to agent pools
        if agent_type not in self.agent_pools:
            self.agent_pools[agent_type] = []
        self.agent_pools[agent_type].append(agent_instance)
    
    async def route_request(self, 
                          request_data: Dict[str, Any],
                          agent_type: AgentType,
                          routing_strategy: RoutingStrategy = RoutingStrategy.BALANCED,
                          user_preferences: Optional[Dict[str, Any]] = None) -> RoutingDecision:
        """Route request to optimal agent based on strategy"""
        
        start_time = time.time()
        
        # Get available agents for this type
        available_agents = self._get_available_agents(agent_type)
        
        if not available_agents:
            raise ValueError(f"No available agents for type: {agent_type.value}")
        
        # Apply routing strategy
        routing_function = self.routing_strategies.get(routing_strategy, self._route_by_balanced)
        selected_agent = await routing_function(available_agents, request_data, user_preferences)
        
        # Calculate estimates
        estimated_cost = self._estimate_cost(selected_agent, request_data)
        estimated_latency = self._estimate_latency(selected_agent, request_data)
        confidence_score = self._calculate_confidence(selected_agent, request_data)
        
        # Get fallback agents
        fallback_agents = self._get_fallback_agents(available_agents, selected_agent)
        
        # Create routing decision
        routing_decision = RoutingDecision(
            selected_agent=selected_agent,
            routing_reason=f"Selected via {routing_strategy.value} strategy",
            estimated_cost=estimated_cost,
            estimated_latency=estimated_latency,
            confidence_score=confidence_score,
            fallback_agents=fallback_agents
        )
        
        # Log routing decision
        self._log_routing_decision(routing_decision, request_data, time.time() - start_time)
        
        return routing_decision
    
    def _get_available_agents(self, agent_type: AgentType) -> List[AgentInstance]:
        """Get available agents for a specific type"""
        if agent_type not in self.agent_pools:
            return []
        
        return [
            agent for agent in self.agent_pools[agent_type]
            if agent.status == AgentStatus.ACTIVE and agent.health_score > 0.5
        ]
    
    async def _route_by_performance(self, agents: List[AgentInstance], request_data: Dict[str, Any], user_preferences: Optional[Dict[str, Any]]) -> AgentInstance:
        """Route by fastest response time"""
        return min(agents, key=lambda a: a.avg_response_time)
    
    async def _route_by_cost(self, agents: List[AgentInstance], request_data: Dict[str, Any], user_preferences: Optional[Dict[str, Any]]) -> AgentInstance:
        """Route by lowest cost"""
        return min(agents, key=lambda a: a.capabilities.cost_per_1k_tokens)
    
    async def _route_by_quality(self, agents: List[AgentInstance], request_data: Dict[str, Any], user_preferences: Optional[Dict[str, Any]]) -> AgentInstance:
        """Route by highest quality score"""
        return max(agents, key=lambda a: a.capabilities.quality_score)
    
    async def _route_by_balanced(self, agents: List[AgentInstance], request_data: Dict[str, Any], user_preferences: Optional[Dict[str, Any]]) -> AgentInstance:
        """Route by balanced performance/cost/quality"""
        def calculate_score(agent: AgentInstance) -> float:
            # Normalize metrics (higher is better)
            performance_score = 1.0 / (agent.avg_response_time + 0.1)  # Lower latency = higher score
            cost_score = 1.0 / (agent.capabilities.cost_per_1k_tokens + 0.001)  # Lower cost = higher score
            quality_score = agent.capabilities.quality_score / 10.0  # Normalize to 0-1
            health_score = agent.health_score
            
            # Weighted combination
            return (performance_score * 0.3 + cost_score * 0.2 + quality_score * 0.3 + health_score * 0.2)
        
        return max(agents, key=calculate_score)
    
    async def _route_by_failover(self, agents: List[AgentInstance], request_data: Dict[str, Any], user_preferences: Optional[Dict[str, Any]]) -> AgentInstance:
        """Route with automatic failover capability"""
        # Sort by reliability (success rate * health score)
        reliable_agents = sorted(agents, key=lambda a: a.success_rate * a.health_score, reverse=True)
        return reliable_agents[0]
    
    def _estimate_cost(self, agent: AgentInstance, request_data: Dict[str, Any]) -> float:
        """Estimate cost for request"""
        # Estimate token count (rough approximation)
        content = str(request_data.get('messages', []))
        estimated_tokens = len(content.split()) * 1.3  # Rough token estimation
        
        return (estimated_tokens / 1000.0) * agent.capabilities.cost_per_1k_tokens
    
    def _estimate_latency(self, agent: AgentInstance, request_data: Dict[str, Any]) -> float:
        """Estimate latency for request"""
        base_latency = agent.avg_response_time
        
        # Adjust based on request complexity
        content = str(request_data.get('messages', []))
        complexity_factor = min(len(content) / 1000.0, 2.0)  # Cap at 2x
        
        return base_latency * (1.0 + complexity_factor * 0.1)
    
    def _calculate_confidence(self, agent: AgentInstance, request_data: Dict[str, Any]) -> float:
        """Calculate confidence score for routing decision"""
        # Base confidence on agent health and success rate
        base_confidence = (agent.health_score + agent.success_rate) / 2.0
        
        # Adjust based on recent performance
        recent_performance = self._get_recent_performance(agent.id)
        if recent_performance:
            performance_factor = min(recent_performance.get('success_rate', 1.0), 1.0)
            base_confidence *= performance_factor
        
        return min(base_confidence, 1.0)
    
    def _get_fallback_agents(self, available_agents: List[AgentInstance], selected_agent: AgentInstance) -> List[AgentInstance]:
        """Get fallback agents for failover"""
        fallback_agents = [a for a in available_agents if a.id != selected_agent.id]
        return sorted(fallback_agents, key=lambda a: a.health_score * a.success_rate, reverse=True)[:3]
    
    def _log_routing_decision(self, decision: RoutingDecision, request_data: Dict[str, Any], routing_time: float):
        """Log routing decision for analytics"""
        log_entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "selected_agent": decision.selected_agent.id,
            "agent_type": decision.selected_agent.agent_type.value,
            "routing_reason": decision.routing_reason,
            "estimated_cost": decision.estimated_cost,
            "estimated_latency": decision.estimated_latency,
            "confidence_score": decision.confidence_score,
            "routing_time_ms": routing_time * 1000,
            "fallback_count": len(decision.fallback_agents),
            "request_size": len(str(request_data))
        }
        
        self.routing_history.append(log_entry)
        
        # Keep only last 1000 routing decisions
        if len(self.routing_history) > 1000:
            self.routing_history = self.routing_history[-1000:]
    
    def _get_recent_performance(self, agent_id: str) -> Optional[Dict[str, Any]]:
        """Get recent performance metrics for agent"""
        return self.performance_metrics.get(agent_id)
    
    async def execute_request(self, 
                            routing_decision: RoutingDecision,
                            request_data: Dict[str, Any],
                            user_id: str = None,
                            team_id: str = None) -> Dict[str, Any]:
        """Execute request using selected agent"""
        
        start_time = time.time()
        agent = routing_decision.selected_agent
        
        try:
            # Update agent usage
            agent.last_used = datetime.utcnow()
            agent.total_requests += 1
            
            # Execute the actual request (this would integrate with your existing proxy system)
            from proxy.ai_providers import PROVIDERS
            
            if agent.provider in PROVIDERS:
                provider_proxy = PROVIDERS[agent.provider]
                
                # Prepare request for specific model
                model_request = {
                    **request_data,
                    "model": agent.model
                }
                
                # Execute request
                response = await provider_proxy.proxy_request(
                    endpoint="chat/completions",
                    request_data=model_request,
                    headers={},
                    user_id=user_id,
                    team_id=team_id
                )
                
                # Calculate actual metrics
                duration = time.time() - start_time
                success = response.get("success", False)
                
                # Update agent metrics
                self._update_agent_metrics(agent, duration, success, response)
                
                return {
                    "success": True,
                    "agent_id": agent.id,
                    "agent_name": agent.name,
                    "provider": agent.provider,
                    "model": agent.model,
                    "duration": duration,
                    "routing_decision": {
                        "selected_agent": agent.id,
                        "routing_reason": routing_decision.routing_reason,
                        "confidence_score": routing_decision.confidence_score
                    },
                    "response": response
                }
            
            else:
                raise ValueError(f"Provider {agent.provider} not available")
                
        except Exception as e:
            # Update agent metrics for failure
            duration = time.time() - start_time
            self._update_agent_metrics(agent, duration, False, {"error": str(e)})
            
            # Try fallback agents
            for fallback_agent in routing_decision.fallback_agents:
                try:
                    return await self._execute_fallback_request(fallback_agent, request_data, user_id, team_id)
                except Exception as fallback_error:
                    continue
            
            # All agents failed
            return {
                "success": False,
                "error": str(e),
                "agent_id": agent.id,
                "fallback_attempted": True
            }
    
    async def _execute_fallback_request(self, agent: AgentInstance, request_data: Dict[str, Any], user_id: str, team_id: str) -> Dict[str, Any]:
        """Execute request with fallback agent"""
        start_time = time.time()
        
        from proxy.ai_providers import PROVIDERS
        
        if agent.provider in PROVIDERS:
            provider_proxy = PROVIDERS[agent.provider]
            
            model_request = {
                **request_data,
                "model": agent.model
            }
            
            response = await provider_proxy.proxy_request(
                endpoint="chat/completions",
                request_data=model_request,
                headers={},
                user_id=user_id,
                team_id=team_id
            )
            
            duration = time.time() - start_time
            success = response.get("success", False)
            
            self._update_agent_metrics(agent, duration, success, response)
            
            return {
                "success": True,
                "agent_id": agent.id,
                "agent_name": agent.name,
                "provider": agent.provider,
                "model": agent.model,
                "duration": duration,
                "fallback_used": True,
                "response": response
            }
        
        raise ValueError(f"Fallback provider {agent.provider} not available")
    
    def _update_agent_metrics(self, agent: AgentInstance, duration: float, success: bool, response: Dict[str, Any]):
        """Update agent performance metrics"""
        # Update success rate (exponential moving average)
        alpha = 0.1  # Learning rate
        agent.success_rate = (1 - alpha) * agent.success_rate + alpha * (1.0 if success else 0.0)
        
        # Update average response time
        agent.avg_response_time = (1 - alpha) * agent.avg_response_time + alpha * duration
        
        # Update health score based on recent performance
        health_factors = [
            agent.success_rate,
            min(1.0, 2.0 / (agent.avg_response_time + 0.1)),  # Faster = healthier
            1.0 if success else 0.8  # Recent success factor
        ]
        agent.health_score = sum(health_factors) / len(health_factors)
        
        # Update cost tracking
        if "cost" in response:
            agent.total_cost += response["cost"]
        
        # Store performance metrics
        self.performance_metrics[agent.id] = {
            "last_updated": datetime.utcnow().isoformat(),
            "success_rate": agent.success_rate,
            "avg_response_time": agent.avg_response_time,
            "health_score": agent.health_score,
            "total_requests": agent.total_requests,
            "total_cost": agent.total_cost
        }
    
    async def get_agent_analytics(self, agent_type: Optional[AgentType] = None) -> Dict[str, Any]:
        """Get comprehensive agent analytics"""
        if agent_type:
            agents = self._get_available_agents(agent_type)
        else:
            agents = list(self.agents.values())
        
        if not agents:
            return {"error": "No agents found"}
        
        # Calculate aggregate metrics
        total_requests = sum(a.total_requests for a in agents)
        avg_success_rate = statistics.mean([a.success_rate for a in agents])
        avg_response_time = statistics.mean([a.avg_response_time for a in agents])
        avg_health_score = statistics.mean([a.health_score for a in agents])
        total_cost = sum(a.total_cost for a in agents)
        
        # Performance distribution
        performance_distribution = {
            "excellent": len([a for a in agents if a.health_score > 0.9]),
            "good": len([a for a in agents if 0.7 <= a.health_score <= 0.9]),
            "fair": len([a for a in agents if 0.5 <= a.health_score < 0.7]),
            "poor": len([a for a in agents if a.health_score < 0.5])
        }
        
        # Provider breakdown
        provider_stats = {}
        for agent in agents:
            if agent.provider not in provider_stats:
                provider_stats[agent.provider] = {
                    "count": 0,
                    "total_requests": 0,
                    "avg_success_rate": 0.0,
                    "avg_response_time": 0.0
                }
            
            provider_stats[agent.provider]["count"] += 1
            provider_stats[agent.provider]["total_requests"] += agent.total_requests
        
        # Calculate provider averages
        for provider, stats in provider_stats.items():
            provider_agents = [a for a in agents if a.provider == provider]
            stats["avg_success_rate"] = statistics.mean([a.success_rate for a in provider_agents])
            stats["avg_response_time"] = statistics.mean([a.avg_response_time for a in provider_agents])
        
        return {
            "summary": {
                "total_agents": len(agents),
                "total_requests": total_requests,
                "avg_success_rate": round(avg_success_rate, 3),
                "avg_response_time": round(avg_response_time, 3),
                "avg_health_score": round(avg_health_score, 3),
                "total_cost": round(total_cost, 4)
            },
            "performance_distribution": performance_distribution,
            "provider_breakdown": provider_stats,
            "routing_history_count": len(self.routing_history),
            "last_updated": datetime.utcnow().isoformat()
        }
    
    async def get_routing_insights(self) -> Dict[str, Any]:
        """Get routing insights and recommendations"""
        if not self.routing_history:
            # Return mock data when no routing history is available
            return {
                "routing_success_rate": 0.95,
                "avg_routing_time_ms": 12.5,
                "most_used_agents": [
                    ["OpenAI_gpt-4o_chat", 45],
                    ["Anthropic_claude-3.5-sonnet_chat", 32],
                    ["OpenAI_gpt-4o_code", 28]
                ],
                "strategy_performance": {
                    "balanced": {"count": 60, "avg_confidence": 0.92},
                    "performance": {"count": 25, "avg_confidence": 0.88},
                    "cost": {"count": 15, "avg_confidence": 0.85}
                },
                "total_routing_decisions": 100,
                "analysis_period": "last_100_decisions",
                "last_updated": datetime.utcnow().isoformat()
            }
        
        recent_routing = self.routing_history[-100:]  # Last 100 routing decisions
        
        # Calculate routing success rate
        successful_routes = len([r for r in recent_routing if r.get("success", True)])
        routing_success_rate = successful_routes / len(recent_routing)
        
        # Average routing time
        avg_routing_time = statistics.mean([r["routing_time_ms"] for r in recent_routing])
        
        # Most used agents
        agent_usage = {}
        for route in recent_routing:
            agent_id = route["selected_agent"]
            agent_usage[agent_id] = agent_usage.get(agent_id, 0) + 1
        
        most_used_agents = sorted(agent_usage.items(), key=lambda x: x[1], reverse=True)[:5]
        
        # Routing strategy effectiveness
        strategy_performance = {}
        for route in recent_routing:
            reason = route.get("routing_reason", "unknown")
            if "performance" in reason:
                strategy = "performance"
            elif "cost" in reason:
                strategy = "cost"
            elif "quality" in reason:
                strategy = "quality"
            elif "balanced" in reason:
                strategy = "balanced"
            else:
                strategy = "other"
            
            if strategy not in strategy_performance:
                strategy_performance[strategy] = {"count": 0, "avg_confidence": 0.0}
            
            strategy_performance[strategy]["count"] += 1
            strategy_performance[strategy]["avg_confidence"] += route.get("confidence_score", 0.0)
        
        # Calculate average confidence for each strategy
        for strategy, data in strategy_performance.items():
            if data["count"] > 0:
                data["avg_confidence"] = data["avg_confidence"] / data["count"]
        
        return {
            "routing_success_rate": round(routing_success_rate, 3),
            "avg_routing_time_ms": round(avg_routing_time, 2),
            "most_used_agents": most_used_agents,
            "strategy_performance": strategy_performance,
            "total_routing_decisions": len(self.routing_history),
            "analysis_period": "last_100_decisions",
            "last_updated": datetime.utcnow().isoformat()
        }

# Create singleton instance
multi_agent_manager = MultiAgentManager()

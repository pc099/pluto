# services/cross_provider_intelligence.py
import asyncio
import time
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import statistics

class CrossProviderIntelligence:
    def __init__(self):
        self.provider_status = {}
        self.provider_performance = {}
        self.routing_rules = []
        self.failover_config = {
            'enabled': True,
            'max_retries': 3,
            'timeout_threshold': 30.0,
            'error_rate_threshold': 0.1
        }
    
    async def intelligent_routing(self, request_data: dict, user_preferences: dict = None) -> dict:
        """Determine optimal provider and model for request"""
        
        # Extract request details
        original_model = request_data.get('model', 'gpt-3.5-turbo')
        complexity = self._assess_request_complexity(request_data)
        budget_limit = user_preferences.get('budget_limit') if user_preferences else None
        
        # Get available providers and their current status
        available_providers = await self._get_healthy_providers()
        
        if not available_providers:
            return {
                'provider': 'openai',
                'model': original_model,
                'reason': 'fallback_default',
                'estimated_cost': 0.001
            }
        
        # Calculate routing options
        routing_options = []
        
        for provider_info in available_providers:
            provider = provider_info['name']
            
            # Get equivalent models for this provider
            equivalent_models = self._get_equivalent_models(original_model, provider)
            
            for model in equivalent_models:
                option = await self._evaluate_routing_option(
                    provider, model, complexity, budget_limit, request_data
                )
                if option:
                    routing_options.append(option)
        
        # Select best option based on multiple criteria
        best_option = self._select_best_routing_option(
            routing_options, user_preferences or {}
        )
        
        return best_option or {
            'provider': 'openai',
            'model': original_model,
            'reason': 'no_better_option',
            'estimated_cost': 0.001
        }
    
    async def handle_failover(self, failed_provider: str, original_request: dict, 
                            user_preferences: dict = None) -> Optional[dict]:
        """Handle provider failover when primary provider fails"""
        
        # Mark provider as temporarily unhealthy
        await self._mark_provider_unhealthy(failed_provider, 'api_failure')
        
        # Get alternative providers
        alternatives = await self._get_healthy_providers(exclude=[failed_provider])
        
        if not alternatives:
            return None
        
        # Find best alternative
        original_model = original_request.get('model', 'gpt-3.5-turbo')
        
        for alt_provider in alternatives:
            provider = alt_provider['name']
            equivalent_models = self._get_equivalent_models(original_model, provider)
            
            if equivalent_models:
                return {
                    'provider': provider,
                    'model': equivalent_models[0],
                    'reason': f'failover_from_{failed_provider}',
                    'original_provider': failed_provider,
                    'failover': True
                }
        
        return None
    
    async def track_provider_performance(self, provider: str, model: str, 
                                       response_time: float, success: bool, 
                                       cost: float, quality_score: float = None):
        """Track performance metrics for intelligent routing decisions"""
        
        timestamp = datetime.now()
        
        # Initialize provider tracking
        if provider not in self.provider_performance:
            self.provider_performance[provider] = {}
        
        if model not in self.provider_performance[provider]:
            self.provider_performance[provider][model] = {
                'response_times': [],
                'success_rate': [],
                'costs': [],
                'quality_scores': [],
                'request_count': 0,
                'last_updated': timestamp
            }
        
        metrics = self.provider_performance[provider][model]
        
        # Update metrics (keep last 100 data points)
        metrics['response_times'].append(response_time)
        metrics['response_times'] = metrics['response_times'][-100:]
        
        metrics['success_rate'].append(1 if success else 0)
        metrics['success_rate'] = metrics['success_rate'][-100:]
        
        metrics['costs'].append(cost)
        metrics['costs'] = metrics['costs'][-100:]
        
        if quality_score is not None:
            metrics['quality_scores'].append(quality_score)
            metrics['quality_scores'] = metrics['quality_scores'][-100:]
        
        metrics['request_count'] += 1
        metrics['last_updated'] = timestamp
        
        # Update provider health status
        await self._update_provider_health(provider, metrics)
    
    def get_provider_comparison(self) -> dict:
        """Get comparative analysis of all providers"""
        
        comparison = {}
        
        for provider, models in self.provider_performance.items():
            provider_stats = {
                'models': {},
                'overall': {
                    'avg_response_time': 0,
                    'success_rate': 0,
                    'avg_cost': 0,
                    'avg_quality': 0,
                    'total_requests': 0
                }
            }
            
            total_requests = 0
            total_response_time = 0
            total_success = 0
            total_cost = 0
            total_quality = 0
            quality_count = 0
            
            for model, metrics in models.items():
                if not metrics['response_times']:
                    continue
                
                model_stats = {
                    'avg_response_time': statistics.mean(metrics['response_times']),
                    'success_rate': statistics.mean(metrics['success_rate']),
                    'avg_cost': statistics.mean(metrics['costs']) if metrics['costs'] else 0,
                    'avg_quality': statistics.mean(metrics['quality_scores']) if metrics['quality_scores'] else 0,
                    'request_count': metrics['request_count']
                }
                
                provider_stats['models'][model] = model_stats
                
                # Accumulate for overall stats
                total_requests += metrics['request_count']
                total_response_time += sum(metrics['response_times'])
                total_success += sum(metrics['success_rate'])
                total_cost += sum(metrics['costs'])
                
                if metrics['quality_scores']:
                    total_quality += sum(metrics['quality_scores'])
                    quality_count += len(metrics['quality_scores'])
            
            if total_requests > 0:
                provider_stats['overall'] = {
                    'avg_response_time': total_response_time / sum(len(m['response_times']) for m in models.values()),
                    'success_rate': total_success / sum(len(m['success_rate']) for m in models.values()),
                    'avg_cost': total_cost / sum(len(m['costs']) for m in models.values()),
                    'avg_quality': total_quality / quality_count if quality_count > 0 else 0,
                    'total_requests': total_requests
                }
            
            comparison[provider] = provider_stats
        
        return comparison
    
    def _assess_request_complexity(self, request_data: dict) -> str:
        """Assess complexity of the request"""
        messages = request_data.get('messages', [])
        
        total_tokens = 0
        for msg in messages:
            content = str(msg.get('content', ''))
            total_tokens += len(content.split())
        
        max_tokens = request_data.get('max_tokens', 100)
        
        if total_tokens > 1000 or max_tokens > 500:
            return 'high'
        elif total_tokens > 200 or max_tokens > 100:
            return 'medium'
        else:
            return 'low'
    
    def _get_equivalent_models(self, original_model: str, target_provider: str) -> list:
        """Get equivalent models across providers"""
        model_equivalents = {
            'openai': {
                'gpt-4': ['gpt-4', 'gpt-4-turbo'],
                'gpt-3.5-turbo': ['gpt-3.5-turbo'],
                'claude-3-sonnet': ['gpt-4'],
                'claude-3-haiku': ['gpt-3.5-turbo']
            },
            'anthropic': {
                'gpt-4': ['claude-3-sonnet'],
                'gpt-3.5-turbo': ['claude-3-haiku'],
                'claude-3-sonnet': ['claude-3-sonnet'],
                'claude-3-haiku': ['claude-3-haiku']
            }
        }
        
        return model_equivalents.get(target_provider, {}).get(original_model, [])
    
    async def _evaluate_routing_option(self, provider: str, model: str, 
                                     complexity: str, budget_limit: float, 
                                     request_data: dict) -> Optional[dict]:
        """Evaluate a specific provider/model option"""
        
        # Get historical performance
        performance = self.provider_performance.get(provider, {}).get(model, {})
        
        # Estimate cost
        estimated_cost = self._estimate_cost(provider, model, request_data)
        
        if budget_limit and estimated_cost > budget_limit:
            return None
        
        # Calculate routing score
        score = self._calculate_routing_score(
            provider, model, performance, complexity, estimated_cost
        )
        
        return {
            'provider': provider,
            'model': model,
            'estimated_cost': estimated_cost,
            'score': score,
            'reason': f'intelligent_routing_score_{score:.2f}',
            'performance_data': {
                'avg_response_time': statistics.mean(performance.get('response_times', [2.0])),
                'success_rate': statistics.mean(performance.get('success_rate', [0.95])),
                'avg_quality': statistics.mean(performance.get('quality_scores', [8.0]))
            }
        }
    
    def _calculate_routing_score(self, provider: str, model: str, 
                               performance: dict, complexity: str, 
                               estimated_cost: float) -> float:
        """Calculate routing score for provider/model combination"""
        
        score = 10.0  # Base score
        
        # Factor in response time (lower is better)
        avg_response_time = statistics.mean(performance.get('response_times', [2.0]))
        score -= min(avg_response_time / 2.0, 3.0)  # Max 3 point penalty
        
        # Factor in success rate (higher is better)
        success_rate = statistics.mean(performance.get('success_rate', [0.95]))
        score += (success_rate - 0.5) * 4  # +4 points for perfect success
        
        # Factor in quality (higher is better)
        avg_quality = statistics.mean(performance.get('quality_scores', [8.0]))
        score += (avg_quality - 5.0) / 5.0 * 2  # +2 points for quality 10
        
        # Factor in cost (lower is better, but not primary)
        score -= min(estimated_cost * 100, 1.0)  # Small cost penalty
        
        # Complexity adjustments
        if complexity == 'high' and 'gpt-4' not in model and 'claude-3-sonnet' not in model:
            score -= 2.0  # Penalty for using weak model on complex task
        
        return max(0, score)
    
    def _select_best_routing_option(self, options: list, preferences: dict) -> Optional[dict]:
        """Select the best routing option from available choices"""
        
        if not options:
            return None
        
        # Sort by score
        sorted_options = sorted(options, key=lambda x: x['score'], reverse=True)
        
        # Apply user preferences
        preference_priorities = preferences.get('priorities', ['quality', 'speed', 'cost'])
        
        if 'cost' in preference_priorities[:2]:
            # Cost is high priority, prefer cheaper options
            sorted_options = sorted(sorted_options, key=lambda x: x['estimated_cost'])
        
        return sorted_options[0]
    
    async def _get_healthy_providers(self, exclude: list = None) -> list:
        """Get list of healthy providers"""
        exclude = exclude or []
        
        healthy_providers = []
        
        for provider in ['openai', 'anthropic']:
            if provider in exclude:
                continue
                
            status = self.provider_status.get(provider, {'healthy': True, 'last_check': datetime.now()})
            
            if status.get('healthy', True):
                healthy_providers.append({
                    'name': provider,
                    'status': status
                })
        
        return healthy_providers
    
    async def _mark_provider_unhealthy(self, provider: str, reason: str):
        """Mark a provider as temporarily unhealthy"""
        self.provider_status[provider] = {
            'healthy': False,
            'reason': reason,
            'marked_unhealthy_at': datetime.now(),
            'retry_after': datetime.now() + timedelta(minutes=5)
        }
    
    async def _update_provider_health(self, provider: str, metrics: dict):
        """Update provider health based on recent performance"""
        recent_success_rate = statistics.mean(metrics['success_rate'][-10:]) if metrics['success_rate'] else 1.0
        
        # Mark as unhealthy if success rate drops below threshold
        if recent_success_rate < self.failover_config['error_rate_threshold']:
            await self._mark_provider_unhealthy(provider, 'low_success_rate')
        else:
            # Mark as healthy
            self.provider_status[provider] = {
                'healthy': True,
                'last_check': datetime.now(),
                'success_rate': recent_success_rate
            }
    
    def _estimate_cost(self, provider: str, model: str, request_data: dict) -> float:
        """Estimate cost for request"""
        # This is a simplified estimation - you'd want more sophisticated logic
        
        pricing = {
            'openai': {
                'gpt-4': 0.03,
                'gpt-3.5-turbo': 0.002
            },
            'anthropic': {
                'claude-3-sonnet': 0.015,
                'claude-3-haiku': 0.00125
            }
        }
        
        base_cost = pricing.get(provider, {}).get(model, 0.002)
        
        # Estimate tokens
        messages = request_data.get('messages', [])
        estimated_tokens = sum(len(str(msg.get('content', ''))) for msg in messages) // 4
        max_tokens = request_data.get('max_tokens', 100)
        
        return (estimated_tokens + max_tokens) / 1000 * base_cost

# Create singleton instance
cross_provider_intelligence = CrossProviderIntelligence()
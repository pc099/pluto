"""
ML-Based Routing Engine
Intelligent routing decisions based on request features and historical performance
"""

import numpy as np
from typing import Dict, Any, List, Optional
from services.feature_extractor import feature_extractor


class MLRoutingEngine:
    """
    ML-based routing engine for intelligent provider/model selection
    
    Uses rule-based ML until enough training data is collected
    """
    
    def __init__(self):
        self.feature_extractor = feature_extractor
        self.providers = ['openai', 'anthropic']
        self.models = {
            'openai': ['gpt-4', 'gpt-3.5-turbo', 'gpt-4-turbo'],
            'anthropic': ['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307']
        }
    
    async def route_request(
        self,
        request: Dict,
        user_id: str,
        strategy: str = 'balanced',
        context: Dict = None
    ) -> Dict[str, Any]:
        """
        Route request using ML-based decision making
        
        Args:
            request: The AI request
            user_id: User making the request
            strategy: 'cost', 'quality', 'speed', or 'balanced'
            context: Additional context (budget, quality requirements, etc.)
        
        Returns:
            Routing decision with provider, model, and predictions
        """
        
        context = context or {}
        
        # Extract features
        features = await self.feature_extractor.extract_request_features(
            request, user_id, context
        )
        
        # Get predictions for all provider/model combinations
        predictions = await self._predict_all_options(features, user_id)
        
        # Select best option based on strategy
        routing_decision = self._select_best_option(predictions, strategy, features)
        
        # Add metadata
        routing_decision['features'] = features
        routing_decision['strategy'] = strategy
        routing_decision['ml_version'] = 'rule_based_v1'
        
        return routing_decision
    
    async def _predict_all_options(
        self, 
        features: Dict[str, float],
        user_id: str
    ) -> List[Dict[str, Any]]:
        """
        Predict cost, quality, and latency for all provider/model options
        """
        
        predictions = []
        
        for provider in self.providers:
            for model in self.models[provider]:
                prediction = await self._predict_for_model(
                    provider, model, features, user_id
                )
                predictions.append(prediction)
        
        return predictions
    
    async def _predict_for_model(
        self,
        provider: str,
        model: str,
        features: Dict[str, float],
        user_id: str
    ) -> Dict[str, Any]:
        """
        Predict performance metrics for a specific provider/model
        """
        
        # Base costs per 1K tokens (approximate)
        base_costs = {
            'gpt-4': 0.03,
            'gpt-4-turbo': 0.01,
            'gpt-3.5-turbo': 0.002,
            'claude-3-opus-20240229': 0.015,
            'claude-3-sonnet-20240229': 0.003,
            'claude-3-haiku-20240307': 0.00025
        }
        
        # Base quality scores (0-10)
        base_quality = {
            'gpt-4': 9.2,
            'gpt-4-turbo': 9.0,
            'gpt-3.5-turbo': 7.5,
            'claude-3-opus-20240229': 9.0,
            'claude-3-sonnet-20240229': 8.5,
            'claude-3-haiku-20240307': 7.8
        }
        
        # Base latency in milliseconds
        base_latency = {
            'gpt-4': 2500,
            'gpt-4-turbo': 2000,
            'gpt-3.5-turbo': 1000,
            'claude-3-opus-20240229': 3000,
            'claude-3-sonnet-20240229': 2000,
            'claude-3-haiku-20240307': 800
        }
        
        # Estimate tokens based on request length
        estimated_tokens = features['request_length'] * 10000  # Denormalize
        estimated_tokens = max(100, estimated_tokens)  # Minimum 100 tokens
        
        # Predict cost
        base_cost = base_costs.get(model, 0.01)
        predicted_cost = (estimated_tokens / 1000) * base_cost
        
        # Adjust cost based on complexity
        complexity_multiplier = 1.0 + (features['complexity_score'] * 0.5)
        predicted_cost *= complexity_multiplier
        
        # Predict quality
        predicted_quality = base_quality.get(model, 7.5)
        
        # Adjust quality based on task match
        if features['has_code'] > 0.5 and 'gpt-4' in model:
            predicted_quality += 0.5  # GPT-4 is better at code
        
        if features['has_math'] > 0.5 and 'gpt-4' in model:
            predicted_quality += 0.3  # GPT-4 is better at math
        
        if features['question_type'] > 0.7 and 'claude' in model:
            predicted_quality += 0.3  # Claude is better at creative tasks
        
        # Cap quality at 10
        predicted_quality = min(10.0, predicted_quality)
        
        # Predict latency
        predicted_latency = base_latency.get(model, 1500)
        
        # Adjust latency based on request length
        length_multiplier = 1.0 + (features['request_length'] * 2.0)
        predicted_latency *= length_multiplier
        
        # Adjust based on historical user performance
        if provider == 'openai':
            historical_quality = features.get('openai_avg_quality', 0.75) * 10
            historical_latency = features.get('openai_avg_latency', 0.3) * 5000
        else:
            historical_quality = features.get('anthropic_avg_quality', 0.75) * 10
            historical_latency = features.get('anthropic_avg_latency', 0.4) * 5000
        
        # Blend predictions with historical data
        if historical_quality > 0:
            predicted_quality = 0.7 * predicted_quality + 0.3 * historical_quality
        
        if historical_latency > 0:
            predicted_latency = 0.7 * predicted_latency + 0.3 * historical_latency
        
        # Calculate confidence based on historical data availability
        user_request_count = features.get('user_request_count', 0)
        confidence = min(0.95, 0.5 + (user_request_count * 0.45))
        
        return {
            'provider': provider,
            'model': model,
            'predicted_cost': round(predicted_cost, 6),
            'predicted_quality': round(predicted_quality, 2),
            'predicted_latency_ms': round(predicted_latency, 0),
            'confidence': round(confidence, 2),
            'task_match_score': self._calculate_task_match(model, features)
        }
    
    def _calculate_task_match(self, model: str, features: Dict[str, float]) -> float:
        """
        Calculate how well the model matches the task
        Returns score 0-1
        """
        
        match_score = 0.5  # Base score
        
        # Code tasks
        if features['has_code'] > 0.5:
            if 'gpt-4' in model:
                match_score += 0.3
            elif 'gpt-3.5' in model:
                match_score += 0.2
        
        # Math tasks
        if features['has_math'] > 0.5:
            if 'gpt-4' in model:
                match_score += 0.3
            elif 'claude-3-opus' in model:
                match_score += 0.2
        
        # Creative tasks
        if features['question_type'] > 0.7:
            if 'claude' in model:
                match_score += 0.3
        
        # Complex tasks
        if features['complexity_score'] > 0.7:
            if 'gpt-4' in model or 'claude-3-opus' in model:
                match_score += 0.2
        
        # Simple tasks
        if features['complexity_score'] < 0.3:
            if 'gpt-3.5' in model or 'haiku' in model:
                match_score += 0.2
        
        return min(1.0, match_score)
    
    def _select_best_option(
        self,
        predictions: List[Dict[str, Any]],
        strategy: str,
        features: Dict[str, float]
    ) -> Dict[str, Any]:
        """
        Select the best provider/model based on strategy
        """
        
        if strategy == 'cost':
            # Select cheapest option
            best = min(predictions, key=lambda x: x['predicted_cost'])
            reason = f"Cost-optimized: ${best['predicted_cost']:.4f} (cheapest option)"
        
        elif strategy == 'quality':
            # Select highest quality option
            best = max(predictions, key=lambda x: x['predicted_quality'])
            reason = f"Quality-optimized: {best['predicted_quality']:.1f}/10 (highest quality)"
        
        elif strategy == 'speed':
            # Select fastest option
            best = min(predictions, key=lambda x: x['predicted_latency_ms'])
            reason = f"Speed-optimized: {best['predicted_latency_ms']:.0f}ms (fastest)"
        
        else:  # balanced
            # Calculate weighted score
            for pred in predictions:
                # Normalize metrics
                norm_cost = 1.0 - min(1.0, pred['predicted_cost'] / 0.05)  # Lower cost is better
                norm_quality = pred['predicted_quality'] / 10.0  # Higher quality is better
                norm_speed = 1.0 - min(1.0, pred['predicted_latency_ms'] / 5000)  # Lower latency is better
                norm_task_match = pred['task_match_score']
                
                # Weighted score (adjust weights based on user preferences)
                user_quality_pref = features.get('user_quality_preference', 0.7)
                user_speed_pref = features.get('user_speed_preference', 0.5)
                
                # Dynamic weights
                cost_weight = 0.25
                quality_weight = 0.35 + (user_quality_pref * 0.15)
                speed_weight = 0.20 + (user_speed_pref * 0.10)
                task_weight = 0.20
                
                pred['balanced_score'] = (
                    cost_weight * norm_cost +
                    quality_weight * norm_quality +
                    speed_weight * norm_speed +
                    task_weight * norm_task_match
                )
            
            best = max(predictions, key=lambda x: x['balanced_score'])
            reason = f"Balanced: score={best['balanced_score']:.2f}, cost=${best['predicted_cost']:.4f}, quality={best['predicted_quality']:.1f}/10"
        
        # Get alternatives (top 3)
        sorted_predictions = sorted(
            predictions,
            key=lambda x: x.get('balanced_score', 0),
            reverse=True
        )
        alternatives = [p for p in sorted_predictions if p != best][:2]
        
        return {
            'provider': best['provider'],
            'model': best['model'],
            'predicted_cost': best['predicted_cost'],
            'predicted_quality': best['predicted_quality'],
            'predicted_latency_ms': best['predicted_latency_ms'],
            'confidence': best['confidence'],
            'task_match_score': best['task_match_score'],
            'reason': reason,
            'alternatives': alternatives,
            'all_predictions': predictions
        }
    
    async def log_routing_decision(
        self,
        routing_decision: Dict,
        actual_result: Dict = None
    ):
        """
        Log routing decision for future ML training
        """
        try:
            from services.database_service import db_service
            
            log_entry = {
                'provider': routing_decision['provider'],
                'model': routing_decision['model'],
                'predicted_cost': routing_decision['predicted_cost'],
                'predicted_quality': routing_decision['predicted_quality'],
                'predicted_latency_ms': routing_decision['predicted_latency_ms'],
                'strategy': routing_decision['strategy'],
                'confidence': routing_decision['confidence'],
                'features': routing_decision.get('features', {}),
            }
            
            if actual_result:
                log_entry.update({
                    'actual_cost': actual_result.get('cost'),
                    'actual_quality': actual_result.get('quality_score'),
                    'actual_latency_ms': actual_result.get('duration_ms'),
                    'success': actual_result.get('success', True)
                })
            
            # Store in database for future ML training
            await db_service.log_routing_decision(log_entry)
            
        except Exception as e:
            print(f"Error logging routing decision: {e}")


# Singleton instance
ml_routing_engine = MLRoutingEngine()

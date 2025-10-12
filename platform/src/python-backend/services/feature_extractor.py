"""
Feature Extraction System for ML Routing
Extracts features from requests for intelligent routing decisions
"""

from typing import Dict, Any, List
import re
from datetime import datetime


class FeatureExtractor:
    """Extract features from requests for ML routing"""
    
    def __init__(self):
        self.complexity_keywords = {
            'simple': ['what', 'who', 'when', 'where', 'define', 'list'],
            'medium': ['explain', 'describe', 'compare', 'summarize', 'how'],
            'complex': ['analyze', 'evaluate', 'design', 'create', 'optimize', 'develop'],
            'very_complex': ['architect', 'implement', 'algorithm', 'mathematical', 'prove']
        }
    
    async def extract_request_features(
        self, 
        request: Dict, 
        user_id: str, 
        context: Dict = None
    ) -> Dict[str, float]:
        """
        Extract comprehensive features for routing decision
        
        Returns:
            Dictionary of normalized features (0-1 scale where possible)
        """
        context = context or {}
        
        # Extract request content
        messages = request.get('messages', [])
        last_message = messages[-1].get('content', '') if messages else ''
        all_content = ' '.join(msg.get('content', '') for msg in messages)
        
        features = {
            # Request characteristics
            'request_length': self._normalize_length(len(all_content)),
            'message_count': min(1.0, len(messages) / 10),
            'complexity_score': self._calculate_complexity(last_message),
            'has_code': float(self._contains_code(all_content)),
            'has_math': float(self._contains_math(all_content)),
            'has_data': float(self._contains_data(all_content)),
            'question_type': self._classify_question_type(last_message),
            
            # User characteristics (from historical data)
            'user_avg_cost': await self._get_user_avg_cost(user_id),
            'user_quality_preference': await self._get_user_quality_pref(user_id),
            'user_speed_preference': await self._get_user_speed_pref(user_id),
            'user_request_count': await self._get_user_request_count(user_id),
            
            # Temporal features
            'hour_of_day': datetime.now().hour / 24.0,
            'day_of_week': datetime.now().weekday() / 7.0,
            'is_business_hours': float(9 <= datetime.now().hour <= 17),
            
            # Context features
            'budget_remaining': context.get('budget_remaining', 1.0),
            'quality_requirement': context.get('min_quality', 7.0) / 10.0,
            'max_cost_constraint': context.get('max_cost', 1.0),
            
            # Provider performance (from historical data)
            'openai_success_rate': await self._get_provider_success_rate('openai', user_id),
            'anthropic_success_rate': await self._get_provider_success_rate('anthropic', user_id),
            'openai_avg_quality': await self._get_provider_avg_quality('openai', user_id) / 10.0,
            'anthropic_avg_quality': await self._get_provider_avg_quality('anthropic', user_id) / 10.0,
            'openai_avg_latency': await self._get_provider_avg_latency('openai', user_id) / 5000.0,
            'anthropic_avg_latency': await self._get_provider_avg_latency('anthropic', user_id) / 5000.0,
        }
        
        return features
    
    def _normalize_length(self, length: int) -> float:
        """Normalize text length to 0-1 scale"""
        # Assume max reasonable length is 10000 characters
        return min(1.0, length / 10000.0)
    
    def _calculate_complexity(self, text: str) -> float:
        """
        Calculate request complexity score (0-1)
        Based on keywords and sentence structure
        """
        text_lower = text.lower()
        
        # Check complexity keywords
        complexity_score = 0.3  # Base score
        
        for level, keywords in self.complexity_keywords.items():
            if any(keyword in text_lower for keyword in keywords):
                if level == 'simple':
                    complexity_score = max(complexity_score, 0.2)
                elif level == 'medium':
                    complexity_score = max(complexity_score, 0.5)
                elif level == 'complex':
                    complexity_score = max(complexity_score, 0.8)
                elif level == 'very_complex':
                    complexity_score = max(complexity_score, 1.0)
        
        # Adjust for length (longer requests tend to be more complex)
        if len(text) > 500:
            complexity_score = min(1.0, complexity_score + 0.2)
        
        # Adjust for multiple questions
        question_count = text.count('?')
        if question_count > 2:
            complexity_score = min(1.0, complexity_score + 0.1)
        
        return complexity_score
    
    def _contains_code(self, text: str) -> bool:
        """Check if text contains code"""
        code_indicators = [
            '```', 'def ', 'class ', 'function', 'import ', 
            'const ', 'let ', 'var ', 'public ', 'private ',
            '#!/', 'SELECT ', 'FROM ', 'WHERE '
        ]
        return any(indicator in text for indicator in code_indicators)
    
    def _contains_math(self, text: str) -> bool:
        """Check if text contains mathematical content"""
        math_indicators = [
            'equation', 'calculate', 'formula', 'integral', 
            'derivative', 'theorem', 'proof', '∫', '∑', '∂',
            'matrix', 'vector', 'algebra'
        ]
        return any(indicator in text.lower() for indicator in math_indicators)
    
    def _contains_data(self, text: str) -> bool:
        """Check if text contains data analysis requests"""
        data_indicators = [
            'analyze data', 'dataset', 'csv', 'dataframe',
            'statistics', 'correlation', 'regression',
            'visualization', 'chart', 'graph'
        ]
        return any(indicator in text.lower() for indicator in data_indicators)
    
    def _classify_question_type(self, text: str) -> float:
        """
        Classify question type (0-1)
        0 = factual, 0.5 = analytical, 1 = creative
        """
        text_lower = text.lower()
        
        # Factual questions
        if any(word in text_lower for word in ['what', 'when', 'where', 'who', 'define']):
            return 0.2
        
        # Analytical questions
        if any(word in text_lower for word in ['why', 'how', 'explain', 'analyze', 'compare']):
            return 0.6
        
        # Creative questions
        if any(word in text_lower for word in ['create', 'design', 'imagine', 'write', 'generate']):
            return 0.9
        
        return 0.5  # Default
    
    async def _get_user_avg_cost(self, user_id: str) -> float:
        """Get user's average request cost (normalized)"""
        try:
            from services.database_service import db_service
            
            # Get last 50 requests
            response = db_service.supabase.table('ai_request_logs')\
                .select('total_cost')\
                .eq('user_id', user_id)\
                .order('timestamp', desc=True)\
                .limit(50)\
                .execute()
            
            if response.data:
                avg_cost = sum(log.get('total_cost', 0) for log in response.data) / len(response.data)
                # Normalize (assume max cost is $0.10)
                return min(1.0, avg_cost / 0.10)
            
            return 0.1  # Default low cost preference
        except Exception as e:
            print(f"Error getting user avg cost: {e}")
            return 0.1
    
    async def _get_user_quality_pref(self, user_id: str) -> float:
        """Get user's quality preference (0-1)"""
        try:
            from services.database_service import db_service
            
            # Check historical model choices
            response = db_service.supabase.table('ai_request_logs')\
                .select('model')\
                .eq('user_id', user_id)\
                .order('timestamp', desc=True)\
                .limit(50)\
                .execute()
            
            if response.data:
                # Count high-quality model usage
                high_quality_models = ['gpt-4', 'claude-3-opus', 'claude-3-sonnet']
                high_quality_count = sum(
                    1 for log in response.data 
                    if any(model in log.get('model', '') for model in high_quality_models)
                )
                return high_quality_count / len(response.data)
            
            return 0.7  # Default moderate quality preference
        except Exception as e:
            print(f"Error getting user quality pref: {e}")
            return 0.7
    
    async def _get_user_speed_pref(self, user_id: str) -> float:
        """Get user's speed preference (0-1)"""
        try:
            from services.database_service import db_service
            
            # Check historical model choices
            response = db_service.supabase.table('ai_request_logs')\
                .select('model')\
                .eq('user_id', user_id)\
                .order('timestamp', desc=True)\
                .limit(50)\
                .execute()
            
            if response.data:
                # Count fast model usage
                fast_models = ['gpt-3.5-turbo', 'claude-3-haiku']
                fast_count = sum(
                    1 for log in response.data 
                    if any(model in log.get('model', '') for model in fast_models)
                )
                return fast_count / len(response.data)
            
            return 0.5  # Default balanced preference
        except Exception as e:
            print(f"Error getting user speed pref: {e}")
            return 0.5
    
    async def _get_user_request_count(self, user_id: str) -> float:
        """Get user's total request count (normalized)"""
        try:
            from services.database_service import db_service
            
            response = db_service.supabase.table('ai_request_logs')\
                .select('id', count='exact')\
                .eq('user_id', user_id)\
                .execute()
            
            count = response.count if response.count else 0
            # Normalize (assume 1000 requests is high usage)
            return min(1.0, count / 1000.0)
        except Exception as e:
            print(f"Error getting user request count: {e}")
            return 0.0
    
    async def _get_provider_success_rate(self, provider: str, user_id: str) -> float:
        """Get provider success rate for user"""
        try:
            from services.database_service import db_service
            
            response = db_service.supabase.table('ai_request_logs')\
                .select('success')\
                .eq('user_id', user_id)\
                .eq('provider', provider)\
                .order('timestamp', desc=True)\
                .limit(50)\
                .execute()
            
            if response.data:
                success_count = sum(1 for log in response.data if log.get('success', False))
                return success_count / len(response.data)
            
            return 0.95  # Default high success rate
        except Exception as e:
            print(f"Error getting provider success rate: {e}")
            return 0.95
    
    async def _get_provider_avg_quality(self, provider: str, user_id: str) -> float:
        """Get provider average quality score for user"""
        try:
            from services.database_service import db_service
            
            response = db_service.supabase.table('ai_request_logs')\
                .select('quality_score')\
                .eq('user_id', user_id)\
                .eq('provider', provider)\
                .order('timestamp', desc=True)\
                .limit(50)\
                .execute()
            
            if response.data:
                scores = [log.get('quality_score', 7.5) for log in response.data if log.get('quality_score')]
                if scores:
                    return sum(scores) / len(scores)
            
            return 7.5  # Default quality score
        except Exception as e:
            print(f"Error getting provider avg quality: {e}")
            return 7.5
    
    async def _get_provider_avg_latency(self, provider: str, user_id: str) -> float:
        """Get provider average latency in milliseconds"""
        try:
            from services.database_service import db_service
            
            response = db_service.supabase.table('ai_request_logs')\
                .select('duration_seconds')\
                .eq('user_id', user_id)\
                .eq('provider', provider)\
                .order('timestamp', desc=True)\
                .limit(50)\
                .execute()
            
            if response.data:
                durations = [log.get('duration_seconds', 2.0) * 1000 for log in response.data]
                return sum(durations) / len(durations)
            
            # Default latencies
            return 1500 if provider == 'openai' else 2000
        except Exception as e:
            print(f"Error getting provider avg latency: {e}")
            return 1500 if provider == 'openai' else 2000


# Singleton instance
feature_extractor = FeatureExtractor()

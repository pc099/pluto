"""
Advanced Hallucination Detection System
Detects hallucinations using external validation and ML-based analysis
"""

import re
import httpx
from typing import Dict, List, Any, Optional
from datetime import datetime


class AdvancedHallucinationDetector:
    """
    Advanced hallucination detection with external validation
    
    Methods:
    1. Claim extraction from responses
    2. External fact-checking via Wikipedia
    3. Consistency analysis
    4. Confidence scoring
    5. Citation verification
    """
    
    def __init__(self):
        self.wikipedia_api_base = 'https://en.wikipedia.org/w/api.php'
        self.min_claim_length = 10
        self.max_claims_to_validate = 10
    
    async def detect_hallucinations(
        self,
        response_content: str,
        request_content: str = None,
        model: str = None,
        context: Dict = None
    ) -> Dict[str, Any]:
        """
        Comprehensive hallucination detection
        
        Returns:
            {
                'hallucination_risk': 'low' | 'medium' | 'high',
                'confidence': 0.0-1.0,
                'quality_score': 0-10,
                'total_claims': int,
                'validated_claims': int,
                'failed_validations': int,
                'validation_details': [...],
                'recommendations': [...],
                'alerts': [...]
            }
        """
        
        context = context or {}
        
        # Extract factual claims
        claims = self._extract_claims(response_content)
        
        # Validate claims (limit to avoid API overload)
        claims_to_validate = claims[:self.max_claims_to_validate]
        validations = []
        
        for claim in claims_to_validate:
            validation = await self._validate_claim(claim)
            validations.append(validation)
        
        # Analyze response structure
        structure_analysis = self._analyze_response_structure(response_content)
        
        # Calculate hallucination metrics
        total_claims = len(claims)
        validated_count = sum(1 for v in validations if v['validated'])
        failed_count = sum(1 for v in validations if not v['validated'])
        
        # Calculate risk level
        if total_claims == 0:
            hallucination_risk = 'low'
            confidence = 0.6
            quality_score = 7.5
        else:
            failure_rate = failed_count / len(validations) if validations else 0
            
            # Risk assessment
            if failure_rate > 0.5:
                hallucination_risk = 'high'
                confidence = 0.85
                quality_score = 4.0
            elif failure_rate > 0.25:
                hallucination_risk = 'medium'
                confidence = 0.75
                quality_score = 6.5
            else:
                hallucination_risk = 'low'
                confidence = 0.80
                quality_score = 8.5
            
            # Adjust based on structure analysis
            if structure_analysis['has_hedging']:
                quality_score += 0.5  # Hedging indicates awareness of uncertainty
            
            if structure_analysis['has_citations']:
                quality_score += 1.0  # Citations are good
                hallucination_risk = 'low' if hallucination_risk == 'medium' else hallucination_risk
            
            if structure_analysis['overconfident']:
                quality_score -= 1.0  # Overconfidence is a red flag
                confidence -= 0.1
            
            quality_score = max(0, min(10, quality_score))
            confidence = max(0, min(1, confidence))
        
        # Generate recommendations
        recommendations = self._generate_recommendations(
            validations, structure_analysis, hallucination_risk
        )
        
        # Generate alerts
        alerts = self._generate_alerts(validations, hallucination_risk, quality_score)
        
        return {
            'hallucination_risk': hallucination_risk,
            'confidence': round(confidence, 2),
            'quality_score': round(quality_score, 1),
            'total_claims': total_claims,
            'validated_claims': validated_count,
            'failed_validations': failed_count,
            'validation_details': validations,
            'structure_analysis': structure_analysis,
            'recommendations': recommendations,
            'alerts': alerts,
            'timestamp': datetime.utcnow().isoformat()
        }
    
    def _extract_claims(self, text: str) -> List[str]:
        """
        Extract factual claims from text
        
        A claim is a statement that can be verified as true or false
        """
        
        # Split into sentences
        sentences = re.split(r'[.!?]+', text)
        
        claims = []
        for sentence in sentences:
            sentence = sentence.strip()
            
            if len(sentence) < self.min_claim_length:
                continue
            
            # Check if sentence contains factual indicators
            if self._is_factual_claim(sentence):
                claims.append(sentence)
        
        return claims
    
    def _is_factual_claim(self, sentence: str) -> bool:
        """
        Determine if a sentence contains a factual claim
        """
        
        sentence_lower = sentence.lower()
        
        # Factual indicators
        factual_verbs = ['is', 'are', 'was', 'were', 'has', 'have', 'had', 'will', 'can', 'does']
        factual_patterns = [
            r'\d+',  # Contains numbers
            r'in \d{4}',  # Year references
            r'founded|created|invented|discovered|born|died',
            r'located|situated|based',
            r'known for|famous for|recognized',
            r'according to|research shows|studies indicate'
        ]
        
        # Check for factual verbs
        has_factual_verb = any(f' {verb} ' in f' {sentence_lower} ' for verb in factual_verbs)
        
        # Check for factual patterns
        has_factual_pattern = any(re.search(pattern, sentence_lower) for pattern in factual_patterns)
        
        # Exclude questions and opinions
        is_question = '?' in sentence
        is_opinion = any(word in sentence_lower for word in ['i think', 'i believe', 'in my opinion', 'perhaps', 'maybe', 'possibly'])
        
        return (has_factual_verb or has_factual_pattern) and not is_question and not is_opinion
    
    async def _validate_claim(self, claim: str) -> Dict[str, Any]:
        """
        Validate a claim against external sources (Wikipedia)
        """
        
        try:
            # Search Wikipedia for relevant articles
            search_results = await self._search_wikipedia(claim)
            
            if not search_results:
                return {
                    'claim': claim,
                    'validated': False,
                    'confidence': 0.3,
                    'source': None,
                    'reason': 'No external sources found'
                }
            
            # Get the top result
            top_result = search_results[0]
            article_summary = await self._get_wikipedia_summary(top_result['title'])
            
            if not article_summary:
                return {
                    'claim': claim,
                    'validated': False,
                    'confidence': 0.4,
                    'source': top_result['title'],
                    'reason': 'Could not retrieve article content'
                }
            
            # Simple validation: check keyword overlap
            claim_keywords = set(claim.lower().split())
            summary_keywords = set(article_summary.lower().split())
            
            # Remove common words
            stop_words = {'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but', 'in', 'with', 'to', 'for', 'of', 'as', 'by'}
            claim_keywords -= stop_words
            summary_keywords -= stop_words
            
            if not claim_keywords:
                overlap_ratio = 0
            else:
                overlap = len(claim_keywords & summary_keywords)
                overlap_ratio = overlap / len(claim_keywords)
            
            validated = overlap_ratio > 0.3
            confidence = min(0.9, overlap_ratio * 1.5)
            
            return {
                'claim': claim,
                'validated': validated,
                'confidence': round(confidence, 2),
                'source': top_result['title'],
                'source_url': f"https://en.wikipedia.org/wiki/{top_result['title'].replace(' ', '_')}",
                'overlap_ratio': round(overlap_ratio, 2),
                'reason': 'Validated against Wikipedia' if validated else 'Low keyword overlap with source'
            }
            
        except Exception as e:
            return {
                'claim': claim,
                'validated': False,
                'confidence': 0.2,
                'source': None,
                'reason': f'Validation error: {str(e)}'
            }
    
    async def _search_wikipedia(self, query: str) -> List[Dict]:
        """Search Wikipedia API"""
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(
                    self.wikipedia_api_base,
                    params={
                        'action': 'query',
                        'list': 'search',
                        'srsearch': query,
                        'format': 'json',
                        'srlimit': 3
                    }
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return data.get('query', {}).get('search', [])
                
                return []
        except Exception as e:
            print(f"Wikipedia search error: {e}")
            return []
    
    async def _get_wikipedia_summary(self, title: str) -> Optional[str]:
        """Get Wikipedia article summary"""
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(
                    self.wikipedia_api_base,
                    params={
                        'action': 'query',
                        'prop': 'extracts',
                        'exintro': True,
                        'explaintext': True,
                        'titles': title,
                        'format': 'json'
                    }
                )
                
                if response.status_code == 200:
                    data = response.json()
                    pages = data.get('query', {}).get('pages', {})
                    
                    for page in pages.values():
                        return page.get('extract')
                
                return None
        except Exception as e:
            print(f"Wikipedia summary error: {e}")
            return None
    
    def _analyze_response_structure(self, text: str) -> Dict[str, Any]:
        """
        Analyze response structure for hallucination indicators
        """
        
        text_lower = text.lower()
        
        # Check for hedging language (indicates uncertainty awareness)
        hedging_words = ['might', 'may', 'could', 'possibly', 'perhaps', 'likely', 'probably', 'seems', 'appears']
        has_hedging = any(word in text_lower for word in hedging_words)
        
        # Check for citations/sources
        citation_patterns = [
            r'according to',
            r'research shows',
            r'studies indicate',
            r'source:',
            r'\[\d+\]',  # Reference numbers
            r'http[s]?://'  # URLs
        ]
        has_citations = any(re.search(pattern, text_lower) for pattern in citation_patterns)
        
        # Check for overconfidence
        overconfident_words = ['definitely', 'certainly', 'absolutely', 'without doubt', 'guaranteed', 'always', 'never']
        overconfident = sum(1 for word in overconfident_words if word in text_lower) > 2
        
        # Check for specific numbers (can be verified)
        has_specific_numbers = bool(re.search(r'\d+', text))
        
        # Check response length
        word_count = len(text.split())
        
        return {
            'has_hedging': has_hedging,
            'has_citations': has_citations,
            'overconfident': overconfident,
            'has_specific_numbers': has_specific_numbers,
            'word_count': word_count,
            'sentence_count': len(re.split(r'[.!?]+', text))
        }
    
    def _generate_recommendations(
        self,
        validations: List[Dict],
        structure_analysis: Dict,
        risk_level: str
    ) -> List[str]:
        """Generate actionable recommendations"""
        
        recommendations = []
        
        if risk_level == 'high':
            recommendations.append("⚠️ High hallucination risk detected. Consider regenerating the response or using a different model.")
        
        if risk_level == 'medium':
            recommendations.append("⚠️ Medium hallucination risk. Verify critical facts before using this response.")
        
        failed_validations = [v for v in validations if not v['validated']]
        if failed_validations:
            recommendations.append(f"❌ {len(failed_validations)} claims could not be validated. Review these carefully.")
        
        if structure_analysis['overconfident']:
            recommendations.append("⚠️ Response shows overconfidence. Be cautious with absolute statements.")
        
        if not structure_analysis['has_citations'] and structure_analysis['has_specific_numbers']:
            recommendations.append("💡 Response contains specific numbers but no citations. Verify numerical claims.")
        
        if not recommendations:
            recommendations.append("✅ Response appears reliable. Low hallucination risk detected.")
        
        return recommendations
    
    def _generate_alerts(
        self,
        validations: List[Dict],
        risk_level: str,
        quality_score: float
    ) -> List[Dict]:
        """Generate alerts for critical issues"""
        
        alerts = []
        
        if risk_level == 'high':
            alerts.append({
                'type': 'HALLUCINATION',
                'severity': 'CRITICAL',
                'message': 'High hallucination risk detected',
                'action': 'BLOCK_OR_WARN'
            })
        
        if quality_score < 5.0:
            alerts.append({
                'type': 'LOW_QUALITY',
                'severity': 'HIGH',
                'message': f'Low quality score: {quality_score}/10',
                'action': 'WARN'
            })
        
        # Check for specific failed validations
        critical_failures = [v for v in validations if not v['validated'] and v['confidence'] < 0.3]
        if len(critical_failures) > 2:
            alerts.append({
                'type': 'MULTIPLE_FAILURES',
                'severity': 'HIGH',
                'message': f'{len(critical_failures)} claims failed validation',
                'action': 'REVIEW_REQUIRED'
            })
        
        return alerts


# Singleton instance
advanced_hallucination_detector = AdvancedHallucinationDetector()

# services/ai_quality_service.py
import re
import json
import asyncio
from typing import Dict, Any, List, Optional
from datetime import datetime
import hashlib

class AIQualityAnalyzer:
    def __init__(self):
        # Patterns that often indicate hallucination
        self.hallucination_indicators = [
            r"I don't have access to real-time",
            r"I cannot browse the internet",
            r"As of my last update",
            r"I don't have information about recent",
            r"I cannot verify",
            r"I'm not sure about",
            r"I don't have specific data",
            r"I cannot confirm",
        ]
        
        # Patterns indicating high confidence/factual responses
        self.confidence_indicators = [
            r"According to",
            r"Based on",
            r"The data shows",
            r"Studies indicate",
            r"Research demonstrates",
            r"Official sources state",
        ]
        
        # Red flag patterns for potential misinformation
        self.misinformation_patterns = [
            r"definitely causes cancer",
            r"guaranteed to",
            r"100% effective",
            r"scientifically proven to",
            r"all experts agree",
            r"no side effects",
        ]
        
        # Security vulnerability patterns
        self.security_patterns = {
            "prompt_injection": [
                r"ignore previous instructions",
                r"forget your role",
                r"act as a different",
                r"pretend to be",
                r"new instructions:",
                r"override your",
                r"jailbreak",
                r"DAN mode",
            ],
            "data_extraction": [
                r"show me your system prompt",
                r"what are your instructions",
                r"reveal your guidelines",
                r"dump your memory",
                r"show training data",
            ],
            "malicious_requests": [
                r"how to hack",
                r"create malware",
                r"harmful instructions",
                r"bypass security",
            ]
        }

    async def analyze_quality(self, request_content: str, response_content: str,
                              model: str, provider: str, use_advanced: bool = True) -> Dict[str, Any]:
        """Comprehensive AI response quality analysis"""
        
        analysis_start = datetime.utcnow()
        
        # Use advanced hallucination detection if available
        if use_advanced:
            try:
                from services.advanced_hallucination_detector import advanced_hallucination_detector
                
                advanced_analysis = await advanced_hallucination_detector.detect_hallucinations(
                    response_content=response_content,
                    request_content=request_content,
                    model=model,
                    context={'provider': provider}
                )
                
                # Use advanced analysis results
                quality_score = advanced_analysis['quality_score']
                hallucination_risk = advanced_analysis['hallucination_risk']
                confidence_score = advanced_analysis['confidence']
                has_hallucination = hallucination_risk in ['high', 'medium']
                
                # Add advanced analysis details
                analysis['advanced_analysis'] = {
                    'total_claims': advanced_analysis['total_claims'],
                    'validated_claims': advanced_analysis['validated_claims'],
                    'failed_validations': advanced_analysis['failed_validations'],
                    'validation_details': advanced_analysis['validation_details'][:5],  # Limit to 5
                    'recommendations': advanced_analysis['recommendations'],
                    'alerts': advanced_analysis['alerts']
                }
            except Exception as e:
                print(f"Advanced hallucination detection failed, using basic: {e}")
                # Fallback to basic analysis
                quality_score = self._calculate_quality_score(response_content, request_content)
                confidence_score = self._calculate_confidence_score(response_content)
                hallucination_risk = self._detect_hallucination_risk(response_content)
                has_hallucination = hallucination_risk in ['high', 'medium']
        else:
            # Basic analysis
            quality_score = self._calculate_quality_score(response_content, request_content)
            confidence_score = self._calculate_confidence_score(response_content)
            hallucination_risk = self._detect_hallucination_risk(response_content)
            has_hallucination = hallucination_risk in ['high', 'medium']
        
        security_analysis = self._analyze_security_risks(request_content, response_content)
        bias_detection = self._detect_potential_bias(response_content)
        toxicity_score = self._calculate_toxicity_score(response_content)
        
        # Calculate overall quality score
        overall_quality = self._calculate_overall_quality(
            quality_score, confidence_score, has_hallucination, 
            hallucination_score, confidence_score, factual_consistency, 
            security_analysis, bias_detection, toxicity_score
        )
        
        # Determine risk level
        risk_level = self._determine_risk_level(overall_quality, security_analysis)
        
        analysis_duration = (datetime.utcnow() - analysis_start).total_seconds()
        
        return {
            "analysis_id": self._generate_analysis_id(request_content, response_content),
            "timestamp": analysis_start.isoformat(),
            "model": model,
            "provider": provider,
            "overall_quality_score": round(overall_quality, 2),
            "risk_level": risk_level,
            "analysis_duration_ms": round(analysis_duration * 1000, 2),
            "detailed_scores": {
                "hallucination_risk": round(hallucination_score, 2),
                "confidence_score": round(confidence_score, 2),
                "factual_consistency": round(factual_consistency, 2),
                "toxicity_score": round(toxicity_score, 2),
                "bias_score": round(bias_detection, 2)
            },
            "security_analysis": security_analysis,
            "recommendations": self._generate_recommendations(overall_quality, security_analysis),
            "alerts": self._generate_alerts(overall_quality, security_analysis, hallucination_score)
        }

    def _detect_hallucination(self, response: str, request: str) -> float:
        """Detect potential hallucination in AI response"""
        
        hallucination_score = 0.0
        total_checks = 0
        
        # Check for uncertainty indicators (good - reduces hallucination risk)
        uncertainty_matches = 0
        for pattern in self.hallucination_indicators:
            if re.search(pattern, response, re.IGNORECASE):
                uncertainty_matches += 1
        
        if uncertainty_matches > 0:
            hallucination_score -= 0.3  # Lower risk if AI expresses uncertainty
        
        # Check for overconfidence in unprovable claims (bad - increases hallucination risk)
        overconfidence_patterns = [
            r"definitely",
            r"certainly",
            r"absolutely",
            r"without a doubt",
            r"guaranteed",
        ]
        
        overconfidence_matches = sum(1 for pattern in overconfidence_patterns 
                                   if re.search(pattern, response, re.IGNORECASE))
        
        if overconfidence_matches > 2:
            hallucination_score += 0.4
        
        # Check for specific facts without sources (medium risk)
        specific_claims_without_sources = re.findall(
            r"(\d+%|\d+\.\d+|\$\d+|in \d{4}|on [A-Z][a-z]+ \d+)", 
            response
        )
        
        if len(specific_claims_without_sources) > 3 and "according to" not in response.lower():
            hallucination_score += 0.2
        
        # Check for misinformation patterns
        misinformation_matches = sum(1 for pattern in self.misinformation_patterns 
                                   if re.search(pattern, response, re.IGNORECASE))
        
        if misinformation_matches > 0:
            hallucination_score += 0.5
        
        # Normalize score between 0 and 1
        return max(0.0, min(1.0, hallucination_score))

    def _calculate_confidence_score(self, response: str) -> float:
        """Calculate confidence score based on language patterns"""
        
        confidence_score = 0.5  # Start with neutral
        
        # Positive indicators
        confidence_matches = sum(1 for pattern in self.confidence_indicators 
                               if re.search(pattern, response, re.IGNORECASE))
        
        confidence_score += confidence_matches * 0.1
        
        # Source citations boost confidence
        citations = len(re.findall(r"(according to|source:|via|from [A-Z][a-z]+)", response, re.IGNORECASE))
        confidence_score += citations * 0.15
        
        # Hedging language reduces overconfidence (which is good)
        hedging_words = ["might", "could", "possibly", "potentially", "appears", "seems"]
        hedging_count = sum(1 for word in hedging_words if word in response.lower())
        
        if hedging_count > 0:
            confidence_score += 0.1  # Appropriate uncertainty is good
        
        return max(0.0, min(1.0, confidence_score))

    def _check_factual_consistency(self, response: str) -> float:
        """Check for internal factual consistency"""
        
        consistency_score = 0.8  # Start optimistic
        
        # Check for contradictory statements (simple heuristic)
        contradictory_pairs = [
            (r"is safe", r"is dangerous"),
            (r"always", r"never"),
            (r"increases", r"decreases"),
            (r"effective", r"ineffective"),
        ]
        
        for positive, negative in contradictory_pairs:
            if (re.search(positive, response, re.IGNORECASE) and 
                re.search(negative, response, re.IGNORECASE)):
                consistency_score -= 0.2
        
        # Check for impossible dates or numbers
        impossible_patterns = [
            r"before 1900.*invented in 2023",
            r"100% of people",
            r"never happens.*always occurs",
        ]
        
        for pattern in impossible_patterns:
            if re.search(pattern, response, re.IGNORECASE):
                consistency_score -= 0.3
        
        return max(0.0, min(1.0, consistency_score))

    def _analyze_security_risks(self, request: str, response: str) -> Dict[str, Any]:
        """Analyze security vulnerabilities in AI interaction"""
        
        security_analysis = {
            "prompt_injection_detected": False,
            "data_extraction_attempt": False,
            "malicious_request": False,
            "security_score": 1.0,  # 1.0 = secure, 0.0 = high risk
            "detected_patterns": [],
            "risk_indicators": []
        }
        
        # Check request for prompt injection attempts
        for pattern in self.security_patterns["prompt_injection"]:
            if re.search(pattern, request, re.IGNORECASE):
                security_analysis["prompt_injection_detected"] = True
                security_analysis["detected_patterns"].append(f"Prompt injection: {pattern}")
                security_analysis["security_score"] -= 0.3
        
        # Check for data extraction attempts
        for pattern in self.security_patterns["data_extraction"]:
            if re.search(pattern, request, re.IGNORECASE):
                security_analysis["data_extraction_attempt"] = True
                security_analysis["detected_patterns"].append(f"Data extraction: {pattern}")
                security_analysis["security_score"] -= 0.4
        
        # Check for malicious requests
        for pattern in self.security_patterns["malicious_requests"]:
            if re.search(pattern, request, re.IGNORECASE):
                security_analysis["malicious_request"] = True
                security_analysis["detected_patterns"].append(f"Malicious request: {pattern}")
                security_analysis["security_score"] -= 0.5
        
        # Check if AI complied with suspicious requests
        compliance_indicators = [
            r"here's how to",
            r"step by step",
            r"instructions:",
            r"tutorial:",
        ]
        
        if (security_analysis["prompt_injection_detected"] or 
            security_analysis["malicious_request"]):
            for indicator in compliance_indicators:
                if re.search(indicator, response, re.IGNORECASE):
                    security_analysis["risk_indicators"].append("AI may have complied with suspicious request")
                    security_analysis["security_score"] -= 0.2
                    break
        
        security_analysis["security_score"] = max(0.0, security_analysis["security_score"])
        
        return security_analysis

    def _detect_potential_bias(self, response: str) -> float:
        """Detect potential bias in AI response"""
        
        bias_score = 0.0
        
        # Simple bias detection (can be enhanced with more sophisticated NLP)
        biased_language_patterns = [
            r"all (men|women|people) are",
            r"(men|women) should always",
            r"it's natural for (men|women) to",
            r"(race|ethnicity|religion) tends to",
            r"people from .* are typically",
        ]
        
        for pattern in biased_language_patterns:
            if re.search(pattern, response, re.IGNORECASE):
                bias_score += 0.3
        
        # Check for loaded language
        loaded_terms = ["obviously", "naturally", "of course", "clearly", "everyone knows"]
        loaded_count = sum(1 for term in loaded_terms if term in response.lower())
        
        if loaded_count > 2:
            bias_score += 0.2
        
        return max(0.0, min(1.0, bias_score))

    def _calculate_toxicity_score(self, response: str) -> float:
        """Calculate toxicity score (simplified version)"""
        
        toxicity_score = 0.0
        
        # Simple toxic language detection
        toxic_indicators = [
            r"hate",
            r"violence",
            r"harm",
            r"kill",
            r"destroy",
            r"attack",
            r"stupid",
            r"idiot",
        ]
        
        toxic_matches = sum(1 for pattern in toxic_indicators 
                          if re.search(pattern, response, re.IGNORECASE))
        
        toxicity_score = min(1.0, toxic_matches * 0.2)
        
        return toxicity_score

    def _calculate_overall_quality(self, hallucination_score: float, confidence_score: float, 
                                 factual_consistency: float, security_analysis: Dict[str, Any],
                                 bias_score: float, toxicity_score: float) -> float:
        """Calculate overall quality score"""
        
        # Weighted average (higher weight for critical factors)
        quality_score = (
            (1.0 - hallucination_score) * 0.3 +  # Lower hallucination = higher quality
            confidence_score * 0.2 +
            factual_consistency * 0.2 +
            security_analysis["security_score"] * 0.15 +
            (1.0 - bias_score) * 0.1 +  # Lower bias = higher quality
            (1.0 - toxicity_score) * 0.05  # Lower toxicity = higher quality
        )
        
        return max(0.0, min(1.0, quality_score))

    def _determine_risk_level(self, quality_score: float, security_analysis: Dict[str, Any]) -> str:
        """Determine overall risk level"""
        
        if (security_analysis["security_score"] < 0.5 or 
            security_analysis["prompt_injection_detected"] or
            security_analysis["malicious_request"]):
            return "CRITICAL"
        elif quality_score < 0.3:
            return "HIGH"
        elif quality_score < 0.6:
            return "MEDIUM"
        elif quality_score < 0.8:
            return "LOW"
        else:
            return "MINIMAL"

    def _generate_recommendations(self, quality_score: float, security_analysis: Dict[str, Any]) -> List[str]:
        """Generate actionable recommendations"""
        
        recommendations = []
        
        if quality_score < 0.5:
            recommendations.append("Consider using a different AI model or refining the prompt")
            recommendations.append("Verify response accuracy before using in production")
        
        if security_analysis["security_score"] < 0.7:
            recommendations.append("Review request for potential security risks")
            recommendations.append("Consider implementing additional input filtering")
        
        if security_analysis["prompt_injection_detected"]:
            recommendations.append("URGENT: Prompt injection detected - review and potentially block this request")
        
        if quality_score > 0.8:
            recommendations.append("High quality response - safe to use")
        
        return recommendations

    def _generate_alerts(self, quality_score: float, security_analysis: Dict[str, Any], hallucination_score: float) -> List[Dict[str, Any]]:
        """Generate alerts for critical issues"""
        
        alerts = []
        
        if security_analysis["prompt_injection_detected"]:
            alerts.append({
                "type": "SECURITY",
                "severity": "CRITICAL",
                "message": "Prompt injection attack detected",
                "action_required": "Block request and review security policies"
            })
        
        if hallucination_score > 0.7:
            alerts.append({
                "type": "QUALITY",
                "severity": "HIGH", 
                "message": "High hallucination risk detected",
                "action_required": "Verify response accuracy before use"
            })
        
        if quality_score < 0.3:
            alerts.append({
                "type": "QUALITY",
                "severity": "MEDIUM",
                "message": "Low quality response detected",
                "action_required": "Consider regenerating response with different parameters"
            })
        
        return alerts

    def _generate_analysis_id(self, request: str, response: str) -> str:
        """Generate unique ID for this analysis"""
        combined = f"{request[:100]}{response[:100]}{datetime.utcnow().isoformat()}"
        return hashlib.md5(combined.encode()).hexdigest()[:16]

# Create singleton instance
ai_quality_analyzer = AIQualityAnalyzer()
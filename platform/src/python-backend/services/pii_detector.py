"""
PII Detection Service
Detects Personally Identifiable Information in AI requests and responses
"""
import re
import json
import hashlib
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime
from dataclasses import dataclass
import logging

logger = logging.getLogger(__name__)

@dataclass
class PIIDetection:
    """PII detection result"""
    pii_detected: bool
    pii_types: List[str]
    confidence_scores: Dict[str, float]
    risk_level: str  # low, medium, high, critical
    detected_values: Dict[str, List[str]]
    masked_content: Optional[str]
    recommendations: List[str]

class PIIDetector:
    """PII detection and masking service"""
    
    def __init__(self):
        # PII patterns for detection
        self.pii_patterns = {
            # Email addresses
            "email": [
                r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
                r'\b[A-Za-z0-9._%+-]+\s*@\s*[A-Za-z0-9.-]+\s*\.\s*[A-Z|a-z]{2,}\b'
            ],
            
            # Phone numbers (US format)
            "phone": [
                r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b',
                r'\(\d{3}\)\s*\d{3}[-.]?\d{4}',
                r'\b\d{3}\s\d{3}\s\d{4}\b',
                r'\+1[-.]?\d{3}[-.]?\d{3}[-.]?\d{4}'
            ],
            
            # Social Security Numbers
            "ssn": [
                r'\b\d{3}-?\d{2}-?\d{4}\b',
                r'\b\d{9}\b'
            ],
            
            # Credit Card Numbers
            "credit_card": [
                r'\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b',
                r'\b\d{13,19}\b'
            ],
            
            # Bank Account Numbers
            "bank_account": [
                r'\b\d{8,17}\b'  # Simplified pattern
            ],
            
            # Names (common patterns)
            "name": [
                r'\b[A-Z][a-z]+\s+[A-Z][a-z]+\b',  # First Last
                r'\b[A-Z][a-z]+\s+[A-Z]\.\s+[A-Z][a-z]+\b',  # First M. Last
                r'\b[A-Z][a-z]+\s+[A-Z][a-z]+\s+[A-Z][a-z]+\b'  # First Middle Last
            ],
            
            # Addresses
            "address": [
                r'\b\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd)\b',
                r'\b\d+\s+[A-Za-z\s]+(?:Apartment|Apt|Suite|Ste|Unit|#)\s*\d*\b'
            ],
            
            # IP Addresses
            "ip_address": [
                r'\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b',
                r'\b(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}\b'  # IPv6
            ],
            
            # Driver's License
            "drivers_license": [
                r'\b[A-Z]\d{7,8}\b',  # Common US format
                r'\b\d{8,9}\b'
            ],
            
            # Passport Numbers
            "passport": [
                r'\b[A-Z]{1,2}\d{6,9}\b',
                r'\b\d{9}\b'
            ]
        }
        
        # Risk levels for different PII types
        self.risk_levels = {
            "ssn": "critical",
            "credit_card": "critical",
            "bank_account": "critical",
            "drivers_license": "high",
            "passport": "high",
            "email": "medium",
            "phone": "medium",
            "name": "low",
            "address": "medium",
            "ip_address": "low"
        }
        
        # Confidence thresholds
        self.confidence_thresholds = {
            "high": 0.8,
            "medium": 0.6,
            "low": 0.4
        }
    
    async def analyze_request(self, traffic_request) -> PIIDetection:
        """Analyze request for PII"""
        content = ""
        
        # Extract content from request body
        if traffic_request.body:
            if isinstance(traffic_request.body, dict):
                content = json.dumps(traffic_request.body)
            else:
                content = str(traffic_request.body)
        
        # Also check headers for PII
        headers_content = json.dumps(traffic_request.headers)
        content += " " + headers_content
        
        return await self._detect_pii(content, "request")
    
    async def analyze_response(self, response_body: Optional[Dict[str, Any]]) -> PIIDetection:
        """Analyze response for PII"""
        if not response_body:
            return PIIDetection(
                pii_detected=False,
                pii_types=[],
                confidence_scores={},
                risk_level="low",
                detected_values={},
                masked_content=None,
                recommendations=[]
            )
        
        # Extract content from response
        content = json.dumps(response_body)
        
        # Also check message content if it's a chat response
        if "choices" in response_body:
            for choice in response_body["choices"]:
                if "message" in choice and "content" in choice["message"]:
                    content += " " + choice["message"]["content"]
        
        return await self._detect_pii(content, "response")
    
    async def _detect_pii(self, content: str, content_type: str) -> PIIDetection:
        """Main PII detection logic"""
        detected_pii = {}
        confidence_scores = {}
        all_detected_values = {}
        
        # Analyze each PII type
        for pii_type, patterns in self.pii_patterns.items():
            detected_values = []
            max_confidence = 0.0
            
            for pattern in patterns:
                matches = re.findall(pattern, content, re.IGNORECASE)
                if matches:
                    detected_values.extend(matches)
                    
                    # Calculate confidence based on pattern specificity
                    confidence = self._calculate_confidence(pattern, matches)
                    max_confidence = max(max_confidence, confidence)
            
            if detected_values:
                detected_pii[pii_type] = detected_values
                confidence_scores[pii_type] = max_confidence
                all_detected_values[pii_type] = list(set(detected_values))  # Remove duplicates
        
        # Determine overall risk level
        risk_level = self._determine_risk_level(detected_pii, confidence_scores)
        
        # Generate recommendations
        recommendations = self._generate_recommendations(detected_pii, risk_level)
        
        # Create masked content
        masked_content = self._mask_pii(content, detected_pii) if detected_pii else None
        
        return PIIDetection(
            pii_detected=len(detected_pii) > 0,
            pii_types=list(detected_pii.keys()),
            confidence_scores=confidence_scores,
            risk_level=risk_level,
            detected_values=all_detected_values,
            masked_content=masked_content,
            recommendations=recommendations
        )
    
    def _calculate_confidence(self, pattern: str, matches: List[str]) -> float:
        """Calculate confidence score for PII detection"""
        base_confidence = 0.5
        
        # Adjust confidence based on pattern complexity
        if len(pattern) > 50:  # More specific patterns
            base_confidence += 0.3
        elif len(pattern) > 20:
            base_confidence += 0.2
        
        # Adjust based on match quality
        if matches:
            avg_match_length = sum(len(match) for match in matches) / len(matches)
            if avg_match_length > 10:
                base_confidence += 0.1
        
        return min(base_confidence, 1.0)
    
    def _determine_risk_level(self, detected_pii: Dict[str, List[str]], confidence_scores: Dict[str, float]) -> str:
        """Determine overall risk level based on detected PII"""
        if not detected_pii:
            return "low"
        
        max_risk = "low"
        
        for pii_type in detected_pii.keys():
            risk_level = self.risk_levels.get(pii_type, "low")
            confidence = confidence_scores.get(pii_type, 0.0)
            
            # Only consider high-confidence detections
            if confidence >= self.confidence_thresholds.get(risk_level, 0.5):
                if risk_level == "critical":
                    return "critical"
                elif risk_level == "high" and max_risk in ["low", "medium"]:
                    max_risk = "high"
                elif risk_level == "medium" and max_risk == "low":
                    max_risk = "medium"
        
        return max_risk
    
    def _generate_recommendations(self, detected_pii: Dict[str, List[str]], risk_level: str) -> List[str]:
        """Generate recommendations based on detected PII"""
        recommendations = []
        
        if risk_level == "critical":
            recommendations.extend([
                "CRITICAL: High-risk PII detected. Immediate review required.",
                "Consider blocking this request or requiring additional authorization.",
                "Ensure data handling complies with privacy regulations."
            ])
        elif risk_level == "high":
            recommendations.extend([
                "High-risk PII detected. Review request content.",
                "Consider implementing data masking or encryption.",
                "Verify user authorization for sensitive data access."
            ])
        elif risk_level == "medium":
            recommendations.extend([
                "Medium-risk PII detected. Monitor for compliance.",
                "Consider implementing data anonymization.",
                "Review data retention policies."
            ])
        else:
            recommendations.append("Low-risk PII detected. Standard monitoring applies.")
        
        # Type-specific recommendations
        if "ssn" in detected_pii:
            recommendations.append("SSN detected: Ensure HIPAA/PCI compliance.")
        if "credit_card" in detected_pii:
            recommendations.append("Credit card detected: Ensure PCI DSS compliance.")
        if "email" in detected_pii:
            recommendations.append("Email addresses detected: Consider GDPR compliance.")
        
        return recommendations
    
    def _mask_pii(self, content: str, detected_pii: Dict[str, List[str]]) -> str:
        """Mask detected PII in content"""
        masked_content = content
        
        for pii_type, values in detected_pii.items():
            for value in values:
                # Create mask based on PII type
                if pii_type == "email":
                    mask = "***@***.***"
                elif pii_type == "phone":
                    mask = "***-***-****"
                elif pii_type == "ssn":
                    mask = "***-**-****"
                elif pii_type == "credit_card":
                    mask = "****-****-****-****"
                elif pii_type in ["name", "address"]:
                    mask = "[REDACTED]"
                else:
                    mask = "***"
                
                # Replace with mask
                masked_content = masked_content.replace(value, mask)
        
        return masked_content
    
    async def get_pii_statistics(self) -> Dict[str, Any]:
        """Get PII detection statistics"""
        # This would be enhanced with actual statistics tracking
        return {
            "total_detections": 0,
            "critical_detections": 0,
            "high_detections": 0,
            "medium_detections": 0,
            "low_detections": 0,
            "most_common_pii_types": [],
            "timestamp": datetime.utcnow().isoformat()
        }
    
    async def validate_pii_handling(self, content: str, user_permissions: List[str]) -> Dict[str, Any]:
        """Validate if user has permission to handle detected PII"""
        detection = await self._detect_pii(content, "validation")
        
        if not detection.pii_detected:
            return {"allowed": True, "reason": "No PII detected"}
        
        # Check permissions based on risk level
        if detection.risk_level == "critical":
            required_permissions = ["handle_critical_pii", "admin_access"]
        elif detection.risk_level == "high":
            required_permissions = ["handle_high_pii", "data_access"]
        elif detection.risk_level == "medium":
            required_permissions = ["handle_medium_pii"]
        else:
            required_permissions = ["basic_access"]
        
        has_permission = any(perm in user_permissions for perm in required_permissions)
        
        return {
            "allowed": has_permission,
            "reason": "Permission granted" if has_permission else "Insufficient permissions for PII handling",
            "required_permissions": required_permissions,
            "detected_pii": detection.pii_types,
            "risk_level": detection.risk_level
        }

# Global instance
pii_detector = PIIDetector()

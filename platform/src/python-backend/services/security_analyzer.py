"""
Security Analyzer Service
Analyzes requests and responses for security risks and threats
"""
import re
import json
from typing import Dict, Any, List, Optional
from datetime import datetime
from dataclasses import dataclass
import logging

logger = logging.getLogger(__name__)

@dataclass
class SecurityAnalysis:
    """Security analysis result"""
    risks: List[str]
    risk_level: str  # low, medium, high, critical
    threat_indicators: List[str]
    recommendations: List[str]
    blocked: bool
    confidence_score: float

class SecurityAnalyzer:
    """Security analysis and threat detection service"""
    
    def __init__(self):
        # Security threat patterns
        self.threat_patterns = {
            # SQL Injection patterns
            "sql_injection": [
                r"('|(\\')|(;)|(\\;)|(\\|)|(\\*)|(\\%)|(\\_)|(\\-)|(\\+)|(\\=)|(\\<)|(\\>)|(\\!)|(\\@)|(\\#)|(\\$)|(\\^)|(\\&)|(\\*)|(\\()|(\\))|(\\[)|(\\])|(\\{)|(\\})|(\\|)|(\\\\)|(\\/)|(\\?)|(\\:)|(\\;)|(\\,)|(\\.)|(\\~)|(\\`)|(\\')|(\\\")|(\\\")|(\\\\)|(\\/)|(\\?)|(\\:)|(\\;)|(\\,)|(\\.)|(\\~)|(\\`))",
                r"(union|select|insert|update|delete|drop|create|alter|exec|execute|script|javascript|vbscript|onload|onerror|onclick)",
                r"(or|and)\s+\d+\s*=\s*\d+",
                r"(or|and)\s+['\"]\s*=\s*['\"]"
            ],
            
            # XSS patterns
            "xss": [
                r"<script[^>]*>.*?</script>",
                r"javascript:",
                r"on\w+\s*=",
                r"<iframe[^>]*>",
                r"<object[^>]*>",
                r"<embed[^>]*>",
                r"<link[^>]*>",
                r"<meta[^>]*>",
                r"<style[^>]*>.*?</style>",
                r"expression\s*\(",
                r"url\s*\(",
                r"@import"
            ],
            
            # Command injection patterns
            "command_injection": [
                r"[;&|`$(){}[\]\\]",
                r"(cat|ls|pwd|whoami|id|uname|ps|netstat|ifconfig|ping|nslookup|traceroute|wget|curl|nc|telnet|ssh|ftp)",
                r"(rm|del|mv|cp|chmod|chown|kill|killall|pkill)",
                r"(sudo|su|passwd|useradd|userdel|groupadd|groupdel)"
            ],
            
            # Path traversal patterns
            "path_traversal": [
                r"\.\./",
                r"\.\.\\",
                r"\.\.%2f",
                r"\.\.%5c",
                r"\.\.%252f",
                r"\.\.%255c",
                r"/etc/passwd",
                r"/etc/shadow",
                r"/proc/version",
                r"/proc/cpuinfo",
                r"c:\\windows\\system32",
                r"c:\\boot\\.ini"
            ],
            
            # Sensitive data patterns
            "sensitive_data": [
                r"(password|passwd|pwd)\s*[:=]\s*['\"]?[^'\"]+['\"]?",
                r"(api[_-]?key|apikey)\s*[:=]\s*['\"]?[^'\"]+['\"]?",
                r"(secret|token|auth[_-]?token)\s*[:=]\s*['\"]?[^'\"]+['\"]?",
                r"(private[_-]?key|privatekey)\s*[:=]\s*['\"]?[^'\"]+['\"]?",
                r"(database[_-]?url|db[_-]?url)\s*[:=]\s*['\"]?[^'\"]+['\"]?"
            ],
            
            # Suspicious content patterns
            "suspicious_content": [
                r"(eval|exec|system|shell_exec|passthru|proc_open|popen)",
                r"(base64_decode|base64_encode|url_decode|url_encode)",
                r"(file_get_contents|file_put_contents|fopen|fwrite|fread)",
                r"(include|require|include_once|require_once)",
                r"(curl|wget|fopen|fsockopen|socket_create)"
            ]
        }
        
        # Risk levels for different threat types
        self.risk_levels = {
            "sql_injection": "critical",
            "xss": "high",
            "command_injection": "critical",
            "path_traversal": "high",
            "sensitive_data": "high",
            "suspicious_content": "medium"
        }
        
        # Blocked patterns (immediate blocking)
        self.blocked_patterns = [
            r"rm\s+-rf\s+/",
            r"format\s+c:",
            r"del\s+/s\s+/q\s+c:",
            r"shutdown\s+-h\s+now",
            r"halt\s+-p"
        ]
    
    async def analyze_request(self, traffic_request) -> SecurityAnalysis:
        """Analyze request for security risks"""
        content = ""
        
        # Extract content from request
        if traffic_request.body:
            if isinstance(traffic_request.body, dict):
                content = json.dumps(traffic_request.body)
            else:
                content = str(traffic_request.body)
        
        # Also check headers
        headers_content = json.dumps(traffic_request.headers)
        content += " " + headers_content
        
        return await self._analyze_content(content, "request")
    
    async def analyze_response(self, response_body: Optional[Dict[str, Any]]) -> SecurityAnalysis:
        """Analyze response for security risks"""
        if not response_body:
            return SecurityAnalysis(
                risks=[],
                risk_level="low",
                threat_indicators=[],
                recommendations=[],
                blocked=False,
                confidence_score=0.0
            )
        
        content = json.dumps(response_body)
        
        # Check message content if it's a chat response
        if "choices" in response_body:
            for choice in response_body["choices"]:
                if "message" in choice and "content" in choice["message"]:
                    content += " " + choice["message"]["content"]
        
        return await self._analyze_content(content, "response")
    
    async def _analyze_content(self, content: str, content_type: str) -> SecurityAnalysis:
        """Main security analysis logic"""
        detected_threats = []
        threat_indicators = []
        confidence_scores = []
        
        # Check for blocked patterns first
        for pattern in self.blocked_patterns:
            if re.search(pattern, content, re.IGNORECASE):
                return SecurityAnalysis(
                    risks=["BLOCKED_PATTERN_DETECTED"],
                    risk_level="critical",
                    threat_indicators=[f"Blocked pattern: {pattern}"],
                    recommendations=["Request blocked due to dangerous pattern"],
                    blocked=True,
                    confidence_score=1.0
                )
        
        # Analyze each threat type
        for threat_type, patterns in self.threat_patterns.items():
            for pattern in patterns:
                matches = re.findall(pattern, content, re.IGNORECASE)
                if matches:
                    detected_threats.append(threat_type)
                    threat_indicators.append(f"{threat_type}: {pattern}")
                    
                    # Calculate confidence
                    confidence = self._calculate_confidence(pattern, matches)
                    confidence_scores.append(confidence)
        
        # Determine overall risk level
        risk_level = self._determine_risk_level(detected_threats)
        
        # Generate recommendations
        recommendations = self._generate_recommendations(detected_threats, risk_level)
        
        # Calculate overall confidence
        overall_confidence = max(confidence_scores) if confidence_scores else 0.0
        
        return SecurityAnalysis(
            risks=list(set(detected_threats)),  # Remove duplicates
            risk_level=risk_level,
            threat_indicators=threat_indicators,
            recommendations=recommendations,
            blocked=False,
            confidence_score=overall_confidence
        )
    
    def _calculate_confidence(self, pattern: str, matches: List[str]) -> float:
        """Calculate confidence score for threat detection"""
        base_confidence = 0.6
        
        # Adjust confidence based on pattern specificity
        if len(pattern) > 30:
            base_confidence += 0.2
        elif len(pattern) > 15:
            base_confidence += 0.1
        
        # Adjust based on number of matches
        if len(matches) > 3:
            base_confidence += 0.1
        
        return min(base_confidence, 1.0)
    
    def _determine_risk_level(self, detected_threats: List[str]) -> str:
        """Determine overall risk level based on detected threats"""
        if not detected_threats:
            return "low"
        
        max_risk = "low"
        
        for threat in detected_threats:
            risk_level = self.risk_levels.get(threat, "low")
            
            if risk_level == "critical":
                return "critical"
            elif risk_level == "high" and max_risk in ["low", "medium"]:
                max_risk = "high"
            elif risk_level == "medium" and max_risk == "low":
                max_risk = "medium"
        
        return max_risk
    
    def _generate_recommendations(self, detected_threats: List[str], risk_level: str) -> List[str]:
        """Generate security recommendations"""
        recommendations = []
        
        if risk_level == "critical":
            recommendations.extend([
                "CRITICAL: Immediate security threat detected. Block request.",
                "Review and sanitize input validation mechanisms.",
                "Implement additional security controls."
            ])
        elif risk_level == "high":
            recommendations.extend([
                "High-risk security threat detected. Review request content.",
                "Implement input validation and sanitization.",
                "Consider rate limiting and monitoring."
            ])
        elif risk_level == "medium":
            recommendations.extend([
                "Medium-risk security indicator detected.",
                "Monitor for suspicious patterns.",
                "Review security policies."
            ])
        else:
            recommendations.append("Low-risk indicators detected. Standard monitoring applies.")
        
        # Threat-specific recommendations
        if "sql_injection" in detected_threats:
            recommendations.append("SQL injection detected: Implement parameterized queries.")
        if "xss" in detected_threats:
            recommendations.append("XSS detected: Implement output encoding and CSP headers.")
        if "command_injection" in detected_threats:
            recommendations.append("Command injection detected: Avoid system command execution.")
        if "sensitive_data" in detected_threats:
            recommendations.append("Sensitive data detected: Implement data encryption and access controls.")
        
        return recommendations
    
    async def get_security_statistics(self) -> Dict[str, Any]:
        """Get security analysis statistics"""
        return {
            "total_analyses": 0,
            "critical_threats": 0,
            "high_threats": 0,
            "medium_threats": 0,
            "low_threats": 0,
            "blocked_requests": 0,
            "most_common_threats": [],
            "timestamp": datetime.utcnow().isoformat()
        }
    
    async def validate_security_policy(self, content: str, user_permissions: List[str]) -> Dict[str, Any]:
        """Validate content against security policies"""
        analysis = await self._analyze_content(content, "policy_validation")
        
        # Check if user has permission to handle high-risk content
        if analysis.risk_level in ["critical", "high"]:
            required_permissions = ["handle_high_risk_content", "security_admin"]
            has_permission = any(perm in user_permissions for perm in required_permissions)
            
            if not has_permission:
                analysis.blocked = True
                analysis.recommendations.append("Insufficient permissions for high-risk content")
        
        return {
            "allowed": not analysis.blocked,
            "risk_level": analysis.risk_level,
            "threats": analysis.risks,
            "recommendations": analysis.recommendations,
            "confidence": analysis.confidence_score
        }

# Global instance
security_analyzer = SecurityAnalyzer()

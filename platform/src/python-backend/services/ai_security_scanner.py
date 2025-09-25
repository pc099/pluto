# services/ai_security_scanner.py
import re
import json
import hashlib
from typing import Dict, List, Any, Tuple
from datetime import datetime

class AISecurityScanner:
    def __init__(self):
        self.prompt_injection_patterns = self._load_prompt_injection_patterns()
        self.jailbreak_patterns = self._load_jailbreak_patterns()
        self.data_exfiltration_patterns = self._load_data_exfiltration_patterns()
        self.sensitive_data_patterns = self._load_sensitive_data_patterns()
    
    async def scan_request(self, request_content: str, user_id: str = None, 
                          team_id: str = None) -> Dict[str, Any]:
        """Comprehensive security scan of AI request"""
        
        scan_results = {
            'timestamp': datetime.now().isoformat(),
            'request_hash': hashlib.md5(request_content.encode()).hexdigest(),
            'user_id': user_id,
            'team_id': team_id,
            'threats_detected': [],
            'severity': 'low',
            'blocked': False,
            'details': {}
        }
        
        # 1. Prompt Injection Detection
        injection_threats = await self._detect_prompt_injection(request_content)
        if injection_threats:
            scan_results['threats_detected'].extend(injection_threats)
        
        # 2. Jailbreak Attempt Detection
        jailbreak_threats = await self._detect_jailbreak_attempts(request_content)
        if jailbreak_threats:
            scan_results['threats_detected'].extend(jailbreak_threats)
        
        # 3. Data Exfiltration Detection
        exfiltration_threats = await self._detect_data_exfiltration(request_content)
        if exfiltration_threats:
            scan_results['threats_detected'].extend(exfiltration_threats)
        
        # 4. Sensitive Data Detection
        sensitive_data_threats = await self._detect_sensitive_data(request_content)
        if sensitive_data_threats:
            scan_results['threats_detected'].extend(sensitive_data_threats)
        
        # 5. Adversarial Input Detection
        adversarial_threats = await self._detect_adversarial_inputs(request_content)
        if adversarial_threats:
            scan_results['threats_detected'].extend(adversarial_threats)
        
        # Determine overall severity and blocking decision
        scan_results['severity'] = self._calculate_threat_severity(scan_results['threats_detected'])
        scan_results['blocked'] = self._should_block_request(scan_results['threats_detected'])
        
        # Add detailed analysis
        scan_results['details'] = {
            'total_threats': len(scan_results['threats_detected']),
            'threat_categories': list(set(t['category'] for t in scan_results['threats_detected'])),
            'highest_confidence': max((t['confidence'] for t in scan_results['threats_detected']), default=0),
            'risk_score': self._calculate_risk_score(scan_results['threats_detected'])
        }
        
        return scan_results
    
    async def _detect_prompt_injection(self, content: str) -> List[Dict[str, Any]]:
        """Detect prompt injection attempts"""
        threats = []
        content_lower = content.lower()
        
    async def _detect_data_exfiltration(self, content: str) -> List[Dict[str, Any]]:
        """Detect potential data exfiltration attempts"""
        threats = []
        content_lower = content.lower()
        
        for pattern_name, pattern_config in self.data_exfiltration_patterns.items():
            for pattern in pattern_config['patterns']:
                if re.search(pattern, content_lower, re.IGNORECASE):
                    threat = {
                        'category': 'data_exfiltration',
                        'type': pattern_name,
                        'confidence': pattern_config['confidence'],
                        'severity': pattern_config['severity'],
                        'description': pattern_config['description'],
                        'detected_at': datetime.now().isoformat()
                    }
                    threats.append(threat)
        
        return threats
    
    async def _detect_sensitive_data(self, content: str) -> List[Dict[str, Any]]:
        """Detect sensitive data in requests"""
        threats = []
        
        for pattern_name, pattern_config in self.sensitive_data_patterns.items():
            for pattern in pattern_config['patterns']:
                matches = re.findall(pattern, content, re.IGNORECASE)
                
                if matches:
                    threat = {
                        'category': 'sensitive_data',
                        'type': pattern_name,
                        'confidence': pattern_config['confidence'],
                        'severity': pattern_config['severity'],
                        'description': pattern_config['description'],
                        'matches_count': len(matches),
                        'detected_at': datetime.now().isoformat()
                    }
                    threats.append(threat)
        
        return threats
    
    async def _detect_adversarial_inputs(self, content: str) -> List[Dict[str, Any]]:
        """Detect adversarial inputs designed to manipulate AI"""
        threats = []
        
        # Check for excessive repetition (potential token manipulation)
        words = content.split()
        if len(words) > 10:
            word_counts = {}
            for word in words:
                word_counts[word] = word_counts.get(word, 0) + 1
            
            max_repetition = max(word_counts.values())
            if max_repetition > len(words) * 0.3:  # More than 30% repetition
                threats.append({
                    'category': 'adversarial_input',
                    'type': 'excessive_repetition',
                    'confidence': 0.8,
                    'severity': 'medium',
                    'description': 'Detected excessive word repetition potentially designed to manipulate token processing',
                    'detected_at': datetime.now().isoformat()
                })
        
        # Check for unusual character patterns
        if len(set(content)) < len(content) * 0.1 and len(content) > 50:
            threats.append({
                'category': 'adversarial_input',
                'type': 'low_character_diversity',
                'confidence': 0.7,
                'severity': 'low',
                'description': 'Detected low character diversity potentially indicating adversarial input',
                'detected_at': datetime.now().isoformat()
            })
        
        # Check for extremely long inputs (potential DoS)
        if len(content) > 50000:
            threats.append({
                'category': 'adversarial_input',
                'type': 'excessive_length',
                'confidence': 0.9,
                'severity': 'high',
                'description': 'Request exceeds reasonable length limits',
                'detected_at': datetime.now().isoformat()
            })
        
        return threats
    
    def _calculate_threat_severity(self, threats: List[Dict[str, Any]]) -> str:
        """Calculate overall threat severity"""
        if not threats:
            return 'low'
        
        severity_scores = {'low': 1, 'medium': 2, 'high': 3, 'critical': 4}
        max_severity_score = max(severity_scores.get(t['severity'], 1) for t in threats)
        
        for severity, score in severity_scores.items():
            if score == max_severity_score:
                return severity
        
        return 'low'
    
    def _should_block_request(self, threats: List[Dict[str, Any]]) -> bool:
        """Determine if request should be blocked"""
        if not threats:
            return False
        
        # Block if any critical or high severity threats
        for threat in threats:
            if threat['severity'] in ['critical', 'high']:
                return True
            
            # Block if multiple medium threats
            if threat['severity'] == 'medium' and len([t for t in threats if t['severity'] == 'medium']) >= 2:
                return True
        
        return False
    
    def _calculate_risk_score(self, threats: List[Dict[str, Any]]) -> float:
        """Calculate numerical risk score"""
        if not threats:
            return 0.0
        
        severity_weights = {'low': 0.25, 'medium': 0.5, 'high': 0.8, 'critical': 1.0}
        
        total_score = 0
        for threat in threats:
            confidence = threat.get('confidence', 0.5)
            severity_weight = severity_weights.get(threat['severity'], 0.25)
            total_score += confidence * severity_weight
        
        return min(total_score, 1.0)
    
    def _load_prompt_injection_patterns(self) -> Dict[str, Any]:
        """Load prompt injection detection patterns"""
        return {
            'ignore_instructions': {
                'patterns': [
                    r'ignore.*previous.*instructions',
                    r'forget.*above.*instructions',
                    r'disregard.*system.*prompt',
                    r'override.*instructions'
                ],
                'confidence': 0.9,
                'severity': 'high',
                'description': 'Attempt to override system instructions'
            },
            'role_manipulation': {
                'patterns': [
                    r'you are now.*',
                    r'pretend to be.*',
                    r'act as.*',
                    r'roleplay.*'
                ],
                'confidence': 0.7,
                'severity': 'medium',
                'description': 'Attempt to manipulate AI role or behavior'
            },
            'system_prompt_extraction': {
                'patterns': [
                    r'show.*system.*prompt',
                    r'what.*your.*instructions',
                    r'reveal.*your.*prompt',
                    r'output.*system.*message'
                ],
                'confidence': 0.8,
                'severity': 'high',
                'description': 'Attempt to extract system prompts or instructions'
            }
        }
    
    def _load_jailbreak_patterns(self) -> Dict[str, Any]:
        """Load jailbreak detection patterns"""
        return {
            'dan_style': {
                'patterns': [
                    r'do anything now',
                    r'DAN.*mode',
                    r'jailbreak.*mode',
                    r'unrestricted.*AI'
                ],
                'confidence': 0.95,
                'severity': 'critical',
                'description': 'DAN-style jailbreak attempt'
            },
            'ethical_bypass': {
                'patterns': [
                    r'ignore.*ethics',
                    r'bypass.*safety',
                    r'without.*restrictions',
                    r'remove.*limitations'
                ],
                'confidence': 0.8,
                'severity': 'high',
                'description': 'Attempt to bypass ethical guidelines'
            },
            'hypothetical_scenarios': {
                'patterns': [
                    r'hypothetically.*if.*no.*rules',
                    r'imagine.*no.*guidelines',
                    r'in.*alternate.*universe.*where'
                ],
                'confidence': 0.6,
                'severity': 'medium',
                'description': 'Hypothetical scenario used to bypass restrictions'
            }
        }
    
    def _load_data_exfiltration_patterns(self) -> Dict[str, Any]:
        """Load data exfiltration detection patterns"""
        return {
            'data_requests': {
                'patterns': [
                    r'show.*all.*data',
                    r'export.*database',
                    r'dump.*all.*information',
                    r'list.*all.*users'
                ],
                'confidence': 0.8,
                'severity': 'high',
                'description': 'Attempt to extract bulk data'
            },
            'credential_harvesting': {
                'patterns': [
                    r'show.*passwords',
                    r'list.*API.*keys',
                    r'reveal.*tokens',
                    r'display.*credentials'
                ],
                'confidence': 0.9,
                'severity': 'critical',
                'description': 'Attempt to harvest credentials'
            }
        }
    
    def _load_sensitive_data_patterns(self) -> Dict[str, Any]:
        """Load sensitive data detection patterns"""
        return {
            'social_security': {
                'patterns': [r'\b\d{3}-\d{2}-\d{4}\b'],
                'confidence': 0.95,
                'severity': 'high',
                'description': 'Social Security Number detected'
            },
            'credit_card': {
                'patterns': [r'\b(?:\d{4}[-\s]?){3}\d{4}\b'],
                'confidence': 0.9,
                'severity': 'high',
                'description': 'Credit card number detected'
            },
            'email_addresses': {
                'patterns': [r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'],
                'confidence': 0.8,
                'severity': 'medium',
                'description': 'Email addresses detected'
            },
            'phone_numbers': {
                'patterns': [r'\b(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}\b'],
                'confidence': 0.7,
                'severity': 'medium',
                'description': 'Phone numbers detected'
            },
            'api_keys': {
                'patterns': [
                    r'sk-[a-zA-Z0-9]{48}',  # OpenAI API keys
                    r'AKIA[0-9A-Z]{16}',    # AWS Access Keys
                    r'AIza[0-9A-Za-z-_]{35}' # Google API keys
                ],
                'confidence': 0.95,
                'severity': 'critical',
                'description': 'API keys or tokens detected'
            },
            'passwords': {
                'patterns': [
                    r'password\s*[:=]\s*[^\s]+',
                    r'pwd\s*[:=]\s*[^\s]+',
                    r'pass\s*[:=]\s*[^\s]+'
                ],
                'confidence': 0.7,
                'severity': 'high',
                'description': 'Password-like patterns detected'
            }
        }

# Create singleton instance
ai_security_scanner = AISecurityScanner(), pattern_config in self.prompt_injection_patterns.items():
            for pattern in pattern_config['patterns']:
                matches = re.findall(pattern, content_lower, re.IGNORECASE)
                
                if matches:
                    threat = {
                        'category': 'prompt_injection',
                        'type': pattern_name,
                        'confidence': pattern_config['confidence'],
                        'severity': pattern_config['severity'],
                        'description': pattern_config['description'],
                        'matches': matches[:5],  # Limit matches for privacy
                        'detected_at': datetime.now().isoformat()
                    }
                    threats.append(threat)
        
        return threats
    
    async def _detect_jailbreak_attempts(self, content: str) -> List[Dict[str, Any]]:
        """Detect jailbreak attempts"""
        threats = []
        content_lower = content.lower()
        
        for pattern_name, pattern_config in self.jailbreak_patterns.items():
            for pattern in pattern_config['patterns']:
                if re.search(pattern, content_lower, re.IGNORECASE):
                    threat = {
                        'category': 'jailbreak_attempt',
                        'type': pattern_name,
                        'confidence': pattern_config['confidence'],
                        'severity': pattern_config['severity'],
                        'description': pattern_config['description'],
                        'detected_at': datetime.now().isoformat()
                    }
                    threats.append(threat)
        
        return threats
    
    async def _detect_data_exfiltration(self, content: str) -> List[Dict[str, Any]]:
        """Detect potential data exfiltration attempts"""
        threats = []
        content_lower = content.lower()
        
        for pattern_name
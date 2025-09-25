# services/compliance_framework.py
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import json

class AIComplianceFramework:
    def __init__(self):
        self.frameworks = {
            'NIST_AI_RMF': self._load_nist_framework(),
            'EU_AI_ACT': self._load_eu_ai_act(),
            'HIPAA': self._load_hipaa_requirements(),
            'GDPR': self._load_gdpr_requirements(),
            'SOX': self._load_sox_requirements(),
            'ISO_27001': self._load_iso27001_requirements()
        }
        self.compliance_history = []
    
    async def assess_compliance(self, request_data: Dict[str, Any], 
                              response_data: Dict[str, Any],
                              quality_analysis: Dict[str, Any],
                              security_scan: Dict[str, Any],
                              user_context: Dict[str, Any]) -> Dict[str, Any]:
        """Assess compliance across all applicable frameworks"""
        
        assessment = {
            'timestamp': datetime.now().isoformat(),
            'request_id': request_data.get('request_id'),
            'user_id': user_context.get('user_id'),
            'team_id': user_context.get('team_id'),
            'frameworks': {},
            'overall_compliance': True,
            'violations': [],
            'recommendations': []
        }
        
        # Assess each framework
        for framework_name, framework_config in self.frameworks.items():
            framework_result = await self._assess_framework_compliance(
                framework_name, framework_config, request_data, response_data,
                quality_analysis, security_scan, user_context
            )
            
            assessment['frameworks'][framework_name] = framework_result
            
            if not framework_result['compliant']:
                assessment['overall_compliance'] = False
                assessment['violations'].extend(framework_result['violations'])
            
            assessment['recommendations'].extend(framework_result['recommendations'])
        
        # Store assessment for audit trail
        self.compliance_history.append(assessment)
        
        # Keep only last 10,000 assessments for performance
        if len(self.compliance_history) > 10000:
            self.compliance_history = self.compliance_history[-10000:]
        
        return assessment
    
    async def generate_compliance_report(self, framework: str, 
                                       start_date: datetime, 
                                       end_date: datetime,
                                       team_id: str = None) -> Dict[str, Any]:
        """Generate compliance report for specific framework and time period"""
        
        # Filter assessments by criteria
        filtered_assessments = [
            assessment for assessment in self.compliance_history
            if (start_date <= datetime.fromisoformat(assessment['timestamp']) <= end_date and
                (not team_id or assessment.get('team_id') == team_id))
        ]
        
        if framework not in self.frameworks:
            return {'error': f'Unknown framework: {framework}'}
        
        # Analyze compliance data
        total_assessments = len(filtered_assessments)
        compliant_assessments = len([a for a in filtered_assessments 
                                   if a['frameworks'].get(framework, {}).get('compliant', False)])
        
        violation_counts = {}
        for assessment in filtered_assessments:
            framework_data = assessment['frameworks'].get(framework, {})
            for violation in framework_data.get('violations', []):
                violation_type = violation.get('requirement_id', 'unknown')
                violation_counts[violation_type] = violation_counts.get(violation_type, 0) + 1
        
        report = {
            'framework': framework,
            'period': {
                'start': start_date.isoformat(),
                'end': end_date.isoformat()
            },
            'summary': {
                'total_assessments': total_assessments,
                'compliant_assessments': compliant_assessments,
                'compliance_rate': compliant_assessments / total_assessments if total_assessments > 0 else 0,
                'total_violations': sum(violation_counts.values())
            },
            'violations_by_type': violation_counts,
            'recommendations': self._generate_compliance_recommendations(framework, violation_counts),
            'generated_at': datetime.now().isoformat()
        }
        
        return report
    
    async def _assess_framework_compliance(self, framework_name: str,
                                         framework_config: Dict[str, Any],
                                         request_data: Dict[str, Any],
                                         response_data: Dict[str, Any],
                                         quality_analysis: Dict[str, Any],
                                         security_scan: Dict[str, Any],
                                         user_context: Dict[str, Any]) -> Dict[str, Any]:
        """Assess compliance for a specific framework"""
        
        result = {
            'framework': framework_name,
            'compliant': True,
            'violations': [],
            'recommendations': [],
            'requirements_checked': len(framework_config.get('requirements', {}))
        }
        
        requirements = framework_config.get('requirements', {})
        
        for req_id, requirement in requirements.items():
            violation = await self._check_requirement_compliance(
                req_id, requirement, request_data, response_data,
                quality_analysis, security_scan, user_context
            )
            
            if violation:
                result['compliant'] = False
                result['violations'].append(violation)
                
                # Add specific recommendations
                if requirement.get('remediation'):
                    result['recommendations'].append({
                        'requirement_id': req_id,
                        'remediation': requirement['remediation'],
                        'priority': requirement.get('priority', 'medium')
                    })
        
        return result
    
    async def _check_requirement_compliance(self, req_id: str, requirement: Dict[str, Any],
                                          request_data: Dict[str, Any],
                                          response_data: Dict[str, Any],
                                          quality_analysis: Dict[str, Any],
                                          security_scan: Dict[str, Any],
                                          user_context: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Check compliance for a specific requirement"""
        
        check_type = requirement.get('check_type')
        
        if check_type == 'data_protection':
            return await self._check_data_protection(req_id, requirement, request_data, security_scan)
        elif check_type == 'quality_assurance':
            return await self._check_quality_assurance(req_id, requirement, quality_analysis)
        elif check_type == 'audit_trail':
            return await self._check_audit_trail(req_id, requirement, request_data, user_context)
        elif check_type == 'access_control':
            return await self._check_access_control(req_id, requirement, user_context)
        elif check_type == 'transparency':
            return await self._check_transparency(req_id, requirement, request_data, response_data)
        
        return None
    
    async def _check_data_protection(self, req_id: str, requirement: Dict[str, Any],
                                   request_data: Dict[str, Any],
                                   security_scan: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Check data protection compliance"""
        
        # Check for sensitive data in request
        sensitive_threats = [t for t in security_scan.get('threats_detected', []) 
                           if t['category'] == 'sensitive_data']
        
        if sensitive_threats and requirement.get('no_sensitive_data', False):
            return {
                'requirement_id': req_id,
                'requirement_name': requirement['name'],
                'violation_type': 'sensitive_data_detected',
                'severity': 'high',
                'details': f"Detected {len(sensitive_threats)} sensitive data patterns",
                'evidence': [t['type'] for t in sensitive_threats]
            }
        
        return None
    
    async def _check_quality_assurance(self, req_id: str, requirement: Dict[str, Any],
                                     quality_analysis: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Check quality assurance compliance"""
        
        min_quality_score = requirement.get('min_quality_score', 0)
        actual_quality_score = quality_analysis.get('quality_score', 10)
        
        if actual_quality_score < min_quality_score:
            return {
                'requirement_id': req_id,
                'requirement_name': requirement['name'],
                'violation_type': 'quality_below_threshold',
                'severity': 'medium',
                'details': f"Quality score {actual_quality_score} below required {min_quality_score}",
                'evidence': {
                    'actual_score': actual_quality_score,
                    'required_score': min_quality_score,
                    'hallucination_risk': quality_analysis.get('hallucination_risk')
                }
            }
        
        return None
    
    async def _check_audit_trail(self, req_id: str, requirement: Dict[str, Any],
                               request_data: Dict[str, Any],
                               user_context: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Check audit trail compliance"""
        
        required_fields = requirement.get('required_audit_fields', [])
        missing_fields = []
        
        audit_data = {**request_data, **user_context}
        
        for field in required_fields:
            if field not in audit_data or not audit_data[field]:
                missing_fields.append(field)
        
        if missing_fields:
            return {
                'requirement_id': req_id,
                'requirement_name': requirement['name'],
                'violation_type': 'incomplete_audit_trail',
                'severity': 'medium',
                'details': f"Missing audit fields: {', '.join(missing_fields)}",
                'evidence': {'missing_fields': missing_fields}
            }
        
        return None
    
    async def _check_access_control(self, req_id: str, requirement: Dict[str, Any],
                                  user_context: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Check access control compliance"""
        
        required_role = requirement.get('required_role')
        user_role = user_context.get('role')
        
        if required_role and user_role != required_role:
            return {
                'requirement_id': req_id,
                'requirement_name': requirement['name'],
                'violation_type': 'insufficient_access_rights',
                'severity': 'high',
                'details': f"User role '{user_role}' insufficient for requirement '{required_role}'",
                'evidence': {
                    'user_role': user_role,
                    'required_role': required_role
                }
            }
        
        return None
    
    async def _check_transparency(self, req_id: str, requirement: Dict[str, Any],
                                request_data: Dict[str, Any],
                                response_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Check transparency compliance"""
        
        # Check if AI involvement is disclosed
        if requirement.get('disclose_ai_involvement', False):
            # This would typically check if the response includes AI disclosure
            # For now, we'll assume compliance unless explicitly flagged
            pass
        
        return None
    
    def _generate_compliance_recommendations(self, framework: str, 
                                          violation_counts: Dict[str, int]) -> List[Dict[str, Any]]:
        """Generate recommendations based on violation patterns"""
        
        recommendations = []
        
        # High-frequency violations get priority recommendations
        for violation_type, count in violation_counts.items():
            if count > 10:  # High frequency threshold
                recommendations.append({
                    'type': 'high_frequency_violation',
                    'violation_type': violation_type,
                    'count': count,
                    'recommendation': f"Address recurring {violation_type} violations through policy updates",
                    'priority': 'high'
                })
        
        # Framework-specific recommendations
        if framework == 'HIPAA' and 'sensitive_data_detected' in violation_counts:
            recommendations.append({
                'type': 'framework_specific',
                'recommendation': 'Implement additional PII scanning for HIPAA compliance',
                'priority': 'critical'
            })
        
        return recommendations
    
    def _load_nist_framework(self) -> Dict[str, Any]:
        """Load NIST AI Risk Management Framework requirements"""
        return {
            'name': 'NIST AI Risk Management Framework',
            'version': '1.0',
            'requirements': {
                'GOVERN-1.1': {
                    'name': 'AI governance processes',
                    'check_type': 'audit_trail',
                    'required_audit_fields': ['user_id', 'team_id', 'timestamp'],
                    'remediation': 'Ensure all AI requests include proper user identification and timestamps'
                },
                'MAP-1.1': {
                    'name': 'AI system documentation',
                    'check_type': 'audit_trail',
                    'required_audit_fields': ['model', 'provider'],
                    'remediation': 'Document AI model and provider information for all requests'
                },
                'MEASURE-2.1': {
                    'name': 'AI system performance monitoring',
                    'check_type': 'quality_assurance',
                    'min_quality_score': 7.0,
                    'remediation': 'Implement quality monitoring to maintain minimum performance standards'
                },
                'MANAGE-1.1': {
                    'name': 'Risk management processes',
                    'check_type': 'data_protection',
                    'no_sensitive_data': True,
                    'remediation': 'Implement data scanning to prevent sensitive data exposure'
                }
            }
        }
    
    def _load_eu_ai_act(self) -> Dict[str, Any]:
        """Load EU AI Act requirements"""
        return {
            'name': 'EU AI Act',
            'version': '2024',
            'requirements': {
                'ART-9': {
                    'name': 'Risk management system',
                    'check_type': 'quality_assurance',
                    'min_quality_score': 8.0,
                    'remediation': 'Maintain high quality standards for AI systems'
                },
                'ART-10': {
                    'name': 'Data and data governance',
                    'check_type': 'data_protection',
                    'no_sensitive_data': True,
                    'remediation': 'Implement comprehensive data protection measures'
                },
                'ART-12': {
                    'name': 'Record-keeping',
                    'check_type': 'audit_trail',
                    'required_audit_fields': ['user_id', 'timestamp', 'model', 'provider'],
                    'remediation': 'Maintain detailed records of AI system operations'
                },
                'ART-13': {
                    'name': 'Transparency and provision of information',
                    'check_type': 'transparency',
                    'disclose_ai_involvement': True,
                    'remediation': 'Ensure users are informed about AI system involvement'
                }
            }
        }
    
    def _load_hipaa_requirements(self) -> Dict[str, Any]:
        """Load HIPAA requirements for healthcare AI"""
        return {
            'name': 'HIPAA Privacy and Security Rules',
            'requirements': {
                'PRIVACY-RULE': {
                    'name': 'Protected Health Information',
                    'check_type': 'data_protection',
                    'no_sensitive_data': True,
                    'remediation': 'Prevent PHI from being processed by AI systems'
                },
                'SECURITY-RULE': {
                    'name': 'Administrative Safeguards',
                    'check_type': 'access_control',
                    'required_role': 'healthcare_authorized',
                    'remediation': 'Ensure only authorized healthcare personnel access AI systems'
                }
            }
        }
    
    def _load_gdpr_requirements(self) -> Dict[str, Any]:
        """Load GDPR requirements"""
        return {
            'name': 'General Data Protection Regulation',
            'requirements': {
                'ART-6': {
                    'name': 'Lawful basis for processing',
                    'check_type': 'audit_trail',
                    'required_audit_fields': ['user_id', 'consent_status'],
                    'remediation': 'Document lawful basis for processing personal data'
                },
                'ART-32': {
                    'name': 'Security of processing',
                    'check_type': 'data_protection',
                    'no_sensitive_data': True,
                    'remediation': 'Implement appropriate security measures'
                }
            }
        }
    
    def _load_sox_requirements(self) -> Dict[str, Any]:
        """Load SOX requirements for financial AI"""
        return {
            'name': 'Sarbanes-Oxley Act',
            'requirements': {
                'SEC-302': {
                    'name': 'Corporate responsibility for financial reports',
                    'check_type': 'audit_trail',
                    'required_audit_fields': ['user_id', 'team_id', 'timestamp', 'purpose'],
                    'remediation': 'Maintain detailed audit trails for financial AI usage'
                }
            }
        }
    
    def _load_iso27001_requirements(self) -> Dict[str, Any]:
        """Load ISO 27001 requirements"""
        return {
            'name': 'ISO 27001 Information Security',
            'requirements': {
                'A-9-1-1': {
                    'name': 'Access control policy',
                    'check_type': 'access_control',
                    'required_role': 'authorized_user',
                    'remediation': 'Implement access control policies for AI systems'
                },
                'A-12-6-1': {
                    'name': 'Management of technical vulnerabilities',
                    'check_type': 'data_protection',
                    'no_sensitive_data': True,
                    'remediation': 'Address security vulnerabilities in AI systems'
                }
            }
        }

# Create singleton instance
compliance_framework = AIComplianceFramework()
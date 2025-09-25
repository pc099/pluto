# services/database_service.py
import os
from supabase import create_client, Client
from typing import Optional, Dict, Any, List
from dotenv import load_dotenv

load_dotenv()

class DatabaseService:
    def __init__(self):
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_SERVICE_KEY")
        
        if not url or not key:
            print("Warning: SUPABASE_URL and SUPABASE_SERVICE_KEY not set. Using mock database.")
            self.supabase = None
        else:
            try:
                self.supabase: Client = create_client(url, key)
            except Exception as e:
                print(f"Warning: Failed to connect to Supabase: {e}. Using mock database.")
                self.supabase = None
    
    def create_agent(self, name: str, lambda_function_name: str, user_id: str = None) -> Dict[str, Any]:
        """Create a new agent record in database"""
        try:
            agent_data = {
                'name': name,
                'lambda_function_name': lambda_function_name,
                'status': 'running',
            }
            
            # Only add user_id if provided
            if user_id:
                agent_data['user_id'] = user_id
            
            response = self.supabase.table('agents').insert(agent_data).execute()
            
            if response.data:
                return {
                    'success': True,
                    'agent': response.data[0]
                }
            else:
                return {
                    'success': False,
                    'error': 'Failed to create agent record'
                }
                
        except Exception as e:
            print(f"Database error creating agent: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def get_agents(self, user_id: str = None) -> List[Dict[str, Any]]:
        """Get all agents for a user"""
        try:
            query = self.supabase.table('agents').select('*').order('created_at', desc=True)
            
            if user_id:
                query = query.eq('user_id', user_id)
            
            response = query.execute()
            return response.data if response.data else []
            
        except Exception as e:
            print(f"Database error getting agents: {str(e)}")
            return []
    
    def get_agent_by_id(self, agent_id: str) -> Optional[Dict[str, Any]]:
        """Get a specific agent by ID"""
        try:
            response = self.supabase.table('agents').select('*').eq('id', agent_id).execute()
            
            if response.data and len(response.data) > 0:
                return response.data[0]
            return None
            
        except Exception as e:
            print(f"Database error getting agent: {str(e)}")
            return None
    
    def update_agent_status(self, agent_id: str, status: str) -> bool:
        """Update agent status"""
        try:
            response = self.supabase.table('agents').update({
                'status': status
            }).eq('id', agent_id).execute()
            
            return response.data is not None
            
        except Exception as e:
            print(f"Database error updating agent status: {str(e)}")
            return False
    
    def delete_agent(self, agent_id: str) -> bool:
        """Delete an agent record"""
        try:
            response = self.supabase.table('agents').delete().eq('id', agent_id).execute()
            return response.data is not None
            
        except Exception as e:
            print(f"Database error deleting agent: {str(e)}")
            return False
    
    def create_mcp_server(self, name: str, endpoint: str) -> Dict[str, Any]:
        """Create a new MCP server record"""
        try:
            mcp_data = {
                'name': name,
                'endpoint': endpoint
            }
            
            response = self.supabase.table('mcp_servers').insert(mcp_data).execute()
            
            if response.data:
                return {
                    'success': True,
                    'mcp_server': response.data[0]
                }
            else:
                return {
                    'success': False,
                    'error': 'Failed to create MCP server record'
                }
                
        except Exception as e:
            print(f"Database error creating MCP server: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def get_mcp_servers(self) -> List[Dict[str, Any]]:
        """Get all MCP servers"""
        try:
            response = self.supabase.table('mcp_servers').select('*').order('created_at', desc=True).execute()
            return response.data if response.data else []
            
        except Exception as e:
            print(f"Database error getting MCP servers: {str(e)}")

    async def log_ai_request(self, log_entry: Dict[str, Any]) -> bool:
        """Log AI API request to database"""
        try:
            response = self.supabase.table('ai_request_logs').insert(log_entry).execute()
            return response.data is not None
        except Exception as e:
            print(f"Error logging AI request: {str(e)}")
            return False

    async def log_quality_analysis(self, quality_analysis: Dict[str, Any]) -> bool:
        """Log AI quality analysis to database"""
        try:
            # Prepare quality analysis data for database
            analysis_data = {
                'analysis_id': quality_analysis.get('analysis_id'),
                'timestamp': quality_analysis.get('timestamp'),
                'model': quality_analysis.get('model'),
                'provider': quality_analysis.get('provider'),
                'overall_quality_score': quality_analysis.get('overall_quality_score', 0),
                'risk_level': quality_analysis.get('risk_level', 'UNKNOWN'),
                'analysis_duration_ms': int(quality_analysis.get('analysis_duration_ms', 0)),
                
                # Detailed scores (fit database precision 4,3 - max value 9.999)
                'hallucination_risk': min(9.999, float(quality_analysis.get('detailed_scores', {}).get('hallucination_risk', 0))),
                'confidence_score': min(9.999, float(quality_analysis.get('detailed_scores', {}).get('confidence_score', 0))),
                'factual_consistency': min(9.999, float(quality_analysis.get('detailed_scores', {}).get('factual_consistency', 0))),
                'toxicity_score': min(9.999, float(quality_analysis.get('detailed_scores', {}).get('toxicity_score', 0))),
                'bias_score': min(9.999, float(quality_analysis.get('detailed_scores', {}).get('bias_score', 0))),
                
                # Security analysis
                'security_score': min(9.999, float(quality_analysis.get('security_analysis', {}).get('security_score', 1))),
                'prompt_injection_detected': quality_analysis.get('security_analysis', {}).get('prompt_injection_detected', False),
                'data_extraction_attempt': quality_analysis.get('security_analysis', {}).get('data_extraction_attempt', False),
                'malicious_request': quality_analysis.get('security_analysis', {}).get('malicious_request', False),
                'detected_security_patterns': quality_analysis.get('security_analysis', {}).get('detected_patterns', []),
                'security_risk_indicators': quality_analysis.get('security_analysis', {}).get('risk_indicators', []),
                
                # Results
                'recommendations': quality_analysis.get('recommendations', []),
                'alerts': quality_analysis.get('alerts', [])
            }
            
            response = self.supabase.table('ai_quality_analysis').insert(analysis_data).execute()
            return response.data is not None
        except Exception as e:
            print(f"Error logging quality analysis: {str(e)}")
            return False

    async def store_quality_analysis(self, quality_data: Dict[str, Any]) -> bool:
        """Store quality analysis data in a simplified format"""
        try:
            # Convert the quality data to match our database schema
            analysis_data = {
                'analysis_id': quality_data.get('analysis_id'),
                'timestamp': quality_data.get('created_at'),
                'model': quality_data.get('model', 'unknown'),
                'provider': quality_data.get('provider', 'unknown'),
                'overall_quality_score': float(quality_data.get('quality_score', 0)),
                'risk_level': 'UNKNOWN',
                'analysis_duration_ms': 0,
                
                # Convert scores to fit database precision (4,3 - max value 9.999)
                'hallucination_risk': min(9.999, float(quality_data.get('hallucination_risk', 0))) if isinstance(quality_data.get('hallucination_risk'), (int, float)) else 0,
                'confidence_score': min(9.999, float(quality_data.get('confidence_score', 0))),
                'factual_consistency': 0,
                'toxicity_score': 0,
                'bias_score': 0,
                
                # Security analysis
                'security_score': 100,  # Default to safe
                'prompt_injection_detected': False,
                'data_extraction_attempt': False,
                'malicious_request': False,
                'detected_security_patterns': quality_data.get('security_threats', []),
                'security_risk_indicators': [],
                
                # Results
                'recommendations': [],
                'alerts': []
            }
            
            response = self.supabase.table('ai_quality_analysis').insert(analysis_data).execute()
            return response.data is not None
        except Exception as e:
            print(f"Error storing quality analysis: {str(e)}")
            return False

    def get_quality_statistics(self, days: int = 7, user_id: str = None, team_id: str = None, provider: str = None) -> Dict[str, Any]:
        """Get quality analysis statistics"""
        try:
            # Use the database function for efficient querying
            params = {
                'p_days': days,
                'p_user_id': user_id,
                'p_team_id': team_id,
                'p_provider': provider
            }
            
            response = self.supabase.rpc('get_quality_stats', params).execute()
            
            if response.data and len(response.data) > 0:
                stats = response.data[0]
                return {
                    'total_analyzed': stats.get('total_analyzed', 0),
                    'avg_quality_score': float(stats.get('avg_quality_score', 0) or 0),
                    'high_risk_count': stats.get('high_risk_count', 0),
                    'hallucination_alerts': stats.get('hallucination_alerts', 0),
                    'security_incidents': stats.get('security_incidents', 0),
                    'prompt_injections': stats.get('prompt_injections', 0),
                    'data_extractions': stats.get('data_extractions', 0),
                    'malicious_requests': stats.get('malicious_requests', 0)
                }
            else:
                return {
                    'total_analyzed': 0,
                    'avg_quality_score': 0.0,
                    'high_risk_count': 0,
                    'hallucination_alerts': 0,
                    'security_incidents': 0,
                    'prompt_injections': 0,
                    'data_extractions': 0,
                    'malicious_requests': 0
                }
        except Exception as e:
            print(f"Error getting quality statistics: {str(e)}")
            return {
                'total_analyzed': 0,
                'avg_quality_score': 0.0,
                'high_risk_count': 0,
                'hallucination_alerts': 0,
                'security_incidents': 0,
                'prompt_injections': 0,
                'data_extractions': 0,
                'malicious_requests': 0
            }

    def get_recent_quality_analyses(self, limit: int = 10, days: int = 7) -> List[Dict[str, Any]]:
        """Get recent quality analyses"""
        try:
            from datetime import datetime, timedelta
            
            # Calculate date range
            end_date = datetime.utcnow()
            start_date = end_date - timedelta(days=days)
            
            response = self.supabase.table('ai_quality_analysis').select('''
                analysis_id,
                timestamp,
                model,
                provider,
                overall_quality_score,
                risk_level,
                hallucination_risk,
                confidence_score,
                factual_consistency,
                toxicity_score,
                bias_score,
                security_score,
                prompt_injection_detected,
                data_extraction_attempt,
                malicious_request,
                detected_security_patterns,
                recommendations,
                alerts
            ''').gte('timestamp', start_date.isoformat()).order('timestamp', desc=True).limit(limit).execute()
            
            if response.data:
                # Transform data for frontend consumption
                analyses = []
                for item in response.data:
                    analysis = {
                        'analysis_id': item.get('analysis_id'),
                        'timestamp': item.get('timestamp'),
                        'model': item.get('model'),
                        'provider': item.get('provider'),
                        'overall_quality_score': item.get('overall_quality_score', 0),
                        'risk_level': item.get('risk_level', 'UNKNOWN'),
                        'detailed_scores': {
                            'hallucination_risk': item.get('hallucination_risk', 0),
                            'confidence_score': item.get('confidence_score', 0),
                            'factual_consistency': item.get('factual_consistency', 0),
                            'toxicity_score': item.get('toxicity_score', 0),
                            'bias_score': item.get('bias_score', 0)
                        },
                        'security_analysis': {
                            'prompt_injection_detected': item.get('prompt_injection_detected', False),
                            'data_extraction_attempt': item.get('data_extraction_attempt', False),
                            'malicious_request': item.get('malicious_request', False),
                            'security_score': item.get('security_score', 1),
                            'detected_patterns': item.get('detected_security_patterns', []),
                            'risk_indicators': []  # Can be added later
                        },
                        'recommendations': item.get('recommendations', []),
                        'alerts': item.get('alerts', [])
                    }
                    analyses.append(analysis)
                return analyses
            return []
        except Exception as e:
            print(f"Error getting recent quality analyses: {str(e)}")
            return []

    def get_quality_trends(self, days: int = 30) -> Dict[str, Any]:
        """Get quality trends over time"""
        try:
            from datetime import datetime, timedelta
            
            end_date = datetime.utcnow()
            start_date = end_date - timedelta(days=days)
            
            # Get daily quality trends
            response = self.supabase.table('ai_quality_summary').select('''
                analysis_date,
                avg_quality_score,
                total_analyses,
                critical_risk_count,
                high_risk_count,
                prompt_injection_count,
                data_extraction_count,
                malicious_request_count
            ''').gte('analysis_date', start_date.date().isoformat()).order('analysis_date').execute()
            
            trends = {
                'daily_quality_scores': [],
                'daily_analysis_counts': [],
                'risk_distribution': {
                    'critical': 0,
                    'high': 0,
                    'medium': 0,
                    'low': 0,
                    'minimal': 0
                },
                'security_incidents': {
                    'prompt_injections': 0,
                    'data_extractions': 0,
                    'malicious_requests': 0
                }
            }
            
            if response.data:
                for item in response.data:
                    trends['daily_quality_scores'].append({
                        'date': item.get('analysis_date'),
                        'score': float(item.get('avg_quality_score', 0))
                    })
                    trends['daily_analysis_counts'].append({
                        'date': item.get('analysis_date'),
                        'count': item.get('total_analyses', 0)
                    })
                    
                    # Aggregate risk distribution
                    trends['risk_distribution']['critical'] += item.get('critical_risk_count', 0)
                    trends['risk_distribution']['high'] += item.get('high_risk_count', 0)
                    
                    # Aggregate security incidents
                    trends['security_incidents']['prompt_injections'] += item.get('prompt_injection_count', 0)
                    trends['security_incidents']['data_extractions'] += item.get('data_extraction_count', 0)
                    trends['security_incidents']['malicious_requests'] += item.get('malicious_request_count', 0)
            
            return trends
        except Exception as e:
            print(f"Error getting quality trends: {str(e)}")
            return {
                'daily_quality_scores': [],
                'daily_analysis_counts': [],
                'risk_distribution': {'critical': 0, 'high': 0, 'medium': 0, 'low': 0, 'minimal': 0},
                'security_incidents': {'prompt_injections': 0, 'data_extractions': 0, 'malicious_requests': 0}
            }
    
    def get_cost_summary(self, 
                        user_id: str = None, 
                        team_id: str = None, 
                        days: int = 30,
                        provider: str = None) -> List[Dict[str, Any]]:
        """Get cost summary for dashboard"""
        try:
            from datetime import datetime, timedelta
            
            # Calculate date range
            end_date = datetime.utcnow()
            start_date = end_date - timedelta(days=days)
            
            # Build query
            query = self.supabase.table('ai_request_logs').select('*').gte('timestamp', start_date.isoformat())
            
            if user_id:
                query = query.eq('user_id', user_id)
            if team_id:
                query = query.eq('team_id', team_id)
            if provider:
                query = query.eq('provider', provider)
            
            response = query.execute()
            return response.data if response.data else []
        except Exception as e:
            print(f"Error getting cost summary: {str(e)}")
            return []
    
    def get_cost_analytics(self, days: int = 7) -> Dict[str, Any]:
        """Get cost analytics for dashboard"""
        try:
            from datetime import datetime, timedelta
            
            end_date = datetime.utcnow()
            start_date = end_date - timedelta(days=days)
            
            # Get all requests in date range
            response = self.supabase.table('ai_request_logs').select('*').gte('timestamp', start_date.isoformat()).execute()
            
            if not response.data:
                return {
                    "total_requests": 0,
                    "total_cost": 0,
                    "total_tokens": 0,
                    "avg_cost_per_request": 0,
                    "cost_by_provider": {},
                    "cost_by_model": {},
                    "cost_by_user": {},
                    "cost_by_team": {},
                    "requests_by_day": {}
                }
            
            logs = response.data
            
            # Calculate aggregations
            total_requests = len(logs)
            total_cost = sum(log.get('total_cost', 0) for log in logs)
            total_tokens = sum(log.get('total_tokens', 0) for log in logs)
            
            # Group by different dimensions
            cost_by_provider = {}
            cost_by_model = {}
            cost_by_user = {}
            cost_by_team = {}
            requests_by_day = {}
            
            for log in logs:
                # By provider
                provider = log.get('provider', 'unknown')
                cost_by_provider[provider] = cost_by_provider.get(provider, 0) + log.get('total_cost', 0)
                
                # By model
                model = log.get('model', 'unknown')
                cost_by_model[model] = cost_by_model.get(model, 0) + log.get('total_cost', 0)
                
                # By user
                user_id = log.get('user_id', 'unknown')
                if user_id:
                    cost_by_user[user_id] = cost_by_user.get(user_id, 0) + log.get('total_cost', 0)
                
                # By team
                team_id = log.get('team_id', 'unknown')
                if team_id:
                    cost_by_team[team_id] = cost_by_team.get(team_id, 0) + log.get('total_cost', 0)
                
                # By day
                day = log.get('timestamp', '')[:10]  # Get YYYY-MM-DD
                requests_by_day[day] = requests_by_day.get(day, 0) + 1
            
            return {
                "total_requests": total_requests,
                "total_cost": round(total_cost, 4),
                "total_tokens": total_tokens,
                "avg_cost_per_request": round(total_cost / max(1, total_requests), 6),
                "cost_by_provider": cost_by_provider,
                "cost_by_model": cost_by_model,
                "cost_by_user": cost_by_user,
                "cost_by_team": cost_by_team,
                "requests_by_day": requests_by_day
            }
        except Exception as e:
            print(f"Error getting cost analytics: {str(e)}")
            return {}

    async def get_agent_count(self) -> int:
        """Get total number of agents"""
        try:
            response = self.supabase.table('agents').select('id', count='exact').execute()
            return response.count if response.count else 0
        except Exception as e:
            print(f"Error getting agent count: {str(e)}")
            return 0

    async def get_total_request_count(self) -> int:
        """Get total number of requests"""
        try:
            response = self.supabase.table('ai_request_logs').select('id', count='exact').execute()
            return response.count if response.count else 0
        except Exception as e:
            print(f"Error getting total request count: {str(e)}")
            return 0

    async def get_recent_requests(self, limit: int = 100) -> List[Dict[str, Any]]:
        """Get recent requests"""
        try:
            response = self.supabase.table('ai_request_logs').select('*').order('created_at', desc=True).limit(limit).execute()
            return response.data if response.data else []
        except Exception as e:
            print(f"Error getting recent requests: {str(e)}")
            return []

    def get_agents(self, user_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get all agents, optionally filtered by user_id"""
        if not self.supabase:
            # Return mock data when Supabase is not available
            return [
                {
                    "id": "mock-agent-1",
                    "name": "Mock Agent 1",
                    "status": "running",
                    "lambda_function_name": "mock-function-1",
                    "created_at": datetime.utcnow().isoformat(),
                    "user_id": user_id or "demo-user"
                }
            ]
        
        try:
            query = self.supabase.table('agents').select('*').order('created_at', desc=True)
            if user_id:
                query = query.eq('user_id', user_id)
            response = query.execute()
            return response.data if response.data else []
        except Exception as e:
            print(f"Error getting agents: {str(e)}")
            return []

    def get_agent_by_id(self, agent_id: str) -> Optional[Dict[str, Any]]:
        """Get a specific agent by ID"""
        try:
            response = self.supabase.table('agents').select('*').eq('id', agent_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error getting agent by ID: {str(e)}")
            return None

    def get_agent_requests(self, agent_id: str) -> List[Dict[str, Any]]:
        """Get requests for a specific agent"""
        if not self.supabase:
            # Return mock data when Supabase is not available
            return [
                {
                    "id": "mock-request-1",
                    "agent_id": agent_id,
                    "success": True,
                    "duration": 1.2,
                    "timestamp": datetime.utcnow().isoformat(),
                    "input_tokens": 100,
                    "output_tokens": 50,
                    "cost": 0.001
                }
            ]
        
        try:
            response = self.supabase.table('ai_request_logs').select('*').eq('agent_id', agent_id).order('created_at', desc=True).execute()
            return response.data if response.data else []
        except Exception as e:
            print(f"Error getting agent requests: {str(e)}")
            return []

# Create singleton instance
db_service = DatabaseService()
# main.py
# main.py
from fastapi import FastAPI, HTTPException, Request, Header, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import uvicorn
import json
import random
from datetime import datetime, timedelta

from services.lambda_service import lambda_service
from services.database_service import db_service
from services.cross_provider_intelligence import cross_provider_intelligence
from services.compliance_native_monitoring import compliance_monitor, ComplianceFramework
from services.multi_agent_manager import multi_agent_manager, AgentType, RoutingStrategy
from proxy.ai_providers import PROVIDERS

app = FastAPI(
    title="Enterprise AI Control Plane",
    description="Monitor, secure, and manage your AI usage in real time",
    version="1.0.0"
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://localhost:3001", 
        "http://127.0.0.1:3000", 
        "http://127.0.0.1:3001",
        "https://platform-rmt75jcth-chaitanya-varmas-projects.vercel.app",
        "https://platform-pdpd0vrac-chaitanya-varmas-projects.vercel.app",
        "https://platform-2bxwi8qzb-chaitanya-varmas-projects.vercel.app",
        "https://*.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class DeployAgentRequest(BaseModel):
    name: str
    code: str
    user_id: Optional[str] = None

class InvokeAgentRequest(BaseModel):
    payload: Dict[str, Any] = {}

class AgentResponse(BaseModel):
    id: str
    name: str
    status: str
    lambda_function_name: Optional[str] = None
    created_at: str

class DeploymentResponse(BaseModel):
    success: bool
    agent: Optional[AgentResponse] = None
    error: Optional[str] = None

# Health check endpoint
@app.get("/")
async def health_check():
    return {
        "status": "healthy",
        "service": "Enterprise AI Control Plane",
        "version": "1.0.0",
        "features": ["ai_proxy", "cost_tracking", "agent_deployment"]
    }

# =============================================================================
# AI QUALITY ANALYSIS ENDPOINTS
# =============================================================================

@app.get("/quality/statistics")
async def get_quality_statistics(
    days: int = 7,
    user_id: Optional[str] = None,
    team_id: Optional[str] = None,
    provider: Optional[str] = None
):
    """Get AI quality analysis statistics"""
    try:
        stats = db_service.get_quality_statistics(
            days=days,
            user_id=user_id,
            team_id=team_id,
            provider=provider
        )
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get quality statistics: {str(e)}")

@app.get("/quality/recent")
async def get_recent_quality_analyses(limit: int = 10, days: int = 7):
    """Get recent quality analyses"""
    try:
        analyses = db_service.get_recent_quality_analyses(limit=limit, days=days)
        return {"analyses": analyses}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get recent analyses: {str(e)}")

@app.get("/quality/trends")
async def get_quality_trends(days: int = 30):
    """Get quality trends over time"""
    try:
        trends = db_service.get_quality_trends(days=days)
        return trends
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get quality trends: {str(e)}")

@app.post("/quality/test")
async def test_quality_analysis():
    """Test endpoint to generate sample quality analysis"""
    try:
        from services.ai_quality_service import ai_quality_analyzer
        
        # Sample request and response for testing
        sample_request = "What is the capital of France? Please provide a detailed answer."
        sample_response = "The capital of France is Paris. Paris is located in the north-central part of the country and is the largest city in France with a population of over 2 million people in the city proper and over 12 million in the metropolitan area."
        
        analysis = await ai_quality_analyzer.analyze_response_quality(
            request_content=sample_request,
            response_content=sample_response,
            model="gpt-3.5-turbo",
            provider="openai"
        )
        
        # Add mock user/team info
        analysis['user_id'] = 'demo-user'
        analysis['team_id'] = 'demo-team'
        
        # Store in database
        success = await db_service.log_quality_analysis(analysis)
        
        return {
            "success": success,
            "message": "Sample quality analysis generated",
            "analysis": analysis
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate test analysis: {str(e)}")

@app.post("/quality/refresh-summary")
async def refresh_quality_summary():
    """Refresh the quality analysis summary materialized view"""
    try:
        # This would call the database function to refresh the materialized view
        response = db_service.supabase.rpc('refresh_ai_quality_summary').execute()
        return {"success": True, "message": "Quality summary refreshed"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to refresh summary: {str(e)}")

# =============================================================================
# WEBSOCKET LIVE MONITORING
# =============================================================================

from services.websocket_service import live_monitor

@app.websocket("/ws/live-monitor")
async def websocket_live_monitor(websocket: WebSocket, user_id: str = None, team_id: str = None):
    """WebSocket endpoint for live monitoring"""
    connection_id = await live_monitor.connect(websocket, user_id, team_id)
    
    try:
        while True:
            # Keep connection alive and handle client messages
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message.get("type") == "ping":
                await live_monitor.send_to_connection(connection_id, {
                    "type": "pong",
                    "timestamp": datetime.utcnow().isoformat()
                })
            elif message.get("type") == "get_stats":
                stats = live_monitor.get_connection_stats()
                await live_monitor.send_to_connection(connection_id, {
                    "type": "stats",
                    "data": stats,
                    "timestamp": datetime.utcnow().isoformat()
                })
                
    except WebSocketDisconnect:
        live_monitor.disconnect(connection_id)
    except Exception as e:
        print(f"[WEBSOCKET] Error in connection {connection_id}: {e}")
        live_monitor.disconnect(connection_id)

# =============================================================================
# POLICY MANAGEMENT ENDPOINTS
# =============================================================================

from services.policy_engine import policy_engine, PolicyType, PolicyAction
from pydantic import BaseModel

class PolicyRequest(BaseModel):
    name: str
    type: str
    action: str = "warn"
    budget_limit: Optional[float] = None
    time_window: Optional[str] = "daily"
    scope: Optional[str] = "user"
    blocked_patterns: Optional[List[str]] = None
    blocked_keywords: Optional[List[str]] = None
    allowed_users: Optional[List[str]] = None
    blocked_users: Optional[List[str]] = None
    allowed_teams: Optional[List[str]] = None
    blocked_teams: Optional[List[str]] = None
    blocked_models: Optional[List[str]] = None
    allowed_models: Optional[List[str]] = None
    max_tokens: Optional[int] = None
    allowed_hours: Optional[List[int]] = None
    blocked_days: Optional[List[str]] = None

@app.get("/policies")
async def get_policies():
    """Get all policies"""
    try:
        policies = policy_engine.get_policies()
        return {"policies": policies}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get policies: {str(e)}")

@app.post("/policies")
async def create_policy(policy_request: PolicyRequest):
    """Create a new policy"""
    try:
        policy_data = policy_request.dict(exclude_none=True)
        policy_id = policy_engine.add_policy(policy_data)
        return {
            "success": True,
            "policy_id": policy_id,
            "message": "Policy created successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create policy: {str(e)}")

@app.delete("/policies/{policy_id}")
async def delete_policy(policy_id: str):
    """Delete a policy"""
    try:
        success = policy_engine.delete_policy(policy_id)
        if success:
            return {"success": True, "message": "Policy deleted successfully"}
        else:
            raise HTTPException(status_code=404, detail="Policy not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete policy: {str(e)}")

@app.put("/policies/{policy_id}")
async def update_policy(policy_id: str, policy_request: PolicyRequest):
    """Update a policy"""
    try:
        updates = policy_request.dict(exclude_none=True)
        success = policy_engine.update_policy(policy_id, updates)
        if success:
            return {"success": True, "message": "Policy updated successfully"}
        else:
            raise HTTPException(status_code=404, detail="Policy not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update policy: {str(e)}")

@app.post("/policies/test")
async def test_policy(request_data: dict):
    """Test a request against all policies"""
    try:
        user_id = request_data.get("user_id", "test-user")
        team_id = request_data.get("team_id", "test-team")
        ai_request = request_data.get("ai_request", {})
        estimated_cost = request_data.get("estimated_cost", 0.01)
        
        result = policy_engine.evaluate_request(ai_request, user_id, team_id, estimated_cost)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Policy test failed: {str(e)}")

# =============================================================================
# ANALYTICS AND COST TRACKING ENDPOINTS
# =============================================================================

@app.get("/analytics/costs")
async def get_cost_analytics(
    days: int = 7,
    user_id: Optional[str] = None,
    team_id: Optional[str] = None,
    provider: Optional[str] = None
):
    """Get cost analytics for dashboard"""
    try:
        analytics = db_service.get_cost_analytics(days=days)
        
        # Add filtered summary if specific filters provided
        if user_id or team_id or provider:
            filtered_logs = db_service.get_cost_summary(
                user_id=user_id,
                team_id=team_id,
                days=days,
                provider=provider
            )
            
            # Calculate filtered totals
            filtered_cost = sum(log.get('total_cost', 0) for log in filtered_logs)
            filtered_requests = len(filtered_logs)
            
            analytics['filtered'] = {
                "total_cost": round(filtered_cost, 4),
                "total_requests": filtered_requests,
                "filters": {
                    "user_id": user_id,
                    "team_id": team_id,
                    "provider": provider,
                    "days": days
                }
            }
        
        return analytics
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get analytics: {str(e)}")

@app.get("/analytics/usage")
async def get_usage_stats(days: int = 30):
    """Get usage statistics"""
    try:
        logs = db_service.get_cost_summary(days=days)
        
        if not logs:
            return {
                "total_requests": 0,
                "unique_users": 0,
                "unique_teams": 0,
                "avg_requests_per_day": 0,
                "most_used_provider": None,
                "most_used_model": None
            }
        
        # Calculate stats
        unique_users = len(set(log.get('user_id') for log in logs if log.get('user_id')))
        unique_teams = len(set(log.get('team_id') for log in logs if log.get('team_id')))
        
        # Find most used provider and model
        provider_counts = {}
        model_counts = {}
        
        for log in logs:
            provider = log.get('provider')
            if provider:
                provider_counts[provider] = provider_counts.get(provider, 0) + 1
            
            model = log.get('model')
            if model:
                model_counts[model] = model_counts.get(model, 0) + 1
        
        most_used_provider = max(provider_counts.items(), key=lambda x: x[1])[0] if provider_counts else None
        most_used_model = max(model_counts.items(), key=lambda x: x[1])[0] if model_counts else None
        
        return {
            "total_requests": len(logs),
            "unique_users": unique_users,
            "unique_teams": unique_teams,
            "avg_requests_per_day": round(len(logs) / max(1, days), 2),
            "most_used_provider": most_used_provider,
            "most_used_model": most_used_model,
            "provider_distribution": provider_counts,
            "model_distribution": model_counts
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get usage stats: {str(e)}")

@app.get("/analytics/recent-requests")
async def get_recent_requests(limit: int = 50):
    """Get recent AI requests for monitoring"""
    try:
        # Get recent logs from database
        response = db_service.supabase.table('ai_request_logs').select('*').order('timestamp', desc=True).limit(limit).execute()
        
        if not response.data:
            return []
        
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get recent requests: {str(e)}")

# =============================================================================
# AI PROXY ENDPOINTS - THE NEW CORE FEATURE
# =============================================================================

@app.post("/proxy/openai/{endpoint:path}")
async def proxy_openai(
    endpoint: str,
    request: Request,
    authorization: Optional[str] = Header(None),
    user_id: Optional[str] = Header(None),
    team_id: Optional[str] = Header(None)
):
    """Proxy OpenAI requests through our system"""
    try:
        # Get request body
        request_data = await request.json()
        
        # Prepare headers
        headers = {
            "Authorization": authorization or "",
            "Content-Type": "application/json"
        }
        
        # Proxy through OpenAI provider
        result = await PROVIDERS["openai"].proxy_request(
            endpoint=endpoint,
            request_data=request_data,
            headers=headers,
            user_id=user_id,
            team_id=team_id
        )
        
        if result["success"]:
            return result["data"]
        else:
            raise HTTPException(
                status_code=result.get("status_code", 500),
                detail=result.get("error", "Proxy request failed")
            )
            
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON in request body")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Proxy error: {str(e)}")

@app.post("/proxy/anthropic/{endpoint:path}")
async def proxy_anthropic(
    endpoint: str,
    request: Request,
    x_api_key: Optional[str] = Header(None),
    anthropic_version: Optional[str] = Header(None),
    user_id: Optional[str] = Header(None),
    team_id: Optional[str] = Header(None)
):
    """Proxy Anthropic requests through our system"""
    try:
        request_data = await request.json()
        
        headers = {
            "x-api-key": x_api_key or "",
            "anthropic-version": anthropic_version or "2023-06-01",
            "Content-Type": "application/json"
        }
        
        result = await PROVIDERS["anthropic"].proxy_request(
            endpoint=endpoint,
            request_data=request_data,
            headers=headers,
            user_id=user_id,
            team_id=team_id
        )
        
        if result["success"]:
            return result["data"]
        else:
            raise HTTPException(
                status_code=result.get("status_code", 500),
                detail=result.get("error", "Proxy request failed")
            )
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Proxy error: {str(e)}")

# =============================================================================
# AGENT DEPLOYMENT ENDPOINTS - REMOVED (Not Required)
# =============================================================================

# @app.get("/agents", response_model=List[AgentResponse])
async def get_agents(user_id: Optional[str] = None):
    """Get all agents for a user"""
    try:
        agents = db_service.get_agents(user_id=user_id)
        return [AgentResponse(**agent) for agent in agents]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch agents: {str(e)}")

# Keep other agent endpoints...
# @app.get("/agents/{agent_id}", response_model=AgentResponse)
async def get_agent(agent_id: str):
    """Get a specific agent by ID"""
    try:
        agent = db_service.get_agent_by_id(agent_id)
        if not agent:
            raise HTTPException(status_code=404, detail="Agent not found")
        return AgentResponse(**agent)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch agent: {str(e)}")

# @app.post("/agents/{agent_id}/invoke")
async def invoke_agent(agent_id: str, request: InvokeAgentRequest):
    """Invoke a specific agent"""
    try:
        agent = db_service.get_agent_by_id(agent_id)
        if not agent:
            raise HTTPException(status_code=404, detail="Agent not found")
        
        if not agent['lambda_function_name']:
            raise HTTPException(status_code=400, detail="Agent has no associated Lambda function")
        
        result = lambda_service.invoke_agent(
            function_name=agent['lambda_function_name'],
            payload=request.payload
        )
        
        return {
            "success": True,
            "agent_id": agent_id,
            "result": result
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to invoke agent: {str(e)}")

# @app.delete("/agents/{agent_id}")
async def delete_agent(agent_id: str):
    """Delete an agent and its Lambda function"""
    try:
        agent = db_service.get_agent_by_id(agent_id)
        if not agent:
            raise HTTPException(status_code=404, detail="Agent not found")
        
        if agent['lambda_function_name']:
            lambda_deleted = lambda_service.delete_agent(agent['lambda_function_name'])
            if not lambda_deleted:
                print(f"Warning: Failed to delete Lambda function {agent['lambda_function_name']}")
        
        db_deleted = db_service.delete_agent(agent_id)
        if not db_deleted:
            raise HTTPException(status_code=500, detail="Failed to delete agent from database")
        
        return {
            "success": True,
            "message": f"Agent {agent_id} deleted successfully"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete agent: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(
        "main:app", 
        host="0.0.0.0", 
        port=8000, 
        reload=True,
        log_level="info"
    )


# Pydantic models for request/response
class DeployAgentRequest(BaseModel):
    name: str
    code: str
    user_id: Optional[str] = None

class InvokeAgentRequest(BaseModel):
    payload: Dict[str, Any] = {}

class AgentResponse(BaseModel):
    id: str
    name: str
    status: str
    lambda_function_name: Optional[str] = None
    created_at: str

class DeploymentResponse(BaseModel):
    success: bool
    agent: Optional[AgentResponse] = None
    error: Optional[str] = None

# Health check endpoint
@app.get("/")
async def health_check():
    return {
        "status": "healthy",
        "service": "Agent Deploy Platform API",
        "version": "1.0.0"
    }

# Deploy a new agent
# @app.post("/agents/deploy", response_model=DeploymentResponse)
async def deploy_agent(request: DeployAgentRequest):
    """Deploy a new agent to AWS Lambda"""
    try:
        # Validate input
        if not request.name or not request.code:
            raise HTTPException(status_code=400, detail="Name and code are required")
        
        # Deploy to Lambda
        deployment_result = lambda_service.deploy_agent(
            name=request.name,
            code=request.code
        )
        
        if not deployment_result['success']:
            raise HTTPException(
                status_code=500, 
                detail=f"Deployment failed: {deployment_result['error']}"
            )
        
        # Save to database
        db_result = db_service.create_agent(
            name=request.name,
            lambda_function_name=deployment_result['function_name'],
            user_id=request.user_id
        )
        
        if not db_result['success']:
            # Cleanup Lambda function if DB save failed
            lambda_service.delete_agent(deployment_result['function_name'])
            raise HTTPException(
                status_code=500, 
                detail=f"Database save failed: {db_result['error']}"
            )
        
        return DeploymentResponse(
            success=True,
            agent=AgentResponse(**db_result['agent'])
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

# Get all agents
# @app.get("/agents", response_model=List[AgentResponse])
async def get_agents(user_id: Optional[str] = None):
    """Get all agents for a user"""
    try:
        agents = db_service.get_agents(user_id=user_id)
        return [AgentResponse(**agent) for agent in agents]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch agents: {str(e)}")

# Get a specific agent
# @app.get("/agents/{agent_id}", response_model=AgentResponse)
async def get_agent(agent_id: str):
    """Get a specific agent by ID"""
    try:
        agent = db_service.get_agent_by_id(agent_id)
        if not agent:
            raise HTTPException(status_code=404, detail="Agent not found")
        return AgentResponse(**agent)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch agent: {str(e)}")

# Invoke an agent
# @app.post("/agents/{agent_id}/invoke")
async def invoke_agent(agent_id: str, request: InvokeAgentRequest):
    """Invoke a specific agent"""
    try:
        # Get agent from database
        agent = db_service.get_agent_by_id(agent_id)
        if not agent:
            raise HTTPException(status_code=404, detail="Agent not found")
        
        if not agent['lambda_function_name']:
            raise HTTPException(status_code=400, detail="Agent has no associated Lambda function")
        
        # Invoke Lambda function
        result = lambda_service.invoke_agent(
            function_name=agent['lambda_function_name'],
            payload=request.payload
        )
        
        return {
            "success": True,
            "agent_id": agent_id,
            "result": result
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to invoke agent: {str(e)}")

# Delete an agent
# @app.delete("/agents/{agent_id}")
async def delete_agent(agent_id: str):
    """Delete an agent and its Lambda function"""
    try:
        # Get agent from database
        agent = db_service.get_agent_by_id(agent_id)
        if not agent:
            raise HTTPException(status_code=404, detail="Agent not found")
        
        # Delete Lambda function if it exists
        if agent['lambda_function_name']:
            lambda_deleted = lambda_service.delete_agent(agent['lambda_function_name'])
            if not lambda_deleted:
                # Log warning but continue with database deletion
                print(f"Warning: Failed to delete Lambda function {agent['lambda_function_name']}")
        
        # Delete from database
        db_deleted = db_service.delete_agent(agent_id)
        if not db_deleted:
            raise HTTPException(status_code=500, detail="Failed to delete agent from database")
        
        return {
            "success": True,
            "message": f"Agent {agent_id} deleted successfully"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete agent: {str(e)}")

# Update agent status
@app.patch("/agents/{agent_id}/status")
async def update_agent_status(agent_id: str, status: str):
    """Update agent status"""
    try:
        valid_statuses = ['running', 'stopped', 'error', 'deploying']
        if status not in valid_statuses:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid status. Must be one of: {valid_statuses}"
            )
        
        success = db_service.update_agent_status(agent_id, status)
        if not success:
            raise HTTPException(status_code=404, detail="Agent not found or update failed")
        
        return {
            "success": True,
            "message": f"Agent status updated to {status}"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update agent status: {str(e)}")

# Get agent status from Lambda
# @app.get("/agents/{agent_id}/status")
async def get_agent_status(agent_id: str):
    """Get real-time agent status from Lambda"""
    try:
        agent = db_service.get_agent_by_id(agent_id)
        if not agent:
            raise HTTPException(status_code=404, detail="Agent not found")
        
        if not agent['lambda_function_name']:
            return {"status": "error", "message": "No Lambda function associated"}
        
        # Get status from Lambda
        lambda_status = lambda_service.get_agent_status(agent['lambda_function_name'])
        
        # Update database if status changed
        if lambda_status != agent['status']:
            db_service.update_agent_status(agent_id, lambda_status)
        
        return {
            "agent_id": agent_id,
            "status": lambda_status,
            "lambda_function_name": agent['lambda_function_name']
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get agent status: {str(e)}")


@app.post("/quality/generate-sample-data")
async def generate_sample_quality_data():
    """Generate sample AI quality analysis data for demo purposes"""
    import random
    from datetime import datetime, timedelta
    
    sample_analyses = []
    base_time = datetime.now()
    
    for i in range(50):  # Generate 50 sample records
        timestamp = base_time - timedelta(hours=random.randint(0, 24))
        
        # Simulate realistic quality scores
        quality_score = round(random.uniform(6.0, 9.5), 2)
        confidence_score = round(random.uniform(0.6, 0.99), 3)
        
        # Higher chance of hallucination for lower quality scores
        has_hallucination = quality_score < 7.0 and random.random() < 0.4
        hallucination_risk = "high" if quality_score < 7.0 else "low" if quality_score > 8.5 else "medium"
        
        # Simulate security threats (5% chance)
        has_security_threat = random.random() < 0.05
        security_threats = []
        if has_security_threat:
            security_threats = [random.choice(['prompt_injection', 'jailbreak_attempt', 'data_exfiltration'])]
        
        # Simulate compliance violations (2% chance)
        has_compliance_violation = random.random() < 0.02
        compliance_violations = []
        if has_compliance_violation:
            compliance_violations = [random.choice(['HIPAA', 'GDPR', 'SOX', 'PCI_DSS'])]
        
        analysis = {
            'id': f'qa_{i:04d}',
            'timestamp': timestamp.isoformat(),
            'quality_score': quality_score,
            'confidence_score': confidence_score,
            'hallucination_risk': hallucination_risk,
            'has_hallucination': has_hallucination,
            'security_threats': security_threats,
            'compliance_violations': compliance_violations,
            'model': random.choice(['gpt-4', 'gpt-3.5-turbo', 'claude-3-sonnet', 'claude-3-haiku']),
            'user_id': f'user_{random.randint(1, 20)}',
            'team_id': random.choice(['engineering', 'marketing', 'sales', 'support']),
            'response_time_ms': random.randint(200, 3000),
            'tokens_used': random.randint(10, 500),
            'cost': round(random.uniform(0.001, 0.1), 6)
        }
        
        sample_analyses.append(analysis)
    
    try:
        # Store in your database (adjust based on your DB structure)
        await db_service.store_quality_analyses(sample_analyses)
        
        return {
            "success": True,
            "message": f"Generated {len(sample_analyses)} sample quality analysis records",
            "data_points": len(sample_analyses)
        }
    except Exception as e:
        return {
            "success": False, 
            "error": f"Failed to generate sample data: {str(e)}"
        }

@app.delete("/quality/clear-sample-data")
async def clear_sample_quality_data():
    """Clear sample quality data"""
    try:
        # Clear sample data from database
        await db_service.clear_sample_quality_data()
        
        return {
            "success": True,
            "message": "Sample quality data cleared successfully"
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"Failed to clear sample data: {str(e)}"
        }

# =============================================================================
# AI QUALITY INTELLIGENCE ENDPOINTS  
# =============================================================================

@app.get("/intelligence/quality/statistics")
async def get_quality_statistics(
    organization_id: Optional[str] = Header(None, alias="Organization-Id"),
    team_id: Optional[str] = None,
    hours: int = 24
):
    """Get comprehensive AI quality statistics"""
    
    try:
        stats = await db_service.get_quality_statistics(
            organization_id=organization_id,
            team_id=team_id,
            hours=hours
        )
        
        return {
            "success": True,
            "data": stats,
            "generated_at": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/intelligence/quality/alerts")
async def get_quality_alerts(
    organization_id: Optional[str] = Header(None, alias="Organization-Id"),
    team_id: Optional[str] = None,
    limit: int = 50
):
    """Get recent quality alerts"""
    
    try:
        alerts = await db_service.get_quality_alerts(
            organization_id=organization_id,
            team_id=team_id,
            limit=limit
        )
        
        return {
            "success": True,
            "data": alerts,
            "generated_at": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/intelligence/quality/trends")
async def get_quality_trends(
    organization_id: Optional[str] = Header(None, alias="Organization-Id"),
    team_id: Optional[str] = None,
    days: int = 7
):
    """Get quality trends over time"""
    
    try:
        trends = await db_service.get_quality_trends(
            organization_id=organization_id,
            team_id=team_id,
            days=days
        )
        
        return {
            "success": True,
            "data": trends,
            "generated_at": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# =============================================================================
# CROSS-PROVIDER INTELLIGENCE ENDPOINTS
# =============================================================================

@app.get("/intelligence/providers/comparison")
async def get_provider_comparison():
    """Get comparative analysis of AI providers"""
    
    try:
        comparison = cross_provider_intelligence.get_provider_comparison()
        
        return {
            "success": True,
            "data": comparison,
            "generated_at": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/intelligence/routing/optimize")
async def optimize_routing(
    request_data: dict,
    user_preferences: dict = None
):
    """Get optimal routing recommendation"""
    
    try:
        recommendation = await cross_provider_intelligence.intelligent_routing(
            request_data, user_preferences or {}
        )
        
        return {
            "success": True,
            "recommendation": recommendation,
            "generated_at": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# =============================================================================
# SECURITY INTELLIGENCE ENDPOINTS
# =============================================================================

@app.get("/intelligence/security/threats")
async def get_security_threats(
    organization_id: Optional[str] = Header(None, alias="Organization-Id"),
    team_id: Optional[str] = None,
    hours: int = 24
):
    """Get recent security threats"""
    
    try:
        threats = await db_service.get_security_threats(
            organization_id=organization_id,
            team_id=team_id,
            hours=hours
        )
        
        return {
            "success": True,
            "data": threats,
            "generated_at": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/intelligence/security/scan")
async def scan_content(
    content: str,
    user_id: Optional[str] = None,
    team_id: Optional[str] = None
):
    """Scan content for security threats"""
    
    try:
        scan_result = await ai_security_scanner.scan_request(content, user_id, team_id)
        
        return {
            "success": True,
            "scan_result": scan_result,
            "generated_at": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# =============================================================================
# COMPLIANCE INTELLIGENCE ENDPOINTS
# =============================================================================

@app.get("/intelligence/compliance/frameworks")
async def get_compliance_frameworks():
    """Get available compliance frameworks"""
    
    try:
        frameworks = list(compliance_framework.frameworks.keys())
        
        return {
            "success": True,
            "frameworks": frameworks,
            "details": {name: info['name'] for name, info in compliance_framework.frameworks.items()},
            "generated_at": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/intelligence/compliance/report")
async def generate_compliance_report(
    framework: str,
    start_date: str,
    end_date: str,
    team_id: Optional[str] = None
):
    """Generate compliance report"""
    
    try:
        start_dt = datetime.fromisoformat(start_date)
        end_dt = datetime.fromisoformat(end_date)
        
        report = await compliance_framework.generate_compliance_report(
            framework, start_dt, end_dt, team_id
        )
        
        return {
            "success": True,
            "report": report,
            "generated_at": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/intelligence/compliance/status")
async def get_compliance_status(
    organization_id: Optional[str] = Header(None, alias="Organization-Id"),
    team_id: Optional[str] = None
):
    """Get overall compliance status"""
    
    try:
        # Get recent compliance assessments
        recent_assessments = [
            assessment for assessment in compliance_framework.compliance_history[-100:]
            if (not team_id or assessment.get('team_id') == team_id)
        ]
        
        if not recent_assessments:
            return {
                "success": True,
                "status": "no_data",
                "message": "No compliance assessments available"
            }
        
        # Calculate overall compliance rate
        total_assessments = len(recent_assessments)
        compliant_assessments = len([a for a in recent_assessments if a['overall_compliance']])
        compliance_rate = compliant_assessments / total_assessments
        
        # Get violation summary
        violation_counts = {}
        for assessment in recent_assessments:
            for violation in assessment['violations']:
                framework = violation.get('framework', 'unknown')
                violation_counts[framework] = violation_counts.get(framework, 0) + 1
        
        return {
            "success": True,
            "status": {
                "compliance_rate": compliance_rate,
                "total_assessments": total_assessments,
                "compliant_assessments": compliant_assessments,
                "violation_counts": violation_counts,
                "last_assessment": recent_assessments[-1]['timestamp'] if recent_assessments else None
            },
            "generated_at": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# =============================================================================
# WEBSOCKET ENDPOINT FOR REAL-TIME MONITORING
# =============================================================================

@app.websocket("/ws/intelligence")
async def intelligence_websocket(
    websocket: WebSocket,
    user_id: Optional[str] = None,
    team_id: Optional[str] = None,
    organization_id: Optional[str] = None
):
    """Enhanced WebSocket for comprehensive AI intelligence streaming"""
    
    await websocket_manager.connect(websocket, user_id, team_id, organization_id)
    
    try:
        # Send initial intelligence summary
        await websocket.send_json({
            "type": "intelligence_summary",
            "data": {
                "provider_status": cross_provider_intelligence.provider_status,
                "recent_threats": len(ai_security_scanner._load_prompt_injection_patterns()),
                "compliance_frameworks": len(compliance_framework.frameworks),
                "monitoring_active": True
            },
            "timestamp": datetime.now().isoformat()
        })
        
        while True:
            # Keep connection alive and handle incoming messages
            try:
                data = await websocket.receive_text()
                message = json.loads(data)
                
                if message.get("type") == "ping":
                    await websocket.send_json({
                        "type": "pong",
                        "timestamp": datetime.now().isoformat()
                    })
                elif message.get("type") == "request_intelligence_update":
                    # Send current intelligence status
                    await websocket.send_json({
                        "type": "intelligence_update",
                        "data": {
                            "quality_analyzer_active": True,
                            "security_scanner_active": True,
                            "compliance_monitoring_active": True,
                            "cross_provider_intelligence_active": True
                        },
                        "timestamp": datetime.now().isoformat()
                    })
                    
            except WebSocketDisconnect:
                break
            except Exception as e:
                await websocket.send_json({
                    "type": "error",
                    "message": str(e),
                    "timestamp": datetime.now().isoformat()
                })
                
    except WebSocketDisconnect:
        pass
    finally:
        await websocket_manager.disconnect(websocket, user_id, team_id)

# =============================================================================
# COMPREHENSIVE INTELLIGENCE ENDPOINTS
# =============================================================================

@app.get("/intelligence/metrics")
async def get_intelligence_metrics():
    """Get comprehensive intelligence metrics"""
    try:
        # Get basic metrics from database
        total_agents = await db_service.get_agent_count()
        total_requests = await db_service.get_total_request_count()
        
        # Calculate success rate
        recent_requests = await db_service.get_recent_requests(limit=100)
        success_count = sum(1 for req in recent_requests if req.get('success', False))
        success_rate = (success_count / len(recent_requests) * 100) if recent_requests else 0
        
        # Calculate average response time
        response_times = [req.get('duration', 0) for req in recent_requests if req.get('duration')]
        avg_response_time = sum(response_times) / len(response_times) if response_times else 0
        
        # Mock additional metrics for demo
        metrics = {
            "total_agents": total_agents,
            "active_agents": max(1, total_agents - 1),  # Assume most are active
            "total_requests": total_requests,
            "success_rate": round(success_rate, 1),
            "avg_response_time": round(avg_response_time, 1),
            "cost_efficiency": round(random.uniform(0.7, 0.95), 2),
            "quality_score": round(random.uniform(7.5, 9.2), 1),
            "compliance_score": round(random.uniform(8.0, 9.5), 1)
        }
        
        return {"metrics": metrics}
        
    except Exception as e:
        print(f"Error getting intelligence metrics: {str(e)}")
        return {"error": "Failed to get intelligence metrics"}

@app.get("/intelligence/agents/performance")
async def get_agent_performance():
    """Get agent performance data"""
    try:
        agents = db_service.get_agents()
        performance_data = []
        
        for agent in agents:
            # Get agent-specific metrics
            agent_requests = db_service.get_agent_requests(agent['id'])
            success_count = sum(1 for req in agent_requests if req.get('success', False))
            success_rate = (success_count / len(agent_requests) * 100) if agent_requests else 0
            
            response_times = [req.get('duration', 0) for req in agent_requests if req.get('duration')]
            avg_response_time = sum(response_times) / len(response_times) if response_times else 0
            
            performance_data.append({
                "agent_id": agent['id'],
                "name": agent.get('name', f"Agent {agent['id'][:8]}"),
                "requests_count": len(agent_requests),
                "success_rate": round(success_rate, 1),
                "avg_response_time": round(avg_response_time, 1),
                "cost_per_request": round(random.uniform(0.001, 0.01), 4),
                "quality_score": round(random.uniform(7.0, 9.5), 1),
                "last_active": agent.get('updated_at', datetime.now().isoformat())
            })
        
        return {"agents": performance_data}
        
    except Exception as e:
        print(f"Error getting agent performance: {str(e)}")
        return {"error": "Failed to get agent performance data"}

@app.post("/intelligence/generate-sample")
async def generate_intelligence_sample():
    """Generate sample intelligence data for demo"""
    try:
        # Generate sample metrics
        sample_metrics = {
            "total_agents": 12,
            "active_agents": 10,
            "total_requests": 15420,
            "success_rate": 94.2,
            "avg_response_time": 1.8,
            "cost_efficiency": 0.87,
            "quality_score": 8.7,
            "compliance_score": 9.1
        }
        
        # Generate sample agent performance
        sample_agents = []
        agent_names = ["Customer Support Bot", "Code Assistant", "Content Generator", "Data Analyzer", "Translation Bot"]
        
        for i in range(5):
            sample_agents.append({
                "agent_id": f"agent_{i+1}",
                "name": agent_names[i] if i < len(agent_names) else f"Agent {i+1}",
                "requests_count": random.randint(100, 2000),
                "success_rate": round(random.uniform(85, 98), 1),
                "avg_response_time": round(random.uniform(0.5, 3.0), 1),
                "cost_per_request": round(random.uniform(0.001, 0.01), 4),
                "quality_score": round(random.uniform(7.5, 9.5), 1),
                "last_active": (datetime.now() - timedelta(hours=random.randint(1, 24))).isoformat()
            })
        
        # Generate sample provider comparison
        providers = ["openai", "anthropic", "google", "cohere"]
        sample_providers = []
        
        for provider in providers:
            sample_providers.append({
                "provider": provider,
                "requests": random.randint(500, 5000),
                "success_rate": round(random.uniform(88, 97), 1),
                "avg_cost": round(random.uniform(0.002, 0.02), 4),
                "avg_response_time": round(random.uniform(0.8, 2.5), 1),
                "quality_score": round(random.uniform(7.8, 9.3), 1)
            })
        
        return {
            "metrics": sample_metrics,
            "agents": sample_agents,
            "providers": sample_providers,
            "message": "Sample intelligence data generated successfully"
        }
        
    except Exception as e:
        print(f"Error generating sample intelligence data: {str(e)}")
        return {"error": "Failed to generate sample data"}

# =============================================================================
# MULTI-AGENT MANAGEMENT ENDPOINTS
# =============================================================================

@app.get("/multi-agent/types")
async def get_agent_types():
    """Get available agent types"""
    try:
        agent_types = []
        for agent_type in AgentType:
            agent_types.append({
                "id": agent_type.value,
                "name": agent_type.value.replace('_', ' ').title(),
                "description": f"AI agents specialized for {agent_type.value} tasks"
            })
        
        return {
            "agent_types": agent_types,
            "total_types": len(agent_types)
        }
        
    except Exception as e:
        print(f"Error getting agent types: {str(e)}")
        return {"error": "Failed to get agent types"}

@app.get("/multi-agent/available")
async def get_available_agents(agent_type: Optional[str] = None):
    """Get available agents, optionally filtered by type"""
    try:
        if agent_type:
            try:
                agent_type_enum = AgentType(agent_type)
                agents = multi_agent_manager._get_available_agents(agent_type_enum)
            except ValueError:
                raise HTTPException(status_code=400, detail=f"Invalid agent type: {agent_type}")
        else:
            agents = list(multi_agent_manager.agents.values())
        
        agent_list = []
        for agent in agents:
            agent_list.append({
                "id": agent.id,
                "name": agent.name,
                "agent_type": agent.agent_type.value,
                "model": agent.model,
                "provider": agent.provider,
                "status": agent.status.value,
                "capabilities": {
                    "max_tokens": agent.capabilities.max_tokens,
                    "supports_streaming": agent.capabilities.supports_streaming,
                    "supports_tools": agent.capabilities.supports_tools,
                    "supports_vision": agent.capabilities.supports_vision,
                    "cost_per_1k_tokens": agent.capabilities.cost_per_1k_tokens,
                    "avg_latency_ms": agent.capabilities.avg_latency_ms,
                    "quality_score": agent.capabilities.quality_score
                },
                "metrics": {
                    "total_requests": agent.total_requests,
                    "success_rate": agent.success_rate,
                    "avg_response_time": agent.avg_response_time,
                    "total_cost": agent.total_cost,
                    "health_score": agent.health_score
                },
                "created_at": agent.created_at.isoformat(),
                "last_used": agent.last_used.isoformat() if agent.last_used else None
            })
        
        return {
            "agents": agent_list,
            "total_agents": len(agent_list),
            "filtered_by_type": agent_type
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting available agents: {str(e)}")
        return {"error": "Failed to get available agents"}

@app.post("/multi-agent/route")
async def route_agent_request(
    request: Request,
    user_id: Optional[str] = Header(None, alias="User-Id"),
    team_id: Optional[str] = Header(None, alias="Team-Id")
):
    """Route request to optimal agent"""
    try:
        request_data = await request.json()
        
        # Extract routing parameters
        agent_type_str = request_data.get("agent_type", "chat")
        routing_strategy_str = request_data.get("routing_strategy", "balanced")
        user_preferences = request_data.get("user_preferences", {})
        
        # Validate agent type
        try:
            agent_type = AgentType(agent_type_str)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid agent type: {agent_type_str}")
        
        # Validate routing strategy
        try:
            routing_strategy = RoutingStrategy(routing_strategy_str)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid routing strategy: {routing_strategy_str}")
        
        # Route the request
        routing_decision = await multi_agent_manager.route_request(
            request_data=request_data,
            agent_type=agent_type,
            routing_strategy=routing_strategy,
            user_preferences=user_preferences
        )
        
        # Execute the request
        execution_result = await multi_agent_manager.execute_request(
            routing_decision=routing_decision,
            request_data=request_data,
            user_id=user_id,
            team_id=team_id
        )
        
        return {
            "routing_decision": {
                "selected_agent": {
                    "id": routing_decision.selected_agent.id,
                    "name": routing_decision.selected_agent.name,
                    "agent_type": routing_decision.selected_agent.agent_type.value,
                    "model": routing_decision.selected_agent.model,
                    "provider": routing_decision.selected_agent.provider
                },
                "routing_reason": routing_decision.routing_reason,
                "estimated_cost": routing_decision.estimated_cost,
                "estimated_latency": routing_decision.estimated_latency,
                "confidence_score": routing_decision.confidence_score,
                "fallback_agents": [
                    {
                        "id": agent.id,
                        "name": agent.name,
                        "provider": agent.provider,
                        "model": agent.model
                    } for agent in routing_decision.fallback_agents
                ]
            },
            "execution_result": execution_result,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error routing agent request: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to route agent request: {str(e)}")

@app.get("/multi-agent/analytics")
async def get_agent_analytics(agent_type: Optional[str] = None):
    """Get comprehensive agent analytics"""
    try:
        agent_type_enum = None
        if agent_type:
            try:
                agent_type_enum = AgentType(agent_type)
            except ValueError:
                raise HTTPException(status_code=400, detail=f"Invalid agent type: {agent_type}")
        
        analytics = await multi_agent_manager.get_agent_analytics(agent_type_enum)
        return analytics
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting agent analytics: {str(e)}")
        return {"error": "Failed to get agent analytics"}

@app.get("/multi-agent/routing-insights")
async def get_routing_insights():
    """Get routing insights and recommendations"""
    try:
        insights = await multi_agent_manager.get_routing_insights()
        return insights
        
    except Exception as e:
        print(f"Error getting routing insights: {str(e)}")
        return {"error": "Failed to get routing insights"}

@app.get("/multi-agent/performance")
async def get_agent_performance():
    """Get real-time agent performance metrics"""
    try:
        performance_data = {
            "agents": {},
            "summary": {
                "total_agents": len(multi_agent_manager.agents),
                "active_agents": len([a for a in multi_agent_manager.agents.values() if a.status.value == "active"]),
                "total_requests": sum(a.total_requests for a in multi_agent_manager.agents.values()),
                "avg_health_score": sum(a.health_score for a in multi_agent_manager.agents.values()) / len(multi_agent_manager.agents) if multi_agent_manager.agents else 0
            },
            "last_updated": datetime.utcnow().isoformat()
        }
        
        for agent_id, agent in multi_agent_manager.agents.items():
            performance_data["agents"][agent_id] = {
                "name": agent.name,
                "agent_type": agent.agent_type.value,
                "provider": agent.provider,
                "model": agent.model,
                "status": agent.status.value,
                "health_score": agent.health_score,
                "success_rate": agent.success_rate,
                "avg_response_time": agent.avg_response_time,
                "total_requests": agent.total_requests,
                "total_cost": agent.total_cost,
                "last_used": agent.last_used.isoformat() if agent.last_used else None
            }
        
        return performance_data
        
    except Exception as e:
        print(f"Error getting agent performance: {str(e)}")
        return {"error": "Failed to get agent performance"}

# =============================================================================
# COMPLIANCE-NATIVE MONITORING ENDPOINTS
# =============================================================================

@app.get("/compliance/frameworks")
async def get_compliance_frameworks():
    """Get available compliance frameworks"""
    try:
        frameworks = []
        for framework in ComplianceFramework:
            framework_info = compliance_monitor.frameworks[framework]
            frameworks.append({
                "id": framework.value,
                "name": framework_info["name"],
                "version": framework_info.get("version", "1.0"),
                "description": f"Compliance monitoring for {framework_info['name']}"
            })
        
        return {
            "frameworks": frameworks,
            "total_frameworks": len(frameworks)
        }
        
    except Exception as e:
        print(f"Error getting compliance frameworks: {str(e)}")
        return {"error": "Failed to get compliance frameworks"}

@app.post("/compliance/assess/{framework}")
async def assess_compliance(
    framework: str,
    request: Request,
    user_id: Optional[str] = Header(None, alias="User-Id"),
    team_id: Optional[str] = Header(None, alias="Team-Id")
):
    """Assess compliance for a specific framework"""
    try:
        # Get framework enum
        try:
            framework_enum = ComplianceFramework(framework)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid framework: {framework}")
        
        # Get AI system data from request body
        ai_system_data = await request.json()
        
        # Perform compliance assessment
        assessment_result = await compliance_monitor.assess_compliance(
            framework=framework_enum,
            ai_system_data=ai_system_data,
            user_id=user_id,
            team_id=team_id
        )
        
        return assessment_result
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error assessing compliance: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to assess compliance: {str(e)}")

@app.get("/compliance/report/{framework}")
async def generate_compliance_report(
    framework: str,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    user_id: Optional[str] = Header(None, alias="User-Id"),
    team_id: Optional[str] = Header(None, alias="Team-Id")
):
    """Generate compliance report for a specific framework"""
    try:
        # Get framework enum
        try:
            framework_enum = ComplianceFramework(framework)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid framework: {framework}")
        
        # Parse dates
        if start_date:
            start_dt = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
        else:
            start_dt = datetime.utcnow() - timedelta(days=30)
        
        if end_date:
            end_dt = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
        else:
            end_dt = datetime.utcnow()
        
        # Generate compliance report
        report = await compliance_monitor.generate_compliance_report(
            framework=framework_enum,
            start_date=start_dt,
            end_date=end_dt,
            user_id=user_id,
            team_id=team_id
        )
        
        return report
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error generating compliance report: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate compliance report: {str(e)}")

@app.get("/compliance/status")
async def get_compliance_status(
    user_id: Optional[str] = Header(None, alias="User-Id"),
    team_id: Optional[str] = Header(None, alias="Team-Id")
):
    """Get overall compliance status across all frameworks"""
    try:
        compliance_status = {
            "overall_status": "unknown",
            "frameworks": {},
            "critical_issues": [],
            "recommendations": [],
            "last_updated": datetime.utcnow().isoformat()
        }
        
        # Mock data for now - in production, this would query actual assessments
        for framework in ComplianceFramework:
            framework_info = compliance_monitor.frameworks[framework]
            compliance_status["frameworks"][framework.value] = {
                "name": framework_info["name"],
                "status": "not_assessed",
                "compliance_score": 0.0,
                "risk_level": "unknown",
                "last_assessment": None
            }
        
        return compliance_status
        
    except Exception as e:
        print(f"Error getting compliance status: {str(e)}")
        return {"error": "Failed to get compliance status"}

@app.post("/compliance/assess-all")
async def assess_all_frameworks(
    request: Request,
    user_id: Optional[str] = Header(None, alias="User-Id"),
    team_id: Optional[str] = Header(None, alias="Team-Id")
):
    """Assess compliance across all frameworks"""
    try:
        # Get AI system data from request body
        ai_system_data = await request.json()
        
        # Assess all frameworks
        assessment_results = {}
        for framework in ComplianceFramework:
            try:
                result = await compliance_monitor.assess_compliance(
                    framework=framework,
                    ai_system_data=ai_system_data,
                    user_id=user_id,
                    team_id=team_id
                )
                assessment_results[framework.value] = result
            except Exception as e:
                assessment_results[framework.value] = {
                    "error": str(e),
                    "status": "failed"
                }
        
        # Calculate overall compliance score
        successful_assessments = [r for r in assessment_results.values() if "compliance_score" in r]
        if successful_assessments:
            overall_score = sum(r["compliance_score"] for r in successful_assessments) / len(successful_assessments)
        else:
            overall_score = 0.0
        
        return {
            "overall_compliance_score": round(overall_score, 3),
            "total_frameworks": len(ComplianceFramework),
            "successful_assessments": len(successful_assessments),
            "failed_assessments": len(assessment_results) - len(successful_assessments),
            "assessments": assessment_results,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        print(f"Error assessing all frameworks: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to assess all frameworks: {str(e)}")

# =============================================================================
# SAMPLE DATA GENERATION (FOR DEMO)
# =============================================================================

@app.post("/intelligence/generate-demo-data")
async def generate_demo_data():
    """Generate comprehensive demo data for all intelligence features"""
    
    try:
        import random
        from datetime import timedelta
        
        # Generate sample quality analyses
        quality_samples = []
        security_samples = []
        compliance_samples = []
        
        base_time = datetime.now()
        
        for i in range(100):
            timestamp = base_time - timedelta(hours=random.randint(0, 72))
            
            # Quality analysis sample
            quality_sample = {
                'request_id': f'req_{i:04d}',
                'timestamp': timestamp,
                'quality_score': round(random.uniform(5.0, 9.8), 2),
                'confidence_score': round(random.uniform(0.6, 0.99), 3),
                'hallucination_risk': random.choice(['low', 'medium', 'high']),
                'has_hallucination': random.random() < 0.1,
                'model': random.choice(['gpt-4', 'gpt-3.5-turbo', 'claude-3-sonnet', 'claude-3-haiku']),
                'provider': random.choice(['openai', 'anthropic']),
                'user_id': f'user_{random.randint(1, 20)}',
                'team_id': random.choice(['engineering', 'marketing', 'sales', 'support']),
                'cost': round(random.uniform(0.001, 0.1), 6)
            }
            quality_samples.append(quality_sample)
            
            # Security sample (10% have threats)
            if random.random() < 0.1:
                security_sample = {
                    'request_id': f'req_{i:04d}',
                    'timestamp': timestamp,
                    'threats_detected': random.choice([
                        ['prompt_injection'], ['jailbreak_attempt'], ['sensitive_data'],
                        ['data_exfiltration'], ['adversarial_input']
                    ]),
                    'severity': random.choice(['low', 'medium', 'high']),
                    'blocked': random.choice([True, False]),
                    'user_id': quality_sample['user_id'],
                    'team_id': quality_sample['team_id']
                }
                security_samples.append(security_sample)
            
            # Compliance sample (5% have violations)
            if random.random() < 0.05:
                compliance_sample = {
                    'request_id': f'req_{i:04d}',
                    'timestamp': timestamp,
                    'framework': random.choice(['NIST_AI_RMF', 'EU_AI_ACT', 'HIPAA', 'GDPR']),
                    'compliant': False,
                    'violations': [
                        {
                            'requirement_id': f'REQ_{random.randint(1,10)}',
                            'severity': random.choice(['medium', 'high']),
                            'type': random.choice(['data_protection', 'quality_assurance', 'audit_trail'])
                        }
                    ],
                    'user_id': quality_sample['user_id'],
                    'team_id': quality_sample['team_id']
                }
                compliance_samples.append(compliance_sample)
        
        # Store samples in database (you'd implement these methods)
        await db_service.store_demo_quality_data(quality_samples)
        await db_service.store_demo_security_data(security_samples)
        await db_service.store_demo_compliance_data(compliance_samples)
        
        return {
            "success": True,
            "message": "Generated comprehensive demo data",
            "data_generated": {
                "quality_analyses": len(quality_samples),
                "security_incidents": len(security_samples),
                "compliance_assessments": len(compliance_samples)
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    


if __name__ == "__main__":
    uvicorn.run(
        "main:app", 
        host="0.0.0.0", 
        port=8000, 
        reload=True,
        log_level="info"
    )
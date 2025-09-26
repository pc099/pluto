# AI routes
from fastapi import APIRouter, HTTPException, Depends, Header
from typing import Optional
from .models import ChatRequest, ChatResponse
from .ai_service import ai_service
from modules.auth.routes import get_current_user, get_current_user_by_api_key
from modules.auth.models import UserResponse

router = APIRouter(prefix="/ai", tags=["ai"])

@router.post("/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    authorization: Optional[str] = Header(None),
    x_api_key: Optional[str] = Header(None)
):
    """Unified AI chat endpoint with authentication"""
    
    # Authenticate user
    user = None
    if authorization and authorization.startswith("Bearer "):
        # JWT authentication
        from modules.auth.routes import get_current_user
        from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
        credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials=authorization[7:])
        user = await get_current_user(credentials)
    elif x_api_key:
        # API key authentication
        user = await get_current_user_by_api_key(x_api_key)
    else:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid authentication")
    
    # Check quota
    if user.quota_used >= user.quota_limit:
        raise HTTPException(status_code=429, detail="Quota exceeded")
    
    try:
        # Route request
        routing_decision = await ai_service.route_request(request, {
            "user_id": user.id,
            "organization_id": user.organization_id,
            "preferences": {}
        })
        
        # Execute request
        response = await ai_service.execute_request(request, routing_decision)
        
        # Update user quota
        tokens_used = response.usage.get("total_tokens", 0)
        new_quota_used = user.quota_used + tokens_used
        from modules.auth.auth_service import auth_service
        await auth_service.update_user_quota(user.id, new_quota_used)
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI request failed: {str(e)}")

@router.get("/models")
async def get_available_models(
    authorization: Optional[str] = Header(None),
    x_api_key: Optional[str] = Header(None)
):
    """Get available AI models"""
    
    # Authenticate user
    user = None
    if authorization and authorization.startswith("Bearer "):
        from modules.auth.routes import get_current_user
        from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
        credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials=authorization[7:])
        user = await get_current_user(credentials)
    elif x_api_key:
        user = await get_current_user_by_api_key(x_api_key)
    else:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid authentication")
    
    return {
        "models": [
            {
                "id": "gpt-4",
                "name": "GPT-4",
                "provider": "openai",
                "description": "Most capable GPT-4 model"
            },
            {
                "id": "gpt-3.5-turbo",
                "name": "GPT-3.5 Turbo",
                "provider": "openai",
                "description": "Fast and efficient model"
            },
            {
                "id": "claude-3-sonnet",
                "name": "Claude 3 Sonnet",
                "provider": "anthropic",
                "description": "Balanced performance and speed"
            },
            {
                "id": "claude-3-haiku",
                "name": "Claude 3 Haiku",
                "provider": "anthropic",
                "description": "Fastest Claude model"
            }
        ]
    }

@router.get("/usage")
async def get_usage_stats(
    authorization: Optional[str] = Header(None),
    x_api_key: Optional[str] = Header(None)
):
    """Get user's AI usage statistics"""
    
    # Authenticate user
    user = None
    if authorization and authorization.startswith("Bearer "):
        from modules.auth.routes import get_current_user
        from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
        credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials=authorization[7:])
        user = await get_current_user(credentials)
    elif x_api_key:
        user = await get_current_user_by_api_key(x_api_key)
    else:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid authentication")
    
    return {
        "quota_limit": user.quota_limit,
        "quota_used": user.quota_used,
        "quota_remaining": user.quota_limit - user.quota_used,
        "usage_percentage": (user.quota_used / user.quota_limit) * 100 if user.quota_limit > 0 else 0
    }

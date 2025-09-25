# services/policy_engine.py
import re
import json
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from enum import Enum

class PolicyAction(Enum):
    ALLOW = "allow"
    BLOCK = "block"
    WARN = "warn"
    MODIFY = "modify"

class PolicyType(Enum):
    BUDGET = "budget"
    CONTENT = "content" 
    USER = "user"
    MODEL = "model"
    TIME = "time"

class PolicyEngine:
    def __init__(self):
        self.policies = []
        self.violations = []
    
    def add_policy(self, policy: Dict[str, Any]) -> str:
        """Add a new policy"""
        policy_id = f"policy_{len(self.policies) + 1}_{int(datetime.utcnow().timestamp())}"
        policy["id"] = policy_id
        policy["created_at"] = datetime.utcnow().isoformat()
        policy["active"] = True
        self.policies.append(policy)
        return policy_id
    
    def evaluate_request(self, 
                        request_data: Dict[str, Any], 
                        user_id: str = None, 
                        team_id: str = None,
                        estimated_cost: float = 0) -> Dict[str, Any]:
        """Evaluate if request should be allowed"""
        
        violations = []
        actions = []
        
        for policy in self.policies:
            if not policy.get("active", True):
                continue
                
            violation = self._check_policy(policy, request_data, user_id, team_id, estimated_cost)
            if violation:
                violations.append(violation)
                actions.append(violation["action"])
        
        # Determine final action
        if PolicyAction.BLOCK.value in actions:
            final_action = PolicyAction.BLOCK.value
        elif PolicyAction.WARN.value in actions:
            final_action = PolicyAction.WARN.value
        else:
            final_action = PolicyAction.ALLOW.value
        
        return {
            "action": final_action,
            "allowed": final_action != PolicyAction.BLOCK.value,
            "violations": violations,
            "policy_check_timestamp": datetime.utcnow().isoformat()
        }
    
    def _check_policy(self, policy: Dict[str, Any], request_data: Dict[str, Any], 
                     user_id: str, team_id: str, estimated_cost: float) -> Optional[Dict[str, Any]]:
        """Check individual policy"""
        
        policy_type = policy.get("type")
        
        if policy_type == PolicyType.BUDGET.value:
            return self._check_budget_policy(policy, user_id, team_id, estimated_cost)
        elif policy_type == PolicyType.CONTENT.value:
            return self._check_content_policy(policy, request_data)
        elif policy_type == PolicyType.USER.value:
            return self._check_user_policy(policy, user_id, team_id)
        elif policy_type == PolicyType.MODEL.value:
            return self._check_model_policy(policy, request_data)
        elif policy_type == PolicyType.TIME.value:
            return self._check_time_policy(policy)
        
        return None
    
    def _check_budget_policy(self, policy: Dict[str, Any], user_id: str, team_id: str, estimated_cost: float) -> Optional[Dict[str, Any]]:
        """Check budget limits"""
        budget_limit = policy.get("budget_limit", 0)
        time_window = policy.get("time_window", "daily")  # daily, weekly, monthly
        scope = policy.get("scope", "user")  # user, team, global
        
        # Calculate current spend (mock implementation - you'd query database)
        current_spend = self._get_current_spend(user_id, team_id, time_window, scope)
        
        if current_spend + estimated_cost > budget_limit:
            return {
                "policy_id": policy["id"],
                "type": PolicyType.BUDGET.value,
                "action": policy.get("action", PolicyAction.WARN.value),
                "message": f"Budget limit exceeded: ${current_spend + estimated_cost:.4f} > ${budget_limit:.4f}",
                "current_spend": current_spend,
                "limit": budget_limit,
                "scope": scope
            }
        
        return None
    
    def _check_content_policy(self, policy: Dict[str, Any], request_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Check content for sensitive information"""
        blocked_patterns = policy.get("blocked_patterns", [])
        blocked_keywords = policy.get("blocked_keywords", [])
        
        # Extract text content from request
        content = self._extract_content(request_data)
        
        # Check patterns
        for pattern in blocked_patterns:
            if re.search(pattern, content, re.IGNORECASE):
                return {
                    "policy_id": policy["id"],
                    "type": PolicyType.CONTENT.value,
                    "action": policy.get("action", PolicyAction.BLOCK.value),
                    "message": f"Content blocked by pattern: {pattern}",
                    "matched_pattern": pattern
                }
        
        # Check keywords
        for keyword in blocked_keywords:
            if keyword.lower() in content.lower():
                return {
                    "policy_id": policy["id"],
                    "type": PolicyType.CONTENT.value,
                    "action": policy.get("action", PolicyAction.WARN.value),
                    "message": f"Sensitive keyword detected: {keyword}",
                    "matched_keyword": keyword
                }
        
        return None
    
    def _check_user_policy(self, policy: Dict[str, Any], user_id: str, team_id: str) -> Optional[Dict[str, Any]]:
        """Check user/team permissions"""
        allowed_users = policy.get("allowed_users", [])
        blocked_users = policy.get("blocked_users", [])
        allowed_teams = policy.get("allowed_teams", [])
        blocked_teams = policy.get("blocked_teams", [])
        
        if blocked_users and user_id in blocked_users:
            return {
                "policy_id": policy["id"],
                "type": PolicyType.USER.value,
                "action": PolicyAction.BLOCK.value,
                "message": f"User {user_id} is blocked",
                "blocked_user": user_id
            }
        
        if blocked_teams and team_id in blocked_teams:
            return {
                "policy_id": policy["id"],
                "type": PolicyType.USER.value,
                "action": PolicyAction.BLOCK.value,
                "message": f"Team {team_id} is blocked",
                "blocked_team": team_id
            }
        
        if allowed_users and user_id not in allowed_users:
            return {
                "policy_id": policy["id"],
                "type": PolicyType.USER.value,
                "action": PolicyAction.BLOCK.value,
                "message": f"User {user_id} not in allowed list"
            }
        
        if allowed_teams and team_id not in allowed_teams:
            return {
                "policy_id": policy["id"],
                "type": PolicyType.USER.value,
                "action": PolicyAction.BLOCK.value,
                "message": f"Team {team_id} not in allowed list"
            }
        
        return None
    
    def _check_model_policy(self, policy: Dict[str, Any], request_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Check model restrictions"""
        blocked_models = policy.get("blocked_models", [])
        allowed_models = policy.get("allowed_models", [])
        max_tokens = policy.get("max_tokens")
        
        model = request_data.get("model", "")
        
        if blocked_models and model in blocked_models:
            return {
                "policy_id": policy["id"],
                "type": PolicyType.MODEL.value,
                "action": PolicyAction.BLOCK.value,
                "message": f"Model {model} is blocked",
                "blocked_model": model
            }
        
        if allowed_models and model not in allowed_models:
            return {
                "policy_id": policy["id"],
                "type": PolicyType.MODEL.value,
                "action": PolicyAction.BLOCK.value,
                "message": f"Model {model} not in allowed list"
            }
        
        if max_tokens and request_data.get("max_tokens", 0) > max_tokens:
            return {
                "policy_id": policy["id"],
                "type": PolicyType.MODEL.value,
                "action": policy.get("action", PolicyAction.WARN.value),
                "message": f"Token limit exceeded: {request_data.get('max_tokens')} > {max_tokens}",
                "max_tokens_limit": max_tokens
            }
        
        return None
    
    def _check_time_policy(self, policy: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Check time-based restrictions"""
        allowed_hours = policy.get("allowed_hours", [])  # [9, 10, 11, ..., 17]
        blocked_days = policy.get("blocked_days", [])    # ["saturday", "sunday"]
        
        now = datetime.utcnow()
        current_hour = now.hour
        current_day = now.strftime("%A").lower()
        
        if allowed_hours and current_hour not in allowed_hours:
            return {
                "policy_id": policy["id"],
                "type": PolicyType.TIME.value,
                "action": policy.get("action", PolicyAction.BLOCK.value),
                "message": f"AI access not allowed at {current_hour}:00",
                "current_hour": current_hour,
                "allowed_hours": allowed_hours
            }
        
        if blocked_days and current_day in blocked_days:
            return {
                "policy_id": policy["id"],
                "type": PolicyType.TIME.value,
                "action": policy.get("action", PolicyAction.BLOCK.value),
                "message": f"AI access blocked on {current_day}",
                "blocked_day": current_day
            }
        
        return None
    
    def _extract_content(self, request_data: Dict[str, Any]) -> str:
        """Extract text content from request for analysis"""
        content = ""
        
        # OpenAI format
        if "messages" in request_data:
            for message in request_data["messages"]:
                if isinstance(message, dict) and "content" in message:
                    content += str(message["content"]) + " "
        
        # Direct prompt
        if "prompt" in request_data:
            content += str(request_data["prompt"]) + " "
        
        # Anthropic format
        if "prompt" in request_data:
            content += str(request_data["prompt"]) + " "
        
        return content.strip()
    
    def _get_current_spend(self, user_id: str, team_id: str, time_window: str, scope: str) -> float:
        """Get current spending for budget check (mock implementation)"""
        # In real implementation, query database for spending in time window
        # For now, return a small amount for testing
        return 0.05
    
    def get_policies(self) -> List[Dict[str, Any]]:
        """Get all policies"""
        return self.policies
    
    def delete_policy(self, policy_id: str) -> bool:
        """Delete a policy"""
        for i, policy in enumerate(self.policies):
            if policy["id"] == policy_id:
                del self.policies[i]
                return True
        return False
    
    def update_policy(self, policy_id: str, updates: Dict[str, Any]) -> bool:
        """Update a policy"""
        for policy in self.policies:
            if policy["id"] == policy_id:
                policy.update(updates)
                policy["updated_at"] = datetime.utcnow().isoformat()
                return True
        return False

# Create singleton instance
policy_engine = PolicyEngine()

# Add some default policies for demo
policy_engine.add_policy({
    "name": "Daily Budget Limit",
    "type": PolicyType.BUDGET.value,
    "budget_limit": 10.0,  # $10 per day
    "time_window": "daily",
    "scope": "user",
    "action": PolicyAction.WARN.value
})

policy_engine.add_policy({
    "name": "Block Sensitive Data",
    "type": PolicyType.CONTENT.value,
    "blocked_patterns": [
        r'\b\d{3}-\d{2}-\d{4}\b',  # SSN
        r'\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b',  # Credit card
        r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'  # Email
    ],
    "blocked_keywords": ["password", "secret", "api_key", "token"],
    "action": PolicyAction.BLOCK.value
})

policy_engine.add_policy({
    "name": "Business Hours Only",
    "type": PolicyType.TIME.value,
    "allowed_hours": list(range(9, 18)),  # 9 AM to 5 PM
    "blocked_days": ["saturday", "sunday"],
    "action": PolicyAction.WARN.value
})
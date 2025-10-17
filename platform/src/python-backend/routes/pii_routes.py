"""
PII Detection API Routes
Endpoints for PII detection statistics and monitoring
"""
from fastapi import APIRouter, HTTPException, Query
from typing import Dict, Any, List
from datetime import datetime, timedelta
import random

router = APIRouter(prefix="/api/pii", tags=["pii"])

@router.get("/statistics")
async def get_pii_statistics() -> Dict[str, Any]:
    """Get PII detection statistics"""
    
    detections_by_type = [
        {"type": "Email Addresses", "count": 1247, "risk": "Medium", "percentage": 45},
        {"type": "Phone Numbers", "count": 892, "risk": "Medium", "percentage": 32},
        {"type": "Names", "count": 534, "risk": "Low", "percentage": 19},
        {"type": "Credit Cards", "count": 67, "risk": "Critical", "percentage": 2.4},
        {"type": "SSN", "count": 23, "risk": "Critical", "percentage": 0.8},
        {"type": "IP Addresses", "count": 189, "risk": "Low", "percentage": 6.8}
    ]
    
    compliance_status = [
        {"framework": "GDPR", "status": "Compliant", "score": 98},
        {"framework": "HIPAA", "status": "Compliant", "score": 95},
        {"framework": "PCI DSS", "status": "Action Required", "score": 87},
        {"framework": "CCPA", "status": "Compliant", "score": 96}
    ]
    
    return {
        "total_scanned": 12847,
        "detection_accuracy": 98.7,
        "avg_latency_ms": 23,
        "detections_by_type": detections_by_type,
        "critical_detections": {
            "ssn": 3,
            "credit_cards": 7,
            "bank_accounts": 2
        },
        "compliance_status": compliance_status,
        "timestamp": datetime.utcnow().isoformat()
    }

@router.get("/recent")
async def get_recent_detections(limit: int = Query(10, ge=1, le=100)) -> Dict[str, Any]:
    """Get recent PII detections"""
    
    pii_types = ["Email", "Phone", "Credit Card", "SSN", "Name", "Address"]
    risks = ["Critical", "High", "Medium", "Low"]
    actions = ["Logged & Masked", "Blocked", "Blocked & Alerted", "Logged"]
    models = ["GPT-4o", "Claude 3.5", "Gemini Pro", "Llama 3"]
    teams = ["Team Alpha", "Team Beta", "Team Gamma", "Team Delta"]
    
    detections = []
    for i in range(limit):
        pii_type = random.choice(pii_types)
        risk = "Critical" if pii_type in ["Credit Card", "SSN"] else random.choice(risks)
        
        detections.append({
            "id": f"pii_{i+1}",
            "timestamp": (datetime.utcnow() - timedelta(minutes=i*2)).isoformat(),
            "type": pii_type,
            "original": "***REDACTED***",
            "masked": "***-**-****" if pii_type == "SSN" else "***@***.***",
            "risk": risk,
            "action": random.choice(actions),
            "user": f"user_{random.randint(1, 100)}",
            "model": random.choice(models),
            "team": random.choice(teams)
        })
    
    return {
        "detections": detections,
        "timestamp": datetime.utcnow().isoformat()
    }

@router.get("/trends")
async def get_pii_trends(days: int = Query(7, ge=1, le=90)) -> Dict[str, Any]:
    """Get PII detection trends over time"""
    
    trends = []
    for i in range(days):
        date = datetime.utcnow() - timedelta(days=days-i-1)
        trends.append({
            "date": date.strftime("%Y-%m-%d"),
            "total_detections": random.randint(50, 200),
            "critical": random.randint(0, 5),
            "high": random.randint(5, 20),
            "medium": random.randint(20, 100),
            "low": random.randint(20, 80)
        })
    
    return {
        "trends": trends,
        "timestamp": datetime.utcnow().isoformat()
    }

@router.get("/recommendations")
async def get_recommendations() -> Dict[str, Any]:
    """Get PII compliance recommendations"""
    
    recommendations = [
        {
            "severity": "critical",
            "title": "Review SSN Detections",
            "description": "3 SSN instances detected. Ensure PCI DSS compliance for these requests.",
            "action": "Review and update policies"
        },
        {
            "severity": "high",
            "title": "Update Credit Card Policy",
            "description": "Consider blocking all credit card data in AI requests.",
            "action": "Configure auto-blocking"
        },
        {
            "severity": "medium",
            "title": "Enable Auto-Masking",
            "description": "Automatically mask all detected PII before sending to AI providers.",
            "action": "Enable in settings"
        },
        {
            "severity": "low",
            "title": "Team Training Recommended",
            "description": "Team Gamma has 45% higher PII detection rate. Consider training.",
            "action": "Schedule training session"
        }
    ]
    
    return {
        "recommendations": recommendations,
        "timestamp": datetime.utcnow().isoformat()
    }

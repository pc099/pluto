"""
Mission Control API Routes
Endpoints for AI Mission Control dashboard and monitoring
"""
from fastapi import APIRouter, HTTPException, Depends, Header
from typing import Optional, Dict, Any
from datetime import datetime

from modules.auth.routes import get_current_user
from modules.auth.models import UserResponse
from services.ai_mission_control import ai_mission_control
from services.traffic_analyzer import traffic_analyzer
from services.device_tracker import device_tracker

router = APIRouter(prefix="/mission-control", tags=["Mission Control"])

@router.get("/status")
async def get_system_status(
    current_user: UserResponse = Depends(get_current_user)
):
    """Get comprehensive system status"""
    try:
        status = await ai_mission_control.get_system_status()
        return {
            "success": True,
            "data": status.__dict__,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get system status: {str(e)}")

@router.get("/dashboard")
async def get_dashboard_data(
    current_user: UserResponse = Depends(get_current_user)
):
    """Get mission control dashboard data"""
    try:
        dashboard_data = await ai_mission_control.get_dashboard_data()
        return {
            "success": True,
            "data": dashboard_data,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get dashboard data: {str(e)}")

@router.get("/traffic-metrics")
async def get_traffic_metrics(
    hours: int = 24,
    current_user: UserResponse = Depends(get_current_user)
):
    """Get traffic metrics and patterns"""
    try:
        current_metrics = await traffic_analyzer.get_current_metrics()
        historical_metrics = await traffic_analyzer.get_historical_metrics(hours)
        traffic_patterns = await traffic_analyzer.get_traffic_patterns(hours)
        
        return {
            "success": True,
            "data": {
                "current_metrics": current_metrics.__dict__,
                "historical_metrics": [m.__dict__ for m in historical_metrics],
                "traffic_patterns": traffic_patterns
            },
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get traffic metrics: {str(e)}")

@router.get("/device-statistics")
async def get_device_statistics(
    current_user: UserResponse = Depends(get_current_user)
):
    """Get device tracking statistics"""
    try:
        device_stats = await device_tracker.get_device_statistics()
        active_devices = await device_tracker.get_active_devices()
        
        return {
            "success": True,
            "data": {
                "statistics": device_stats,
                "active_devices": [device.__dict__ for device in active_devices]
            },
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get device statistics: {str(e)}")

@router.get("/alerts")
async def get_alerts(
    resolved: Optional[bool] = None,
    severity: Optional[str] = None,
    current_user: UserResponse = Depends(get_current_user)
):
    """Get system alerts"""
    try:
        alerts = ai_mission_control.alerts
        
        # Filter alerts
        if resolved is not None:
            alerts = [alert for alert in alerts if alert.resolved == resolved]
        
        if severity:
            alerts = [alert for alert in alerts if alert.severity == severity]
        
        return {
            "success": True,
            "data": {
                "alerts": [alert.__dict__ for alert in alerts],
                "total_count": len(alerts)
            },
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get alerts: {str(e)}")

@router.post("/alerts/{alert_id}/resolve")
async def resolve_alert(
    alert_id: str,
    resolution_notes: str,
    current_user: UserResponse = Depends(get_current_user)
):
    """Resolve a system alert"""
    try:
        success = await ai_mission_control.resolve_alert(alert_id, resolution_notes)
        if success:
            return {
                "success": True,
                "message": "Alert resolved successfully",
                "timestamp": datetime.utcnow().isoformat()
            }
        else:
            raise HTTPException(status_code=404, detail="Alert not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to resolve alert: {str(e)}")

@router.get("/emergency-controls")
async def get_emergency_controls(
    current_user: UserResponse = Depends(get_current_user)
):
    """Get emergency control options"""
    try:
        # Check if user has admin permissions
        if current_user.role != "admin":
            raise HTTPException(status_code=403, detail="Admin access required")
        
        emergency_controls = await ai_mission_control.get_emergency_controls()
        return {
            "success": True,
            "data": emergency_controls,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get emergency controls: {str(e)}")

@router.post("/emergency-shutdown")
async def emergency_shutdown(
    reason: str,
    current_user: UserResponse = Depends(get_current_user)
):
    """Emergency shutdown of AI services"""
    try:
        # Check if user has admin permissions
        if current_user.role != "admin":
            raise HTTPException(status_code=403, detail="Admin access required")
        
        result = await ai_mission_control.emergency_shutdown(reason)
        return {
            "success": True,
            "data": result,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to initiate emergency shutdown: {str(e)}")

@router.get("/health")
async def health_check():
    """Health check endpoint for mission control"""
    try:
        status = await ai_mission_control.get_system_status()
        return {
            "status": "healthy",
            "system_status": status.system_status,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }

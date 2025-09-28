"""
AI Mission Control Service
Central command center for monitoring and controlling all AI operations
"""
import asyncio
import json
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
import logging

from .ai_traffic_proxy import ai_traffic_proxy
from .device_tracker import device_tracker
from .pii_detector import pii_detector
from .security_analyzer import security_analyzer
from .traffic_analyzer import traffic_analyzer

logger = logging.getLogger(__name__)

@dataclass
class MissionControlStatus:
    """Mission control status model"""
    timestamp: datetime
    system_status: str  # operational, degraded, critical
    active_devices: int
    active_users: int
    total_requests_today: int
    total_cost_today: float
    security_incidents: int
    pii_incidents: int
    system_health: Dict[str, Any]
    alerts: List[Dict[str, Any]]
    performance_metrics: Dict[str, Any]

@dataclass
class SystemAlert:
    """System alert model"""
    alert_id: str
    timestamp: datetime
    severity: str  # info, warning, error, critical
    category: str  # security, performance, pii, system
    title: str
    description: str
    source: str
    resolved: bool
    resolution_notes: Optional[str]

class AIMissionControl:
    """AI Mission Control - Central monitoring and control hub"""
    
    def __init__(self):
        self.system_status = "operational"
        self.alerts: List[SystemAlert] = []
        self.alert_thresholds = {
            "high_error_rate": 0.1,  # 10% error rate
            "high_response_time": 5000,  # 5 seconds
            "high_cost_per_hour": 100.0,  # $100 per hour
            "security_incidents_per_hour": 5,
            "pii_incidents_per_hour": 10,
            "device_limit": 1000
        }
        
        # Circuit breakers
        self.circuit_breakers = {
            "openai": {"status": "closed", "failure_count": 0, "last_failure": None},
            "anthropic": {"status": "closed", "failure_count": 0, "last_failure": None}
        }
        
        # System health checks
        self.health_checks = {
            "traffic_proxy": True,
            "device_tracker": True,
            "pii_detector": True,
            "security_analyzer": True,
            "traffic_analyzer": True
        }
    
    async def get_system_status(self) -> MissionControlStatus:
        """Get comprehensive system status"""
        # Get current metrics
        current_metrics = await traffic_analyzer.get_current_metrics()
        device_stats = await device_tracker.get_device_statistics()
        
        # Check system health
        system_health = await self._check_system_health()
        
        # Get active alerts
        active_alerts = [alert for alert in self.alerts if not alert.resolved]
        
        # Determine overall system status
        system_status = self._determine_system_status(current_metrics, active_alerts)
        
        return MissionControlStatus(
            timestamp=datetime.utcnow(),
            system_status=system_status,
            active_devices=device_stats["active_devices"],
            active_users=current_metrics.active_users,
            total_requests_today=current_metrics.total_requests,
            total_cost_today=current_metrics.total_cost,
            security_incidents=current_metrics.security_incidents,
            pii_incidents=current_metrics.pii_incidents,
            system_health=system_health,
            alerts=[asdict(alert) for alert in active_alerts],
            performance_metrics=current_metrics.__dict__
        )
    
    async def _check_system_health(self) -> Dict[str, Any]:
        """Check health of all system components"""
        health_status = {}
        
        # Check traffic proxy
        try:
            proxy_stats = ai_traffic_proxy.get_statistics()
            health_status["traffic_proxy"] = {
                "status": "healthy",
                "total_requests": proxy_stats["total_requests"],
                "active_devices": proxy_stats["active_devices"]
            }
        except Exception as e:
            health_status["traffic_proxy"] = {
                "status": "unhealthy",
                "error": str(e)
            }
            self.health_checks["traffic_proxy"] = False
        
        # Check device tracker
        try:
            device_stats = await device_tracker.get_device_statistics()
            health_status["device_tracker"] = {
                "status": "healthy",
                "total_devices": device_stats["total_devices"],
                "active_devices": device_stats["active_devices"]
            }
        except Exception as e:
            health_status["device_tracker"] = {
                "status": "unhealthy",
                "error": str(e)
            }
            self.health_checks["device_tracker"] = False
        
        # Check PII detector
        try:
            pii_stats = await pii_detector.get_pii_statistics()
            health_status["pii_detector"] = {
                "status": "healthy",
                "total_detections": pii_stats["total_detections"]
            }
        except Exception as e:
            health_status["pii_detector"] = {
                "status": "unhealthy",
                "error": str(e)
            }
            self.health_checks["pii_detector"] = False
        
        # Check security analyzer
        try:
            security_stats = await security_analyzer.get_security_statistics()
            health_status["security_analyzer"] = {
                "status": "healthy",
                "total_analyses": security_stats["total_analyses"]
            }
        except Exception as e:
            health_status["security_analyzer"] = {
                "status": "unhealthy",
                "error": str(e)
            }
            self.health_checks["security_analyzer"] = False
        
        # Check traffic analyzer
        try:
            current_metrics = await traffic_analyzer.get_current_metrics()
            health_status["traffic_analyzer"] = {
                "status": "healthy",
                "total_requests": current_metrics.total_requests,
                "avg_response_time": current_metrics.avg_response_time
            }
        except Exception as e:
            health_status["traffic_analyzer"] = {
                "status": "unhealthy",
                "error": str(e)
            }
            self.health_checks["traffic_analyzer"] = False
        
        return health_status
    
    def _determine_system_status(self, metrics, alerts) -> str:
        """Determine overall system status"""
        # Check for critical alerts
        critical_alerts = [alert for alert in alerts if alert.severity == "critical"]
        if critical_alerts:
            return "critical"
        
        # Check error rate
        if metrics.error_rate > self.alert_thresholds["high_error_rate"] * 100:
            return "degraded"
        
        # Check response time
        if metrics.avg_response_time > self.alert_thresholds["high_response_time"]:
            return "degraded"
        
        # Check system health
        unhealthy_components = sum(1 for healthy in self.health_checks.values() if not healthy)
        if unhealthy_components > 2:
            return "degraded"
        
        return "operational"
    
    async def monitor_system(self):
        """Continuous system monitoring"""
        while True:
            try:
                # Get current status
                status = await self.get_system_status()
                
                # Check for alerts
                await self._check_alerts(status)
                
                # Update circuit breakers
                await self._update_circuit_breakers()
                
                # Log system status
                logger.info(f"System status: {status.system_status}, Active devices: {status.active_devices}")
                
                # Wait before next check
                await asyncio.sleep(30)  # Check every 30 seconds
                
            except Exception as e:
                logger.error(f"Error in system monitoring: {str(e)}")
                await asyncio.sleep(60)  # Wait longer on error
    
    async def _check_alerts(self, status: MissionControlStatus):
        """Check for conditions that require alerts"""
        current_time = datetime.utcnow()
        
        # Check error rate
        if status.performance_metrics.get("error_rate", 0) > self.alert_thresholds["high_error_rate"] * 100:
            await self._create_alert(
                severity="warning",
                category="performance",
                title="High Error Rate",
                description=f"Error rate is {status.performance_metrics.get('error_rate', 0):.1f}%",
                source="mission_control"
            )
        
        # Check response time
        if status.performance_metrics.get("avg_response_time", 0) > self.alert_thresholds["high_response_time"]:
            await self._create_alert(
                severity="warning",
                category="performance",
                title="High Response Time",
                description=f"Average response time is {status.performance_metrics.get('avg_response_time', 0):.0f}ms",
                source="mission_control"
            )
        
        # Check security incidents
        if status.security_incidents > self.alert_thresholds["security_incidents_per_hour"]:
            await self._create_alert(
                severity="error",
                category="security",
                title="High Security Incident Rate",
                description=f"{status.security_incidents} security incidents detected",
                source="mission_control"
            )
        
        # Check PII incidents
        if status.pii_incidents > self.alert_thresholds["pii_incidents_per_hour"]:
            await self._create_alert(
                severity="warning",
                category="pii",
                title="High PII Incident Rate",
                description=f"{status.pii_incidents} PII incidents detected",
                source="mission_control"
            )
        
        # Check device limit
        if status.active_devices > self.alert_thresholds["device_limit"]:
            await self._create_alert(
                severity="warning",
                category="system",
                title="Device Limit Exceeded",
                description=f"{status.active_devices} active devices exceeds limit",
                source="mission_control"
            )
    
    async def _create_alert(self, severity: str, category: str, title: str, description: str, source: str):
        """Create a new system alert"""
        alert_id = f"{category}_{int(datetime.utcnow().timestamp())}"
        
        # Check if similar alert already exists
        existing_alert = next(
            (alert for alert in self.alerts 
             if alert.category == category and alert.title == title and not alert.resolved),
            None
        )
        
        if existing_alert:
            return  # Don't create duplicate alerts
        
        alert = SystemAlert(
            alert_id=alert_id,
            timestamp=datetime.utcnow(),
            severity=severity,
            category=category,
            title=title,
            description=description,
            source=source,
            resolved=False,
            resolution_notes=None
        )
        
        self.alerts.append(alert)
        logger.warning(f"Alert created: {title} - {description}")
    
    async def _update_circuit_breakers(self):
        """Update circuit breaker status"""
        # This would be enhanced with actual failure tracking
        for provider, breaker in self.circuit_breakers.items():
            if breaker["status"] == "open":
                # Check if enough time has passed to try again
                if breaker["last_failure"]:
                    time_since_failure = datetime.utcnow() - breaker["last_failure"]
                    if time_since_failure > timedelta(minutes=5):
                        breaker["status"] = "half-open"
                        breaker["failure_count"] = 0
                        logger.info(f"Circuit breaker for {provider} moved to half-open")
    
    async def get_dashboard_data(self) -> Dict[str, Any]:
        """Get data for mission control dashboard"""
        status = await self.get_system_status()
        traffic_patterns = await traffic_analyzer.get_traffic_patterns(24)
        device_stats = await device_tracker.get_device_statistics()
        
        return {
            "system_status": asdict(status),
            "traffic_patterns": traffic_patterns,
            "device_statistics": device_stats,
            "circuit_breakers": self.circuit_breakers,
            "alert_thresholds": self.alert_thresholds,
            "timestamp": datetime.utcnow().isoformat()
        }
    
    async def resolve_alert(self, alert_id: str, resolution_notes: str):
        """Resolve a system alert"""
        alert = next((alert for alert in self.alerts if alert.alert_id == alert_id), None)
        if alert:
            alert.resolved = True
            alert.resolution_notes = resolution_notes
            logger.info(f"Alert resolved: {alert_id}")
            return True
        return False
    
    async def emergency_shutdown(self, reason: str):
        """Emergency shutdown of AI services"""
        logger.critical(f"EMERGENCY SHUTDOWN INITIATED: {reason}")
        
        # Create critical alert
        await self._create_alert(
            severity="critical",
            category="system",
            title="Emergency Shutdown",
            description=f"Emergency shutdown initiated: {reason}",
            source="mission_control"
        )
        
        # Set system status to critical
        self.system_status = "critical"
        
        # This would trigger actual service shutdown in production
        return {"status": "shutdown_initiated", "reason": reason}
    
    async def get_emergency_controls(self) -> Dict[str, Any]:
        """Get emergency control options"""
        return {
            "circuit_breakers": self.circuit_breakers,
            "system_status": self.system_status,
            "active_alerts": len([alert for alert in self.alerts if not alert.resolved]),
            "emergency_actions": [
                "shutdown_openai",
                "shutdown_anthropic",
                "enable_maintenance_mode",
                "emergency_shutdown"
            ]
        }

# Global instance
ai_mission_control = AIMissionControl()

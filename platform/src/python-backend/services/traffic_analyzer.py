"""
Traffic Analyzer Service
Analyzes and logs AI traffic patterns, usage statistics, and performance metrics
"""
import json
import time
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
import logging

logger = logging.getLogger(__name__)

@dataclass
class TrafficMetrics:
    """Traffic metrics model"""
    timestamp: datetime
    total_requests: int
    total_responses: int
    total_tokens: int
    total_cost: float
    avg_response_time: float
    success_rate: float
    error_rate: float
    active_devices: int
    active_users: int
    pii_incidents: int
    security_incidents: int
    top_models: List[Dict[str, Any]]
    top_users: List[Dict[str, Any]]
    top_devices: List[Dict[str, Any]]

class TrafficAnalyzer:
    """Traffic analysis and logging service"""
    
    def __init__(self):
        # Traffic logs storage (would be replaced with database in production)
        self.traffic_logs: List[Dict[str, Any]] = []
        self.metrics_history: List[TrafficMetrics] = []
        
        # Real-time counters
        self.counters = {
            "total_requests": 0,
            "total_responses": 0,
            "total_tokens": 0,
            "total_cost": 0.0,
            "successful_requests": 0,
            "failed_requests": 0,
            "pii_incidents": 0,
            "security_incidents": 0,
            "response_times": [],
            "active_devices": set(),
            "active_users": set(),
            "model_usage": {},
            "user_usage": {},
            "device_usage": {}
        }
        
        # Performance tracking
        self.performance_metrics = {
            "avg_response_time": 0.0,
            "p95_response_time": 0.0,
            "p99_response_time": 0.0,
            "throughput_per_minute": 0.0
        }
    
    async def log_traffic(self, traffic_request, traffic_response):
        """Log traffic request and response"""
        log_entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "request_id": traffic_request.request_id,
            "source_ip": traffic_request.source_ip,
            "mac_address": traffic_request.mac_address,
            "user_id": traffic_request.user_id,
            "endpoint": traffic_request.endpoint,
            "method": traffic_request.method,
            "target_provider": traffic_request.target_provider,
            "target_model": traffic_request.target_model,
            "status_code": traffic_response.status_code,
            "response_time_ms": traffic_response.response_time_ms,
            "tokens_used": traffic_response.tokens_used,
            "cost": traffic_response.cost,
            "pii_detected": traffic_response.pii_detected,
            "security_risks": traffic_response.security_risks,
            "device_info": traffic_response.device_info
        }
        
        # Store log entry
        self.traffic_logs.append(log_entry)
        
        # Update counters
        await self._update_counters(traffic_request, traffic_response)
        
        # Keep only last 10000 log entries
        if len(self.traffic_logs) > 10000:
            self.traffic_logs = self.traffic_logs[-10000:]
        
        logger.info(f"Logged traffic: {traffic_request.request_id}")
    
    async def _update_counters(self, traffic_request, traffic_response):
        """Update real-time counters"""
        self.counters["total_requests"] += 1
        self.counters["total_responses"] += 1
        self.counters["total_tokens"] += traffic_response.tokens_used
        self.counters["total_cost"] += traffic_response.cost
        
        # Track success/failure
        if 200 <= traffic_response.status_code < 300:
            self.counters["successful_requests"] += 1
        else:
            self.counters["failed_requests"] += 1
        
        # Track incidents
        if traffic_response.pii_detected:
            self.counters["pii_incidents"] += 1
        
        if traffic_response.security_risks:
            self.counters["security_incidents"] += 1
        
        # Track response times
        self.counters["response_times"].append(traffic_response.response_time_ms)
        if len(self.counters["response_times"]) > 1000:
            self.counters["response_times"] = self.counters["response_times"][-1000:]
        
        # Track active devices and users
        if traffic_request.mac_address:
            self.counters["active_devices"].add(traffic_request.mac_address)
        
        if traffic_request.user_id:
            self.counters["active_users"].add(traffic_request.user_id)
        
        # Track model usage
        model_key = f"{traffic_request.target_provider}:{traffic_request.target_model}"
        if model_key not in self.counters["model_usage"]:
            self.counters["model_usage"][model_key] = {
                "requests": 0,
                "tokens": 0,
                "cost": 0.0
            }
        
        self.counters["model_usage"][model_key]["requests"] += 1
        self.counters["model_usage"][model_key]["tokens"] += traffic_response.tokens_used
        self.counters["model_usage"][model_key]["cost"] += traffic_response.cost
        
        # Track user usage
        if traffic_request.user_id:
            if traffic_request.user_id not in self.counters["user_usage"]:
                self.counters["user_usage"][traffic_request.user_id] = {
                    "requests": 0,
                    "tokens": 0,
                    "cost": 0.0
                }
            
            self.counters["user_usage"][traffic_request.user_id]["requests"] += 1
            self.counters["user_usage"][traffic_request.user_id]["tokens"] += traffic_response.tokens_used
            self.counters["user_usage"][traffic_request.user_id]["cost"] += traffic_response.cost
        
        # Track device usage
        if traffic_request.mac_address:
            if traffic_request.mac_address not in self.counters["device_usage"]:
                self.counters["device_usage"][traffic_request.mac_address] = {
                    "requests": 0,
                    "tokens": 0,
                    "cost": 0.0
                }
            
            self.counters["device_usage"][traffic_request.mac_address]["requests"] += 1
            self.counters["device_usage"][traffic_request.mac_address]["tokens"] += traffic_response.tokens_used
            self.counters["device_usage"][traffic_request.mac_address]["cost"] += traffic_response.cost
        
        # Update performance metrics
        await self._update_performance_metrics()
    
    async def _update_performance_metrics(self):
        """Update performance metrics"""
        response_times = self.counters["response_times"]
        if response_times:
            # Calculate average response time
            self.performance_metrics["avg_response_time"] = sum(response_times) / len(response_times)
            
            # Calculate percentiles
            sorted_times = sorted(response_times)
            n = len(sorted_times)
            
            if n > 0:
                p95_index = int(n * 0.95)
                p99_index = int(n * 0.99)
                
                self.performance_metrics["p95_response_time"] = sorted_times[p95_index] if p95_index < n else sorted_times[-1]
                self.performance_metrics["p99_response_time"] = sorted_times[p99_index] if p99_index < n else sorted_times[-1]
        
        # Calculate throughput (requests per minute)
        recent_logs = [log for log in self.traffic_logs 
                      if datetime.fromisoformat(log["timestamp"]) > datetime.utcnow() - timedelta(minutes=1)]
        self.performance_metrics["throughput_per_minute"] = len(recent_logs)
    
    async def get_current_metrics(self) -> TrafficMetrics:
        """Get current traffic metrics"""
        # Calculate success rate
        total_requests = self.counters["total_requests"]
        successful_requests = self.counters["successful_requests"]
        failed_requests = self.counters["failed_requests"]
        
        success_rate = (successful_requests / total_requests * 100) if total_requests > 0 else 0.0
        error_rate = (failed_requests / total_requests * 100) if total_requests > 0 else 0.0
        
        # Get top models
        top_models = sorted(
            self.counters["model_usage"].items(),
            key=lambda x: x[1]["requests"],
            reverse=True
        )[:10]
        
        # Get top users
        top_users = sorted(
            self.counters["user_usage"].items(),
            key=lambda x: x[1]["requests"],
            reverse=True
        )[:10]
        
        # Get top devices
        top_devices = sorted(
            self.counters["device_usage"].items(),
            key=lambda x: x[1]["requests"],
            reverse=True
        )[:10]
        
        return TrafficMetrics(
            timestamp=datetime.utcnow(),
            total_requests=total_requests,
            total_responses=self.counters["total_responses"],
            total_tokens=self.counters["total_tokens"],
            total_cost=self.counters["total_cost"],
            avg_response_time=self.performance_metrics["avg_response_time"],
            success_rate=success_rate,
            error_rate=error_rate,
            active_devices=len(self.counters["active_devices"]),
            active_users=len(self.counters["active_users"]),
            pii_incidents=self.counters["pii_incidents"],
            security_incidents=self.counters["security_incidents"],
            top_models=[{"model": k, **v} for k, v in top_models],
            top_users=[{"user_id": k, **v} for k, v in top_users],
            top_devices=[{"mac_address": k, **v} for k, v in top_devices]
        )
    
    async def get_historical_metrics(self, hours: int = 24) -> List[TrafficMetrics]:
        """Get historical metrics for the specified time period"""
        cutoff_time = datetime.utcnow() - timedelta(hours=hours)
        
        # Filter metrics history
        recent_metrics = [
            metrics for metrics in self.metrics_history
            if metrics.timestamp > cutoff_time
        ]
        
        return recent_metrics
    
    async def get_traffic_patterns(self, hours: int = 24) -> Dict[str, Any]:
        """Analyze traffic patterns"""
        cutoff_time = datetime.utcnow() - timedelta(hours=hours)
        recent_logs = [
            log for log in self.traffic_logs
            if datetime.fromisoformat(log["timestamp"]) > cutoff_time
        ]
        
        if not recent_logs:
            return {"error": "No traffic data available"}
        
        # Analyze patterns
        patterns = {
            "hourly_distribution": {},
            "model_distribution": {},
            "user_distribution": {},
            "device_distribution": {},
            "error_patterns": {},
            "performance_trends": []
        }
        
        # Hourly distribution
        for log in recent_logs:
            hour = datetime.fromisoformat(log["timestamp"]).hour
            patterns["hourly_distribution"][hour] = patterns["hourly_distribution"].get(hour, 0) + 1
        
        # Model distribution
        for log in recent_logs:
            model = f"{log['target_provider']}:{log['target_model']}"
            patterns["model_distribution"][model] = patterns["model_distribution"].get(model, 0) + 1
        
        # User distribution
        for log in recent_logs:
            if log["user_id"]:
                patterns["user_distribution"][log["user_id"]] = patterns["user_distribution"].get(log["user_id"], 0) + 1
        
        # Device distribution
        for log in recent_logs:
            if log["mac_address"]:
                patterns["device_distribution"][log["mac_address"]] = patterns["device_distribution"].get(log["mac_address"], 0) + 1
        
        # Error patterns
        error_logs = [log for log in recent_logs if log["status_code"] >= 400]
        for log in error_logs:
            error_type = f"HTTP_{log['status_code']}"
            patterns["error_patterns"][error_type] = patterns["error_patterns"].get(error_type, 0) + 1
        
        # Performance trends (response time over time)
        performance_data = []
        for log in recent_logs:
            performance_data.append({
                "timestamp": log["timestamp"],
                "response_time": log["response_time_ms"]
            })
        
        patterns["performance_trends"] = sorted(performance_data, key=lambda x: x["timestamp"])
        
        return patterns
    
    async def generate_report(self, hours: int = 24) -> Dict[str, Any]:
        """Generate comprehensive traffic report"""
        current_metrics = await self.get_current_metrics()
        patterns = await self.get_traffic_patterns(hours)
        
        return {
            "report_timestamp": datetime.utcnow().isoformat(),
            "report_period_hours": hours,
            "current_metrics": asdict(current_metrics),
            "traffic_patterns": patterns,
            "performance_metrics": self.performance_metrics,
            "summary": {
                "total_requests": current_metrics.total_requests,
                "total_cost": current_metrics.total_cost,
                "avg_response_time": current_metrics.avg_response_time,
                "success_rate": current_metrics.success_rate,
                "active_devices": current_metrics.active_devices,
                "security_incidents": current_metrics.security_incidents,
                "pii_incidents": current_metrics.pii_incidents
            }
        }
    
    async def save_metrics_snapshot(self):
        """Save current metrics as a snapshot"""
        current_metrics = await self.get_current_metrics()
        self.metrics_history.append(current_metrics)
        
        # Keep only last 1000 snapshots
        if len(self.metrics_history) > 1000:
            self.metrics_history = self.metrics_history[-1000:]
        
        logger.info(f"Saved metrics snapshot: {current_metrics.timestamp}")

# Global instance
traffic_analyzer = TrafficAnalyzer()

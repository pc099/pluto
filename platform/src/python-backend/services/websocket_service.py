# services/websocket_service.py
import json
import asyncio
from typing import Dict, Set, Any
from datetime import datetime
from fastapi import WebSocket
import uuid

class LiveMonitoringService:
    def __init__(self):
        # Store active WebSocket connections
        self.connections: Dict[str, WebSocket] = {}
        self.connection_metadata: Dict[str, Dict[str, Any]] = {}
        
    async def connect(self, websocket: WebSocket, user_id: str = None, team_id: str = None):
        """Accept new WebSocket connection"""
        await websocket.accept()
        
        connection_id = str(uuid.uuid4())
        self.connections[connection_id] = websocket
        self.connection_metadata[connection_id] = {
            "user_id": user_id,
            "team_id": team_id,
            "connected_at": datetime.utcnow().isoformat(),
            "last_ping": datetime.utcnow().isoformat()
        }
        
        # Send welcome message
        await self.send_to_connection(connection_id, {
            "type": "connection_established",
            "connection_id": connection_id,
            "timestamp": datetime.utcnow().isoformat(),
            "message": "Live monitoring connected"
        })
        
        print(f"[WEBSOCKET] New connection: {connection_id} (user: {user_id}, team: {team_id})")
        return connection_id
    
    def disconnect(self, connection_id: str):
        """Remove WebSocket connection"""
        if connection_id in self.connections:
            del self.connections[connection_id]
            del self.connection_metadata[connection_id]
            print(f"[WEBSOCKET] Disconnected: {connection_id}")
    
    async def send_to_connection(self, connection_id: str, data: Dict[str, Any]):
        """Send data to specific connection"""
        if connection_id in self.connections:
            try:
                websocket = self.connections[connection_id]
                await websocket.send_text(json.dumps(data))
            except Exception as e:
                print(f"[WEBSOCKET] Error sending to {connection_id}: {e}")
                self.disconnect(connection_id)
    
    async def broadcast_to_all(self, data: Dict[str, Any]):
        """Send data to all connected clients"""
        if not self.connections:
            return
        
        # Send to all connections
        disconnected = []
        for connection_id, websocket in self.connections.items():
            try:
                await websocket.send_text(json.dumps(data))
            except Exception as e:
                print(f"[WEBSOCKET] Error broadcasting to {connection_id}: {e}")
                disconnected.append(connection_id)
        
        # Clean up disconnected clients
        for connection_id in disconnected:
            self.disconnect(connection_id)
    
    async def broadcast_to_team(self, team_id: str, data: Dict[str, Any]):
        """Send data to all connections from specific team"""
        disconnected = []
        for connection_id, websocket in self.connections.items():
            try:
                metadata = self.connection_metadata.get(connection_id, {})
                if metadata.get("team_id") == team_id:
                    await websocket.send_text(json.dumps(data))
            except Exception as e:
                print(f"[WEBSOCKET] Error sending to team {team_id}, connection {connection_id}: {e}")
                disconnected.append(connection_id)
        
        # Clean up disconnected clients
        for connection_id in disconnected:
            self.disconnect(connection_id)
    
    async def stream_request_live(self, request_data: Dict[str, Any]):
        """Stream AI request in real-time to connected clients"""
        live_data = {
            "type": "live_request",
            "timestamp": datetime.utcnow().isoformat(),
            "request_id": request_data.get("request_id", str(uuid.uuid4())),
            "provider": request_data.get("provider"),
            "endpoint": request_data.get("endpoint"),
            "user_id": request_data.get("user_id"),
            "team_id": request_data.get("team_id"),
            "model": request_data.get("model"),
            "status": request_data.get("status", "processing"),
            "estimated_cost": request_data.get("estimated_cost", 0),
            "policy_violations": request_data.get("policy_violations", []),
            "blocked": request_data.get("blocked", False),
            "content_preview": self._get_content_preview(request_data.get("content", ""))
        }
        
        await self.broadcast_to_all(live_data)
    
    async def stream_response_live(self, response_data: Dict[str, Any]):
        """Stream AI response in real-time"""
        live_data = {
            "type": "live_response", 
            "timestamp": datetime.utcnow().isoformat(),
            "request_id": response_data.get("request_id"),
            "status": response_data.get("status", "completed"),
            "actual_cost": response_data.get("actual_cost", 0),
            "duration": response_data.get("duration", 0),
            "input_tokens": response_data.get("input_tokens", 0),
            "output_tokens": response_data.get("output_tokens", 0),
            "success": response_data.get("success", True),
            "error": response_data.get("error"),
            "response_preview": self._get_content_preview(response_data.get("response_content", ""))
        }
        
        await self.broadcast_to_all(live_data)
    
    async def stream_policy_violation(self, violation_data: Dict[str, Any]):
        """Stream policy violations in real-time"""
        live_data = {
            "type": "policy_violation",
            "timestamp": datetime.utcnow().isoformat(),
            "request_id": violation_data.get("request_id"),
            "user_id": violation_data.get("user_id"),
            "team_id": violation_data.get("team_id"),
            "violation_type": violation_data.get("violation_type"),
            "policy_name": violation_data.get("policy_name"),
            "action": violation_data.get("action"),
            "message": violation_data.get("message"),
            "severity": violation_data.get("severity", "warning")
        }
        
        await self.broadcast_to_all(live_data)
    
    async def stream_cost_alert(self, cost_data: Dict[str, Any]):
        """Stream cost alerts in real-time"""
        live_data = {
            "type": "cost_alert",
            "timestamp": datetime.utcnow().isoformat(),
            "user_id": cost_data.get("user_id"),
            "team_id": cost_data.get("team_id"),
            "current_spend": cost_data.get("current_spend", 0),
            "budget_limit": cost_data.get("budget_limit", 0),
            "time_window": cost_data.get("time_window", "daily"),
            "percentage_used": cost_data.get("percentage_used", 0),
            "alert_level": cost_data.get("alert_level", "warning")  # warning, critical
        }
        
        await self.broadcast_to_all(live_data)
    
    def _get_content_preview(self, content: str, max_length: int = 100) -> str:
        """Get preview of content for live streaming"""
        if not content:
            return ""
        
        content_str = str(content)
        if len(content_str) <= max_length:
            return content_str
        
        return content_str[:max_length] + "..."
    
    def get_connection_stats(self) -> Dict[str, Any]:
        """Get statistics about active connections"""
        total_connections = len(self.connections)
        
        # Group by team
        teams = {}
        users = set()
        
        for metadata in self.connection_metadata.values():
            team_id = metadata.get("team_id")
            user_id = metadata.get("user_id")
            
            if team_id:
                teams[team_id] = teams.get(team_id, 0) + 1
            if user_id:
                users.add(user_id)
        
        return {
            "total_connections": total_connections,
            "unique_users": len(users),
            "teams": teams,
            "connections_by_team": teams
        }
    
    async def send_heartbeat(self):
        """Send heartbeat to all connections"""
        heartbeat_data = {
            "type": "heartbeat",
            "timestamp": datetime.utcnow().isoformat(),
            "stats": self.get_connection_stats()
        }
        
        await self.broadcast_to_all(heartbeat_data)

# Create singleton instance
live_monitor = LiveMonitoringService()

# Alias for compatibility with existing code
websocket_manager = live_monitor

# Add broadcast_to_subscribers method for compatibility
class WebSocketManager:
    def __init__(self, live_monitor):
        self.live_monitor = live_monitor
    
    async def broadcast_to_subscribers(self, data: Dict[str, Any]):
        """Alias for broadcast_to_all for compatibility"""
        await self.live_monitor.broadcast_to_all(data)

# Create the websocket_manager instance
websocket_manager = WebSocketManager(live_monitor)

# Background task to send heartbeats every 30 seconds
async def heartbeat_task():
    while True:
        await asyncio.sleep(30)
        await live_monitor.send_heartbeat()
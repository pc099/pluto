"""
Device Tracking Service
Tracks and manages device information, MAC addresses, and user associations
"""
import asyncio
import time
from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta
from dataclasses import dataclass
import hashlib
import json
import logging

logger = logging.getLogger(__name__)

@dataclass
class DeviceInfo:
    """Device information model"""
    mac_address: str
    device_id: str
    user_id: Optional[str]
    device_name: Optional[str]
    device_type: Optional[str]  # laptop, desktop, mobile, etc.
    os_info: Optional[str]
    browser_info: Optional[str]
    first_seen: datetime
    last_seen: datetime
    total_requests: int
    total_tokens: int
    total_cost: float
    is_active: bool
    department: Optional[str]
    location: Optional[str]

@dataclass
class UserDeviceMapping:
    """Mapping between users and devices"""
    user_id: str
    device_id: str
    mac_address: str
    associated_at: datetime
    is_primary: bool
    last_used: datetime

class DeviceTracker:
    """Device tracking and management service"""
    
    def __init__(self):
        # In-memory storage (would be replaced with database in production)
        self.devices: Dict[str, DeviceInfo] = {}
        self.user_device_mappings: Dict[str, List[UserDeviceMapping]] = {}
        self.mac_to_device: Dict[str, str] = {}  # MAC address -> device_id
        self.device_requests: Dict[str, List[Dict[str, Any]]] = {}
        
        # Device fingerprinting
        self.device_fingerprints: Dict[str, str] = {}
        
    async def track_request(self, traffic_request) -> Optional[DeviceInfo]:
        """Track a request and return device information"""
        mac_address = traffic_request.mac_address
        if not mac_address:
            return None
        
        # Get or create device
        device_info = await self._get_or_create_device(traffic_request)
        
        # Update device statistics
        await self._update_device_stats(device_info, traffic_request)
        
        # Log request for this device
        await self._log_device_request(device_info.device_id, traffic_request)
        
        return device_info
    
    async def _get_or_create_device(self, traffic_request) -> DeviceInfo:
        """Get existing device or create new one"""
        mac_address = traffic_request.mac_address
        
        # Check if device exists
        if mac_address in self.mac_to_device:
            device_id = self.mac_to_device[mac_address]
            device_info = self.devices[device_id]
            
            # Update last seen
            device_info.last_seen = datetime.utcnow()
            device_info.is_active = True
            
            return device_info
        
        # Create new device
        device_id = self._generate_device_id(mac_address)
        device_info = DeviceInfo(
            mac_address=mac_address,
            device_id=device_id,
            user_id=traffic_request.user_id,
            device_name=self._extract_device_name(traffic_request),
            device_type=self._detect_device_type(traffic_request),
            os_info=self._extract_os_info(traffic_request),
            browser_info=self._extract_browser_info(traffic_request),
            first_seen=datetime.utcnow(),
            last_seen=datetime.utcnow(),
            total_requests=0,
            total_tokens=0,
            total_cost=0.0,
            is_active=True,
            department=self._extract_department(traffic_request),
            location=self._extract_location(traffic_request)
        )
        
        # Store device
        self.devices[device_id] = device_info
        self.mac_to_device[mac_address] = device_id
        
        # Create user-device mapping if user_id exists
        if traffic_request.user_id:
            await self._create_user_device_mapping(traffic_request.user_id, device_info)
        
        logger.info(f"Created new device: {device_id} for MAC: {mac_address}")
        return device_info
    
    def _generate_device_id(self, mac_address: str) -> str:
        """Generate unique device ID from MAC address"""
        # Create a hash of MAC address for device ID
        return hashlib.sha256(mac_address.encode()).hexdigest()[:16]
    
    def _extract_device_name(self, traffic_request) -> Optional[str]:
        """Extract device name from request headers"""
        user_agent = traffic_request.headers.get("user-agent", "")
        
        # Simple device name extraction
        if "Windows" in user_agent:
            return "Windows Device"
        elif "Mac" in user_agent:
            return "Mac Device"
        elif "Linux" in user_agent:
            return "Linux Device"
        elif "Mobile" in user_agent or "Android" in user_agent or "iPhone" in user_agent:
            return "Mobile Device"
        else:
            return "Unknown Device"
    
    def _detect_device_type(self, traffic_request) -> Optional[str]:
        """Detect device type from request"""
        user_agent = traffic_request.headers.get("user-agent", "").lower()
        
        if any(mobile in user_agent for mobile in ["mobile", "android", "iphone", "ipad"]):
            return "mobile"
        elif "tablet" in user_agent:
            return "tablet"
        else:
            return "desktop"
    
    def _extract_os_info(self, traffic_request) -> Optional[str]:
        """Extract OS information from user agent"""
        user_agent = traffic_request.headers.get("user-agent", "")
        
        # Simple OS detection
        if "Windows NT 10.0" in user_agent:
            return "Windows 10"
        elif "Windows NT 6.3" in user_agent:
            return "Windows 8.1"
        elif "Mac OS X" in user_agent:
            return "macOS"
        elif "Linux" in user_agent:
            return "Linux"
        elif "Android" in user_agent:
            return "Android"
        elif "iPhone" in user_agent or "iPad" in user_agent:
            return "iOS"
        else:
            return "Unknown OS"
    
    def _extract_browser_info(self, traffic_request) -> Optional[str]:
        """Extract browser information from user agent"""
        user_agent = traffic_request.headers.get("user-agent", "")
        
        # Simple browser detection
        if "Chrome" in user_agent:
            return "Chrome"
        elif "Firefox" in user_agent:
            return "Firefox"
        elif "Safari" in user_agent:
            return "Safari"
        elif "Edge" in user_agent:
            return "Edge"
        else:
            return "Unknown Browser"
    
    def _extract_department(self, traffic_request) -> Optional[str]:
        """Extract department information from headers or user context"""
        # This would be enhanced with actual user context
        return traffic_request.headers.get("x-department")
    
    def _extract_location(self, traffic_request) -> Optional[str]:
        """Extract location information from headers or IP"""
        # This would be enhanced with IP geolocation
        return traffic_request.headers.get("x-location")
    
    async def _create_user_device_mapping(self, user_id: str, device_info: DeviceInfo):
        """Create mapping between user and device"""
        mapping = UserDeviceMapping(
            user_id=user_id,
            device_id=device_info.device_id,
            mac_address=device_info.mac_address,
            associated_at=datetime.utcnow(),
            is_primary=False,  # Would be determined by business logic
            last_used=datetime.utcnow()
        )
        
        if user_id not in self.user_device_mappings:
            self.user_device_mappings[user_id] = []
        
        self.user_device_mappings[user_id].append(mapping)
    
    async def _update_device_stats(self, device_info: DeviceInfo, traffic_request):
        """Update device statistics"""
        device_info.total_requests += 1
        device_info.last_seen = datetime.utcnow()
        device_info.is_active = True
    
    async def _log_device_request(self, device_id: str, traffic_request):
        """Log request for device tracking"""
        if device_id not in self.device_requests:
            self.device_requests[device_id] = []
        
        request_log = {
            "timestamp": datetime.utcnow().isoformat(),
            "request_id": traffic_request.request_id,
            "endpoint": traffic_request.endpoint,
            "method": traffic_request.method,
            "source_ip": traffic_request.source_ip,
            "user_id": traffic_request.user_id
        }
        
        self.device_requests[device_id].append(request_log)
        
        # Keep only last 1000 requests per device
        if len(self.device_requests[device_id]) > 1000:
            self.device_requests[device_id] = self.device_requests[device_id][-1000:]
    
    async def get_device_info(self, device_id: str) -> Optional[DeviceInfo]:
        """Get device information by device ID"""
        return self.devices.get(device_id)
    
    async def get_devices_by_user(self, user_id: str) -> List[DeviceInfo]:
        """Get all devices associated with a user"""
        if user_id not in self.user_device_mappings:
            return []
        
        devices = []
        for mapping in self.user_device_mappings[user_id]:
            device_info = self.devices.get(mapping.device_id)
            if device_info:
                devices.append(device_info)
        
        return devices
    
    async def get_active_devices(self) -> List[DeviceInfo]:
        """Get all currently active devices"""
        active_devices = []
        cutoff_time = datetime.utcnow() - timedelta(minutes=30)
        
        for device_info in self.devices.values():
            if device_info.last_seen > cutoff_time:
                active_devices.append(device_info)
        
        return active_devices
    
    async def get_device_statistics(self) -> Dict[str, Any]:
        """Get device tracking statistics"""
        total_devices = len(self.devices)
        active_devices = len(await self.get_active_devices())
        
        device_types = {}
        for device_info in self.devices.values():
            device_type = device_info.device_type or "unknown"
            device_types[device_type] = device_types.get(device_type, 0) + 1
        
        return {
            "total_devices": total_devices,
            "active_devices": active_devices,
            "device_types": device_types,
            "timestamp": datetime.utcnow().isoformat()
        }
    
    async def update_device_user_association(self, device_id: str, user_id: str):
        """Update user association for a device"""
        device_info = self.devices.get(device_id)
        if not device_info:
            return False
        
        device_info.user_id = user_id
        await self._create_user_device_mapping(user_id, device_info)
        return True
    
    async def deactivate_device(self, device_id: str):
        """Deactivate a device"""
        device_info = self.devices.get(device_id)
        if device_info:
            device_info.is_active = False
            return True
        return False

# Global instance
device_tracker = DeviceTracker()

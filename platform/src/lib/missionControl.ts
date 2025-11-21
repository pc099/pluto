import { API_BASE_URL } from './api';
const API_BASE = API_BASE_URL;
import { authService } from './auth';

export interface SystemStatus {
  timestamp: string;
  system_status: 'operational' | 'degraded' | 'critical';
  active_devices: number;
  active_users: number;
  total_requests_today: number;
  total_cost_today: number;
  security_incidents: number;
  pii_incidents: number;
  system_health: Record<string, unknown>;
  alerts: Alert[];
  performance_metrics: Record<string, unknown>;
}

export interface Alert {
  alert_id: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  category: 'security' | 'performance' | 'pii' | 'system';
  title: string;
  description: string;
  source: string;
  resolved: boolean;
  resolution_notes?: string;
}

export interface TrafficMetrics {
  timestamp: string;
  total_requests: number;
  total_responses: number;
  total_tokens: number;
  total_cost: number;
  avg_response_time: number;
  success_rate: number;
  error_rate: number;
  active_devices: number;
  active_users: number;
  pii_incidents: number;
  security_incidents: number;
  top_models: Array<{ model: string; requests: number; tokens: number; cost: number }>;
  top_users: Array<{ user_id: string; requests: number; tokens: number; cost: number }>;
  top_devices: Array<{ mac_address: string; requests: number; tokens: number; cost: number }>;
}

export interface DeviceInfo {
  mac_address: string;
  device_id: string;
  user_id?: string;
  device_name?: string;
  device_type?: string;
  os_info?: string;
  browser_info?: string;
  first_seen: string;
  last_seen: string;
  total_requests: number;
  total_tokens: number;
  total_cost: number;
  is_active: boolean;
  department?: string;
  location?: string;
}

export interface DashboardData {
  system_status: SystemStatus;
  traffic_patterns: Record<string, unknown>;
  device_statistics: Record<string, unknown>;
  circuit_breakers: Record<string, unknown>;
  alert_thresholds: Record<string, unknown>;
  timestamp: string;
}

class MissionControlService {
  private getAuthHeaders(): Record<string, string> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Authentication required');
    }
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  async getSystemStatus(): Promise<SystemStatus> {
    try {
      const response = await fetch(`${API_BASE}/mission-control/status`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to get system status');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error getting system status:', error);
      throw error;
    }
  }

  async getDashboardData(): Promise<DashboardData> {
    try {
      const response = await fetch(`${API_BASE}/mission-control/dashboard`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to get dashboard data');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error getting dashboard data:', error);
      throw error;
    }
  }

  async getTrafficMetrics(hours: number = 24): Promise<{
    current_metrics: TrafficMetrics;
    historical_metrics: TrafficMetrics[];
    traffic_patterns: Record<string, unknown>;
  }> {
    try {
      const response = await fetch(`${API_BASE}/mission-control/traffic-metrics?hours=${hours}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to get traffic metrics');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error getting traffic metrics:', error);
      throw error;
    }
  }

  async getDeviceStatistics(): Promise<{
    statistics: Record<string, unknown>;
    active_devices: DeviceInfo[];
  }> {
    try {
      const response = await fetch(`${API_BASE}/mission-control/device-statistics`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to get device statistics');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error getting device statistics:', error);
      throw error;
    }
  }

  async getAlerts(resolved?: boolean, severity?: string): Promise<{
    alerts: Alert[];
    total_count: number;
  }> {
    try {
      const params = new URLSearchParams();
      if (resolved !== undefined) params.append('resolved', resolved.toString());
      if (severity) params.append('severity', severity);

      const response = await fetch(`${API_BASE}/mission-control/alerts?${params}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to get alerts');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error getting alerts:', error);
      throw error;
    }
  }

  async resolveAlert(alertId: string, resolutionNotes: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE}/mission-control/alerts/${alertId}/resolve`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ resolution_notes: resolutionNotes }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to resolve alert');
      }
    } catch (error) {
      console.error('Error resolving alert:', error);
      throw error;
    }
  }

  async getEmergencyControls(): Promise<Record<string, unknown>> {
    try {
      const response = await fetch(`${API_BASE}/mission-control/emergency-controls`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to get emergency controls');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error getting emergency controls:', error);
      throw error;
    }
  }

  async emergencyShutdown(reason: string): Promise<Record<string, unknown>> {
    try {
      const response = await fetch(`${API_BASE}/mission-control/emergency-shutdown`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to initiate emergency shutdown');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error initiating emergency shutdown:', error);
      throw error;
    }
  }

  async healthCheck(): Promise<{
    status: string;
    system_status?: string;
    error?: string;
  }> {
    try {
      const response = await fetch(`${API_BASE}/mission-control/health`, {
        method: 'GET',
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error checking health:', error);
      return { status: 'unhealthy', error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}

export const missionControlService = new MissionControlService();

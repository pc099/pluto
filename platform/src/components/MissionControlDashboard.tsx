'use client'
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Shield, 
  Users, 
  DollarSign, 
  Clock,
  Server,
  Eye,
  AlertCircle,
  Zap,
  TrendingUp,
  TrendingDown,
  RefreshCw
} from 'lucide-react'
import { 
  missionControlService, 
  SystemStatus, 
  Alert as SystemAlert, 
  TrafficMetrics, 
  DeviceInfo,
  DashboardData 
} from '@/lib/missionControl'

export default function MissionControlDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null)
  const [trafficMetrics, setTrafficMetrics] = useState<TrafficMetrics | null>(null)
  const [deviceStats, setDeviceStats] = useState<{ statistics: Record<string, unknown>; active_devices: DeviceInfo[] } | null>(null)
  const [alerts, setAlerts] = useState<SystemAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [dashboard, status, metrics, devices, alertsData] = await Promise.all([
        missionControlService.getDashboardData(),
        missionControlService.getSystemStatus(),
        missionControlService.getTrafficMetrics(24),
        missionControlService.getDeviceStatistics(),
        missionControlService.getAlerts(false) // Get unresolved alerts only
      ])

      setDashboardData(dashboard)
      setSystemStatus(status)
      setTrafficMetrics(metrics.current_metrics)
      setDeviceStats(devices)
      setAlerts(alertsData.alerts)
      setLastUpdated(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000)
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'bg-green-500'
      case 'degraded': return 'bg-yellow-500'
      case 'critical': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational': return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'degraded': return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'critical': return <XCircle className="h-5 w-5 text-red-500" />
      default: return <Activity className="h-5 w-5 text-gray-500" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive'
      case 'error': return 'destructive'
      case 'warning': return 'default'
      case 'info': return 'default'
      default: return 'default'
    }
  }

  if (loading && !dashboardData) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading Mission Control Dashboard...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Connection Error</AlertTitle>
          <AlertDescription className="mt-2">
            {error}
            <div className="mt-4">
              <Button onClick={fetchDashboardData} size="sm" variant="outline" className="bg-white/10 hover:bg-white/20">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry Connection
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!dashboardData && !loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <Server className="h-12 w-12 mb-4 opacity-50" />
        <h3 className="text-lg font-medium">No Data Available</h3>
        <p className="text-sm mb-4">Unable to retrieve mission control data.</p>
        <Button onClick={fetchDashboardData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Mission Control</h1>
          <p className="text-gray-600">Enterprise AI Traffic Monitoring & Control Center</p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${getStatusColor(systemStatus?.system_status || 'unknown')}`} />
            <span>{systemStatus?.system_status?.toUpperCase() || 'UNKNOWN'}</span>
          </Badge>
          <Button onClick={fetchDashboardData} size="sm" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">System Status</p>
                <div className="flex items-center mt-2">
                  {getStatusIcon(systemStatus?.system_status || 'unknown')}
                  <span className="ml-2 text-lg font-semibold">
                    {systemStatus?.system_status?.toUpperCase() || 'UNKNOWN'}
                  </span>
                </div>
              </div>
              <Server className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Devices</p>
                <p className="text-2xl font-bold">{systemStatus?.active_devices || 0}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Requests Today</p>
                <p className="text-2xl font-bold">{systemStatus?.total_requests_today?.toLocaleString() || 0}</p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Cost Today</p>
                <p className="text-2xl font-bold">${systemStatus?.total_cost_today?.toFixed(2) || '0.00'}</p>
              </div>
              <DollarSign className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-yellow-500" />
              Active Alerts ({alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.slice(0, 5).map((alert) => (
                <Alert key={alert.alert_id} variant={getSeverityColor(alert.severity)}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle className="flex items-center justify-between">
                    <span>{alert.title}</span>
                    <Badge variant={getSeverityColor(alert.severity)}>
                      {alert.severity.toUpperCase()}
                    </Badge>
                  </AlertTitle>
                  <AlertDescription>
                    {alert.description}
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(alert.timestamp).toLocaleString()} • {alert.category}
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Metrics */}
      <Tabs defaultValue="traffic" className="space-y-4">
        <TabsList>
          <TabsTrigger value="traffic">Traffic Metrics</TabsTrigger>
          <TabsTrigger value="devices">Device Tracking</TabsTrigger>
          <TabsTrigger value="security">Security & PII</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="traffic" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
                  <div>
                    <p className="text-2xl font-bold">{trafficMetrics?.success_rate?.toFixed(1) || 0}%</p>
                    <p className="text-sm text-gray-600">Error Rate: {trafficMetrics?.error_rate?.toFixed(1) || 0}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-blue-500 mr-3" />
                  <div>
                    <p className="text-2xl font-bold">{trafficMetrics?.avg_response_time?.toFixed(0) || 0}ms</p>
                    <p className="text-sm text-gray-600">Average</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Token Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Zap className="h-8 w-8 text-purple-500 mr-3" />
                  <div>
                    <p className="text-2xl font-bold">{trafficMetrics?.total_tokens?.toLocaleString() || 0}</p>
                    <p className="text-sm text-gray-600">Total Tokens</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Models */}
          {trafficMetrics?.top_models && trafficMetrics.top_models.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Top AI Models</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {trafficMetrics.top_models.slice(0, 5).map((model, index) => (
                    <div key={model.model} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-600 mr-3">#{index + 1}</span>
                        <span className="font-medium">{model.model}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{model.requests} requests</p>
                        <p className="text-xs text-gray-500">{model.tokens.toLocaleString()} tokens</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="devices" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Device Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Total Devices:</span>
                    <span className="font-medium">{(deviceStats?.statistics?.total_devices as number) || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Devices:</span>
                    <span className="font-medium">{(deviceStats?.statistics?.active_devices as number) || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Device Types:</span>
                    <div className="text-right">
                      {deviceStats?.statistics?.device_types && typeof deviceStats.statistics.device_types === 'object' ? (
                        Object.entries(deviceStats.statistics.device_types as Record<string, number>).map(([type, count]) => (
                          <div key={type} className="text-sm">
                            {type}: {count}
                          </div>
                        ))
                      ) : null}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Active Devices</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {deviceStats?.active_devices?.slice(0, 5).map((device) => (
                    <div key={device.device_id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <p className="text-sm font-medium">{device.device_name || 'Unknown Device'}</p>
                        <p className="text-xs text-gray-500">{device.mac_address}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">{device.total_requests} requests</p>
                        <p className="text-xs text-gray-500">{device.device_type}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-red-500" />
                  Security Incidents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-bold text-red-500">{systemStatus?.security_incidents || 0}</p>
                  <p className="text-sm text-gray-600">Total Security Incidents</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="h-5 w-5 mr-2 text-yellow-500" />
                  PII Incidents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-bold text-yellow-500">{systemStatus?.pii_incidents || 0}</p>
                  <p className="text-sm text-gray-600">Total PII Incidents</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold">{trafficMetrics?.avg_response_time?.toFixed(0) || 0}ms</p>
                  <p className="text-sm text-gray-600">Avg Response Time</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{trafficMetrics?.total_requests?.toLocaleString() || 0}</p>
                  <p className="text-sm text-gray-600">Total Requests</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{trafficMetrics?.active_users || 0}</p>
                  <p className="text-sm text-gray-600">Active Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Last Updated */}
      <div className="text-center text-sm text-gray-500">
        Last updated: {lastUpdated.toLocaleString()}
      </div>
    </div>
  )
}

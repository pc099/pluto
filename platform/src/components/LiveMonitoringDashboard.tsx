'use client'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Activity, 
  CheckCircle, 
  AlertTriangle, 
  Link, 
  DollarSign, 
  Zap,
  Rocket,
  Shield,
  TrendingUp,
  Clock,
  Users,
  BarChart3
} from 'lucide-react'

interface LiveRequest {
  id: string
  timestamp: string
  provider: string
  model: string
  status: 'processing' | 'completed' | 'error'
  cost: number
  duration: number
  tokens: number
}

export default function LiveMonitoringDashboard() {
  const [requests, setRequests] = useState<LiveRequest[]>([])
  const [autoScroll, setAutoScroll] = useState(true)
  const [stats, setStats] = useState({
    totalRequests: 0,
    successful: 0,
    violations: 0,
    liveConnections: 0,
    totalCost: 0,
    avgLatency: 0
  })

  // Simulate some mock data for demonstration
  useEffect(() => {
    const mockRequests: LiveRequest[] = [
      {
        id: 'req-001',
        timestamp: new Date(Date.now() - 1000 * 30).toISOString(),
        provider: 'OpenAI',
        model: 'GPT-4',
        status: 'completed',
        cost: 0.05,
        duration: 1.2,
        tokens: 150
      },
      {
        id: 'req-002',
        timestamp: new Date(Date.now() - 1000 * 60).toISOString(),
        provider: 'Anthropic',
        model: 'Claude-3.5-Sonnet',
        status: 'processing',
        cost: 0.03,
        duration: 0.8,
        tokens: 200
      }
    ]

    setRequests(mockRequests)
    setStats({
      totalRequests: 1247,
      successful: 1198,
      violations: 12,
      liveConnections: 8,
      totalCost: 45.67,
      avgLatency: 1.2
    })
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'error':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />
      case 'processing':
        return <Activity className="w-4 h-4" />
      case 'error':
        return <AlertTriangle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">AI Mission Control</h1>
          <p className="text-gray-300 mt-1">Real-time intelligence across your AI infrastructure</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            LIVE
          </div>
          <Button variant="outline" size="sm" className="text-white border-gray-600 hover:bg-gray-800">
            Clear Logs
          </Button>
          <Button 
            variant={autoScroll ? "default" : "outline"} 
            size="sm"
            onClick={() => setAutoScroll(!autoScroll)}
            className={autoScroll ? "bg-purple-600" : "text-white border-gray-600 hover:bg-gray-800"}
          >
            Auto-scroll: {autoScroll ? 'ON' : 'OFF'}
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Requests</p>
                <p className="text-2xl font-bold text-white">{stats.totalRequests.toLocaleString()}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Successful</p>
                <p className="text-2xl font-bold text-white">{stats.successful.toLocaleString()}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Violations</p>
                <p className="text-2xl font-bold text-white">{stats.violations}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Live Connections</p>
                <p className="text-2xl font-bold text-white">{stats.liveConnections}</p>
              </div>
              <Link className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Cost</p>
                <p className="text-2xl font-bold text-white">${stats.totalCost.toFixed(2)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Avg Latency</p>
                <p className="text-2xl font-bold text-white">{stats.avgLatency}s</p>
              </div>
              <Zap className="w-8 h-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live AI Requests */}
        <div className="lg:col-span-2">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center text-white">
                  <Rocket className="w-5 h-5 mr-2" />
                  Live AI Requests
                </CardTitle>
                <Badge variant="secondary" className="bg-gray-700 text-gray-300">
                  {requests.length} requests
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {requests.length > 0 ? (
                <div className="space-y-3">
                  {requests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(request.status)}
                        <div>
                          <p className="text-sm font-medium text-white">{request.provider} - {request.model}</p>
                          <p className="text-xs text-gray-400">
                            {new Date(request.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="text-gray-300">${request.cost.toFixed(3)}</span>
                        <span className="text-gray-300">{request.duration}s</span>
                        <Badge className={getStatusColor(request.status)}>
                          {request.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 text-gray-500">
                    <Clock className="w-full h-full" />
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">Waiting for AI requests...</h3>
                  <p className="text-gray-400">Make an AI API call to see live monitoring in action</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Side Panels */}
        <div className="space-y-6">
          {/* Security Alerts */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Shield className="w-5 h-5 mr-2" />
                Security Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <div className="w-12 h-12 mx-auto mb-3 text-green-400">
                  <Shield className="w-full h-full" />
                </div>
                <p className="text-green-400 font-medium">All secure</p>
                <p className="text-sm text-gray-400 mt-1">No security issues detected</p>
              </div>
            </CardContent>
          </Card>

          {/* System Health */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <TrendingUp className="w-5 h-5 mr-2" />
                System Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">Latency</span>
                    <span className="text-white">{stats.avgLatency}s</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">Throughput</span>
                    <span className="text-white">45/min</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '70%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">Error Rate</span>
                    <span className="text-white">0.2%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-red-500 h-2 rounded-full" style={{ width: '2%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">Success Rate</span>
                    <span className="text-white">99.8%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '99%' }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
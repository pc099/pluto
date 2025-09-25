// src/components/MultiAgentDashboard.tsx
'use client'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const API_BASE = 'http://localhost:8000'

interface AgentType {
  id: string
  name: string
  description: string
}

interface AgentCapability {
  max_tokens: number
  supports_streaming: boolean
  supports_tools: boolean
  supports_vision: boolean
  cost_per_1k_tokens: number
  avg_latency_ms: number
  quality_score: number
}

interface AgentMetrics {
  total_requests: number
  success_rate: number
  avg_response_time: number
  total_cost: number
  health_score: number
}

interface Agent {
  id: string
  name: string
  agent_type: string
  model: string
  provider: string
  status: string
  capabilities: AgentCapability
  metrics: AgentMetrics
  created_at: string
  last_used: string | null
}

interface RoutingInsight {
  routing_success_rate: number
  avg_routing_time_ms: number
  most_used_agents: Array<[string, number]>
  strategy_performance: Record<string, {
    count: number
    avg_confidence: number
  }>
  total_routing_decisions: number
}

interface AgentAnalytics {
  summary: {
    total_agents: number
    total_requests: number
    avg_success_rate: number
    avg_response_time: number
    avg_health_score: number
    total_cost: number
  }
  performance_distribution: {
    excellent: number
    good: number
    fair: number
    poor: number
  }
  provider_breakdown: Record<string, {
    count: number
    total_requests: number
    avg_success_rate: number
    avg_response_time: number
  }>
}

export default function MultiAgentDashboard() {
  const [agentTypes, setAgentTypes] = useState<AgentType[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [analytics, setAnalytics] = useState<AgentAnalytics | null>(null)
  const [routingInsights, setRoutingInsights] = useState<RoutingInsight | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedAgentType, setSelectedAgentType] = useState<string>('')
  const [routingStrategy, setRoutingStrategy] = useState<string>('balanced')

  useEffect(() => {
    fetchMultiAgentData()
  }, [])

  const fetchMultiAgentData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch all multi-agent data
      const [typesResponse, agentsResponse, analyticsResponse, insightsResponse] = await Promise.all([
        fetch(`${API_BASE}/multi-agent/types`),
        fetch(`${API_BASE}/multi-agent/available`),
        fetch(`${API_BASE}/multi-agent/analytics`),
        fetch(`${API_BASE}/multi-agent/routing-insights`)
      ])

      if (typesResponse.ok) {
        const typesData = await typesResponse.json()
        setAgentTypes(typesData.agent_types || [])
      }

      if (agentsResponse.ok) {
        const agentsData = await agentsResponse.json()
        setAgents(agentsData.agents || [])
      }

      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json()
        setAnalytics(analyticsData)
      }

      if (insightsResponse.ok) {
        const insightsData = await insightsResponse.json()
        setRoutingInsights(insightsData)
      }

    } catch (err) {
      console.error('Error fetching multi-agent data:', err)
      setError('Failed to load multi-agent data')
    } finally {
      setLoading(false)
    }
  }

  const testAgentRouting = async () => {
    try {
      setLoading(true)
      
      const testRequest = {
        agent_type: selectedAgentType || 'chat',
        routing_strategy: routingStrategy,
        messages: [
          {
            role: 'user',
            content: 'Hello! This is a test request to demonstrate multi-agent routing capabilities.'
          }
        ],
        user_preferences: {
          max_cost: 0.01,
          max_latency: 2.0,
          quality_threshold: 8.0
        }
      }

      const response = await fetch(`${API_BASE}/multi-agent/route`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testRequest)
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Routing test result:', result)
        await fetchMultiAgentData() // Refresh data
      }

    } catch (err) {
      console.error('Error testing agent routing:', err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100'
      case 'inactive': return 'text-gray-600 bg-gray-100'
      case 'deploying': return 'text-blue-600 bg-blue-100'
      case 'error': return 'text-red-600 bg-red-100'
      case 'maintenance': return 'text-yellow-600 bg-yellow-100'
      case 'rate_limited': return 'text-orange-600 bg-orange-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getHealthScoreColor = (score: number) => {
    if (score >= 0.9) return 'text-green-600'
    if (score >= 0.7) return 'text-blue-600'
    if (score >= 0.5) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getPerformanceLevel = (score: number) => {
    if (score >= 0.9) return 'Excellent'
    if (score >= 0.7) return 'Good'
    if (score >= 0.5) return 'Fair'
    return 'Poor'
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Multi-Agent Management</h2>
          <Button disabled>Test Routing</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Multi-Agent Management</h2>
          <Button onClick={fetchMultiAgentData}>Retry</Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Multi-Agent Management</h2>
          <p className="text-gray-600">Intelligent routing and orchestration across AI agents</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={fetchMultiAgentData} variant="outline">
            Refresh
          </Button>
        </div>
      </div>

      {/* Agent Types Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Available Agent Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {agentTypes.map((type) => (
              <div key={type.id} className="text-center p-3 border rounded-lg hover:bg-gray-50">
                <div className="text-sm font-medium">{type.name}</div>
                <div className="text-xs text-gray-600 mt-1">
                  {agents.filter(a => a.agent_type === type.id).length} agents
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Analytics Summary */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.summary?.total_agents || 0}</div>
              <p className="text-xs text-gray-600">
                {agents.filter(a => a.status === 'active').length} active
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(analytics?.summary?.total_requests || 0).toLocaleString()}</div>
              <p className="text-xs text-gray-600">
                {(analytics?.summary?.avg_success_rate || 0).toFixed(1)}% success rate
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{((analytics?.summary?.avg_response_time || 0) * 1000).toFixed(0)}ms</div>
              <p className="text-xs text-gray-600">
                {(analytics?.summary?.avg_health_score || 0).toFixed(2)} health score
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${(analytics?.summary?.total_cost || 0).toFixed(4)}</div>
              <p className="text-xs text-gray-600">
                Across all agents
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Performance Distribution */}
      {analytics && (
        <Card>
          <CardHeader>
            <CardTitle>Agent Performance Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{analytics?.performance_distribution?.excellent || 0}</div>
                <div className="text-sm text-gray-600">Excellent</div>
                <div className="text-xs text-gray-500">Health &gt; 0.9</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{analytics?.performance_distribution?.good || 0}</div>
                <div className="text-sm text-gray-600">Good</div>
                <div className="text-xs text-gray-500">Health 0.7-0.9</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{analytics?.performance_distribution?.fair || 0}</div>
                <div className="text-sm text-gray-600">Fair</div>
                <div className="text-xs text-gray-500">Health 0.5-0.7</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{analytics?.performance_distribution?.poor || 0}</div>
                <div className="text-sm text-gray-600">Poor</div>
                <div className="text-xs text-gray-500">Health &lt; 0.5</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Routing Test */}
      <Card>
        <CardHeader>
          <CardTitle>Test Agent Routing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Agent Type</label>
              <select 
                value={selectedAgentType} 
                onChange={(e) => setSelectedAgentType(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">All Types</option>
                {agentTypes.map((type) => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Routing Strategy</label>
              <select 
                value={routingStrategy} 
                onChange={(e) => setRoutingStrategy(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="balanced">Balanced</option>
                <option value="performance">Performance</option>
                <option value="cost">Cost</option>
                <option value="quality">Quality</option>
                <option value="failover">Failover</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button onClick={testAgentRouting} disabled={loading}>
                Test Routing
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Agent Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <Card key={agent.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{agent.name}</CardTitle>
                <Badge className={getStatusColor(agent.status)}>
                  {agent.status}
                </Badge>
              </div>
              <div className="text-sm text-gray-600">
                {agent.provider} • {agent.model}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Health Score:</span>
                  <span className={`text-sm font-bold ${getHealthScoreColor(agent.metrics.health_score)}`}>
                    {(agent.metrics.health_score * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Success Rate:</span>
                  <span className="text-sm font-bold">
                    {(agent.metrics.success_rate * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Avg Response:</span>
                  <span className="text-sm font-bold">
                    {(agent.metrics.avg_response_time * 1000).toFixed(0)}ms
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Requests:</span>
                  <span className="text-sm font-bold">
                    {agent.metrics.total_requests.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Quality Score:</span>
                  <span className="text-sm font-bold">
                    {agent.capabilities.quality_score}/10
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Cost/1K tokens:</span>
                  <span className="text-sm font-bold">
                    ${agent.capabilities.cost_per_1k_tokens.toFixed(4)}
                  </span>
                </div>
                <div className="pt-2 border-t">
                  <div className="text-xs text-gray-600">
                    <div>Performance: <span className="font-semibold">{getPerformanceLevel(agent.metrics.health_score)}</span></div>
                    <div>Last used: {agent.last_used ? new Date(agent.last_used).toLocaleDateString() : 'Never'}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Routing Insights */}
      {routingInsights && (
        <Card>
          <CardHeader>
            <CardTitle>Routing Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {((routingInsights?.routing_success_rate || 0) * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Routing Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {routingInsights?.avg_routing_time_ms?.toFixed(1) || '0.0'}ms
                </div>
                <div className="text-sm text-gray-600">Avg Routing Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {(routingInsights?.total_routing_decisions || 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Total Routing Decisions</div>
              </div>
            </div>
            
            {routingInsights?.most_used_agents?.length > 0 && (
              <div className="mt-6">
                <h4 className="font-medium mb-3">Most Used Agents</h4>
                <div className="space-y-2">
                  {routingInsights?.most_used_agents?.slice(0, 5).map(([agentId, count]) => {
                    const agent = agents.find(a => a.id === agentId)
                    return (
                      <div key={agentId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm font-medium">
                          {agent ? agent.name : agentId}
                        </span>
                        <span className="text-sm text-gray-600">{count} requests</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

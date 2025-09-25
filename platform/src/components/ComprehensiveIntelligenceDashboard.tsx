// src/components/ComprehensiveIntelligenceDashboard.tsx
'use client'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const API_BASE = 'https://pluto-backend-qprv.onrender.com'

interface IntelligenceMetrics {
  total_agents: number
  active_agents: number
  total_requests: number
  success_rate: number
  avg_response_time: number
  cost_efficiency: number
  quality_score: number
  compliance_score: number
}

interface AgentPerformance {
  agent_id: string
  name: string
  requests_count: number
  success_rate: number
  avg_response_time: number
  cost_per_request: number
  quality_score: number
  last_active: string
}

interface ProviderComparison {
  provider: string
  requests: number
  success_rate: number
  avg_cost: number
  avg_response_time: number
  quality_score: number
}

export default function ComprehensiveIntelligenceDashboard() {
  const [metrics, setMetrics] = useState<IntelligenceMetrics | null>(null)
  const [agentPerformance, setAgentPerformance] = useState<AgentPerformance[]>([])
  const [providerComparison, setProviderComparison] = useState<ProviderComparison[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchIntelligenceData()
  }, [])

  const fetchIntelligenceData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch comprehensive intelligence data with cache busting
      const timestamp = Date.now()
      const [metricsResponse, agentsResponse, providersResponse] = await Promise.all([
        fetch(`${API_BASE}/intelligence/metrics?t=${timestamp}`),
        fetch(`${API_BASE}/intelligence/agents/performance?t=${timestamp}`),
        fetch(`${API_BASE}/intelligence/providers/comparison?t=${timestamp}`)
      ])

      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json()
        setMetrics(metricsData)
      } else {
        console.error('Metrics response not ok:', metricsResponse.status, metricsResponse.statusText)
      }

      if (agentsResponse.ok) {
        const agentsData = await agentsResponse.json()
        setAgentPerformance(agentsData)
      } else {
        console.error('Agents response not ok:', agentsResponse.status, agentsResponse.statusText)
      }

      if (providersResponse.ok) {
        const providersData = await providersResponse.json()
        setProviderComparison(providersData)
      } else {
        console.error('Providers response not ok:', providersResponse.status, providersResponse.statusText)
      }

    } catch (err) {
      console.error('Error fetching intelligence data:', err)
      setError(`Failed to load intelligence data: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const generateSampleData = async () => {
    try {
      const response = await fetch(`${API_BASE}/intelligence/generate-sample`, { 
        method: 'POST' 
      })
      if (response.ok) {
        await fetchIntelligenceData()
      }
    } catch (err) {
      console.error('Error generating sample data:', err)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Comprehensive Intelligence Dashboard</h2>
          <Button onClick={generateSampleData} disabled>
            Generate Sample Data
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
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
          <h2 className="text-2xl font-bold">Comprehensive Intelligence Dashboard</h2>
          <Button onClick={generateSampleData}>
            Generate Sample Data
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <p>{error}</p>
              <Button onClick={fetchIntelligenceData} className="mt-4">
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Comprehensive Intelligence Dashboard</h2>
        <Button onClick={generateSampleData}>
          Generate Sample Data
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Agents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.total_agents || 0}
            </div>
            <p className="text-xs text-gray-500">
              {metrics?.active_agents || 0} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.total_requests?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-gray-500">
              All time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Success Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {metrics?.success_rate?.toFixed(1) || 0}%
            </div>
            <p className="text-xs text-gray-500">
              Average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Avg Response Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.avg_response_time?.toFixed(1) || 0}s
            </div>
            <p className="text-xs text-gray-500">
              Average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Cost Efficiency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {metrics?.cost_efficiency?.toFixed(2) || 0}
            </div>
            <p className="text-xs text-gray-500">
              Score
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Quality Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {metrics?.quality_score?.toFixed(1) || 0}/10
            </div>
            <p className="text-xs text-gray-500">
              Average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Compliance Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {metrics?.compliance_score?.toFixed(1) || 0}/10
            </div>
            <p className="text-xs text-gray-500">
              Average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {metrics ? 'Healthy' : 'Unknown'}
            </div>
            <p className="text-xs text-gray-500">
              Status
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Agent Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Agent Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {agentPerformance.length > 0 ? (
              agentPerformance.map((agent) => (
                <div key={agent.agent_id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium">{agent.name}</h3>
                    <p className="text-sm text-gray-500">ID: {agent.agent_id}</p>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Requests</p>
                      <p className="font-medium">{agent.requests_count}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Success Rate</p>
                      <p className="font-medium text-green-600">{agent.success_rate.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Avg Response</p>
                      <p className="font-medium">{agent.avg_response_time.toFixed(1)}s</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Quality</p>
                      <p className="font-medium text-purple-600">{agent.quality_score.toFixed(1)}/10</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No agent performance data available</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Provider Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Provider Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {providerComparison.length > 0 ? (
              providerComparison.map((provider) => (
                <div key={provider.provider} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium capitalize">{provider.provider}</h3>
                  </div>
                  <div className="grid grid-cols-5 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Requests</p>
                      <p className="font-medium">{provider.requests}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Success Rate</p>
                      <p className="font-medium text-green-600">{provider.success_rate.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Avg Cost</p>
                      <p className="font-medium">${provider.avg_cost.toFixed(4)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Response Time</p>
                      <p className="font-medium">{provider.avg_response_time.toFixed(1)}s</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Quality</p>
                      <p className="font-medium text-purple-600">{provider.quality_score.toFixed(1)}/10</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No provider comparison data available</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

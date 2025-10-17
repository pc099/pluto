// API service for connecting frontend to backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// Helper function for API calls
async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`)
  }

  return response.json()
}

// Gateway API
export const gatewayApi = {
  // Get gateway statistics
  getStatistics: async () => {
    return apiCall<{
      total_requests: number
      active_providers: number
      avg_response_time: number
      cost_savings_percentage: number
      routing_activity: Array<{
        provider: string
        requests: number
        percentage: number
      }>
      strategy_performance: Array<{
        strategy: string
        success_rate: number
        avg_cost: string
      }>
    }>('/api/gateway/statistics')
  },

  // Get live routing activity
  getLiveActivity: async () => {
    return apiCall<{
      recent_routes: Array<{
        timestamp: string
        provider: string
        model: string
        strategy: string
        latency_ms: number
        cost: number
        success: boolean
      }>
    }>('/api/gateway/live-activity')
  },

  // Get provider health status
  getProviderHealth: async () => {
    return apiCall<{
      providers: Array<{
        name: string
        status: 'active' | 'degraded' | 'down'
        uptime_percentage: number
        avg_latency: number
        error_rate: number
      }>
    }>('/api/gateway/provider-health')
  },
}

// PII Detection API
export const piiApi = {
  // Get PII detection statistics
  getStatistics: async () => {
    return apiCall<{
      total_scanned: number
      detection_accuracy: number
      avg_latency_ms: number
      detections_by_type: Array<{
        type: string
        count: number
        risk: 'Critical' | 'High' | 'Medium' | 'Low'
        percentage: number
      }>
      critical_detections: {
        ssn: number
        credit_cards: number
        bank_accounts: number
      }
      compliance_status: Array<{
        framework: string
        status: string
        score: number
      }>
    }>('/api/pii/statistics')
  },

  // Get recent PII detections
  getRecentDetections: async (limit: number = 10) => {
    return apiCall<{
      detections: Array<{
        id: string
        timestamp: string
        type: string
        original: string
        masked: string
        risk: string
        action: string
        user: string
        model: string
        team: string
      }>
    }>(`/api/pii/recent?limit=${limit}`)
  },

  // Get PII trends
  getTrends: async (days: number = 7) => {
    return apiCall<{
      trends: Array<{
        date: string
        total_detections: number
        critical: number
        high: number
        medium: number
        low: number
      }>
    }>(`/api/pii/trends?days=${days}`)
  },

  // Get compliance recommendations
  getRecommendations: async () => {
    return apiCall<{
      recommendations: Array<{
        severity: 'critical' | 'high' | 'medium' | 'low'
        title: string
        description: string
        action: string
      }>
    }>('/api/pii/recommendations')
  },
}

// Hallucination Detection API
export const hallucinationApi = {
  // Get hallucination detection statistics
  getStatistics: async () => {
    return apiCall<{
      detection_rate: number
      verified_claims: number
      issues_detected: number
      avg_confidence: number
      hallucination_rate: number
    }>('/api/hallucination/statistics')
  },

  // Get external source statistics
  getSourceStatistics: async () => {
    return apiCall<{
      sources: Array<{
        source: string
        icon: string
        requests: number
        accuracy: number
        avg_latency: string
        status: 'Active' | 'Degraded' | 'Down'
      }>
    }>('/api/hallucination/sources')
  },

  // Get recent verifications
  getRecentVerifications: async (limit: number = 10) => {
    return apiCall<{
      verifications: Array<{
        id: string
        timestamp: string
        claim: string
        model: string
        verification_status: 'Verified' | 'Partially Incorrect' | 'Incorrect'
        source: string
        confidence: number
        details: string
      }>
    }>(`/api/hallucination/recent?limit=${limit}`)
  },

  // Get verification trends
  getTrends: async (days: number = 30) => {
    return apiCall<{
      trends: Array<{
        date: string
        total_claims: number
        verified: number
        partially_incorrect: number
        incorrect: number
      }>
    }>(`/api/hallucination/trends?days=${days}`)
  },

  // Verify a specific claim
  verifyClaim: async (claim: string, context?: string) => {
    return apiCall<{
      verified: boolean
      confidence: number
      sources: string[]
      explanation: string
      corrected_information?: string
    }>('/api/hallucination/verify', {
      method: 'POST',
      body: JSON.stringify({ claim, context }),
    })
  },
}

// Multi-Agent API
export const agentApi = {
  // Get agent statistics
  getStatistics: async () => {
    return apiCall<{
      total_agents: number
      active_agents: number
      total_requests: number
      avg_success_rate: number
      avg_response_time: number
      total_cost: number
    }>('/api/agents/statistics')
  },

  // Get routing insights
  getRoutingInsights: async () => {
    return apiCall<{
      routing_success_rate: number
      avg_routing_time_ms: number
      most_used_agents: Array<[string, number]>
      strategy_performance: Record<string, {
        count: number
        avg_confidence: number
      }>
    }>('/api/agents/routing-insights')
  },

  // Get agent analytics
  getAnalytics: async (agentType?: string) => {
    const query = agentType ? `?agent_type=${agentType}` : ''
    return apiCall<{
      summary: {
        total_agents: number
        total_requests: number
        avg_success_rate: number
        avg_response_time: number
        avg_health_score: number
        total_cost: number
      }
      performance_distribution: Record<string, number>
      provider_breakdown: Record<string, unknown>
    }>(`/api/agents/analytics${query}`)
  },

  // Route a request
  routeRequest: async (data: {
    request_data: Record<string, unknown>
    agent_type: string
    routing_strategy?: string
    user_preferences?: Record<string, unknown>
  }) => {
    return apiCall<{
      selected_agent: Record<string, unknown>
      routing_reason: string
      estimated_cost: number
      estimated_latency: number
      confidence_score: number
      fallback_agents: Record<string, unknown>[]
    }>('/api/agents/route', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },
}

// Traffic Proxy API
export const trafficApi = {
  // Get traffic statistics
  getStatistics: async () => {
    return apiCall<{
      total_requests: number
      total_responses: number
      total_tokens: number
      total_cost: number
      active_devices: number
      pii_incidents: number
      security_incidents: number
    }>('/api/traffic/statistics')
  },

  // Get live traffic feed
  getLiveFeed: async (limit: number = 20) => {
    return apiCall<{
      traffic: Array<{
        request_id: string
        timestamp: string
        source_ip: string
        endpoint: string
        method: string
        target_provider: string
        target_model: string
        status_code: number
        response_time_ms: number
        tokens_used: number
        cost: number
        pii_detected: boolean
        security_risks: string[]
      }>
    }>(`/api/traffic/live?limit=${limit}`)
  },
}

const api = {
  gateway: gatewayApi,
  pii: piiApi,
  hallucination: hallucinationApi,
  agent: agentApi,
  traffic: trafficApi,
}

export default api

// src/components/EnhancedAnalyticsDashboard.tsx
'use client'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const API_BASE = 'https://pluto-backend-qprv.onrender.com'

interface CostAnalytics {
  total_requests: number
  total_cost: number
  total_tokens: number
  avg_cost_per_request: number
  cost_by_provider: Record<string, number>
  cost_by_model: Record<string, number>
  cost_by_user: Record<string, number>
  cost_by_team: Record<string, number>
  requests_by_day: Record<string, number>
}

interface UsageStats {
  total_requests: number
  unique_users: number
  unique_teams: number
  avg_requests_per_day: number
  most_used_provider: string
  most_used_model: string
  provider_distribution: Record<string, number>
  model_distribution: Record<string, number>
}

interface RecentRequest {
  id: string
  timestamp: string
  provider: string
  model: string
  user_id: string
  team_id: string
  total_cost: number
  total_tokens: number
  success: boolean
}

export default function AnalyticsDashboard() {
  const [costAnalytics, setCostAnalytics] = useState<CostAnalytics | null>(null)
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null)
  const [recentRequests, setRecentRequests] = useState<RecentRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(7)

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const [costResponse, usageResponse, recentResponse] = await Promise.all([
        fetch(`${API_BASE}/analytics/costs?days=${days}`),
        fetch(`${API_BASE}/analytics/usage?days=${days}`),
        fetch(`${API_BASE}/analytics/recent-requests?limit=10`)
      ])

      const costData = await costResponse.json()
      const usageData = await usageResponse.json()
      const recentData = await recentResponse.json()

      setCostAnalytics(costData)
      setUsageStats(usageData)
      setRecentRequests(recentData)
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [days])

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(6)}`
  }

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  const getProviderIcon = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'openai': return '🤖'
      case 'anthropic': return '🧠'
      case 'google': return '🔍'
      default: return '⚡'
    }
  }

  const getProviderColor = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'openai': return 'from-green-500/20 to-green-600/20 border-green-500/30'
      case 'anthropic': return 'from-orange-500/20 to-orange-600/20 border-orange-500/30'
      case 'google': return 'from-blue-500/20 to-blue-600/20 border-blue-500/30'
      default: return 'from-purple-500/20 to-purple-600/20 border-purple-500/30'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-slate-800 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-white text-lg">Loading analytics...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="text-white p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
            AI Usage Analytics
          </h1>
          <p className="text-slate-400">Comprehensive insights into your AI infrastructure</p>
        </div>
        <div className="flex gap-2">
          {[1, 7, 30].map((period) => (
            <Button 
              key={period}
              variant={days === period ? "default" : "outline"} 
              onClick={() => setDays(period)}
              size="sm"
              className={days === period 
                ? "bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/25" 
                : "bg-slate-800/50 border-slate-600 text-slate-200 hover:bg-slate-700"
              }
            >
              {period}D
            </Button>
          ))}
          <Button 
            onClick={fetchAnalytics} 
            variant="outline" 
            size="sm"
            className="bg-slate-800/50 border-slate-600 text-slate-200 hover:bg-slate-700"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Enhanced Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border-emerald-500/30 backdrop-blur-sm hover:scale-105 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-300">Total Cost</CardTitle>
            <div className="p-2 rounded-full bg-emerald-500/20">
              <span className="text-xl">💰</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-400">
              {costAnalytics ? formatCurrency(costAnalytics.total_cost) : '$0.00'}
            </div>
            <p className="text-xs text-emerald-300/70 mt-1">
              Last {days} days
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500/30 backdrop-blur-sm hover:scale-105 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-300">Total Requests</CardTitle>
            <div className="p-2 rounded-full bg-blue-500/20">
              <span className="text-xl">📊</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-400">
              {costAnalytics?.total_requests || 0}
            </div>
            <p className="text-xs text-blue-300/70 mt-1">
              Avg {usageStats?.avg_requests_per_day || 0}/day
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-purple-500/30 backdrop-blur-sm hover:scale-105 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-300">Total Tokens</CardTitle>
            <div className="p-2 rounded-full bg-purple-500/20">
              <span className="text-xl">🔢</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-400">
              {costAnalytics?.total_tokens?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-purple-300/70 mt-1">
              Avg {costAnalytics ? formatCurrency(costAnalytics.avg_cost_per_request) : '$0'}/req
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/20 to-amber-600/20 border-amber-500/30 backdrop-blur-sm hover:scale-105 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-300">Active Users</CardTitle>
            <div className="p-2 rounded-full bg-amber-500/20">
              <span className="text-xl">👥</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-400">
              {usageStats?.unique_users || 0}
            </div>
            <p className="text-xs text-amber-300/70 mt-1">
              {usageStats?.unique_teams || 0} teams
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Breakdown Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
          <CardHeader className="border-b border-slate-700">
            <CardTitle className="text-slate-200">💳 Cost by Provider</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {costAnalytics?.cost_by_provider && Object.entries(costAnalytics.cost_by_provider).map(([provider, cost]) => (
                <div key={provider} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-600/50">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${getProviderColor(provider)} backdrop-blur-sm`}>
                      <span className="text-lg">{getProviderIcon(provider)}</span>
                    </div>
                    <span className="capitalize font-medium text-white">{provider}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="font-mono text-emerald-400 font-bold">{formatCurrency(cost)}</span>
                    <span className="text-xs text-slate-500">
                      {costAnalytics.total_cost > 0 ? ((cost / costAnalytics.total_cost) * 100).toFixed(1) : '0'}%
                    </span>
                  </div>
                </div>
              ))}
              {(!costAnalytics?.cost_by_provider || Object.keys(costAnalytics.cost_by_provider).length === 0) && (
                <div className="text-center py-8 text-slate-500">
                  <div className="text-4xl mb-2">📊</div>
                  <p>No provider data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
          <CardHeader className="border-b border-slate-700">
            <CardTitle className="text-slate-200">🤖 Cost by Model</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {costAnalytics?.cost_by_model && Object.entries(costAnalytics.cost_by_model).map(([model, cost]) => (
                <div key={model} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors border border-slate-600/30">
                  <div className="flex-1">
                    <span className="font-medium text-white">{model}</span>
                    <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                        style={{ 
                          width: costAnalytics.total_cost > 0 ? `${(cost / costAnalytics.total_cost) * 100}%` : '0%' 
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="ml-4 text-right">
                    <span className="font-mono text-emerald-400 font-bold">{formatCurrency(cost)}</span>
                    <div className="text-xs text-slate-500">
                      {costAnalytics.total_cost > 0 ? ((cost / costAnalytics.total_cost) * 100).toFixed(1) : '0'}%
                    </div>
                  </div>
                </div>
              ))}
              {(!costAnalytics?.cost_by_model || Object.keys(costAnalytics.cost_by_model).length === 0) && (
                <div className="text-center py-8 text-slate-500">
                  <div className="text-4xl mb-2">🤖</div>
                  <p>No model data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team and User Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
          <CardHeader className="border-b border-slate-700">
            <CardTitle className="text-slate-200">👥 Cost by Team</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {costAnalytics?.cost_by_team && Object.entries(costAnalytics.cost_by_team).map(([team, cost]) => (
                <div key={team} className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-slate-800/50 to-slate-700/50 border border-slate-600/30">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-sm font-bold">
                      {team.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-white">{team}</span>
                  </div>
                  <span className="font-mono text-emerald-400 font-bold">{formatCurrency(cost)}</span>
                </div>
              ))}
              {(!costAnalytics?.cost_by_team || Object.keys(costAnalytics.cost_by_team).length === 0) && (
                <div className="text-center py-8 text-slate-500">
                  <div className="text-4xl mb-2">👥</div>
                  <p>No team data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
          <CardHeader className="border-b border-slate-700">
            <CardTitle className="text-slate-200">👤 Cost by User</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
              {costAnalytics?.cost_by_user && Object.entries(costAnalytics.cost_by_user).map(([user, cost]) => (
                <div key={user} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors border border-slate-600/30">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center text-sm font-bold">
                      {user.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-white">{user}</span>
                  </div>
                  <span className="font-mono text-emerald-400 font-bold">{formatCurrency(cost)}</span>
                </div>
              ))}
              {(!costAnalytics?.cost_by_user || Object.keys(costAnalytics.cost_by_user).length === 0) && (
                <div className="text-center py-8 text-slate-500">
                  <div className="text-4xl mb-2">👤</div>
                  <p>No user data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Recent Requests */}
      <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
        <CardHeader className="border-b border-slate-700">
          <CardTitle className="flex items-center justify-between text-slate-200">
            <span>📋 Recent AI Requests</span>
            <span className="text-sm font-normal text-slate-400">Last 10 requests</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
            {recentRequests.length === 0 ? (
              <div className="text-center py-16 text-slate-500">
                <div className="text-6xl mb-4">📋</div>
                <div className="text-lg font-medium mb-2">No recent requests</div>
                <div className="text-sm">Requests will appear here as they come in</div>
              </div>
            ) : (
              <div className="divide-y divide-slate-700">
                {recentRequests.map((request, index) => (
                  <div key={request.id} className={`p-4 hover:bg-slate-800/50 transition-colors ${index < 3 ? 'animate-fadeInUp' : ''}`}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className={`w-2 h-2 rounded-full ${request.success ? 'bg-emerald-400 shadow-lg shadow-emerald-400/50' : 'bg-red-400 shadow-lg shadow-red-400/50'}`}></div>
                          <div className={`p-2 rounded-lg bg-gradient-to-br ${getProviderColor(request.provider)} backdrop-blur-sm`}>
                            <span className="text-sm">{getProviderIcon(request.provider)}</span>
                          </div>
                          <div>
                            <span className="font-medium text-white">{request.provider}</span>
                            <div className="text-xs text-slate-400">{request.model}</div>
                          </div>
                        </div>
                        <div className="text-xs text-slate-400 ml-5">
                          <span className="text-blue-400">{request.user_id}</span> • 
                          <span className="text-purple-400 ml-1">{request.team_id}</span> • 
                          <span className="ml-1">{formatDate(request.timestamp)}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-sm text-emerald-400 font-bold">
                          {formatCurrency(request.total_cost)}
                        </div>
                        <div className="text-xs text-slate-500">
                          {request.total_tokens.toLocaleString()} tokens
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.5s ease-out;
        }
        
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        
        .scrollbar-thumb-slate-600::-webkit-scrollbar-thumb {
          background-color: rgb(71 85 105);
          border-radius: 3px;
        }
        
        .scrollbar-track-slate-800::-webkit-scrollbar-track {
          background-color: rgb(30 41 59);
        }
      `}</style>
    </div>
  )
}
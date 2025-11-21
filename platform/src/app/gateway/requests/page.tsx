'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AppLayout from '@/components/AppLayout'
import LoadingScreen from '@/components/LoadingScreen'
import { authService, User } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Search, 
  Download, 
  RefreshCw,
  Clock,
  DollarSign,
  Zap,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  ChevronRight,
  Globe,
  Users
} from 'lucide-react'

interface TrafficLog {
  id: string
  timestamp: string
  method: string
  endpoint: string
  model: string
  status: 'success' | 'error' | 'warning'
  latency: number
  tokens: number
  cost: number
  user_id?: string
  team?: string
  prompt_preview: string
  provider: string
  is_shadow_ai?: boolean
  source?: 'approved' | 'shadow' | 'unknown'
}

export default function GatewayRequestsPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [requests, setRequests] = useState<TrafficLog[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedProvider, setSelectedProvider] = useState<string>('all')

  useEffect(() => {
    const checkAuth = async () => {
      if (authService.isAuthenticated()) {
        const currentUser = await authService.getCurrentUser()
        if (currentUser) {
          setUser(currentUser)
          loadRequests()
        } else {
          authService.logout()
          router.push('/login')
        }
      } else {
        router.push('/login')
      }
      setIsLoading(false)
    }
    checkAuth()
  }, [router])

  const loadRequests = () => {
    // Mock data - organizational traffic with shadow AI detection
    const mockRequests: TrafficLog[] = [
      {
        id: '1',
        timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
        method: 'POST',
        endpoint: '/v1/chat/completions',
        model: 'gpt-4',
        provider: 'OpenAI',
        status: 'success',
        latency: 1247,
        tokens: 856,
        cost: 0.0428,
        user_id: 'john@company.com',
        team: 'Engineering',
        prompt_preview: 'Write a product description for...',
        source: 'approved',
        is_shadow_ai: false
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        method: 'POST',
        endpoint: '/v1/chat/completions',
        model: 'gpt-3.5-turbo',
        provider: 'OpenAI',
        status: 'success',
        latency: 892,
        tokens: 423,
        cost: 0.0021,
        user_id: 'sarah@company.com',
        team: 'Marketing',
        prompt_preview: 'Summarize the following article...',
        source: 'approved',
        is_shadow_ai: false
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
        method: 'POST',
        endpoint: '/v1/messages',
        model: 'claude-3-opus',
        provider: 'Anthropic',
        status: 'success',
        latency: 1534,
        tokens: 1024,
        cost: 0.0768,
        user_id: 'mike@company.com',
        team: 'Product',
        prompt_preview: 'Analyze this customer feedback...',
        source: 'shadow',
        is_shadow_ai: true
      },
      {
        id: '4',
        timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
        method: 'POST',
        endpoint: '/v1/chat/completions',
        model: 'gpt-4-turbo',
        provider: 'OpenAI',
        status: 'error',
        latency: 234,
        tokens: 0,
        cost: 0,
        user_id: 'alex@company.com',
        team: 'Engineering',
        prompt_preview: 'Generate code for...',
        source: 'approved',
        is_shadow_ai: false
      },
      {
        id: '5',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        method: 'POST',
        endpoint: '/v1/chat/completions',
        model: 'gpt-4o',
        provider: 'OpenAI',
        status: 'success',
        latency: 678,
        tokens: 512,
        cost: 0.0026,
        user_id: 'emma@company.com',
        team: 'Sales',
        prompt_preview: 'Draft an email to...',
        source: 'approved',
        is_shadow_ai: false
      },
      {
        id: '6',
        timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
        method: 'POST',
        endpoint: '/api/generate',
        model: 'llama-2-70b',
        provider: 'Replicate',
        status: 'warning',
        latency: 2134,
        tokens: 678,
        cost: 0.0089,
        user_id: 'david@company.com',
        team: 'Research',
        prompt_preview: 'Experimental model testing...',
        source: 'shadow',
        is_shadow_ai: true
      }
    ]
    setRequests(mockRequests)
  }

  const handleAuth = () => {
    router.push('/login')
  }

  const handleLogout = () => {
    authService.logout()
    router.push('/login')
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Success</Badge>
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Error</Badge>
      case 'warning':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-200">Warning</Badge>
      default:
        return null
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
    return date.toLocaleDateString()
  }

  const filteredRequests = requests.filter(req => {
    const matchesSearch = req.prompt_preview.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         req.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         req.user_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         req.team?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || req.status === selectedStatus
    const matchesProvider = selectedProvider === 'all' || req.provider === selectedProvider
    
    return matchesSearch && matchesStatus && matchesProvider
  })

  const totalCost = filteredRequests.reduce((sum, req) => sum + req.cost, 0)
  const totalTokens = filteredRequests.reduce((sum, req) => sum + req.tokens, 0)
  const avgLatency = filteredRequests.length > 0 
    ? filteredRequests.reduce((sum, req) => sum + req.latency, 0) / filteredRequests.length 
    : 0

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <AppLayout 
      user={user || undefined}
      onAuth={handleAuth}
      onLogout={handleLogout}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <Globe className="h-8 w-8" />
                <h1 className="text-3xl font-bold">Organizational Traffic Logs</h1>
              </div>
              <p className="text-blue-100 mt-1">Monitor all LLM/AI usage across your organization • Detect Shadow AI</p>
              <div className="flex items-center space-x-4 mt-3">
                <div className="flex items-center space-x-2 bg-blue-800/50 px-3 py-1 rounded-full">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm">Live Monitoring</span>
                </div>
                <div className="flex items-center space-x-2 bg-blue-800/50 px-3 py-1 rounded-full">
                  <AlertCircle className="h-4 w-4 text-yellow-300" />
                  <span className="text-sm">Shadow AI Detection</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="secondary" size="sm" onClick={loadRequests}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="secondary" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Requests</p>
                  <p className="text-2xl font-bold">{filteredRequests.length}</p>
                </div>
                <Eye className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Cost</p>
                  <p className="text-2xl font-bold">${totalCost.toFixed(4)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Tokens</p>
                  <p className="text-2xl font-bold">{totalTokens.toLocaleString()}</p>
                </div>
                <Zap className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Latency</p>
                  <p className="text-2xl font-bold">{avgLatency.toFixed(0)}ms</p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by prompt, model, user, or team..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="success">Success</option>
                  <option value="error">Error</option>
                  <option value="warning">Warning</option>
                </select>
                <select
                  value={selectedProvider}
                  onChange={(e) => setSelectedProvider(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="all">All Providers</option>
                  <option value="OpenAI">OpenAI</option>
                  <option value="Anthropic">Anthropic</option>
                  <option value="Google">Google</option>
                  <option value="Cohere">Cohere</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Request Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Globe className="h-5 w-5 mr-2 text-blue-600" />
                Live Organizational Traffic
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-gray-600">Shadow AI Detected:</span>
                <Badge className="bg-yellow-100 text-yellow-800">
                  {filteredRequests.filter(r => r.is_shadow_ai).length}
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredRequests.length === 0 ? (
                <div className="text-center py-12">
                  <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
                  <p className="text-gray-600">Try adjusting your filters or wait for API traffic</p>
                </div>
              ) : (
                filteredRequests.map((request) => (
                  <div
                    key={request.id}
                    className={`border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer ${
                      request.is_shadow_ai 
                        ? 'border-yellow-300 bg-yellow-50/50 hover:border-yellow-400' 
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                    onClick={() => router.push(`/gateway/requests/${request.id}`)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          {getStatusIcon(request.status)}
                          <span className="font-mono text-sm text-gray-600">{request.method}</span>
                          <span className="text-sm text-gray-900">{request.endpoint}</span>
                          <Badge variant="secondary">{request.model}</Badge>
                          <Badge className="bg-blue-100 text-blue-800">{request.provider}</Badge>
                          {getStatusBadge(request.status)}
                          {request.is_shadow_ai && (
                            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Shadow AI
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 mb-2 line-clamp-1">{request.prompt_preview}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatTimestamp(request.timestamp)}
                          </span>
                          <span className="flex items-center">
                            <Zap className="h-3 w-3 mr-1" />
                            {request.latency}ms
                          </span>
                          <span className="flex items-center">
                            <DollarSign className="h-3 w-3 mr-1" />
                            ${request.cost.toFixed(4)}
                          </span>
                          <span>{request.tokens} tokens</span>
                          {request.user_id && (
                            <span className="flex items-center">
                              <Users className="h-3 w-3 mr-1" />
                              {request.user_id}
                            </span>
                          )}
                          {request.team && (
                            <Badge variant="outline" className="text-xs">
                              {request.team}
                            </Badge>
                          )}
                          {request.source && (
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                request.source === 'shadow' 
                                  ? 'border-yellow-300 text-yellow-700' 
                                  : 'border-green-300 text-green-700'
                              }`}
                            >
                              {request.source === 'shadow' ? '⚠️ Unapproved' : '✓ Approved'}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400 ml-4" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}

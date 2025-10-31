'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AppLayout from '@/components/AppLayout'
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
  ChevronRight
} from 'lucide-react'

interface RequestLog {
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
  prompt_preview: string
}

export default function RequestsPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [requests, setRequests] = useState<RequestLog[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedModel, setSelectedModel] = useState<string>('all')

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
    // Mock data - replace with actual API call
    const mockRequests: RequestLog[] = [
      {
        id: '1',
        timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
        method: 'POST',
        endpoint: '/v1/chat/completions',
        model: 'gpt-4',
        status: 'success',
        latency: 1247,
        tokens: 856,
        cost: 0.0428,
        user_id: 'user_123',
        prompt_preview: 'Write a product description for...'
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        method: 'POST',
        endpoint: '/v1/chat/completions',
        model: 'gpt-3.5-turbo',
        status: 'success',
        latency: 892,
        tokens: 423,
        cost: 0.0021,
        user_id: 'user_456',
        prompt_preview: 'Summarize the following article...'
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
        method: 'POST',
        endpoint: '/v1/chat/completions',
        model: 'claude-3-opus',
        status: 'error',
        latency: 3421,
        tokens: 0,
        cost: 0,
        user_id: 'user_789',
        prompt_preview: 'Generate a marketing email...'
      },
      {
        id: '4',
        timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
        method: 'POST',
        endpoint: '/v1/chat/completions',
        model: 'gpt-4',
        status: 'warning',
        latency: 2156,
        tokens: 1234,
        cost: 0.0617,
        user_id: 'user_123',
        prompt_preview: 'Analyze this customer feedback...'
      },
      {
        id: '5',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        method: 'POST',
        endpoint: '/v1/chat/completions',
        model: 'gpt-3.5-turbo',
        status: 'success',
        latency: 654,
        tokens: 289,
        cost: 0.0014,
        user_id: 'user_456',
        prompt_preview: 'Translate to Spanish: Hello...'
      },
    ]
    setRequests(mockRequests)
  }

  const handleLogout = () => {
    authService.logout()
    router.push('/login')
  }

  const handleAuth = () => {
    router.push('/login')
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="outline" className="text-green-600 border-green-200">Success</Badge>
      case 'error':
        return <Badge variant="outline" className="text-red-600 border-red-200">Error</Badge>
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
                         req.user_id?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || req.status === selectedStatus
    const matchesModel = selectedModel === 'all' || req.model === selectedModel
    
    return matchesSearch && matchesStatus && matchesModel
  })

  const totalCost = filteredRequests.reduce((sum, req) => sum + req.cost, 0)
  const totalTokens = filteredRequests.reduce((sum, req) => sum + req.tokens, 0)
  const avgLatency = filteredRequests.length > 0 
    ? filteredRequests.reduce((sum, req) => sum + req.latency, 0) / filteredRequests.length 
    : 0

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <AppLayout 
      user={user || undefined}
      onAuth={handleAuth}
      onLogout={handleLogout}
    >
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Request Logs</h1>
              <p className="text-gray-600 mt-1">Monitor and debug every API request in real-time</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" onClick={loadRequests}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm">
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
                    placeholder="Search by prompt, model, or user ID..."
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
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="all">All Models</option>
                  <option value="gpt-4">GPT-4</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                  <option value="claude-3-opus">Claude 3 Opus</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Request Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredRequests.length === 0 ? (
                <div className="text-center py-12">
                  <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
                  <p className="text-gray-600">Try adjusting your filters or make some API requests</p>
                </div>
              ) : (
                filteredRequests.map((request) => (
                  <div
                    key={request.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => router.push(`/requests/${request.id}`)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          {getStatusIcon(request.status)}
                          <span className="font-mono text-sm text-gray-600">{request.method}</span>
                          <span className="text-sm text-gray-900">{request.endpoint}</span>
                          <Badge variant="secondary">{request.model}</Badge>
                          {getStatusBadge(request.status)}
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
                          {request.user_id && <span>User: {request.user_id}</span>}
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

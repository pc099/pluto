'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import AppLayout from '@/components/AppLayout'
import LoadingScreen from '@/components/LoadingScreen'
import { authService, User } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft,
  Copy,
  Download,
  Clock,
  DollarSign,
  Zap,
  CheckCircle,
  XCircle,
  AlertCircle,
  User as UserIcon,
  Code
} from 'lucide-react'

export default function RequestDetailPage() {
  const router = useRouter()
  const params = useParams()
  const requestId = params?.id as string
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  // Mock request data - replace with actual API call
  const request = {
    id: requestId,
    timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    method: 'POST',
    endpoint: '/v1/chat/completions',
    model: 'gpt-4',
    status: 'success',
    latency: 1247,
    tokens: {
      prompt: 456,
      completion: 400,
      total: 856
    },
    cost: 0.0428,
    user_id: 'user_123',
    ip_address: '192.168.1.1',
    user_agent: 'Mozilla/5.0...',
    request: {
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that writes product descriptions.'
        },
        {
          role: 'user',
          content: 'Write a product description for a wireless keyboard with RGB lighting.'
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    },
    response: {
      id: 'chatcmpl-123',
      object: 'chat.completion',
      created: 1677652288,
      model: 'gpt-4',
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: 'Introducing our premium wireless keyboard with customizable RGB lighting. This sleek and modern keyboard combines functionality with style, featuring smooth mechanical switches, long battery life, and stunning lighting effects that can be customized to match your setup. Perfect for both work and gaming.'
          },
          finish_reason: 'stop'
        }
      ],
      usage: {
        prompt_tokens: 456,
        completion_tokens: 400,
        total_tokens: 856
      }
    }
  }

  useEffect(() => {
    const checkAuth = async () => {
      if (authService.isAuthenticated()) {
        const currentUser = await authService.getCurrentUser()
        if (currentUser) {
          setUser(currentUser)
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

  const handleLogout = () => {
    authService.logout()
    router.push('/login')
  }

  const handleAuth = () => {
    router.push('/login')
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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
        return <Badge variant="outline" className="text-green-600 border-green-200">Success</Badge>
      case 'error':
        return <Badge variant="outline" className="text-red-600 border-red-200">Error</Badge>
      case 'warning':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-200">Warning</Badge>
      default:
        return null
    }
  }

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
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => router.push('/requests')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Requests
              </Button>
              <div>
                <div className="flex items-center space-x-3">
                  <h1 className="text-2xl font-bold text-gray-900">Request Details</h1>
                  {getStatusIcon(request.status)}
                  {getStatusBadge(request.status)}
                </div>
                <p className="text-sm text-gray-600 mt-1">ID: {request.id}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" onClick={() => copyToClipboard(JSON.stringify(request, null, 2))}>
                <Copy className="h-4 w-4 mr-2" />
                {copied ? 'Copied!' : 'Copy JSON'}
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
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Latency</p>
                  <p className="text-2xl font-bold">{request.latency}ms</p>
                </div>
                <Clock className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Cost</p>
                  <p className="text-2xl font-bold">${request.cost.toFixed(4)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Tokens</p>
                  <p className="text-2xl font-bold">{request.tokens.total}</p>
                </div>
                <Zap className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Model</p>
                  <p className="text-lg font-bold">{request.model}</p>
                </div>
                <Code className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Request */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Request</span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => copyToClipboard(JSON.stringify(request.request, null, 2))}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{JSON.stringify(request.request, null, 2)}</code>
                </pre>
              </CardContent>
            </Card>

            {/* Response */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Response</span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => copyToClipboard(JSON.stringify(request.response, null, 2))}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{JSON.stringify(request.response, null, 2)}</code>
                </pre>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Metadata */}
            <Card>
              <CardHeader>
                <CardTitle>Metadata</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Timestamp</p>
                  <p className="text-sm font-medium">{new Date(request.timestamp).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Method</p>
                  <p className="text-sm font-medium font-mono">{request.method}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Endpoint</p>
                  <p className="text-sm font-medium font-mono">{request.endpoint}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Model</p>
                  <Badge variant="secondary">{request.model}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Token Usage */}
            <Card>
              <CardHeader>
                <CardTitle>Token Usage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Prompt Tokens</span>
                  <span className="text-sm font-medium">{request.tokens.prompt}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Completion Tokens</span>
                  <span className="text-sm font-medium">{request.tokens.completion}</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-sm font-semibold">Total Tokens</span>
                  <span className="text-sm font-semibold">{request.tokens.total}</span>
                </div>
              </CardContent>
            </Card>

            {/* User Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserIcon className="h-4 w-4 mr-2" />
                  User Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">User ID</p>
                  <p className="text-sm font-medium font-mono">{request.user_id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">IP Address</p>
                  <p className="text-sm font-medium font-mono">{request.ip_address}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">User Agent</p>
                  <p className="text-sm font-medium truncate">{request.user_agent}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

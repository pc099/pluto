'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AppLayout from '@/components/AppLayout'
import LoadingScreen from '@/components/LoadingScreen'
import { authService, User } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Lock,
  Eye,
  AlertCircle,
  TrendingUp,
  Activity
} from 'lucide-react'

export default function SecurityPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

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

  const handleProfile = () => {
    router.push('/')
  }

  const handleSettings = () => {
    router.push('/settings')
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
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Shield className="h-8 w-8 mr-3 text-purple-600" />
            Security Dashboard
          </h1>
          <p className="text-gray-600 mt-2">Monitor security threats, vulnerabilities, and protection status</p>
        </div>

        {/* Security Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Security Score</p>
                  <p className="text-2xl font-bold text-green-600">94/100</p>
                  <p className="text-xs text-gray-500 mt-1">Excellent</p>
                </div>
                <Shield className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Threats Blocked</p>
                  <p className="text-2xl font-bold">127</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +8% this week
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Scans</p>
                  <p className="text-2xl font-bold">12</p>
                  <p className="text-xs text-gray-500 mt-1">Real-time monitoring</p>
                </div>
                <Eye className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Vulnerabilities</p>
                  <p className="text-2xl font-bold text-yellow-600">3</p>
                  <p className="text-xs text-gray-500 mt-1">2 low, 1 medium</p>
                </div>
                <AlertCircle className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Security Features Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Threat Detection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
                Threat Detection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <XCircle className="h-5 w-5 text-red-500" />
                    <div>
                      <p className="text-sm font-medium">Prompt Injection Detected</p>
                      <p className="text-xs text-gray-600">Blocked 3 attempts in last hour</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-red-600 border-red-200">High</Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                    <div>
                      <p className="text-sm font-medium">Jailbreak Attempt</p>
                      <p className="text-xs text-gray-600">1 attempt blocked</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-yellow-600 border-yellow-200">Medium</Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-sm font-medium">All Systems Protected</p>
                      <p className="text-xs text-gray-600">No active threats</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-green-600 border-green-200">Safe</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Policies */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Lock className="h-5 w-5 mr-2 text-purple-500" />
                  Active Security Policies
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => router.push('/policies')}
                >
                  Manage Policies
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 border-l-4 border-green-500 bg-gray-50 rounded">
                  <div>
                    <p className="text-sm font-medium">Content Filtering</p>
                    <p className="text-xs text-gray-600">Blocks harmful content</p>
                  </div>
                  <Badge variant="outline" className="text-green-600 border-green-200">Active</Badge>
                </div>

                <div className="flex items-center justify-between p-2 border-l-4 border-green-500 bg-gray-50 rounded">
                  <div>
                    <p className="text-sm font-medium">PII Detection</p>
                    <p className="text-xs text-gray-600">Protects sensitive data</p>
                  </div>
                  <Badge variant="outline" className="text-green-600 border-green-200">Active</Badge>
                </div>

                <div className="flex items-center justify-between p-2 border-l-4 border-green-500 bg-gray-50 rounded">
                  <div>
                    <p className="text-sm font-medium">Rate Limiting</p>
                    <p className="text-xs text-gray-600">Prevents abuse</p>
                  </div>
                  <Badge variant="outline" className="text-green-600 border-green-200">Active</Badge>
                </div>

                <div className="flex items-center justify-between p-2 border-l-4 border-yellow-500 bg-gray-50 rounded">
                  <div>
                    <p className="text-sm font-medium">Access Control</p>
                    <p className="text-xs text-gray-600">Role-based permissions</p>
                  </div>
                  <Badge variant="outline" className="text-yellow-600 border-yellow-200">Review</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Security Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2 text-blue-500" />
              Recent Security Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { type: 'blocked', severity: 'high', message: 'Prompt injection attempt blocked', time: '2 minutes ago', user: 'user_12345' },
                { type: 'warning', severity: 'medium', message: 'Unusual API usage pattern detected', time: '15 minutes ago', user: 'user_67890' },
                { type: 'info', severity: 'low', message: 'Security scan completed successfully', time: '1 hour ago', user: 'system' },
                { type: 'blocked', severity: 'high', message: 'Data exfiltration attempt blocked', time: '2 hours ago', user: 'user_54321' },
                { type: 'info', severity: 'low', message: 'Security policy updated', time: '3 hours ago', user: 'admin' },
              ].map((event, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    {event.type === 'blocked' && <XCircle className="h-5 w-5 text-red-500" />}
                    {event.type === 'warning' && <AlertTriangle className="h-5 w-5 text-yellow-500" />}
                    {event.type === 'info' && <CheckCircle className="h-5 w-5 text-blue-500" />}
                    <div>
                      <p className="text-sm font-medium">{event.message}</p>
                      <p className="text-xs text-gray-600">User: {event.user} • {event.time}</p>
                    </div>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={
                      event.severity === 'high' ? 'text-red-600 border-red-200' :
                      event.severity === 'medium' ? 'text-yellow-600 border-yellow-200' :
                      'text-blue-600 border-blue-200'
                    }
                  >
                    {event.severity}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}

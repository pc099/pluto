'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import { authService, User } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Activity, 
  Bot, 
  TrendingUp, 
  Zap, 
  Shield, 
  BarChart3, 
  CheckCircle,
  AlertCircle,
  Plus,
  ArrowRight,
  DollarSign,
  Server
} from 'lucide-react'

export default function OverviewPage() {
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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation 
        user={user || undefined}
        onAuth={handleAuth}
        onLogout={handleLogout}
      />
      
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">System Overview</h1>
              <p className="text-gray-600 mt-1">Welcome back, {user?.first_name}! Here&apos;s what&apos;s happening with your AI platform.</p>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>All Systems Operational</span>
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Requests</p>
                  <p className="text-2xl font-bold">12,847</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +12.5% from yesterday
                  </p>
                </div>
                <Activity className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Agents</p>
                  <p className="text-2xl font-bold">8</p>
                  <p className="text-xs text-gray-500 mt-1">3 in training</p>
                </div>
                <Bot className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold">98.7%</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Excellent performance
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Cost Today</p>
                  <p className="text-2xl font-bold">$24.56</p>
                  <p className="text-xs text-gray-500 mt-1">Within budget</p>
                </div>
                <DollarSign className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Status and Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* System Health */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2 text-green-500" />
                System Health
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">API Gateway</span>
                </div>
                <Badge variant="outline" className="text-green-600 border-green-200">Healthy</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Database</span>
                </div>
                <Badge variant="outline" className="text-green-600 border-green-200">Connected</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Monitoring</span>
                </div>
                <Badge variant="outline" className="text-green-600 border-green-200">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">Security Scanner</span>
                </div>
                <Badge variant="outline" className="text-yellow-600 border-yellow-200">Scanning</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2 text-blue-500" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Customer Support Bot</p>
                  <p className="text-xs text-gray-600">Responded to 15 queries in the last hour</p>
                  <p className="text-xs text-gray-500 mt-1">2 minutes ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Content Generator</p>
                  <p className="text-xs text-gray-600">Created 3 blog posts successfully</p>
                  <p className="text-xs text-gray-500 mt-1">15 minutes ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Data Analyzer</p>
                  <p className="text-xs text-gray-600">Training completed successfully</p>
                  <p className="text-xs text-gray-500 mt-1">1 hour ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Email Automation</p>
                  <p className="text-xs text-gray-600">Processed 45 automated emails</p>
                  <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="h-5 w-5 mr-2 text-purple-500" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={() => router.push('/agents')}
                className="w-full justify-start"
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Agent
              </Button>
              <Button 
                onClick={() => router.push('/mission-control')}
                className="w-full justify-start"
                variant="outline"
              >
                <Shield className="h-4 w-4 mr-2" />
                View Mission Control
              </Button>
              <Button 
                onClick={() => router.push('/analytics')}
                className="w-full justify-start"
                variant="outline"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                View Analytics
              </Button>
              <Button 
                onClick={() => router.push('/settings')}
                className="w-full justify-start"
                variant="outline"
              >
                <Server className="h-4 w-4 mr-2" />
                System Settings
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Agent Performance Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Bot className="h-5 w-5 mr-2 text-purple-500" />
                Agent Performance Overview
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => router.push('/agents')}
                className="text-purple-600 hover:text-purple-700"
              >
                View All Agents
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/agents')}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">Customer Support</h4>
                  <Badge variant="outline" className="text-green-600 border-green-200">Active</Badge>
                </div>
                <div className="space-y-1 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>Requests:</span>
                    <span className="font-medium">1,247</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Success Rate:</span>
                    <span className="font-medium text-green-600">94.2%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Response:</span>
                    <span className="font-medium">1.2s</span>
                  </div>
                </div>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/agents')}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">Content Generator</h4>
                  <Badge variant="outline" className="text-green-600 border-green-200">Active</Badge>
                </div>
                <div className="space-y-1 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>Requests:</span>
                    <span className="font-medium">89</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Success Rate:</span>
                    <span className="font-medium text-green-600">98.1%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Response:</span>
                    <span className="font-medium">2.1s</span>
                  </div>
                </div>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/agents')}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">Data Analyzer</h4>
                  <Badge variant="outline" className="text-yellow-600 border-yellow-200">Training</Badge>
                </div>
                <div className="space-y-1 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>Requests:</span>
                    <span className="font-medium">0</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Success Rate:</span>
                    <span className="font-medium text-yellow-600">87.3%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Response:</span>
                    <span className="font-medium">4.5s</span>
                  </div>
                </div>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/agents')}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">Email Automation</h4>
                  <Badge variant="outline" className="text-gray-600 border-gray-200">Inactive</Badge>
                </div>
                <div className="space-y-1 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>Requests:</span>
                    <span className="font-medium">0</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Success Rate:</span>
                    <span className="font-medium text-gray-600">91.7%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Response:</span>
                    <span className="font-medium">0.8s</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AppLayout from '@/components/AppLayout'
import LoadingScreen from '@/components/LoadingScreen'
import { authService, User } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Activity,
  DollarSign,
  Shield,
  AlertTriangle,
  TrendingUp,
  Clock,
  CheckCircle,
  ArrowRight,
  BarChart3,
  FileText,
  Lock
} from 'lucide-react'

export default function GatewayHomePage() {
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
        {/* Hero Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">AI Gateway</h1>
              <p className="text-xl text-gray-600">Complete observability for your AI infrastructure</p>
            </div>
            <Badge className="bg-blue-100 text-blue-800 text-sm px-4 py-2">
              Organizational Monitoring
            </Badge>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-2 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Requests Today</p>
                  <p className="text-3xl font-bold text-blue-600">12,847</p>
                  <p className="text-xs text-green-600 mt-1">↑ 23% from yesterday</p>
                </div>
                <Activity className="h-10 w-10 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Cost Today</p>
                  <p className="text-3xl font-bold text-green-600">$247.32</p>
                  <p className="text-xs text-green-600 mt-1">↓ 34% savings</p>
                </div>
                <DollarSign className="h-10 w-10 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Active Violations</p>
                  <p className="text-3xl font-bold text-orange-600">7</p>
                  <p className="text-xs text-orange-600 mt-1">3 critical</p>
                </div>
                <AlertTriangle className="h-10 w-10 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Avg Response</p>
                  <p className="text-3xl font-bold text-purple-600">847ms</p>
                  <p className="text-xs text-green-600 mt-1">↓ 12% faster</p>
                </div>
                <Clock className="h-10 w-10 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Observability */}
          <Card className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-blue-300">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <Activity className="h-8 w-8 text-blue-600" />
                <Badge className="bg-blue-100 text-blue-800">Core</Badge>
              </div>
              <CardTitle>Request Monitoring</CardTitle>
              <CardDescription>Track every AI API call in real-time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-4">
                <div className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span>Full request/response logs</span>
                </div>
                <div className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span>Search & filter capabilities</span>
                </div>
                <div className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span>Request replay & debugging</span>
                </div>
              </div>
              <Button className="w-full" onClick={() => router.push('/requests')}>
                View Requests
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Cost Optimization */}
          <Card className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-green-300">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="h-8 w-8 text-green-600" />
                <Badge className="bg-green-100 text-green-800">Optimize</Badge>
              </div>
              <CardTitle>Cost Analytics</CardTitle>
              <CardDescription>Track and optimize AI spending</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-4">
                <div className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span>Cost per request tracking</span>
                </div>
                <div className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span>Provider cost comparison</span>
                </div>
                <div className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span>Budget alerts & limits</span>
                </div>
              </div>
              <Button className="w-full" onClick={() => router.push('/analytics')}>
                View Analytics
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Security */}
          <Card className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-red-300">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <Shield className="h-8 w-8 text-red-600" />
                <Badge className="bg-red-100 text-red-800">Security</Badge>
              </div>
              <CardTitle>Security & Compliance</CardTitle>
              <CardDescription>Protect sensitive data and stay compliant</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-4">
                <div className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span>PII detection & redaction</span>
                </div>
                <div className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span>GDPR/HIPAA compliance</span>
                </div>
                <div className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span>Real-time violation alerts</span>
                </div>
              </div>
              <Button className="w-full" onClick={() => router.push('/compliance')}>
                View Compliance
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">GPT-4 Request</p>
                      <p className="text-xs text-gray-600">2 minutes ago</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Success</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">PII Detected</p>
                      <p className="text-xs text-gray-600">5 minutes ago</p>
                    </div>
                  </div>
                  <Badge className="bg-red-100 text-red-800">Alert</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">Claude Request</p>
                      <p className="text-xs text-gray-600">8 minutes ago</p>
                    </div>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">Success</Badge>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-4" onClick={() => router.push('/requests')}>
                View All Requests
              </Button>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-purple-600" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push('/gateway')}
                >
                  <Activity className="h-4 w-4 mr-2" />
                  Configure Gateway
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push('/policies')}
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Manage Policies
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push('/pii-tracking')}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  PII Detection
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push('/compliance/reports')}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA Banner */}
        <Card className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Need AI Agent Development?
                </h3>
                <p className="text-gray-600 mb-4">
                  Build, deploy, and manage custom AI agents with our Agent Platform
                </p>
                <Button onClick={() => router.push('/agents/home')}>
                  Explore Agent Platform
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
              <TrendingUp className="h-24 w-24 text-blue-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}

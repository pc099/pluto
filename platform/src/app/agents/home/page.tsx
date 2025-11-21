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
  Bot,
  Zap,
  Code,
  Play,
  Plus,
  ArrowRight,
  CheckCircle,
  TrendingUp,
  FileCode,
  GitBranch,
  Activity,
  Sparkles
} from 'lucide-react'

export default function AgentsHomePage() {
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
              <h1 className="text-4xl font-bold text-gray-900 mb-2">AI Agent Platform</h1>
              <p className="text-xl text-gray-600">Build, deploy, and scale intelligent AI agents</p>
            </div>
            <Badge className="bg-purple-100 text-purple-800 text-sm px-4 py-2">
              Agent Development
            </Badge>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-2 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Active Agents</p>
                  <p className="text-3xl font-bold text-purple-600">12</p>
                  <p className="text-xs text-green-600 mt-1">3 deployed today</p>
                </div>
                <Bot className="h-10 w-10 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Executions</p>
                  <p className="text-3xl font-bold text-blue-600">8,432</p>
                  <p className="text-xs text-green-600 mt-1">↑ 45% this week</p>
                </div>
                <Zap className="h-10 w-10 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Success Rate</p>
                  <p className="text-3xl font-bold text-green-600">98.7%</p>
                  <p className="text-xs text-green-600 mt-1">↑ 2.3% improved</p>
                </div>
                <CheckCircle className="h-10 w-10 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Avg Latency</p>
                  <p className="text-3xl font-bold text-orange-600">1.2s</p>
                  <p className="text-xs text-green-600 mt-1">↓ 15% faster</p>
                </div>
                <Activity className="h-10 w-10 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Agent Builder */}
          <Card className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-purple-300">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <Bot className="h-8 w-8 text-purple-600" />
                <Badge className="bg-purple-100 text-purple-800">Build</Badge>
              </div>
              <CardTitle>Agent Builder</CardTitle>
              <CardDescription>Create custom AI agents with ease</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-4">
                <div className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span>Visual agent builder</span>
                </div>
                <div className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span>Pre-built templates</span>
                </div>
                <div className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span>Multi-agent orchestration</span>
                </div>
              </div>
              <Button className="w-full" onClick={() => router.push('/agents')}>
                <Plus className="h-4 w-4 mr-2" />
                Create Agent
              </Button>
            </CardContent>
          </Card>

          {/* Prompt Library */}
          <Card className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-blue-300">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <FileCode className="h-8 w-8 text-blue-600" />
                <Badge className="bg-blue-100 text-blue-800">Prompts</Badge>
              </div>
              <CardTitle>Prompt Library</CardTitle>
              <CardDescription>Manage and version your prompts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-4">
                <div className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span>Version control</span>
                </div>
                <div className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span>A/B testing</span>
                </div>
                <div className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span>Performance analytics</span>
                </div>
              </div>
              <Button className="w-full" variant="outline">
                <FileCode className="h-4 w-4 mr-2" />
                Browse Prompts
              </Button>
            </CardContent>
          </Card>

          {/* Testing & Evaluation */}
          <Card className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-green-300">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <Play className="h-8 w-8 text-green-600" />
                <Badge className="bg-green-100 text-green-800">Test</Badge>
              </div>
              <CardTitle>Testing & Evaluation</CardTitle>
              <CardDescription>Validate agent performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-4">
                <div className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span>Automated test suites</span>
                </div>
                <div className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span>Human evaluation</span>
                </div>
                <div className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span>Benchmark comparisons</span>
                </div>
              </div>
              <Button className="w-full" variant="outline">
                <Play className="h-4 w-4 mr-2" />
                Run Tests
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Active Agents */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bot className="h-5 w-5 mr-2 text-purple-600" />
                Your Active Agents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-purple-600 rounded-lg flex items-center justify-center">
                      <Bot className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Customer Support Agent</p>
                      <p className="text-xs text-gray-600">1,234 executions today</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center">
                      <Code className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Code Review Agent</p>
                      <p className="text-xs text-gray-600">456 executions today</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-green-600 rounded-lg flex items-center justify-center">
                      <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Content Generator</p>
                      <p className="text-xs text-gray-600">789 executions today</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-4" onClick={() => router.push('/agents')}>
                View All Agents
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="h-5 w-5 mr-2 text-blue-600" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button 
                  className="w-full justify-start"
                  onClick={() => router.push('/agents')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Agent
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                >
                  <FileCode className="h-4 w-4 mr-2" />
                  Browse Templates
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                >
                  <GitBranch className="h-4 w-4 mr-2" />
                  Manage Prompts
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Run Evaluation
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push('/chat')}
                >
                  <Bot className="h-4 w-4 mr-2" />
                  Test in Playground
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Agent Marketplace */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Sparkles className="h-5 w-5 mr-2 text-yellow-600" />
              Agent Marketplace
            </CardTitle>
            <CardDescription>Pre-built agents ready to deploy</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg hover:shadow-md transition-all cursor-pointer">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">Sales Assistant</h4>
                  <Badge>Popular</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-3">Automate lead qualification and follow-ups</p>
                <Button size="sm" variant="outline" className="w-full">
                  Install
                </Button>
              </div>
              <div className="p-4 border rounded-lg hover:shadow-md transition-all cursor-pointer">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">Data Analyst</h4>
                  <Badge>New</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-3">Analyze data and generate insights</p>
                <Button size="sm" variant="outline" className="w-full">
                  Install
                </Button>
              </div>
              <div className="p-4 border rounded-lg hover:shadow-md transition-all cursor-pointer">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">Email Responder</h4>
                  <Badge>Trending</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-3">Smart email response automation</p>
                <Button size="sm" variant="outline" className="w-full">
                  Install
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Banner */}
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Need Infrastructure Monitoring?
                </h3>
                <p className="text-gray-600 mb-4">
                  Monitor all AI API calls across your organization with our Gateway Platform
                </p>
                <Button onClick={() => router.push('/gateway/home')}>
                  Explore Gateway Platform
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
              <TrendingUp className="h-24 w-24 text-purple-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}

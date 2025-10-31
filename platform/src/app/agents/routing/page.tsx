'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AppLayout from '@/components/AppLayout'
import { authService, User } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Activity,
  Zap,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Bot,
  GitBranch,
  Target,
  Gauge,
  DollarSign,
  Shield,
  ArrowRight
} from 'lucide-react'

export default function AgentRoutingPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)
  const [agentConfigs, setAgentConfigs] = useState<Record<string, {
    strategy: string,
    models: {primary: string | null, secondary: string | null, tertiary: string | null}
  }>>({})

  const currentConfig = selectedAgent ? agentConfigs[selectedAgent] : null
  const selectedStrategy = currentConfig?.strategy || 'balanced'
  const selectedModels = currentConfig?.models || { primary: null, secondary: null, tertiary: null }

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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  const routingStrategies = [
    {
      id: 'balanced',
      name: 'Balanced',
      description: 'Optimal balance of cost, performance, and quality',
      icon: Gauge,
      color: 'purple',
      metrics: { cost: 75, performance: 80, quality: 85 }
    },
    {
      id: 'performance',
      name: 'Performance',
      description: 'Prioritize fastest response times',
      icon: Zap,
      color: 'blue',
      metrics: { cost: 60, performance: 95, quality: 80 }
    },
    {
      id: 'cost',
      name: 'Cost Optimized',
      description: 'Minimize costs while maintaining quality',
      icon: DollarSign,
      color: 'green',
      metrics: { cost: 95, performance: 70, quality: 75 }
    },
    {
      id: 'quality',
      name: 'Quality First',
      description: 'Best output quality regardless of cost',
      icon: Target,
      color: 'orange',
      metrics: { cost: 50, performance: 75, quality: 98 }
    },
    {
      id: 'failover',
      name: 'Failover',
      description: 'Automatic fallback to backup agents',
      icon: Shield,
      color: 'red',
      metrics: { cost: 70, performance: 85, quality: 90 }
    }
  ]

  const availableModels = [
    {
      id: 'gpt-4',
      name: 'GPT-4',
      provider: 'OpenAI',
      description: 'Most capable model, best for complex tasks',
      contextWindow: '8K tokens',
      requests: 8234,
      avgLatency: '1.2s',
      successRate: 98.7,
      status: 'active',
      cost: '$0.03/1K tokens'
    },
    {
      id: 'gpt-4-turbo',
      name: 'GPT-4 Turbo',
      provider: 'OpenAI',
      description: 'Faster and cheaper than GPT-4, 128K context',
      contextWindow: '128K tokens',
      requests: 5892,
      avgLatency: '0.9s',
      successRate: 97.5,
      status: 'active',
      cost: '$0.01/1K tokens'
    },
    {
      id: 'gpt-4o',
      name: 'GPT-4o',
      provider: 'OpenAI',
      description: 'Optimized for speed and cost, multimodal',
      contextWindow: '128K tokens',
      requests: 4321,
      avgLatency: '0.7s',
      successRate: 96.8,
      status: 'active',
      cost: '$0.005/1K tokens'
    },
    {
      id: 'claude-3-opus',
      name: 'Claude 3 Opus',
      provider: 'Anthropic',
      description: 'Most intelligent Claude model, best quality',
      contextWindow: '200K tokens',
      requests: 3145,
      avgLatency: '1.5s',
      successRate: 98.2,
      status: 'active',
      cost: '$0.015/1K tokens'
    },
    {
      id: 'claude-3.5-sonnet',
      name: 'Claude 3.5 Sonnet',
      provider: 'Anthropic',
      description: 'Balanced performance and cost, very capable',
      contextWindow: '200K tokens',
      requests: 6234,
      avgLatency: '1.1s',
      successRate: 97.9,
      status: 'active',
      cost: '$0.003/1K tokens'
    },
    {
      id: 'claude-3-haiku',
      name: 'Claude 3 Haiku',
      provider: 'Anthropic',
      description: 'Fastest and most affordable Claude model',
      contextWindow: '200K tokens',
      requests: 2876,
      avgLatency: '0.5s',
      successRate: 95.4,
      status: 'active',
      cost: '$0.00025/1K tokens'
    },
    {
      id: 'gemini-pro',
      name: 'Gemini Pro',
      provider: 'Google',
      description: 'Google\'s most capable model, multimodal',
      contextWindow: '32K tokens',
      requests: 1987,
      avgLatency: '1.0s',
      successRate: 96.3,
      status: 'active',
      cost: '$0.0005/1K tokens'
    },
    {
      id: 'mistral-large',
      name: 'Mistral Large',
      provider: 'Mistral AI',
      description: 'Top-tier reasoning, multilingual support',
      contextWindow: '32K tokens',
      requests: 1234,
      avgLatency: '0.8s',
      successRate: 95.8,
      status: 'active',
      cost: '$0.008/1K tokens'
    }
  ]

  const availableAgents = [
    { id: 'agent-1', name: 'Customer Support Agent', specialty: 'Customer queries, FAQ, troubleshooting', status: 'active' },
    { id: 'agent-2', name: 'Code Review Agent', specialty: 'Code analysis, bug detection', status: 'active' },
    { id: 'agent-3', name: 'Content Generator', specialty: 'Blog posts, marketing copy', status: 'active' },
    { id: 'agent-4', name: 'Data Analyst', specialty: 'Data analysis, insights', status: 'active' },
    { id: 'agent-5', name: 'Research Assistant', specialty: 'Research, fact-checking', status: 'active' },
    { id: 'agent-6', name: 'Sales Assistant', specialty: 'Lead qualification, emails', status: 'active' }
  ]

  const handleStrategySelect = (strategyId: string) => {
    if (!selectedAgent) return
    setAgentConfigs(prev => ({
      ...prev,
      [selectedAgent]: {
        strategy: strategyId,
        models: prev[selectedAgent]?.models || { primary: null, secondary: null, tertiary: null }
      }
    }))
  }

  const handleModelSelect = (priority: 'primary' | 'secondary' | 'tertiary', modelId: string) => {
    if (!selectedAgent) return
    setAgentConfigs(prev => ({
      ...prev,
      [selectedAgent]: {
        strategy: prev[selectedAgent]?.strategy || 'balanced',
        models: {
          ...(prev[selectedAgent]?.models || { primary: null, secondary: null, tertiary: null }),
          [priority]: modelId
        }
      }
    }))
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
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Smart Routing</h1>
              <p className="text-xl text-gray-600">Multi-agent orchestration with intelligent task routing</p>
            </div>
            <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm px-4 py-2">
              <Activity className="h-4 w-4 mr-2" />
              Active Routing
            </Badge>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-2 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Requests</p>
                  <p className="text-3xl font-bold text-purple-600">13,727</p>
                  <p className="text-xs text-green-600 mt-1">↑ 23% this week</p>
                </div>
                <Activity className="h-10 w-10 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Avg Latency</p>
                  <p className="text-3xl font-bold text-blue-600">2.4s</p>
                  <p className="text-xs text-green-600 mt-1">↓ 15% faster</p>
                </div>
                <Clock className="h-10 w-10 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Success Rate</p>
                  <p className="text-3xl font-bold text-green-600">97.2%</p>
                  <p className="text-xs text-green-600 mt-1">↑ 2.1% improved</p>
                </div>
                <CheckCircle className="h-10 w-10 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Active Agents</p>
                  <p className="text-3xl font-bold text-orange-600">4</p>
                  <p className="text-xs text-gray-600 mt-1">All operational</p>
                </div>
                <Bot className="h-10 w-10 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Routing Strategies - Per Agent */}
        {selectedAgent && (
          <Card className="mb-8 border-2 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <GitBranch className="h-6 w-6 mr-2 text-purple-600" />
                Routing Strategy for {availableAgents.find(a => a.id === selectedAgent)?.name}
              </CardTitle>
              <CardDescription>
                Choose how this agent selects between its configured models
              </CardDescription>
            </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {routingStrategies.map((strategy) => {
                const Icon = strategy.icon
                const isSelected = selectedStrategy === strategy.id
                
                return (
                  <div
                    key={strategy.id}
                    onClick={() => handleStrategySelect(strategy.id)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      isSelected
                        ? `border-${strategy.color}-500 bg-${strategy.color}-50 shadow-md`
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className={`p-2 rounded-lg bg-${strategy.color}-100`}>
                        <Icon className={`h-5 w-5 text-${strategy.color}-600`} />
                      </div>
                      {isSelected && (
                        <CheckCircle className={`h-5 w-5 text-${strategy.color}-600`} />
                      )}
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">{strategy.name}</h4>
                    <p className="text-sm text-gray-600 mb-3">{strategy.description}</p>
                    
                    <div className="space-y-2">
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-gray-600">Cost Efficiency</span>
                          <span className="font-medium">{strategy.metrics.cost}%</span>
                        </div>
                        <Progress value={strategy.metrics.cost} className="h-1.5" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-gray-600">Performance</span>
                          <span className="font-medium">{strategy.metrics.performance}%</span>
                        </div>
                        <Progress value={strategy.metrics.performance} className="h-1.5" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-gray-600">Quality</span>
                          <span className="font-medium">{strategy.metrics.quality}%</span>
                        </div>
                        <Progress value={strategy.metrics.quality} className="h-1.5" />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            
            <div className="mt-6 flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-purple-600 mr-2" />
                <span className="text-sm font-medium text-gray-900">
                  Selected Strategy: <span className="text-purple-600">{routingStrategies.find(s => s.id === selectedStrategy)?.name}</span>
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        )}

        {/* Agent Selection */}
        <Card className="border-2 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <Bot className="h-6 w-6 mr-2 text-purple-600" />
              Select Agent to Configure
            </CardTitle>
            <CardDescription>
              Choose an agent to configure its model routing and fallback strategy
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableAgents.map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => setSelectedAgent(agent.id)}
                  className={`p-4 text-left rounded-lg border-2 transition-all ${
                    selectedAgent === agent.id
                      ? 'border-purple-500 bg-purple-50 shadow-md'
                      : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{agent.name}</h4>
                    {selectedAgent === agent.id && (
                      <CheckCircle className="h-5 w-5 text-purple-600" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{agent.specialty}</p>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-800 text-xs">
                      {agent.status}
                    </Badge>
                    {agentConfigs[agent.id] && (
                      <Badge className="bg-blue-100 text-blue-800 text-xs">
                        Configured
                      </Badge>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Model Selection with Fallbacks */}
        {selectedAgent && (
          <Card className="border-2 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <Target className="h-6 w-6 mr-2 text-blue-600" />
                Configure Model Routing for {availableAgents.find(a => a.id === selectedAgent)?.name}
              </CardTitle>
              <CardDescription>
                Choose up to 3 models with automatic fallback if primary fails or is unavailable
              </CardDescription>
            </CardHeader>
          <CardContent className="space-y-6">
            {/* Priority Selection */}
            {(['primary', 'secondary', 'tertiary'] as const).map((priority, index) => {
              const selectedModelId = selectedModels[priority]
              const selectedModel = availableModels.find(m => m.id === selectedModelId)
              const priorityColors = {
                primary: { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-700', badge: 'bg-blue-600' },
                secondary: { bg: 'bg-purple-50', border: 'border-purple-300', text: 'text-purple-700', badge: 'bg-purple-600' },
                tertiary: { bg: 'bg-orange-50', border: 'border-orange-300', text: 'text-orange-700', badge: 'bg-orange-600' }
              }
              const colors = priorityColors[priority]

              return (
                <div key={priority} className={`p-4 rounded-lg border-2 ${colors.border} ${colors.bg}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Badge className={`${colors.badge} text-white`}>
                        {index + 1}
                      </Badge>
                      <h4 className={`font-semibold ${colors.text} capitalize`}>
                        {priority} Model {index === 0 ? '(Main)' : '(Fallback)'}
                      </h4>
                    </div>
                    {selectedModel && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleModelSelect(priority, '')}
                      >
                        Clear
                      </Button>
                    )}
                  </div>

                  {selectedModel ? (
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h5 className="font-semibold text-gray-900">{selectedModel.name}</h5>
                            <Badge className="bg-blue-100 text-blue-800 text-xs">
                              {selectedModel.provider}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{selectedModel.description}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-3">
                        <div className="bg-gray-50 p-2 rounded">
                          <p className="text-xs text-gray-600">Success Rate</p>
                          <p className="text-sm font-bold text-green-600">{selectedModel.successRate}%</p>
                        </div>
                        <div className="bg-gray-50 p-2 rounded">
                          <p className="text-xs text-gray-600">Latency</p>
                          <p className="text-sm font-bold text-gray-900">{selectedModel.avgLatency}</p>
                        </div>
                        <div className="bg-gray-50 p-2 rounded">
                          <p className="text-xs text-gray-600">Cost</p>
                          <p className="text-sm font-bold text-gray-900">{selectedModel.cost}</p>
                        </div>
                        <div className="bg-gray-50 p-2 rounded">
                          <p className="text-xs text-gray-600">Context</p>
                          <p className="text-sm font-bold text-gray-900">{selectedModel.contextWindow}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {availableModels
                        .filter(model => 
                          model.id !== selectedModels.primary && 
                          model.id !== selectedModels.secondary && 
                          model.id !== selectedModels.tertiary
                        )
                        .map((model) => (
                        <button
                          key={model.id}
                          onClick={() => handleModelSelect(priority, model.id)}
                          className="p-3 text-left rounded-lg border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-semibold text-gray-900 text-sm">{model.name}</h5>
                            <Badge className="bg-gray-100 text-gray-700 text-xs">
                              {model.provider}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600 mb-2">{model.description}</p>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-green-600 font-medium">{model.successRate}% success</span>
                            <span className="text-gray-600">{model.cost}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}

            {/* Apply Button */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-blue-300">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {selectedModels.primary ? 'Routing Configuration Ready' : 'Select Primary Model to Continue'}
                  </p>
                  <p className="text-xs text-gray-600">
                    {selectedModels.primary && selectedModels.secondary && selectedModels.tertiary 
                      ? 'All 3 models configured with automatic fallback'
                      : selectedModels.primary && selectedModels.secondary
                      ? '2 models configured - add tertiary for extra reliability'
                      : selectedModels.primary
                      ? 'Add secondary model for automatic fallback'
                      : 'Choose your primary model to get started'}
                  </p>
                </div>
              </div>
              <Button 
                className="bg-blue-600 hover:bg-blue-700"
                disabled={!selectedModels.primary}
              >
                Save Configuration for {availableAgents.find(a => a.id === selectedAgent)?.name}
              </Button>
            </div>
          </CardContent>
        </Card>
        )}

        {/* How It Works */}
        <Card className="mt-8 bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <TrendingUp className="h-6 w-6 mr-2 text-purple-600" />
              How Smart Routing Works
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-4 rounded-lg border border-purple-200">
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                  <span className="text-2xl font-bold text-purple-600">1</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Task Analysis</h4>
                <p className="text-sm text-gray-600">
                  Incoming tasks are analyzed for complexity, type, and requirements
                </p>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                  <span className="text-2xl font-bold text-blue-600">2</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Agent Selection</h4>
                <p className="text-sm text-gray-600">
                  Best agent is selected based on specialty, priority, and current load
                </p>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-green-200">
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                  <span className="text-2xl font-bold text-green-600">3</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Execution & Monitoring</h4>
                <p className="text-sm text-gray-600">
                  Task is executed with real-time monitoring and automatic failover
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}

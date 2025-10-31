'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AppLayout from '@/components/AppLayout'
import OnboardingWizard from '@/components/OnboardingWizard'
import { authService, User } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Rocket,
  CheckCircle,
  Circle,
  ArrowRight,
  Code,
  Eye,
  Shield,
  Zap,
  TrendingUp,
  Activity,
  AlertCircle,
  DollarSign,
  Clock,
  Bot,
  Globe
} from 'lucide-react'

interface SetupStep {
  id: string
  title: string
  description: string
  completed: boolean
  action: string
  href: string
}

export default function HomePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      if (authService.isAuthenticated()) {
        const currentUser = await authService.getCurrentUser()
        if (currentUser) {
          setUser(currentUser)
          const hasSeenOnboarding = localStorage.getItem('pluto_onboarding_completed')
          if (!hasSeenOnboarding) {
            setShowOnboarding(true)
          }
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

  const handleOnboardingComplete = () => {
    localStorage.setItem('pluto_onboarding_completed', 'true')
    setShowOnboarding(false)
  }

  const handleOnboardingDismiss = () => {
    setShowOnboarding(false)
  }

  // Setup checklist
  const setupSteps: SetupStep[] = [
    {
      id: 'integrate',
      title: 'Integrate Pluto SDK',
      description: 'Add Pluto to your application',
      completed: false,
      action: 'View Guide',
      href: '#'
    },
    {
      id: 'first-request',
      title: 'Make Your First Request',
      description: 'Send a test request through Pluto',
      completed: false,
      action: 'Try Now',
      href: '/chat'
    },
    {
      id: 'set-policy',
      title: 'Set Up Cost Policy',
      description: 'Control your AI spending',
      completed: false,
      action: 'Create Policy',
      href: '/policies'
    },
    {
      id: 'enable-security',
      title: 'Enable Security Monitoring',
      description: 'Protect against threats and PII leaks',
      completed: false,
      action: 'Configure',
      href: '/security'
    }
  ]

  const completedSteps = setupSteps.filter(s => s.completed).length
  const progress = (completedSteps / setupSteps.length) * 100

  // Feature cards organized by workflow
  const workflows = [
    {
      category: 'Observe',
      description: 'Monitor every AI interaction',
      color: 'blue',
      features: [
        {
          icon: Eye,
          title: 'Request Logs',
          description: 'Debug every API call with full request/response data',
          href: '/requests',
          badge: 'NEW'
        },
        {
          icon: Activity,
          title: 'Mission Control',
          description: 'Real-time monitoring and system health',
          href: '/mission-control',
          badge: null
        },
        {
          icon: TrendingUp,
          title: 'Analytics',
          description: 'Cost trends, usage patterns, and insights',
          href: '/analytics',
          badge: null
        }
      ]
    },
    {
      category: 'Optimize',
      description: 'Reduce costs and improve performance',
      color: 'green',
      features: [
        {
          icon: Zap,
          title: 'AI Gateway',
          description: 'Intelligent routing across 12+ providers',
          href: '/gateway',
          badge: null
        },
        {
          icon: DollarSign,
          title: 'Cost Control',
          description: 'Set budgets and optimize spending',
          href: '/policies',
          badge: null
        },
        {
          icon: Code,
          title: 'Agents',
          description: 'Multi-agent orchestration and management',
          href: '/agents',
          badge: null
        }
      ]
    },
    {
      category: 'Secure',
      description: 'Protect your AI from threats',
      color: 'purple',
      features: [
        {
          icon: Shield,
          title: 'Security Dashboard',
          description: 'Threat detection and prevention',
          href: '/security',
          badge: null
        },
        {
          icon: Eye,
          title: 'PII Detection',
          description: 'Identify and track sensitive data',
          href: '/pii-tracking',
          badge: null
        },
        {
          icon: AlertCircle,
          title: 'Hallucination Detection',
          description: 'Verify AI responses with 6 external sources',
          href: '/hallucination-detection',
          badge: null
        }
      ]
    }
  ]

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
      {showOnboarding && (
        <OnboardingWizard 
          onComplete={handleOnboardingComplete}
          onDismiss={handleOnboardingDismiss}
        />
      )}

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-purple-600 via-blue-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Welcome back, {user?.first_name}! 👋</h1>
              <p className="text-xl text-purple-100">Your complete platform for production AI</p>
            </div>
            <Button 
              onClick={() => setShowOnboarding(true)}
              className="bg-white text-purple-600 hover:bg-purple-50"
            >
              <Rocket className="h-4 w-4 mr-2" />
              Quick Start Guide
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-100">Requests Today</p>
                  <p className="text-3xl font-bold">12,847</p>
                </div>
                <Activity className="h-8 w-8 text-purple-200" />
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-100">Cost Today</p>
                  <p className="text-3xl font-bold">$24.56</p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-200" />
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-100">Avg Latency</p>
                  <p className="text-3xl font-bold">847ms</p>
                </div>
                <Clock className="h-8 w-8 text-purple-200" />
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-100">Success Rate</p>
                  <p className="text-3xl font-bold">98.7%</p>
                </div>
                <CheckCircle className="h-8 w-8 text-purple-200" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Product Selection */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Choose Your Platform</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Gateway Product */}
            <Card 
              className="hover:shadow-xl transition-all cursor-pointer border-2 hover:border-blue-400 bg-gradient-to-br from-blue-50 to-white"
              onClick={() => router.push('/gateway/home')}
            >
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <div className="h-16 w-16 bg-blue-600 rounded-xl flex items-center justify-center">
                    <Globe className="h-10 w-10 text-white" />
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">Observability</Badge>
                </div>
                <CardTitle className="text-2xl">AI Gateway</CardTitle>
                <CardDescription className="text-base">
                  Monitor ALL AI API calls going through your organization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-6">
                  <div className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    <span>Intercept requests to OpenAI/Anthropic/etc.</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    <span>Track costs across teams</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    <span>Enforce policies & detect PII</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t">
                  <span className="text-sm text-gray-600">For: Engineering, DevOps, Security</span>
                  <ArrowRight className="h-5 w-5 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            {/* Agents Product */}
            <Card 
              className="hover:shadow-xl transition-all cursor-pointer border-2 hover:border-purple-400 bg-gradient-to-br from-purple-50 to-white"
              onClick={() => router.push('/agents/home')}
            >
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <div className="h-16 w-16 bg-purple-600 rounded-xl flex items-center justify-center">
                    <Bot className="h-10 w-10 text-white" />
                  </div>
                  <Badge className="bg-purple-100 text-purple-800">Development</Badge>
                </div>
                <CardTitle className="text-2xl">AI Agent Platform</CardTitle>
                <CardDescription className="text-base">
                  Build, deploy, and manage intelligent AI agents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-6">
                  <div className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    <span>Create custom AI agents</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    <span>Multi-agent orchestration</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    <span>Agent performance tracking</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t">
                  <span className="text-sm text-gray-600">For: AI Developers, Product Teams</span>
                  <ArrowRight className="h-5 w-5 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Setup Checklist */}
        <Card className="mb-8 border-2 border-purple-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center text-xl">
                  <Rocket className="h-5 w-5 mr-2 text-purple-600" />
                  Getting Started
                </CardTitle>
                <CardDescription>Complete these steps to unlock Pluto&apos;s full potential</CardDescription>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-purple-600">{completedSteps}/{setupSteps.length}</div>
                <div className="text-sm text-gray-600">completed</div>
              </div>
            </div>
            <Progress value={progress} className="mt-4 h-2" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {setupSteps.map((step) => (
                <div
                  key={step.id}
                  className={`flex items-start space-x-3 p-4 rounded-lg border-2 transition-all ${
                    step.completed
                      ? 'bg-green-50 border-green-200'
                      : 'bg-gray-50 border-gray-200 hover:border-purple-300'
                  }`}
                >
                  {step.completed ? (
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{step.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{step.description}</p>
                    {!step.completed && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(step.href)}
                        className="text-purple-600 border-purple-300 hover:bg-purple-50"
                      >
                        {step.action}
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Workflows */}
        <div className="space-y-8">
          {workflows.map((workflow) => (
            <div key={workflow.category}>
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <span className={`w-1 h-8 bg-${workflow.color}-600 rounded-full mr-3`}></span>
                  {workflow.category}
                </h2>
                <p className="text-gray-600 ml-7">{workflow.description}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {workflow.features.map((feature) => {
                  const Icon = feature.icon
                  return (
                    <Card
                      key={feature.title}
                      className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-purple-300"
                      onClick={() => router.push(feature.href)}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className={`p-3 rounded-lg bg-${workflow.color}-100`}>
                            <Icon className={`h-6 w-6 text-${workflow.color}-600`} />
                          </div>
                          {feature.badge && (
                            <Badge className="bg-purple-600">{feature.badge}</Badge>
                          )}
                        </div>
                        <CardTitle className="text-lg mt-4">{feature.title}</CardTitle>
                        <CardDescription>{feature.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button variant="ghost" className="w-full justify-between text-purple-600 hover:bg-purple-50">
                          Open
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  )
}

'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import { authService, User } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Bot, 
  Plus, 
  Search, 
  Activity, 
  Zap, 
  Settings, 
  Pause, 
  Trash2,
  Edit,
  Eye,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react'
import CreateAgentModal from '@/components/agents/CreateAgentModal'

interface AIAgent {
  id: string
  name: string
  description: string
  type: 'chat' | 'assistant' | 'automation' | 'analysis'
  status: 'active' | 'inactive' | 'error' | 'training'
  model: string
  provider: string
  requests_today: number
  total_requests: number
  success_rate: number
  avg_response_time: number
  cost_today: number
  created_at: string
  last_active: string
  capabilities: string[]
  user_id: string
}

export default function AgentsPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [agents, setAgents] = useState<AIAgent[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      if (authService.isAuthenticated()) {
        const currentUser = await authService.getCurrentUser()
        if (currentUser) {
          setUser(currentUser)
          await loadAgents()
        } else {
          authService.logout()
          router.push('/login')
        }
      } else {
        router.push('/login')
      }
    }
    checkAuth()
  }, [router])

  const loadAgents = async () => {
    setLoading(true)
    try {
      // Mock data for now - replace with actual API call
      const mockAgents: AIAgent[] = [
        {
          id: '1',
          name: 'Customer Support Bot',
          description: 'Handles customer inquiries and support tickets',
          type: 'chat',
          status: 'active',
          model: 'gpt-4',
          provider: 'openai',
          requests_today: 1247,
          total_requests: 45632,
          success_rate: 94.2,
          avg_response_time: 1.2,
          cost_today: 12.45,
          created_at: '2024-01-15',
          last_active: '2024-01-20T10:30:00Z',
          capabilities: ['natural_language', 'ticket_routing', 'escalation'],
          user_id: user?.id || ''
        },
        {
          id: '2',
          name: 'Content Generator',
          description: 'Creates marketing content and blog posts',
          type: 'assistant',
          status: 'active',
          model: 'gpt-3.5-turbo',
          provider: 'openai',
          requests_today: 89,
          total_requests: 1234,
          success_rate: 98.1,
          avg_response_time: 2.1,
          cost_today: 3.21,
          created_at: '2024-01-10',
          last_active: '2024-01-20T09:15:00Z',
          capabilities: ['content_creation', 'seo_optimization', 'brand_voice'],
          user_id: user?.id || ''
        },
        {
          id: '3',
          name: 'Data Analyzer',
          description: 'Analyzes business data and generates insights',
          type: 'analysis',
          status: 'training',
          model: 'claude-3-sonnet',
          provider: 'anthropic',
          requests_today: 0,
          total_requests: 567,
          success_rate: 87.3,
          avg_response_time: 4.5,
          cost_today: 0,
          created_at: '2024-01-18',
          last_active: '2024-01-19T16:45:00Z',
          capabilities: ['data_analysis', 'reporting', 'visualization'],
          user_id: user?.id || ''
        },
        {
          id: '4',
          name: 'Email Automation',
          description: 'Automates email responses and follow-ups',
          type: 'automation',
          status: 'inactive',
          model: 'gpt-3.5-turbo',
          provider: 'openai',
          requests_today: 0,
          total_requests: 2341,
          success_rate: 91.7,
          avg_response_time: 0.8,
          cost_today: 0,
          created_at: '2024-01-05',
          last_active: '2024-01-18T14:20:00Z',
          capabilities: ['email_automation', 'scheduling', 'personalization'],
          user_id: user?.id || ''
        }
      ]
      setAgents(mockAgents)
    } catch (error) {
      console.error('Failed to load agents:', error)
    } finally {
      setLoading(false)
    }
  }

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

  const handleCreateAgent = async (agentData: {
    name: string
    description: string
    type: 'chat' | 'assistant' | 'automation' | 'analysis'
    model: string
    provider: string
    capabilities: string[]
  }) => {
    try {
      // Mock agent creation - replace with actual API call
      const newAgent: AIAgent = {
        id: Date.now().toString(),
        name: agentData.name,
        description: agentData.description,
        type: agentData.type,
        status: 'active',
        model: agentData.model,
        provider: agentData.provider,
        requests_today: 0,
        total_requests: 0,
        success_rate: 0,
        avg_response_time: 0,
        cost_today: 0,
        created_at: new Date().toISOString().split('T')[0],
        last_active: new Date().toISOString(),
        capabilities: agentData.capabilities,
        user_id: user?.id || ''
      }
      
      setAgents(prev => [newAgent, ...prev])
      setShowCreateModal(false)
    } catch (error) {
      console.error('Failed to create agent:', error)
      throw error
    }
  }


  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'inactive': return <Pause className="h-4 w-4 text-gray-500" />
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />
      case 'training': return <Activity className="h-4 w-4 text-yellow-500" />
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'chat': return 'bg-blue-100 text-blue-800'
      case 'assistant': return 'bg-purple-100 text-purple-800'
      case 'automation': return 'bg-green-100 text-green-800'
      case 'analysis': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         agent.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTab = activeTab === 'all' || agent.status === activeTab
    return matchesSearch && matchesTab
  })

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation 
        user={user}
        currentPage="agents"
        onAuth={handleAuth}
        onLogout={handleLogout}
        onProfile={handleProfile}
        onSettings={handleSettings}
      />
      
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Bot className="h-8 w-8 mr-3 text-purple-600" />
                AI Agents
              </h1>
              <p className="text-gray-600 mt-1">Manage and monitor your AI agents</p>
            </div>
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Agent
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Agents</p>
                  <p className="text-2xl font-bold">{agents.length}</p>
                </div>
                <Bot className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Agents</p>
                  <p className="text-2xl font-bold">{agents.filter(a => a.status === 'active').length}</p>
                </div>
                <Activity className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Requests Today</p>
                  <p className="text-2xl font-bold">{agents.reduce((sum, a) => sum + a.requests_today, 0).toLocaleString()}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Cost Today</p>
                  <p className="text-2xl font-bold">${agents.reduce((sum, a) => sum + a.cost_today, 0).toFixed(2)}</p>
                </div>
                <Zap className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search agents..."
                className="pl-10 w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Agent Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All Agents</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="inactive">Inactive</TabsTrigger>
            <TabsTrigger value="training">Training</TabsTrigger>
            <TabsTrigger value="error">Errors</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-6">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : filteredAgents.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No agents found</h3>
                  <p className="text-gray-600 mb-4">
                    {searchQuery ? 'Try adjusting your search criteria' : 'Get started by creating your first AI agent'}
                  </p>
                  <Button 
                    onClick={() => setShowCreateModal(true)}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Agent
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredAgents.map((agent) => (
                  <Card key={agent.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg">
                            <Bot className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{agent.name}</CardTitle>
                            <p className="text-sm text-gray-600 mt-1">{agent.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(agent.status)}
                          <Badge className={getTypeColor(agent.type)}>
                            {agent.type}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {/* Agent Stats */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <p className="text-2xl font-bold text-gray-900">{agent.requests_today}</p>
                          <p className="text-xs text-gray-600">Requests Today</p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <p className="text-2xl font-bold text-gray-900">{agent.success_rate}%</p>
                          <p className="text-xs text-gray-600">Success Rate</p>
                        </div>
                      </div>

                      {/* Agent Details */}
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Model:</span>
                          <span className="font-medium">{agent.model}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Provider:</span>
                          <span className="font-medium capitalize">{agent.provider}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Avg Response:</span>
                          <span className="font-medium">{agent.avg_response_time}s</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Cost Today:</span>
                          <span className="font-medium">${agent.cost_today.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Capabilities */}
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Capabilities:</p>
                        <div className="flex flex-wrap gap-1">
                          {agent.capabilities.map((capability) => (
                            <Badge key={capability} variant="outline" className="text-xs">
                              {capability.replace('_', ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          <span>Last active: {new Date(agent.last_active).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Agent Modal */}
      <CreateAgentModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateAgent={handleCreateAgent}
      />
    </div>
  )
}

'use client'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Navigation from '@/components/Navigation'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Zap, 
  Clock, 
  BarChart3, 
  PieChart, 
  Activity,
  Download,
  Filter,
  Calendar,
  Target,
  Award,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  MessageSquare,
  Brain,
  Code,
  Image,
  FileText
} from 'lucide-react'

interface MetricCard {
  title: string
  value: string
  change: number
  changeType: 'increase' | 'decrease'
  icon: React.ComponentType<any>
  color: string
}

interface ChartData {
  name: string
  value: number
  color: string
}

const metricCards: MetricCard[] = [
  {
    title: 'Total Requests',
    value: '1.2M',
    change: 12.5,
    changeType: 'increase',
    icon: MessageSquare,
    color: 'text-blue-600'
  },
  {
    title: 'Total Cost',
    value: '$45,678',
    change: -8.2,
    changeType: 'decrease',
    icon: DollarSign,
    color: 'text-green-600'
  },
  {
    title: 'Avg Response Time',
    value: '1.2s',
    change: -15.3,
    changeType: 'decrease',
    icon: Clock,
    color: 'text-purple-600'
  },
  {
    title: 'Success Rate',
    value: '99.2%',
    change: 2.1,
    changeType: 'increase',
    icon: CheckCircle,
    color: 'text-emerald-600'
  },
  {
    title: 'Active Users',
    value: '2,847',
    change: 18.7,
    changeType: 'increase',
    icon: Users,
    color: 'text-orange-600'
  },
  {
    title: 'Models Used',
    value: '24',
    change: 4,
    changeType: 'increase',
    icon: Brain,
    color: 'text-indigo-600'
  }
]

const modelUsageData: ChartData[] = [
  { name: 'GPT-4 Turbo', value: 35, color: 'bg-blue-500' },
  { name: 'Claude 3.5 Sonnet', value: 28, color: 'bg-orange-500' },
  { name: 'Gemini 2.0 Flash', value: 20, color: 'bg-green-500' },
  { name: 'GPT-4o Code', value: 12, color: 'bg-purple-500' },
  { name: 'Others', value: 5, color: 'bg-gray-500' }
]

const costByCategory: ChartData[] = [
  { name: 'Text Generation', value: 45, color: 'bg-blue-500' },
  { name: 'Code Generation', value: 25, color: 'bg-green-500' },
  { name: 'Image Analysis', value: 15, color: 'bg-purple-500' },
  { name: 'Data Analysis', value: 10, color: 'bg-orange-500' },
  { name: 'Other', value: 5, color: 'bg-gray-500' }
]

const recentActivity = [
  {
    id: '1',
    type: 'request',
    description: 'GPT-4 Turbo request completed',
    timestamp: new Date(Date.now() - 1000 * 60 * 2),
    status: 'success',
    cost: 0.05
  },
  {
    id: '2',
    type: 'error',
    description: 'Claude 3.5 Sonnet rate limit exceeded',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    status: 'error',
    cost: 0
  },
  {
    id: '3',
    type: 'request',
    description: 'Gemini 2.0 Flash image analysis',
    timestamp: new Date(Date.now() - 1000 * 60 * 8),
    status: 'success',
    cost: 0.12
  },
  {
    id: '4',
    type: 'request',
    description: 'GPT-4o Code generation completed',
    timestamp: new Date(Date.now() - 1000 * 60 * 12),
    status: 'success',
    cost: 0.08
  }
]

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('7d')
  const [selectedTab, setSelectedTab] = useState('overview')

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      default:
        return <Activity className="w-4 h-4 text-gray-500" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPage="analytics" />
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
              <p className="text-gray-600 mt-1">Monitor your AI usage and performance</p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm"
              >
                <option value="24h">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="usage">Usage</TabsTrigger>
            <TabsTrigger value="costs">Costs</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {metricCards.map((metric, index) => {
                const Icon = metric.icon
                return (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                          <p className="text-2xl font-bold text-gray-900 mt-1">{metric.value}</p>
                          <div className="flex items-center mt-2">
                            {metric.changeType === 'increase' ? (
                              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                            ) : (
                              <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                            )}
                            <span className={`text-sm font-medium ${
                              metric.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {Math.abs(metric.change)}%
                            </span>
                            <span className="text-sm text-gray-500 ml-1">vs last period</span>
                          </div>
                        </div>
                        <div className={`p-3 rounded-full bg-gray-100 ${metric.color}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Model Usage */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChart className="w-5 h-5 mr-2" />
                    Model Usage Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {modelUsageData.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                          <span className="text-sm font-medium text-gray-900">{item.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${item.color}`}
                              style={{ width: `${item.value}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600 w-8">{item.value}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Cost by Category */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2" />
                    Cost by Category
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {costByCategory.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                          <span className="text-sm font-medium text-gray-900">{item.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${item.color}`}
                              style={{ width: `${item.value}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600 w-8">{item.value}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(activity.status)}
                        <div>
                          <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                          <p className="text-xs text-gray-500">
                            {activity.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">${activity.cost.toFixed(3)}</p>
                        <Badge variant={activity.status === 'success' ? 'default' : 'destructive'} className="text-xs">
                          {activity.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="usage" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Usage Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gray-100 rounded-lg">
                    <p className="text-gray-500">Usage chart would go here</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Top Models</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {modelUsageData.slice(0, 5).map((model, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
                          <span className="text-sm font-medium text-gray-900">{model.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${model.color}`}
                              style={{ width: `${model.value}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600 w-8">{model.value}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="costs" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Cost Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gray-100 rounded-lg">
                    <p className="text-gray-500">Cost chart would go here</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Cost Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {costByCategory.map((category, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${category.color}`}></div>
                          <span className="text-sm font-medium text-gray-900">{category.name}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          ${(category.value * 456.78).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Response Time Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gray-100 rounded-lg">
                    <p className="text-gray-500">Performance chart would go here</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Success Rate by Model</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {modelUsageData.map((model, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">{model.name}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className="h-2 rounded-full bg-green-500"
                              style={{ width: `${95 + Math.random() * 5}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600 w-8">
                            {(95 + Math.random() * 5).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

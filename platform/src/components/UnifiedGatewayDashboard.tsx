'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Zap, 
  Globe, 
  TrendingUp, 
  Activity,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Copy,
  ExternalLink,
  Server,
  Clock,
  DollarSign,
  Shield,
  Code
} from 'lucide-react'
import { useState } from 'react'

export default function UnifiedGatewayDashboard() {
  const [copiedEndpoint, setCopiedEndpoint] = useState(false)

  const gatewayEndpoint = "https://api.pluto.ai/v1/unified"
  
  const handleCopyEndpoint = () => {
    navigator.clipboard.writeText(gatewayEndpoint)
    setCopiedEndpoint(true)
    setTimeout(() => setCopiedEndpoint(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Unified AI Gateway</h2>
          <p className="text-gray-600 mt-1">
            One endpoint. All AI providers. Intelligent routing.
          </p>
        </div>
        <Badge className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-4 py-2">
          <Globe className="h-4 w-4 mr-2" />
          Gateway Active
        </Badge>
      </div>

      {/* Gateway Endpoint Card */}
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Zap className="h-6 w-6 mr-2 text-purple-600" />
            Your Unified Endpoint
          </CardTitle>
          <CardDescription>
            Replace all your AI provider endpoints with this single gateway
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-3 bg-white p-4 rounded-lg border-2 border-purple-300">
            <Code className="h-5 w-5 text-purple-600" />
            <code className="flex-1 text-sm font-mono text-gray-800">{gatewayEndpoint}</code>
            <Button
              onClick={handleCopyEndpoint}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
            >
              {copiedEndpoint ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Copy</span>
                </>
              )}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Supported Providers</span>
                <Server className="h-4 w-4 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">12+</div>
              <p className="text-xs text-gray-500 mt-1">OpenAI, Anthropic, Google, Meta & more</p>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Avg Response Time</span>
                <Clock className="h-4 w-4 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">847ms</div>
              <p className="text-xs text-gray-500 mt-1">23% faster than direct calls</p>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Cost Savings</span>
                <DollarSign className="h-4 w-4 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">34%</div>
              <p className="text-xs text-gray-500 mt-1">Through intelligent routing</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle>How Intelligent Routing Works</CardTitle>
          <CardDescription>
            Pluto automatically selects the best AI provider based on your preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold">1</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Request Received</h4>
              <p className="text-sm text-gray-600">Your app sends a request to the unified endpoint</p>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold">2</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Analyze & Route</h4>
              <p className="text-sm text-gray-600">Pluto analyzes cost, latency, and quality preferences</p>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold">3</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Provider Selected</h4>
              <p className="text-sm text-gray-600">Best provider chosen based on your policies</p>
            </div>

            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold">4</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Response Returned</h4>
              <p className="text-sm text-gray-600">Monitored, secured, and delivered to your app</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Routing Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2 text-blue-600" />
              Live Routing Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { provider: 'OpenAI GPT-4o', requests: 1247, percentage: 42, color: 'bg-blue-600' },
                { provider: 'Anthropic Claude 3.5', requests: 892, percentage: 30, color: 'bg-purple-600' },
                { provider: 'Google Gemini Pro', requests: 534, percentage: 18, color: 'bg-green-600' },
                { provider: 'Meta Llama 3', requests: 298, percentage: 10, color: 'bg-orange-600' }
              ].map((item, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">{item.provider}</span>
                    <span className="text-gray-600">{item.requests} requests ({item.percentage}%)</span>
                  </div>
                  <Progress value={item.percentage} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
              Routing Strategy Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { strategy: 'Cost-Optimized', success: 98.5, avgCost: '$0.0012', color: 'text-green-600' },
                { strategy: 'Balanced', success: 97.2, avgCost: '$0.0018', color: 'text-blue-600' },
                { strategy: 'Quality-First', success: 99.1, avgCost: '$0.0024', color: 'text-purple-600' },
                { strategy: 'Speed-First', success: 96.8, avgCost: '$0.0015', color: 'text-orange-600' }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className={`h-5 w-5 ${item.color}`} />
                    <div>
                      <div className="font-medium text-gray-900">{item.strategy}</div>
                      <div className="text-xs text-gray-500">Avg cost: {item.avgCost}/request</div>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-white">
                    {item.success}% success
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Integration Guide */}
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Code className="h-5 w-5 mr-2 text-blue-600" />
            Quick Integration Guide
          </CardTitle>
          <CardDescription>
            Replace your existing AI provider calls with Pluto&apos;s unified endpoint
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
              <div className="text-gray-400 mb-2"># Before (Direct OpenAI call)</div>
              <div className="text-red-400 line-through">response = openai.chat.completions.create(</div>
              <div className="text-red-400 line-through ml-4">model=&quot;gpt-4&quot;,</div>
              <div className="text-red-400 line-through ml-4">messages=messages</div>
              <div className="text-red-400 line-through">)</div>
              
              <div className="text-gray-400 mt-4 mb-2"># After (Pluto Unified Gateway)</div>
              <div className="text-green-400">response = requests.post(</div>
              <div className="text-green-400 ml-4">&quot;{gatewayEndpoint}/chat/completions&quot;,</div>
              <div className="text-green-400 ml-4">headers={'{'}&#34;Authorization&#34;: f&#34;Bearer {'{'}PLUTO_API_KEY{'}'}&#34;{'}'},</div>
              <div className="text-green-400 ml-4">json={'{'}&#34;messages&#34;: messages, &#34;strategy&#34;: &#34;balanced&#34;{'}'}</div>
              <div className="text-green-400">)</div>
            </div>

            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Shield className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="font-medium text-gray-900">Automatic Security & Compliance</div>
                  <div className="text-sm text-gray-600">PII detection, policy enforcement, and audit logging included</div>
                </div>
              </div>
              <Button variant="outline" size="sm">
                View Docs
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Benefits Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <CheckCircle className="h-8 w-8 text-green-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Automatic Failover</h3>
            <p className="text-sm text-gray-600">
              If a provider is down or rate-limited, requests automatically route to the next best option
            </p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <DollarSign className="h-8 w-8 text-blue-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Cost Optimization</h3>
            <p className="text-sm text-gray-600">
              Intelligent routing saves an average of 34% on AI costs by selecting the most cost-effective provider
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="pt-6">
            <Activity className="h-8 w-8 text-purple-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Full Visibility</h3>
            <p className="text-sm text-gray-600">
              Track every request, monitor performance, and analyze usage patterns across all providers
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

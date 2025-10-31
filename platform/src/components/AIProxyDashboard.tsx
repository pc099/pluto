'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Globe, 
  Server,
  Copy,
  CheckCircle,
  Code,
  Shield,
  Activity,
  Lock,
  Zap,
  AlertCircle,
  TrendingUp,
  Clock,
  Eye,
  Settings
} from 'lucide-react'
import { useState } from 'react'

export default function AIProxyDashboard() {
  const [copiedProxy, setCopiedProxy] = useState(false)
  const [copiedKey, setCopiedKey] = useState(false)

  const proxyEndpoint = "https://proxy.pluto.ai"
  const apiKey = "pluto_sk_live_abc123xyz789"
  
  const handleCopyProxy = () => {
    navigator.clipboard.writeText(proxyEndpoint)
    setCopiedProxy(true)
    setTimeout(() => setCopiedProxy(false), 2000)
  }

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey)
    setCopiedKey(true)
    setTimeout(() => setCopiedKey(false), 2000)
  }

  const providers = [
    { name: 'OpenAI', endpoint: 'api.openai.com', requests: 8234, status: 'active' },
    { name: 'Anthropic', endpoint: 'api.anthropic.com', requests: 3421, status: 'active' },
    { name: 'Google AI', endpoint: 'generativelanguage.googleapis.com', requests: 2156, status: 'active' },
    { name: 'Cohere', endpoint: 'api.cohere.ai', requests: 1892, status: 'active' },
    { name: 'Mistral', endpoint: 'api.mistral.ai', requests: 1234, status: 'active' },
    { name: 'Perplexity', endpoint: 'api.perplexity.ai', requests: 876, status: 'active' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">AI Proxy</h2>
          <p className="text-gray-600 mt-1">
            Organizational proxy to intercept and monitor all AI API calls
          </p>
        </div>
        <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2">
          <Globe className="h-4 w-4 mr-2" />
          Proxy Active
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-2 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Intercepted Today</p>
                <p className="text-3xl font-bold text-blue-600">18,813</p>
                <p className="text-xs text-green-600 mt-1">↑ 34% from yesterday</p>
              </div>
              <Activity className="h-10 w-10 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Providers</p>
                <p className="text-3xl font-bold text-green-600">6</p>
                <p className="text-xs text-gray-600 mt-1">All operational</p>
              </div>
              <Server className="h-10 w-10 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Avg Latency</p>
                <p className="text-3xl font-bold text-purple-600">124ms</p>
                <p className="text-xs text-green-600 mt-1">Proxy overhead</p>
              </div>
              <Clock className="h-10 w-10 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Blocked Requests</p>
                <p className="text-3xl font-bold text-orange-600">47</p>
                <p className="text-xs text-orange-600 mt-1">Policy violations</p>
              </div>
              <Shield className="h-10 w-10 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Proxy Configuration */}
      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Settings className="h-6 w-6 mr-2 text-blue-600" />
            Proxy Configuration
          </CardTitle>
          <CardDescription>
            Configure your applications to route all AI API calls through Pluto's proxy
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Proxy Endpoint */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">
              Proxy Endpoint
            </label>
            <div className="flex items-center space-x-3 bg-white p-4 rounded-lg border-2 border-blue-300">
              <Globe className="h-5 w-5 text-blue-600 flex-shrink-0" />
              <code className="flex-1 text-sm font-mono text-gray-800">{proxyEndpoint}</code>
              <Button
                onClick={handleCopyProxy}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                {copiedProxy ? (
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
          </div>

          {/* API Key */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">
              Proxy API Key
            </label>
            <div className="flex items-center space-x-3 bg-white p-4 rounded-lg border-2 border-purple-300">
              <Lock className="h-5 w-5 text-purple-600 flex-shrink-0" />
              <code className="flex-1 text-sm font-mono text-gray-800">{apiKey}</code>
              <Button
                onClick={handleCopyKey}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                {copiedKey ? (
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
          </div>

          {/* Setup Instructions */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Code className="h-4 w-4 mr-2 text-blue-600" />
              Quick Setup
            </h4>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">1. Set Environment Variables</p>
                <div className="bg-gray-900 p-3 rounded text-xs font-mono text-green-400 overflow-x-auto">
                  export PLUTO_PROXY_URL="{proxyEndpoint}"<br/>
                  export PLUTO_API_KEY="{apiKey}"
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">2. Configure Your HTTP Client</p>
                <div className="bg-gray-900 p-3 rounded text-xs font-mono text-green-400 overflow-x-auto">
                  # Python Example<br/>
                  import openai<br/>
                  openai.api_base = "{proxyEndpoint}/v1"<br/>
                  openai.api_key = "{apiKey}"
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">3. Make Requests as Normal</p>
                <div className="bg-gray-900 p-3 rounded text-xs font-mono text-green-400 overflow-x-auto">
                  # All requests are now intercepted and monitored<br/>
                  response = openai.ChatCompletion.create(<br/>
                  &nbsp;&nbsp;model="gpt-4",<br/>
                  &nbsp;&nbsp;messages=[{"{"}...{"}"}]<br/>
                  )
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Intercepted Providers */}
      <Card className="border-2 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Eye className="h-6 w-6 mr-2 text-green-600" />
            Intercepted Providers
          </CardTitle>
          <CardDescription>
            AI providers being monitored through the proxy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {providers.map((provider) => (
              <div
                key={provider.name}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-green-300 transition-all"
              >
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Server className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{provider.name}</h4>
                    <p className="text-sm text-gray-600">{provider.endpoint}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{provider.requests.toLocaleString()}</p>
                    <p className="text-xs text-gray-600">requests today</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    {provider.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-2 border-blue-200">
          <CardContent className="p-6">
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Activity className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Complete Visibility</h3>
            <p className="text-sm text-gray-600">
              Monitor every AI API call across your entire organization in real-time
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-200">
          <CardContent className="p-6">
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Policy Enforcement</h3>
            <p className="text-sm text-gray-600">
              Automatically block requests that violate your security and compliance policies
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200">
          <CardContent className="p-6">
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Zap className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Zero Code Changes</h3>
            <p className="text-sm text-gray-600">
              Simple configuration change - no need to modify your application code
            </p>
          </CardContent>
        </Card>
      </div>

      {/* How It Works */}
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <TrendingUp className="h-6 w-6 mr-2 text-blue-600" />
            How the Proxy Works
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border border-blue-200">
              <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                <span className="text-xl font-bold text-blue-600">1</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Intercept</h4>
              <p className="text-sm text-gray-600">
                Your app sends requests to Pluto proxy instead of directly to AI providers
              </p>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-purple-200">
              <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                <span className="text-xl font-bold text-purple-600">2</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Analyze</h4>
              <p className="text-sm text-gray-600">
                Request is analyzed for PII, policy violations, and security threats
              </p>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-green-200">
              <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                <span className="text-xl font-bold text-green-600">3</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Forward</h4>
              <p className="text-sm text-gray-600">
                Request is forwarded to the AI provider and response is captured
              </p>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-orange-200">
              <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center mb-3">
                <span className="text-xl font-bold text-orange-600">4</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Monitor</h4>
              <p className="text-sm text-gray-600">
                Full request/response logged for debugging, analytics, and compliance
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alert */}
      <Card className="border-2 border-yellow-200 bg-yellow-50">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Important: Provider API Keys</h4>
              <p className="text-sm text-gray-700">
                You still need to configure your actual provider API keys (OpenAI, Anthropic, etc.) in the Pluto dashboard. 
                The proxy will use these keys to forward requests to the respective providers.
              </p>
              <Button variant="outline" size="sm" className="mt-3">
                Configure Provider Keys →
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

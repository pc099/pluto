'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  ExternalLink,
  Globe,
  TrendingUp,
  Shield,
  Database,
  AlertCircle,
  Activity
} from 'lucide-react'

export default function HallucinationVerificationDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Hallucination Detection & Verification</h2>
          <p className="text-gray-600 mt-1">
            Real-time fact-checking with external source verification
          </p>
        </div>
        <Badge className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-4 py-2">
          <Shield className="h-4 w-4 mr-2" />
          Active Verification
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Detection Rate</span>
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-green-600">98.7%</div>
            <p className="text-xs text-gray-500 mt-1">Accuracy in last 30 days</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Verified Claims</span>
              <Database className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-blue-600">12,847</div>
            <p className="text-xs text-gray-500 mt-1">+23% from last month</p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Issues Detected</span>
              <AlertTriangle className="h-5 w-5 text-orange-600" />
            </div>
            <div className="text-3xl font-bold text-orange-600">127</div>
            <p className="text-xs text-gray-500 mt-1">0.99% hallucination rate</p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Avg. Confidence</span>
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <div className="text-3xl font-bold text-purple-600">94.3%</div>
            <p className="text-xs text-gray-500 mt-1">High confidence scores</p>
          </CardContent>
        </Card>
      </div>

      {/* External Verification Sources */}
      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="h-6 w-6 mr-2 text-blue-600" />
            External Verification Sources
          </CardTitle>
          <CardDescription>
            Real-time fact-checking against trusted external databases
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { source: 'Wikipedia', icon: '📚', requests: 8234, accuracy: 96.8, latency: '340ms' },
              { source: 'Academic Databases', icon: '🎓', requests: 2145, accuracy: 98.2, latency: '520ms' },
              { source: 'News APIs', icon: '📰', requests: 1892, accuracy: 94.5, latency: '280ms' },
              { source: 'Government Data', icon: '🏛️', requests: 576, accuracy: 99.1, latency: '450ms' },
              { source: 'Scientific Journals', icon: '🔬', requests: 423, accuracy: 97.9, latency: '680ms' },
              { source: 'Financial Data', icon: '💹', requests: 312, accuracy: 98.7, latency: '390ms' }
            ].map((source, idx) => (
              <div key={idx} className="bg-white p-4 rounded-lg border-2 border-gray-200">
                <div className="flex items-center space-x-2 mb-3">
                  <span className="text-2xl">{source.icon}</span>
                  <div>
                    <div className="font-semibold text-gray-900">{source.source}</div>
                    <Badge variant="outline" className="mt-1 bg-green-50 text-green-700 border-green-300">
                      Active
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Requests:</span>
                    <span className="font-medium">{source.requests.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Accuracy:</span>
                    <span className="font-medium text-green-600">{source.accuracy}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Latency:</span>
                    <span className="font-medium text-blue-600">{source.latency}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Live Verification Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2 text-purple-600" />
            Live Verification Feed
          </CardTitle>
          <CardDescription>Real-time fact-checking of AI responses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                claim: 'The Eiffel Tower is 330 meters tall',
                model: 'GPT-4o',
                status: 'success',
                source: 'Wikipedia',
                confidence: 98.5,
                details: 'Cross-referenced with 3 sources'
              },
              {
                claim: 'Python was released in 1991',
                model: 'Claude 3.5',
                status: 'success',
                source: 'Academic Databases',
                confidence: 99.2,
                details: 'Confirmed by official documentation'
              },
              {
                claim: 'The population of Tokyo is 50 million',
                model: 'Gemini Pro',
                status: 'warning',
                source: 'Government Data',
                confidence: 87.3,
                details: 'Actual: ~14M (metro: ~37M)'
              },
              {
                claim: 'Bitcoin was invented in 2005',
                model: 'GPT-4o',
                status: 'error',
                source: 'Financial Data',
                confidence: 95.8,
                details: 'Actual: Bitcoin whitepaper 2008'
              }
            ].map((item, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg border-2 ${
                  item.status === 'success' ? 'bg-green-50 border-green-200' :
                  item.status === 'warning' ? 'bg-orange-50 border-orange-200' :
                  'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {item.status === 'success' ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : item.status === 'warning' ? (
                        <AlertCircle className="h-5 w-5 text-orange-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                      <Badge variant="outline">{item.model}</Badge>
                      <Badge className={item.status === 'success' ? 'bg-green-600' : item.status === 'warning' ? 'bg-orange-600' : 'bg-red-600'}>
                        {item.confidence}% confidence
                      </Badge>
                    </div>
                    <p className="text-sm font-medium text-gray-900 mb-1">{item.claim}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-600">
                      <span className="flex items-center">
                        <Globe className="h-3 w-3 mr-1" />
                        Source: {item.source}
                      </span>
                      <span>{item.details}</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

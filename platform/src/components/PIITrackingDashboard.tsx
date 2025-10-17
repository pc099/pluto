'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Shield, 
  AlertTriangle, 
  Eye, 
  EyeOff,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Lock,
  FileText,
  Users,
  Database,
  Clock,
  BarChart3
} from 'lucide-react'
import { useState } from 'react'

export default function PIITrackingDashboard() {
  const [showMaskedData, setShowMaskedData] = useState(true)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">PII Detection & Tracking</h2>
          <p className="text-gray-600 mt-1">
            Real-time monitoring of Personally Identifiable Information across all AI traffic
          </p>
        </div>
        <Badge className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-4 py-2">
          <Shield className="h-4 w-4 mr-2" />
          Active Monitoring
        </Badge>
      </div>

      {/* Critical Alerts */}
      <Card className="border-2 border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center text-red-900">
            <AlertTriangle className="h-6 w-6 mr-2 text-red-600" />
            Critical PII Detections (Last 24 Hours)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border-2 border-red-300">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">SSN Detected</span>
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div className="text-3xl font-bold text-red-600">3</div>
              <p className="text-xs text-gray-500 mt-1">Critical risk level</p>
            </div>

            <div className="bg-white p-4 rounded-lg border-2 border-orange-300">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Credit Cards</span>
                <AlertCircle className="h-5 w-5 text-orange-600" />
              </div>
              <div className="text-3xl font-bold text-orange-600">7</div>
              <p className="text-xs text-gray-500 mt-1">High risk level</p>
            </div>

            <div className="bg-white p-4 rounded-lg border-2 border-yellow-300">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Email/Phone</span>
                <AlertCircle className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="text-3xl font-bold text-yellow-600">142</div>
              <p className="text-xs text-gray-500 mt-1">Medium risk level</p>
            </div>

            <div className="bg-white p-4 rounded-lg border-2 border-green-300">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Clean Requests</span>
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-green-600">12,695</div>
              <p className="text-xs text-gray-500 mt-1">No PII detected</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PII Detection Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
              PII Types Detected (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { type: 'Email Addresses', count: 1247, risk: 'Medium', color: 'bg-yellow-500', percentage: 45 },
                { type: 'Phone Numbers', count: 892, risk: 'Medium', color: 'bg-yellow-500', percentage: 32 },
                { type: 'Names', count: 534, risk: 'Low', color: 'bg-blue-500', percentage: 19 },
                { type: 'Credit Cards', count: 67, risk: 'Critical', color: 'bg-red-500', percentage: 2.4 },
                { type: 'SSN', count: 23, risk: 'Critical', color: 'bg-red-500', percentage: 0.8 },
                { type: 'IP Addresses', count: 189, risk: 'Low', color: 'bg-blue-500', percentage: 6.8 }
              ].map((item, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-700">{item.type}</span>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          item.risk === 'Critical' ? 'border-red-500 text-red-700' :
                          item.risk === 'High' ? 'border-orange-500 text-orange-700' :
                          item.risk === 'Medium' ? 'border-yellow-500 text-yellow-700' :
                          'border-blue-500 text-blue-700'
                        }`}
                      >
                        {item.risk}
                      </Badge>
                    </div>
                    <span className="text-gray-600">{item.count} instances</span>
                  </div>
                  <Progress value={item.percentage} className={`h-2 ${item.color}`} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-purple-600" />
              PII Detection Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Detection Accuracy</span>
                  <Badge className="bg-green-600">Excellent</Badge>
                </div>
                <div className="text-3xl font-bold text-green-600 mb-1">98.7%</div>
                <p className="text-xs text-gray-600">+2.3% from last month</p>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Avg Response Time</span>
                  <Clock className="h-4 w-4 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-blue-600 mb-1">23ms</div>
                <p className="text-xs text-gray-600">Real-time detection with minimal latency</p>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Total Scanned</span>
                  <Database className="h-4 w-4 text-purple-600" />
                </div>
                <div className="text-3xl font-bold text-purple-600 mb-1">12,847</div>
                <p className="text-xs text-gray-600">Requests analyzed in last 24 hours</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent PII Detections */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-orange-600" />
                Recent PII Detections
              </CardTitle>
              <CardDescription>Live feed of detected PII in AI traffic</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMaskedData(!showMaskedData)}
              className="flex items-center space-x-2"
            >
              {showMaskedData ? (
                <>
                  <EyeOff className="h-4 w-4" />
                  <span>Show Masked</span>
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  <span>Show Original</span>
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                id: 1,
                timestamp: '2 minutes ago',
                type: 'Email',
                original: 'john.doe@company.com',
                masked: '***@***.***',
                risk: 'Medium',
                action: 'Logged & Masked',
                user: 'Team Alpha',
                model: 'GPT-4o'
              },
              {
                id: 2,
                timestamp: '5 minutes ago',
                type: 'Phone',
                original: '555-123-4567',
                masked: '***-***-****',
                risk: 'Medium',
                action: 'Logged & Masked',
                user: 'Team Beta',
                model: 'Claude 3.5'
              },
              {
                id: 3,
                timestamp: '12 minutes ago',
                type: 'Credit Card',
                original: '4532-1234-5678-9010',
                masked: '****-****-****-****',
                risk: 'Critical',
                action: 'Blocked',
                user: 'Team Gamma',
                model: 'GPT-4o'
              },
              {
                id: 4,
                timestamp: '18 minutes ago',
                type: 'SSN',
                original: '123-45-6789',
                masked: '***-**-****',
                risk: 'Critical',
                action: 'Blocked & Alerted',
                user: 'Team Delta',
                model: 'Gemini Pro'
              }
            ].map((detection) => (
              <div
                key={detection.id}
                className={`p-4 rounded-lg border-2 ${
                  detection.risk === 'Critical' ? 'bg-red-50 border-red-200' :
                  detection.risk === 'High' ? 'bg-orange-50 border-orange-200' :
                  'bg-yellow-50 border-yellow-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Badge
                        className={
                          detection.risk === 'Critical' ? 'bg-red-600' :
                          detection.risk === 'High' ? 'bg-orange-600' :
                          'bg-yellow-600'
                        }
                      >
                        {detection.type}
                      </Badge>
                      <span className="text-sm text-gray-600">{detection.timestamp}</span>
                      <Badge variant="outline">{detection.model}</Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-2">
                      <div>
                        <span className="text-xs text-gray-500">Detected Value:</span>
                        <div className="font-mono text-sm mt-1">
                          {showMaskedData ? detection.masked : detection.original}
                        </div>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">User/Team:</span>
                        <div className="text-sm font-medium mt-1">{detection.user}</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 text-xs text-gray-600">
                      <span className="flex items-center">
                        <Lock className="h-3 w-3 mr-1" />
                        Action: {detection.action}
                      </span>
                      <span className="flex items-center">
                        <Shield className="h-3 w-3 mr-1" />
                        Risk: {detection.risk}
                      </span>
                    </div>
                  </div>

                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* PII Compliance & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2 text-blue-600" />
              Compliance Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { framework: 'GDPR', status: 'Compliant', score: 98, color: 'text-green-600' },
                { framework: 'HIPAA', status: 'Compliant', score: 95, color: 'text-green-600' },
                { framework: 'PCI DSS', status: 'Action Required', score: 87, color: 'text-orange-600' },
                { framework: 'CCPA', status: 'Compliant', score: 96, color: 'text-green-600' }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className={`h-5 w-5 ${item.color}`} />
                    <div>
                      <div className="font-medium text-gray-900">{item.framework}</div>
                      <div className="text-xs text-gray-500">{item.status}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${item.color}`}>{item.score}%</div>
                    <div className="text-xs text-gray-500">Compliance Score</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-purple-600" />
              Recommended Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-red-900">Critical: Review SSN Detections</div>
                    <p className="text-sm text-red-700 mt-1">
                      3 SSN instances detected. Ensure PCI DSS compliance for these requests.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-orange-900">Update Credit Card Policy</div>
                    <p className="text-sm text-orange-700 mt-1">
                      Consider blocking all credit card data in AI requests.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-blue-900">Enable Auto-Masking</div>
                    <p className="text-sm text-blue-700 mt-1">
                      Automatically mask all detected PII before sending to AI providers.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-start space-x-2">
                  <Users className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-green-900">Team Training Recommended</div>
                    <p className="text-sm text-green-700 mt-1">
                      Team Gamma has 45% higher PII detection rate. Consider training.
                    </p>
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

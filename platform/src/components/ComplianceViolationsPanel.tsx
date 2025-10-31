'use client'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  AlertTriangle, 
  Shield, 
  CheckCircle, 
  XCircle,
  Clock,
  Eye,
  FileText,
  Download,
  RefreshCw
} from 'lucide-react'

interface ComplianceViolation {
  id: string
  type: 'gdpr' | 'hipaa' | 'pci_dss' | 'ccpa' | 'soc2'
  severity: 'critical' | 'high' | 'medium' | 'low'
  request_id: string
  violation: string
  detected_at: string
  data_type: string
  action_required: string
  auto_remediated: boolean
  status: 'open' | 'investigating' | 'remediated' | 'false_positive'
}

export default function ComplianceViolationsPanel() {
  const [violations, setViolations] = useState<ComplianceViolation[]>([])
  const [filter, setFilter] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadViolations()
  }, [])

  const loadViolations = () => {
    // Mock data - replace with actual API call
    const mockViolations: ComplianceViolation[] = [
      {
        id: '1',
        type: 'gdpr',
        severity: 'critical',
        request_id: 'req_12345',
        violation: 'PII detected without explicit consent',
        detected_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        data_type: 'email_address',
        action_required: 'Obtain user consent or delete data within 72 hours',
        auto_remediated: false,
        status: 'open'
      },
      {
        id: '2',
        type: 'hipaa',
        severity: 'critical',
        request_id: 'req_12346',
        violation: 'Protected Health Information (PHI) detected in unencrypted request',
        detected_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        data_type: 'medical_record',
        action_required: 'Enable encryption and notify security team',
        auto_remediated: false,
        status: 'investigating'
      },
      {
        id: '3',
        type: 'pci_dss',
        severity: 'critical',
        request_id: 'req_12347',
        violation: 'Credit card number detected in logs',
        detected_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        data_type: 'credit_card',
        action_required: 'Immediately purge logs and implement tokenization',
        auto_remediated: true,
        status: 'remediated'
      },
      {
        id: '4',
        type: 'gdpr',
        severity: 'high',
        request_id: 'req_12348',
        violation: 'Data retention period exceeded (90+ days)',
        detected_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
        data_type: 'user_activity',
        action_required: 'Delete or archive data older than retention policy',
        auto_remediated: false,
        status: 'open'
      },
      {
        id: '5',
        type: 'soc2',
        severity: 'medium',
        request_id: 'req_12349',
        violation: 'Unauthorized access attempt detected',
        detected_at: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
        data_type: 'access_logs',
        action_required: 'Review access controls and update permissions',
        auto_remediated: false,
        status: 'investigating'
      },
      {
        id: '6',
        type: 'ccpa',
        severity: 'high',
        request_id: 'req_12350',
        violation: 'California resident data sold without opt-out option',
        detected_at: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
        data_type: 'user_profile',
        action_required: 'Provide "Do Not Sell My Info" option',
        auto_remediated: false,
        status: 'open'
      }
    ]
    setViolations(mockViolations)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'gdpr': return 'bg-purple-100 text-purple-800'
      case 'hipaa': return 'bg-blue-100 text-blue-800'
      case 'pci_dss': return 'bg-green-100 text-green-800'
      case 'ccpa': return 'bg-yellow-100 text-yellow-800'
      case 'soc2': return 'bg-indigo-100 text-indigo-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'investigating': return <Clock className="h-4 w-4 text-yellow-500" />
      case 'remediated': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'false_positive': return <XCircle className="h-4 w-4 text-gray-500" />
      default: return null
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
    return date.toLocaleDateString()
  }

  const filteredViolations = filter === 'all' 
    ? violations 
    : violations.filter(v => v.severity === filter)

  const criticalCount = violations.filter(v => v.severity === 'critical').length
  const highCount = violations.filter(v => v.severity === 'high').length
  const openCount = violations.filter(v => v.status === 'open').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Compliance Violations</h2>
          <p className="text-gray-600">Real-time monitoring and automated detection</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" onClick={loadViolations}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-2 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Critical</p>
                <p className="text-3xl font-bold text-red-600">{criticalCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">High Priority</p>
                <p className="text-3xl font-bold text-orange-600">{highCount}</p>
              </div>
              <Shield className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Open Issues</p>
                <p className="text-3xl font-bold text-yellow-600">{openCount}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Auto-Remediated</p>
                <p className="text-3xl font-bold text-green-600">
                  {violations.filter(v => v.auto_remediated).length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-700">Filter by severity:</span>
        {['all', 'critical', 'high', 'medium', 'low'].map((severity) => (
          <Button
            key={severity}
            variant={filter === severity ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(severity as any)}
            className="capitalize"
          >
            {severity}
          </Button>
        ))}
      </div>

      {/* Violations List */}
      <div className="space-y-4">
        {filteredViolations.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Violations Found</h3>
              <p className="text-gray-600">Your system is compliant with all regulations</p>
            </CardContent>
          </Card>
        ) : (
          filteredViolations.map((violation) => (
            <Card 
              key={violation.id} 
              className={`border-2 transition-all hover:shadow-lg ${
                violation.severity === 'critical' ? 'border-red-200' :
                violation.severity === 'high' ? 'border-orange-200' :
                'border-gray-200'
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {getStatusIcon(violation.status)}
                      <Badge className={getSeverityColor(violation.severity)}>
                        {violation.severity.toUpperCase()}
                      </Badge>
                      <Badge className={getTypeColor(violation.type)}>
                        {violation.type.toUpperCase()}
                      </Badge>
                      {violation.auto_remediated && (
                        <Badge className="bg-green-100 text-green-800">
                          Auto-Remediated
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg">{violation.violation}</CardTitle>
                    <CardDescription className="mt-1">
                      Request ID: {violation.request_id} • Detected {formatTimestamp(violation.detected_at)}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Action Required:</p>
                      <p className="text-sm text-gray-600">{violation.action_required}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <p className="text-sm text-gray-600">
                      Data Type: <span className="font-medium">{violation.data_type}</span>
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 pt-2 border-t">
                    <Button size="sm" variant="outline">
                      <Eye className="h-3 w-3 mr-1" />
                      View Request
                    </Button>
                    <Button size="sm" variant="outline">
                      Mark as Resolved
                    </Button>
                    <Button size="sm" variant="outline">
                      False Positive
                    </Button>
                    {!violation.auto_remediated && (
                      <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                        Auto-Remediate
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

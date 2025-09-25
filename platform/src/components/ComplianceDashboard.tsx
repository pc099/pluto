// src/components/ComplianceDashboard.tsx
'use client'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const API_BASE = 'http://localhost:8000'

interface ComplianceFramework {
  id: string
  name: string
  version: string
  description: string
}

interface ComplianceAssessment {
  assessment_id: string
  framework: string
  framework_name: string
  timestamp: string
  compliance_score: number
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  status: 'compliant' | 'mostly_compliant' | 'partially_compliant' | 'non_compliant'
  findings: string[]
  recommendations: string[]
  violations: string[]
  controls_assessed: string[]
}

interface ComplianceStatus {
  overall_status: string
  frameworks: Record<string, {
    name: string
    status: string
    compliance_score: number
    risk_level: string
    last_assessment: string | null
  }>
  critical_issues: string[]
  recommendations: string[]
  last_updated: string
}

export default function ComplianceDashboard() {
  const [frameworks, setFrameworks] = useState<ComplianceFramework[]>([])
  const [complianceStatus, setComplianceStatus] = useState<ComplianceStatus | null>(null)
  const [assessments, setAssessments] = useState<ComplianceAssessment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedFramework, setSelectedFramework] = useState<string>('')

  useEffect(() => {
    fetchComplianceData()
  }, [])

  const fetchComplianceData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch compliance frameworks and status
      const [frameworksResponse, statusResponse] = await Promise.all([
        fetch(`${API_BASE}/compliance/frameworks`),
        fetch(`${API_BASE}/compliance/status`)
      ])

      if (frameworksResponse.ok) {
        const frameworksData = await frameworksResponse.json()
        setFrameworks(frameworksData.frameworks || [])
      }

      if (statusResponse.ok) {
        const statusData = await statusResponse.json()
        setComplianceStatus(statusData)
      }

    } catch (err) {
      console.error('Error fetching compliance data:', err)
      setError('Failed to load compliance data')
    } finally {
      setLoading(false)
    }
  }

  const runComplianceAssessment = async (frameworkId: string) => {
    try {
      setLoading(true)
      
      // Mock AI system data for assessment
      const aiSystemData = {
        governance_structure: true,
        risk_management_roles: true,
        risk_tolerance: true,
        system_inventory: true,
        system_context: true,
        system_components: true,
        system_interactions: true,
        system_boundaries: true,
        performance_metrics: true,
        accuracy_metrics: true,
        bias_metrics: true,
        security_metrics: true,
        risk_management: true,
        change_management: true,
        incident_management: true,
        lifecycle_management: true
      }

      const response = await fetch(`${API_BASE}/compliance/assess/${frameworkId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(aiSystemData)
      })

      if (response.ok) {
        const assessment = await response.json()
        setAssessments(prev => [assessment, ...prev])
        await fetchComplianceData() // Refresh status
      }

    } catch (err) {
      console.error('Error running compliance assessment:', err)
    } finally {
      setLoading(false)
    }
  }

  const runAllAssessments = async () => {
    try {
      setLoading(true)
      
      // Mock AI system data for assessment
      const aiSystemData = {
        governance_structure: true,
        risk_management_roles: true,
        risk_tolerance: true,
        system_inventory: true,
        system_context: true,
        system_components: true,
        system_interactions: true,
        system_boundaries: true,
        performance_metrics: true,
        accuracy_metrics: true,
        bias_metrics: true,
        security_metrics: true,
        risk_management: true,
        change_management: true,
        incident_management: true,
        lifecycle_management: true
      }

      const response = await fetch(`${API_BASE}/compliance/assess-all`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(aiSystemData)
      })

      if (response.ok) {
        const results = await response.json()
        console.log('All assessments completed:', results)
        await fetchComplianceData() // Refresh status
      }

    } catch (err) {
      console.error('Error running all assessments:', err)
    } finally {
      setLoading(false)
    }
  }

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'high': return 'text-orange-600 bg-orange-100'
      case 'critical': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'text-green-600 bg-green-100'
      case 'mostly_compliant': return 'text-blue-600 bg-blue-100'
      case 'partially_compliant': return 'text-yellow-600 bg-yellow-100'
      case 'non_compliant': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Compliance Dashboard</h2>
          <Button disabled>Run Assessment</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Compliance Dashboard</h2>
          <Button onClick={fetchComplianceData}>Retry</Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Compliance Dashboard</h2>
          <p className="text-gray-600">Regulatory compliance monitoring across all frameworks</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={runAllAssessments} disabled={loading}>
            Run All Assessments
          </Button>
          <Button onClick={fetchComplianceData} variant="outline">
            Refresh
          </Button>
        </div>
      </div>

      {/* Overall Compliance Status */}
      {complianceStatus && (
        <Card>
          <CardHeader>
            <CardTitle>Overall Compliance Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {Object.keys(complianceStatus.frameworks).length}
                </div>
                <div className="text-sm text-gray-600">Frameworks</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {Object.values(complianceStatus.frameworks).filter(f => f.status === 'compliant').length}
                </div>
                <div className="text-sm text-gray-600">Compliant</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {Object.values(complianceStatus.frameworks).filter(f => f.status === 'mostly_compliant').length}
                </div>
                <div className="text-sm text-gray-600">Mostly Compliant</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {Object.values(complianceStatus.frameworks).filter(f => f.status === 'non_compliant').length}
                </div>
                <div className="text-sm text-gray-600">Non-Compliant</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Compliance Frameworks */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {frameworks.map((framework) => {
          const frameworkStatus = complianceStatus?.frameworks[framework.id]
          return (
            <Card key={framework.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{framework.name}</CardTitle>
                  <Button
                    size="sm"
                    onClick={() => runComplianceAssessment(framework.id)}
                    disabled={loading}
                  >
                    Assess
                  </Button>
                </div>
                <p className="text-sm text-gray-600">{framework.description}</p>
              </CardHeader>
              <CardContent>
                {frameworkStatus ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(frameworkStatus.status)}`}>
                        {frameworkStatus.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Score:</span>
                      <span className="text-sm font-bold">
                        {(frameworkStatus.compliance_score * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Risk Level:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getRiskLevelColor(frameworkStatus.risk_level)}`}>
                        {frameworkStatus.risk_level}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    <p className="text-sm">Not assessed</p>
                    <p className="text-xs">Click "Assess" to run compliance check</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Assessments */}
      {assessments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Assessments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {assessments.slice(0, 5).map((assessment) => (
                <div key={assessment.assessment_id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{assessment.framework_name}</h3>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(assessment.status)}`}>
                        {assessment.status.replace('_', ' ')}
                      </span>
                      <span className="text-sm text-gray-600">
                        {(assessment.compliance_score * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>Risk Level: <span className={`font-semibold ${getRiskLevelColor(assessment.risk_level)}`}>
                      {assessment.risk_level}
                    </span></p>
                    <p>Assessed: {new Date(assessment.timestamp).toLocaleString()}</p>
                    {assessment.findings.length > 0 && (
                      <p>Findings: {assessment.findings.length}</p>
                    )}
                    {assessment.violations.length > 0 && (
                      <p className="text-red-600">Violations: {assessment.violations.length}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Compliance Recommendations */}
      {complianceStatus?.recommendations && complianceStatus.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Compliance Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {complianceStatus.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-700">{recommendation}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

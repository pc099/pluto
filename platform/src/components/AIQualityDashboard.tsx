'use client'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { API_BASE_URL } from '@/lib/api'

const API_BASE = API_BASE_URL

interface QualityAnalysis {
  analysis_id: string
  timestamp: string
  model: string
  provider: string
  overall_quality_score: number
  risk_level: 'MINIMAL' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  detailed_scores: {
    hallucination_risk: number
    confidence_score: number
    factual_consistency: number
    toxicity_score: number
    bias_score: number
  }
  security_analysis: {
    prompt_injection_detected: boolean
    data_extraction_attempt: boolean
    malicious_request: boolean
    security_score: number
    detected_patterns: string[]
    risk_indicators: string[]
  }
  recommendations: string[]
  alerts: Array<{
    type: string
    severity: string
    message: string
    action_required: string
  }>
}

export default function AIQualityDashboard() {
  const [qualityData, setQualityData] = useState<QualityAnalysis[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total_analyzed: 0,
    avg_quality_score: 0,
    high_risk_count: 0,
    hallucination_alerts: 0,
    security_incidents: 0
  })

  useEffect(() => {
    fetchQualityData()
    const interval = setInterval(fetchQualityData, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchQualityData = async () => {
    try {
      // Fetch real data from API endpoints
      const [statsResponse, recentResponse, trendsResponse] = await Promise.all([
        fetch(`${API_BASE}/quality/statistics?days=7`),
        fetch(`${API_BASE}/quality/recent?limit=10&days=7`),
        fetch(`${API_BASE}/quality/trends?days=30`)
      ])

      // Handle statistics
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats({
          total_analyzed: statsData.total_analyzed || 0,
          avg_quality_score: statsData.avg_quality_score || 0,
          high_risk_count: statsData.high_risk_count || 0,
          hallucination_alerts: statsData.hallucination_alerts || 0,
          security_incidents: statsData.security_incidents || 0
        })
      }

      // Handle recent analyses
      if (recentResponse.ok) {
        const recentData = await recentResponse.json()
        setQualityData(recentData.analyses || [])
      }

      // Handle trends data (could be used for future charts)
      if (trendsResponse.ok) {
        const trendsData = await trendsResponse.json()
        console.log('Quality trends:', trendsData) // For debugging
      }

      // If no data available, try to generate sample data for demo
      if ((!statsResponse.ok || stats.total_analyzed === 0) && qualityData.length === 0) {
        console.log('No quality data found, generating sample data...')
        await generateSampleData()
      }
      
    } catch (error) {
      console.error('Failed to fetch quality data:', error)
      
      // Fallback to sample data for demo purposes
      await generateSampleData()
    } finally {
      setLoading(false)
    }
  }

  const generateSampleData = async () => {
    try {
      // Generate a sample quality analysis for demo
      const response = await fetch(`${API_BASE}/quality/test`, { method: 'POST' })
      if (response.ok) {
        const testData = await response.json()
        console.log('Generated sample quality analysis:', testData.analysis)
        
        // Re-fetch data after generating sample
        setTimeout(() => {
          fetchQualityData()
        }, 1000)
      }
    } catch (error) {
      console.error('Failed to generate sample data:', error)
      
      // Use hardcoded mock data as ultimate fallback
      const mockData: QualityAnalysis[] = [
        {
          analysis_id: 'demo_001',
          timestamp: new Date().toISOString(),
          model: 'gpt-3.5-turbo',
          provider: 'openai',
          overall_quality_score: 0.85,
          risk_level: 'LOW',
          detailed_scores: {
            hallucination_risk: 0.15,
            confidence_score: 0.9,
            factual_consistency: 0.95,
            toxicity_score: 0.05,
            bias_score: 0.1
          },
          security_analysis: {
            prompt_injection_detected: false,
            data_extraction_attempt: false,
            malicious_request: false,
            security_score: 0.95,
            detected_patterns: [],
            risk_indicators: []
          },
          recommendations: ['High quality response - safe to use'],
          alerts: []
        },
        {
          analysis_id: 'demo_002',
          timestamp: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
          model: 'gpt-3.5-turbo',
          provider: 'openai',
          overall_quality_score: 0.45,
          risk_level: 'HIGH',
          detailed_scores: {
            hallucination_risk: 0.8,
            confidence_score: 0.3,
            factual_consistency: 0.4,
            toxicity_score: 0.1,
            bias_score: 0.2
          },
          security_analysis: {
            prompt_injection_detected: true,
            data_extraction_attempt: false,
            malicious_request: false,
            security_score: 0.2,
            detected_patterns: ['ignore previous instructions'],
            risk_indicators: ['AI may have complied with suspicious request']
          },
          recommendations: [
            'URGENT: Prompt injection detected - review and potentially block this request',
            'High hallucination risk - verify response accuracy before use'
          ],
          alerts: [
            {
              type: 'SECURITY',
              severity: 'CRITICAL',
              message: 'Prompt injection attack detected',
              action_required: 'Block request and review security policies'
            },
            {
              type: 'QUALITY',
              severity: 'HIGH',
              message: 'High hallucination risk detected',
              action_required: 'Verify response accuracy before use'
            }
          ]
        }
      ]
      
      setQualityData(mockData)
      
      // Calculate mock stats
      const totalAnalyzed = mockData.length
      const avgQuality = mockData.reduce((sum, item) => sum + item.overall_quality_score, 0) / totalAnalyzed
      const highRisk = mockData.filter(item => ['HIGH', 'CRITICAL'].includes(item.risk_level)).length
      const hallucinationAlerts = mockData.filter(item => item.detailed_scores.hallucination_risk > 0.7).length
      const securityIncidents = mockData.filter(item => item.security_analysis.security_score < 0.5).length
      
      setStats({
        total_analyzed: totalAnalyzed,
        avg_quality_score: avgQuality,
        high_risk_count: highRisk,
        hallucination_alerts: hallucinationAlerts,
        security_incidents: securityIncidents
      })
    }
  }

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'MINIMAL': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
      case 'LOW': return 'bg-green-500/20 text-green-300 border-green-500/50'
      case 'MEDIUM': return 'bg-amber-500/20 text-amber-300 border-amber-500/50'
      case 'HIGH': return 'bg-orange-500/20 text-orange-300 border-orange-500/50'
      case 'CRITICAL': return 'bg-red-500/20 text-red-300 border-red-500/50'
      default: return 'bg-slate-500/20 text-slate-300 border-slate-500/50'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-500'
    if (score >= 0.6) return 'text-yellow-500'
    return 'text-red-500'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Quality & Hallucination Detection</h1>
          <p className="text-gray-600">Real-time monitoring of AI response quality and faithfulness</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={fetchQualityData} variant="outline">
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Quality Score</p>
                <p className={`text-2xl font-bold ${getScoreColor(stats.avg_quality_score)}`}>
                  {(stats.avg_quality_score * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High Risk Responses</p>
                <p className="text-2xl font-bold text-red-500">{stats.high_risk_count}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Hallucination Alerts</p>
                <p className="text-2xl font-bold text-orange-500">{stats.hallucination_alerts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Security Incidents</p>
                <p className="text-2xl font-bold text-red-600">{stats.security_incidents}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Analysis Feed */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Analysis Feed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {qualityData.map((analysis) => (
              <div key={analysis.analysis_id} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskLevelColor(analysis.risk_level)}`}>
                      {analysis.risk_level} RISK
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(analysis.timestamp).toLocaleString()}
                    </span>
                    <span className="text-sm font-medium text-gray-700">
                      {analysis.model} ({analysis.provider})
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Quality Score</p>
                      <p className={`font-bold ${getScoreColor(analysis.overall_quality_score)}`}>
                        {(analysis.overall_quality_score * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Hallucination Risk</p>
                    <p className={analysis.detailed_scores.hallucination_risk > 0.5 ? 'text-red-500' : 'text-green-500'}>
                      {(analysis.detailed_scores.hallucination_risk * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Factual Consistency</p>
                    <p className={analysis.detailed_scores.factual_consistency < 0.7 ? 'text-yellow-500' : 'text-green-500'}>
                      {(analysis.detailed_scores.factual_consistency * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Confidence</p>
                    <p>{(analysis.detailed_scores.confidence_score * 100).toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Toxicity</p>
                    <p className={analysis.detailed_scores.toxicity_score > 0.1 ? 'text-red-500' : 'text-green-500'}>
                      {(analysis.detailed_scores.toxicity_score * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Security Score</p>
                    <p className={analysis.security_analysis.security_score < 0.8 ? 'text-red-500' : 'text-green-500'}>
                      {(analysis.security_analysis.security_score * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>

                {/* Alerts Section */}
                {analysis.alerts.length > 0 && (
                  <div className="bg-red-50 p-3 rounded-md space-y-2">
                    <p className="text-sm font-medium text-red-800">Active Alerts</p>
                    {analysis.alerts.map((alert, idx) => (
                      <div key={idx} className="flex items-start space-x-2 text-sm text-red-700">
                        <span>•</span>
                        <div>
                          <span className="font-medium">{alert.message}</span>
                          <span className="block text-xs text-red-600 mt-1">Action: {alert.action_required}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
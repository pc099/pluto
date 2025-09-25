// src/components/AIQualityDashboard.tsx
'use client'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const API_BASE = 'https://pluto-backend-qprv.onrender.com'

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
    if (score >= 0.8) return 'text-emerald-400'
    if (score >= 0.6) return 'text-amber-400'
    return 'text-red-400'
  }

  const getScoreBarColor = (score: number) => {
    if (score >= 0.8) return 'bg-emerald-500'
    if (score >= 0.6) return 'bg-amber-500'
    return 'bg-red-500'
  }

  if (loading) {
    return (
      <div className="p-8 text-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-lg">Loading AI quality analysis...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 text-white">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
            AI Quality Intelligence
          </h1>
          <p className="text-slate-400">Advanced AI response analysis and risk detection</p>
        </div>
        
        <Button onClick={fetchQualityData} variant="outline" size="sm" className="bg-slate-800/50 border-slate-600 text-slate-200 hover:bg-slate-700">
          Refresh Analysis
        </Button>
      </div>

      {/* Quality Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500/30 backdrop-blur-sm hover:scale-105 transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-400">{stats.total_analyzed}</div>
                <div className="text-sm text-blue-300">Responses Analyzed</div>
              </div>
              <div className="p-3 rounded-full bg-blue-500/20">
                <span className="text-xl">🧠</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border-emerald-500/30 backdrop-blur-sm hover:scale-105 transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-emerald-400">{(stats.avg_quality_score * 100).toFixed(1)}%</div>
                <div className="text-sm text-emerald-300">Avg Quality Score</div>
              </div>
              <div className="p-3 rounded-full bg-emerald-500/20">
                <span className="text-xl">⭐</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/20 to-amber-600/20 border-amber-500/30 backdrop-blur-sm hover:scale-105 transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-amber-400">{stats.high_risk_count}</div>
                <div className="text-sm text-amber-300">High Risk Responses</div>
              </div>
              <div className="p-3 rounded-full bg-amber-500/20">
                <span className="text-xl">⚠️</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-purple-500/30 backdrop-blur-sm hover:scale-105 transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-purple-400">{stats.hallucination_alerts}</div>
                <div className="text-sm text-purple-300">Hallucination Alerts</div>
              </div>
              <div className="p-3 rounded-full bg-purple-500/20">
                <span className="text-xl">🔍</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/20 to-red-600/20 border-red-500/30 backdrop-blur-sm hover:scale-105 transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-red-400">{stats.security_incidents}</div>
                <div className="text-sm text-red-300">Security Incidents</div>
              </div>
              <div className="p-3 rounded-full bg-red-500/20">
                <span className="text-xl">🛡️</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quality Analysis Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Quality Analysis */}
        <div className="lg:col-span-2">
          <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
            <CardHeader className="border-b border-slate-700">
              <CardTitle className="text-slate-200">🔬 Recent Quality Analysis</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
                {qualityData.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <div className="text-4xl mb-4">🔬</div>
                    <div className="text-lg font-medium mb-2">No quality analysis yet</div>
                    <div className="text-sm">AI responses will be analyzed automatically</div>
                  </div>
                ) : (
                  <div className="space-y-4 p-6">
                    {qualityData.map((analysis) => (
                      <div key={analysis.analysis_id} className="border border-slate-600/50 rounded-lg p-4 bg-slate-800/30 hover:bg-slate-800/50 transition-colors">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center space-x-3">
                            <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${getRiskLevelColor(analysis.risk_level)}`}>
                              {analysis.risk_level}
                            </div>
                            <span className="text-white font-medium">{analysis.provider}</span>
                            <span className="text-slate-400 text-sm">{analysis.model}</span>
                          </div>
                          <div className="text-xs text-slate-500">
                            {new Date(analysis.timestamp).toLocaleTimeString()}
                          </div>
                        </div>

                        {/* Overall Quality Score */}
                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-slate-400">Overall Quality Score</span>
                            <span className={`font-bold ${getScoreColor(analysis.overall_quality_score)}`}>
                              {(analysis.overall_quality_score * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-700 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-500 ${getScoreBarColor(analysis.overall_quality_score)}`}
                              style={{ width: `${analysis.overall_quality_score * 100}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Detailed Scores */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-400">Hallucination Risk</span>
                              <span className={getScoreColor(1 - analysis.detailed_scores.hallucination_risk)}>
                                {((1 - analysis.detailed_scores.hallucination_risk) * 100).toFixed(0)}%
                              </span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-400">Confidence</span>
                              <span className={getScoreColor(analysis.detailed_scores.confidence_score)}>
                                {(analysis.detailed_scores.confidence_score * 100).toFixed(0)}%
                              </span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-400">Consistency</span>
                              <span className={getScoreColor(analysis.detailed_scores.factual_consistency)}>
                                {(analysis.detailed_scores.factual_consistency * 100).toFixed(0)}%
                              </span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-400">Security Score</span>
                              <span className={getScoreColor(analysis.security_analysis.security_score)}>
                                {(analysis.security_analysis.security_score * 100).toFixed(0)}%
                              </span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-400">Toxicity</span>
                              <span className={getScoreColor(1 - analysis.detailed_scores.toxicity_score)}>
                                {((1 - analysis.detailed_scores.toxicity_score) * 100).toFixed(0)}%
                              </span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-400">Bias</span>
                              <span className={getScoreColor(1 - analysis.detailed_scores.bias_score)}>
                                {((1 - analysis.detailed_scores.bias_score) * 100).toFixed(0)}%
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Security Alerts */}
                        {(analysis.security_analysis.prompt_injection_detected || 
                          analysis.security_analysis.data_extraction_attempt || 
                          analysis.security_analysis.malicious_request) && (
                          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 mb-3">
                            <div className="text-red-400 text-sm font-semibold mb-1">Security Alert</div>
                            {analysis.security_analysis.prompt_injection_detected && (
                              <div className="text-red-300 text-xs">⚠️ Prompt injection detected</div>
                            )}
                            {analysis.security_analysis.data_extraction_attempt && (
                              <div className="text-red-300 text-xs">⚠️ Data extraction attempt</div>
                            )}
                            {analysis.security_analysis.malicious_request && (
                              <div className="text-red-300 text-xs">⚠️ Malicious request detected</div>
                            )}
                          </div>
                        )}

                        {/* Recommendations */}
                        {analysis.recommendations.length > 0 && (
                          <div className="text-xs">
                            <div className="text-slate-400 mb-1">Recommendations:</div>
                            <ul className="text-slate-300 space-y-1">
                              {analysis.recommendations.slice(0, 2).map((rec, idx) => (
                                <li key={idx} className="flex items-start space-x-2">
                                  <span className="text-blue-400">•</span>
                                  <span>{rec}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quality Trends & Alerts */}
        <div className="space-y-6">
          {/* Quality Trends */}
          <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
            <CardHeader className="border-b border-slate-700">
              <CardTitle className="text-slate-200">📈 Quality Trends</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Average Quality</span>
                  <span className="text-emerald-400 font-bold">
                    {(stats.avg_quality_score * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Risk Distribution</span>
                  <div className="flex space-x-1">
                    <div className="w-3 h-3 bg-emerald-500 rounded"></div>
                    <div className="w-3 h-3 bg-amber-500 rounded"></div>
                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                  </div>
                </div>
                <div className="text-xs text-slate-500">
                  Quality monitoring active across all AI interactions
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Monitoring */}
          <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
            <CardHeader className="border-b border-slate-700">
              <CardTitle className="text-slate-200">🔍 Active Monitoring</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Hallucination Detection</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    <span className="text-emerald-400 text-sm">Active</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Security Scanning</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    <span className="text-emerald-400 text-sm">Active</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Bias Detection</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    <span className="text-emerald-400 text-sm">Active</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Quality Scoring</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    <span className="text-emerald-400 text-sm">Active</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
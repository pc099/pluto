// src/components/PolicyManagementDashboard.tsx
'use client'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'

const API_BASE = 'http://localhost:8000'

interface Policy {
  id: string
  name: string
  type: string
  action: string
  active: boolean
  created_at: string
  budget_limit?: number
  time_window?: string
  scope?: string
  blocked_patterns?: string[]
  blocked_keywords?: string[]
  allowed_users?: string[]
  blocked_users?: string[]
  allowed_teams?: string[]
  blocked_teams?: string[]
  blocked_models?: string[]
  allowed_models?: string[]
  max_tokens?: number
  allowed_hours?: number[]
  blocked_days?: string[]
}

interface PolicyFormData {
  name: string
  type: string
  action: string
  budget_limit: string
  time_window: string
  scope: string
  blocked_patterns: string
  blocked_keywords: string
  allowed_users: string
  blocked_users: string
  allowed_teams: string
  blocked_teams: string
  blocked_models: string
  allowed_models: string
  max_tokens: string
  allowed_hours: string
  blocked_days: string
}

const initialFormData: PolicyFormData = {
  name: '',
  type: 'content',
  action: 'warn',
  budget_limit: '',
  time_window: 'daily',
  scope: 'user',
  blocked_patterns: '',
  blocked_keywords: '',
  allowed_users: '',
  blocked_users: '',
  allowed_teams: '',
  blocked_teams: '',
  blocked_models: '',
  allowed_models: '',
  max_tokens: '',
  allowed_hours: '',
  blocked_days: ''
}

export default function PolicyManagementDashboard() {
  const [policies, setPolicies] = useState<Policy[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState<PolicyFormData>(initialFormData)
  const [testResult, setTestResult] = useState<any>(null)

  useEffect(() => {
    fetchPolicies()
  }, [])

  const fetchPolicies = async () => {
    try {
      const response = await fetch(`${API_BASE}/policies`)
      const data = await response.json()
      setPolicies(data.policies || [])
    } catch (error) {
      console.error('Failed to fetch policies:', error)
    } finally {
      setLoading(false)
    }
  }

  const createPolicy = async () => {
    try {
      const policyData: any = {
        name: formData.name,
        type: formData.type,
        action: formData.action
      }

      // Add type-specific fields
      if (formData.type === 'budget') {
        if (formData.budget_limit) policyData.budget_limit = parseFloat(formData.budget_limit)
        policyData.time_window = formData.time_window
        policyData.scope = formData.scope
      } else if (formData.type === 'content') {
        if (formData.blocked_patterns) {
          policyData.blocked_patterns = formData.blocked_patterns.split(',').map(p => p.trim())
        }
        if (formData.blocked_keywords) {
          policyData.blocked_keywords = formData.blocked_keywords.split(',').map(k => k.trim())
        }
      } else if (formData.type === 'user') {
        if (formData.allowed_users) {
          policyData.allowed_users = formData.allowed_users.split(',').map(u => u.trim())
        }
        if (formData.blocked_users) {
          policyData.blocked_users = formData.blocked_users.split(',').map(u => u.trim())
        }
        if (formData.allowed_teams) {
          policyData.allowed_teams = formData.allowed_teams.split(',').map(t => t.trim())
        }
        if (formData.blocked_teams) {
          policyData.blocked_teams = formData.blocked_teams.split(',').map(t => t.trim())
        }
      } else if (formData.type === 'model') {
        if (formData.blocked_models) {
          policyData.blocked_models = formData.blocked_models.split(',').map(m => m.trim())
        }
        if (formData.allowed_models) {
          policyData.allowed_models = formData.allowed_models.split(',').map(m => m.trim())
        }
        if (formData.max_tokens) {
          policyData.max_tokens = parseInt(formData.max_tokens)
        }
      } else if (formData.type === 'time') {
        if (formData.allowed_hours) {
          policyData.allowed_hours = formData.allowed_hours.split(',').map(h => parseInt(h.trim()))
        }
        if (formData.blocked_days) {
          policyData.blocked_days = formData.blocked_days.split(',').map(d => d.trim().toLowerCase())
        }
      }

      const response = await fetch(`${API_BASE}/policies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(policyData)
      })

      const result = await response.json()
      if (result.success) {
        setFormData(initialFormData)
        setShowCreateForm(false)
        fetchPolicies()
      } else {
        alert('Failed to create policy: ' + (result.error || 'Unknown error'))
      }
    } catch (error) {
      alert('Error creating policy: ' + error.message)
    }
  }

  const deletePolicy = async (policyId: string) => {
    if (!confirm('Are you sure you want to delete this policy?')) return

    try {
      const response = await fetch(`${API_BASE}/policies/${policyId}`, {
        method: 'DELETE'
      })

      const result = await response.json()
      if (result.success) {
        fetchPolicies()
      } else {
        alert('Failed to delete policy')
      }
    } catch (error) {
      alert('Error deleting policy: ' + error.message)
    }
  }

  const testPolicy = async () => {
    try {
      const testData = {
        user_id: 'test-user',
        team_id: 'engineering',
        ai_request: {
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: 'Test message with password secret123 and email test@company.com' }]
        },
        estimated_cost: 0.01
      }

      const response = await fetch(`${API_BASE}/policies/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testData)
      })

      const result = await response.json()
      setTestResult(result)
    } catch (error) {
      alert('Error testing policies: ' + error.message)
    }
  }

  const renderPolicyDetails = (policy: Policy) => {
    const details = []

    if (policy.budget_limit) details.push(`Budget: $${policy.budget_limit}`)
    if (policy.blocked_keywords?.length) details.push(`Keywords: ${policy.blocked_keywords.join(', ')}`)
    if (policy.blocked_patterns?.length) details.push(`Patterns: ${policy.blocked_patterns.length} regex`)
    if (policy.blocked_models?.length) details.push(`Models: ${policy.blocked_models.join(', ')}`)
    if (policy.allowed_hours?.length) details.push(`Hours: ${policy.allowed_hours.join(', ')}`)
    if (policy.blocked_days?.length) details.push(`Blocked days: ${policy.blocked_days.join(', ')}`)
    if (policy.max_tokens) details.push(`Max tokens: ${policy.max_tokens}`)

    return details.join(' • ')
  }

  const getPolicyTypeColor = (type: string) => {
    switch (type) {
      case 'budget': return 'bg-green-100 text-green-800'
      case 'content': return 'bg-red-100 text-red-800'
      case 'user': return 'bg-blue-100 text-blue-800'
      case 'model': return 'bg-purple-100 text-purple-800'
      case 'time': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'block': return 'bg-red-500 text-white'
      case 'warn': return 'bg-yellow-500 text-white'
      case 'allow': return 'bg-green-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  if (loading) {
    return <div className="p-8">Loading policies...</div>
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">⚙️ Policy Management</h1>
          <p className="text-gray-600">Create and manage AI usage policies</p>
        </div>
        
        <div className="flex space-x-2">
          <Button onClick={testPolicy} variant="outline">
            Test Policies
          </Button>
          <Button onClick={() => setShowCreateForm(!showCreateForm)}>
            {showCreateForm ? 'Cancel' : 'Create Policy'}
          </Button>
        </div>
      </div>

      {/* Test Result */}
      {testResult && (
        <Card>
          <CardHeader>
            <CardTitle>Policy Test Result</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`p-3 rounded ${testResult.allowed ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className="font-medium">
                Action: <span className={`px-2 py-1 rounded text-sm ${getActionColor(testResult.action)}`}>
                  {testResult.action}
                </span>
              </div>
              <div className="mt-2">
                <strong>Allowed:</strong> {testResult.allowed ? 'Yes' : 'No'}
              </div>
              {testResult.violations?.length > 0 && (
                <div className="mt-2">
                  <strong>Violations:</strong>
                  <ul className="list-disc list-inside mt-1">
                    {testResult.violations.map((violation: any, index: number) => (
                      <li key={index} className="text-sm">
                        {violation.type}: {violation.message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Policy Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Policy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Policy Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Block Sensitive Data"
                />
              </div>

              <div>
                <Label htmlFor="type">Policy Type</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="content">Content Filtering</SelectItem>
                    <SelectItem value="budget">Budget Limits</SelectItem>
                    <SelectItem value="user">User/Team Access</SelectItem>
                    <SelectItem value="model">Model Restrictions</SelectItem>
                    <SelectItem value="time">Time-based Rules</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="action">Action</Label>
                <Select value={formData.action} onValueChange={(value) => setFormData(prev => ({ ...prev, action: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="warn">Warn</SelectItem>
                    <SelectItem value="block">Block</SelectItem>
                    <SelectItem value="allow">Allow</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Type-specific fields */}
            {formData.type === 'content' && (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="blocked_keywords">Blocked Keywords (comma-separated)</Label>
                  <Input
                    id="blocked_keywords"
                    value={formData.blocked_keywords}
                    onChange={(e) => setFormData(prev => ({ ...prev, blocked_keywords: e.target.value }))}
                    placeholder="password, secret, ssn, credit card"
                  />
                </div>
                <div>
                  <Label htmlFor="blocked_patterns">Blocked Regex Patterns (comma-separated)</Label>
                  <Textarea
                    id="blocked_patterns"
                    value={formData.blocked_patterns}
                    onChange={(e) => setFormData(prev => ({ ...prev, blocked_patterns: e.target.value }))}
                    placeholder="\\b\\d{3}-\\d{2}-\\d{4}\\b, \\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b"
                    rows={3}
                  />
                </div>
              </div>
            )}

            {formData.type === 'budget' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="budget_limit">Budget Limit ($)</Label>
                  <Input
                    id="budget_limit"
                    type="number"
                    step="0.01"
                    value={formData.budget_limit}
                    onChange={(e) => setFormData(prev => ({ ...prev, budget_limit: e.target.value }))}
                    placeholder="10.00"
                  />
                </div>
                <div>
                  <Label htmlFor="time_window">Time Window</Label>
                  <Select value={formData.time_window} onValueChange={(value) => setFormData(prev => ({ ...prev, time_window: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="scope">Scope</Label>
                  <Select value={formData.scope} onValueChange={(value) => setFormData(prev => ({ ...prev, scope: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">Per User</SelectItem>
                      <SelectItem value="team">Per Team</SelectItem>
                      <SelectItem value="global">Global</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {formData.type === 'model' && (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="blocked_models">Blocked Models (comma-separated)</Label>
                  <Input
                    id="blocked_models"
                    value={formData.blocked_models}
                    onChange={(e) => setFormData(prev => ({ ...prev, blocked_models: e.target.value }))}
                    placeholder="gpt-4, claude-3-opus-20240229"
                  />
                </div>
                <div>
                  <Label htmlFor="max_tokens">Max Tokens</Label>
                  <Input
                    id="max_tokens"
                    type="number"
                    value={formData.max_tokens}
                    onChange={(e) => setFormData(prev => ({ ...prev, max_tokens: e.target.value }))}
                    placeholder="1000"
                  />
                </div>
              </div>
            )}

            {formData.type === 'user' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="allowed_users">Allowed Users (comma-separated)</Label>
                  <Input
                    id="allowed_users"
                    value={formData.allowed_users}
                    onChange={(e) => setFormData(prev => ({ ...prev, allowed_users: e.target.value }))}
                    placeholder="john-doe, jane-smith"
                  />
                </div>
                <div>
                  <Label htmlFor="blocked_users">Blocked Users (comma-separated)</Label>
                  <Input
                    id="blocked_users"
                    value={formData.blocked_users}
                    onChange={(e) => setFormData(prev => ({ ...prev, blocked_users: e.target.value }))}
                    placeholder="temp-user, contractor-x"
                  />
                </div>
                <div>
                  <Label htmlFor="allowed_teams">Allowed Teams (comma-separated)</Label>
                  <Input
                    id="allowed_teams"
                    value={formData.allowed_teams}
                    onChange={(e) => setFormData(prev => ({ ...prev, allowed_teams: e.target.value }))}
                    placeholder="engineering, marketing"
                  />
                </div>
                <div>
                  <Label htmlFor="blocked_teams">Blocked Teams (comma-separated)</Label>
                  <Input
                    id="blocked_teams"
                    value={formData.blocked_teams}
                    onChange={(e) => setFormData(prev => ({ ...prev, blocked_teams: e.target.value }))}
                    placeholder="contractors, interns"
                  />
                </div>
              </div>
            )}

            {formData.type === 'time' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="allowed_hours">Allowed Hours (comma-separated, 0-23)</Label>
                  <Input
                    id="allowed_hours"
                    value={formData.allowed_hours}
                    onChange={(e) => setFormData(prev => ({ ...prev, allowed_hours: e.target.value }))}
                    placeholder="9,10,11,12,13,14,15,16,17"
                  />
                </div>
                <div>
                  <Label htmlFor="blocked_days">Blocked Days (comma-separated)</Label>
                  <Input
                    id="blocked_days"
                    value={formData.blocked_days}
                    onChange={(e) => setFormData(prev => ({ ...prev, blocked_days: e.target.value }))}
                    placeholder="saturday, sunday"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
              <Button onClick={createPolicy}>
                Create Policy
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Existing Policies */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Active Policies ({policies.length})</h2>
        
        {policies.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-500">No policies created yet. Click "Create Policy" to get started!</p>
            </CardContent>
          </Card>
        ) : (
          policies.map((policy) => (
            <Card key={policy.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-lg">{policy.name}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getPolicyTypeColor(policy.type)}`}>
                        {policy.type}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getActionColor(policy.action)}`}>
                        {policy.action}
                      </span>
                      {policy.active && (
                        <span className="px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-800">
                          Active
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      {renderPolicyDetails(policy)}
                    </p>
                    
                    <p className="text-xs text-gray-500">
                      Created: {new Date(policy.created_at).toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => deletePolicy(policy.id)}
                    >
                      Delete
                    </Button>
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
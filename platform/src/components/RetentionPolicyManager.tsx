'use client'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Clock, 
  Trash2, 
  Archive, 
  Shield,
  Plus,
  Edit,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Database
} from 'lucide-react'

interface RetentionPolicy {
  id: string
  name: string
  data_type: 'request_logs' | 'user_data' | 'analytics' | 'audit_logs' | 'pii_data'
  retention_period_days: number
  auto_delete: boolean
  archive_before_delete: boolean
  archive_location: string
  legal_hold_override: boolean
  created_at: string
  last_run: string | null
  items_deleted: number
}

interface DataAgeStats {
  data_type: string
  total_items: number
  items_expiring_soon: number
  items_expired: number
  oldest_item_age_days: number
  average_age_days: number
}

export default function RetentionPolicyManager() {
  const [policies, setPolicies] = useState<RetentionPolicy[]>([])
  const [dataStats, setDataStats] = useState<DataAgeStats[]>([])
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [loading, setLoading] = useState(false)
  const [newPolicy, setNewPolicy] = useState({
    name: '',
    data_type: 'request_logs' as const,
    retention_period_days: 90,
    auto_delete: true,
    archive_before_delete: false
  })

  useEffect(() => {
    loadPolicies()
    loadDataStats()
  }, [])

  const loadPolicies = () => {
    // Mock data - replace with API call
    const mockPolicies: RetentionPolicy[] = [
      {
        id: '1',
        name: 'Request Logs - 90 Days',
        data_type: 'request_logs',
        retention_period_days: 90,
        auto_delete: true,
        archive_before_delete: true,
        archive_location: 's3://pluto-archives/request-logs',
        legal_hold_override: false,
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        last_run: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        items_deleted: 1247
      },
      {
        id: '2',
        name: 'PII Data - 30 Days',
        data_type: 'pii_data',
        retention_period_days: 30,
        auto_delete: true,
        archive_before_delete: false,
        archive_location: '',
        legal_hold_override: false,
        created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        last_run: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        items_deleted: 456
      },
      {
        id: '3',
        name: 'Audit Logs - 7 Years (SOC 2)',
        data_type: 'audit_logs',
        retention_period_days: 2555, // 7 years
        auto_delete: false,
        archive_before_delete: true,
        archive_location: 's3://pluto-archives/audit-logs',
        legal_hold_override: true,
        created_at: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
        last_run: null,
        items_deleted: 0
      }
    ]
    setPolicies(mockPolicies)
  }

  const loadDataStats = () => {
    // Mock data - replace with API call
    const mockStats: DataAgeStats[] = [
      {
        data_type: 'request_logs',
        total_items: 125847,
        items_expiring_soon: 3421,
        items_expired: 1247,
        oldest_item_age_days: 120,
        average_age_days: 45
      },
      {
        data_type: 'pii_data',
        total_items: 8934,
        items_expiring_soon: 234,
        items_expired: 456,
        oldest_item_age_days: 45,
        average_age_days: 15
      },
      {
        data_type: 'analytics',
        total_items: 45678,
        items_expiring_soon: 1234,
        items_expired: 0,
        oldest_item_age_days: 365,
        average_age_days: 120
      }
    ]
    setDataStats(mockStats)
  }

  const handleCreatePolicy = () => {
    const policy: RetentionPolicy = {
      id: `policy_${Date.now()}`,
      name: newPolicy.name,
      data_type: newPolicy.data_type,
      retention_period_days: newPolicy.retention_period_days,
      auto_delete: newPolicy.auto_delete,
      archive_before_delete: newPolicy.archive_before_delete,
      archive_location: newPolicy.archive_before_delete ? 's3://pluto-archives/' + newPolicy.data_type : '',
      legal_hold_override: false,
      created_at: new Date().toISOString(),
      last_run: null,
      items_deleted: 0
    }
    
    setPolicies([...policies, policy])
    setShowCreateDialog(false)
    setNewPolicy({
      name: '',
      data_type: 'request_logs',
      retention_period_days: 90,
      auto_delete: true,
      archive_before_delete: false
    })
  }

  const handleRunPolicy = (policyId: string) => {
    // Mock execution - replace with API call
    setPolicies(policies.map(p => 
      p.id === policyId 
        ? { ...p, last_run: new Date().toISOString(), items_deleted: p.items_deleted + Math.floor(Math.random() * 100) }
        : p
    ))
  }

  const handleDeletePolicy = (policyId: string) => {
    setPolicies(policies.filter(p => p.id !== policyId))
  }

  const getDataTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      request_logs: 'Request Logs',
      user_data: 'User Data',
      analytics: 'Analytics Data',
      audit_logs: 'Audit Logs',
      pii_data: 'PII Data'
    }
    return labels[type] || type
  }

  const getDataTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      request_logs: 'bg-blue-100 text-blue-800',
      user_data: 'bg-purple-100 text-purple-800',
      analytics: 'bg-green-100 text-green-800',
      audit_logs: 'bg-orange-100 text-orange-800',
      pii_data: 'bg-red-100 text-red-800'
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Data Retention Policies</h1>
          <p className="text-gray-600 mt-2">Automated data lifecycle management and compliance</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Policy
        </Button>
      </div>

      {/* Data Age Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {dataStats.map((stat) => (
          <Card key={stat.data_type}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                <span>{getDataTypeLabel(stat.data_type)}</span>
                <Badge className={getDataTypeColor(stat.data_type)}>
                  {stat.total_items.toLocaleString()} items
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Expiring Soon:</span>
                <span className="font-semibold text-yellow-600">{stat.items_expiring_soon}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Expired:</span>
                <span className="font-semibold text-red-600">{stat.items_expired}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Avg Age:</span>
                <span className="font-semibold">{stat.average_age_days} days</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Oldest:</span>
                <span className="font-semibold">{stat.oldest_item_age_days} days</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Active Policies */}
      <Card>
        <CardHeader>
          <CardTitle>Active Retention Policies</CardTitle>
          <CardDescription>Manage automated data deletion and archival policies</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {policies.map((policy) => (
              <div key={policy.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold text-lg">{policy.name}</h3>
                      <Badge className={getDataTypeColor(policy.data_type)}>
                        {getDataTypeLabel(policy.data_type)}
                      </Badge>
                      {policy.auto_delete && (
                        <Badge className="bg-green-100 text-green-800">Auto-Delete</Badge>
                      )}
                      {policy.archive_before_delete && (
                        <Badge className="bg-blue-100 text-blue-800">Archive</Badge>
                      )}
                      {policy.legal_hold_override && (
                        <Badge className="bg-orange-100 text-orange-800">Legal Hold</Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Retention Period</p>
                        <p className="font-semibold">{policy.retention_period_days} days</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Last Run</p>
                        <p className="font-semibold">{formatDate(policy.last_run)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Items Deleted</p>
                        <p className="font-semibold">{policy.items_deleted.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Created</p>
                        <p className="font-semibold">{formatDate(policy.created_at)}</p>
                      </div>
                    </div>
                    {policy.archive_before_delete && (
                      <div className="mt-2 text-sm">
                        <p className="text-gray-600">Archive Location:</p>
                        <p className="font-mono text-xs">{policy.archive_location}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <Button size="sm" variant="outline" onClick={() => handleRunPolicy(policy.id)}>
                      <Clock className="h-3 w-3 mr-1" />
                      Run Now
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleDeletePolicy(policy.id)}
                      disabled={policy.legal_hold_override}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Scheduled Deletions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-purple-600" />
            Upcoming Scheduled Deletions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-semibold">Request Logs Cleanup</p>
                  <p className="text-sm text-gray-600">1,247 items scheduled for deletion</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">Tomorrow, 2:00 AM</p>
                <p className="text-xs text-gray-600">Policy: Request Logs - 90 Days</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="font-semibold">PII Data Cleanup</p>
                  <p className="text-sm text-gray-600">456 items scheduled for deletion</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">In 3 hours</p>
                <p className="text-xs text-gray-600">Policy: PII Data - 30 Days</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create Policy Dialog */}
      {showCreateDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full">
            <CardHeader>
              <CardTitle>Create Retention Policy</CardTitle>
              <CardDescription>Define automated data lifecycle rules</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Policy Name</label>
                <Input
                  placeholder="e.g., Request Logs - 90 Days"
                  value={newPolicy.name}
                  onChange={(e) => setNewPolicy({ ...newPolicy, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Data Type</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={newPolicy.data_type}
                  onChange={(e) => setNewPolicy({ ...newPolicy, data_type: e.target.value as any })}
                >
                  <option value="request_logs">Request Logs</option>
                  <option value="user_data">User Data</option>
                  <option value="analytics">Analytics Data</option>
                  <option value="audit_logs">Audit Logs</option>
                  <option value="pii_data">PII Data</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Retention Period (Days)</label>
                <Input
                  type="number"
                  value={newPolicy.retention_period_days}
                  onChange={(e) => setNewPolicy({ ...newPolicy, retention_period_days: parseInt(e.target.value) })}
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="auto_delete"
                  checked={newPolicy.auto_delete}
                  onChange={(e) => setNewPolicy({ ...newPolicy, auto_delete: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="auto_delete" className="text-sm">Enable automatic deletion</label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="archive"
                  checked={newPolicy.archive_before_delete}
                  onChange={(e) => setNewPolicy({ ...newPolicy, archive_before_delete: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="archive" className="text-sm">Archive before deletion</label>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreatePolicy} disabled={!newPolicy.name}>
                  Create Policy
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

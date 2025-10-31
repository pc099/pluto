'use client'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Download, 
  Trash2, 
  FileText, 
  Shield, 
  CheckCircle,
  Clock,
  AlertCircle,
  Info,
  User as UserIcon
} from 'lucide-react'
import { User } from '@/lib/auth'

interface DataRightsPortalProps {
  user: User | null
}

interface DataRequest {
  id: string
  type: 'export' | 'delete' | 'access'
  status: 'pending' | 'processing' | 'completed' | 'failed'
  requested_at: string
  completed_at: string | null
  deadline: string
  download_url: string | null
}

export default function DataRightsPortal({ user }: DataRightsPortalProps) {
  const [requests, setRequests] = useState<DataRequest[]>([])
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleExportData = async () => {
    setLoading(true)
    // Mock API call - replace with actual implementation
    const newRequest: DataRequest = {
      id: `req_${Date.now()}`,
      type: 'export',
      status: 'processing',
      requested_at: new Date().toISOString(),
      completed_at: null,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      download_url: null
    }
    
    setRequests([newRequest, ...requests])
    setShowExportDialog(false)
    setLoading(false)
    
    // Simulate processing
    setTimeout(() => {
      setRequests(prev => prev.map(req => 
        req.id === newRequest.id 
          ? { ...req, status: 'completed', completed_at: new Date().toISOString(), download_url: '/downloads/user-data.zip' }
          : req
      ))
    }, 3000)
  }

  const handleDeleteData = async () => {
    setLoading(true)
    // Mock API call - replace with actual implementation
    const newRequest: DataRequest = {
      id: `req_${Date.now()}`,
      type: 'delete',
      status: 'pending',
      requested_at: new Date().toISOString(),
      completed_at: null,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      download_url: null
    }
    
    setRequests([newRequest, ...requests])
    setShowDeleteDialog(false)
    setLoading(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'processing': return <Clock className="h-4 w-4 text-blue-500 animate-spin" />
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-500" />
      default: return null
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      case 'processing': return <Badge className="bg-blue-100 text-blue-800">Processing</Badge>
      case 'pending': return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case 'failed': return <Badge className="bg-red-100 text-red-800">Failed</Badge>
      default: return null
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getDaysRemaining = (deadline: string) => {
    const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    return days
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Data Rights Portal</h1>
        <p className="text-gray-600 mt-2">Manage your personal data in compliance with GDPR, CCPA, and other privacy regulations</p>
      </div>

      {/* User Info */}
      <Card className="border-2 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center">
            <UserIcon className="h-5 w-5 mr-2 text-purple-600" />
            Your Account
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">User ID</p>
              <p className="font-mono text-sm">{user?.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Account Created</p>
              <p className="font-medium">{user?.created_at ? formatDate(user.created_at) : 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Data Quota</p>
              <p className="font-medium">{user?.quota_used.toLocaleString()} / {user?.quota_limit.toLocaleString()} requests</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Your Rights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Right to Access / Export */}
        <Card className="border-2 hover:border-blue-300 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Download className="h-5 w-5 mr-2 text-blue-600" />
              Right to Access (GDPR Article 15)
            </CardTitle>
            <CardDescription>
              Download a copy of all your personal data we have stored
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-sm text-blue-900 mb-2">What you&apos;ll receive:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• All your request logs</li>
                <li>• User profile information</li>
                <li>• API usage data</li>
                <li>• Consent records</li>
                <li>• Audit trail</li>
              </ul>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Info className="h-4 w-4" />
              <span>We have 30 days to fulfill your request</span>
            </div>
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={() => setShowExportDialog(true)}
            >
              <Download className="h-4 w-4 mr-2" />
              Request Data Export
            </Button>
          </CardContent>
        </Card>

        {/* Right to Erasure */}
        <Card className="border-2 hover:border-red-300 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Trash2 className="h-5 w-5 mr-2 text-red-600" />
              Right to Erasure (GDPR Article 17)
            </CardTitle>
            <CardDescription>
              Request permanent deletion of all your personal data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-sm text-red-900 mb-2">What will be deleted:</h4>
              <ul className="text-sm text-red-800 space-y-1">
                <li>• All request logs</li>
                <li>• User profile</li>
                <li>• API keys</li>
                <li>• Analytics data</li>
                <li>• Cached responses</li>
              </ul>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span>This action cannot be undone</span>
            </div>
            <Button 
              variant="destructive"
              className="w-full"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Request Data Deletion
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Additional Rights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2 text-purple-600" />
            Additional Rights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Right to Rectification</h4>
              <p className="text-sm text-gray-600 mb-3">Correct inaccurate personal data</p>
              <Button variant="outline" size="sm" className="w-full">
                Update Profile
              </Button>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Right to Portability</h4>
              <p className="text-sm text-gray-600 mb-3">Transfer data to another service</p>
              <Button variant="outline" size="sm" className="w-full">
                Export (JSON)
              </Button>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Right to Object</h4>
              <p className="text-sm text-gray-600 mb-3">Object to data processing</p>
              <Button variant="outline" size="sm" className="w-full">
                Manage Consent
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Request History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2 text-gray-600" />
            Request History
          </CardTitle>
          <CardDescription>Track the status of your data rights requests</CardDescription>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No requests yet</h3>
              <p className="text-gray-600">Your data rights requests will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div key={request.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {getStatusIcon(request.status)}
                        <h4 className="font-semibold capitalize">{request.type} Request</h4>
                        {getStatusBadge(request.status)}
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>Request ID: <span className="font-mono">{request.id}</span></p>
                        <p>Requested: {formatDate(request.requested_at)}</p>
                        {request.completed_at && (
                          <p>Completed: {formatDate(request.completed_at)}</p>
                        )}
                        {request.status === 'pending' || request.status === 'processing' ? (
                          <p className="text-yellow-600">
                            Deadline: {formatDate(request.deadline)} ({getDaysRemaining(request.deadline)} days remaining)
                          </p>
                        ) : null}
                      </div>
                    </div>
                    {request.status === 'completed' && request.download_url && (
                      <Button size="sm">
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Export Dialog */}
      {showExportDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-lg w-full">
            <CardHeader>
              <CardTitle>Confirm Data Export</CardTitle>
              <CardDescription>
                We&apos;ll prepare a complete export of your personal data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  Your data will be compiled into a downloadable ZIP file containing all your personal information in JSON format. This process typically takes a few minutes.
                </p>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowExportDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleExportData} disabled={loading}>
                  {loading ? 'Processing...' : 'Confirm Export'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-lg w-full border-2 border-red-300">
            <CardHeader>
              <CardTitle className="text-red-600">Confirm Data Deletion</CardTitle>
              <CardDescription>
                This action cannot be undone. All your data will be permanently deleted.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-sm text-red-900 mb-2">⚠️ Warning:</h4>
                <ul className="text-sm text-red-800 space-y-1">
                  <li>• Your account will be closed</li>
                  <li>• All API keys will be revoked</li>
                  <li>• Request history will be deleted</li>
                  <li>• This cannot be reversed</li>
                </ul>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-900">
                  <strong>Note:</strong> We may retain some data for legal compliance (e.g., financial records for tax purposes) as required by law.
                </p>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDeleteData} disabled={loading}>
                  {loading ? 'Processing...' : 'Confirm Deletion'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

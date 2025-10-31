'use client'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  FileText, 
  Download, 
  Calendar,
  Clock,
  Shield,
  Plus,
  Eye,
  Mail,
  RefreshCw
} from 'lucide-react'

interface ComplianceReport {
  id: string
  name: string
  framework: 'gdpr' | 'hipaa' | 'soc2' | 'iso27001' | 'custom'
  status: 'generating' | 'completed' | 'failed'
  generated_at: string
  generated_by: string
  file_size: string
  download_url: string
  sections_included: string[]
}

interface ReportTemplate {
  id: string
  name: string
  framework: string
  description: string
  sections: string[]
}

export default function ComplianceReportBuilder() {
  const [reports, setReports] = useState<ComplianceReport[]>([])
  const [templates, setTemplates] = useState<ReportTemplate[]>([])
  const [showGenerateDialog, setShowGenerateDialog] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadReports()
    loadTemplates()
  }, [])

  const loadReports = () => {
    // Mock data
    const mockReports: ComplianceReport[] = [
      {
        id: 'report_1',
        name: 'GDPR Compliance Report - Q4 2024',
        framework: 'gdpr',
        status: 'completed',
        generated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        generated_by: 'Demo User',
        file_size: '2.4 MB',
        download_url: '/reports/gdpr-q4-2024.pdf',
        sections_included: ['Data Processing Activities', 'Consent Records', 'Data Subject Requests', 'Violations']
      },
      {
        id: 'report_2',
        name: 'SOC 2 Audit Report - 2024',
        framework: 'soc2',
        status: 'completed',
        generated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        generated_by: 'Demo User',
        file_size: '5.1 MB',
        download_url: '/reports/soc2-2024.pdf',
        sections_included: ['Security Controls', 'Access Management', 'Audit Logs', 'Incident Reports']
      },
      {
        id: 'report_3',
        name: 'HIPAA Compliance Report - October 2024',
        framework: 'hipaa',
        status: 'generating',
        generated_at: new Date().toISOString(),
        generated_by: 'Demo User',
        file_size: '-',
        download_url: '',
        sections_included: ['PHI Access Logs', 'Encryption Status', 'Business Associates']
      }
    ]
    setReports(mockReports)
  }

  const loadTemplates = () => {
    const mockTemplates: ReportTemplate[] = [
      {
        id: 'gdpr',
        name: 'GDPR Compliance Report',
        framework: 'GDPR',
        description: 'Complete GDPR compliance documentation including data processing, consent, and data subject rights',
        sections: [
          'Data Processing Activities',
          'Legal Basis for Processing',
          'Consent Records',
          'Data Subject Requests',
          'Data Retention Policies',
          'Violations and Remediation',
          'Third-Party Processors',
          'Cross-Border Transfers'
        ]
      },
      {
        id: 'hipaa',
        name: 'HIPAA Compliance Report',
        framework: 'HIPAA',
        description: 'HIPAA compliance report covering PHI protection, access controls, and security measures',
        sections: [
          'PHI Access Logs',
          'Encryption Status',
          'Access Controls',
          'Audit Trail',
          'Business Associate Agreements',
          'Incident Reports',
          'Training Records',
          'Risk Assessments'
        ]
      },
      {
        id: 'soc2',
        name: 'SOC 2 Compliance Report',
        framework: 'SOC 2',
        description: 'SOC 2 Type II compliance report with security, availability, and confidentiality controls',
        sections: [
          'Security Controls',
          'Access Management',
          'Change Management',
          'Incident Response',
          'Monitoring and Logging',
          'Vendor Management',
          'Data Backup and Recovery',
          'Compliance Metrics'
        ]
      },
      {
        id: 'iso27001',
        name: 'ISO 27001 Compliance Report',
        framework: 'ISO 27001',
        description: 'ISO 27001 information security management system compliance report',
        sections: [
          'Information Security Policy',
          'Risk Assessment',
          'Asset Management',
          'Access Control',
          'Cryptography',
          'Physical Security',
          'Operations Security',
          'Incident Management'
        ]
      }
    ]
    setTemplates(mockTemplates)
  }

  const handleGenerateReport = () => {
    const template = templates.find(t => t.id === selectedTemplate)
    if (!template) return

    setLoading(true)
    const newReport: ComplianceReport = {
      id: `report_${Date.now()}`,
      name: `${template.name} - ${new Date().toLocaleDateString()}`,
      framework: selectedTemplate as 'gdpr' | 'hipaa' | 'soc2' | 'iso27001' | 'custom',
      status: 'generating',
      generated_at: new Date().toISOString(),
      generated_by: 'Demo User',
      file_size: '-',
      download_url: '',
      sections_included: template.sections
    }

    setReports([newReport, ...reports])
    setShowGenerateDialog(false)
    setLoading(false)

    // Simulate generation
    setTimeout(() => {
      setReports(prev => prev.map(r => 
        r.id === newReport.id 
          ? { ...r, status: 'completed', file_size: '3.2 MB', download_url: '/reports/generated.pdf' }
          : r
      ))
    }, 3000)
  }

  const getFrameworkColor = (framework: string) => {
    const colors: Record<string, string> = {
      gdpr: 'bg-purple-100 text-purple-800',
      hipaa: 'bg-blue-100 text-blue-800',
      soc2: 'bg-green-100 text-green-800',
      iso27001: 'bg-orange-100 text-orange-800',
      custom: 'bg-gray-100 text-gray-800'
    }
    return colors[framework] || 'bg-gray-100 text-gray-800'
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      case 'generating':
        return <Badge className="bg-blue-100 text-blue-800">Generating...</Badge>
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>
      default:
        return null
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Compliance Reports</h1>
          <p className="text-gray-600 mt-2">Generate and manage compliance documentation</p>
        </div>
        <Button onClick={() => setShowGenerateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Generate Report
        </Button>
      </div>

      {/* Report Templates */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Report Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {templates.map((template) => (
            <Card 
              key={template.id} 
              className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-purple-300"
              onClick={() => {
                setSelectedTemplate(template.id)
                setShowGenerateDialog(true)
              }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <Shield className="h-8 w-8 text-purple-600" />
                  <Badge className={getFrameworkColor(template.id)}>
                    {template.framework}
                  </Badge>
                </div>
                <CardTitle className="text-base">{template.name}</CardTitle>
                <CardDescription className="text-xs">{template.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-600">{template.sections.length} sections included</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Reports</CardTitle>
            <Button variant="outline" size="sm" onClick={loadReports}>
              <RefreshCw className="h-3 w-3 mr-1" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <FileText className="h-5 w-5 text-gray-600" />
                      <h3 className="font-semibold">{report.name}</h3>
                      <Badge className={getFrameworkColor(report.framework)}>
                        {report.framework.toUpperCase()}
                      </Badge>
                      {getStatusBadge(report.status)}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                      <div>
                        <p className="text-xs text-gray-500">Generated</p>
                        <p className="font-medium">{formatDate(report.generated_at)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Generated By</p>
                        <p className="font-medium">{report.generated_by}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">File Size</p>
                        <p className="font-medium">{report.file_size}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Sections</p>
                        <p className="font-medium">{report.sections_included.length}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {report.sections_included.slice(0, 3).map((section, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {section}
                        </Badge>
                      ))}
                      {report.sections_included.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{report.sections_included.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    {report.status === 'completed' && (
                      <>
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button size="sm">
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                      </>
                    )}
                    {report.status === 'generating' && (
                      <div className="flex items-center space-x-2 text-sm text-blue-600">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Generating...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Scheduled Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-purple-600" />
            Scheduled Reports
          </CardTitle>
          <CardDescription>Automatically generate reports on a schedule</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="font-semibold">Monthly GDPR Report</p>
                  <p className="text-sm text-gray-600">Generates on the 1st of each month</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className="bg-green-100 text-green-800">Active</Badge>
                <Button size="sm" variant="outline">
                  <Mail className="h-3 w-3 mr-1" />
                  Email to: compliance@company.com
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="font-semibold">Quarterly SOC 2 Report</p>
                  <p className="text-sm text-gray-600">Generates every 3 months</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className="bg-green-100 text-green-800">Active</Badge>
                <Button size="sm" variant="outline">
                  <Mail className="h-3 w-3 mr-1" />
                  Email to: audit@company.com
                </Button>
              </div>
            </div>
            <Button variant="outline" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Schedule New Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Generate Report Dialog */}
      {showGenerateDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Generate Compliance Report</CardTitle>
              <CardDescription>Select a template and customize your report</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Select Template</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                >
                  <option value="">Choose a template...</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedTemplate && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">Report Name</label>
                    <Input
                      placeholder="e.g., GDPR Compliance Report - Q4 2024"
                      defaultValue={`${templates.find(t => t.id === selectedTemplate)?.name} - ${new Date().toLocaleDateString()}`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Sections to Include</label>
                    <div className="border rounded-lg p-4 max-h-48 overflow-y-auto">
                      {templates.find(t => t.id === selectedTemplate)?.sections.map((section, idx) => (
                        <div key={idx} className="flex items-center space-x-2 mb-2">
                          <input type="checkbox" defaultChecked className="rounded" />
                          <label className="text-sm">{section}</label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Date Range</label>
                    <div className="grid grid-cols-2 gap-4">
                      <Input type="date" />
                      <Input type="date" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Export Format</label>
                    <div className="flex space-x-4">
                      <label className="flex items-center space-x-2">
                        <input type="radio" name="format" value="pdf" defaultChecked />
                        <span className="text-sm">PDF</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="radio" name="format" value="csv" />
                        <span className="text-sm">CSV</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="radio" name="format" value="json" />
                        <span className="text-sm">JSON</span>
                      </label>
                    </div>
                  </div>
                </>
              )}

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowGenerateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleGenerateReport} disabled={!selectedTemplate || loading}>
                  {loading ? 'Generating...' : 'Generate Report'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

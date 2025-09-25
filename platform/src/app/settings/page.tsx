'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import Navigation from '@/components/Navigation'
import { 
  User, 
  Bell, 
  Shield, 
  CreditCard, 
  Key, 
  Globe, 
  Database, 
  Zap,
  Save,
  Download,
  Upload,
  Trash2,
  Plus,
  Edit3,
  Eye,
  EyeOff,
  Check,
  X,
  AlertTriangle,
  Info,
  Settings,
  Copy,
  Activity,
  BarChart3
} from 'lucide-react'

interface APIKey {
  id: string
  name: string
  provider: string
  key: string
  isActive: boolean
  lastUsed: Date
  usage: number
}

const mockAPIKeys: APIKey[] = [
  {
    id: '1',
    name: 'OpenAI Production',
    provider: 'OpenAI',
    key: 'sk-...abc123',
    isActive: true,
    lastUsed: new Date(Date.now() - 1000 * 60 * 30),
    usage: 85
  },
  {
    id: '2',
    name: 'Anthropic Development',
    provider: 'Anthropic',
    key: 'sk-ant-...def456',
    isActive: true,
    lastUsed: new Date(Date.now() - 1000 * 60 * 60 * 2),
    usage: 45
  },
  {
    id: '3',
    name: 'Google AI Staging',
    provider: 'Google',
    key: 'AIza...ghi789',
    isActive: false,
    lastUsed: new Date(Date.now() - 1000 * 60 * 60 * 24),
    usage: 12
  }
]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')
  const [apiKeys, setApiKeys] = useState<APIKey[]>(mockAPIKeys)
  const [showKeys, setShowKeys] = useState<{ [key: string]: boolean }>({})
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false,
    weeklyReport: true,
    usageAlerts: true,
    securityAlerts: true
  })
  const [security, setSecurity] = useState({
    twoFactor: false,
    sessionTimeout: 30,
    ipWhitelist: false,
    auditLogs: true
  })

  const toggleKeyVisibility = (keyId: string) => {
    setShowKeys(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }))
  }

  const toggleAPIKey = (keyId: string) => {
    setApiKeys(prev => prev.map(key => 
      key.id === keyId ? { ...key, isActive: !key.isActive } : key
    ))
  }

  const deleteAPIKey = (keyId: string) => {
    setApiKeys(prev => prev.filter(key => key.id !== keyId))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPage="settings" />
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600 mt-1">Manage your account and preferences</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
              <Button size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="api-keys">API Keys</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Profile Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Profile Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-xl">JD</span>
                    </div>
                    <div>
                      <Button variant="outline" size="sm">
                        <Upload className="w-4 h-4 mr-2" />
                        Change Avatar
                      </Button>
                      <p className="text-xs text-gray-500 mt-1">JPG, PNG up to 2MB</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" defaultValue="John" />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" defaultValue="Doe" />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue="john.doe@example.com" />
                  </div>
                  
                  <div>
                    <Label htmlFor="company">Company</Label>
                    <Input id="company" defaultValue="TechCorp Inc." />
                  </div>
                  
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Input id="role" defaultValue="CTO" />
                  </div>
                </CardContent>
              </Card>

              {/* Account Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="w-5 h-5 mr-2" />
                    Account Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Account Plan</Label>
                      <p className="text-sm text-gray-500">Current plan and usage</p>
                    </div>
                    <Badge className="bg-gradient-to-r from-purple-600 to-blue-600">Pro</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Usage This Month</Label>
                      <p className="text-sm text-gray-500">1,250 requests used</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">$45.67</p>
                      <p className="text-xs text-gray-500">of $100 limit</p>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Account Status</Label>
                      <p className="text-sm text-gray-500">Account health and status</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-green-600">Active</span>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <Button variant="outline" className="w-full">
                      <Edit3 className="w-4 h-4 mr-2" />
                      Upgrade Plan
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="api-keys" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Key className="w-5 h-5 mr-2" />
                    API Keys Management
                  </CardTitle>
                  <Button size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Key
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {apiKeys.map((apiKey) => (
                    <div key={apiKey.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                              {apiKey.provider.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{apiKey.name}</h3>
                            <p className="text-sm text-gray-500">{apiKey.provider}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={apiKey.isActive}
                            onCheckedChange={() => toggleAPIKey(apiKey.id)}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleKeyVisibility(apiKey.id)}
                          >
                            {showKeys[apiKey.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteAPIKey(apiKey.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label className="text-xs text-gray-500">API Key</Label>
                          <div className="flex items-center space-x-2">
                            <Input
                              value={showKeys[apiKey.id] ? apiKey.key : '••••••••••••••••'}
                              readOnly
                              className="font-mono text-sm"
                            />
                            <Button variant="ghost" size="sm">
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Last Used</Label>
                          <p className="text-sm text-gray-900">
                            {apiKey.lastUsed.toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Usage</Label>
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full"
                                style={{ width: `${apiKey.usage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600">{apiKey.usage}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="w-5 h-5 mr-2" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-gray-500">Receive notifications via email</p>
                    </div>
                    <Switch
                      checked={notifications.email}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, email: checked }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Push Notifications</Label>
                      <p className="text-sm text-gray-500">Receive push notifications in browser</p>
                    </div>
                    <Switch
                      checked={notifications.push}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, push: checked }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>SMS Notifications</Label>
                      <p className="text-sm text-gray-500">Receive critical alerts via SMS</p>
                    </div>
                    <Switch
                      checked={notifications.sms}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, sms: checked }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Weekly Reports</Label>
                      <p className="text-sm text-gray-500">Get weekly usage and performance reports</p>
                    </div>
                    <Switch
                      checked={notifications.weeklyReport}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, weeklyReport: checked }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Usage Alerts</Label>
                      <p className="text-sm text-gray-500">Alert when approaching usage limits</p>
                    </div>
                    <Switch
                      checked={notifications.usageAlerts}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, usageAlerts: checked }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Security Alerts</Label>
                      <p className="text-sm text-gray-500">Immediate alerts for security events</p>
                    </div>
                    <Switch
                      checked={notifications.securityAlerts}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, securityAlerts: checked }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    Security Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Two-Factor Authentication</Label>
                      <p className="text-sm text-gray-500">Add an extra layer of security</p>
                    </div>
                    <Switch
                      checked={security.twoFactor}
                      onCheckedChange={(checked) => setSecurity(prev => ({ ...prev, twoFactor: checked }))}
                    />
                  </div>
                  
                  <div>
                    <Label>Session Timeout</Label>
                    <p className="text-sm text-gray-500 mb-2">Automatically log out after inactivity</p>
                    <select
                      value={security.sessionTimeout}
                      onChange={(e) => setSecurity(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
                      className="w-full border rounded-md px-3 py-2"
                    >
                      <option value={15}>15 minutes</option>
                      <option value={30}>30 minutes</option>
                      <option value={60}>1 hour</option>
                      <option value={120}>2 hours</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>IP Whitelist</Label>
                      <p className="text-sm text-gray-500">Restrict access to specific IP addresses</p>
                    </div>
                    <Switch
                      checked={security.ipWhitelist}
                      onCheckedChange={(checked) => setSecurity(prev => ({ ...prev, ipWhitelist: checked }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Audit Logs</Label>
                      <p className="text-sm text-gray-500">Track all account activity</p>
                    </div>
                    <Switch
                      checked={security.auditLogs}
                      onCheckedChange={(checked) => setSecurity(prev => ({ ...prev, auditLogs: checked }))}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="w-5 h-5 mr-2" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Check className="w-4 h-4 text-green-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Login successful</p>
                        <p className="text-xs text-gray-500">2 minutes ago • 192.168.1.100</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Key className="w-4 h-4 text-blue-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">API key created</p>
                        <p className="text-xs text-gray-500">1 hour ago • 192.168.1.100</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Settings className="w-4 h-4 text-purple-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Settings updated</p>
                        <p className="text-xs text-gray-500">3 hours ago • 192.168.1.100</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="billing" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    Billing Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Current Plan</Label>
                      <p className="text-sm text-gray-500">Pro Plan - $99/month</p>
                    </div>
                    <Badge className="bg-gradient-to-r from-purple-600 to-blue-600">Active</Badge>
                  </div>
                  
                  <div>
                    <Label>Payment Method</Label>
                    <div className="flex items-center space-x-3 mt-2 p-3 border rounded-lg">
                      <CreditCard className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">•••• •••• •••• 4242</p>
                        <p className="text-xs text-gray-500">Expires 12/25</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Edit3 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <Button variant="outline" className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Download Invoice
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2" />
                    Usage & Billing
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>This Month</Label>
                      <p className="text-sm text-gray-500">Requests used</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">1,250</p>
                      <p className="text-sm text-gray-500">of 5,000</p>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full" style={{ width: '25%' }}></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Cost This Month</Label>
                      <p className="text-sm text-gray-500">Current usage cost</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">$45.67</p>
                      <p className="text-sm text-gray-500">of $100 limit</p>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600">
                      <Zap className="w-4 h-4 mr-2" />
                      Upgrade Plan
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

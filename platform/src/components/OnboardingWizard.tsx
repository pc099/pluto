'use client'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle, 
  Copy, 
  Zap, 
  ArrowRight,
  X,
  Rocket,
  Globe,
  Bot,
  Shield,
  Activity,
  Eye,
  Brain,
  AlertTriangle,
  Lock,
  FileCheck,
  BarChart3,
  DollarSign,
  Users,
  Target,
  Layers
} from 'lucide-react'

interface OnboardingWizardProps {
  onComplete: () => void
  onDismiss: () => void
}

export default function OnboardingWizard({ onComplete, onDismiss }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [copied, setCopied] = useState(false)

  const steps = [
    {
      title: 'Welcome to Pluto! 🚀',
      description: 'Get started in 5 minutes',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Pluto is your complete platform for production AI. We help you:
          </p>
          <ul className="space-y-2">
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <span><strong>Monitor</strong> every AI request in real-time</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <span><strong>Control</strong> costs with intelligent routing</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <span><strong>Secure</strong> your AI with PII detection & threat monitoring</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <span><strong>Improve</strong> quality with hallucination detection</span>
            </li>
          </ul>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
            <p className="text-sm text-blue-900">
              <strong>Quick Start:</strong> Follow these 3 simple steps to integrate Pluto into your application.
            </p>
          </div>
        </div>
      )
    },
    {
      title: 'Step 1: Install SDK',
      description: 'Add Pluto to your project',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Choose your language and install the Pluto SDK:
          </p>
          
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Badge variant="secondary">Python</Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText('pip install pluto-ai')
                    setCopied(true)
                    setTimeout(() => setCopied(false), 2000)
                  }}
                >
                  <Copy className="h-4 w-4 mr-1" />
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                <code>pip install pluto-ai</code>
              </pre>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Badge variant="secondary">Node.js</Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText('npm install @pluto-ai/sdk')
                    setCopied(true)
                    setTimeout(() => setCopied(false), 2000)
                  }}
                >
                  <Copy className="h-4 w-4 mr-1" />
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                <code>npm install @pluto-ai/sdk</code>
              </pre>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
            <p className="text-sm text-yellow-900">
              <strong>Note:</strong> The SDK is currently in development. For now, you can use our REST API directly.
            </p>
          </div>
        </div>
      )
    },
    {
      title: 'Step 2: Get Your API Key',
      description: 'Configure authentication',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Your API key is ready to use:
          </p>
          
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Your API Key</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText('pluto_sk_demo_1234567890abcdef')
                  setCopied(true)
                  setTimeout(() => setCopied(false), 2000)
                }}
              >
                <Copy className="h-4 w-4 mr-1" />
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
            <code className="text-sm font-mono bg-white px-3 py-2 rounded border border-gray-300 block">
              pluto_sk_demo_1234567890abcdef
            </code>
          </div>

          <p className="text-gray-700 mt-4">
            Add this to your environment variables:
          </p>

          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
            <code>{`export PLUTO_API_KEY="pluto_sk_demo_1234567890abcdef"`}</code>
          </pre>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
            <p className="text-sm text-blue-900">
              <strong>Security Tip:</strong> Never commit API keys to version control. Use environment variables or secret management tools.
            </p>
          </div>
        </div>
      )
    },
    {
      title: 'Step 3: Make Your First Request',
      description: 'Start monitoring your AI',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Replace your OpenAI/Anthropic calls with Pluto:
          </p>
          
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Badge variant="secondary">Python Example</Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const code = `from pluto import Pluto

client = Pluto(api_key="your-api-key")

response = client.chat.completions.create(
    model="gpt-4",
    messages=[
        {"role": "user", "content": "Hello!"}
    ]
)

print(response.choices[0].message.content)`
                    navigator.clipboard.writeText(code)
                    setCopied(true)
                    setTimeout(() => setCopied(false), 2000)
                  }}
                >
                  <Copy className="h-4 w-4 mr-1" />
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`from pluto import Pluto

client = Pluto(api_key="your-api-key")

response = client.chat.completions.create(
    model="gpt-4",
    messages=[
        {"role": "user", "content": "Hello!"}
    ]
)

print(response.choices[0].message.content)`}</code>
              </pre>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
            <p className="text-sm text-green-900">
              <strong>That&apos;s it!</strong> Your requests will now appear in the <a href="/requests" className="underline font-semibold">Requests</a> page with full observability.
            </p>
          </div>
        </div>
      )
    },
    {
      title: 'AI Gateway Platform',
      description: 'Organizational AI monitoring and control',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 font-medium">
            The AI Gateway provides centralized monitoring and control for all AI usage across your organization.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2 mb-2">
                <Activity className="h-4 w-4 text-blue-600" />
                <h4 className="font-semibold text-sm">Traffic Logs</h4>
              </div>
              <p className="text-xs text-gray-700 mb-2">
                Monitor every AI request in real-time with complete visibility.
              </p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• View all API calls across your organization</li>
                <li>• Detect Shadow AI usage (unauthorized tools)</li>
                <li>• Track user emails, teams, and departments</li>
                <li>• Filter by provider, model, status, and time</li>
                <li>• Export logs for compliance and auditing</li>
              </ul>
            </div>

            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2 mb-2">
                <Globe className="h-4 w-4 text-blue-600" />
                <h4 className="font-semibold text-sm">AI Proxy</h4>
              </div>
              <p className="text-xs text-gray-700 mb-2">
                Single endpoint for all AI providers with intelligent routing.
              </p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Support for 6+ providers (OpenAI, Anthropic, Google, etc.)</li>
                <li>• One API key instead of managing multiple</li>
                <li>• Automatic failover between providers</li>
                <li>• Load balancing and rate limiting</li>
                <li>• Cost optimization across models</li>
              </ul>
            </div>

            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2 mb-2">
                <Eye className="h-4 w-4 text-blue-600" />
                <h4 className="font-semibold text-sm">PII Detection</h4>
              </div>
              <p className="text-xs text-gray-700 mb-2">
                Automatically detect and protect sensitive information.
              </p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• 98.7% detection accuracy</li>
                <li>• Detects SSN, credit cards, emails, phone numbers</li>
                <li>• Automatic redaction and masking</li>
                <li>• GDPR and HIPAA compliance</li>
                <li>• Real-time alerts for PII exposure</li>
              </ul>
            </div>

            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2 mb-2">
                <BarChart3 className="h-4 w-4 text-blue-600" />
                <h4 className="font-semibold text-sm">Cost Analytics</h4>
              </div>
              <p className="text-xs text-gray-700 mb-2">
                Track and optimize AI spending across your organization.
              </p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Real-time cost tracking by team/department</li>
                <li>• Daily, weekly, and monthly spending trends</li>
                <li>• Budget alerts and spending limits</li>
                <li>• Cost optimization recommendations</li>
                <li>• Average 34% cost savings</li>
              </ul>
            </div>
          </div>

          <div className="p-3 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-lg border border-blue-300">
            <h5 className="font-semibold text-blue-900 mb-1 flex items-center text-sm">
              <Target className="h-4 w-4 mr-2" />
              Key Metrics Dashboard
            </h5>
            <p className="text-xs text-gray-700">
              View 12,847 requests, $247.32 daily cost, 127 PII detected, and 2 Shadow AI instances in real-time.
            </p>
          </div>
        </div>
      )
    },
    {
      title: 'AI Agent Platform',
      description: 'Build and monitor autonomous AI agents',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 font-medium">
            Build, deploy, and monitor autonomous AI agents with complete visibility into their reasoning and actions.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2 mb-2">
                <Bot className="h-4 w-4 text-blue-600" />
                <h4 className="font-semibold text-sm">My Agents</h4>
              </div>
              <p className="text-xs text-gray-700 mb-2">
                Create and configure AI agents with custom capabilities.
              </p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Build agents with custom prompts and tools</li>
                <li>• Configure system prompts and temperature</li>
                <li>• Select from multiple AI models</li>
                <li>• Set guardrails and safety constraints</li>
                <li>• Manage 12+ active agents</li>
              </ul>
            </div>

            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2 mb-2">
                <Activity className="h-4 w-4 text-blue-600" />
                <h4 className="font-semibold text-sm">Smart Routing</h4>
              </div>
              <p className="text-xs text-gray-700 mb-2">
                Intelligent model fallbacks for 97.2% success rate.
              </p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Auto-switch between models on failure</li>
                <li>• Quality First, Cost Optimized, or Balanced strategies</li>
                <li>• GPT-4 → Claude 3.5 → GPT-4o fallback chain</li>
                <li>• Automatic retry with exponential backoff</li>
                <li>• Performance monitoring and optimization</li>
              </ul>
            </div>

            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2 mb-2">
                <Brain className="h-4 w-4 text-blue-600" />
                <h4 className="font-semibold text-sm">Execution Logs</h4>
              </div>
              <p className="text-xs text-gray-700 mb-2">
                Complete chain of thought visibility for every execution.
              </p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• See what the agent thought at each step</li>
                <li>• View observations and decisions made</li>
                <li>• Track tool usage and API calls</li>
                <li>• Debug failures with full context</li>
                <li>• Export execution traces</li>
              </ul>
            </div>

            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-blue-600" />
                <h4 className="font-semibold text-sm">Hallucination Detection</h4>
              </div>
              <p className="text-xs text-gray-700 mb-2">
                Verify agent outputs against 6 external sources.
              </p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• 94.3% accuracy in detecting false information</li>
                <li>• Wikipedia, Academic DBs, News APIs verification</li>
                <li>• Government Data and Scientific Journals</li>
                <li>• Financial Data cross-referencing</li>
                <li>• Real-time fact-checking</li>
              </ul>
            </div>
          </div>

          <div className="p-3 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-lg border border-blue-300">
            <h5 className="font-semibold text-blue-900 mb-1 flex items-center text-sm">
              <Layers className="h-4 w-4 mr-2" />
              Agent Metrics
            </h5>
            <p className="text-xs text-gray-700">
              Track 12 active agents, 8,432 executions, 98.7% success rate, and 1.2s average latency.
            </p>
          </div>
        </div>
      )
    },
    {
      title: 'Security & Compliance',
      description: 'Enterprise-grade protection and regulatory compliance',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 font-medium">
            Comprehensive security monitoring and compliance tracking for enterprise AI operations.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-2 mb-2">
                <Lock className="h-4 w-4 text-gray-700" />
                <h4 className="font-semibold text-sm">Security Monitoring</h4>
              </div>
              <p className="text-xs text-gray-700 mb-2">
                Real-time threat detection and security monitoring.
              </p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Detect suspicious API usage patterns</li>
                <li>• Monitor unauthorized access attempts</li>
                <li>• Anomaly detection with ML algorithms</li>
                <li>• Real-time security alerts</li>
                <li>• Incident response workflows</li>
              </ul>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-2 mb-2">
                <FileCheck className="h-4 w-4 text-gray-700" />
                <h4 className="font-semibold text-sm">Compliance Tracking</h4>
              </div>
              <p className="text-xs text-gray-700 mb-2">
                GDPR, HIPAA, SOC 2, and ISO 27001 compliance.
              </p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Automated compliance monitoring</li>
                <li>• Audit reports and violation tracking</li>
                <li>• Data retention and deletion policies</li>
                <li>• Remediation workflows</li>
                <li>• Compliance certification support</li>
              </ul>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="h-4 w-4 text-gray-700" />
                <h4 className="font-semibold text-sm">Policy Management</h4>
              </div>
              <p className="text-xs text-gray-700 mb-2">
                Create and enforce AI governance policies.
              </p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Set spending limits and budget controls</li>
                <li>• Content filtering and safety rules</li>
                <li>• Access control and permissions</li>
                <li>• Rate limiting and throttling</li>
                <li>• Custom policy enforcement</li>
              </ul>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="h-4 w-4 text-gray-700" />
                <h4 className="font-semibold text-sm">Access Management</h4>
              </div>
              <p className="text-xs text-gray-700 mb-2">
                Role-based access control for team collaboration.
              </p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Team and department organization</li>
                <li>• Role-based permissions (Admin, Developer, Viewer)</li>
                <li>• API key management and rotation</li>
                <li>• Audit logs for all actions</li>
                <li>• SSO and SAML integration</li>
              </ul>
            </div>
          </div>

          <div className="p-3 bg-gradient-to-r from-gray-100 to-slate-100 rounded-lg border border-gray-300">
            <h5 className="font-semibold text-gray-900 mb-1 flex items-center text-sm">
              <Shield className="h-4 w-4 mr-2" />
              Enterprise Security
            </h5>
            <p className="text-xs text-gray-700">
              Bank-level encryption, SOC 2 Type II certified, and 99.9% uptime SLA.
            </p>
          </div>
        </div>
      )
    },
    {
      title: 'You\'re All Set! 🎉',
      description: 'Start exploring Pluto',
      content: (
        <div className="space-y-4">
          <div className="text-center py-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <Rocket className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Welcome to Pluto!</h3>
            <p className="text-gray-600 mb-6">
              You&apos;re ready to build production-ready AI applications.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-2 hover:border-blue-300 transition-colors cursor-pointer">
              <CardHeader>
                <CardTitle className="text-base flex items-center">
                  <Globe className="h-4 w-4 mr-2 text-blue-600" />
                  AI Gateway
                </CardTitle>
                <CardDescription>Monitor all organizational AI usage</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-blue-300 transition-colors cursor-pointer">
              <CardHeader>
                <CardTitle className="text-base flex items-center">
                  <Bot className="h-4 w-4 mr-2 text-blue-600" />
                  AI Agents
                </CardTitle>
                <CardDescription>Build autonomous AI agents</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-gray-300 transition-colors cursor-pointer">
              <CardHeader>
                <CardTitle className="text-base flex items-center">
                  <Shield className="h-4 w-4 mr-2 text-gray-700" />
                  Security
                </CardTitle>
                <CardDescription>Monitor threats & compliance</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-green-300 transition-colors cursor-pointer">
              <CardHeader>
                <CardTitle className="text-base flex items-center">
                  <BarChart3 className="h-4 w-4 mr-2 text-green-600" />
                  Analytics
                </CardTitle>
                <CardDescription>Track costs and performance</CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
            <p className="text-sm text-blue-900">
              <strong>Need help?</strong> Check out our <a href="/help" className="underline font-semibold">documentation</a> or reach out to support.
            </p>
          </div>
        </div>
      )
    }
  ]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-4 top-4"
            onClick={onDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center space-x-2 mb-4">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 flex-1 rounded-full transition-colors ${
                  index <= currentStep ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          <CardTitle className="text-2xl">{steps[currentStep].title}</CardTitle>
          <CardDescription className="text-base">{steps[currentStep].description}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {steps[currentStep].content}

          <div className="flex items-center justify-between pt-6 border-t">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              Previous
            </Button>

            <div className="text-sm text-gray-600">
              Step {currentStep + 1} of {steps.length}
            </div>

            <Button onClick={handleNext}>
              {currentStep === steps.length - 1 ? (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Get Started
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

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
  Rocket
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
            <Card className="border-2 hover:border-purple-300 transition-colors cursor-pointer">
              <CardHeader>
                <CardTitle className="text-base">📊 View Analytics</CardTitle>
                <CardDescription>Track costs and usage</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-purple-300 transition-colors cursor-pointer">
              <CardHeader>
                <CardTitle className="text-base">🔍 Request Logs</CardTitle>
                <CardDescription>Debug every API call</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-purple-300 transition-colors cursor-pointer">
              <CardHeader>
                <CardTitle className="text-base">🛡️ Security</CardTitle>
                <CardDescription>Monitor threats & PII</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-purple-300 transition-colors cursor-pointer">
              <CardHeader>
                <CardTitle className="text-base">⚡ AI Gateway</CardTitle>
                <CardDescription>Intelligent routing</CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mt-6">
            <p className="text-sm text-purple-900">
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
                  index <= currentStep ? 'bg-purple-600' : 'bg-gray-200'
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

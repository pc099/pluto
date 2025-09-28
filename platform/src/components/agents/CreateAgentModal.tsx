'use client'
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { 
  Bot, 
  Plus, 
  X, 
  Settings, 
  Zap, 
  MessageSquare, 
  BarChart3, 
  Cog,
  CheckCircle
} from 'lucide-react'

interface CreateAgentModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateAgent: (agentData: AgentFormData) => void
}

interface AgentFormData {
  name: string
  description: string
  type: 'chat' | 'assistant' | 'automation' | 'analysis'
  model: string
  provider: string
  capabilities: string[]
  systemPrompt: string
  temperature: number
  maxTokens: number
}

const agentTypes = [
  { value: 'chat', label: 'Chat Bot', description: 'Interactive conversational agent', icon: MessageSquare },
  { value: 'assistant', label: 'Assistant', description: 'Task-oriented AI assistant', icon: Bot },
  { value: 'automation', label: 'Automation', description: 'Automated workflow agent', icon: Zap },
  { value: 'analysis', label: 'Analysis', description: 'Data analysis and insights', icon: BarChart3 }
]

const models = [
  { provider: 'openai', models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo', 'gpt-3.5-turbo-16k'] },
  { provider: 'anthropic', models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'] },
  { provider: 'google', models: ['gemini-pro', 'gemini-pro-vision'] },
  { provider: 'mistral', models: ['mistral-large', 'mistral-medium', 'mistral-small'] }
]

const availableCapabilities = [
  'natural_language', 'code_generation', 'data_analysis', 'content_creation',
  'email_automation', 'scheduling', 'personalization', 'escalation',
  'ticket_routing', 'seo_optimization', 'brand_voice', 'reporting',
  'visualization', 'translation', 'summarization', 'classification'
]

export default function CreateAgentModal({ isOpen, onClose, onCreateAgent }: CreateAgentModalProps) {
  const [formData, setFormData] = useState<AgentFormData>({
    name: '',
    description: '',
    type: 'chat',
    model: 'gpt-4',
    provider: 'openai',
    capabilities: [],
    systemPrompt: '',
    temperature: 0.7,
    maxTokens: 2000
  })
  const [currentStep, setCurrentStep] = useState(1)
  const [isCreating, setIsCreating] = useState(false)

  const handleInputChange = (field: keyof AgentFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleCapabilityToggle = (capability: string) => {
    setFormData(prev => ({
      ...prev,
      capabilities: prev.capabilities.includes(capability)
        ? prev.capabilities.filter(c => c !== capability)
        : [...prev.capabilities, capability]
    }))
  }

  const handleProviderChange = (provider: string) => {
    const providerModels = models.find(m => m.provider === provider)
    setFormData(prev => ({
      ...prev,
      provider,
      model: providerModels?.models[0] || ''
    }))
  }

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setIsCreating(true)
    try {
      await onCreateAgent(formData)
      onClose()
      // Reset form
      setFormData({
        name: '',
        description: '',
        type: 'chat',
        model: 'gpt-4',
        provider: 'openai',
        capabilities: [],
        systemPrompt: '',
        temperature: 0.7,
        maxTokens: 2000
      })
      setCurrentStep(1)
    } catch (error) {
      console.error('Failed to create agent:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.name.trim() && formData.description.trim()
      case 2:
        return formData.model && formData.provider
      case 3:
        return formData.capabilities.length > 0
      default:
        return false
    }
  }

  const getSelectedType = () => agentTypes.find(t => t.value === formData.type)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Bot className="h-5 w-5 mr-2 text-purple-600" />
            Create New AI Agent
          </DialogTitle>
          <DialogDescription>
            Set up a new AI agent to automate tasks and enhance your workflow
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-center space-x-4 py-4">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step <= currentStep 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {step < currentStep ? <CheckCircle className="h-4 w-4" /> : step}
              </div>
              {step < 3 && (
                <div className={`w-16 h-1 mx-2 ${
                  step < currentStep ? 'bg-purple-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="space-y-6">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="name">Agent Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Customer Support Bot"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what this agent does..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                />
              </div>

              <div>
                <Label>Agent Type</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  {agentTypes.map((type) => {
                    const IconComponent = type.icon
                    return (
                      <Card 
                        key={type.value}
                        className={`cursor-pointer transition-all ${
                          formData.type === type.value 
                            ? 'ring-2 ring-purple-500 bg-purple-50' 
                            : 'hover:shadow-md'
                        }`}
                        onClick={() => handleInputChange('type', type.value)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3">
                            <IconComponent className="h-5 w-5 text-purple-600" />
                            <div>
                              <h4 className="font-medium">{type.label}</h4>
                              <p className="text-sm text-gray-600">{type.description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <Label>AI Provider</Label>
                <Select value={formData.provider} onValueChange={handleProviderChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openai">OpenAI</SelectItem>
                    <SelectItem value="anthropic">Anthropic</SelectItem>
                    <SelectItem value="google">Google</SelectItem>
                    <SelectItem value="mistral">Mistral</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Model</Label>
                <Select value={formData.model} onValueChange={(value) => handleInputChange('model', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {models
                      .find(m => m.provider === formData.provider)
                      ?.models.map((model) => (
                        <SelectItem key={model} value={model}>
                          {model}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="temperature">Temperature</Label>
                  <Input
                    id="temperature"
                    type="number"
                    min="0"
                    max="2"
                    step="0.1"
                    value={formData.temperature}
                    onChange={(e) => handleInputChange('temperature', parseFloat(e.target.value))}
                  />
                  <p className="text-xs text-gray-500 mt-1">Controls randomness (0 = deterministic, 2 = very random)</p>
                </div>

                <div>
                  <Label htmlFor="maxTokens">Max Tokens</Label>
                  <Input
                    id="maxTokens"
                    type="number"
                    min="100"
                    max="8000"
                    value={formData.maxTokens}
                    onChange={(e) => handleInputChange('maxTokens', parseInt(e.target.value))}
                  />
                  <p className="text-xs text-gray-500 mt-1">Maximum response length</p>
                </div>
              </div>

              <div>
                <Label htmlFor="systemPrompt">System Prompt (Optional)</Label>
                <Textarea
                  id="systemPrompt"
                  placeholder="Define the agent's behavior and personality..."
                  value={formData.systemPrompt}
                  onChange={(e) => handleInputChange('systemPrompt', e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <Label>Capabilities</Label>
                <p className="text-sm text-gray-600 mb-4">Select the capabilities this agent should have</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {availableCapabilities.map((capability) => (
                    <Badge
                      key={capability}
                      variant={formData.capabilities.includes(capability) ? "default" : "outline"}
                      className={`cursor-pointer transition-all ${
                        formData.capabilities.includes(capability)
                          ? 'bg-purple-600 hover:bg-purple-700'
                          : 'hover:bg-gray-100'
                      }`}
                      onClick={() => handleCapabilityToggle(capability)}
                    >
                      {capability.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
              </div>

              {formData.capabilities.length > 0 && (
                <div>
                  <Label>Selected Capabilities</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.capabilities.map((capability) => (
                      <Badge key={capability} className="bg-purple-100 text-purple-800">
                        {capability.replace('_', ' ')}
                        <X 
                          className="h-3 w-3 ml-1 cursor-pointer" 
                          onClick={() => handleCapabilityToggle(capability)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between">
          <div className="flex space-x-2">
            {currentStep > 1 && (
              <Button variant="outline" onClick={handlePrevious}>
                Previous
              </Button>
            )}
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            {currentStep < 3 ? (
              <Button onClick={handleNext} disabled={!isStepValid()}>
                Next
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit} 
                disabled={!isStepValid() || isCreating}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {isCreating ? 'Creating...' : 'Create Agent'}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

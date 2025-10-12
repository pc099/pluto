'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Navigation from '@/components/Navigation'
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  Star,
  Zap,
  Brain,
  Code,
  MessageSquare,
  Image,
  FileText,
  Mic,
  Video,
  Settings,
  ChevronDown
} from 'lucide-react'

interface AIModel {
  id: string
  name: string
  provider: string
  description: string
  contextLength: number
  inputCost: number
  outputCost: number
  category: string
  rating: number
  tokensPerWeek: string
  latency: string
  growth: string
}

const mockModels: AIModel[] = [
  {
    id: '1',
    name: 'GPT-4 Turbo',
    provider: 'OpenAI',
    description: 'Most capable GPT-4 model with improved instruction following, JSON mode, reproducible outputs, parallel function calling, and more.',
    contextLength: 128000,
    inputCost: 0.01,
    outputCost: 0.03,
    category: 'flagship',
    rating: 4.9,
    tokensPerWeek: '171.5B',
    latency: '2.4s',
    growth: '+8.82%'
  },
  {
    id: '2',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    description: 'Anthropic\'s most intelligent model, excelling at analysis, math, coding, and creative writing.',
    contextLength: 200000,
    inputCost: 0.003,
    outputCost: 0.015,
    category: 'flagship',
    rating: 4.8,
    tokensPerWeek: '69.1B',
    latency: '5.8s',
    growth: '+21.67%'
  },
  {
    id: '3',
    name: 'Gemini 2.0 Flash',
    provider: 'Google',
    description: 'Google\'s fastest model with strong reasoning capabilities and multimodal understanding.',
    contextLength: 1000000,
    inputCost: 0.00075,
    outputCost: 0.003,
    category: 'flagship',
    rating: 4.7,
    tokensPerWeek: '624.0B',
    latency: '1.8s',
    growth: '+4.04%'
  },
  {
    id: '4',
    name: 'GPT-4o Code',
    provider: 'OpenAI',
    description: 'Specialized for coding tasks with enhanced code generation and debugging capabilities.',
    contextLength: 128000,
    inputCost: 0.005,
    outputCost: 0.015,
    category: 'coding',
    rating: 4.6,
    tokensPerWeek: '45.2B',
    latency: '3.2s',
    growth: '+12.5%'
  },
  {
    id: '5',
    name: 'Claude 3 Haiku',
    provider: 'Anthropic',
    description: 'Fast, lightweight model perfect for simple tasks and high-volume applications.',
    contextLength: 200000,
    inputCost: 0.00025,
    outputCost: 0.00125,
    category: 'reasoning',
    rating: 4.5,
    tokensPerWeek: '89.3B',
    latency: '1.2s',
    growth: '+6.8%'
  }
]

const categories = [
  { id: 'flagship', name: 'Flagship Models', icon: Star },
  { id: 'coding', name: 'Coding Models', icon: Code },
  { id: 'reasoning', name: 'Reasoning Models', icon: Brain },
  { id: 'roleplay', name: 'Roleplay Models', icon: MessageSquare }
]

export default function ModelsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('popularity')

  const filteredModels = mockModels.filter(model => {
    const matchesSearch = model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         model.provider.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || model.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation 
        onAuth={() => {}}
        onLogout={() => {}}
      />
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Models</h1>
              <p className="text-gray-600 mt-1">520 models available</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border p-6 sticky top-8">
              <h3 className="font-semibold text-gray-900 mb-4">Filters</h3>
              
              {/* Search */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Filter models"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Categories</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                      selectedCategory === 'all' 
                        ? 'bg-purple-100 text-purple-700' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    All Models
                  </button>
                  {categories.map((category) => {
                    const Icon = category.icon
                    return (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center space-x-2 ${
                          selectedCategory === category.id 
                            ? 'bg-purple-100 text-purple-700' 
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{category.name}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Input Modalities */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Input Modalities</h4>
                <div className="space-y-2">
                  {[
                    { name: 'Text', icon: FileText },
                    { name: 'Image', icon: Image },
                    { name: 'Audio', icon: Mic },
                    { name: 'Video', icon: Video }
                  ].map((modality) => {
                    const Icon = modality.icon
                    return (
                      <label key={modality.name} className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" />
                        <Icon className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{modality.name}</span>
                      </label>
                    )
                  })}
                </div>
              </div>

              {/* Context Length */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Context Length</h4>
                <div className="space-y-2">
                  <input type="range" min="0" max="1000000" className="w-full" />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>0</span>
                    <span>1M</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Sort and View Controls */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">Sort by:</span>
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border rounded-md px-3 py-1 text-sm"
                >
                  <option value="popularity">Popularity</option>
                  <option value="price">Price</option>
                  <option value="speed">Speed</option>
                  <option value="rating">Rating</option>
                </select>
              </div>
              <div className="text-sm text-gray-600">
                {filteredModels.length} models found
              </div>
            </div>

            {/* Models Grid/List */}
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'space-y-4'}>
              {filteredModels.map((model) => (
                <Card key={model.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {model.provider.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <CardTitle className="text-lg">{model.name}</CardTitle>
                          <p className="text-sm text-gray-500">by {model.provider}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium">{model.rating}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-4">{model.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500">Context Length</p>
                        <p className="font-medium">{model.contextLength.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Latency</p>
                        <p className="font-medium">{model.latency}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex space-x-2">
                        <Badge variant="secondary" className="text-xs">
                          ${model.inputCost}/1K input
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          ${model.outputCost}/1K output
                        </Badge>
                      </div>
                      <Button size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600">
                        Try Model
                      </Button>
                    </div>

                    <div className="mt-3 pt-3 border-t">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{model.tokensPerWeek} tokens/wk</span>
                        <span className="text-green-600">{model.growth} growth</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

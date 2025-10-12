'use client'
import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { aiService, Message, Model } from '@/lib/ai'
import { authService } from '@/lib/auth'

interface ChatMessage extends Message {
  id: string;
  timestamp: Date;
  cost?: number;
  tokens?: number;
  provider?: string;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [availableModels, setAvailableModels] = useState<Model[]>([])
  const [selectedModel, setSelectedModel] = useState('gpt-3.5-turbo')
  const [user, setUser] = useState(authService.getUser())
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadModels()
    loadUser()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadModels = async () => {
    try {
      const models = await aiService.getAvailableModels()
      setAvailableModels(models)
    } catch (err) {
      console.error('Failed to load models:', err)
    }
  }

  const loadUser = async () => {
    try {
      const currentUser = await authService.getCurrentUser()
      setUser(currentUser)
    } catch (err) {
      console.error('Failed to load user:', err)
    }
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)
    setError(null)

    try {
      const response = await aiService.chat({
        messages: [...messages, userMessage].map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
        model: selectedModel,
        temperature: 0.7,
        max_tokens: 1000,
      })

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiService.extractResponseContent(response),
        timestamp: new Date(),
        cost: response.cost,
        tokens: response.usage.total_tokens,
        provider: response.provider,
      }

      setMessages(prev => [...prev, assistantMessage])
      
      // Refresh user data to update quota
      await loadUser()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearChat = () => {
    setMessages([])
    setError(null)
  }

  const formatCost = (cost: number) => {
    return `$${cost.toFixed(6)}`
  }

  const formatTokens = (tokens: number) => {
    return tokens.toLocaleString()
  }

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      {/* Model Selection and Controls */}
      <Card className="mb-4 border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <label className="text-xs font-medium text-gray-600 mb-1">AI Model</label>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger className="w-56 bg-white">
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableModels.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.name} ({model.provider})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {user && (
                <div className="flex flex-col">
                  <label className="text-xs font-medium text-gray-600 mb-1">Usage Quota</label>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="font-semibold">{user.quota_used.toLocaleString()} / {user.quota_limit.toLocaleString()}</span>
                    <Badge variant={user.quota_used / user.quota_limit > 0.8 ? "destructive" : "secondary"} className="text-xs">
                      {((user.quota_used / user.quota_limit) * 100).toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={clearChat} className="hover:bg-white">
              Clear Chat
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Messages */}
      <Card className="flex-1 mb-4 shadow-lg">
        <CardContent className="p-6 h-[500px] overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <div className="mb-4">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-r from-purple-100 to-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </div>
                </div>
                <p className="text-lg font-semibold text-gray-700">Start a conversation</p>
                <p className="text-sm text-gray-500 mt-1">Ask me anything! I&apos;m powered by advanced AI models.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-2xl px-4 py-3 rounded-2xl shadow-sm ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                        : 'bg-white border border-gray-200 text-gray-900'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs opacity-70 flex-wrap">
                      <span>{message.timestamp.toLocaleTimeString()}</span>
                      {message.cost && (
                        <span className="font-medium">{formatCost(message.cost)}</span>
                      )}
                      {message.tokens && (
                        <span>{formatTokens(message.tokens)} tokens</span>
                      )}
                      {message.provider && (
                        <Badge variant="outline" className={`text-xs ${message.role === 'user' ? 'border-white/30 text-white' : ''}`}>
                          {message.provider}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 text-gray-900 px-4 py-3 rounded-2xl shadow-sm">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                      <span className="text-sm">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <Card className="mb-4 border-red-200 bg-red-50">
          <CardContent className="pt-4">
            <p className="text-sm text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Input */}
      <Card className="shadow-lg border-purple-200">
        <CardContent className="pt-4">
          <div className="flex space-x-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message... (Press Enter to send)"
              disabled={isLoading}
              className="flex-1 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
            />
            <Button 
              onClick={sendMessage} 
              disabled={isLoading || !inputMessage.trim()}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-6"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Sending</span>
                </div>
              ) : (
                <span>Send</span>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Navigation from '@/components/Navigation'
import { 
  Send, 
  Plus, 
  Search, 
  Settings, 
  Paperclip, 
  Image, 
  Mic, 
  Video,
  FileText,
  Zap,
  Brain,
  Code,
  MessageSquare,
  ChevronDown,
  MoreVertical,
  Star,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Edit3
} from 'lucide-react'

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
  model?: string
}

interface ChatRoom {
  id: string
  name: string
  lastMessage: string
  timestamp: Date
  model: string
}

const mockChatRooms: ChatRoom[] = [
  {
    id: '1',
    name: 'AI Code Review',
    lastMessage: 'The optimization looks good, but consider using memoization...',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    model: 'GPT-4 Turbo'
  },
  {
    id: '2',
    name: 'Product Strategy',
    lastMessage: 'Based on the market analysis, I recommend focusing on...',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    model: 'Claude 3.5 Sonnet'
  },
  {
    id: '3',
    name: 'Creative Writing',
    lastMessage: 'Here\'s a revised version of the opening paragraph...',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
    model: 'Gemini 2.0 Flash'
  }
]

const mockMessages: Message[] = [
  {
    id: '1',
    content: 'Can you help me optimize this React component for better performance?',
    role: 'user',
    timestamp: new Date(Date.now() - 1000 * 60 * 10),
  },
  {
    id: '2',
    content: 'I\'d be happy to help you optimize your React component! Here are several strategies to improve performance:\n\n1. **Use React.memo()** for components that receive the same props frequently\n2. **Implement useMemo()** for expensive calculations\n3. **Use useCallback()** for event handlers passed to child components\n4. **Consider code splitting** with React.lazy()\n5. **Optimize re-renders** by avoiding object/array creation in render\n\nCould you share the component code so I can provide more specific recommendations?',
    role: 'assistant',
    timestamp: new Date(Date.now() - 1000 * 60 * 9),
    model: 'GPT-4 Turbo'
  },
  {
    id: '3',
    content: 'Here\'s my component:\n\n```jsx\nfunction MyComponent({ data, onUpdate }) {\n  const processedData = data.map(item => ({\n    ...item,\n    processed: true\n  }));\n\n  return (\n    <div>\n      {processedData.map(item => (\n        <ChildComponent \n          key={item.id} \n          data={item} \n          onUpdate={onUpdate}\n        />\n      ))}\n    </div>\n  );\n}\n```',
    role: 'user',
    timestamp: new Date(Date.now() - 1000 * 60 * 8),
  }
]

const modelCategories = [
  { id: 'flagship', name: 'Flagship models', icon: Star },
  { id: 'coding', name: 'Best coding models', icon: Code },
  { id: 'roleplay', name: 'Best roleplay models', icon: MessageSquare },
  { id: 'reasoning', name: 'Reasoning models', icon: Brain }
]

const promptSuggestions = [
  'Educational Advance... higher education.',
  '9.9 vs 9.11 Which one is larger?',
  'Strawberry Test How many r\'s are in the word',
  'Poem Riddle Compose a 12-line poem',
  'Personal Finance Draft up a portfolio m'
]

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>(mockMessages)
  const [inputMessage, setInputMessage] = useState('')
  const [selectedRoom, setSelectedRoom] = useState('1')
  const [selectedModel, setSelectedModel] = useState('GPT-4 Turbo')
  const [webSearch, setWebSearch] = useState(false)

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return

    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      role: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, newMessage])
    setInputMessage('')

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: 'I understand your question. Let me provide a comprehensive response based on the latest information available.',
        role: 'assistant',
        timestamp: new Date(),
        model: selectedModel
      }
      setMessages(prev => [...prev, aiResponse])
    }, 1000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      <Navigation 
        currentPage="chat"
        onAuth={() => {}}
        onLogout={() => {}}
        onProfile={() => {}}
        onSettings={() => {}}
      />
      <div className="flex-1 flex">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r flex flex-col">
          {/* Header */}
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-bold text-gray-900">Chat</h1>
              <Button size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600">
                <Plus className="w-4 h-4 mr-2" />
                New Chat
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search rooms..."
                className="pl-10"
              />
            </div>
          </div>

          {/* Model Categories */}
          <div className="p-4 border-b">
            <h3 className="font-semibold text-gray-900 mb-3">Model Categories</h3>
            <div className="grid grid-cols-2 gap-2">
              {modelCategories.map((category) => {
                const Icon = category.icon
                return (
                  <Card key={category.id} className="p-3 hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-center space-x-2">
                      <Icon className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-900">{category.name}</span>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Chat Rooms */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Recent Chats</h3>
              <div className="space-y-2">
                {mockChatRooms.map((room) => (
                  <div
                    key={room.id}
                    onClick={() => setSelectedRoom(room.id)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedRoom === room.id ? 'bg-purple-50 border border-purple-200' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">{room.name}</h4>
                        <p className="text-sm text-gray-500 truncate mt-1">{room.lastMessage}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="secondary" className="text-xs">
                            {room.model}
                          </Badge>
                          <span className="text-xs text-gray-400">
                            {room.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">G</span>
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">GPT-4 Turbo</h2>
                <p className="text-sm text-gray-500">Online</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex space-x-3 max-w-3xl ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm">
                    {message.role === 'user' ? 'U' : 'AI'}
                  </AvatarFallback>
                </Avatar>
                <div className={`flex-1 ${message.role === 'user' ? 'text-right' : ''}`}>
                  <div className={`inline-block p-4 rounded-lg ${
                    message.role === 'user' 
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' 
                      : 'bg-white border shadow-sm'
                  }`}>
                    <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                    {message.model && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <Badge variant="secondary" className="text-xs">
                          {message.model}
                        </Badge>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="text-xs text-gray-500">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {message.role === 'assistant' && (
                      <div className="flex items-center space-x-1">
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <ThumbsUp className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <ThumbsDown className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Prompt Suggestions */}
        <div className="px-4 py-2">
          <div className="flex space-x-2 overflow-x-auto">
            {promptSuggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="whitespace-nowrap text-xs"
                onClick={() => setInputMessage(suggestion)}
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-white border-t p-4">
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <div className="flex items-end space-x-2">
                <div className="flex-1">
                  <div className="relative">
                    <textarea
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Start a new message..."
                      className="w-full p-4 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      rows={1}
                      style={{ minHeight: '60px', maxHeight: '200px' }}
                    />
                    <div className="absolute bottom-2 left-2 flex items-center space-x-1">
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <Image className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <Paperclip className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim()}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Input Options */}
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={webSearch}
                      onChange={(e) => setWebSearch(e.target.checked)}
                      className="rounded"
                    />
                    <span>Web search</span>
                  </label>
                </div>
                <div className="text-xs text-gray-500">
                  Press Enter to send, Shift+Enter for new line
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}

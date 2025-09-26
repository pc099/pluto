'use client'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import ChatInterface from '@/components/ai/ChatInterface'

export default function ChatPage() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">AI Chat</h1>
          <p className="text-gray-600 mt-2">
            Chat with AI models through our unified interface
          </p>
        </div>
        <ChatInterface />
      </div>
    </ProtectedRoute>
  )
}
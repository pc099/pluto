// AI service for frontend
import { authService } from './auth';

const API_BASE = 'https://pluto-backend-qprv.onrender.com';

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatRequest {
  messages: Message[];
  model?: string;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface ChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  cost: number;
  duration: number;
  provider: string;
}

export interface Model {
  id: string;
  name: string;
  provider: string;
  description: string;
}

export interface UsageStats {
  quota_limit: number;
  quota_used: number;
  quota_remaining: number;
  usage_percentage: number;
}

class AIService {
  async chat(request: ChatRequest): Promise<ChatResponse> {
    if (!authService.isAuthenticated()) {
      throw new Error('Authentication required');
    }

    try {
      const response = await fetch(`${API_BASE}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authService.getAuthHeaders(),
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Chat request failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Chat error:', error);
      throw error;
    }
  }

  async getAvailableModels(): Promise<Model[]> {
    if (!authService.isAuthenticated()) {
      throw new Error('Authentication required');
    }

    try {
      const response = await fetch(`${API_BASE}/ai/models`, {
        headers: {
          ...authService.getAuthHeaders(),
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to get models');
      }

      const data = await response.json();
      return data.models;
    } catch (error) {
      console.error('Get models error:', error);
      throw error;
    }
  }

  async getUsageStats(): Promise<UsageStats> {
    if (!authService.isAuthenticated()) {
      throw new Error('Authentication required');
    }

    try {
      const response = await fetch(`${API_BASE}/ai/usage`, {
        headers: {
          ...authService.getAuthHeaders(),
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to get usage stats');
      }

      return await response.json();
    } catch (error) {
      console.error('Get usage stats error:', error);
      throw error;
    }
  }

  // Helper method to create a simple chat request
  createSimpleRequest(message: string, model: string = 'gpt-3.5-turbo'): ChatRequest {
    return {
      messages: [
        {
          role: 'user',
          content: message,
        },
      ],
      model,
      temperature: 0.7,
      max_tokens: 1000,
    };
  }

  // Helper method to extract response content
  extractResponseContent(response: ChatResponse): string {
    if (response.choices && response.choices.length > 0) {
      return response.choices[0].message.content;
    }
    return '';
  }
}

// Create singleton instance
export const aiService = new AIService();

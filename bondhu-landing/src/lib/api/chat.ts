/**
 * Chat API Client for Bondhu AI
 * Handles communication with the FastAPI backend for chat functionality
 * Uses the authenticated ApiClient to ensure JWT tokens are sent
 */

import { apiClient } from '@/lib/api-client'

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  id?: string;
}

export interface ChatRequest {
  user_id: string;
  message: string;
  session_id?: string; // Optional session ID for conversation continuity
}

export interface ChatResponse {
  response: string;
  has_personality_context: boolean;
  timestamp: string;
  message_id?: string;
  // Crisis detection fields
  crisis_detected?: boolean;
  crisis_severity?: 'low' | 'medium' | 'high' | 'critical';
  crisis_resources?: CrisisResource[];
  intervention_type?: string;
}

export interface CrisisResource {
  name: string;
  phone: string;
  description: string;
  website: string;
  available_24x7: boolean;
}

export interface ChatHistoryItem {
  id: string;
  message: string;
  response: string;
  has_personality_context: boolean;
  created_at: string;
}

export interface ChatHistoryResponse {
  messages: ChatHistoryItem[];
  total: number;
  user_id: string;
}

/**
 * Generate a new session ID for a chat conversation
 */
export function generateSessionId(): string {
  return crypto.randomUUID();
}

/**
 * Chat API service
 */
export const chatApi = {
  /**
   * Send a chat message and get AI response
   */
  sendMessage: async (userId: string, message: string, sessionId?: string): Promise<ChatResponse> => {
    try {
      const data = await apiClient.post<ChatResponse>('/chat/send', {
        user_id: userId,
        message: message,
        session_id: sessionId,
      } as ChatRequest);
      return data;
    } catch (error) {
      console.error('Chat API Error:', error);
      throw error;
    }
  },

  /**
   * Get chat history for a user
   */
  getChatHistory: async (
    userId: string,
    limit: number = 20,
    offset: number = 0,
    bustCache: boolean = false
  ): Promise<ChatHistoryResponse> => {
    try {
      // Add timestamp to bust cache after sending new messages
      const cacheBuster = bustCache ? `&_t=${Date.now()}` : '';
      const data = await apiClient.get<ChatHistoryResponse>(
        `/chat/history/${userId}?limit=${limit}&offset=${offset}${cacheBuster}`
      );
      return data;
    } catch (error) {
      console.error('Chat History API Error:', error);
      throw error;
    }
  },

  /**
   * Clear all chat history for a user
   */
  clearChatHistory: async (userId: string): Promise<void> => {
    try {
      await apiClient.delete(`/chat/history/${userId}`);
    } catch (error) {
      console.error('Clear Chat History API Error:', error);
      throw error;
    }
  },

  /**
   * Search chat history for a user
   */
  searchChatHistory: async (
    userId: string,
    query: string,
    limit: number = 20
  ): Promise<ChatHistoryResponse> => {
    try {
      const data = await apiClient.get<ChatHistoryResponse>(
        `/chat/search/${userId}?q=${encodeURIComponent(query)}&limit=${limit}`
      );
      return data;
    } catch (error) {
      console.error('Search Chat History API Error:', error);
      throw error;
    }
  },

  /**
   * Check chat service health
   */
  healthCheck: async (): Promise<{ status: string; service: string; model: string }> => {
    try {
      const data = await apiClient.get<{ status: string; service: string; model: string }>('/chat/health');
      return data;
    } catch (error) {
      console.error('Chat Health Check Error:', error);
      throw error;
    }
  },

  /**
   * Convert ChatHistoryItem to ChatMessage format
   */
  convertHistoryToMessages: (history: ChatHistoryItem[]): ChatMessage[] => {
    const messages: ChatMessage[] = [];

    history.forEach((item) => {
      // User message
      messages.push({
        role: 'user',
        content: item.message,
        timestamp: new Date(item.created_at),
        id: `${item.id}-user`,
      });

      // Assistant response
      messages.push({
        role: 'assistant',
        content: item.response,
        timestamp: new Date(item.created_at),
        id: `${item.id}-assistant`,
      });
    });

    return messages;
  },
};

/**
 * Error types for better error handling
 */
export class ChatAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'ChatAPIError';
  }
}

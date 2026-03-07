/**
 * API Client for Bondhu AI Backend
 * Handles all HTTP requests to the FastAPI backend with proper error handling
 */

import { createClient } from '@/lib/supabase/client'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

class ApiError extends Error {
  public status: number
  public details?: any

  constructor(message: string, status: number, details?: any) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  /**
   * Get the current user's access token from Supabase session
   */
  private async getAuthToken(): Promise<string | null> {
    try {
      const supabase = createClient()
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        console.warn('[ApiClient] No access token available - user may not be logged in')
      }
      
      return session?.access_token || null
    } catch (error) {
      console.error('[ApiClient] Failed to get auth token:', error)
      return null
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}/api/v1${endpoint}`

    // Get auth token
    const token = await this.getAuthToken()

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new ApiError(
          errorData.detail || `HTTP error! status: ${response.status}`,
          response.status,
          errorData
        )
      }

      return await response.json()
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }

      // Network or other errors
      throw new ApiError(
        'Network error occurred. Please check your connection.',
        0,
        error
      )
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.request('/health', { method: 'GET' })
  }

  // Video endpoints
  async getVideoRecommendations(userId: string, maxResults = 20): Promise<any> {
    return this.get(`/video/recommendations/${userId}?max_results=${maxResults}`)
  }

  async getTrendingVideos(userId: string, regionCode = 'US', maxResults = 25): Promise<any> {
    return this.get(`/video/trending/${userId}?region_code=${regionCode}&max_results=${maxResults}`)
  }

  async submitVideoFeedback(feedbackData: {
    user_id: string
    video_id: string
    feedback_type: 'like' | 'dislike' | 'watch' | 'skip' | 'share'
    additional_data?: any
  }): Promise<any> {
    return this.post('/video/feedback', feedbackData)
  }

  // Chat endpoints
  async sendChatMessage(messageData: {
    user_id: string
    message: string
    history?: Array<{ role: string; content: string }>
  }): Promise<any> {
    return this.post('/chat/message', messageData)
  }

  // Personality endpoints
  async getPersonalityAnalysis(userId: string): Promise<any> {
    return this.get(`/personality/analysis/${userId}`)
  }

  async updatePersonalityScores(userId: string, scores: Record<string, number>): Promise<any> {
    return this.post(`/personality/update/${userId}`, { personality_scores: scores })
  }
}

// Create and export singleton instance
export const apiClient = new ApiClient()

// Export the ApiError class for error handling
export { ApiError }

// Default export
export default apiClient
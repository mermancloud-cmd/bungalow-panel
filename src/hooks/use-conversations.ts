import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { mockConversations, mockMessages } from '@/lib/mock-data'

// Re-export types for components that import from this hook
export type { ConversationState, Conversation } from '@/lib/types'
export type { MessageRole } from '@/lib/types'

interface Conversation {
  id: string
  guest_name: string | null
  guest_phone: string
  state: 'active' | 'closed' | 'pending'
  assigned_agent: string | null
  ai_enabled: boolean
  message_count: number
  last_message_at: string
  language: string
  created_at: string
  updated_at: string
}

interface Message {
  id: string
  conversation_id: string
  sender: 'guest' | 'agent' | 'ai'
  content: string
  created_at: string
  metadata?: unknown
}

interface ConversationDetail {
  conversation: Conversation & { language: string }
  messages: Message[]
}

export function useConversations(search?: string) {
  return useQuery<{ conversations: Conversation[]; total: number }, Error>({
    queryKey: ['conversations', search],
    queryFn: async () => {
      try {
        const params = search ? `?search=${encodeURIComponent(search)}` : ''
        const response = await fetch(`/api/conversations${params}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch conversations')
        }
        
        return await response.json()
      } catch (error) {
        console.warn('API failed, falling back to mock data:', error)
        return { conversations: mockConversations, total: mockConversations.length }
      }
    },
    staleTime: 10 * 1000, // 10 seconds
  })
}

export function useConversation(id: string) {
  return useQuery<ConversationDetail, Error>({
    queryKey: ['conversation', id],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/conversations/${id}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch conversation')
        }
        
        return await response.json()
      } catch (error) {
        console.warn('API failed, falling back to mock data:', error)
        return {
          conversation: { ...mockConversations[0], id },
          messages: mockMessages.filter(m => m.conversation_id === id),
        }
      }
    },
    enabled: !!id,
    staleTime: 5 * 1000, // 5 seconds
  })
}

export function useHandoff() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ 
      conversationId, 
      action 
    }: { 
      conversationId: string
      action: 'takeover' | 'return_to_ai' 
    }) => {
      const response = await fetch(`/api/conversations/${conversationId}/handoff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update handoff')
      }

      return await response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      queryClient.invalidateQueries({ queryKey: ['conversation'] })
    },
  })
}

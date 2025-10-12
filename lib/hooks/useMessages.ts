'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  created_at: string
  read: boolean
}

interface Conversation {
  id: string
  post_id: string
  created_at: string
  updated_at: string
  posts: {
    id: string
    title: string
    type: 'seeking' | 'offering'
    status: string
    images: string[] | null
  }
  sender: {
    id: string
    full_name: string | null
    avatar_url: string | null
  }
  receiver: {
    id: string
    full_name: string | null
    avatar_url: string | null
  }
  last_message?: {
    content: string
    created_at: string
    sender_id: string
  }
  unread_count?: number
}

interface ConversationWithMessages extends Conversation {
  messages: Message[]
}

// Fetch all user conversations (grouped from messages)
export function useConversations(userId: string | null | undefined) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['conversations', userId],
    queryFn: async () => {
      if (!userId) return []

      // Fetch sent messages
      const { data: sentMessages } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          read,
          sender_id,
          receiver_id,
          post_id,
          receiver:receiver_id (
            id,
            full_name,
            avatar_url
          ),
          posts (
            id,
            title
          )
        `)
        .eq('sender_id', userId)
        .order('created_at', { ascending: false })

      // Fetch received messages
      const { data: receivedMessages } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          read,
          sender_id,
          receiver_id,
          post_id,
          sender:sender_id (
            id,
            full_name,
            avatar_url
          ),
          posts (
            id,
            title
          )
        `)
        .eq('receiver_id', userId)
        .order('created_at', { ascending: false })

      // Group conversations by other user
      const conversationsMap = new Map<string, any>()

      // Process sent messages
      sentMessages?.forEach((msg: any) => {
        const otherUserId = msg.receiver_id
        if (!conversationsMap.has(otherUserId)) {
          conversationsMap.set(otherUserId, {
            id: otherUserId,
            other_user: msg.receiver,
            last_message: {
              content: msg.content,
              created_at: msg.created_at,
              sender_id: msg.sender_id,
            },
            unread_count: 0,
            post: msg.posts,
          })
        }
      })

      // Process received messages
      receivedMessages?.forEach((msg: any) => {
        const otherUserId = msg.sender_id
        const existing = conversationsMap.get(otherUserId)

        if (!existing || new Date(msg.created_at) > new Date(existing.last_message.created_at)) {
          conversationsMap.set(otherUserId, {
            id: otherUserId,
            other_user: msg.sender,
            last_message: {
              content: msg.content,
              created_at: msg.created_at,
              sender_id: msg.sender_id,
            },
            unread_count: !msg.read ? (existing?.unread_count || 0) + 1 : (existing?.unread_count || 0),
            post: msg.posts,
          })
        } else if (!msg.read) {
          if (existing) existing.unread_count++
        }
      })

      const conversations = Array.from(conversationsMap.values())
        .sort((a, b) => new Date(b.last_message.created_at).getTime() - new Date(a.last_message.created_at).getTime())

      return conversations as Conversation[]
    },
    enabled: !!userId,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute to check for new messages
  })
}

// Fetch single conversation with messages (by other user ID)
export function useConversation(otherUserId: string | null, currentUserId: string | null) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['conversation', otherUserId, currentUserId],
    queryFn: async () => {
      if (!otherUserId || !currentUserId) throw new Error('User IDs are required')

      // Fetch all messages between these two users
      const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          sender_id,
          receiver_id,
          read,
          post_id,
          sender:sender_id (
            id,
            full_name,
            avatar_url
          )
        `)
        .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${currentUserId})`)
        .order('created_at', { ascending: true })

      if (messagesError) throw messagesError

      // Fetch other user profile
      const { data: otherUserProfile } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .eq('id', otherUserId)
        .single()

      return {
        id: otherUserId,
        other_user: otherUserProfile,
        messages: messages || [],
      }
    },
    enabled: !!otherUserId && !!currentUserId,
    staleTime: 10 * 1000, // 10 seconds
    refetchInterval: 5 * 1000, // Refetch every 5 seconds for real-time feel
  })
}

// Count unread messages
export function useUnreadCount(userId: string | null | undefined) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['messages', 'unread', userId],
    queryFn: async () => {
      if (!userId) return 0

      // Simply count all unread messages where user is receiver
      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', userId)
        .eq('read', false)

      if (error) throw error

      return count || 0
    },
    enabled: !!userId,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  })
}

// Send message mutation (direct to messages table)
export function useSendMessage() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({
      receiverId,
      senderId,
      content,
      postId,
    }: {
      receiverId: string
      senderId: string
      content: string
      postId?: string
    }) => {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          receiver_id: receiverId,
          sender_id: senderId,
          content,
          post_id: postId || null,
          read: false,
        })
        .select()
        .single()

      if (error) throw error

      return data
    },
    onSuccess: (_, variables) => {
      // Invalidate conversation to refetch messages
      queryClient.invalidateQueries({ queryKey: ['conversation'] })
      queryClient.invalidateQueries({ queryKey: ['conversations', variables.senderId] })
      queryClient.invalidateQueries({ queryKey: ['messages', 'unread'] })
    },
  })
}

// Mark messages as read mutation (by other user ID)
export function useMarkAsRead() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({
      otherUserId,
      currentUserId,
    }: {
      otherUserId: string
      currentUserId: string
    }) => {
      // Mark all messages from otherUserId to currentUserId as read
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('sender_id', otherUserId)
        .eq('receiver_id', currentUserId)
        .eq('read', false)

      if (error) throw error
    },
    onSuccess: (_, variables) => {
      // Invalidate unread count and conversation
      queryClient.invalidateQueries({ queryKey: ['messages', 'unread', variables.currentUserId] })
      queryClient.invalidateQueries({ queryKey: ['conversation', variables.otherUserId, variables.currentUserId] })
      queryClient.invalidateQueries({ queryKey: ['conversations', variables.currentUserId] })
    },
  })
}

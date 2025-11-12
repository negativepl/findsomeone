'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

interface TypingState {
  user_id: string
  is_typing: boolean
  conversation_id: string
}

export function useTypingIndicator(conversationId: string, otherUserId: string) {
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false)
  const supabase = createClient()
  const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  // Listen to other user typing
  useEffect(() => {
    const channel = supabase.channel(`typing:${conversationId}`)

    channel
      .on('broadcast', { event: 'typing' }, (payload) => {
        const data = payload.payload as TypingState
        if (data.user_id === otherUserId) {
          setIsOtherUserTyping(data.is_typing)

          // Auto-hide typing indicator after 3 seconds
          if (data.is_typing) {
            if (typingTimeoutRef.current) {
              clearTimeout(typingTimeoutRef.current)
            }
            typingTimeoutRef.current = setTimeout(() => {
              setIsOtherUserTyping(false)
            }, 3000)
          }
        }
      })
      .subscribe()

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      supabase.removeChannel(channel)
    }
  }, [conversationId, otherUserId, supabase])

  // Send typing status
  const sendTypingStatus = useCallback(async (isTyping: boolean) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const channel = supabase.channel(`typing:${conversationId}`)

    await channel.send({
      type: 'broadcast',
      event: 'typing',
      payload: {
        user_id: user.id,
        is_typing: isTyping,
        conversation_id: conversationId
      } as TypingState
    })
  }, [conversationId, supabase])

  return {
    isOtherUserTyping,
    sendTypingStatus
  }
}

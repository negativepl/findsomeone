'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MessageCircle } from 'lucide-react'
import Link from 'next/link'
import { User } from '@supabase/supabase-js'
import { useUnreadCount } from '@/lib/hooks/useMessages'
import { useQueryClient } from '@tanstack/react-query'

interface MessagesIconProps {
  user: User | null
}

export function MessagesIcon({ user }: MessagesIconProps) {
  const { data: unreadCount = 0 } = useUnreadCount(user?.id)
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!user) return

    const supabase = createClient()

    // Subscribe to real-time changes for instant updates
    const channel = supabase
      .channel('unread-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`,
        },
        () => {
          // New message received - invalidate to refetch count
          queryClient.invalidateQueries({ queryKey: ['messages', 'unread', user.id] })
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`,
        },
        (payload) => {
          // Message marked as read - invalidate to refetch count
          const updatedMsg = payload.new as any
          if (updatedMsg.read && updatedMsg.receiver_id === user.id) {
            queryClient.invalidateQueries({ queryKey: ['messages', 'unread', user.id] })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.id, queryClient])

  if (!user) {
    return null
  }

  return (
    <Link
      href="/dashboard/messages"
      className="relative inline-flex items-center justify-center h-10 w-10 rounded-full bg-[#C44E35] hover:bg-[#B33D2A] transition-colors"
      aria-label={`Wiadomości${unreadCount > 0 ? ` (${unreadCount} nieprzeczytanych)` : ''}`}
    >
      <MessageCircle className="h-5 w-5 text-white" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-white text-[#C44E35] text-xs font-bold rounded-full border-2 border-[#C44E35]">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Link>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MessageCircle } from 'lucide-react'
import Link from 'next/link'
import { User } from '@supabase/supabase-js'

interface MessagesIconProps {
  user: User | null
}

export function MessagesIcon({ user }: MessagesIconProps) {
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!user) return

    const supabase = createClient()

    // Fetch initial count
    const fetchUnreadCount = async () => {
      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', user.id)
        .eq('read', false)

      setUnreadCount(count || 0)
    }

    fetchUnreadCount()

    // Subscribe to real-time changes
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
          // New message received, increment count
          setUnreadCount((prev) => prev + 1)
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
        async (payload) => {
          // Message marked as read - refetch count to be sure
          const updatedMsg = payload.new as any
          if (updatedMsg.read && updatedMsg.receiver_id === user.id) {
            // Refetch the actual count to ensure accuracy
            const { count } = await supabase
              .from('messages')
              .select('*', { count: 'exact', head: true })
              .eq('receiver_id', user.id)
              .eq('read', false)

            setUnreadCount(count || 0)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.id])

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

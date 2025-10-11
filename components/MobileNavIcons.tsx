'use client'

import { useState, useEffect } from 'react'
import { Search, Heart, MessageCircle } from 'lucide-react'
import { User } from '@supabase/supabase-js'
import { MobileSearchBar } from '@/components/MobileSearchBar'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface MobileNavIconsProps {
  user: User | null
}

export function MobileNavIcons({ user }: MobileNavIconsProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
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
      .channel('mobile-unread-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`,
        },
        () => {
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
          const updatedMsg = payload.new as any
          if (updatedMsg.read && updatedMsg.receiver_id === user.id) {
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

  return (
    <>
      <div className="md:hidden flex items-center gap-2.5">
        {/* Search Icon */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="inline-flex items-center justify-center h-[34px] w-[34px] rounded-full bg-[#C44E35] hover:bg-[#B33D2A] transition-colors"
          aria-label="Wyszukaj"
        >
          <Search className="h-4 w-4 text-white" />
        </button>

        {/* Show Messages and Favorites icons only when user is logged in */}
        {user && (
          <>
            {/* Favorites Icon */}
            <Link
              href="/dashboard/favorites"
              className="inline-flex items-center justify-center h-[34px] w-[34px] rounded-full bg-[#C44E35] hover:bg-[#B33D2A] transition-colors"
              aria-label="Ulubione"
            >
              <Heart className="h-4 w-4 text-white" />
            </Link>

            {/* Messages Icon */}
            <Link
              href="/dashboard/messages"
              className="relative inline-flex items-center justify-center h-[34px] w-[34px] rounded-full bg-[#C44E35] hover:bg-[#B33D2A] transition-colors"
              aria-label={`Wiadomości${unreadCount > 0 ? ` (${unreadCount} nieprzeczytanych)` : ''}`}
            >
              <MessageCircle className="h-4 w-4 text-white" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-white text-[#C44E35] text-[10px] font-bold rounded-full border border-[#C44E35]">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Link>
          </>
        )}
      </div>

      {/* Mobile Search Bar */}
      <MobileSearchBar isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  )
}

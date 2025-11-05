'use client'

import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { MobileSearchBar } from '@/components/MobileSearchBar'
import { AIAssistant } from '@/components/AIAssistant'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useFavoritesCount } from '@/lib/hooks/useFavorites'

interface MobileNavIconsProps {
  user: User | null
}

export function MobileNavIcons({ user }: MobileNavIconsProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [isHydrated, setIsHydrated] = useState(false)

  // Use the same hook as desktop for favorites count
  const { data: favoritesCount = 0 } = useFavoritesCount(user?.id)

  useEffect(() => {
    // Load cached unread count after hydration
    if (user && typeof window !== 'undefined') {
      const cachedUnread = localStorage.getItem(`unread_count_${user.id}`)
      if (cachedUnread) {
        setUnreadCount(parseInt(cachedUnread, 10))
      }

      setIsHydrated(true)
    }
  }, [user])

  // Close search bar when AI chat opens
  useEffect(() => {
    const handleAIChatOpened = () => {
      setIsSearchOpen(false)
    }

    window.addEventListener('ai-chat-opened', handleAIChatOpened)
    return () => window.removeEventListener('ai-chat-opened', handleAIChatOpened)
  }, [])

  useEffect(() => {
    if (!user || !isHydrated) return

    const supabase = createClient()

    // Fetch initial unread count
    const fetchUnreadCount = async () => {
      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', user.id)
        .eq('read', false)

      const newCount = count || 0
      setUnreadCount(newCount)
      localStorage.setItem(`unread_count_${user.id}`, newCount.toString())
    }

    fetchUnreadCount()

    // Subscribe to real-time changes for messages
    const messagesChannel = supabase
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
          fetchUnreadCount()
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
            fetchUnreadCount()
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(messagesChannel)
    }
  }, [user?.id, isHydrated])

  return (
    <>
      <div className="md:hidden flex items-center gap-2.5">
        {/* AI Assistant - Only show when user is logged in on mobile */}
        {user && <AIAssistant />}

        {/* Search Icon */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="inline-flex items-center justify-center h-[34px] w-[34px] rounded-full bg-brand hover:bg-brand/90 transition-colors"
        >
          <span className="sr-only">Wyszukaj</span>
          <img src="/icons/search.svg" alt="" className="h-4 w-4" />
        </button>

        {/* Show Messages and Favorites icons only when user is logged in */}
        {user && (
          <>
            {/* Favorites Icon */}
            <Link
              href="/dashboard/favorites"
              className="relative inline-flex items-center justify-center h-[34px] w-[34px] rounded-full bg-brand hover:bg-brand/90 transition-colors"
            >
              <span className="sr-only">Ulubione{favoritesCount > 0 ? ` (${favoritesCount})` : ''}</span>
              <img src="/icons/heart.svg" alt="" className="h-4 w-4" />
              {favoritesCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-background text-brand text-[10px] font-bold rounded-full border border-brand">
                  {favoritesCount > 99 ? '99+' : favoritesCount}
                </span>
              )}
            </Link>

            {/* Messages Icon */}
            <Link
              href="/dashboard/messages"
              className="relative inline-flex items-center justify-center h-[34px] w-[34px] rounded-full bg-brand hover:bg-brand/90 transition-colors"
            >
              <span className="sr-only">Wiadomości{unreadCount > 0 ? ` (${unreadCount} nieprzeczytanych)` : ''}</span>
              <img src="/icons/messages.svg" alt="" className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-background text-brand text-[10px] font-bold rounded-full border border-brand">
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

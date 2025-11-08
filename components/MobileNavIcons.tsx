'use client'

import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { MobileSearchBar } from '@/components/MobileSearchBar'
import { AIAssistant } from '@/components/AIAssistant'
import { NotificationsIcon } from '@/components/NotificationsIcon'
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
        {/* Search Icon */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="inline-flex items-center justify-center h-[34px] w-[34px] rounded-full bg-brand hover:bg-brand/90 transition-colors text-brand-foreground"
        >
          <span className="sr-only">Wyszukaj</span>
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>

        {/* AI Assistant - Only show when user is logged in on mobile */}
        {user && <AIAssistant />}

        {/* Show Messages and Favorites icons only when user is logged in */}
        {user && (
          <>
            {/* Favorites Icon */}
            <Link
              href="/dashboard/favorites"
              className="relative inline-flex items-center justify-center h-[34px] w-[34px] rounded-full bg-brand hover:bg-brand/90 transition-colors text-brand-foreground"
            >
              <span className="sr-only">Ulubione{favoritesCount > 0 ? ` (${favoritesCount})` : ''}</span>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {favoritesCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-background text-brand text-[10px] font-bold rounded-full border border-brand">
                  {favoritesCount > 99 ? '99+' : favoritesCount}
                </span>
              )}
            </Link>

            {/* Messages Icon */}
            <Link
              href="/dashboard/messages"
              className="relative inline-flex items-center justify-center h-[34px] w-[34px] rounded-full bg-brand hover:bg-brand/90 transition-colors text-brand-foreground"
            >
              <span className="sr-only">Wiadomości{unreadCount > 0 ? ` (${unreadCount} nieprzeczytanych)` : ''}</span>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-background text-brand text-[10px] font-bold rounded-full border border-brand">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Link>

            {/* Notifications Icon */}
            <NotificationsIcon user={user} />
          </>
        )}
      </div>

      {/* Mobile Search Bar */}
      <MobileSearchBar isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  )
}

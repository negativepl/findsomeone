'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function usePresence(userId?: string) {
  const [isOnline, setIsOnline] = useState(false)
  const [lastSeen, setLastSeen] = useState<Date | null>(null)

  useEffect(() => {
    if (!userId) return

    const supabase = createClient()

    // Fetch initial presence
    const fetchPresence = async () => {
      const { data } = await supabase
        .from('user_presence')
        .select('status, last_seen')
        .eq('user_id', userId)
        .single()

      if (data) {
        setIsOnline(data.status === 'online')
        setLastSeen(data.last_seen ? new Date(data.last_seen) : null)
      }
    }

    fetchPresence()

    // Subscribe to presence changes
    const channel = supabase
      .channel(`presence:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_presence',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.new && typeof payload.new === 'object' && 'status' in payload.new) {
            setIsOnline(payload.new.status === 'online')
            setLastSeen(payload.new.last_seen ? new Date(payload.new.last_seen as string) : null)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  return { isOnline, lastSeen }
}

export function useUpdatePresence() {
  useEffect(() => {
    const supabase = createClient()

    const updatePresence = async (status: 'online' | 'offline' | 'away') => {
      await supabase.rpc('update_user_presence', {
        user_status: status
      })
    }

    // Set online when component mounts
    updatePresence('online')

    // Update presence every 4 minutes (before 5 minute timeout)
    const interval = setInterval(() => {
      updatePresence('online')
    }, 4 * 60 * 1000)

    // Handle page visibility
    const handleVisibilityChange = () => {
      if (document.hidden) {
        updatePresence('away')
      } else {
        updatePresence('online')
      }
    }

    // Set offline when page is closed
    const handleBeforeUnload = () => {
      updatePresence('offline')
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      updatePresence('offline')
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [])
}

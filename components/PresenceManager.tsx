'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface PresenceManagerProps {
  userId?: string
}

export function PresenceManager({ userId }: PresenceManagerProps) {
  useEffect(() => {
    // Only run if user is logged in
    if (!userId) return

    const supabase = createClient()

    const updatePresence = async (status: 'online' | 'offline' | 'away') => {
      try {
        await supabase.rpc('update_user_presence', {
          user_status: status
        })
      } catch (error) {
        console.error('Error updating presence:', error)
      }
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
      // Use sendBeacon for more reliable offline status on page close
      const blob = new Blob(
        [JSON.stringify({ user_status: 'offline' })],
        { type: 'application/json' }
      )
      navigator.sendBeacon(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/update_user_presence`, blob)

      // Fallback to regular update
      updatePresence('offline')
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('pagehide', handleBeforeUnload)

    return () => {
      updatePresence('offline')
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('pagehide', handleBeforeUnload)
    }
  }, [userId])

  return null
}

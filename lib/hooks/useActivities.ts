'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

interface Activity {
  id: string
  activity_type: string
  created_at: string
  read_at: string | null
  metadata: {
    post_title?: string
    sender_name?: string
  }
}

// Fetch unread activities count
export function useUnreadActivitiesCount(userId: string | null | undefined) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['activities', 'unread', userId],
    queryFn: async () => {
      if (!userId) return 0

      const { count, error } = await supabase
        .from('activity_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .is('read_at', null)

      if (error) throw error

      return count || 0
    },
    enabled: !!userId,
    staleTime: 1000 * 60, // 1 minute
    gcTime: 1000 * 60 * 5, // 5 minutes (renamed from cacheTime in v5)
  })
}

// Fetch all activities (both read and unread)
export function useActivities(userId: string | null | undefined) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['activities', userId],
    queryFn: async () => {
      if (!userId) return []

      const { data, error } = await supabase
        .from('activity_logs')
        .select('id, activity_type, created_at, metadata, read_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error

      return (data || []) as Activity[]
    },
    enabled: !!userId,
    staleTime: 1000 * 30, // 30 seconds
    gcTime: 1000 * 60 * 5, // 5 minutes
  })
}

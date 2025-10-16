'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface ViewCounterProps {
  postId: string
  userId?: string
  postAuthorId: string
}

export function ViewCounter({ postId, userId, postAuthorId }: ViewCounterProps) {
  useEffect(() => {
    const incrementViews = async () => {
      // Don't increment views for the post author viewing their own post
      if (userId === postAuthorId) {
        return
      }

      // Check if this post was already viewed in this session/browser
      const viewedPostsKey = 'viewed_posts'
      const viewedPosts = JSON.parse(localStorage.getItem(viewedPostsKey) || '{}')

      // Check if we already counted a view for this post
      // We store timestamp to allow counting again after 24 hours
      const lastViewTime = viewedPosts[postId]
      const now = Date.now()
      const twentyFourHours = 24 * 60 * 60 * 1000

      if (lastViewTime && (now - lastViewTime) < twentyFourHours) {
        // Already viewed within last 24 hours, don't count again
        return
      }

      const supabase = createClient()

      // Call the RPC function to increment views
      const { error } = await supabase.rpc('increment_post_views', {
        post_id: postId
      })

      if (!error) {
        // Store the view timestamp in localStorage
        viewedPosts[postId] = now
        localStorage.setItem(viewedPostsKey, JSON.stringify(viewedPosts))
      }
    }

    incrementViews()
  }, [postId, userId, postAuthorId])

  return null
}

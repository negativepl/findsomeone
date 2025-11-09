'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { formatDistanceToNow } from 'date-fns'
import { pl } from 'date-fns/locale'
import { Eye, MessageCircle, Heart, Star } from 'lucide-react'

interface NotificationsIconProps {
  user: User
}

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

export function NotificationsIcon({ user }: NotificationsIconProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activities, setActivities] = useState<Activity[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [swipedId, setSwipedId] = useState<string | null>(null)
  const [swipeDistance, setSwipeDistance] = useState(0)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [shouldAnimate, setShouldAnimate] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef<number>(0)
  const touchStartY = useRef<number>(0)
  const mouseStartX = useRef<number>(0)
  const isDragging = useRef<boolean>(false)
  const isHorizontalSwipe = useRef<boolean>(false)
  const prevCountRef = useRef<number>(0)
  const deleteQueueRef = useRef<Set<string>>(new Set())
  const deleteTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    fetchActivities()

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    // Set up real-time subscription for activity_logs
    const supabase = createClient()
    const channel = supabase
      .channel(`activity-logs:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activity_logs',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newActivity = payload.new as Activity
          setActivities(prev => [newActivity, ...prev])
          setUnreadCount(prev => prev + 1)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'activity_logs',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const updatedActivity = payload.new as Activity
          setActivities(prev =>
            prev.map(act => act.id === updatedActivity.id ? updatedActivity : act)
          )
          if (updatedActivity.read_at) {
            setUnreadCount(prev => Math.max(0, prev - 1))
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'activity_logs',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const deletedActivity = payload.old as Activity
          setActivities(prev => prev.filter(act => act.id !== deletedActivity.id))
          if (!deletedActivity.read_at) {
            setUnreadCount(prev => Math.max(0, prev - 1))
          }
        }
      )
      .subscribe()

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      supabase.removeChannel(channel)
      // Flush any pending deletes on unmount
      if (deleteTimerRef.current) {
        clearTimeout(deleteTimerRef.current)
      }
      flushDeleteQueue()
    }
  }, [user.id])

  // Track count changes for animation
  useEffect(() => {
    if (prevCountRef.current > 0 && activities.length !== prevCountRef.current) {
      setShouldAnimate(true)
      setTimeout(() => setShouldAnimate(false), 300)
    }
    prevCountRef.current = activities.length
  }, [activities.length])

  const fetchActivities = async () => {
    const supabase = createClient()

    // Fetch unread count
    const { count } = await supabase
      .from('activity_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .is('read_at', null)

    setUnreadCount(count || 0)

    // Fetch all activities (both read and unread)
    const { data } = await supabase
      .from('activity_logs')
      .select('id, activity_type, created_at, metadata, read_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    setActivities(data || [])
  }

  const markAllAsRead = async () => {
    const supabase = createClient()
    const now = new Date().toISOString()

    // Mark all unread notifications as read
    await supabase
      .from('activity_logs')
      .update({ read_at: now })
      .eq('user_id', user.id)
      .is('read_at', null)

    // Update local state - mark all activities as read
    setActivities(activities.map(activity => ({
      ...activity,
      read_at: activity.read_at || now
    })))

    // Update unread count to 0
    setUnreadCount(0)
  }

  const handleOpenDropdown = async () => {
    setIsOpen(!isOpen)

    // Mark as read when opening
    if (!isOpen && unreadCount > 0) {
      await markAllAsRead()
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'post_viewed':
        return <Eye className="w-4 h-4 text-brand" />
      case 'message_received':
        return <MessageCircle className="w-4 h-4 text-brand" />
      case 'favorite_added':
        return <Heart className="w-4 h-4 text-brand" />
      case 'review_received':
        return <Star className="w-4 h-4 text-brand" />
      default:
        return null
    }
  }

  const getActivityText = (activity: Activity) => {
    switch (activity.activity_type) {
      case 'post_viewed':
        return `Ktoś wyświetlił "${activity.metadata?.post_title}"`
      case 'message_received':
        return `Nowa wiadomość od ${activity.metadata?.sender_name || 'użytkownika'}`
      case 'favorite_added':
        return `Ktoś dodał do ulubionych: "${activity.metadata?.post_title}"`
      case 'review_received':
        return 'Otrzymałeś nową opinię'
      default:
        return 'Nowa aktywność'
    }
  }

  const handleTouchStart = (e: React.TouchEvent, id: string) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
    isHorizontalSwipe.current = false
    setSwipedId(id)
    setSwipeDistance(0)
  }

  const handleTouchMove = (e: React.TouchEvent, id: string) => {
    if (swipedId !== id) return
    const currentX = e.touches[0].clientX
    const currentY = e.touches[0].clientY
    const diffX = touchStartX.current - currentX
    const diffY = Math.abs(touchStartY.current - currentY)

    // Determine if this is a horizontal swipe (only on first significant movement)
    if (!isHorizontalSwipe.current && (Math.abs(diffX) > 5 || diffY > 5)) {
      isHorizontalSwipe.current = Math.abs(diffX) > diffY
    }

    // Only handle horizontal swipes
    if (isHorizontalSwipe.current) {
      // Update swipe distance
      const newDistance = Math.max(0, Math.min(diffX, 80))
      setSwipeDistance(newDistance)

      // Prevent scroll when actively swiping horizontally
      e.preventDefault()
    }
  }

  const handleTouchEnd = async (id: string) => {
    // If swiped left more than 60px, delete
    if (isHorizontalSwipe.current && swipeDistance >= 60) {
      await deleteNotification(id)
    } else {
      // Reset state if not deleting
      setSwipedId(null)
      setSwipeDistance(0)
      touchStartX.current = 0
      touchStartY.current = 0
      isHorizontalSwipe.current = false
    }
  }

  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    mouseStartX.current = e.clientX
    isDragging.current = true
    setSwipedId(id)
    setSwipeDistance(0)
  }

  const handleMouseMove = (e: React.MouseEvent, id: string) => {
    if (!isDragging.current || swipedId !== id) return
    const currentX = e.clientX
    const diff = mouseStartX.current - currentX

    // Update swipe distance (allow both directions but clamp to 0-80)
    const newDistance = Math.max(0, Math.min(diff, 80))
    setSwipeDistance(newDistance)
  }

  const handleMouseUp = async (id: string) => {
    if (!isDragging.current) return
    isDragging.current = false

    // If swiped left more than 60px, delete
    if (swipeDistance >= 60) {
      await deleteNotification(id)
    } else {
      // Reset state if not deleting
      setSwipedId(null)
      setSwipeDistance(0)
      mouseStartX.current = 0
    }
  }

  const handleMouseLeave = () => {
    if (isDragging.current) {
      isDragging.current = false
      setSwipedId(null)
      setSwipeDistance(0)
      mouseStartX.current = 0
    }
  }

  const flushDeleteQueue = async () => {
    if (deleteQueueRef.current.size === 0) return

    const idsToDelete = Array.from(deleteQueueRef.current)
    deleteQueueRef.current.clear()

    const supabase = createClient()
    const { error } = await supabase
      .from('activity_logs')
      .delete()
      .in('id', idsToDelete)

    if (error) {
      console.error('Error batch deleting notifications:', error)
    }
  }

  const deleteNotification = async (id: string) => {
    // Start delete animation
    setDeletingId(id)
    setSwipedId(null)
    setSwipeDistance(0)
    touchStartX.current = 0

    // Update unread count if needed (optimistic)
    const deletedActivity = activities.find(a => a.id === id)
    if (deletedActivity && !deletedActivity.read_at) {
      setUnreadCount(prev => Math.max(0, prev - 1))
    }

    // Add to delete queue for batching
    deleteQueueRef.current.add(id)

    // Clear existing timer
    if (deleteTimerRef.current) {
      clearTimeout(deleteTimerRef.current)
    }

    // Set new timer to flush queue after 500ms of inactivity
    deleteTimerRef.current = setTimeout(() => {
      flushDeleteQueue()
    }, 500)

    // Wait for animation to complete, then remove from state
    setTimeout(() => {
      setActivities(prev => prev.filter(activity => activity.id !== id))
      setDeletingId(null)
    }, 300)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleOpenDropdown}
        className="relative inline-flex items-center justify-center h-[34px] w-[34px] md:h-10 md:w-10 rounded-full bg-brand hover:bg-brand/90 transition-colors text-brand-foreground"
        aria-label={`Powiadomienia${unreadCount > 0 ? ` (${unreadCount})` : ''}`}
      >
        <svg className="h-4 w-4 md:h-5 md:w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 25 24">
          <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
            <path d="M12.5 2.75v2m5.46 8.92 1.79 3.58H5.25l1.79-3.58c.14-.28.21-.58.21-.89V10a5.25 5.25 0 1 1 10.5 0v2.78c0 .31.07.62.21.89m-3.21 3.58V19c0 1.24-1.01 2.25-2.25 2.25s-2.25-1.01-2.25-2.25v-1.75"/>
          </g>
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] md:min-w-[20px] md:h-5 px-1 md:px-1.5 bg-background text-brand text-[10px] md:text-xs font-bold rounded-full border border-brand">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-2xl shadow-lg z-50">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              Powiadomienia
              <span
                className="inline-block"
                style={{
                  animation: shouldAnimate ? 'scale 0.3s ease-out' : 'none'
                }}
              >
                ({deletingId && activities.length === 1 ? 0 : activities.length})
              </span>
            </h3>
          </div>

          <div className="max-h-96 overflow-y-auto scrollbar-hide">
            {activities.length === 0 || (activities.length === 1 && deletingId !== null) ? (
              <div className="p-8 text-center text-muted-foreground text-sm">
                Brak powiadomień
              </div>
            ) : (
              <div>
                {activities.map((activity) => {
                  const isThisItemSwiped = swipedId === activity.id
                  const currentSwipeDistance = isThisItemSwiped ? swipeDistance : 0
                  const isDeleting = deletingId === activity.id

                  return (
                    <div
                      key={activity.id}
                      className="relative overflow-hidden border-b border-border last:border-b-0"
                      style={{
                        height: isDeleting ? '0px' : 'auto',
                        opacity: isDeleting ? 0 : 1,
                        transition: 'height 0.3s ease-out, opacity 0.3s ease-out'
                      }}
                    >
                      {/* Background delete area - fixed position */}
                      <div
                        className="absolute right-0 top-0 bottom-0 bg-red-500 overflow-hidden pointer-events-none"
                        style={{
                          width: `${currentSwipeDistance}px`,
                          transition: isThisItemSwiped ? 'none' : 'width 0.3s ease-out'
                        }}
                      >
                        <div
                          className="absolute inset-0 flex items-center justify-center transition-transform duration-200"
                          style={{
                            transform: `scale(${Math.max(0, Math.min((currentSwipeDistance - 20) / 30, 1))})`,
                            opacity: currentSwipeDistance > 20 ? 1 : 0
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 25 24">
                            <g stroke="#ffffff" strokeWidth="1.5">
                              <path strokeLinecap="round" strokeMiterlimit="10" d="M4.25 4.75h16.5m-8.25-2v2m1.74 12.52v-4.5m-3.49 4.48v-4.5"/>
                              <path strokeMiterlimit="10" d="M5.87 8.75h13.3"/>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 21.25H9.09c-1.02 0-1.88-.77-1.99-1.78L5.5 4.75h14l-1.6 14.72a2.003 2.003 0 0 1-1.99 1.78"/>
                            </g>
                          </svg>
                        </div>
                      </div>

                      {/* Main content - swipeable */}
                      <div
                        className="relative p-4 hover:bg-muted/50 cursor-pointer bg-card select-none"
                        style={{
                          transform: `translateX(-${currentSwipeDistance}px)`,
                          transition: isThisItemSwiped ? 'none' : 'transform 0.3s ease-out',
                          touchAction: 'pan-y'
                        }}
                        onTouchStart={(e) => handleTouchStart(e, activity.id)}
                        onTouchMove={(e) => handleTouchMove(e, activity.id)}
                        onTouchEnd={() => handleTouchEnd(activity.id)}
                        onMouseDown={(e) => handleMouseDown(e, activity.id)}
                        onMouseMove={(e) => handleMouseMove(e, activity.id)}
                        onMouseUp={() => handleMouseUp(activity.id)}
                        onMouseLeave={handleMouseLeave}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            {getIcon(activity.activity_type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-foreground line-clamp-2">
                              {getActivityText(activity)}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDistanceToNow(new Date(activity.created_at), {
                                addSuffix: true,
                                locale: pl,
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="p-3 border-t border-border">
            <Link
              href="/dashboard"
              className="block text-center py-2.5 text-sm font-semibold text-brand hover:bg-brand/5 rounded-lg transition-all"
              onClick={() => setIsOpen(false)}
            >
              Zobacz wszystkie
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

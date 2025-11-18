'use client'

import { useState, useRef, useEffect } from 'react'
import { Eye, MessageCircle, Heart, Star, Activity, Filter, Calendar } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { pl } from 'date-fns/locale'
import { createClient } from '@/lib/supabase/client'
import { useQueryClient } from '@tanstack/react-query'

interface ActivityItem {
  id: string
  type: 'post_viewed' | 'message_received' | 'favorite_added' | 'review_received' | 'booking_request'
  title: string
  timestamp: Date
  metadata?: {
    post_title?: string
    sender_name?: string
    client_name?: string
    scheduled_date?: string
    scheduled_time?: string
    post_id?: string
    sender_id?: string
  }
}

interface ActivityFeedProps {
  activities: ActivityItem[]
  showFilters?: boolean
  itemsPerPage?: number
}

export function ActivityFeed({ activities, showFilters = false, itemsPerPage = 10 }: ActivityFeedProps) {
  const queryClient = useQueryClient()
  const [selectedType, setSelectedType] = useState<string>('all')
  const [showAll, setShowAll] = useState(false)
  const [showLeftGradient, setShowLeftGradient] = useState(false)
  const [showRightGradient, setShowRightGradient] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Swipe to delete states
  const [swipedId, setSwipedId] = useState<string | null>(null)
  const [swipeDistance, setSwipeDistance] = useState(0)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set())
  const touchStartX = useRef<number>(0)
  const touchStartY = useRef<number>(0)
  const mouseStartX = useRef<number>(0)
  const isDragging = useRef<boolean>(false)
  const isHorizontalSwipe = useRef<boolean>(false)
  const wasDragging = useRef<boolean>(false)
  const deleteQueueRef = useRef<Set<string>>(new Set())
  const deleteTimerRef = useRef<NodeJS.Timeout | null>(null)
  const touchElementsRef = useRef<Map<string, HTMLElement>>(new Map())

  const checkScroll = () => {
    const element = scrollRef.current
    if (!element) return

    const hasScroll = element.scrollWidth > element.clientWidth
    const isAtStart = element.scrollLeft <= 5
    const isAtEnd = element.scrollLeft + element.clientWidth >= element.scrollWidth - 5

    setShowLeftGradient(hasScroll && !isAtStart)
    setShowRightGradient(hasScroll && !isAtEnd)
  }

  useEffect(() => {
    checkScroll()
    window.addEventListener('resize', checkScroll)
    return () => window.removeEventListener('resize', checkScroll)
  }, [])

  useEffect(() => {
    return () => {
      // Flush any pending deletes on unmount
      if (deleteTimerRef.current) {
        clearTimeout(deleteTimerRef.current)
      }
      flushDeleteQueue()
    }
  }, [])

  const setupTouchListeners = (element: HTMLElement, id: string) => {
    const onTouchStart = (e: TouchEvent) => handleTouchStart(e, id)
    const onTouchMove = (e: TouchEvent) => handleTouchMove(e, id)
    const onTouchEnd = () => handleTouchEnd(id)

    element.addEventListener('touchstart', onTouchStart, { passive: true })
    element.addEventListener('touchmove', onTouchMove, { passive: false })
    element.addEventListener('touchend', onTouchEnd, { passive: true })

    return () => {
      element.removeEventListener('touchstart', onTouchStart)
      element.removeEventListener('touchmove', onTouchMove)
      element.removeEventListener('touchend', onTouchEnd)
    }
  }

  const handleTouchStart = (e: TouchEvent, id: string) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
    isHorizontalSwipe.current = false
    setSwipedId(id)
    setSwipeDistance(0)
  }

  const handleTouchMove = (e: TouchEvent, id: string) => {
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
    e.preventDefault() // Prevent text selection
    e.stopPropagation() // Prevent link activation
    mouseStartX.current = e.clientX
    isDragging.current = true
    wasDragging.current = false
    setSwipedId(id)
    setSwipeDistance(0)
  }

  const handleMouseMove = (e: React.MouseEvent, id: string) => {
    if (!isDragging.current || swipedId !== id) return
    const currentX = e.clientX
    const diff = mouseStartX.current - currentX

    // Mark as dragging if moved more than 2px
    if (Math.abs(diff) > 2) {
      wasDragging.current = true
      e.preventDefault() // Prevent text selection while dragging
      e.stopPropagation() // Prevent link activation
    }

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

  const handleLinkClick = (activity: ActivityItem) => {
    if (wasDragging.current) {
      wasDragging.current = false
      return
    }
    // Navigate programmatically
    const link = getActivityLink(activity)
    if (link !== '#') {
      window.location.href = link
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
    // Optimistically remove from UI immediately
    setDeletedIds(prev => new Set([...prev, id]))

    // Start delete animation
    setDeletingId(id)
    setSwipedId(null)
    setSwipeDistance(0)
    touchStartX.current = 0

    // Wait for animation to complete
    await new Promise(resolve => setTimeout(resolve, 300))

    // Delete from database
    const supabase = createClient()
    const { error } = await supabase
      .from('activity_logs')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting notification:', error)
      // If delete failed, remove from deletedIds
      setDeletedIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
      setDeletingId(null)
      return
    }

    // Invalidate queries after successful delete
    setDeletingId(null)
    queryClient.invalidateQueries({ queryKey: ['activities'] })
  }

  const getIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'post_viewed':
        return <Eye className="w-4 h-4 text-brand" />
      case 'message_received':
        return <MessageCircle className="w-4 h-4 text-brand" />
      case 'favorite_added':
        return <Heart className="w-4 h-4 text-brand" />
      case 'review_received':
        return <Star className="w-4 h-4 text-brand" />
      case 'booking_request':
        return <Calendar className="w-4 h-4 text-brand" />
    }
  }

  const getActivityText = (activity: ActivityItem) => {
    switch (activity.type) {
      case 'post_viewed':
        return `Ktoś wyświetlił "${activity.metadata?.post_title}"`
      case 'message_received':
        return `Nowa wiadomość od ${activity.metadata?.sender_name || 'użytkownika'}`
      case 'favorite_added':
        return `Ktoś dodał do ulubionych: "${activity.metadata?.post_title}"`
      case 'review_received':
        return 'Otrzymałeś nową opinię'
      case 'booking_request':
        return `${activity.metadata?.client_name || 'Ktoś'} chce zarezerwować termin: ${activity.metadata?.scheduled_date || ''} o ${activity.metadata?.scheduled_time || ''}`
      default:
        return activity.title
    }
  }

  const getFilterLabel = (type: string) => {
    switch (type) {
      case 'all':
        return 'Wszystkie'
      case 'message_received':
        return 'Wiadomości'
      case 'favorite_added':
        return 'Polubienia'
      case 'review_received':
        return 'Opinie'
      case 'booking_request':
        return 'Rezerwacje'
      default:
        return type
    }
  }

  const getActivityLink = (activity: ActivityItem): string => {
    switch (activity.type) {
      case 'post_viewed':
        return activity.metadata?.post_id ? `/posts/${activity.metadata.post_id}` : '#'
      case 'message_received':
        return activity.metadata?.sender_id ? `/dashboard/messages?conversation=${activity.metadata.sender_id}` : '/dashboard/messages'
      case 'favorite_added':
        return activity.metadata?.post_id ? `/posts/${activity.metadata.post_id}` : '#'
      case 'review_received':
        return '/dashboard/reviews'
      case 'booking_request':
        return '/dashboard/bookings'
      default:
        return '#'
    }
  }

  // Filter activities and exclude deleted ones
  const filteredActivities = (selectedType === 'all'
    ? activities
    : activities.filter(a => a.type === selectedType)
  ).filter(a => !deletedIds.has(a.id))

  // Paginate activities
  const displayedActivities = showAll
    ? filteredActivities
    : filteredActivities.slice(0, itemsPerPage)

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
        <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
          <Activity className="w-6 h-6 text-muted-foreground/50" />
        </div>
        <p className="text-sm">Brak ostatniej aktywności</p>
      </div>
    )
  }

  const filterTypes = ['all', 'message_received', 'favorite_added', 'review_received', 'booking_request']

  return (
    <div className="space-y-4">
      {/* Filters */}
      {showFilters && (
        <div className="space-y-2">
          {/* Filter label */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Filtry:</span>
          </div>

          {/* Filter buttons with gradient */}
          <div className="relative -mx-5">
            <div
              ref={scrollRef}
              onScroll={checkScroll}
              className="flex gap-2 overflow-x-auto scrollbar-hide px-5"
            >
              {filterTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-3 py-1.5 text-sm rounded-full transition-all whitespace-nowrap flex-shrink-0 ${
                    selectedType === type
                      ? 'bg-brand text-brand-foreground font-medium'
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {getFilterLabel(type)}
                </button>
              ))}
            </div>
            {/* Gradient overlays */}
            <div className={`absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-card via-card/60 to-transparent pointer-events-none transition-opacity duration-300 ${
              showLeftGradient ? 'opacity-100' : 'opacity-0'
            }`} />
            <div className={`absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-card via-card/60 to-transparent pointer-events-none transition-opacity duration-300 ${
              showRightGradient ? 'opacity-100' : 'opacity-0'
            }`} />
          </div>
        </div>
      )}

      {/* Activities list */}
      {filteredActivities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
            <Activity className="w-6 h-6 text-muted-foreground/50" />
          </div>
          <p className="text-sm">Brak aktywności dla wybranego filtra</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayedActivities.map((activity) => {
            const isThisItemSwiped = swipedId === activity.id
            const currentSwipeDistance = isThisItemSwiped ? swipeDistance : 0
            const isDeleting = deletingId === activity.id

            return (
              <div
                key={activity.id}
                className="relative overflow-hidden rounded-xl"
                style={{
                  height: isDeleting ? '0px' : 'auto',
                  opacity: isDeleting ? 0 : 1,
                  transition: 'height 0.3s ease-out, opacity 0.3s ease-out'
                }}
              >
                {/* Background delete area - fixed position */}
                <div
                  className="absolute right-0 top-0 bottom-0 bg-red-500 overflow-hidden pointer-events-none rounded-xl"
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
                  ref={(el) => {
                    if (el) {
                      touchElementsRef.current.set(activity.id, el)
                      // Setup touch listeners with passive: false
                      const cleanup = setupTouchListeners(el, activity.id)
                      ;(el as any)._touchCleanup = cleanup
                    } else {
                      // Cleanup when element is removed
                      const element = touchElementsRef.current.get(activity.id)
                      if (element && (element as any)._touchCleanup) {
                        (element as any)._touchCleanup()
                      }
                      touchElementsRef.current.delete(activity.id)
                    }
                  }}
                  className="relative bg-card select-none"
                  style={{
                    transform: `translateX(-${currentSwipeDistance}px)`,
                    transition: isThisItemSwiped ? 'none' : 'transform 0.3s ease-out',
                    touchAction: 'pan-y'
                  }}
                  onMouseDown={(e) => handleMouseDown(e, activity.id)}
                  onMouseMove={(e) => handleMouseMove(e, activity.id)}
                  onMouseUp={() => handleMouseUp(activity.id)}
                  onMouseLeave={handleMouseLeave}
                >
                  <div
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => handleLinkClick(activity)}
                  >
                    <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      {getIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground line-clamp-1">
                        {getActivityText(activity)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatDistanceToNow(new Date(activity.timestamp), {
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

      {/* Show more button */}
      {filteredActivities.length > itemsPerPage && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="w-full py-2.5 text-sm font-semibold text-brand hover:bg-brand/5 rounded-lg transition-all"
        >
          Pokaż więcej ({filteredActivities.length - itemsPerPage})
        </button>
      )}

      {showAll && filteredActivities.length > itemsPerPage && (
        <button
          onClick={() => setShowAll(false)}
          className="w-full py-2.5 text-sm font-semibold text-brand hover:bg-brand/5 rounded-lg transition-all"
        >
          Pokaż mniej
        </button>
      )}
    </div>
  )
}

'use client'

import { useState, useRef, useEffect } from 'react'
import { Eye, MessageCircle, Heart, Star, Activity, Filter } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { pl } from 'date-fns/locale'

interface ActivityItem {
  id: string
  type: 'post_viewed' | 'message_received' | 'favorite_added' | 'review_received'
  title: string
  timestamp: Date
  metadata?: {
    post_title?: string
    sender_name?: string
  }
}

interface ActivityFeedProps {
  activities: ActivityItem[]
  showFilters?: boolean
  itemsPerPage?: number
}

export function ActivityFeed({ activities, showFilters = false, itemsPerPage = 10 }: ActivityFeedProps) {
  const [selectedType, setSelectedType] = useState<string>('all')
  const [showAll, setShowAll] = useState(false)
  const [showLeftGradient, setShowLeftGradient] = useState(false)
  const [showRightGradient, setShowRightGradient] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

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
      default:
        return type
    }
  }

  // Filter activities
  const filteredActivities = selectedType === 'all'
    ? activities
    : activities.filter(a => a.type === selectedType)

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

  const filterTypes = ['all', 'message_received', 'favorite_added', 'review_received']

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
          {displayedActivities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/30 transition-colors"
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
          ))}
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

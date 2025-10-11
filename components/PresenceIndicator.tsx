'use client'

import { usePresence } from '@/lib/hooks/usePresence'

interface PresenceIndicatorProps {
  userId: string
  showText?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function PresenceIndicator({ userId, showText = false, size = 'md' }: PresenceIndicatorProps) {
  const { isOnline, lastSeen } = usePresence(userId)

  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  }

  const getLastSeenText = () => {
    if (!lastSeen) return 'Nieaktywny'

    const now = new Date()
    const diffMs = now.getTime() - lastSeen.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Aktywny przed chwilą'
    if (diffMins < 60) return `Aktywny ${diffMins} min temu`
    if (diffHours < 24) return `Aktywny ${diffHours}h temu`
    if (diffDays === 1) return 'Aktywny wczoraj'
    if (diffDays < 7) return `Aktywny ${diffDays} dni temu`
    return 'Nieaktywny'
  }

  if (showText) {
    return (
      <div className="flex items-center gap-2">
        <span className={`${sizeClasses[size]} rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
        <span className="text-sm text-black/60">
          {isOnline ? 'Online' : getLastSeenText()}
        </span>
      </div>
    )
  }

  return (
    <span
      className={`${sizeClasses[size]} rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}
      title={isOnline ? 'Online' : getLastSeenText()}
    />
  )
}
